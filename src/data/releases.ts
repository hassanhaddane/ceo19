import { assets } from './assets.ts';
import type { Release } from '@/types/content';
const release = (id: string, title: string, date: string | null, featuredArtist: string | null = null): Release => ({ id, title, date, featuredArtist, artwork: null, platforms: [], duration: null, credits: null, audioPreviewUrl: null, spotifyUrl: null, youtubeUrl: null });
export const releases: Release[] = [
 { ...release('original', 'ORIGINAL', '2025-10-31'), artwork: assets.releases['original'], spotifyUrl: 'https://open.spotify.com/album/6fbb8jE375XukMrc1P07Mx', youtubeUrl: 'https://www.youtube.com/watch?v=Q6KDTbOIsX8' },
 { ...release('kritika', 'KRITIKA', '2026-01-02'), artwork: assets.releases['kritika'], spotifyUrl: 'https://open.spotify.com/album/5K6jyORnYTaOEqoqLVkTBR', youtubeUrl: 'https://www.youtube.com/watch?v=7SMjf3VtAy8' },
 { ...release('fantastique', 'FANTASTIQUE', '2026-03-24'), artwork: assets.releases['fantastique'], spotifyUrl: 'https://open.spotify.com/track/00oXokBv1uYCaVZ0CZnEly', youtubeUrl: 'https://www.youtube.com/watch?v=ZC7KdZrPafY' },
 { ...release('timals', 'TIMALS', '2026-05-22'), artwork: assets.releases['timals'], spotifyUrl: 'https://open.spotify.com/album/2zupVGpwbgI6JqjLNrE0Ub', youtubeUrl: 'https://www.youtube.com/watch?v=9LiaS-4-bXo' },
 { ...release('machi-batel', 'MACHI BATEL', '2026-06-04', 'TFLOW'), artwork: assets.releases['machi-batel'], spotifyUrl: 'https://open.spotify.com/album/3Yd9iZvIUZi0lfuDUNgpyu', youtubeUrl: 'https://www.youtube.com/watch?v=w75ypBVhefs' },
 { ...release('bcp-dargent', "BCP D’ARGENT", null), artwork: assets.releases['bcp-dargent'], spotifyUrl: 'https://open.spotify.com/intl-fr/album/1sS9oT0NO7VIpaAey3AQFu', youtubeUrl: 'https://www.youtube.com/watch?v=QprpeYkvZFM', platforms: [
 { platform: 'Spotify', url: 'https://open.spotify.com/intl-fr/album/1sS9oT0NO7VIpaAey3AQFu' },
 { platform: 'YouTube', url: 'https://www.youtube.com/watch?v=QprpeYkvZFM' }
 ] }
];
export const featuredRelease = releases.find(item => item.id === 'bcp-dargent')!;
/** Featured first, then the existing catalogue in reverse editorial order. No copied metadata. */
export const homeReleases = [featuredRelease, ...releases.toReversed().filter(item => item !== featuredRelease)];
/** Scene-only hashes preserve the current selection; only a release hash selects a sleeve. */
export function releaseFromHash(hash: string): Release | null {
 return releases.find(item => hash === `#release-${item.id}` || hash === `#film-${item.id}`) ?? null;
}
