import type { Localized } from '@/types/content';
import { releaseWorlds } from './releaseWorlds.ts';

export interface WorldMapAsset { src: string; width: number; height: number; alt: Localized; }
/** No supplied aerial image exists in this checkout. Add the approved image to
 * public/CEO19/WORLD/, inventory it, then set its exact original path/dimensions here.
 * Never resolve this slot to a portrait, generated map, or unverified screenshot. */
export const worldMapAsset: WorldMapAsset | null = null;

const fragments: Record<string, readonly string[]> = {
 original: ['PAS DE RESEAU'], kritika: ['KRITIKA KRITIKA KRITIKA'],
 fantastique: ['Kmaya Fantastaique', 'Roule moi un joint Magique'], timals: [],
 'machi-batel': ['MACHI BATEL'], 'bcp-dargent': ["Pas d'école", 'Khasna l3A9A'],
};
/** The music worlds supply identity only: no covers or photographic assets. */
export const worldModes = releaseWorlds.map(world => ({
 id: world.id, title: world.title, treatment: world.motionPreset,
 accent: world.accentPreset, background: world.backgroundPreset, fragments: fragments[world.id],
}));
export const worldArtworkCopy = {
 en: { location: 'FEZ / MOROCCO', select: 'Explore a release world', missing: 'AERIAL IMAGE PENDING', pending: 'The supplied neighborhood image has not been added.', replay: 'Replay visual gesture', field: 'Interactive architectural field' },
 fr: { location: 'FÈS / MAROC', select: 'Explorer un univers musical', missing: 'VUE AÉRIENNE EN ATTENTE', pending: 'L’image du quartier n’a pas encore été ajoutée.', replay: 'Rejouer le geste visuel', field: 'Composition architecturale interactive' },
} as const;
