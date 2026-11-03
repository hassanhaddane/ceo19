import { scenes } from '../data/artist.ts';
import type { SectionId } from '@/types/content';

export const sceneOrder:readonly SectionId[]=scenes.map(scene=>scene.id);
export interface SceneTarget { scene:SectionId; anchor:'connect'|null; }
/** Legacy contact bookmarks land on the compact footer, outside the three scenes. */
export function resolveSceneTarget(hash:string):SceneTarget|null {
 const id=hash.replace(/^#/,'');
 if(id==='connect'||id==='network')return {scene:'archive',anchor:'connect'};
 if(sceneOrder.includes(id as SectionId))return {scene:id as SectionId,anchor:null};
 if(/^(release-|film-)/.test(id))return {scene:'music',anchor:null};
 if(id.startsWith('archive-'))return {scene:'archive',anchor:null};
 return null;
}
export function sceneFromHash(hash:string):SectionId|null { return resolveSceneTarget(hash)?.scene??null; }
/** A final scene's interior anchor may sit below the last possible scroll offset.
 * Clamp to the actual document end instead of waiting forever for an impossible alignment. */
export function sceneScrollTarget(sectionTop:number,anchorTop:number|null,viewportHeight:number,documentHeight:number,headerClearance=100) {
 const destination=anchorTop===null?sectionTop:Math.max(sectionTop,anchorTop-headerClearance);
 return Math.max(0,Math.min(destination,Math.max(0,documentHeight-viewportHeight)));
}
