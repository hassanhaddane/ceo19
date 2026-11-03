import { MarketingError } from './types.ts';
import type { MarketingSubscriberService } from './service.ts';

const headers = { 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
export function marketingJson(body: object, status = 200) { return Response.json(body, { status, headers: { ...headers, ...(status === 429 ? { 'Retry-After': '900' } : {}) } }); }
export function marketingFailure(error: unknown) {
 const response = error instanceof MarketingError ? marketingJson({ stored: false, error: error.code }, error.status) : marketingJson({ stored: false, error: 'storage_error' }, 503);
 if (error instanceof MarketingError && error.status === 429 && error.retryAfter) response.headers.set('Retry-After', String(error.retryAfter));
 return response;
}
export async function boundedText(request: Request): Promise<string> {
 if (Number(request.headers.get('content-length') || 0) > 4096) throw new MarketingError('invalid_request', 413);
 if (!request.body) return '';
 const reader = request.body.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
 while (true) {
  const { value, done } = await reader.read(); if (done) break;
  bytes += value.byteLength;
  if (bytes > 4096) { await reader.cancel(); throw new MarketingError('invalid_request', 413); }
  chunks.push(value);
 }
 const buffer = new Uint8Array(bytes); let offset = 0;
 for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.length; }
 return new TextDecoder().decode(buffer);
}
export async function jsonBody(request: Request): Promise<unknown> {
 if (!request.headers.get('content-type')?.startsWith('application/json')) throw new MarketingError('invalid_request', 415);
 try { return JSON.parse(await boundedText(request)); } catch (error) { if (error instanceof MarketingError) throw error; throw new MarketingError('invalid_request'); }
}
export function sameOrigin(request: Request) {
 const origin = request.headers.get('origin');
 const allowed = [new URL(request.url).origin];
 // Next's local server URL can use its bind address (0.0.0.0), while the
 // browser uses localhost. Only loopback Host names get this local allowance.
 const host = request.headers.get('host');
 if (host) { try { const local = new URL(`${new URL(request.url).protocol}//${host}`); if (['localhost','127.0.0.1','[::1]'].includes(local.hostname)) allowed.push(local.origin); } catch { /* Invalid Host grants nothing. */ } }
 for (const value of [process.env.MARKETING_PUBLIC_URL, process.env.SITE_URL]) if (value) { try { allowed.push(new URL(value).origin); } catch { /* Invalid config cannot grant an origin. */ } }
 if (!origin || !allowed.includes(origin)) throw new MarketingError('invalid_request', 403);
}
export function clientRateIdentity(request: Request) {
 // Enable only when the hosting edge overwrites this header. Never trust XFF by default.
 const configured = process.env.MARKETING_TRUSTED_IP_HEADER;
 if (!configured || !['x-real-ip','x-forwarded-for','cf-connecting-ip'].includes(configured)) return 'shared';
 const value = request.headers.get(configured)?.split(',')[0].trim();
 return value && value.length <= 64 && /^[0-9a-f:.]+$/i.test(value) ? value : 'shared';
}
export async function handleSubscribe(request: Request, service: MarketingSubscriberService | null) {
 try {
  sameOrigin(request);
  if (!service) throw new MarketingError('unavailable', 503);
  const result = await service.subscribe(await jsonBody(request), clientRateIdentity(request));
  return marketingJson(result, 202);
 } catch (error) { return marketingFailure(error); }
}
export async function handleConfirm(request: Request, service: MarketingSubscriberService | null) {
 try {
  sameOrigin(request); if (!service) throw new MarketingError('unavailable', 503);
  const body = await jsonBody(request) as { token?: unknown } | null;
  if (typeof body?.token !== 'string' || !await service.confirm(body.token)) throw new MarketingError('invalid_request');
  return marketingJson({ confirmed: true });
 } catch (error) { return marketingFailure(error); }
}
export async function handleUnsubscribe(request: Request, service: MarketingSubscriberService | null) {
 try {
  if (!service) throw new MarketingError('unavailable', 503);
  let token: unknown;
  if (request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded')) {
   // RFC 8058 one-click: a signed URL is the credential. GET never changes state.
   const form = new URLSearchParams(await boundedText(request));
   if (form.get('List-Unsubscribe') !== 'One-Click') throw new MarketingError('invalid_request');
   token = new URL(request.url).searchParams.get('token');
  } else { sameOrigin(request); const body = await jsonBody(request) as { token?: unknown } | null; token = body?.token; }
  if (typeof token !== 'string' || !await service.unsubscribe(token)) throw new MarketingError('invalid_request');
  return marketingJson({ unsubscribed: true });
 } catch (error) { return marketingFailure(error); }
}
