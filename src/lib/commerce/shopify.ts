import 'server-only';
import { parseShopifyConfig } from './config';

/** Only the public Web Components configuration can cross the client boundary. */
export function readShopifyStorefrontConfig() {
 return parseShopifyConfig({
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_COUNTRY: process.env.SHOPIFY_COUNTRY,
  SHOPIFY_STOREFRONT_PUBLIC_TOKEN: process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN,
  SHOPIFY_CUSTOMER_ACCOUNT_URL: process.env.SHOPIFY_CUSTOMER_ACCOUNT_URL,
 });
}
