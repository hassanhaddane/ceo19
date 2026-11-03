// Private host CLI only. No HTTP endpoint; never print contacts or tokens.
import fs from 'node:fs';
import path from 'node:path';
import {DatabaseSync,backup} from 'node:sqlite';
import {marketingStorageConfig} from '../src/lib/marketing/storage-config.ts';
import {SqliteMarketingRepository} from '../src/lib/marketing/sqlite.ts';

let db;
try {
 const storage=marketingStorageConfig();
 if(storage?.kind!=='sqlite'||!fs.existsSync(storage.file))throw Error('unavailable');
 const [command,arg,channel]=process.argv.slice(2);
 if(!['status','backup','export','suppress','delete'].includes(command))throw Error('usage');
 const repository=new SqliteMarketingRepository(storage.file);
 if(!await repository.available())throw Error('unavailable');
 if(command==='suppress') {
  if(!/^[a-f0-9-]{36}$/i.test(arg||'')||!['email','sms'].includes(channel))throw Error('usage');
  if(!await repository.unsubscribe(arg,channel))throw Error('not_found');
  console.log('Channel suppressed.');
 } else {
  db=new DatabaseSync(storage.file,{readOnly:command!=='delete',timeout:5000});
  if(command==='status') {
   const result={};for(const table of ['marketing_contacts','marketing_consent_events','marketing_email_audience','marketing_sms_audience'])result[table]=db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
   console.log(JSON.stringify(result));
  } else if(command==='delete') {
   if(!/^[a-f0-9-]{36}$/i.test(arg||''))throw Error('usage');
   db.exec('PRAGMA foreign_keys=ON; PRAGMA secure_delete=ON;');
   const result=db.prepare('DELETE FROM marketing_contacts WHERE id=?').run(arg);
   if(result.changes!==1)throw Error('not_found');
   console.log('Contact and associated consent evidence deleted. Handle downstream copies and backups according to the deletion policy.');
  } else {
   // Require a pre-existing private output directory. Refuse overwrite, links and public exports.
   if(!arg||!path.isAbsolute(arg))throw Error('private_output_required');
   const directory=fs.realpathSync(path.dirname(arg)),stat=fs.statSync(directory),root=fs.realpathSync(process.cwd());
   if((stat.mode&0o077)||(process.getuid&&stat.uid!==process.getuid())||['public','.next','node_modules','.git'].some(name=>directory===path.join(root,name)||directory.startsWith(`${path.join(root,name)}${path.sep}`)))throw Error('private_output_required');
   const target=path.join(directory,path.basename(arg));
   const fd=fs.openSync(target,fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_WRONLY,0o600);
   try {
    if(command==='export') {
     const contacts=db.prepare('SELECT id,channel,email,phone_e164,email_consent,sms_consent,email_consent_at,sms_consent_at,consent_text_version,source,locale,status,created_at,updated_at,confirmed_at,unsubscribed_email_at,unsubscribed_sms_at FROM marketing_contacts ORDER BY created_at').all();
     fs.writeFileSync(fd,JSON.stringify({exported_at:new Date().toISOString(),notice:'Administrative records, including unverified requests. Not a campaign audience.',contacts},null,2));
     fs.fsyncSync(fd);
    }
   } finally {fs.closeSync(fd)}
   if(command==='backup')try{await backup(db,target)}catch(error){fs.unlinkSync(target);throw error}
   console.log(command==='backup'?'Private consistent backup saved.':'Private administrative export saved.');
  }
 }
} catch {
 console.error('Marketing administration failed. Check storage, permissions and arguments. Usage: status | backup <private absolute path> | export <private absolute path> | suppress <contact UUID> <email|sms> | delete <verified contact UUID>.');
 process.exitCode=1;
} finally {db?.close()}
