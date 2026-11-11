import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { Box3 } from 'three';
import { buildEntityShards } from '../src/components/entity/entityGeometry.ts';
import { entityBass } from '../src/components/entity/entityAudio.ts';
import contours from '../src/components/entity/logoContours.json' with { type: 'json' };
import envelope from '../src/components/entity/radioEnvelope.json' with { type: 'json' };

const publicAsset = path => new URL(`../public/${path}`, import.meta.url);
const hash = async url => createHash('sha256').update(await readFile(url)).digest('hex');

test('assembled shards use both inventoried logo originals and keep the proportions and real cutouts', async () => {
 const sources = ['Blanc', 'Noir'].map(color => publicAsset(`CEO19/Logo/LOGO CEO OFFICIEL ${color}.png`));
 assert.deepEqual(await Promise.all(sources.map(hash)), contours.sources);
 assert.ok(contours.shards.reduce((count, { shapes }) => count + shapes.reduce((n, rings) => n + rings.length - 1, 0), 0) >= 10);
 const shards = buildEntityShards();
 const bounds = new Box3();
 try {
  assert.equal(shards.length, 16);
  for (const { geometry, x, y } of shards) {
   const position = geometry.getAttribute('position');
   assert.ok(position.count > 0);
   assert.ok(position.array.every(Number.isFinite));
   assert.equal(geometry.getAttribute('printUv').count, position.count);
   const box = geometry.boundingBox.clone();
   box.min.x += x; box.max.x += x;
   box.min.y += y; box.max.y += y;
   bounds.union(box);
  }
  const aspect = (bounds.max.x - bounds.min.x) / (bounds.max.y - bounds.min.y);
  assert.ok(aspect > .77 && aspect < .88);
  assert.ok(bounds.max.z - bounds.min.z > .20);
 } finally {
  for (const { geometry } of shards) geometry.dispose();
 }
});

test('light uses measured bass only while the exact local radio file is audible', async () => {
 assert.equal(await hash(publicAsset('CEO19/audio/Ceo 1.mp3')), envelope.sha256);
 const peak = envelope.samples.indexOf(255);
 const state = { status: 'playing', isPlaying: true };
 const audio = {
  paused: false, ended: false, muted: false, volume: .35,
  currentSrc: 'http://localhost/CEO19/audio/Ceo%201.mp3', currentTime: peak / envelope.fps,
 };
 assert.ok(entityBass(audio, state) > .6);
 for (const patch of [{ paused: true }, { muted: true }, { volume: 0 }, { currentSrc: 'https://example.com/other.mp3' }, { currentTime: 5000 }]) {
  assert.equal(entityBass({ ...audio, ...patch }, state), 0);
 }
 assert.equal(entityBass(audio, { ...state, status: 'buffering' }), 0);
});
