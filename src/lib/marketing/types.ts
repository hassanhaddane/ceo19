export type MarketingLocale = 'en' | 'fr';
export type MarketingChannel = 'email' | 'sms';
export type MarketingErrorCode = 'invalid_email' | 'invalid_phone' | 'no_consent' | 'outdated_consent' | 'invalid_request' | 'rate_limited' | 'storage_error' | 'unavailable';
export class MarketingError extends Error {
 readonly code: MarketingErrorCode;
 readonly status: number;
 readonly retryAfter?: number;
 constructor(code: MarketingErrorCode, status = 400, retryAfter?: number) { super(code); this.name = 'MarketingError'; this.code = code; this.status = status; this.retryAfter = retryAfter; }
}
export interface OptInChannel { channel: MarketingChannel; address: string; consent: true; }
export interface ValidatedSubscription { channels: OptInChannel[]; locale: MarketingLocale; version: string; }
export interface StoredChannel { id: string; channel: MarketingChannel; }
export interface RateBucket { key: string; limit: number; seconds: number; }
export interface MarketingRepository {
 available(): Promise<boolean>;
 subscribe(input: ValidatedSubscription, channels: readonly (OptInChannel & { token_hash: string; token_expires_at: string })[], buckets: RateBucket[]): Promise<StoredChannel[]>;
 delivery(id: string, tokenHash: string, status: 'accepted' | 'failed' | 'unconfigured'): Promise<void>;
 confirm(hash: string): Promise<boolean>;
 unsubscribe(id: string, channel: MarketingChannel): Promise<boolean>;
}
export interface MarketingProvider {
 readonly name: string;
 sendEmailConfirmation(input: { email: string; locale: MarketingLocale; confirmUrl: string; unsubscribeUrl: string; oneClickUrl: string }): Promise<void>;
}
/** Request/delivery outcomes only; existing membership is never disclosed publicly. */
export interface StoredResult { stored: true; emailConfirmation: 'sent' | 'pending' | 'not_requested'; smsVerification: 'pending' | 'not_requested'; }
