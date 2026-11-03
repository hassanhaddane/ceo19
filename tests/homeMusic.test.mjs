import test from 'node:test';
import assert from 'node:assert/strict';
import { releases, featuredRelease, homeReleases } from '../src/data/releases.ts';
import { releaseAccess, streamingProfiles } from '../src/lib/releaseAccess.ts';
import { isHomeReading, mobileHomeWheelEnd, mobileHomeExit } from '../src/lib/sceneScroll.ts';

test('Home uses the same six catalogue objects, featured first, without guessing a missing date', () => {
 assert.deepEqual(homeReleases.map(item => item.id), ['bcp-dargent', 'machi-batel', 'timals', 'fantastique', 'kritika', 'original']);
 assert.equal(new Set(homeReleases).size, releases.length);
 assert.ok(homeReleases.every(item => releases.includes(item) && item.artwork));
 assert.equal(homeReleases[0], featuredRelease);
 assert.equal(featuredRelease.date, null);
 assert.equal(releaseAccess(featuredRelease).play, 'https://open.spotify.com/intl-fr/album/1sS9oT0NO7VIpaAey3AQFu');
});
test('all six releases expose their supplied direct destinations', () => {
 for (const release of releases) {
  const access = releaseAccess(release);
  assert.equal(access.play, release.spotifyUrl);
  assert.equal(access.watch, release.youtubeUrl);
  assert.equal(access.playIsArtist, false);
 }
 assert.deepEqual(streamingProfiles.map(profile => profile.platform), ['YouTube', 'Spotify']);
});
test('a missing or malformed release source falls back honestly to artist Spotify, never a fabricated track or video', () => {
 const access = releaseAccess({...featuredRelease, platforms: [], spotifyUrl: 'https://example.com/track/fake', youtubeUrl: null});
 assert.equal(access.play, 'https://open.spotify.com/intl-fr/artist/6pI0ipVy6K41YWoHqZVowd');
 assert.equal(access.playIsArtist, true);
 assert.equal(access.watch, null);
});
test('long mobile swipes keep the last Home links readable until MUSIC reaches the top', () => {
 const home = {height:1478, top:-759, bottom:719};
 assert.equal(isHomeReading(390,844,home,null),true);
 assert.equal(isHomeReading(390,844,{...home,top:-1470,bottom:8},null),true);
 assert.equal(isHomeReading(390,844,{...home,top:-1478,bottom:0},null),false);
 assert.equal(isHomeReading(390,844,{...home,top:-1100,bottom:378},null),true);
});
test('explicit scene navigation, desktop and a viewport-sized Home keep normal scene snap', () => {
 const home = {height:1478, top:0, bottom:1478};
 assert.equal(isHomeReading(390,844,home,'music'),false);
 assert.equal(isHomeReading(390,844,home,'home'),true);
 assert.equal(isHomeReading(1280,720,home,null),false);
 assert.equal(isHomeReading(390,844,{height:844,top:0,bottom:844},null),false);
 assert.equal(isHomeReading(390,844,undefined,null),false);
});
test('a long mobile wheel burst pauses at the hub end, while a fresh gesture can reach MUSIC', () => {
 assert.equal(mobileHomeWheelEnd(390,844,0,1478,0,1),634);
 assert.equal(mobileHomeWheelEnd(390,844,0,1478,591,1),634);
 assert.equal(mobileHomeWheelEnd(390,844,0,1478,634,1),null);
 assert.equal(mobileHomeWheelEnd(390,844,0,1478,824,1),null);
 assert.equal(mobileHomeWheelEnd(390,844,0,1478,300,-1),null);
 assert.equal(mobileHomeWheelEnd(1280,720,0,720,0,1),null);
});

test('a fresh short exit gesture settles on Music without pulling away unread Home links', () => {
 assert.equal(mobileHomeExit(390,844,0,1478,634,887,1,253,80),1478);
 assert.equal(mobileHomeExit(390,844,0,1478,887,1140,1,253,80),1478);
 assert.equal(mobileHomeExit(390,844,0,1478,518,634,1,253,80),null);
 assert.equal(mobileHomeExit(390,844,0,1478,634,660,1,26,80),null);
 assert.equal(mobileHomeExit(390,844,0,1478,634,500,-1,253,80),null);
 assert.equal(mobileHomeExit(390,844,0,1478,634,1478,1,844,80),null);
 assert.equal(mobileHomeExit(390,844,0,1478,1500,1700,1,200,80),null);
 assert.equal(mobileHomeExit(1280,720,0,720,0,250,1,250,80),null);
});
