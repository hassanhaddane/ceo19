import { releases } from './releases.ts';
import { geniusEntry, lyricFragments } from './lyrics.ts';
import type { Localized } from '@/types/content';

export type WorldMotion = 'signal' | 'impact' | 'haze' | 'crew' | 'split' | 'paper';
export interface ReleaseWorldConfig {
 id: string; title: string; artists: readonly string[]; coverAsset: string | null;
 accentPreset: string; mood: Localized; motionPreset: WorldMotion; backgroundPreset: string;
 lyricFragments: readonly string[]; spotifyUrl: string | null; youtubeUrl: string | null;
 geniusSongId: number | null; geniusUrl: string | null;
 sceneAsset: { src: string; alt: Localized } | null;
 cinemaBackground: string; cinemaAccent: string; cinemaTypography: 'condensed';
 cinemaMotion: WorldMotion; cinemaPoster: string | null; cinemaAtmosphere: WorldMotion;
}
const directions: Record<string, { accent: string; background: string; mood: Localized; motion: WorldMotion }> = {
 original: { accent: '#98c7ee', background: '#092b4b', mood: { en: 'Energy / interruption', fr: 'Énergie / interruption' }, motion: 'signal' },
 kritika: { accent: '#457aa9', background: '#050b13', mood: { en: 'Dark / impact', fr: 'Obscurité / impact' }, motion: 'impact' },
 fantastique: { accent: '#a8c7df', background: '#102e50', mood: { en: 'Melancholy / dream', fr: 'Mélancolie / rêve' }, motion: 'haze' },
 timals: { accent: '#6697bc', background: '#081d2b', mood: { en: 'Crew / night tension', fr: 'Collectif / tension nocturne' }, motion: 'crew' },
 'machi-batel': { accent: '#7298bd', background: '#0b182a', mood: { en: 'Melancholy / distance', fr: 'Mélancolie / distance' }, motion: 'split' },
 'bcp-dargent': { accent: '#a8c7df', background: 'var(--ceo-blue)', mood: { en: 'Ambition / street', fr: 'Ambition / rue' }, motion: 'paper' },
};
export const releaseWorlds: readonly ReleaseWorldConfig[] = releases.map(release => {
 const direction = directions[release.id];
 const genius = geniusEntry(release.id);
 return {
  id: release.id, title: release.title, artists: ['CEO1.9', ...(release.featuredArtist ? [release.featuredArtist] : [])],
  coverAsset: release.artwork, accentPreset: direction.accent, mood: direction.mood,
  motionPreset: direction.motion, backgroundPreset: direction.background,
  lyricFragments: lyricFragments[release.id] ?? [], spotifyUrl: release.spotifyUrl ?? null, youtubeUrl: release.youtubeUrl ?? null,
  geniusSongId: genius?.songId ?? null, geniusUrl: genius?.url ?? null,
  sceneAsset: release.id === 'timals' ? { src: '/CEO19/TIMALS/IMG_2887.jpg', alt: { en: 'CEO1.9 in blue among a group during the TIMALS shoot', fr: 'CEO1.9 en bleu dans un groupe pendant le tournage de TIMALS' } } : null,
  cinemaBackground: direction.background, cinemaAccent: direction.accent, cinemaTypography: 'condensed',
  cinemaMotion: direction.motion, cinemaPoster: release.artwork, cinemaAtmosphere: direction.motion,
 };
});
export function releaseWorld(id: string): ReleaseWorldConfig {
 return releaseWorlds.find(world => world.id === id) ?? releaseWorlds[releaseWorlds.length - 1];
}
