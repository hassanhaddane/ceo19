import type { Locale } from '@/types/content';
export const releaseCopy = {
 en:{listen:'Listen',watch:'Watch',select:'Select release',previous:'Previous release',next:'Next release',index:'Release selector',external:'Open on',hint:'Use arrow keys to select a release, or swipe the artwork. Vertical scrolling continues through the page.',pending:'Artwork to follow',production:'Production by',fragment:'Next visual fragment'},
 fr:{listen:'Écouter',watch:'Voir',select:'Choisir la sortie',previous:'Sortie précédente',next:'Sortie suivante',index:'Sélecteur de sorties',external:'Ouvrir sur',hint:'Utilisez les flèches pour choisir une sortie ou balayez le visuel. Le défilement vertical parcourt la page.',pending:'Visuel à venir',production:'Production par',fragment:'Fragment visuel suivant'},
} satisfies Record<Locale, Record<string,string>>;
