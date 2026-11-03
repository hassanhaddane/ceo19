import 'server-only';
import { SupabaseMarketingRepository } from './repository';
import { MarketingSubscriberService } from './service';
import { BrevoMarketingProvider } from './provider';
import { normalizeEmail } from './validation';
import { SqliteMarketingRepository } from './sqlite';
import { marketingStorageConfig,marketingPublicOrigin } from './storage-config';
import { NeonMarketingRepository } from './neon';

/** Secrets are only read inside this server-only boundary; never passed through props. */
export function getMarketingRuntime() {
 const storage = marketingStorageConfig();
 const site = marketingPublicOrigin();
 const secret = process.env.MARKETING_TOKEN_SECRET?.trim();
 if (!storage || !site || !secret || secret.length < 32) return null;
 try {
  const repository = storage.kind === 'neon' ? new NeonMarketingRepository(storage.url) : storage.kind === 'sqlite' ? new SqliteMarketingRepository(storage.file) : new SupabaseMarketingRepository(storage.base, storage.key);
  const email = normalizeEmail(process.env.MARKETING_FROM_EMAIL || '');
  const provider = process.env.MARKETING_EMAIL_PROVIDER === 'brevo' && process.env.BREVO_API_KEY && email ? new BrevoMarketingProvider(process.env.BREVO_API_KEY, { email, name: process.env.MARKETING_FROM_NAME || 'CEO1.9' }) : null;
  return { repository, service: new MarketingSubscriberService(repository, { secret, siteUrl: site, provider }) };
 } catch { return null; }
}
