import {neon} from '@neondatabase/serverless';
import {RpcMarketingRepository} from './rpc.ts';
import {MarketingError} from './types.ts';
import {neonConnection} from './neon-config.ts';

export type NeonMarketingQuery=(statement:string,values:unknown[])=>Promise<Record<string,unknown>[]>;
// Names and casts are fixed code, never interpolated from request input.
const calls:Record<string,{args:string[];casts:string[]}>= {
 marketing_health:{args:[],casts:[]},
 marketing_subscribe:{args:['p_channels','p_locale','p_version','p_rate_keys'],casts:['jsonb','text','text','jsonb']},
 marketing_delivery:{args:['p_id','p_hash','p_status'],casts:['uuid','text','text']},
 marketing_confirm:{args:['p_token_hash'],casts:['text']},
 marketing_unsubscribe:{args:['p_id','p_channel'],casts:['uuid','text']},
 marketing_maintenance:{args:[],casts:[]}
};
/** One HTTPS query = one database transaction. No socket pool or local state between invocations. */
export class NeonMarketingRepository extends RpcMarketingRepository {
 constructor(connection:string,query?:NeonMarketingQuery){
  const url=neonConnection(connection);
  if(!url)throw new MarketingError('unavailable',503);
  // Lazy construction: importing a route during build never needs database credentials.
  const sql=query?null:neon(url);
  const execute:NeonMarketingQuery=query??((statement,values)=>sql!.query(statement,values,{fetchOptions:{cache:'no-store',signal:AbortSignal.timeout(10000)}}));
  super(async(name,body)=>{
   const call=calls[name];if(!call)throw new MarketingError('storage_error',503);
   try{
    const values=call.args.map((arg,i)=>call.casts[i]==='jsonb'?JSON.stringify(body[arg]):body[arg]);
    const args=call.casts.map((cast,i)=>`$${i+1}::${cast}`).join(',');
    // Owner/admin URLs fail closed, including on direct POST without the availability probe.
    const rows=await execute(`SELECT CASE WHEN public.marketing_runtime_allowed() THEN public.${name}(${args}) ELSE NULL END AS result`,values);
    if(rows.length!==1||rows[0].result===null&&name!=='marketing_delivery'||rows[0].result===undefined)throw new Error('invalid_acknowledgement');
    return rows[0].result;
   }catch{throw new MarketingError('storage_error',503);}
  });
 }
}
