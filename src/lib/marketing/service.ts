import { MarketingError, type MarketingProvider, type MarketingRepository, type StoredResult } from './types.ts';
import { validateSubscription } from './validation.ts';
import { newConfirmationToken, hashConfirmation, rateKey, unsubscribeToken, verifyUnsubscribeToken } from './tokens.ts';

export class MarketingSubscriberService {
 private readonly repository: MarketingRepository;
 private readonly options: { secret: string; siteUrl: string; provider: MarketingProvider | null };
 constructor(repository: MarketingRepository, options: { secret: string; siteUrl: string; provider: MarketingProvider | null }) { this.repository = repository; this.options = options; }
 async subscribe(body: unknown, clientKey: string): Promise<StoredResult> {
  const input = validateSubscription(body);
  const requests = input.channels.map(item => ({ ...item, ...newConfirmationToken() }));
  const buckets = [{ key: rateKey(this.options.secret, `client:${clientKey}`), limit: clientKey === 'shared' ? 30 : 8, seconds: 900 }, ...requests.map(item => ({ key: rateKey(this.options.secret, `${item.channel}:${item.address}`), limit: 3, seconds: 3600 }))];
  const channels = requests.map(({ channel, address, consent, hash }) => ({ channel, address, consent, token_hash: hash, token_expires_at: new Date(Date.now() + 48 * 3600000).toISOString() }));
  const saved = await this.repository.subscribe(input, channels, buckets);
  const result: StoredResult = { stored: true, emailConfirmation: requests.some(item => item.channel === 'email') ? 'pending' : 'not_requested', smsVerification: requests.some(item => item.channel === 'sms') ? 'pending' : 'not_requested' };
  const email = requests.find(item => item.channel === 'email');
  const record = saved.find(item => item.channel === 'email');
  if (email && record) {
   let delivery: 'accepted' | 'failed' | 'unconfigured' = 'unconfigured';
   if (this.options.provider) {
    const base = this.options.siteUrl;
    const optOut = unsubscribeToken(this.options.secret, record.id, 'email');
    try {
     await this.options.provider.sendEmailConfirmation({ email: email.address, locale: input.locale, confirmUrl: `${base}/${input.locale}/shop/confirm?token=${email.token}`, unsubscribeUrl: `${base}/${input.locale}/shop/unsubscribe?token=${optOut}`, oneClickUrl: `${base}/api/marketing/unsubscribe?token=${optOut}` });
     delivery = 'accepted'; result.emailConfirmation = 'sent';
    } catch { delivery = 'failed'; }
   }
   // The subscription is already committed. Failure to annotate delivery must not
   // turn a stored request into a fictitious failed write or expose internal errors.
   try { await this.repository.delivery(record.id, email.hash, delivery); } catch { /* Pending record remains safely unverified. */ }
  }
  return result;
 }
 async confirm(token: string) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new MarketingError('invalid_request');
  return this.repository.confirm(hashConfirmation(token));
 }
 async unsubscribe(token: string) {
  const valid = verifyUnsubscribeToken(this.options.secret, token);
  if (!valid) throw new MarketingError('invalid_request');
  return this.repository.unsubscribe(valid.id, valid.channel);
 }
}
