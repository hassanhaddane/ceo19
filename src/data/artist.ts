import type { Artist, SectionId, Localized } from '@/types/content';
export const artist: Artist = {
 projectBegan: {en:'Late 2025',fr:'Fin 2025'},
 name: 'CEO1.9', firstName: 'Samadi', origin: { en: 'Fez, Morocco', fr: 'Fès, Maroc' },
 positioning: { en: 'Local roots. Global reach.', fr: 'Ancrage local. Portée globale.' },
};

/** Public scenes only. EPK and Shop are independent locale routes. */
export const scenes = [
 { number: '01', navigationSurface: 'dark', id: 'home', label: { en: 'Home', fr: 'Accueil' } },
 { number: '02', navigationSurface: 'dark', id: 'music', label: { en: 'Music', fr: 'Musique' } },
 { number: '03', navigationSurface: 'dark', id: 'archive', label: { en: 'Archive', fr: 'Archives' } },
] as const satisfies readonly { number: string; navigationSurface: 'dark' | 'cream'; id: SectionId; label: Localized }[];

export const sceneCopy = {
 en: { explore: 'Explore', listen: 'Listen', watch: 'Watch', music: 'Music', catalogue: 'Sound / image', archive: 'Archive', archiveNote: 'Street / studio / stage', contact: 'Booking / press / partnerships', origin: 'Fez / Morocco' },
 fr: { explore: 'Explorer', listen: 'Écouter', watch: 'Voir', music: 'Musique', catalogue: 'Son / image', archive: 'Archives', archiveNote: 'Rue / studio / scène', contact: 'Booking / presse / partenariats', origin: 'Fès / Maroc' },
} as const;

/** Intro is an overlay, never a fifth document scroll stop. */
export const introScene = { number: '00', id: 'intro', label: { en: 'Intro', fr: 'Intro' } } as const;
