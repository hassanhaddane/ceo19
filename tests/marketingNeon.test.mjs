import test,{before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
import {neonConfig} from '@neondatabase/serverless';
import {NeonMarketingRepository} from '../src/lib/marketing/neon.ts';
import {neonConnection} from '../src/lib/marketing/neon-config.ts';
import {marketingStorageConfig,marketingPublicOrigin} from '../src/lib/marketing/storage-config.ts';
import {MarketingSubscriberService} from '../src/lib/marketing/service.ts';
import {handleSubscribe} from '../src/lib/marketing/http.ts';
import {unsubscribeToken} from '../src/lib/marketing/tokens.ts';
import {CONSENT_VERSION,consentText} from '../src/data/marketing.ts';
import {neonMigration,neonBootstrapStatement} from '../scripts/lib/marketing-neon-migration.mjs';

const connection='postgresql://ceo19_waitlist_app:test-only-password@ep-test.eu-west-3.aws.neon.tech/neondb?sslmode=require';
const secret='neon-tests-only-not-a-live-secret-1234567890';
const input=(overrides={})=>({source:'shop_waitlist',locale:'en',consentVersion:CONSENT_VERSION,email:'Fan@Example.Invalid',phone:'+12025550123',emailConsent:true,smsConsent:false,website:'',...overrides});
let database,repository,migration;
function queryAs(role='ceo19_waitlist_app') {return async(statement,values)=>{
 assert(!statement.includes('fan@'));assert(!statement.includes('+1202'));
 return database.transaction(async tx=>{await tx.exec(`SET LOCAL ROLE ${role}`);return(await tx.query(statement,values)).rows});
};}
const service=(provider=null,repo=repository)=>new MarketingSubscriberService(repo,{secret,siteUrl:'https://ceo19.ma',provider});
const count=async(table='marketing_contacts')=>Number((await database.query(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n);
before(async()=>{
 database=new PGlite();await database.waitReady;migration=await fs.readFile(new URL('../database/marketing/001_neon_waitlist.sql',import.meta.url),'utf8');await database.exec(migration);
 repository=new NeonMarketingRepository(connection,queryAs());
});
beforeEach(async()=>database.exec('TRUNCATE public.marketing_contacts CASCADE;TRUNCATE public.marketing_rate_limits;'));
after(async()=>database.close());

test('standalone Neon migration preserves the canonical consent and transaction implementation',async()=>{
 const original=await fs.readFile(new URL('../supabase/migrations/20261023004943_shop_marketing_waitlist.sql',import.meta.url),'utf8');assert.equal(migration,neonMigration(original));assert(!/\b(?:anon|authenticated|service_role)\b/.test(migration));assert.equal(await repository.available(),true);
});
test('Neon configuration works on Vercel without local storage or an owner connection',()=>{
 assert.equal(marketingStorageConfig({VERCEL:'1',MARKETING_STORAGE:'neon',MARKETING_DATABASE_URL:connection}).kind,'neon');
 assert.equal(marketingStorageConfig({VERCEL:'1',MARKETING_STORAGE:'neon',DATABASE_URL:connection}).kind,'neon');
 for(const url of [undefined,connection.replace('sslmode=require','sslmode=disable'),connection.replace('.neon.tech','.evil.example'),connection.replace('ceo19_waitlist_app','neondb_owner'),connection.replace('postgresql:','https:')]){assert.equal(neonConnection(url),null);assert.equal(marketingStorageConfig({MARKETING_STORAGE:'neon',MARKETING_DATABASE_URL:url}),null);}
 assert.equal(marketingStorageConfig({VERCEL:'1',MARKETING_STORAGE:'sqlite',MARKETING_SQLITE_PATH:'/private/data/waitlist.sqlite',MARKETING_SQLITE_PERSISTENT:'1'}),null);
 assert.equal(marketingStorageConfig({MARKETING_STORAGE:'neon',MARKETING_SQLITE_PATH:'/private/data/waitlist.sqlite'}),null);
});
test('deployed marketing refuses loopback confirmation URLs while local previews remain usable',()=>{
 assert.equal(marketingPublicOrigin({NODE_ENV:'production',MARKETING_PUBLIC_URL:'http://localhost:3100'}),'http://localhost:3100');
 assert.equal(marketingPublicOrigin({VERCEL:'1',MARKETING_PUBLIC_URL:'https://ceo19.ma'}),'https://ceo19.ma');
 assert.equal(marketingPublicOrigin({VERCEL:'1',SITE_URL:'https://ceo19.ma'}),'https://ceo19.ma');
 for(const host of ['localhost','preview.localhost','127.0.0.1','127.0.0.2','[::1]'])assert.equal(marketingPublicOrigin({VERCEL:'1',MARKETING_PUBLIC_URL:`https://${host}:3100`}),null);
 for(const url of ['http://ceo19.ma','https://ceo19.ma/path','https://ceo19.ma?token=private','https://user:private@ceo19.ma'])assert.equal(marketingPublicOrigin({VERCEL:'1',MARKETING_PUBLIC_URL:url}),null);
});
test('Neon email-only, SMS-only and both commit real distinct consent records',async()=>{
 const first=await service().subscribe(input(),'email');assert.equal(first.stored,true);assert.equal(first.emailConfirmation,'pending');assert.equal(await count(),1);
 const email=(await database.query('SELECT * FROM public.marketing_contacts')).rows[0];assert.equal(email.email,'fan@example.invalid');assert.equal(email.phone_e164,null);assert.equal(email.status,'pending');assert.equal(email.confirmation_delivery,'unconfigured');
 await service().subscribe(input({emailConsent:false,smsConsent:true,email:'invalid'}),'sms');assert.equal(await count(),2);assert.equal(await count('marketing_sms_audience'),0);
 await service().subscribe(input({smsConsent:true,locale:'fr'}),'both');assert.equal(await count(),2);assert.equal(await count('marketing_consent_events'),4);
 const events=(await database.query("SELECT * FROM public.marketing_consent_events WHERE locale='fr'")).rows;assert(events.every(row=>row.consent_text===consentText.fr[row.channel]));
});
test('Neon rejects missing/invalid consent and invalid contacts without writes',async()=>{
 for(const overrides of [{emailConsent:false},{emailConsent:'true'},{email:'bad'},{smsConsent:true,phone:'+123'}])await assert.rejects(service().subscribe(input(overrides),'bad'));
 assert.equal(await count(),0);
});
test('Neon duplicates and address quotas survive independent function instances',async()=>{
 for(let i=0;i<3;i++)await service(null,new NeonMarketingRepository(connection,queryAs())).subscribe(input(),`client-${i}`);
 assert.equal(await count(),1);await assert.rejects(service().subscribe(input(),'over-limit'),error=>error.code==='rate_limited'&&error.retryAfter>0);assert.equal(await count('marketing_consent_events'),3);
});
test('Neon email proof, channel opt-out and re-opt-in preserve suppression',async()=>{
 let token;const provider={name:'test',async sendEmailConfirmation(message){token=new URL(message.confirmUrl).searchParams.get('token')}};
 const result=await service(provider).subscribe(input({smsConsent:true}),'first');assert.equal(result.emailConfirmation,'sent');assert.equal(await service().confirm(token),true);assert.equal(await count('marketing_email_audience'),1);
 const email=(await database.query("SELECT id FROM public.marketing_contacts WHERE channel='email'")).rows[0];await service().unsubscribe(unsubscribeToken(secret,email.id,'email'));assert.equal(await count('marketing_email_audience'),0);assert.equal((await database.query("SELECT sms_consent FROM public.marketing_contacts WHERE channel='sms'")).rows[0].sms_consent,true);
 await service(provider).subscribe(input(),'renewed');assert.equal(await count('marketing_email_audience'),0);assert.equal(await service().confirm(token),true);assert.equal(await count('marketing_email_audience'),1);
});
test('Neon SQL transaction rolls back both channels and audit evidence on database failure',async()=>{
 await database.exec("ALTER TABLE public.marketing_consent_events ADD CONSTRAINT test_failure CHECK(channel<>'sms')");
 try{await assert.rejects(service().subscribe(input({smsConsent:true}),'atomic'),error=>error.code==='storage_error');assert.equal(await count(),0);assert.equal(await count('marketing_consent_events'),0);}finally{await database.exec('ALTER TABLE public.marketing_consent_events DROP CONSTRAINT test_failure');}
});
test('Neon transport failure and missing configuration never acknowledge storage',async()=>{
 const failed=new NeonMarketingRepository(connection,async()=>{throw Error('private connection error')});
 const req=()=>new Request('https://ceo19.ma/api/marketing/subscribe',{method:'POST',headers:{Origin:'https://ceo19.ma','Content-Type':'application/json'},body:JSON.stringify(input())});
 for(const s of [null,service(null,failed)]){const response=await handleSubscribe(req(),s);assert.equal(response.status,503);assert.equal((await response.json()).stored,false);}
 const malformed=new NeonMarketingRepository(connection,async()=>[{result:{stored:false}}]);await assert.rejects(service(null,malformed).subscribe(input(),'invalid-ack'));assert.equal(await count(),0);
});
test('Neon public roles cannot read/execute and application login cannot create or bypass RLS',async()=>{
 await database.exec('CREATE ROLE public_reader');
 try{
  await assert.rejects(database.transaction(async tx=>{await tx.exec('SET LOCAL ROLE public_reader');await tx.query('SELECT * FROM public.marketing_contacts')}));
  await assert.rejects(database.transaction(async tx=>{await tx.exec('SET LOCAL ROLE public_reader');await tx.query('SELECT public.marketing_health()')}));
  await assert.rejects(database.transaction(async tx=>{await tx.exec('SET LOCAL ROLE ceo19_waitlist_app');await tx.exec('CREATE TABLE public.unwanted(id int)')}));
  const roles=(await database.query("SELECT rolsuper,rolcreatedb,rolcreaterole,rolbypassrls FROM pg_roles WHERE rolname='ceo19_waitlist_app'")).rows[0];assert(Object.values(roles).every(value=>value===false));
  const owner=new NeonMarketingRepository(connection,async(q,v)=>(await database.query(q,v)).rows);await assert.rejects(owner.available());await assert.rejects(service(null,owner).subscribe(input(),'owner'));assert.equal(await count(),0);
 }finally{await database.exec('DROP ROLE public_reader');}
});
test('Neon maintenance is private and returns only aggregate outcomes',async()=>{
 await service().subscribe(input(),'pending');await database.exec("UPDATE public.marketing_contacts SET updated_at=now()-interval '31 days'");const result=await repository.maintenance();assert.equal(result.pending_deleted,1);assert.equal(await count(),0);assert(Object.values(result).every(Number.isInteger));
});
test('actual Neon HTTP driver parameterizes requests and reads genuine PostgreSQL acknowledgements',async()=>{
 const previous=neonConfig.fetchFunction;let requests=0;
 neonConfig.fetchFunction=async(endpoint,options)=>{
  requests++;assert(new URL(endpoint).protocol==='https:');assert.equal(options.cache,'no-store');assert(options.signal instanceof AbortSignal);const sent=new URL(options.headers['Neon-Connection-String']);assert.equal(sent.username,'ceo19_waitlist_app');assert.equal(sent.hostname,new URL(connection).hostname);
  const {query,params}=JSON.parse(options.body);const rows=await queryAs()(query,params);const result=rows[0].result;
  const type=typeof result==='boolean'?16:result===null?2278:3802;
  return Response.json({fields:[{name:'result',dataTypeID:type,format:'text'}],rows:[[result===null?null:typeof result==='boolean'?(result?'t':'f'):JSON.stringify(result)]],command:'SELECT',rowCount:1});
 };
 try{
  const repo=new NeonMarketingRepository(connection);assert.equal(await repo.available(),true);const response=await service(null,repo).subscribe(input(),'http');assert.equal(response.stored,true);assert.equal(response.emailConfirmation,'pending');assert.equal(await count(),1);assert(requests>=3);
 }finally{neonConfig.fetchFunction=previous;}
});
test('atomic Neon bootstrap creates a restricted application role without Supabase or partial reapplication',async()=>{
 const db=new PGlite();await db.waitReady;
 try{
  await db.exec(neonBootstrapStatement(migration,'A'.repeat(43)));const roles=(await db.query("SELECT rolcanlogin,rolsuper,rolbypassrls FROM pg_roles WHERE rolname='ceo19_waitlist_app'")).rows[0];assert.equal(roles.rolcanlogin,true);assert.equal(roles.rolsuper,false);assert.equal(roles.rolbypassrls,false);
  await assert.rejects(db.exec(neonBootstrapStatement(migration,'B'.repeat(43))));assert.equal(Number((await db.query('SELECT count(*) AS n FROM public.marketing_consent_versions')).rows[0].n),4);
  assert.throws(()=>neonBootstrapStatement(migration,"bad'password"));
 }finally{await db.close();}
});
