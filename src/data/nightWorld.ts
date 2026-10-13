import type { Locale, SectionId } from '@/types/content';
export type SceneId = 'home' | 'channels' | 'archive' | 'world' | 'connect';
export const nightScenes: {id:SceneId; signal:SectionId; world:'night'|'street-print'|'signal'}[] = [
 {id:'home',signal:'home',world:'night'}, {id:'channels',signal:'music',world:'street-print'},
 {id:'archive',signal:'archive',world:'street-print'}, {id:'world',signal:'world',world:'signal'}, {id:'connect',signal:'connect',world:'night'}
];
// Atmospheric phrases supplied by the artist; never presented as lyrics or factual metadata.
export const punchlines = { home:'PAS DE RÉSEAU', channels:'KHASNA BCP D’ARGENT', archive:'SMS HORS LIGNE' } as const;
export const nightImages = {
 hero:{src:'/images/street.webp',alt:{en:'CEO 1.9 sitting on a white car in front of a facade at night',fr:'CEO 1.9 assis sur une voiture blanche devant une façade de nuit'}},
 club:{src:'/images/ceo_1.9_1788527054_3978775074808290020_7902047543.jpg',alt:{en:'CEO 1.9 at the DJ decks with friends',fr:'CEO 1.9 aux platines avec ses amis'}}
};
export const nightCopy = {
 en:{nav:{home:'Home',channels:'Channels',archive:'Archive',world:'World',connect:'Connect'},night:'Fes after dark',hero:['A new signal','from Fez.'],enter:'Enter the signal',transmission:'Sound / image',listen:'Listen',film:'Watch film',archive:'Street / studio / crew',browse:'Browse the archive',roots:['Local roots.','Global frequency.'],independent:'Independent artist',began:'Official project / late 2025',connect:['Connect','to the signal.'],network:'Production / visual network',previous:'Previous photographs',next:'Next photographs'},
 fr:{nav:{home:'Accueil',channels:'Channels',archive:'Archives',world:'Univers',connect:'Contact'},night:'Fès après la nuit',hero:['Un nouveau signal','de Fès.'],enter:'Entrer dans le signal',transmission:'Son / image',listen:'Écouter',film:'Voir le film',archive:'Rue / studio / crew',browse:'Parcourir les archives',roots:['Racines locales.','Portée globale.'],independent:'Artiste indépendant',began:'Projet officiel / fin 2025',connect:['Connectez-vous','au signal.'],network:'Production / réseau visuel',previous:'Photos précédentes',next:'Photos suivantes'}
} satisfies Record<Locale,unknown>;
