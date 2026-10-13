import test from 'node:test';
import assert from 'node:assert/strict';
import {linkEvent} from '../src/lib/analytics.ts';
test('analytics classifies only confirmed provider hosts and contact links',()=>{
 assert.equal(linkEvent('https://open.spotify.com/album/real'),'spotify_click');
 assert.equal(linkEvent('https://www.youtube.com/watch?v=real'),'youtube_click');
 assert.equal(linkEvent('https://www.instagram.com/ceo_1.9/'),'social_click');
 assert.equal(linkEvent('mailto:CEO1.9CONTACT@GMAIL.COM'),'contact_click');
 assert.equal(linkEvent('/en/press'),null);
 assert.equal(linkEvent('https://open.spotify.com.example.com/album/real'),null);
});
