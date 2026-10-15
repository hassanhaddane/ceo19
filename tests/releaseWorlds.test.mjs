import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { releases } from '../src/data/releases.ts';
import { releaseWorlds } from '../src/data/releaseWorlds.ts';
import { geniusEntry, geniusEntries, lyrics } from '../src/data/lyrics.ts';
import { geniusEmbedDocument, isGeniusEmbedMessage } from '../src/lib/geniusEmbed.ts';
import { youtubeId, spotifyEntity } from '../src/components/music/musicSources.ts';

test('release worlds preserve real media and artists with six distinct declarative treatments', () => {
 assert.equal(releaseWorlds.length, 6);
 assert.equal(new Set(releaseWorlds.map(world => world.motionPreset)).size, 6);
 for (const world of releaseWorlds) {
  const release = releases.find(release => release.id === world.id);
  assert.equal(world.coverAsset, release.artwork);
  assert.equal(world.cinemaPoster, release.artwork);
  assert.equal(world.spotifyUrl, release.spotifyUrl);
  assert.equal(world.youtubeUrl, release.youtubeUrl);
  assert.ok(youtubeId(world.youtubeUrl)); assert.ok(spotifyEntity(world.spotifyUrl));
  assert.deepEqual(world.artists, ['CEO1.9', ...(release.featuredArtist ? [release.featuredArtist] : [])]);
 }
 assert.deepEqual(releaseWorlds.find(world => world.id === 'original').lyricFragments, ['Original Vocodo', 'Soduko', 'PAS DE RESEAU']);
 assert.deepEqual(releaseWorlds.find(world => world.id === 'fantastique').lyricFragments, ['Kmaya Fantastaique', 'Roule moi un joint Magique']);
});
test('only the four supplied Genius pairs produce official isolated embed documents', () => {
 assert.deepEqual(Object.values(geniusEntries).map(entry => entry.songId), [13064095, 13063933, 13302636, 14195777]);
 assert.equal(geniusEntry('fantastique').url, 'https://genius.com/Ceo-19-fanstastique-lyrics');
 for (const world of releaseWorlds) {
  const entry = geniusEntry(world.id), document = geniusEmbedDocument(world.id);
  if (!entry) { assert.equal(document, null); assert.equal(world.geniusSongId, null); assert.equal(world.geniusUrl, null); }
  else {
   assert.ok(document.includes(`id="rg_embed_link_${entry.songId}"`));
   assert.ok(document.includes(entry.url));
   assert.equal(document.match(/src="https:\/\/genius.com\/songs\/\d+\/embed.js"/g).length, 1);
   assert.equal(world.geniusUrl, entry.url);
  }
 }
 for (const id of ['timals', 'machi-batel', '__proto__', 'toString', '<script>alert(1)</script>', 'https://evil.example']) {
  assert.equal(geniusEntry(id), null); assert.equal(geniusEmbedDocument(id), null);
 }
 assert.deepEqual(lyrics, []);
});
test('Genius blocked/empty embeds time out to fallback and only their own frame can report status', () => {
 const sent = [], timers = [];
 let disconnected = false;
 const context = vm.createContext({ parent: { postMessage: value => sent.push(value) }, document: { body: {}, querySelector: () => null }, MutationObserver: class { observe() {} disconnect() { disconnected = true; } }, setTimeout: fn => timers.push(fn), addEventListener() {} });
 const document = geniusEmbedDocument('original');
 vm.runInContext(document.match(/<script>([\s\S]*?)<\/script>/)[1], context);
 timers[0]();
 assert.equal(sent[0].status, 'error'); assert.equal(sent[0].songId, 13064095); assert.equal(disconnected, true);
 const frame = {};
 assert.equal(isGeniusEmbedMessage({source:frame,data:sent[0]},frame,'original'),true);
 assert.equal(isGeniusEmbedMessage({source:{},data:sent[0]},frame,'original'),false);
 assert.equal(isGeniusEmbedMessage({source:frame,data:sent[0]},frame,'kritika'),false);
 assert.equal(isGeniusEmbedMessage({source:frame,data:{type:'ceo:genius',songId:13064095,status:'arbitrary'}},frame,'original'),false);
 assert.equal(isGeniusEmbedMessage({source:null,data:sent[0]},null,'original'),false);
});
