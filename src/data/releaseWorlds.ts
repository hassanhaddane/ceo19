import { releases } from './releases.ts';
import { assets } from './assets.ts';
import { geniusEntry, lyricFragments } from './lyrics.ts';
import type { Localized } from '@/types/content';
import type { ParallaxLayer } from '@/lib/visualEffects';

export type WorldMotion = 'signal' | 'impact' | 'haze' | 'crew' | 'split' | 'paper';
export interface ReleaseWorldConfig {
 releaseId: string; title: string; artists: readonly string[]; cover: string | null;
 backgroundColor: string; accentColor: string; textColor: string; ambientGradient: string;
 mood: Localized; motionPreset: WorldMotion; lyricFragments: readonly string[];
 spotifyUrl: string | null; youtubeUrl: string | null; geniusId: number | null; geniusUrl: string | null;
 backgroundAsset: string; backgroundPosition: string; backgroundScale: number;
 backgroundOverlay: string; backgroundGradient: string; backgroundParallax: ParallaxLayer;
 backgroundEffects: WorldMotion; foregroundColor: string;
 backgroundGraphic: string; backgroundGraphicPosition: string;
 ambient: { imagePeriod: number; detailPeriod: number };
}

/** Current filesystem sources, inspected at native dimensions. The PNG stills are
 * opaque screenshots; their enlarged CSS crop excludes player UI, not people. */
const environments = {
 original: {
  backgroundAsset:'/CEO19/Original/portrait.webp', backgroundPosition:'72% 38%', backgroundScale:1.12,
  backgroundOverlay:'linear-gradient(90deg, #080a0ce8, #080a0c45 66%, #080a0c18)',
  backgroundGradient:'linear-gradient(180deg, #080a0c66, transparent 35%, #080a0ce8 100%), linear-gradient(115deg, #173e6070, transparent 72%)',
  backgroundParallax:'atmosphere', backgroundEffects:'signal', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:'/CEO19/Original/portrait.webp', backgroundGraphicPosition:'72% 38%',
 },
 kritika: {
  backgroundAsset:'/CEO19/Kritika/street-close.webp', backgroundPosition:'63% 40%', backgroundScale:1.1,
  backgroundOverlay:'linear-gradient(95deg, #080a0cf2, #080a0c65 55%, #080a0c18)',
  backgroundGradient:'linear-gradient(180deg, #080a0c55, transparent 42%, #080a0cf2), linear-gradient(135deg, #173e6038, transparent 65%)',
  backgroundParallax:'architecture', backgroundEffects:'impact', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:'/CEO19/Kritika/street-close.webp', backgroundGraphicPosition:'63% 40%',
 },
 fantastique: {
  backgroundAsset:'/CEO19/Fanstastique/Pasted 2026-10-16 at 1.23.25 PM.png', backgroundPosition:'50% 52%', backgroundScale:1.3,
  backgroundOverlay:'linear-gradient(90deg, #080a0ce6, #080a0c40 62%, #080a0c30)',
  backgroundGradient:'linear-gradient(180deg, #080a0c66, transparent 42%, #080a0cf0), linear-gradient(120deg, #173e6055, transparent 80%)',
  backgroundParallax:'atmosphere', backgroundEffects:'haze', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:'/CEO19/Fanstastique/Pasted 2026-10-16 at 1.23.25 PM.png', backgroundGraphicPosition:'50% 52%',
 },
 timals: {
  backgroundAsset:'/CEO19/TIMALS/IMG_2887.jpg', backgroundPosition:'50% 34%', backgroundScale:1.1,
  backgroundOverlay:'linear-gradient(90deg, #080a0cf0, #080a0c70 46%, #080a0c20)',
  backgroundGradient:'linear-gradient(180deg, #173e6050, transparent 40%, #080a0cf0), linear-gradient(120deg, #173e6055, transparent 80%)',
  backgroundParallax:'atmosphere', backgroundEffects:'crew', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:'/CEO19/TIMALS/IMG_2903.jpg', backgroundGraphicPosition:'50% 32%',
 },
 'machi-batel': {
  backgroundAsset:'/CEO19/MACHI BATEL/Machi batel.png', backgroundPosition:'30% 48%', backgroundScale:1.24,
  backgroundOverlay:'linear-gradient(90deg, #080a0ce0, #080a0c60 52%, #080a0c25)',
  backgroundGradient:'linear-gradient(180deg, #080a0c55, transparent 42%, #080a0cf0), linear-gradient(110deg, #173e6045, transparent 80%)',
  backgroundParallax:'detail', backgroundEffects:'split', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:'/CEO19/MACHI BATEL/Machi batel.png', backgroundGraphicPosition:'68% 48%',
 },
 'bcp-dargent': {
  backgroundAsset:"/CEO19/BCP D'ARGENT images/IMG_6845.JPG", backgroundPosition:'52% 38%', backgroundScale:1.12,
  backgroundOverlay:'linear-gradient(90deg, #173e60ef, #173e6070 58%, #080a0c30)',
  backgroundGradient:'linear-gradient(180deg, #080a0c55, transparent 40%, #080a0cf0), linear-gradient(115deg, #3572a360, transparent 78%)',
  backgroundParallax:'atmosphere', backgroundEffects:'paper', foregroundColor:'var(--ceo-cream)',
  backgroundGraphic:assets.blueReference, backgroundGraphicPosition:'50% 50%',
 },
} as const satisfies Record<string, Pick<ReleaseWorldConfig, 'backgroundAsset' | 'backgroundPosition' | 'backgroundScale' | 'backgroundOverlay' | 'backgroundGradient' | 'backgroundParallax' | 'backgroundEffects' | 'foregroundColor' | 'backgroundGraphic' | 'backgroundGraphicPosition'>>;
/** Median RGB of the recorded native-pixel patches. Tests resample original files.
 * BCP uses the supplied STOP THE RIOTS print as requested, not a guessed sleeve hue. */
export const releasePaletteSamples = {
 original: { source: assets.releases.original, region: {left:250,top:25,width:100,height:70}, color:'#0d4b6c' },
 kritika: { source: assets.releases.kritika, region: {left:325,top:265,width:45,height:45}, color:'#edddd0' },
 fantastique: { source: assets.releases.fantastique, region: {left:200,top:160,width:70,height:70}, color:'#3af1c1' },
 timals: { source: assets.releases.timals, region: {left:30,top:30,width:70,height:70}, color:'#1977bf' },
 'machi-batel': { source: assets.releases['machi-batel'], region: {left:200,top:55,width:150,height:70}, color:'#3452f7' },
 'bcp-dargent': { source: assets.blueReference, region: {left:150,top:100,width:550,height:600}, color:'#3573a3' },
} as const;
const tonal = (color: string, strength: number) => `color-mix(in srgb,${color} ${strength}%,var(--ceo-black))`;
const soft = (color: string, strength: number) => `color-mix(in srgb,${color} ${strength}%,var(--ceo-cream))`;
const directions: Record<string, { mood: Localized; motion: WorldMotion; depth: number; light: number; position: string }> = {
 original: { mood:{en:'Energy / interruption',fr:'Énergie / interruption'}, motion:'signal',depth:30,light:35,position:'72% 30%' },
 kritika: { mood:{en:'Dark / impact',fr:'Obscurité / impact'}, motion:'impact',depth:2,light:80,position:'68% 55%' },
 fantastique: { mood:{en:'Melancholy / dream',fr:'Mélancolie / rêve'}, motion:'haze',depth:18,light:24,position:'36% 64%' },
 timals: { mood:{en:'Crew / night tension',fr:'Collectif / tension nocturne'}, motion:'crew',depth:32,light:48,position:'78% 38%' },
 'machi-batel': { mood:{en:'Melancholy / distance',fr:'Mélancolie / distance'}, motion:'split',depth:14,light:25,position:'50% 50%' },
 'bcp-dargent': { mood:{en:'Ambition / street',fr:'Ambition / rue'}, motion:'paper',depth:78,light:0,position:'68% 40%' },
};
/** Independent ambient clocks. All source framing and sampled palette data remain authoritative. */
const ambientClocks: Record<WorldMotion, ReleaseWorldConfig['ambient']> = {
 signal:{imagePeriod:24,detailPeriod:8}, impact:{imagePeriod:22,detailPeriod:9},
 haze:{imagePeriod:32,detailPeriod:26}, crew:{imagePeriod:28,detailPeriod:34},
 split:{imagePeriod:30,detailPeriod:24}, paper:{imagePeriod:26,detailPeriod:18},
};
export const releaseWorlds: readonly ReleaseWorldConfig[] = releases.map(release => {
 const direction = directions[release.id], sample = releasePaletteSamples[release.id as keyof typeof releasePaletteSamples].color;
 const genius = geniusEntry(release.id);
 const environment = environments[release.id as keyof typeof environments];
 const backgroundColor = tonal(release.id === 'fantastique' ? 'var(--ceo-blue)' : sample, direction.depth);
 const accentColor = release.id === 'fantastique' ? 'var(--ceo-blue-light)' : release.id === 'machi-batel' ? soft(`color-mix(in srgb,${sample} 25%,var(--ceo-blue))`,45) : soft(sample,direction.light);
 return {
  releaseId:release.id, title:release.title, artists:['CEO1.9',...(release.featuredArtist?[release.featuredArtist]:[])], cover:release.artwork,
  ...environment, backgroundColor, accentColor, textColor:environment.foregroundColor,
  ambientGradient:`radial-gradient(ellipse at ${direction.position},color-mix(in srgb,${accentColor} ${release.id==='fantastique'?12:22}%,transparent),transparent 65%),linear-gradient(125deg,var(--ceo-black),transparent 85%)`,
  mood:direction.mood, motionPreset:direction.motion, ambient:ambientClocks[direction.motion], lyricFragments:lyricFragments[release.id]??[],
  spotifyUrl:release.spotifyUrl??null, youtubeUrl:release.youtubeUrl??null, geniusId:genius?.songId??null, geniusUrl:genius?.url??null,
 };
});
export function releaseWorld(id: string): ReleaseWorldConfig {
 return releaseWorlds.find(world => world.releaseId === id) ?? releaseWorlds[releaseWorlds.length - 1];
}
