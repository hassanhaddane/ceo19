import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CONSENT_VERSION, consentText } from '../../data/marketing.ts';
import { SQLITE_SCHEMA, SQLITE_SCHEMA_VERSION } from './sqlite-schema.ts';
import { MarketingError, type MarketingRepository, type MarketingChannel, type MarketingLocale, type RateBucket, type ValidatedSubscription, type OptInChannel, type StoredChannel } from './types.ts';
import { normalizeEmail, normalizePhone } from './validation.ts';

interface Contact {
 id: string; channel: MarketingChannel; locale: MarketingLocale; consent_text_version: string;
 status: 'pending' | 'confirmed' | 'suppressed'; updated_at: number; confirmed_at: number | null;
 unsubscribed_email_at: number | null; unsubscribed_sms_at: number | null;
}

/** Private, file-backed storage for one persistent Node host. Never a serverless fallback. */
export class SqliteMarketingRepository implements MarketingRepository {
 private readonly file: string;
 constructor(file: string) {
  if (!path.isAbsolute(file) || path.extname(file) !== '.sqlite') throw new MarketingError('unavailable',503);
  this.file = file;
 }
 private open() {
  const directory = path.dirname(this.file);
  fs.mkdirSync(directory,{recursive:true,mode:0o700});
  const parent = fs.lstatSync(directory);
  if (!parent.isDirectory() || parent.isSymbolicLink() || (parent.mode & 0o077) || (process.getuid && parent.uid !== process.getuid())) throw new Error('private_directory_required');
  const real = path.join(fs.realpathSync(directory),path.basename(this.file));
  const root = fs.realpathSync(process.cwd());
  if (['public','.next','node_modules','.git'].some(name => real.startsWith(`${root}${path.sep}${name}${path.sep}`))) throw new Error('private_path_required');
  const checkFiles = () => { for (const suffix of ['','-wal','-shm']) {
   try {
    const stat = fs.lstatSync(this.file+suffix);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || (stat.mode & 0o077) || (process.getuid && stat.uid !== process.getuid())) throw new Error('private_file_required');
   } catch(error) { if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error; }
  }};
  checkFiles();
  if (!fs.existsSync(this.file)) {
   try { fs.closeSync(fs.openSync(this.file,fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_WRONLY,0o600)); }
   catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  }
  checkFiles();
  const db = new DatabaseSync(this.file,{timeout:5000,enableForeignKeyConstraints:true,allowExtension:false});
  try {
   db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA secure_delete=ON;');
   db.exec('BEGIN IMMEDIATE');
   const version = Number(db.prepare('PRAGMA user_version').get()!.user_version);
   if (version === 0) {
    db.exec(SQLITE_SCHEMA);
    const insert = db.prepare('INSERT INTO marketing_consent_versions VALUES(?,?,?,?)');
    for (const locale of ['en','fr'] as const) for (const channel of ['email','sms'] as const) insert.run(CONSENT_VERSION,locale,channel,consentText[locale][channel]);
    db.exec(`PRAGMA user_version=${SQLITE_SCHEMA_VERSION}`);
   } else if (version !== SQLITE_SCHEMA_VERSION) throw new Error('unsupported_schema');
   db.exec('COMMIT');
   return db;
  } catch (error) { if (db.isTransaction) db.exec('ROLLBACK'); db.close(); throw error; }
 }
 private transaction<T>(action:(db:DatabaseSync)=>T): T {
  let db: DatabaseSync | undefined;
  try { db=this.open(); db.exec('BEGIN IMMEDIATE'); const result=action(db); db.exec('COMMIT'); return result; }
  catch(error) { if(db?.isTransaction) db.exec('ROLLBACK'); if(error instanceof MarketingError) throw error; throw new MarketingError('storage_error',503); }
  finally { db?.close(); }
 }
 private event(db:DatabaseSync, contact:Contact, event:string, consent:boolean, at:number) {
  const text=db.prepare('SELECT consent_text FROM marketing_consent_versions WHERE version=? AND locale=? AND channel=?').get(contact.consent_text_version,contact.locale,contact.channel)?.consent_text;
  if(typeof text!=='string')throw new Error('unknown_consent');
  db.prepare('INSERT INTO marketing_consent_events VALUES(?,?,?,?,?,?,?,?,?,?)').run(randomUUID(),contact.id,contact.channel,event,Number(consent),at,contact.consent_text_version,text,contact.locale,'shop_waitlist');
 }
 async available() {
  try { return this.transaction(db=>{
   for(const table of ['marketing_contacts','marketing_consent_events','marketing_rate_limits','marketing_email_audience','marketing_sms_audience'])db.prepare(`SELECT * FROM ${table} LIMIT 0`).all();
   return Number(db.prepare('SELECT count(*) AS n FROM marketing_consent_versions WHERE version=?').get(CONSENT_VERSION)!.n)===4;
  }); } catch { return false; }
 }
 async subscribe(input:ValidatedSubscription, channels:readonly(OptInChannel & {token_hash:string;token_expires_at:string})[], buckets:RateBucket[]):Promise<StoredChannel[]> {
  // Defend the repository boundary as well as the HTTP boundary.
  if(input.version!==CONSENT_VERSION || !['en','fr'].includes(input.locale) || channels.length<1 || channels.length>2 || new Set(channels.map(c=>c.channel)).size!==channels.length || buckets.length<1 || buckets.length>3)throw new MarketingError('invalid_request');
  for(const c of channels)if(c.consent!==true || !/^[a-f0-9]{64}$/.test(c.token_hash) || !Number.isFinite(Date.parse(c.token_expires_at)) || (c.channel==='email'?normalizeEmail(c.address)!==c.address:c.channel==='sms'?normalizePhone(c.address)!==c.address:true))throw new MarketingError('invalid_request');
  const outcome=this.transaction(db=>{
   const now=Date.now();
   for(const bucket of [...buckets].sort((a,b)=>a.key.localeCompare(b.key))) {
    if(!/^[a-f0-9]{64}$/.test(bucket.key) || !Number.isInteger(bucket.limit) || bucket.limit<1 || bucket.limit>1000 || !Number.isInteger(bucket.seconds) || bucket.seconds<1 || bucket.seconds>86400)throw new MarketingError('invalid_request');
    const seconds=Math.floor(now/1000),window=Math.floor(seconds/bucket.seconds)*bucket.seconds;
    const previous=db.prepare('SELECT hits FROM marketing_rate_limits WHERE key=? AND window_start=?').get(bucket.key,window);
    if(previous && Number(previous.hits)>=bucket.limit)return {retry:Math.max(1,window+bucket.seconds-seconds)};
    db.prepare('INSERT INTO marketing_rate_limits VALUES(?,?,1) ON CONFLICT(key,window_start) DO UPDATE SET hits=hits+1').run(bucket.key,window);
   }
   db.prepare('DELETE FROM marketing_rate_limits WHERE window_start<?').run(Math.floor(now/1000)-172800);
   const saved:StoredChannel[]=[];
   for(const c of channels) {
    const email=c.channel==='email', addressColumn=email?'email':'phone_e164';
    const previous=db.prepare(`SELECT * FROM marketing_contacts WHERE ${addressColumn}=?`).get(c.address) as unknown as Contact | undefined;
    const at=Math.max(now,(previous?.updated_at??0)+1), id=previous?.id??randomUUID();
    if(previous) {
     const withdrawal=email?previous.unsubscribed_email_at:previous.unsubscribed_sms_at;
     const status=previous.status==='confirmed' && (withdrawal===null || (previous.confirmed_at??0)>withdrawal)?'confirmed':'pending';
     db.prepare(`UPDATE marketing_contacts SET ${email?'email_consent=1,email_consent_at=?':'sms_consent=1,sms_consent_at=?'},consent_text_version=?,locale=?,updated_at=?,status=?,confirmation_token_hash=?,confirmation_expires_at=?,confirmation_delivery='pending' WHERE id=?`).run(at,input.version,input.locale,at,status,email?c.token_hash:null,email?Date.parse(c.token_expires_at):null,id);
    } else {
     db.prepare('INSERT INTO marketing_contacts(id,channel,email,phone_e164,email_consent,sms_consent,email_consent_at,sms_consent_at,consent_text_version,locale,created_at,updated_at,confirmation_token_hash,confirmation_expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,c.channel,email?c.address:null,email?null:c.address,Number(email),Number(!email),email?at:null,email?null:at,input.version,input.locale,at,at,email?c.token_hash:null,email?Date.parse(c.token_expires_at):null);
    }
    this.event(db,{id,channel:c.channel,locale:input.locale,consent_text_version:input.version} as Contact,'opt_in_requested',true,at);
    saved.push({id,channel:c.channel});
   }
   return {saved};
  });
  if('retry' in outcome)throw new MarketingError('rate_limited',429,outcome.retry);
  return outcome.saved;
 }
 async delivery(id:string,hash:string,status:'accepted'|'failed'|'unconfigured') {
  this.transaction(db=>{db.prepare('UPDATE marketing_contacts SET confirmation_delivery=? WHERE id=? AND confirmation_token_hash=?').run(status,id,hash);});
 }
 async confirm(hash:string) {
  return this.transaction(db=>{
   const now=Date.now();
   const row=db.prepare("SELECT * FROM marketing_contacts WHERE channel='email' AND email_consent=1 AND confirmation_token_hash=? AND confirmation_expires_at>? AND(unsubscribed_email_at IS NULL OR email_consent_at>unsubscribed_email_at)").get(hash,now) as unknown as Contact|undefined;
   if(!row)return false;
   const at=Math.max(now,row.updated_at+1);
   db.prepare("UPDATE marketing_contacts SET status='confirmed',confirmed_at=?,updated_at=?,confirmation_token_hash=NULL,confirmation_expires_at=NULL WHERE id=?").run(at,at,row.id);
   this.event(db,row,'email_confirmed',true,at);return true;
  });
 }
 async unsubscribe(id:string,channel:MarketingChannel) {
  return this.transaction(db=>{
   const row=db.prepare('SELECT * FROM marketing_contacts WHERE id=? AND channel=?').get(id,channel) as unknown as Contact|undefined;
   if(!row)return false;if(row.status==='suppressed')return true;
   const at=Math.max(Date.now(),row.updated_at+1);
   db.prepare(`UPDATE marketing_contacts SET status='suppressed',updated_at=?,${channel==='email'?'email_consent=0,unsubscribed_email_at=?':'sms_consent=0,unsubscribed_sms_at=?'},confirmation_token_hash=NULL,confirmation_expires_at=NULL WHERE id=?`).run(at,at,id);
   this.event(db,row,'unsubscribed',false,at);return true;
  });
 }
 async maintenance() {
  return this.transaction(db=>{
   const now=Date.now(),cutoff=now-30*86400000;
   const pending_deleted=Number(db.prepare("DELETE FROM marketing_contacts WHERE status='pending' AND updated_at<? AND unsubscribed_email_at IS NULL AND unsubscribed_sms_at IS NULL").run(cutoff).changes);
   const rows=db.prepare("SELECT * FROM marketing_contacts WHERE status='pending' AND updated_at<? AND(unsubscribed_email_at IS NOT NULL OR unsubscribed_sms_at IS NOT NULL)").all(cutoff) as unknown as Contact[];
   for(const row of rows){this.event(db,row,'pending_expired',false,now);db.prepare("UPDATE marketing_contacts SET status='suppressed',email_consent=0,sms_consent=0,confirmation_token_hash=NULL,confirmation_expires_at=NULL,updated_at=? WHERE id=?").run(now,row.id);}
   const tokens_cleared=Number(db.prepare('UPDATE marketing_contacts SET confirmation_token_hash=NULL,confirmation_expires_at=NULL WHERE confirmation_expires_at<?').run(now).changes);
   const rate_deleted=Number(db.prepare('DELETE FROM marketing_rate_limits WHERE window_start<?').run(Math.floor(now/1000)-172800).changes);
   return {pending_deleted,requests_expired:rows.length,tokens_cleared,rate_deleted};
  });
 }
}
