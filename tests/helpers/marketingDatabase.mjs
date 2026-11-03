import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs/promises';
export const migrationPath = new URL('../../supabase/migrations/20261023004943_shop_marketing_waitlist.sql', import.meta.url);
export async function marketingDatabase(path) {
 const database = new PGlite(path);
 await database.waitReady;
 const exists = await database.query("select to_regclass('public.marketing_contacts') as relation");
 if (!exists.rows[0].relation) {
  await database.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await database.exec(await fs.readFile(migrationPath,'utf8'));
 }
 return database;
}
const methods = {
 marketing_health: { args: [], casts: [] },
 marketing_subscribe: { args: ['p_channels','p_locale','p_version','p_rate_keys'], casts: ['jsonb','text','text','jsonb'] },
 marketing_delivery: { args: ['p_id','p_hash','p_status'], casts: ['uuid','text','text'] },
 marketing_confirm: { args: ['p_token_hash'], casts: ['text'] },
 marketing_unsubscribe: { args: ['p_id','p_channel'], casts: ['uuid','text'] },
};
/** Test transport only. Executes the real migration's SQL as service_role. */
export function postgresRpcTransport(database) {
 return async (url, options) => {
  const name = new URL(url).pathname.split('/').at(-1), method = methods[name];
  if (!method) return Response.json({}, { status:404 });
  try {
   const body=JSON.parse(options.body);
   const values=method.args.map((arg,i)=>method.casts[i]==='jsonb'?JSON.stringify(body[arg]):body[arg]);
   const args=method.casts.map((cast,i)=>`$${i+1}::${cast}`).join(',');
   const result=await database.transaction(async transaction=>{
    await transaction.exec('set local role service_role');
    return transaction.query(`select public.${name}(${args}) as result`,values);
   });
   return Response.json(result.rows[0].result ?? null);
  } catch { return Response.json({error:'database_rejected'}, {status:500}); }
 };
}
