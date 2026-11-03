import test,{beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {SqliteMarketingRepository} from '../src/lib/marketing/sqlite.ts';
import {marketingStorageConfig} from '../src/lib/marketing/storage-config.ts';
import {MarketingSubscriberService} from '../src/lib/marketing/service.ts';
import {handleSubscribe} from '../src/lib/marketing/http.ts';
import {unsubscribeToken} from '../src/lib/marketing/tokens.ts';
import {CONSENT_VERSION,consentText} from '../src/data/marketing.ts';
import {requireMigratedLocalContacts} from '../scripts/lib/marketing-neon-local.mjs';

let dir,file,repository;
const secret='sqlite-test-secret-only-12345678901234567890';
const body=(overrides={})=>({source:'shop_waitlist',locale:'en',consentVersion:CONSENT_VERSION,email:'Fan@Example.Invalid',phone:'+14155552671',emailConsent:true,smsConsent:false,website:'',...overrides});
const service=(provider=null)=>new MarketingSubscriberService(repository,{secret,siteUrl:'https://ceo19.ma',provider});
const query=(sql,...args)=>{const db=new DatabaseSync(file);try{return db.prepare(sql).all(...args)}finally{db.close()}};
const exec=sql=>{const db=new DatabaseSync(file);try{db.exec(sql)}finally{db.close()}};
const count=(table='marketing_contacts')=>query(`SELECT count(*) AS n FROM ${table}`)[0].n;
beforeEach(async()=>{dir=await fs.mkdtemp(path.join(os.tmpdir(),'ceo19-sqlite-test-'));file=path.join(dir,'waitlist.sqlite');repository=new SqliteMarketingRepository(file);assert.equal(await repository.available(),true)});
afterEach(async()=>fs.rm(dir,{recursive:true,force:true}));

test('SQLite durably stores only consented channels, exact wording, timestamps and private files',async()=>{
 const result=await service().subscribe(body(),'one');assert.equal(result.stored,true);assert.equal(result.emailConfirmation,'pending');
 const [row]=query('SELECT * FROM marketing_contacts');assert.equal(row.email,'fan@example.invalid');assert.equal(row.phone_e164,null);assert.equal(row.email_consent,1);assert.equal(row.sms_consent,0);assert.equal(row.confirmation_delivery,'unconfigured');assert.equal(row.status,'pending');assert(row.email_consent_at);assert.equal(count('marketing_email_audience'),0);
 const [event]=query('SELECT * FROM marketing_consent_events');assert.equal(event.consent_text,consentText.en.email);assert.equal(event.consent_text_version,CONSENT_VERSION);assert.equal(event.source,'shop_waitlist');
 assert.equal((await fs.stat(dir)).mode&0o077,0);assert.equal((await fs.stat(file)).mode&0o077,0);
 repository=new SqliteMarketingRepository(file);assert.equal(await repository.available(),true);assert.equal(count(),1);
});
test('SQLite SMS-only and both channels never infer or merge identities',async()=>{
 await service().subscribe(body({emailConsent:false,smsConsent:true,email:'invalid'}),'sms');assert.equal(count(),1);assert.equal(query('SELECT email FROM marketing_contacts')[0].email,null);assert.equal(count('marketing_sms_audience'),0);
 await service().subscribe(body({smsConsent:true,locale:'fr'}),'both');assert.equal(count(),2);assert.equal(count('marketing_consent_events'),3);assert(query('SELECT consent_text FROM marketing_consent_events WHERE locale=?','fr').every(row=>Object.values(consentText.fr).includes(row.consent_text)));
});
test('SQLite invalid inputs and no consent never write or report success',async()=>{
 for(const overrides of [{emailConsent:false},{emailConsent:'true'},{email:'bad'},{smsConsent:true,phone:'+123'},{smsConsent:true,country:'constructor'}])await assert.rejects(service().subscribe(body(overrides),'invalid'));
 assert.equal(count(),0);assert.equal(count('marketing_consent_events'),0);
});
test('SQLite duplicates and quotas persist across repository instances',async()=>{
 for(let i=0;i<3;i++){repository=new SqliteMarketingRepository(file);await service().subscribe(body(),`client-${i}`)}
 assert.equal(count(),1);assert.equal(count('marketing_consent_events'),3);
 await assert.rejects(service().subscribe(body(),'fourth'),error=>error.code==='rate_limited'&&error.status===429&&error.retryAfter>0);
 assert.equal(count('marketing_consent_events'),3);
});
test('SQLite independent processes serialize writes and deduplicate the same address',async()=>{
 const repoUrl=new URL('../src/lib/marketing/sqlite.ts',import.meta.url).href,serviceUrl=new URL('../src/lib/marketing/service.ts',import.meta.url).href;
 const script=`import {SqliteMarketingRepository} from ${JSON.stringify(repoUrl)};import {MarketingSubscriberService} from ${JSON.stringify(serviceUrl)};const repository=new SqliteMarketingRepository(process.argv[1]);const service=new MarketingSubscriberService(repository,{secret:${JSON.stringify(secret)},siteUrl:'https://ceo19.ma',provider:null});await service.subscribe(${JSON.stringify(body())},process.argv[2]);`;
 await Promise.all([0,1].map(i=>promisify(execFile)(process.execPath,['--input-type=module','-e',script,file,`parallel-${i}`])));
 assert.equal(count(),1);assert.equal(count('marketing_consent_events'),2);
});
test('SQLite two-channel requests roll back contacts, evidence and quotas on a write failure',async()=>{
 exec("CREATE TRIGGER fail_second BEFORE INSERT ON marketing_consent_events WHEN NEW.channel='sms' BEGIN SELECT RAISE(ABORT,'test failure'); END;");
 await assert.rejects(service().subscribe(body({smsConsent:true}),'atomic'),error=>error.code==='storage_error');
 assert.equal(count(),0);assert.equal(count('marketing_consent_events'),0);assert.equal(count('marketing_rate_limits'),0);
});
test('SQLite confirms once, suppresses one channel, and requires fresh opt-in after withdrawal',async()=>{
 let confirmation;const provider={name:'test',async sendEmailConfirmation(input){confirmation=new URL(input.confirmUrl).searchParams.get('token')}};
 await service(provider).subscribe(body({smsConsent:true}),'first');assert.equal(query("SELECT confirmation_delivery FROM marketing_contacts WHERE channel='email'")[0].confirmation_delivery,'accepted');
 const oldToken=confirmation;assert.equal(await service().confirm(oldToken),true);assert.equal(await service().confirm(oldToken),false);assert.equal(count('marketing_email_audience'),1);
 const email=query("SELECT id FROM marketing_contacts WHERE channel='email'")[0];const token=unsubscribeToken(secret,email.id,'email');assert.equal(await service().unsubscribe(token),true);assert.equal(await service().unsubscribe(token),true);assert.equal(count('marketing_email_audience'),0);assert.equal(query("SELECT sms_consent FROM marketing_contacts WHERE channel='sms'")[0].sms_consent,1);
 await service(provider).subscribe(body(),'renewed');assert.equal(count('marketing_email_audience'),0);assert.equal(await service().confirm(oldToken),false);assert.equal(await service().confirm(confirmation),true);assert.equal(count('marketing_email_audience'),1);
});
test('SQLite confirmation expiry, provider errors and confirmed duplicate state are honest',async()=>{
 let token;const provider={name:'test',async sendEmailConfirmation(input){token=new URL(input.confirmUrl).searchParams.get('token')}};
 await service(provider).subscribe(body(),'one');exec('UPDATE marketing_contacts SET confirmation_expires_at=1');assert.equal(await service().confirm(token),false);
 await service(provider).subscribe(body(),'two');assert.equal(await service().confirm(token),true);
 const result=await service({name:'failed',async sendEmailConfirmation(){throw Error('private provider failure')}}).subscribe(body(),'three');assert.equal(result.emailConfirmation,'pending');assert.equal(count('marketing_email_audience'),1);assert.equal(query('SELECT status FROM marketing_contacts')[0].status,'confirmed');
});
test('SQLite database failures return unavailable/errors and never a stored acknowledgement',async()=>{
 exec('DROP TABLE marketing_contacts');assert.equal(await repository.available(),false);const request=new Request('https://ceo19.ma/api/marketing/subscribe',{method:'POST',headers:{Origin:'https://ceo19.ma','Content-Type':'application/json'},body:JSON.stringify(body())});const response=await handleSubscribe(request,service());assert.equal(response.status,503);assert.equal((await response.json()).stored,false);
});
test('SQLite retention deletes pending requests but preserves suppression history',async()=>{
 await service().subscribe(body({smsConsent:true}),'old');const sms=query("SELECT id FROM marketing_contacts WHERE channel='sms'")[0];await repository.unsubscribe(sms.id,'sms');await service().subscribe(body({emailConsent:false,smsConsent:true}),'renewed');
 exec('UPDATE marketing_contacts SET updated_at=1');const result=await repository.maintenance();assert.equal(result.pending_deleted,1);assert.equal(result.requests_expired,1);assert.equal(count(),1);assert.equal(query('SELECT status,sms_consent FROM marketing_contacts')[0].status,'suppressed');assert.equal(query('SELECT sms_consent FROM marketing_contacts')[0].sms_consent,0);assert(query("SELECT * FROM marketing_consent_events WHERE event='unsubscribed'").length===1);
});
test('SQLite fails closed for public paths, serverless, temporary production disks and unknown storage',async()=>{
 const base={MARKETING_STORAGE:'sqlite',MARKETING_SQLITE_PATH:path.join(process.cwd(),'.private','waitlist.sqlite')};
 assert.equal(marketingStorageConfig(base).kind,'sqlite');assert.equal(marketingStorageConfig({...base,NODE_ENV:'production'}),null);assert(marketingStorageConfig({...base,NODE_ENV:'production',MARKETING_SQLITE_PERSISTENT:'1'}));
 for(const env of [{VERCEL:'1'},{AWS_LAMBDA_FUNCTION_NAME:'x'},{NETLIFY:'true'},{MARKETING_SQLITE_PATH:path.join(process.cwd(),'public','contacts.sqlite')},{MARKETING_SQLITE_PATH:'relative.sqlite'},{MARKETING_STORAGE:'typo'}])assert.equal(marketingStorageConfig({...base,...env}),null);
 assert.equal(marketingStorageConfig({...base,NODE_ENV:'production',MARKETING_SQLITE_PERSISTENT:'1',MARKETING_SQLITE_PATH:file}),null);
 assert.equal(marketingStorageConfig({MARKETING_STORAGE:'sqlite',SUPABASE_URL:'https://unused.supabase.co',SUPABASE_SECRET_KEY:'unused-test-secret-long-enough'}),null);
});
test('SQLite refuses broad permissions, symlinks and incompatible schemas',async()=>{
 await fs.chmod(file,0o644);assert.equal(await repository.available(),false);await fs.chmod(file,0o600);
 const link=path.join(dir,'linked.sqlite');await fs.symlink(file,link);assert.equal(await new SqliteMarketingRepository(link).available(),false);
 const broken=path.join(dir,'dangling.sqlite');await fs.symlink(path.join(dir,'nonexistent.sqlite'),broken);assert.equal(await new SqliteMarketingRepository(broken).available(),false);
 exec('PRAGMA user_version=99');assert.equal(await repository.available(),false);
});
test('private SQLite administration exports to disk, backs up consistently and never exposes records on stdout',async()=>{
 await service().subscribe(body(),'admin');const id=query('SELECT id FROM marketing_contacts')[0].id;
 const admin=new URL('../scripts/marketing-admin.mjs',import.meta.url).pathname;
 const env={...process.env,NODE_ENV:'test',MARKETING_STORAGE:'sqlite',MARKETING_SQLITE_PATH:file};
 const run=(...args)=>promisify(execFile)(process.execPath,[admin,...args],{env});
 const status=await run('status');assert.equal(JSON.parse(status.stdout).marketing_contacts,1);assert(!status.stdout.includes('fan@'));
 const exported=path.join(dir,'contacts.json');const result=await run('export',exported);assert(!result.stdout.includes('fan@'));const records=JSON.parse(await fs.readFile(exported,'utf8'));assert.equal(records.contacts[0].email,'fan@example.invalid');assert(!('confirmation_token_hash' in records.contacts[0]));assert.equal((await fs.stat(exported)).mode&0o077,0);
 await assert.rejects(run('export',exported));
 const copy=path.join(dir,'backup.sqlite');await run('backup',copy);const restored=new DatabaseSync(copy);assert.equal(restored.prepare('SELECT count(*) AS n FROM marketing_contacts').get().n,1);restored.close();assert.equal((await fs.stat(copy)).mode&0o077,0);
 await run('suppress',id,'email');assert.equal(query('SELECT status FROM marketing_contacts')[0].status,'suppressed');await run('delete',id);assert.equal(count(),0);assert.equal(count('marketing_consent_events'),0);
});
test('activating Neon refuses to strand existing locally collected contacts',async()=>{
 const config=`MARKETING_STORAGE=sqlite\nMARKETING_SQLITE_PATH=${file}\n`;
 await requireMigratedLocalContacts(config);
 await service().subscribe(body(),'migration');
 await assert.rejects(requireMigratedLocalContacts(config),/local_contacts_require_migration/);assert.equal(count(),1);assert.equal(count('marketing_consent_events'),1);
});
