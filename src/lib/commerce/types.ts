/** Shopify owns all commercial state. These contracts contain no cart or order model. */
export type CommerceMode = 'demo' | 'live';

/** Safe to serialize to the browser. Never put an Admin/private token here. */
export interface ShopifyStorefrontConfig {
 readonly storeDomain: string;
 readonly country: string | null;
 readonly publicAccessToken: string | null;
 /** Exact hosted URL copied from Shopify Settings > Customer accounts. */
 readonly customerAccountUrl: string | null;
}
export interface ShopifyProductReference {
 readonly mode: 'live';
 readonly provider: 'shopify';
 readonly gid: string;
 readonly handle: string;
}
export type CommerceState =
 | { mode: 'demo' }
 | { mode: 'live'; status: 'unavailable'; reason: 'configuration' | 'verification' }
 | { mode: 'live'; status: 'ready'; config: ShopifyStorefrontConfig };

/** Editorial collaborations are announcements, never independent commercial records. */
export interface CommerceMedia { id: string; url: string; alt: string; width: number | null; height: number | null; }
export interface ArtistCollaboration {
 id: string; title: string; partner: string | null; collection: string | null;
 description: string; media: readonly CommerceMedia[]; releaseDate: string | null;
 availability: 'unannounced' | 'announced' | 'available' | 'ended';
 shopifyProductId: string | null; shopifyCollectionId: string | null;
}
