import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { archiveWorld, boundedCamera, cameraAnchor } from '../src/data/archiveWorld.ts';
import { publicAssets } from '../src/data/assets.ts';

test('all spatial photographs resolve to original sources and uncropped orientation-correct derivatives', async () => {
 assert.equal(new Set(archiveWorld.map(photo => photo.id)).size, 13);
 for (const photo of archiveWorld) {
  const original = await sharp(`public${photo.asset.source}`).metadata();
  const derived = await sharp(`public${photo.asset.path}`).metadata();
  const { width, height } = original.autoOrient;
  assert.equal(photo.asset.width, width); assert.equal(photo.asset.height, height);
  assert.ok(Math.abs(derived.width / derived.height - width / height) < .002);
  assert.ok(Math.max(derived.width, derived.height) <= 1600);
  assert.ok((await fs.stat(`public${photo.asset.path}`)).size < 450_000);
  assert.ok(publicAssets.some(asset => asset.path === photo.asset.path && asset.width === derived.width && asset.height === derived.height));
 }
});

test('camera stays within the curated path, including overshoot from inertia', () => {
 for (const value of [-100, -.5, 0, .4, 3.5, 12, 15, 100]) {
  const camera = boundedCamera(value, archiveWorld.length);
  assert.ok(camera >= 0 && camera <= archiveWorld.length - 1);
  const anchor = cameraAnchor(value);
  assert.ok(anchor.x >= archiveWorld[0].x && anchor.x <= archiveWorld.at(-1).x);
 }
 const midpoint = cameraAnchor(2.5);
 assert.equal(midpoint.x, (archiveWorld[2].x + archiveWorld[3].x) / 2);
 assert.equal(boundedCamera(10, 0), 0);
});

test('curated composition has ordered spatial stops, bounded tilt and varied depth', () => {
 assert.ok(new Set(archiveWorld.map(photo => photo.depth)).size > 5);
 for (let index = 0; index < archiveWorld.length; index++) {
  const photo = archiveWorld[index];
  if (index) assert.ok(photo.x > archiveWorld[index - 1].x);
  assert.ok(Math.abs(photo.roll) <= 4);
  assert.ok(Math.abs(photo.y) <= .25);
  assert.ok(photo.aspectRatio > 0 && photo.scale > 0);
 }
});
