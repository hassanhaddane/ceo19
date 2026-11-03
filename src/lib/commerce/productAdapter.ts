import type { ShopifyProductReference } from './types.ts';
import type { PresentationAsset } from '../../features/shop/presentation/types.ts';

/** A projection of actual Shopify product/media data, not a second catalogue. */
export interface ShopifyProductMediaInput {
 id: string;
 handle: string;
 media: readonly (
  | { __typename: 'MediaImage'; id: string; image: { url: string } | null }
  | { __typename: 'Model3d'; id: string; sources: readonly { format: string; url: string }[] }
 )[];
}
export interface CommerceProductAdapter {
 product: ShopifyProductReference;
 media: { frontAsset: PresentationAsset | null; backAsset: PresentationAsset | null; model3dAsset: string | null };
}
export function assertShopifyProduct(product: ShopifyProductReference): void {
 if (product.mode !== 'live' || product.provider !== 'shopify' || !/^gid:\/\/shopify\/Product\/\d+$/.test(product.gid) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.handle)) {
  throw new Error('Purchase controls require a real Shopify product reference. Demo products are not accepted.');
 }
}
function httpsAsset(value: string): string | null {
 try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}

/** Image roles must be explicitly curated from Shopify media IDs; never guess a rear view. */
export function adaptShopifyProduct(input: ShopifyProductMediaInput, roles: { frontMediaId?: string; backMediaId?: string } = {}): CommerceProductAdapter {
 const product: ShopifyProductReference = { mode: 'live', provider: 'shopify', gid: input.id, handle: input.handle };
 assertShopifyProduct(product);
 const image = (id?: string): PresentationAsset | null => {
  const item = input.media.find(media => media.id === id);
  const src = item?.__typename === 'MediaImage' && item.image ? httpsAsset(item.image.url) : null;
  return src ? { src } : null;
 };
 const sources = input.media.flatMap(media => media.__typename === 'Model3d' ? media.sources : []);
 const model = ['glb', 'gltf'].flatMap(format => sources.filter(source => source.format.toLowerCase() === format)).map(source => httpsAsset(source.url)).find(Boolean) ?? null;
 return { product, media: { frontAsset: image(roles.frontMediaId), backAsset: roles.backMediaId !== roles.frontMediaId ? image(roles.backMediaId) : null, model3dAsset: model } };
}
