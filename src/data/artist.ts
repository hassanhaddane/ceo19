import type { Artist, SectionId, Localized } from '@/types/content';
export const artist: Artist = {
 projectBegan: {en:'Late 2025',fr:'Fin 2025'},
 name: 'CEO1.9', firstName: 'Samadi', origin: { en: 'Fez, Morocco', fr: 'Fès, Maroc' },
 positioning: { en: 'A new signal from Fez.', fr: 'Un nouveau signal de Fès.' },
 biography: {
 en: 'Samadi, aka CEO1.9, is an independent Moroccan artist from Fez. His universe connects contemporary international rap with Moroccan daily life, street culture, fashion and visual storytelling.',
 fr: 'Samadi, alias CEO1.9, est un artiste indépendant marocain de Fès. Son univers connecte le rap contemporain international au quotidien marocain, à la culture de rue, à la mode et à la narration visuelle.'
 }
};

/** The five public scenes. Navigation and section state derive from this one order. */
export const scenes = [
 { id: 'home', label: { en: 'Home', fr: 'Accueil' } },
 { id: 'music', label: { en: 'Music', fr: 'Musique' } },
 { id: 'archive', label: { en: 'Archive', fr: 'Archives' } },
 { id: 'world', label: { en: 'World', fr: 'Univers' } },
 { id: 'connect', label: { en: 'Connect', fr: 'Contact' } },
] as const satisfies readonly { id: SectionId; label: Localized }[];

export const sceneCopy = {
 en: { explore: 'Explore', listen: 'Listen', watch: 'Watch', music: 'Music', catalogue: 'Sound / image', archive: 'Archive', archiveNote: 'Street / studio / stage', world: ['From Fez.', 'To the world.'], connect: 'Connect', contact: 'Booking / press / partnerships', origin: 'Fez / Morocco' },
 fr: { explore: 'Explorer', listen: 'Écouter', watch: 'Voir', music: 'Musique', catalogue: 'Son / image', archive: 'Archives', archiveNote: 'Rue / studio / scène', world: ['Depuis Fès.', 'Vers le monde.'], connect: 'Contact', contact: 'Booking / presse / partenariats', origin: 'Fès / Maroc' },
} as const;
