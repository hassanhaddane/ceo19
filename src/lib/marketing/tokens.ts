import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import type { MarketingChannel } from './types.ts';
export function newConfirmationToken() { const token = randomBytes(32).toString('base64url'); return { token, hash: hashConfirmation(token) }; }
export function hashConfirmation(token: string) { return createHash('sha256').update(token).digest('hex'); }
export function rateKey(secret: string, value: string) { return createHmac('sha256', secret).update(`rate:${value}`).digest('hex'); }
export function unsubscribeToken(secret: string, id: string, channel: MarketingChannel) {
 const body = `v1.${id}.${channel}`;
 return `${body}.${createHmac('sha256', secret).update(`unsubscribe:${body}`).digest('base64url')}`;
}
export function verifyUnsubscribeToken(secret: string, value: string): { id: string; channel: MarketingChannel } | null {
 if (value.length > 180) return null;
 const match = value.match(/^v1\.([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(email|sms)\.([A-Za-z0-9_-]{43})$/);
 if (!match) return null;
 const expected = unsubscribeToken(secret, match[1], match[2] as MarketingChannel);
 const actualBuffer = Buffer.from(value), expectedBuffer = Buffer.from(expected);
 return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer) ? { id: match[1], channel: match[2] as MarketingChannel } : null;
}
