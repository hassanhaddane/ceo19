# CEO1.9 — Shopify-managed commerce setup

Status: **Demo active. Live commerce inactive. No Shopify store connected or transactions tested.** Official documentation reviewed 24 October 2026. This document supersedes the former custom Storefront API/cart proposal.

## Architecture and ownership

The existing Next.js/React site, React Three Fiber showroom, official logo, navigation, intro, motion and early-access dialog remain. `SHOP_MODE=demo` displays four explicitly non-purchasable prototypes. Those products have no price, stock, Shopify variant ID or checkout destination.

Our code owns presentation, inspection, product navigation, front/back previews, media selection, scene transitions and brand styling. Shopify is the source of truth for real product records, options, variants, prices, availability, cart operations, discounts, checkout, payments, customer accounts, orders, refunds and configured shipping/tax calculations. There is no duplicate commerce database, cart reducer, cart API route, payment integration, account database or order webhooks in this project. The separate existing marketing waitlist stores consent only; it is not a commerce backend.

This uses the existing stack rather than migrating to Hydrogen. Shopify documents this separation in its [headless overview](https://shopify.dev/docs/storefronts/headless/overview), and offers [Web Components for existing websites](https://shopify.dev/docs/storefronts/headless/additional-sdks/web-components). We do not maintain a full custom Storefront API cart. If a specific requirement proves impossible with official components, document it and obtain approval before introducing that complexity.

## Appropriate official components

| Need | Component / documented mechanism |
| --- | --- |
| Store and market | `shopify-store`: store-domain, optional country, language, optional public-access-token |
| Real selected product | `shopify-context type="product" gid="…"` or handle; native template |
| Product copy | `shopify-data`, e.g. product.title |
| Options | `shopify-variant-selector` inside the product context |
| Price | `shopify-money query="product.selectedOrFirstAvailableVariant.price"` |
| Availability | `shopify-attr--disabled="!product.selectedOrFirstAvailableVariant.availableForSale"` |
| Add / display / checkout | `shopify-cart.addLine(event).showModal()` and the component's checkout action |
| Standard product images | `shopify-media`, including selected-variant image query |
| Future catalogue | `shopify-list-context`; connect actual published Shopify products, never demo data |

The [getting-started guide](https://shopify.dev/docs/api/storefront-web-components/getting-started) documents the official CDN script, tokenless basic setup and optional public token for extra data. The [context reference](https://shopify.dev/docs/api/storefront-web-components/components/shopify-context) documents templates and loading placeholders. [Variant selection](https://shopify.dev/docs/api/storefront-web-components/components/shopify-variant-selector), [money](https://shopify.dev/docs/api/storefront-web-components/components/shopify-money), [data](https://shopify.dev/docs/api/storefront-web-components/components/shopify-data) and [media](https://shopify.dev/docs/api/storefront-web-components/components/shopify-media) stay bound to the actual product context.

The [common patterns](https://shopify.dev/docs/api/storefront-web-components/common-patterns) document cart actions and unavailable-variant bindings. The [cart reference](https://shopify.dev/docs/api/storefront-web-components/components/shopify-cart) provides the modal cart, quantity controls, discount UI, checkout handoff, CSS parts and translation slots. We delegate these operations to Shopify. Its native dialog supplies the cart presentation. Store-specific behavior, failures, keyboard handling and persistence still require real-store verification.

## Implemented boundaries

- `src/lib/commerce/types.ts`: CommerceMode, public configuration, Shopify product identity and explicit mode/readiness state. The former custom cart/order/provider contracts have been removed.
- `config.ts`, `shopify.ts`, `provider.ts`: server-selected mode, canonical store host validation, explicit public configuration allowlist and a verification gate. No private/Admin credentials are read or serialized. Basic components need no access token. Only an explicitly public token may be supplied to their browser configuration.
- `productAdapter.ts`: projects actual Shopify product/media inputs to a live identity and presentation media. Rejects local demo identities, prefers GLB then glTF, assigns image roles explicitly and keeps a missing rear image null. No prices, inventory, variants or cart state are copied into local data.
- `src/features/shop/commerce/ShopifyStorefrontIntegration.tsx`: prepared client-only lazy boundary. Its purchase surface mounts native Shopify templates outside React's managed children, loads `https://cdn.shopify.com/storefront/web-components.js` as a module with Next Script after hydration, and cleans up on unmount. It preserves the mounted cart while replacing the selected product context. No inline event handlers or interpolated product HTML are used.
- `ShopifyPurchaseControls.tsx`: prepared product title, formatted selected-variant price, official options, unavailable binding, official add/cart methods and hosted account link. It makes no purchase-success claim. Script or synchronous invocation failure displays an unavailable message. SDK/network error behavior must be verified against a real store.
- ProductPresentation, ProductViewer and ProductNavigation remain commerce-independent. Demo never imports or mounts Shopify integration and never requests the Shopify script.

**Prepared is not activated:** `shopifyIntegrationVerified` remains false. There is no real live catalogue loader, live showroom orchestration or real-model renderer yet. The Shop route renders Demo or an unavailable Live shell. Even a future ready state requires explicitly wiring the verified live presentation into that route. Store settings alone cannot turn purchases on.

## Modes and configuration

```dotenv
SHOP_MODE=demo
# Future values, intentionally unset:
# SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
# SHOPIFY_COUNTRY=MA
# SHOPIFY_STOREFRONT_PUBLIC_TOKEN=
# SHOPIFY_CUSTOMER_ACCOUNT_URL=
```

`demo | live` are the supported modes. Unset/unrecognized values default to demo (including the obsolete coming_soon setting). Requesting live with missing/invalid config or without verification renders an unavailable store, not demonstration inventory under a Live label. Keep demo in current deployments. These values are read during the Next build/prerender; rebuild and redeploy when changing them.

Country must be an actual configured Shopify Market, not merely a syntactically valid ISO code. Locale comes from `/en` or `/fr`. Leave country unset until markets are configured. Public-token values are visible in browser markup by design; never put private Storefront, Admin, payment or customer-session secrets there. The Web Components integration does not need an API-version environment variable or a private Storefront API client.

## Exact merchant setup and frontend connection

1. Create the real Shopify store under the merchant's account. Set legal business details, currency, contact information, policies, locations and target markets. Record the canonical `*.myshopify.com` host. Do not populate it with DROP LAB demos.
2. Keep the main Next.js domain in place. The repository's configured canonical main site is `ceo19.ma`. Choose the intended store/checkout/account domains in Shopify and verify ownership/TLS. `shop.ceo19.com` is a separately proposed alternative, not an already owned or configured domain. No DNS or architecture changes were made here.
3. For Web Components, follow the official getting-started guide above. Basic components are tokenless. If approved inventory-count/metafield queries require it, install Shopify's Headless sales channel, create a storefront, enable the necessary Storefront permissions and copy its **public** token. Never copy the private token into browser config. Publish the real products to the relevant storefront/channel and markets, then verify visibility there.
4. Add actual products, descriptions, option names/values, variant images, prices, weights, SKUs, tracked inventory and availability in Shopify. Configure whether overselling is permitted intentionally. Create the actual collection used for navigation. No equivalent authoritative JSON catalogue belongs in this repo.
5. Upload real approved media. Shopify's [Model3d](https://shopify.dev/docs/api/storefront/latest/objects/Model3d) exposes hosted model sources. Prepare optimized GLB/glTF for R3F; Shopify's [3D model guidance](https://help.shopify.com/en/manual/products/product-media/expert-3d-model) explains quality checks. Pair actual front/back media IDs explicitly. If a back is absent, show an honest unavailable/neutral view; never mirror the front or invent official artwork. Image-only apparel stays 2.5D. The adapter accepts media but does not yet load a real GLB into the demo renderer.
6. Frontend connection work: connect the actual Shopify catalogue/list context to neutral product navigation, retain the selected Shopify identity separately, map approved media into the viewer, add the real GLB/paired-image presentation family and mount **one** ShopifyStorefrontIntegration beside that live viewer. Keep the store/cart mounted across product selections. Ensure selected variant media follows official selector state without a second commercial source of truth. Test component data/event access against the actual SDK; this bridge is pending. Never attach demoCatalogue or a procedural demo object to those controls.
7. In Settings > Payments, configure Shopify Payments if the merchant is eligible, otherwise a supported gateway. Eligibility depends on business location/category; do not assume Morocco is supported by Shopify Payments. Check the [current supported countries](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries). No card field, Stripe checkout, token storage or payment secret belongs in Next.js.
8. In Shipping and delivery, configure fulfillment locations, product weights, packages, destinations and rates. Shopify documents [shipping/fulfillment setup](https://help.shopify.com/en/manual/fulfillment/setup) and [shipping profiles](https://help.shopify.com/en/manual/fulfillment/setup/shipping-profiles); some stores are transitioning to shipping options by market. Use the controls actually available in the merchant's store, including mixed-product shipment tests.
9. Configure Taxes and duties for the merchant's actual registrations and destinations. Shopify calculates according to that setup; it does not automatically satisfy every filing/remittance obligation. Follow [Shopify tax setup](https://help.shopify.com/en/manual/taxes) and the merchant's tax adviser. No frontend tax engine.
10. In Settings > Customer accounts, activate Shopify-managed accounts and copy the displayed URL into SHOPIFY_CUSTOMER_ACCOUNT_URL. Optionally configure a verified account subdomain using the [official account-domain guide](https://help.shopify.com/en/manual/customers/customer-accounts/customize-customer-accounts/connect-domain-customer-account). Our account link navigates to that hosted site in the same tab. There is no local account session/database, NextAuth or promise of a fully customized free account UI.
11. Use Shopify's checkout/accounts editor for CEO logo, blue/cream colors and supported fonts. [Customization availability depends on the plan](https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations). Checkout leaves the Next.js storefront for the Shopify-controlled checkout domain configured by the merchant. The official cart supplies the supported destination; we do not construct checkout URLs or intercept payment. Configure the supported return/store links and confirm their behavior in tests.
12. Configure separate email/SMS marketing options in Shopify [checkout form settings](https://help.shopify.com/en/manual/checkout-settings/checkout-form-options). Keep opt-ins explicit and unchecked. The existing early-access form does not automatically sync to Shopify, create customer accounts or grant checkout marketing consent. Any future consent integration needs explicit mapping and provider setup. Audit cookies/privacy choices for the actual live storefront before launch.
13. Configure merchant fulfillment, print-on-demand or a logistics partner, shipping origins, product mappings, notifications, returns and refunds in Shopify/the chosen partner. Shopify does not automatically manufacture or physically ship merchandise. Use Shopify's order/refund tools rather than building a local order system.
14. Connect the real frontend and pass the test matrix below in a test environment. Only then update the verification gate, wire the reviewed live route, set SHOP_MODE=live and rebuild/redeploy. Keep the demo catalogue in a separate exhibition path if retained; never mix it into the live catalogue/cart.

## Lower-maintenance alternatives (not activated)

The [Buy Button channel](https://help.shopify.com/en/manual/online-sales-channels/buy-button/create-buy-button) generates product/collection embed code from Shopify Admin. It supports a basic button alongside existing imagery, options and a cart, but changing its appearance requires regenerating/replacing the embed. Web Components fit the proposed custom presentation boundary more directly; do not load both cart systems.

An even simpler option is a Shopify-hosted storefront at `shop.ceo19.com`, after confirming domain ownership, with the Next.js 3D exhibition linking to actual Shopify product pages. The entire product/options/cart/account/checkout journey then lives on Shopify. This reduces frontend integration work and introduces a visible domain transition. Shopify documents [connecting a subdomain while keeping another main website](https://help.shopify.com/en/manual/domains/add-a-domain/connecting-domains/connect-subdomain). Switching to that option requires the user's explicit approval. Nothing here changes hosting or DNS.

## Real-store test matrix and launch gate

Use a separate test/development store or controlled preview, with the [official Shopify test payment gateway or a supported gateway's test mode](https://help.shopify.com/en/manual/checkout-settings/test-orders/payments-test-mode). Follow that gateway's current documented test credentials. Never charge actual customers or use real cards for these tests. Test mode can prevent live customer payments; do not toggle it on a trading store casually.

- Real published products only; correct market/currency/language; absent/unpublished product and failed network states.
- Size/color selection, selected-variant price and image, disabled unavailable variants, sold-out product, inventory changing between cart and checkout. No hardcoded availability overrides.
- Add the selected variant, multiple items, duplicate variant behavior, quantity update/removal, empty cart and component errors. Change products without destroying the cart; verify component-owned persistence through reload and internal route exit/return. No local cart fallback.
- Discount entry, valid/invalid codes and actual Shopify eligibility; final shipping/tax/discount totals validated at hosted checkout.
- Official cart checkout redirect to the correct store/domain, mobile payment simulation, payment failure/cancel, successful test order and supported return links to the actual main site. Verify Back/re-entry behavior without creating duplicate orders.
- Exact hosted account link, test sign-in/out, orders and any configured returns flow. No assumption that hosted sign-in establishes a Next.js session or automatically pre-authenticates an embedded cart.
- Chrome/Safari/mobile, keyboard/visible focus, cart focus trap/Escape/restore, touch controls, reduced motion, WebGL failure, blocked CDN/privacy tools and no unexpected audio overlap. Real model disposal and appropriate mobile DPR.

Local mode/config/demo-rejection/media-projection tests are implemented. Live variants, inventory, cart, discounts, account, checkout, payment and fulfillment tests remain **not run** until a real store is supplied. No credentials, live commerce or real transactions were activated in this deliverable.
