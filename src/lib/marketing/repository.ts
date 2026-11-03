import { MarketingError } from './types.ts';
import { RpcMarketingRepository } from './rpc.ts';

/** Only instantiated by the server runtime. No raw database error or contact data is logged. */
export class SupabaseMarketingRepository extends RpcMarketingRepository {
 constructor(baseUrl: string, key: string, transport: typeof fetch = fetch) {
 super(async(name,body)=>{
  try {
   const response = await transport(`${baseUrl}/rest/v1/rpc/${name}`, { method: 'POST', headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' }, body: JSON.stringify(body), cache: 'no-store', signal: AbortSignal.timeout(10000) });
   if (!response.ok) throw new MarketingError('storage_error', 503);
   if (response.status === 204) return undefined;
   return await response.json();
  } catch { throw new MarketingError('storage_error', 503); }
 });
 }
}
