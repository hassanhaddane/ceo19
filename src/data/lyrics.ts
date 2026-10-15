import type { Localized } from '@/types/content';

export interface VerifiedLyrics {
 releaseId: string;
 text: Localized;
 source: string;
}

/** Full lyrics remain on Genius; never copied into the local content model. */
export const lyrics: VerifiedLyrics[] = [];

export const geniusEntries = {
 original: { songId: 13064095, url: 'https://genius.com/Ceo-19-original-lyrics' },
 kritika: { songId: 13063933, url: 'https://genius.com/Ceo-19-kritika-lyrics' },
 fantastique: { songId: 13302636, url: 'https://genius.com/Ceo-19-fanstastique-lyrics' },
 'bcp-dargent': { songId: 14195777, url: 'https://genius.com/Ceo-19-bcp-dargent-lyrics' },
} as const;
export type GeniusEntry = typeof geniusEntries[keyof typeof geniusEntries];
export function geniusEntry(releaseId: string): GeniusEntry | null {
 return Object.hasOwn(geniusEntries, releaseId) ? geniusEntries[releaseId as keyof typeof geniusEntries] : null;
}

/** Short fragments supplied directly by the artist for this release-world brief. */
export const lyricFragments: Record<string, readonly string[]> = {
 original: ['Original Vocodo', 'Soduko', 'PAS DE RESEAU'],
 kritika: ['KRITIKA KRITIKA KRITIKA', 'DU CHOCOLLAT'],
 fantastique: ['Kmaya Fantastaique', 'Roule moi un joint Magique'],
 timals: [],
 'machi-batel': ['MACHI BATEL'],
 'bcp-dargent': ["Pas d'école", 'Khasna l3A9A'],
};
