import test from 'node:test';
import assert from 'node:assert/strict';
import { releases, featuredRelease, homeReleases } from '../src/data/releases.ts';
import { releaseAccess, streamingProfiles } from '../src/lib/releaseAccess.ts';

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
