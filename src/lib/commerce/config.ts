import type { CommerceMode, CommerceState, ShopifyStorefrontConfig } from './types.ts';

export function parseShopMode(value: string | undefined): CommerceMode {
 return value === 'live' ? 'live' : 'demo';
}
/** A live request must never silently substitute demonstration merchandise. */
export function resolveCommerceState(mode: CommerceMode, config: ShopifyStorefrontConfig | null, verified: boolean): CommerceState {
 if (mode === 'demo') return { mode };
 if (!config) return { mode, status: 'unavailable', reason: 'configuration' };
 if (!verified) return { mode, status: 'unavailable', reason: 'verification' };
 return { mode, status: 'ready', config };
}

export function shopifyStoreDomain(value: string): string {
 if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(value)) throw new Error('Use the canonical myshopify.com hostname, without a scheme or path.');
 return `https://${value.toLowerCase()}`;
}
export function hostedAccountUrl(value: string): string {
 const url = new URL(value);
 if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.port) throw new Error('Use the exact HTTPS customer accounts URL copied from Shopify.');
 return url.href;
}

/** Explicit allowlist; no private credential is read or forwarded. */
export function parseShopifyConfig(env: Record<string, string | undefined>): ShopifyStorefrontConfig | null {
 if (!env.SHOPIFY_STORE_DOMAIN) return null;
 try {
  const country = env.SHOPIFY_COUNTRY || null;
  if (country && !/^[A-Z]{2}$/.test(country)) return null;
  return {
   storeDomain: shopifyStoreDomain(env.SHOPIFY_STORE_DOMAIN),
   country,
   publicAccessToken: env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN || null,
   customerAccountUrl: env.SHOPIFY_CUSTOMER_ACCOUNT_URL ? hostedAccountUrl(env.SHOPIFY_CUSTOMER_ACCOUNT_URL) : null,
  };
 } catch { return null; }
}
