import { parsePhoneNumberFromString, isSupportedCountry, type CountryCode } from 'libphonenumber-js/max';
import { CONSENT_VERSION } from '../../data/marketing.ts';
import { MarketingError, type ValidatedSubscription } from './types.ts';

export function normalizeEmail(value: string): string | null {
 const email = value.trim().normalize('NFC').toLowerCase();
 if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) return null;
 const local = email.split('@')[0];
 return local.length <= 64 && !local.startsWith('.') && !local.endsWith('.') && !local.includes('..') ? email : null;
}
export function normalizePhone(value: string, country?: string): string | null {
 if (value.length > 64 || !/^\+?[\d\s().-]+$/.test(value.trim())) return null;
 if (country && !isSupportedCountry(country as CountryCode)) return null;
 const phone = parsePhoneNumberFromString(value.trim(), { defaultCountry: country as CountryCode | undefined, extract: false });
 return phone?.isValid() && !phone.ext ? phone.number : null;
}
export function validateSubscription(body: unknown): ValidatedSubscription {
 if (!body || typeof body !== 'object' || Array.isArray(body)) throw new MarketingError('invalid_request');
 const input = body as Record<string, unknown>;
 if (input.source !== 'shop_waitlist' || !['en','fr'].includes(input.locale as string) || input.website) throw new MarketingError('invalid_request');
 if (input.consentVersion !== CONSENT_VERSION) throw new MarketingError('outdated_consent', 409);
 if (typeof input.emailConsent !== 'boolean' || typeof input.smsConsent !== 'boolean') throw new MarketingError('invalid_request');
 if (!input.emailConsent && !input.smsConsent) throw new MarketingError('no_consent');
 const channels: ValidatedSubscription['channels'] = [];
 if (input.emailConsent) {
  const email = typeof input.email === 'string' ? normalizeEmail(input.email) : null;
  if (!email) throw new MarketingError('invalid_email');
  channels.push({ channel: 'email', address: email, consent: true });
 }
 if (input.smsConsent) {
  const phone = typeof input.phone === 'string' ? normalizePhone(input.phone, typeof input.country === 'string' && input.country ? input.country : undefined) : null;
  if (!phone) throw new MarketingError('invalid_phone');
  channels.push({ channel: 'sms', address: phone, consent: true });
 }
 // Unconsented contact fields are intentionally neither normalized nor persisted.
 return { channels, locale: input.locale as 'en' | 'fr', version: CONSENT_VERSION };
}
