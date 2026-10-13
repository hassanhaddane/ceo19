import {gallery} from './gallery.ts';
import {editorialImages} from './editorial.ts';
import type {GalleryImage,Locale} from '@/types/content';
// Real source photographs, never claims about who is in the studio or their relationships.
const photo=(id:string)=>{const item=gallery.find(item=>item.id===id&&item.type==='image') as GalleryImage;return {src:item.src,alt:item.alt,crop:item.crop??'50% 50%'};};
export const worldImages={artist:{...editorialImages.world,crop:'48% 33%'},studio:photo('studio'),passage:photo('street')};
export const worldAssets={chrome:'/images/world/chrome-ring.png'};
export const worldSceneConfig={parallax:12};
export type WorldDetail='reflection'|'sound'|'passage'|'exposure'|'mark';
export const worldSceneCopy={
 en:{title:'World 1.9',location:'Fez / Morocco',reflection:'Reveal silver reflection',sound:'Activate the recording waveform',passage:'Reveal the street photograph',exposure:'Expose the artist photograph',mark:'Reveal the HKZ production mark'},
 fr:{title:'World 1.9',location:'Fès / Maroc',reflection:'Révéler le reflet argenté',sound:'Activer la forme d’onde',passage:'Révéler la photo de rue',exposure:'Exposer le portrait de l’artiste',mark:'Révéler le logo de production HKZ'}
} satisfies Record<Locale,unknown>;
