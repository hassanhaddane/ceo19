'use client';
import dynamic from 'next/dynamic';
import type { ShopifyPurchaseControlsProps } from './ShopifyPurchaseControls';

/** Import only from the future verified Live Shop. Never from the shared layout or Demo. */
const PurchaseControls = dynamic(() => import('./ShopifyPurchaseControls'), {
 ssr: false,
 loading: () => <p role="status">Shopify…</p>,
});
export function ShopifyStorefrontIntegration(props: ShopifyPurchaseControlsProps) {
 return <PurchaseControls {...props}/>;
}
