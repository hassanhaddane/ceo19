import {interactionPhrases as phrases} from './interactionPhrases.ts';
import type { ChannelArtDirection } from '@/types/content';
/** Creative directions supplied by the artist. Palettes sampled visually from the actual covers.
 * BCP uses the supplied CEO print identity alongside its photographic cover.
 * These mood labels and phrases are art direction, never inferred credits or biography. */
export const channelWorlds:Record<string,ChannelArtDirection> = {
 original:{channel:'CH.01',mood:{en:'Energy / interruption',fr:'Énergie / interruption'},accentColor:'#e6b17b',backgroundColor:'#102c32',foregroundColor:'#f0e5d3',visualMode:'interrupted',punchlines:[phrases.offline,'Original Vocodo','Sudoku'],motionProfile:'snap',textureMode:'cut',videoId:'Q6KDTbOIsX8'},
 kritika:{channel:'CH.02',mood:{en:'Impact / metal',fr:'Impact / métal'},accentColor:'#d59b65',backgroundColor:'#100e0c',foregroundColor:'#ece4d7',visualMode:'sharp',punchlines:['KRITIKA',phrases.chocolate],motionProfile:'cut',textureMode:'metal',videoId:'7SMjf3VtAy8'},
 fantastique:{channel:'CH.03',mood:{en:'Melancholy / dream state',fr:'Mélancolie / état de rêve'},accentColor:'#70c9ad',backgroundColor:'#082e26',foregroundColor:'#edf3e8',visualMode:'haze',punchlines:[phrases.fantastique,phrases.magique],motionProfile:'float',textureMode:'glass',videoId:'ZC7KdZrPafY'},
 timals:{channel:'CH.04',mood:{en:'Loyalty / night tension',fr:'Loyauté / tension nocturne'},accentColor:'#adc5cd',backgroundColor:'#103b55',foregroundColor:'#e7e5d7',visualMode:'cluster',punchlines:[],motionProfile:'heavy',textureMode:'fabric',videoId:'9LiaS-4-bXo',sceneImage:{src:'/images/crowd.webp',alt:{en:'CEO 1.9 with the crowd at a live performance',fr:'CEO 1.9 avec le public lors d’une performance'},crop:'50% 40%'}},
 'machi-batel':{channel:'CH.05',mood:{en:'Melancholy / distance',fr:'Mélancolie / distance'},accentColor:'#d1c279',backgroundColor:'#231d2c',foregroundColor:'#ede6e7',visualMode:'dual',punchlines:[phrases.machi],motionProfile:'cinematic',textureMode:'shadow',videoId:'w75ypBVhefs'},
 'bcp-dargent':{channel:'CH.06',mood:{en:'Ambition / raw print',fr:'Ambition / impression brute'},accentColor:'var(--color-silver)',backgroundColor:'var(--color-blue)',foregroundColor:'var(--color-cream)',visualMode:'chrome',punchlines:[phrases.argent],motionProfile:'press',textureMode:'paper',videoId:'QprpeYkvZFM'},
};
export const defaultChannelWorld:ChannelArtDirection={channel:null,mood:null,accentColor:'var(--color-blue)',backgroundColor:'var(--color-black)',foregroundColor:'var(--color-cream)',visualMode:'chrome',punchlines:[],motionProfile:'press',textureMode:'paper',videoId:null};
