import fs from 'node:fs/promises';
import {neonMigration} from './lib/marketing-neon-migration.mjs';
const source=await fs.readFile(new URL('../supabase/migrations/20261023004943_shop_marketing_waitlist.sql',import.meta.url),'utf8');
const target=new URL('../database/marketing/001_neon_waitlist.sql',import.meta.url);
await fs.mkdir(new URL('../database/marketing/',import.meta.url),{recursive:true});
await fs.writeFile(target,neonMigration(source));
console.log('Generated the standalone Neon/Postgres migration without credentials.');
