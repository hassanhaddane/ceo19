import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { assets, publicAssets } from '../src/data/assets.ts';
import { socials, channelProduction } from '../src/data/socials.ts';
import { scenes, introScene } from '../src/data/artist.ts';

test('V5 keeps exactly three public scenes and the separate 00 intro', () => {
 assert.deepEqual(scenes.map(scene => scene.id), ['home','music','archive']);
 assert.deepEqual(scenes.map(scene => scene.number), ['01','02','03']);
 assert.equal(introScene.number, '00');
});
test('the original aerial asset and documentary remain preserved for provenance', async () => {
 await fs.access(`public${assets.neighborhoodMap}`);
 await fs.access(`public${assets.documentaryVideo}`);
 assert.ok(publicAssets.some(asset=>asset.path===assets.documentaryVideo));
});
test('the shared network retains the supplied artist and production identities', () => {
 assert.deepEqual(socials.map(social=>social.id),['instagram','tiktok','youtube','spotify']);
 assert.equal(channelProduction.instagram,'https://www.instagram.com/hkzprod/');
 assert.equal(channelProduction.youtube,'https://www.youtube.com/@hkzprod');
});
