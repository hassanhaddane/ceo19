// Trusted server/cron process only. Credentials come from the environment, never CLI arguments.
import { marketingStorageConfig } from '../src/lib/marketing/storage-config.ts';
const storage = marketingStorageConfig();
if (!storage) { console.error('Marketing storage configuration is missing or unsupported.'); process.exitCode=1; }
else if(storage.kind==='sqlite') {
 try { const {SqliteMarketingRepository}=await import('../src/lib/marketing/sqlite.ts');console.log(JSON.stringify(await new SqliteMarketingRepository(storage.file).maintenance())); }
 catch { console.error('Marketing maintenance could not be completed.');process.exitCode=1; }
} else if(storage.kind==='neon'){
 try{const {NeonMarketingRepository}=await import('../src/lib/marketing/neon.ts');console.log(JSON.stringify(await new NeonMarketingRepository(storage.url).maintenance()));}
 catch{console.error('Marketing maintenance could not be completed.');process.exitCode=1;}
} else {
 try {
  const {base,key}=storage;
  const response=await fetch(`${base}/rest/v1/rpc/marketing_maintenance`,{method:'POST',headers:{apikey:key,...(key.startsWith('eyJ')?{Authorization:`Bearer ${key}`}:{}) ,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('maintenance_failed');
  const result=await response.json();const counts={};for(const name of ['pending_deleted','requests_expired','tokens_cleared','rate_deleted'])if(Number.isInteger(result[name]))counts[name]=result[name];
  console.log(JSON.stringify(counts));
 }catch{console.error('Marketing maintenance could not be completed.');process.exitCode=1;}
}
