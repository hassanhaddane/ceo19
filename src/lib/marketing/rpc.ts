import { MarketingError, type MarketingRepository, type RateBucket, type ValidatedSubscription, type OptInChannel, type StoredChannel, type MarketingChannel } from './types.ts';

export type MarketingRpc = (name: string, body: Record<string, unknown>) => Promise<unknown>;
/** Shared acknowledgement validation for remote transports. No membership/PII leaves the service. */
export class RpcMarketingRepository implements MarketingRepository {
 private readonly call: MarketingRpc;
 constructor(call:MarketingRpc){this.call=call;}
 async available(){return await this.call('marketing_health',{})===true;}
 async subscribe(input:ValidatedSubscription,channels:readonly(OptInChannel & {token_hash:string;token_expires_at:string})[],buckets:RateBucket[]){
  const raw=await this.call('marketing_subscribe',{p_channels:channels,p_locale:input.locale,p_version:input.version,p_rate_keys:buckets});
  if(!raw||typeof raw!=='object')throw new MarketingError('storage_error',503);
  const result=raw as {stored?:boolean;rate_limited?:boolean;retry_after?:number;channels?:StoredChannel[]};
  if(result.rate_limited)throw new MarketingError('rate_limited',429,Number.isInteger(result.retry_after)&&result.retry_after!>0&&result.retry_after!<=86400?result.retry_after:900);
  if(result.stored!==true||!Array.isArray(result.channels)||result.channels.length!==channels.length||result.channels.some(row=>!row||!/^[0-9a-f-]{36}$/i.test(row.id)||!channels.some(item=>item.channel===row.channel))||new Set(result.channels.map(row=>row.channel)).size!==channels.length)throw new MarketingError('storage_error',503);
  return result.channels;
 }
 async delivery(id:string,hash:string,status:'accepted'|'failed'|'unconfigured'){await this.call('marketing_delivery',{p_id:id,p_hash:hash,p_status:status});}
 async confirm(hash:string){return await this.call('marketing_confirm',{p_token_hash:hash})===true;}
 async unsubscribe(id:string,channel:MarketingChannel){return await this.call('marketing_unsubscribe',{p_id:id,p_channel:channel})===true;}
 async maintenance(){
  const raw=await this.call('marketing_maintenance',{});
  if(!raw||typeof raw!=='object')throw new MarketingError('storage_error',503);
  const counts:Record<string,number>={};for(const key of ['pending_deleted','requests_expired','tokens_cleared','rate_deleted']){const value=(raw as Record<string,unknown>)[key];if(typeof value!=='number'||!Number.isInteger(value)||value<0)throw new MarketingError('storage_error',503);counts[key]=value;}
  return counts;
 }
}
