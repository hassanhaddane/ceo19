import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { marketingDatabase, postgresRpcTransport } from './helpers/marketingDatabase.mjs';
import { CONSENT_VERSION, consentText } from '../src/data/marketing.ts';
import { SupabaseMarketingRepository } from '../src/lib/marketing/repository.ts';
import { MarketingSubscriberService } from '../src/lib/marketing/service.ts';
import { BrevoMarketingProvider } from '../src/lib/marketing/provider.ts';
import { handleSubscribe, handleConfirm, handleUnsubscribe } from '../src/lib/marketing/http.ts';
import { normalizePhone, normalizeEmail } from '../src/lib/marketing/validation.ts';
import { unsubscribeToken, hashConfirmation } from '../src/lib/marketing/tokens.ts';

let database,repository;const secret='test-secret-not-a-production-credential-123456789';
const input=(overrides={})=>({source:'shop_waitlist',locale:'en',consentVersion:CONSENT_VERSION,email:'Fan@Example.Invalid',phone:'+14155552671',country:'',emailConsent:true,smsConsent:false,website:'',...overrides});
const req=(body,route='subscribe',origin='https://ceo19.ma')=>new Request(`https://ceo19.ma/api/marketing/${route}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
const service=(provider=null)=>new MarketingSubscriberService(repository,{secret,siteUrl:'https://ceo19.ma',provider});
const count=async(table='marketing_contacts')=>Number((await database.query(`select count(*) as count from public.${table}`)).rows[0].count);
const contacts=async()=> (await database.query('select * from public.marketing_contacts order by channel')).rows;
before(async()=>{database=await marketingDatabase();repository=new SupabaseMarketingRepository('https://test.supabase.co','test-server-key',postgresRpcTransport(database));});
beforeEach(async()=>{await database.exec('truncate public.marketing_contacts cascade; truncate public.marketing_rate_limits;');});
after(async()=>database.close());

test('email-only consent is committed with exact wording and no unconsented phone',async()=>{
 const response=await handleSubscribe(req(input()),service());assert.equal(response.status,202);const result=await response.json();assert.equal(result.stored,true);assert.equal(result.emailConfirmation,'pending');
 const [row]=await contacts();assert.equal(row.email,'fan@example.invalid');assert.equal(row.phone_e164,null);assert.equal(row.email_consent,true);assert.equal(row.sms_consent,false);assert.equal(row.status,'pending');assert.equal(row.confirmed_at,null);assert.equal(row.confirmation_delivery,'unconfigured');assert(row.email_consent_at);assert(!JSON.stringify(result).includes('fan@'));
 const [event]=(await database.query('select * from public.marketing_consent_events')).rows;assert.equal(event.consent_text,consentText.en.email);assert.equal(event.consent_text_version,CONSENT_VERSION);assert.equal(event.source,'shop_waitlist');
});
test('SMS-only consent accepts an E.164 or country-selected number without storing email',async()=>{
 const response=await handleSubscribe(req(input({emailConsent:false,smsConsent:true,phone:'4155552671',country:'US',email:'not-an-email'})),service());assert.equal(response.status,202);
 const [row]=await contacts();assert.equal(row.phone_e164,'+14155552671');assert.equal(row.email,null);assert.equal(row.sms_consent,true);assert.equal(row.email_consent,false);assert.equal(row.status,'pending');assert.equal(await count('marketing_sms_audience'),0);
});
test('both consents produce two independent durable identities in one transaction',async()=>{
 const response=await handleSubscribe(req(input({smsConsent:true,locale:'fr'})),service());assert.equal(response.status,202);assert.equal(await count(),2);assert.equal(await count('marketing_consent_events'),2);
 const rows=await contacts();assert.notEqual(rows[0].id,rows[1].id);assert.equal(rows[0].phone_e164,null);assert.equal(rows[1].email,null);
 const events=(await database.query('select * from public.marketing_consent_events')).rows;assert(events.every(event=>event.consent_text===consentText.fr[event.channel]));
});
test('no consent or string-like consent never writes a contact',async()=>{
 assert.equal((await handleSubscribe(req(input({emailConsent:false,smsConsent:false})),service())).status,400);
 assert.equal((await handleSubscribe(req(input({emailConsent:'true'})),service())).status,400);assert.equal(await count(),0);
});
test('invalid email, invalid phone and unsupported country are rejected by the server',async()=>{
 assert.equal((await handleSubscribe(req(input({email:'bad@'})),service())).status,400);
 assert.equal((await handleSubscribe(req(input({smsConsent:true,phone:'+123'})),service())).status,400);
 assert.equal((await handleSubscribe(req(input({smsConsent:true,country:'ZZ'})),service())).status,400);assert.equal(await count(),0);
 assert.equal(normalizeEmail(' FIRST+drop@Example.Com '),'first+drop@example.com');assert.equal(normalizeEmail('a..b@example.com'),null);
 assert.equal(normalizePhone('+447911123456'),'+447911123456');assert.equal(normalizePhone('+212612345678'),'+212612345678');
});
test('duplicate and simultaneous signup cannot create uncontrolled duplicate contacts',async()=>{
 const fan=service();const responses=await Promise.all([handleSubscribe(req(input()),fan),handleSubscribe(req(input({email:'fan@example.invalid'})),fan)]);assert(responses.every(response=>response.status===202));assert.equal(await count(),1);assert.equal(await count('marketing_consent_events'),2);
});
test('withdrawal is channel-specific; a later explicit opt-in still requires fresh ownership confirmation',async()=>{
 const sent=[];const provider={name:'test',sendEmailConfirmation:async data=>{sent.push(data);}};const fan=service(provider);
 await handleSubscribe(req(input({smsConsent:true})),fan);const [email,sms]=await contacts();const oldToken=new URL(sent[0].confirmUrl).searchParams.get('token');
 const optOut=unsubscribeToken(secret,email.id,'email');assert.equal((await handleUnsubscribe(req({token:optOut},'unsubscribe'),fan)).status,200);
 let rows=await contacts();assert.equal(rows[0].email_consent,false);assert.equal(rows[0].status,'suppressed');assert.equal(rows[1].sms_consent,true);assert.equal((await handleConfirm(req({token:oldToken},'confirm'),fan)).status,400);
 await handleSubscribe(req(input({emailConsent:false,smsConsent:true})),fan);assert.equal((await contacts())[0].email_consent,false);
 await handleSubscribe(req(input()),fan);rows=await contacts();assert.equal(rows[0].status,'pending');assert(rows[0].unsubscribed_email_at);assert.equal(await count('marketing_email_audience'),0);
 const newToken=new URL(sent.at(-1).confirmUrl).searchParams.get('token');assert.notEqual(newToken,oldToken);assert.equal((await handleConfirm(req({token:newToken},'confirm'),fan)).status,200);assert.equal(await count('marketing_email_audience'),1);assert.equal((await contacts())[1].id,sms.id);
});
test('forged unsubscribe cannot suppress another channel and replayed confirm cannot activate again',async()=>{
 const sent=[];const fan=service({name:'test',sendEmailConfirmation:async data=>sent.push(data)});await handleSubscribe(req(input()),fan);const [row]=await contacts();
 const token=new URL(sent[0].confirmUrl).searchParams.get('token');assert.equal((await handleConfirm(req({token},'confirm'),fan)).status,200);assert.equal((await handleConfirm(req({token},'confirm'),fan)).status,400);
 const bad=unsubscribeToken(secret,row.id,'email').slice(0,-1)+'!';assert.equal((await handleUnsubscribe(req({token:bad},'unsubscribe'),fan)).status,400);assert.equal((await contacts())[0].email_consent,true);
});
test('RFC 8058 POST performs one-click unsubscribe; ordinary GET is never a mutation handler',async()=>{
 await handleSubscribe(req(input()),service());const [row]=await contacts();const token=unsubscribeToken(secret,row.id,'email');
 const request=new Request(`https://ceo19.ma/api/marketing/unsubscribe?token=${token}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'List-Unsubscribe=One-Click'});
 assert.equal((await handleUnsubscribe(request,service())).status,200);assert.equal((await contacts())[0].status,'suppressed');
 assert.equal((await handleUnsubscribe(req({token},'unsubscribe'),service())).status,200);
});
test('database error rolls back both channels and cannot return success',async()=>{
 await database.exec('alter table public.marketing_contacts add constraint test_sms_failure check (phone_e164 is null)');
 try {const response=await handleSubscribe(req(input({smsConsent:true})),service());assert.equal(response.status,503);assert.equal((await response.json()).stored,false);assert.equal(await count(),0);assert.equal(await count('marketing_consent_events'),0);} finally{await database.exec('alter table public.marketing_contacts drop constraint test_sms_failure');}
});
test('distributed contact rate limit survives separate service instances',async()=>{
 for(let i=0;i<3;i++)assert.equal((await handleSubscribe(req(input()),service())).status,202);
 const response=await handleSubscribe(req(input()),service());assert.equal(response.status,429);assert(Number(response.headers.get('Retry-After'))>0&&Number(response.headers.get('Retry-After'))<=3600);assert.equal((await response.json()).stored,false);assert.equal(await count(),1);assert.equal(await count('marketing_consent_events'),3);
});
test('missing storage configuration fails closed; missing delivery config stores pending, never verified',async()=>{
 const unavailable=await handleSubscribe(req(input()),null);assert.equal(unavailable.status,503);assert.equal((await unavailable.json()).stored,false);assert.equal(await count(),0);
 const result=await (await handleSubscribe(req(input()),service())).json();assert.equal(result.emailConfirmation,'pending');assert.equal(await count('marketing_email_audience'),0);
});
test('provider rejection preserves stored opt-in and reports pending confirmation honestly',async()=>{
 const provider=new BrevoMarketingProvider('test-api-key',{email:'artist@example.invalid',name:'CEO1.9'},async()=>Response.json({error:'rejected'},{status:503}));
 const response=await handleSubscribe(req(input()),service(provider));assert.equal(response.status,202);const result=await response.json();assert.equal(result.stored,true);assert.equal(result.emailConfirmation,'pending');assert.equal((await contacts())[0].confirmation_delivery,'failed');assert.equal(await count('marketing_email_audience'),0);
});
test('configured provider must actually accept a confirmation before API says sent',async()=>{
 let sent;const provider=new BrevoMarketingProvider('test-api-key',{email:'artist@example.invalid',name:'CEO1.9'},async(_url,options)=>{sent=JSON.parse(options.body);return Response.json({messageId:'test-accepted'},{status:201});});
 const result=await (await handleSubscribe(req(input()),service(provider))).json();assert.equal(result.emailConfirmation,'sent');assert.equal(sent.to[0].email,'fan@example.invalid');assert.equal(sent.headers['List-Unsubscribe-Post'],'List-Unsubscribe=One-Click');assert(sent.textContent.includes('/shop/confirm?token='));assert.equal((await contacts())[0].status,'pending');
});
test('honeypot, old consent version, cross-site origin and oversized payload are rejected without writes',async()=>{
 assert.equal((await handleSubscribe(req(input({website:'bot'})),service())).status,400);assert.equal((await handleSubscribe(req(input({consentVersion:'old'})),service())).status,409);assert.equal((await handleSubscribe(req(input(),'subscribe','https://unrelated.test'),service())).status,403);assert.equal((await handleSubscribe(req(input({extra:'x'.repeat(5000)})),service())).status,413);assert.equal(await count(),0);
});
test('RLS and privilege boundaries deny public records and RPCs even if SELECT is accidentally granted',async()=>{
 await handleSubscribe(req(input()),service());
 await assert.rejects(database.transaction(async tx=>{await tx.exec('set local role anon');await tx.query('select * from public.marketing_contacts');}),/permission denied/);
 await assert.rejects(database.transaction(async tx=>{await tx.exec('set local role authenticated');await tx.query('select public.marketing_health()');}),/permission denied/);
 await database.exec('begin; grant select on public.marketing_contacts to anon; set local role anon;');try{assert.equal(Number((await database.query('select count(*) as n from public.marketing_contacts')).rows[0].n),0);}finally{await database.exec('rollback');}
});
test('confirmation tokens are hashed and expire without making a channel eligible',async()=>{
 const messages=[];await handleSubscribe(req(input()),service({name:'test',sendEmailConfirmation:async data=>messages.push(data)}));const token=new URL(messages[0].confirmUrl).searchParams.get('token');const [row]=await contacts();assert.equal(row.confirmation_token_hash,hashConfirmation(token));assert.notEqual(row.confirmation_token_hash,token);await database.exec("update public.marketing_contacts set confirmation_expires_at=now()-interval '1 second'");assert.equal((await handleConfirm(req({token},'confirm'),service())).status,400);assert.equal(await count('marketing_email_audience'),0);
});
test('real PostgreSQL records persist after database close and reopen',async()=>{
 const directory=await fs.mkdtemp(path.join(os.tmpdir(),'ceo19-marketing-'));let db;
 try{db=await marketingDatabase(directory);const repo=new SupabaseMarketingRepository('https://test.supabase.co','test-key',postgresRpcTransport(db));await new MarketingSubscriberService(repo,{secret,siteUrl:'https://ceo19.ma',provider:null}).subscribe(input(),'shared');await db.close();db=await marketingDatabase(directory);assert.equal(Number((await db.query('select count(*) as n from public.marketing_contacts')).rows[0].n),1);}finally{if(db)await db.close();await fs.rm(directory,{recursive:true,force:true});}
});
test('SMS unsubscribe is isolated from email and maintenance does not erase prior suppression',async()=>{
 await handleSubscribe(req(input({smsConsent:true})),service());const [email,sms]=await contacts();
 const token=unsubscribeToken(secret,sms.id,'sms');assert.equal((await handleUnsubscribe(req({token},'unsubscribe'),service())).status,200);
 assert.equal((await contacts())[0].email_consent,true);assert.equal((await contacts())[1].sms_consent,false);
 await handleSubscribe(req(input({emailConsent:false,smsConsent:true})),service());await database.exec("update public.marketing_contacts set updated_at=now()-interval '31 days'");
 await database.transaction(async tx=>{await tx.exec('set local role service_role');await tx.query('select public.marketing_maintenance()');});
 const remaining=await contacts();assert.equal(remaining.length,1);assert.equal(remaining[0].id,sms.id);assert.equal(remaining[0].status,'suppressed');assert(remaining[0].unsubscribed_sms_at);assert.notEqual(remaining[0].id,email.id);
});
test('legitimate localhost requests work when Next uses its bind address internally',async()=>{
 const request=new Request('http://0.0.0.0:3100/api/marketing/subscribe',{method:'POST',headers:{Origin:'http://localhost:3100',Host:'localhost:3100','Content-Type':'application/json'},body:JSON.stringify(input())});
 assert.equal((await handleSubscribe(request,service())).status,202);
});
test('PostgREST void acknowledgement is accepted without fabricating a JSON body',async()=>{
 const repo=new SupabaseMarketingRepository('https://test.supabase.co','test-key',async()=>new Response(null,{status:204}));
 await assert.doesNotReject(repo.delivery('00000000-0000-0000-0000-000000000001','a'.repeat(64),'accepted'));
});
test('a duplicate verified email remains verified; public acknowledgement never exposes membership',async()=>{
 const sent=[];const fan=service({name:'test',sendEmailConfirmation:async data=>sent.push(data)});await handleSubscribe(req(input()),fan);const token=new URL(sent[0].confirmUrl).searchParams.get('token');await handleConfirm(req({token},'confirm'),fan);
 const result=await (await handleSubscribe(req(input()),service())).json();assert.equal(result.stored,true);assert.equal(result.emailConfirmation,'pending');assert.equal('status' in result,false);assert.equal((await contacts())[0].status,'confirmed');assert.equal(await count('marketing_email_audience'),1);
});
