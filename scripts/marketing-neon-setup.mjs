// Run only from an authorized private terminal. No credentials in args/output or repository files.
import fs from 'node:fs';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {neon} from '@neondatabase/serverless';
import {neonConnection} from '../src/lib/marketing/neon-config.ts';
import {neonBootstrapStatement} from './lib/marketing-neon-migration.mjs';
import {requireMigratedLocalContacts} from './lib/marketing-neon-local.mjs';

let setupCompleted=false,submitted=false;
try{
 const admin=neonConnection(process.env.MARKETING_DATABASE_ADMIN_URL,false);
 if(!admin)throw Error('missing_admin_connection');
 const destination=path.resolve(process.cwd(),'.env.local');
 const stat=fs.lstatSync(destination);
 if(stat.isSymbolicLink()||!stat.isFile()||(stat.mode&0o077)||(process.getuid&&stat.uid!==process.getuid()))throw Error('private_environment_required');
 const content=fs.readFileSync(destination,'utf8');
 if(!/^MARKETING_TOKEN_SECRET=.{32,}$/m.test(content))throw Error('persistent_signing_secret_required');
 await requireMigratedLocalContacts(content);
 const migration=fs.readFileSync(new URL('../database/marketing/001_neon_waitlist.sql',import.meta.url),'utf8');
 const password=randomBytes(32).toString('base64url');
 const app=new URL(admin);app.username='ceo19_waitlist_app';app.password=password;
 const values={MARKETING_STORAGE:'neon',MARKETING_DATABASE_URL:app.toString()};
 let updated=content;
 for(const[name,value]of Object.entries(values)){const re=new RegExp(`^${name}=.*$`,'m');updated=re.test(updated)?updated.replace(re,`${name}=${value}`):`${updated.trimEnd()}\n${name}=${value}\n`;}
 // Prepare the private file before database work; don't change active storage until SQL commits.
 const temporary=path.join(process.cwd(),`.env.neon-${randomBytes(8).toString('hex')}.local`);
 try{
  const descriptor=fs.openSync(temporary,fs.constants.O_CREAT|fs.constants.O_EXCL|fs.constants.O_WRONLY,0o600);
  try{fs.writeFileSync(descriptor,updated);fs.fsyncSync(descriptor)}finally{fs.closeSync(descriptor)}
  const sql=neon(admin);
  submitted=true;
  await sql.query(neonBootstrapStatement(migration,password),[],{fetchOptions:{cache:'no-store',signal:AbortSignal.timeout(30000)}});
  setupCompleted=true;
  fs.renameSync(temporary,destination);
  const {NeonMarketingRepository}=await import('../src/lib/marketing/neon.ts');
  if(!await new NeonMarketingRepository(app.toString()).available())throw Error('health_check_failed');
  console.log('Neon schema and restricted application login created. Local private environment updated; no credentials displayed. Restart the preview. Configure the same application settings in Vercel before deployment.');
 }finally{if(fs.existsSync(temporary)&&!submitted)fs.unlinkSync(temporary);}
}catch(error){
 console.error(error instanceof Error&&error.message==='local_contacts_require_migration'?'Existing local contacts require a verified migration before switching storage. Active local settings are unchanged; no contacts were deleted.':setupCompleted?'Neon setup committed, but local activation needs attention. Do not rerun the fresh-database migration or rotate signing keys. Recover the private environment file if necessary and verify application access.':submitted?'Neon setup could not be confirmed. The private .env.neon-*.local candidate is retained for recovery because SQL may have committed. Inspect the database and verify that candidate before retrying; no success is claimed.':'Neon setup could not be started. Check the private admin connection and local environment permissions. No database success is claimed.');
 process.exitCode=1;
}
