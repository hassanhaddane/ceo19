import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';
import { demoCatalogue } from '../src/data/demoCatalogue.ts';
import { clampInspectionZoom, dragPose, fitCameraDistance, idleInspectionPose, nextProduct, snapYaw } from '../src/features/shop/presentation/inspection.ts';
import { createApparelShell } from '../src/features/shop/presentation/apparelShell.ts';
import { InspectionController, initialInspectionPose } from '../src/features/shop/presentation/InspectionController.ts';

test('all four exhibition concepts are demo-only and expose no commerce input', async () => {
 assert.equal(demoCatalogue.length, 4);
 assert.equal(new Set(demoCatalogue.map(item => item.id)).size, 4);
 assert.deepEqual(demoCatalogue.map(item => item.previewType), ['apparel-shell', 'apparel-shell', 'sticker-stack', 'keychain-3d']);
 for (const item of demoCatalogue) {
  assert.equal(item.mode, 'demo'); assert.equal(item.model3dAsset, null);
  for (const key of ['price', 'stock', 'availableForSale', 'variantId', 'checkoutUrl', 'releaseDate']) assert.equal(key in item, false);
  for (const asset of [item.frontAsset, item.backAsset].filter(Boolean)) assert.ok((await stat(`public${asset.src}`)).size > 0);
 }
});
test('apparel has separate, nonoverlapping front/back atlas regions and neutral prototype backs', () => {
 for (const item of demoCatalogue.filter(item => item.previewType === 'apparel-shell')) {
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
 controller.reset(); assert.deepEqual(controller.getPose(), initialInspectionPose); assert.equal(second, 2);
 detachSecond(); controller.reset(); assert.equal(second, 2);
});
test('manual input takes the displayed angle without a jump and never competes with idle rotation', () => {
 const controller = new InspectionController();
 assert.equal(controller.isIdle(), true);
 controller.present({yaw:.34,pitch:.06});controller.beginInteraction();
 assert.deepEqual(controller.getPose(),{yaw:.34,pitch:.06});assert.equal(controller.isIdle(),false);
 controller.setPose({yaw:Math.PI,pitch:0});assert.equal(controller.isIdle(),false);
 controller.reset();assert.equal(controller.isIdle(),true);assert.deepEqual(controller.getPose(),initialInspectionPose);
 const version=controller.getResetVersion();controller.present({yaw:Math.PI*2+.1,pitch:.2});controller.reset(true);
 assert.equal(controller.getResetVersion(),version+1);
 assert.ok(Math.abs(controller.getPose().yaw-(Math.PI*2+initialInspectionPose.yaw))<1e-10);
 controller.reset();assert.deepEqual(controller.getDisplayedPose(),initialInspectionPose);
});
test('textile idle motion stays facing the visitor; the solid accessory turns slowly', () => {
 for(const seconds of [0,1,10,30,120,360]) {
  const pose=idleInspectionPose(initialInspectionPose,'apparel-shell',seconds);
  assert.ok(Math.abs(pose.yaw-initialInspectionPose.yaw)<=.14);
  assert.ok(Math.abs(pose.pitch-initialInspectionPose.pitch)<=.015);
 }
 assert.ok(idleInspectionPose(initialInspectionPose,'keychain-3d',60).yaw>Math.PI-1);
});
test('camera framing fits expanded stickers and apparel inside tall mobile viewports', () => {
 for (const [width, height, objectWidth, minimum] of [[312, 382, 4.4, 7.15], [363, 382, 6.15, 8.15], [940, 700, 6.15, 8.15]]) {
  const distance = fitCameraDistance(width, height, objectWidth, minimum);
  const visibleWidth = distance * 2 * Math.tan(37 * Math.PI / 360) * width / height;
  assert.ok(visibleWidth >= objectWidth - 1e-10); assert.ok(distance >= minimum);
 }
 assert.equal(fitCameraDistance(0, 0, 6, 8), 8);
});

test('both textured textile shells have depth and a closed rim', () => {
 for (const id of ['hoodie', 'tshirt']) {
  const shell = createApparelShell(id);
  const positions = shell.getAttribute('position');
  const triangles = shell.getIndex().array;
  const edgeCounts = new Map();
  for (let i = 0; i < triangles.length; i += 3) {
   for (let side = 0; side < 3; side++) {
    const a = triangles[i + side], b = triangles[i + (side + 1) % 3];
    assert.notEqual(a, b);
    const key = a < b ? a + ':' + b : b + ':' + a;
    edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
   }
  }
  assert.ok([...edgeCounts.values()].every(count => count === 2));
  assert.ok(shell.groups[2].count > 0);
  assert.ok(Math.max(...Array.from({ length: positions.count }, (_, i) => positions.getZ(i))) > .22);
  shell.dispose();
 }
});
test('zoom cannot push the inspection camera beyond its framing limits', () => {
 assert.equal(clampInspectionZoom(-1), 1);
 assert.equal(clampInspectionZoom(1.25), 1.25);
 assert.equal(clampInspectionZoom(4), 1.65);
});
