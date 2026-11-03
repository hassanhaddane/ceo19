import test from 'node:test';
import assert from 'node:assert/strict';
import { parseShopMode, resolveCommerceState, shopifyStoreDomain, hostedAccountUrl, parseShopifyConfig } from '../src/lib/commerce/config.ts';
import { adaptShopifyProduct, assertShopifyProduct } from '../src/lib/commerce/productAdapter.ts';
import { demoCatalogue } from '../src/data/demoCatalogue.ts';
import { artistCollaborations } from '../src/data/shop.ts';

const config = parseShopifyConfig({ SHOPIFY_STORE_DOMAIN: 'artist.myshopify.com' });
test('demo stays noncommercial; unconfigured or unverified live never substitutes demo inventory', () => {
 for (const value of [undefined, 'demo', 'coming_soon', 'invalid']) assert.equal(parseShopMode(value), 'demo');
 assert.equal(parseShopMode('live'), 'live');
 assert.deepEqual(resolveCommerceState('demo', config, true), { mode: 'demo' });
 assert.deepEqual(resolveCommerceState('live', null, true), { mode: 'live', status: 'unavailable', reason: 'configuration' });
 assert.deepEqual(resolveCommerceState('live', config, false), { mode: 'live', status: 'unavailable', reason: 'verification' });
 assert.deepEqual(resolveCommerceState('live', config, true), { mode: 'live', status: 'ready', config });
 assert.deepEqual(artistCollaborations, []);
});
test('public configuration accepts tokenless components and cannot forward private credentials', () => {
 assert.equal(config.storeDomain, 'https://artist.myshopify.com');
 assert.equal(config.publicAccessToken, null);
 assert.equal(parseShopifyConfig({}), null);
 const publicConfig = parseShopifyConfig({ SHOPIFY_STORE_DOMAIN:'ARTIST.myshopify.com', SHOPIFY_COUNTRY:'MA', SHOPIFY_STOREFRONT_PUBLIC_TOKEN:'public-test-only', SHOPIFY_CUSTOMER_ACCOUNT_URL:'https://shopify.com/123/account', SHOPIFY_STOREFRONT_PRIVATE_TOKEN:'must-not-serialize', SHOPIFY_ADMIN_TOKEN:'must-not-serialize' });
 assert.deepEqual(publicConfig, { storeDomain:'https://artist.myshopify.com', country:'MA', publicAccessToken:'public-test-only', customerAccountUrl:'https://shopify.com/123/account' });
 assert.ok(!JSON.stringify(publicConfig).includes('must-not-serialize'));
 for (const host of ['https://artist.myshopify.com','artist.myshopify.com.evil.test','artist.myshopify.com/admin','artist.myshopify.com:443','user@artist.myshopify.com']) assert.throws(() => shopifyStoreDomain(host));
 assert.equal(parseShopifyConfig({SHOPIFY_STORE_DOMAIN:'artist.myshopify.com',SHOPIFY_COUNTRY:'morocco'}), null);
 for (const url of ['http://account.example.com','javascript:alert(1)','https://user:secret@account.example.com','https://account.example.com/#token']) assert.throws(() => hostedAccountUrl(url));
});
test('all local demonstrations fail the Shopify purchase boundary', () => {
 for (const product of demoCatalogue) {
  assert.throws(() => assertShopifyProduct(product));
  assert.throws(() => adaptShopifyProduct(product));
 }
 assert.throws(() => assertShopifyProduct({mode:'demo',provider:'shopify',gid:'gid://shopify/Product/1',handle:'hoodie'}));
});
const product = { id:'gid://shopify/Product/123', handle:'real-hoodie', media:[
 {__typename:'MediaImage',id:'front',image:{url:'https://cdn.shopify.com/front.webp'}},
 {__typename:'MediaImage',id:'rear',image:{url:'https://cdn.shopify.com/rear.webp'}},
 {__typename:'Model3d',id:'model',sources:[{format:'usdz',url:'https://cdn.shopify.com/item.usdz'},{format:'glTF',url:'https://cdn.shopify.com/item.gltf'},{format:'GLB',url:'https://cdn.shopify.com/item.glb'}]},
] };
test('media adapter prefers compatible models and requires explicit separate front/back assignments', () => {
 const result = adaptShopifyProduct(product, {frontMediaId:'front',backMediaId:'rear'});
 assert.equal(result.media.model3dAsset, 'https://cdn.shopify.com/item.glb');
 assert.deepEqual(result.media.frontAsset, {src:'https://cdn.shopify.com/front.webp'});
 assert.deepEqual(result.media.backAsset, {src:'https://cdn.shopify.com/rear.webp'});
 assert.equal(adaptShopifyProduct(product).media.backAsset, null);
 assert.equal(adaptShopifyProduct(product,{frontMediaId:'front',backMediaId:'front'}).media.backAsset, null);
 assert.equal(adaptShopifyProduct({...product,media:product.media.slice(0,2)}).media.model3dAsset, null);
 const invalid = {...product,media:[{__typename:'MediaImage',id:'front',image:{url:'javascript:alert(1)'}}]};
 assert.equal(adaptShopifyProduct(invalid,{frontMediaId:'front'}).media.frontAsset, null);
 for (const key of ['price','stock','variants','cart','checkoutUrl']) assert.equal(key in result,false);
});
