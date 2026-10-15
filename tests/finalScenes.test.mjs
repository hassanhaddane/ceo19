import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { worldMapAsset, worldModes } from '../src/data/worldArtwork.ts';
import { socialPreviewData } from '../src/data/socialPreviews.ts';
import { releases } from '../src/data/releases.ts';
import { videos } from '../src/data/videos.ts';
import { lyricFragments } from '../src/data/lyrics.ts';
import { socials, channelProduction } from '../src/data/socials.ts';

test('WORLD has only a verified aerial slot or an explicit absent asset, never a substitute photograph', async () => {
 if (worldMapAsset) {
  assert.ok(worldMapAsset.src.startsWith('/CEO19/WORLD/'));
  const metadata = await sharp(`public${worldMapAsset.src}`).metadata();
  assert.equal(worldMapAsset.width, metadata.autoOrient.width);
  assert.equal(worldMapAsset.height, metadata.autoOrient.height);
 } else {
  assert.ok((await fs.stat('public/CEO19/WORLD')).isDirectory());
 }
 assert.deepEqual(worldModes.map(mode => mode.id), releases.map(release => release.id));
 assert.equal(new Set(worldModes.map(mode => mode.treatment)).size, 6);
 for (const mode of worldModes) {
  assert.ok(!Object.hasOwn(mode, 'coverAsset') && !Object.hasOwn(mode, 'sceneAsset'));
  for (const fragment of mode.fragments) assert.ok(lyricFragments[mode.id].includes(fragment));
 }
});

test('curated social previews preserve supplied official accounts and music sources', () => {
 assert.equal(socialPreviewData.length, 4);
 for (const preview of socialPreviewData) {
  assert.equal(preview.url, socials.find(social => social.id === preview.id).url);
  assert.equal(preview.provenance, 'curated');
  assert.ok(preview.frames.length > 0);
  for (const frame of preview.frames) {
   assert.equal(new URL(frame.url).protocol, 'https:');
   if (preview.id === 'youtube') assert.ok(videos.some(video => video.title === frame.title && video.url === frame.url));
   if (preview.id === 'spotify') assert.ok(releases.some(release => release.title === frame.title && (release.spotifyUrl ?? preview.url) === frame.url));
  }
  for (const unverified of ['followers', 'streams', 'publishedAt', 'latest', 'live']) assert.ok(!Object.hasOwn(preview, unverified));
 }
 assert.equal(channelProduction.instagram, 'https://www.instagram.com/hkzprod/');
 assert.equal(channelProduction.youtube, 'https://www.youtube.com/@hkzprod');
});
