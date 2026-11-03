import type { Release } from '../types/content.ts';
import { socials } from '../data/socials.ts';
import { playableSources } from '../components/music/musicSources.ts';

/** Artist destinations and release destinations have distinct, honest labels. */
export const streamingProfiles = socials.filter(item => ['Spotify', 'YouTube'].includes(item.platform));
export function releaseAccess(release: Release) {
 const sources = playableSources(release);
 const spotify = sources.find(source => source.kind === 'Spotify');
 const youtube = sources.find(source => source.kind === 'YouTube');
 return {
  play: spotify?.url ?? streamingProfiles.find(profile => profile.platform === 'Spotify')?.url ?? null,
  playIsArtist: !spotify,
  watch: youtube?.url ?? null,
 };
}
