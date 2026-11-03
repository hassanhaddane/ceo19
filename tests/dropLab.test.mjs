import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { demoCatalogue } from '../src/data/demoCatalogue.ts';
import { dragPose, fitCameraDistance, nextProduct, snapYaw } from '../src/features/shop/presentation/inspection.ts';
import { InspectionController } from '../src/features/shop/presentation/InspectionController.ts';

test('all four exhibition concepts are demo-only and expose no commerce input', async () => {
 assert.equal(demoCatalogue.length, 4);
 assert.equal(new Set(demoCatalogue.map(item => item.id)).size, 4);
 assert.deepEqual(demoCatalogue.map(item => item.previewType), ['apparel-2.5d', 'apparel-2.5d', 'sticker-stack', 'keychain-3d']);
 for (const item of demoCatalogue) {
  assert.equal(item.mode, 'demo'); assert.equal(item.model3dAsset, null);
  for (const key of ['price', 'stock', 'availableForSale', 'variantId', 'checkoutUrl', 'releaseDate']) assert.equal(key in item, false);
  for (const asset of [item.frontAsset, item.backAsset].filter(Boolean)) assert.ok((await stat(`public${asset.src}`)).size > 0);
 }
});
test('apparel has separate, nonoverlapping front/back atlas regions and neutral prototype backs', () => {
 for (const item of demoCatalogue.filter(item => item.previewType === 'apparel-2.5d')) {
  assert.notDeepEqual(item.frontAsset.region, item.backAsset.region);
  assert.ok(item.frontAsset.region.x + item.frontAsset.region.width <= item.backAsset.region.x);
  assert.match(item.backLabel.en, /Neutral back.*prototype/);
 }
});
test('selection wraps in either direction and reset uses the nearest matching face', () => {
 assert.equal(nextProduct(3, 1, 4), 0); assert.equal(nextProduct(0, -1, 4), 3);
 assert.equal(nextProduct(2, 5, 4), 3); assert.equal(nextProduct(0, 1, 0), 0);
 for (const yaw of [-15, -6, -.2, 0, 3.4, 8, 15]) for (const back of [false, true]) {
  const target = snapYaw(yaw, back);
  assert.ok(Math.abs(target - yaw) <= Math.PI);
  assert.ok(Math.abs(Math.cos(target) - (back ? -1 : 1)) < 1e-10);
 }
});
test('rotation remains horizontal and pitch stays bounded on narrow touch surfaces', () => {
 assert.equal(dragPose(0, 0, 0, 0, 0).yaw, 0);
 assert.ok(Number.isFinite(dragPose(0, 0, 120, 50, 0).yaw));
 assert.equal(dragPose(0, 0, 200, 10000, 375).pitch, .28);
 assert.equal(dragPose(0, 0, -200, -10000, 375).pitch, -.28);
 assert.ok(dragPose(1, 0, 40, 0, 375).yaw > 1);
});
test('viewer input redraws imperatively; stale cleanup cannot disconnect a replacement stage', () => {
 const controller = new InspectionController(); let first = 0, second = 0;
 const detachFirst = controller.attach(() => first++);
 controller.setPose({ yaw: 1, pitch: .2 }); assert.equal(first, 1);
 const detachSecond = controller.attach(() => second++); detachFirst();
 controller.setPointer({ x: .1, y: .2 }); assert.equal(second, 1);
 controller.reset(); assert.deepEqual(controller.getPose(), { yaw: 0, pitch: 0 }); assert.equal(second, 2);
 detachSecond(); controller.reset(); assert.equal(second, 2);
});
test('camera framing fits expanded stickers and apparel inside tall mobile viewports', () => {
 for (const [width, height, objectWidth, minimum] of [[312, 382, 4.4, 7.15], [363, 382, 6.15, 8.15], [940, 700, 6.15, 8.15]]) {
  const distance = fitCameraDistance(width, height, objectWidth, minimum);
  const visibleWidth = distance * 2 * Math.tan(37 * Math.PI / 360) * width / height;
  assert.ok(visibleWidth >= objectWidth - 1e-10); assert.ok(distance >= minimum);
 }
 assert.equal(fitCameraDistance(0, 0, 6, 8), 8);
});
