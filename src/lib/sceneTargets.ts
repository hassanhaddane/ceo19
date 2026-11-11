import { scenes } from '../data/artist.ts';
import type { SectionId } from '@/types/content';

export const sceneOrder:readonly SectionId[]=scenes.map(scene=>scene.id);
export type SceneChapter = SectionId | 'connect';
export const sceneChapterOrder:readonly SceneChapter[] = [...sceneOrder, 'connect'];
export interface SceneTarget { scene:SectionId; anchor:'connect'|null; }
const resourceAnchors = ['biography', 'discography', 'videos', 'media', 'milestones', 'press', 'production', 'contact'];
export function contactResourceAnchor(hash: string) {
 const id = hash.slice(1);
 if (['world', 'world-title', 'world-biography-label'].includes(id)) return 'biography';
 return resourceAnchors.includes(id) ? id : null;
}
/** Legacy contact bookmarks land on the compact footer, outside the three scenes. */
export function resolveSceneTarget(hash:string):SceneTarget|null {
 const id=hash.replace(/^#/,'');
 if(id==='connect'||id==='network'||contactResourceAnchor(hash))return {scene:'archive',anchor:'connect'};
 if(sceneOrder.includes(id as SectionId))return {scene:id as SectionId,anchor:null};
 if(/^(release-|film-)/.test(id))return {scene:'music',anchor:null};
 if(id.startsWith('archive-'))return {scene:'archive',anchor:null};
 return null;
}
export function sceneFromHash(hash:string):SectionId|null { return resolveSceneTarget(hash)?.scene??null; }
export function chapterFromHash(hash: string): SceneChapter | null {
 const target = resolveSceneTarget(hash);
 return target?.anchor ?? target?.scene ?? (hash === '' || hash === '#main' ? 'home' : null);
}
/** A final scene's interior anchor may sit below the last possible scroll offset.
 * Clamp to the actual document end instead of waiting forever for an impossible alignment. */
export function sceneScrollTarget(sectionTop:number,anchorTop:number|null,viewportHeight:number,documentHeight:number,headerClearance=100) {
 const destination=anchorTop===null?sectionTop:Math.max(sectionTop,anchorTop-headerClearance);
 return Math.max(0,Math.min(destination,Math.max(0,documentHeight-viewportHeight)));
}
