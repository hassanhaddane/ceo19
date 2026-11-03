import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import sharp from 'sharp';
import { publicAssets } from '../src/data/assets.ts';
import { releases, releaseFromHash } from '../src/data/releases.ts';
import { releaseWorlds, releasePaletteSamples } from '../src/data/releaseWorlds.ts';
import { geniusEntry, geniusEntries, lyrics } from '../src/data/lyrics.ts';
import { geniusEmbedDocument, isGeniusEmbedMessage } from '../src/lib/geniusEmbed.ts';
import { youtubeId, spotifyEntity } from '../src/components/music/musicSources.ts';

test('release worlds preserve real media and artists with six distinct declarative treatments', () => {
 assert.equal(releaseWorlds.length, 6);
 assert.equal(new Set(releaseWorlds.map(world => world.motionPreset)).size, 6);
 for (const world of releaseWorlds) {
  const release = releases.find(release => release.id === world.releaseId);
  assert.equal(world.cover, release.artwork);
  assert.equal(world.spotifyUrl, release.spotifyUrl);
  assert.equal(world.youtubeUrl, release.youtubeUrl);
  assert.ok(youtubeId(world.youtubeUrl)); assert.ok(spotifyEntity(world.spotifyUrl));
  assert.deepEqual(world.artists, ['CEO1.9', ...(release.featuredArtist ? [release.featuredArtist] : [])]);
 }
 assert.deepEqual(releaseWorlds.find(world => world.releaseId === 'original').lyricFragments, ['Original Vocodo', 'Soduko', 'PAS DE RESEAU']);
 assert.deepEqual(releaseWorlds.find(world => world.releaseId === 'fantastique').lyricFragments, ['KMAYA FANTASTIQUE', 'ROULE MOI UN JOINT MAGIQUE']);
});
test('scene navigation never silently selects a different film; explicit content hashes select shared catalogue objects',()=>{
 assert.equal(releaseFromHash('#music'),null);
 assert.equal(releaseFromHash('#home'),null);
 for(const release of releases){
  assert.equal(releaseFromHash(`#release-${release.id}`),release);
  assert.equal(releaseFromHash(`#film-${release.id}`),release);
 }
 assert.equal(releaseFromHash('#film-unverified'),null);
});
test('every release has a distinct real alternate background with inventoried dimensions and independent depth', async () => {
 assert.equal(new Set(releaseWorlds.map(world=>world.backgroundAsset)).size, releases.length);
 for (const world of releaseWorlds) {
  assert.notEqual(world.backgroundAsset, world.cover, world.releaseId);
  for (const path of new Set([world.backgroundAsset, world.backgroundGraphic])) {
   const asset=publicAssets.find(item=>item.path===path);
   assert.ok(asset, `Uninventoried release image: ${path}`);
   const metadata=await sharp(`public${path}`).metadata();
   assert.equal(metadata.autoOrient.width,asset.width,path);
   assert.equal(metadata.autoOrient.height,asset.height,path);
  }
  assert.ok(world.backgroundScale>1 && world.backgroundScale<=1.3);
  assert.ok(world.backgroundOverlay && world.backgroundGradient && world.foregroundColor);
  assert.notEqual(world.backgroundParallax,'photograph','Background must move independently of the sleeve');
 }
});
test('only the four supplied Genius pairs produce official isolated embed documents', () => {
 assert.deepEqual(Object.values(geniusEntries).map(entry => entry.songId), [13064095, 13063933, 13302636, 14195777]);
 assert.equal(geniusEntry('fantastique').url, 'https://genius.com/Ceo-19-fanstastique-lyrics');
 for (const world of releaseWorlds) {
  const entry = geniusEntry(world.releaseId), document = geniusEmbedDocument(world.releaseId);
  if (!entry) { assert.equal(document, null); assert.equal(world.geniusId, null); assert.equal(world.geniusUrl, null); }
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
 const sent = [], timers = [], handlers = new Map();
 let disconnected = false;
 const context = vm.createContext({ parent: { postMessage: value => sent.push(value) }, document: { body: {}, querySelector: () => null }, MutationObserver: class { observe() {} disconnect() { disconnected = true; } }, setTimeout: fn => timers.push(fn), addEventListener: (name,handler)=>handlers.set(name,handler) });
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
 const close={type:'ceo:genius',songId:13064095,status:'close'};
 assert.equal(isGeniusEmbedMessage({source:frame,data:close},frame,'original'),true);
 assert.equal(isGeniusEmbedMessage({source:{},data:close},frame,'original'),false);
 assert.equal(isGeniusEmbedMessage({source:frame,data:close},frame,'kritika'),false);
 let prevented=false;
 handlers.get('keydown')({key:'Escape',preventDefault:()=>{prevented=true;}});
 assert.equal(prevented,true);assert.equal(sent.at(-1).status,'close');
});

test('release palette samples reproduce the actual artwork pixels', async () => {
 for (const [id,sample] of Object.entries(releasePaletteSamples)) {
  const {data}=await sharp(`public${sample.source}`).extract(sample.region).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const rgb=[0,1,2].map(channel=>{const values=[];for(let i=channel;i<data.length;i+=3)values.push(data[i]);values.sort((a,b)=>a-b);return values[Math.floor(values.length/2)];});
  const actual='#'+rgb.map(value=>value.toString(16).padStart(2,'0')).join('');
  assert.equal(actual,sample.color,id);
  const world=releaseWorlds.find(world=>world.releaseId===id);
  assert.ok(world.backgroundColor && world.accentColor && world.textColor && world.ambientGradient);
 }
 assert.equal(releasePaletteSamples['bcp-dargent'].source,"/CEO19/BCP D'ARGENT art/IMG_7192.PNG");
 assert.equal(releaseWorlds.find(world=>world.releaseId==='timals').backgroundAsset,'/CEO19/TIMALS/IMG_2887.jpg');
 assert.deepEqual(releaseWorlds.find(world=>world.releaseId==='timals').lyricFragments,[]);
});
