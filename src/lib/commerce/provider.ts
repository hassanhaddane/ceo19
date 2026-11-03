import 'server-only';
import { parseShopMode, resolveCommerceState } from './config';
import { readShopifyStorefrontConfig } from './shopify';

export const SHOP_MODE = parseShopMode(process.env.SHOP_MODE);
/** Flip only after the real catalogue, viewer wiring and store tests in V5-SHOP.md pass. */
export const shopifyIntegrationVerified = false;
export const commerceState = resolveCommerceState(SHOP_MODE, readShopifyStorefrontConfig(), shopifyIntegrationVerified);
