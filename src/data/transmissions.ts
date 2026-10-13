import type { Locale } from '@/types/content';
export const transmissionCopy = {
 en:{listen:'Listen',watch:'Watch',select:'Select channel',previous:'Previous channel',next:'Next channel',index:'Channel selector',external:'Open on',hint:'Use arrow keys to select a release, or swipe the artwork. Vertical scrolling continues through the page.',pending:'Artwork to follow',production:'Production by',fragment:'Next visual fragment'},
 fr:{listen:'Écouter',watch:'Voir',select:'Choisir le canal',previous:'Canal précédent',next:'Canal suivant',index:'Sélecteur de canaux',external:'Ouvrir sur',hint:'Utilisez les flèches pour choisir une sortie ou balayez le visuel. Le défilement vertical parcourt la page.',pending:'Visuel à venir',production:'Production par',fragment:'Fragment visuel suivant'},
} satisfies Record<Locale, Record<string,string>>;
