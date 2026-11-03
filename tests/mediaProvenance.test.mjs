import test from 'node:test';
import { epkBiography } from '../src/data/epk.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { lyricFragments } from '../src/data/lyrics.ts';
import { worldClips } from '../src/data/worldClips.ts';
import { validateWorldRanges } from '../scripts/prepare-world-clips.mjs';
import { artist } from '../src/data/artist.ts';

test('EPK uses the approved positioning and preserves the ORIGINAL lyric in MUSIC', () => {
 assert.equal(artist.positioning.en,'Local roots. Global reach.');
 assert.equal(artist.positioning.fr,'Ancrage local. Portée globale.');
 assert.ok(lyricFragments.original.includes('PAS DE RESEAU'));
 assert.equal(artist.name,'CEO1.9');
 assert.match(epkBiography.fr,/Samadi, alias CEO1.9/);
 assert.match(epkBiography.fr,/artiste indépendant marocain basé à Fès/);
 assert.match(epkBiography.fr,/rap contemporain international/);
 assert.match(epkBiography.fr,/quotidien marocain/);
 assert.match(epkBiography.fr,/fin 2025/);
 assert.match(epkBiography.en,/independent Moroccan artist based in Fez/);
 assert.match(epkBiography.en,/late 2025/);
 assert.match(epkBiography.en,/fashion and visual storytelling/);
});
test('Extraction rejects out-of-source ranges, duplicate IDs and false curation states', () => {
 const ranges = [0,10,20,30].map((start,i)=>({id:`clip-${i}`,start,duration:4,selection:'reviewed'}));
 assert.equal(validateWorldRanges(ranges,40),ranges);
 assert.throws(()=>validateWorldRanges(ranges.slice(0,3),40));
 for (const invalid of [{start:-1},{start:39},{duration:7},{duration:NaN},{id:'../unsafe'},{id:'clip-1'},{selection:'automatically-curated'}]) {
  assert.throws(()=>validateWorldRanges([{...ranges[0],...invalid},...ranges.slice(1)],40));
 }
});
test('World manifest only names actual web clips and posters, never the full documentary', async () => {
 for (const clip of worldClips) {
  assert.match(clip.src,/^\/media\/world\/[a-z0-9-]+\.mp4$/);
  assert.match(clip.poster,/^\/media\/world\/[a-z0-9-]+\.jpg$/);
  assert.ok(clip.duration>=3 && clip.duration<=6.1);
  assert.ok(Number.isFinite(clip.sourceTime));
  assert.ok((await fs.stat(`public${clip.src}`)).size<3*1024*1024);
  await fs.access(`public${clip.poster}`);
 }
});
