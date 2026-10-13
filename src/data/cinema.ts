import {channelWorlds,defaultChannelWorld} from './channelWorlds.ts';
import type {CinemaArtDirection,Locale,Release} from '@/types/content';
/** Art direction, not playback delay. The loading cover stays only until the official player is ready. */
export const cinemaDirections:Record<string,Pick<CinemaArtDirection,'entry'|'entryDuration'|'exitDuration'>>={
 original:{entry:'offline',entryDuration:880,exitDuration:520},
 kritika:{entry:'impact',entryDuration:820,exitDuration:480},
 fantastique:{entry:'haze',entryDuration:1200,exitDuration:680},
 timals:{entry:'shutter',entryDuration:1100,exitDuration:620},
 'machi-batel':{entry:'split',entryDuration:1320,exitDuration:740},
 'bcp-dargent':{entry:'poster',entryDuration:1080,exitDuration:620}
};
export const cinemaTiming={reducedEntry:160,reducedExit:160,phraseStart:.16,phraseEnd:.62,doorsStart:.5} as const;
export function resolveCinemaWorld(release:Release|undefined,override?:Partial<CinemaArtDirection>):CinemaArtDirection{
 const world=release??defaultChannelWorld;
 const identity=release?channelWorlds[release.id]??world:world;
 const background=identity.backgroundColor??defaultChannelWorld.backgroundColor!;
 const accent=release?.id==='bcp-dargent'?'var(--color-blue)':identity.accentColor??'var(--color-blue)';
 return {
  cinemaBackground:`color-mix(in srgb, ${background} 30%, var(--color-black))`,
  cinemaAccent:accent,cinemaForeground:identity.foregroundColor??'var(--color-cream)',cinemaGlow:accent,
  ...(cinemaDirections[release?.id??'']??{entry:'poster',entryDuration:1080,exitDuration:620}),
  punchline:release?.id==='kritika'?'KRITIKA KRITIKA KRITIKA':identity.punchlines?.[0]??null,
  ...override
 };
}
export const cinemaCopy={
 en:{close:'Close cinema',loading:'Loading film',ready:'Film ready',failed:'Film unavailable here',previous:'Previous film',next:'Next world',external:'Watch on YouTube',official:'Official video',hint:'Use left and right arrow keys to change films. Escape closes cinema.',cinema:'Cinema / CEO 1.9'},
 fr:{close:'Fermer le cinéma',loading:'Chargement du film',ready:'Film prêt',failed:'Film indisponible ici',previous:'Film précédent',next:'Monde suivant',external:'Voir sur YouTube',official:'Clip officiel',hint:'Utilisez les flèches gauche et droite pour changer de film. Échap ferme le cinéma.',cinema:'Cinéma / CEO 1.9'}
} satisfies Record<Locale,unknown>;
