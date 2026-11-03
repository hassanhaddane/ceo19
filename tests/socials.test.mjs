import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { socials, channelProduction } from '../src/data/socials.ts';
import { assets } from '../src/data/assets.ts';

test('the shared artist/social catalogue contains the supplied destinations and HKZ accounts',()=>{
 assert.deepEqual(socials.map(social=>social.url),[
  'https://www.instagram.com/ceo_1.9/',
  'https://www.tiktok.com/@ceo1.9',
  'https://www.youtube.com/channel/UC-oWazYr0IIBXWhrwRPzulw',
  'https://open.spotify.com/intl-fr/artist/6pI0ipVy6K41YWoHqZVowd',
 ]);
 assert.equal(channelProduction.instagram,'https://www.instagram.com/hkzprod/');
 assert.equal(channelProduction.youtube,'https://www.youtube.com/@hkzprod');
});
test('each artist destination has a real local brand glyph and the official identity assets',async()=>{
 for(const social of socials){
  const svg=await fs.readFile(`public/icons/${social.id}.svg`,'utf8');
  assert.ok(svg.includes('<svg') && svg.includes('<path'));
 }
 assert.equal(assets.productionLogo,'/brands/hkz.png');
 assert.equal(assets.secondaryLogo,'/CEO19/Logo/LOGO CEO.jpg');
});
