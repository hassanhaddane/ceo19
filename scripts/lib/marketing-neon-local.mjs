import fs from 'node:fs';
import {parseEnv} from 'node:util';
import {marketingStorageConfig} from '../../src/lib/marketing/storage-config.ts';

/** Never strand genuinely collected local contacts when activating an empty remote database. */
export async function requireMigratedLocalContacts(environmentText){
 const env=parseEnv(environmentText);
 if(env.MARKETING_STORAGE!=='sqlite')return;
 const storage=marketingStorageConfig(env);
 if(storage?.kind!=='sqlite')throw Error('invalid_existing_local_storage');
 if(!fs.existsSync(storage.file))return;
 const {DatabaseSync}=await import('node:sqlite');
 const database=new DatabaseSync(storage.file,{readOnly:true});
 try{if(Number(database.prepare('SELECT count(*) AS n FROM marketing_contacts').get().n)>0)throw Error('local_contacts_require_migration');}
 finally{database.close();}
}
