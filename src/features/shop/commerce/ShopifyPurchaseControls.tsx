'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import type { ShopifyProductReference, ShopifyStorefrontConfig } from '@/lib/commerce/types';
import { assertShopifyProduct } from '@/lib/commerce/productAdapter';
import type { Locale } from '@/types/content';
import './shopify.css';

export interface ShopifyPurchaseControlsProps {
 config: ShopifyStorefrontConfig;
 /** Identity projected from actual Shopify data by CommerceProductAdapter. */
 product: ShopifyProductReference;
 locale: Locale;
}
interface ShopifyCartElement extends HTMLElement {
 readonly open: boolean;
 addLine(source: Event): ShopifyCartElement;
 showModal(): ShopifyCartElement;
 close(): ShopifyCartElement;
}

/** Native templates belong to Shopify; React owns only this empty host and its lifecycle. */
export default function ShopifyPurchaseControls({ config, product, locale }: ShopifyPurchaseControlsProps) {
 const host = useRef<HTMLDivElement>(null);
 const [loaded, setLoaded] = useState(false), [failed, setFailed] = useState(false);
 const fr = locale === 'fr';
 const { storeDomain, country, publicAccessToken, customerAccountUrl } = config;
 let valid = true;
 try { assertShopifyProduct(product); } catch { valid = false; }
 useEffect(() => {
  if (!valid || !loaded || !host.current) return;
  const root = host.current;
  // Attributes and template are complete before connecting upgraded custom elements.
  const store = document.createElement('shopify-store');
  store.setAttribute('store-domain', storeDomain);
  store.setAttribute('language', locale.toUpperCase());
  if (country) store.setAttribute('country', country);
  if (publicAccessToken) store.setAttribute('public-access-token', publicAccessToken);
  const cart = document.createElement('shopify-cart') as ShopifyCartElement;
  cart.setAttribute('target', '_self');
  const empty = document.createElement('span'); empty.slot = 'empty'; empty.textContent = fr ? 'Votre panier est vide.' : 'Your cart is empty.';
  const checkout = document.createElement('span'); checkout.slot = 'checkout-button'; checkout.textContent = fr ? 'Passer au paiement' : 'Continue to checkout';
  cart.append(empty, checkout);
  const open = document.createElement('button'); open.type = 'button'; open.className = 'shopify-open-cart'; open.textContent = fr ? 'Voir le panier' : 'View cart';
  const click = (event: Event) => {
   if (!(event.target instanceof Element)) return;
   try {
    const add = event.target.closest<HTMLButtonElement>('[data-shopify-add]');
    if (add && store.contains(add) && add.closest('shopify-context') && !add.disabled) cart.addLine(event).showModal();
    else if (event.target === open) cart.showModal();
   } catch { setFailed(true); }
  };
  store.append(cart, open); root.addEventListener('click', click); root.replaceChildren(store);
  return () => { root.removeEventListener('click', click); if (cart.open) cart.close(); root.replaceChildren(); };
 }, [storeDomain, country, publicAccessToken, locale, loaded, valid, fr]);

 // Switching products replaces only the product context. The Shopify cart stays mounted.
 useEffect(() => {
  if (!valid || !loaded) return;
  const store = host.current?.querySelector('shopify-store');
  if (!store) return;
  const context = document.createElement('shopify-context');
  context.setAttribute('type', 'product'); context.setAttribute('gid', product.gid);
  const template = document.createElement('template');
  // Only static, owned markup. Shopify values are queried as text, never interpolated HTML.
  template.innerHTML = `<div class="shopify-product-controls">
   <h2><shopify-data query="product.title"></shopify-data></h2>
   <shopify-money query="product.selectedOrFirstAvailableVariant.price" format="money_with_currency"></shopify-money>
   <shopify-variant-selector></shopify-variant-selector>
   <button type="button" class="shopify-add" data-shopify-add disabled shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale">${fr ? 'Ajouter au panier' : 'Add to cart'}</button>
  </div>`;
  const pending = document.createElement('p'); pending.setAttribute('shopify-loading-placeholder', ''); pending.textContent = fr ? 'Chargement du produit…' : 'Loading product…';
  context.append(template, pending);
  store.append(context);
  return () => { context.remove(); };
 }, [product.gid, storeDomain, country, publicAccessToken, locale, loaded, valid, fr]);

 if (!valid) return <p role="alert">{fr ? 'Produit indisponible.' : 'Product unavailable.'}</p>;
 return <section className="shopify-commerce" aria-label={fr ? 'Achat avec Shopify' : 'Purchase with Shopify'}>
  <Script id="shopify-storefront-components" type="module" strategy="afterInteractive" src="https://cdn.shopify.com/storefront/web-components.js"
   onReady={() => setLoaded(true)} onError={() => setFailed(true)}/>
  {!loaded && !failed && <p role="status">{fr ? 'Connexion à la boutique…' : 'Connecting to the store…'}</p>}
  {failed && <p role="alert">{fr ? 'La boutique est indisponible. Rechargez la page pour réessayer.' : 'The store is unavailable. Reload the page to try again.'}</p>}
  <div ref={host} hidden={failed}/>
  {customerAccountUrl && <a href={customerAccountUrl}>{fr ? 'Mon compte · Shopify' : 'My account · Shopify'}</a>}
  <p className="shopify-handoff">{fr ? 'Paiement et compte sur Shopify.' : 'Checkout and accounts open with Shopify.'}</p>
 </section>;
}
