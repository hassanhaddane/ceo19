import { worldClips } from './worldClips.ts';

/** Reviewed order from the preserved CEO DOCCCCC.mp4. Four existing 720p,
 * four-second H.264 excerpts; unused exports remain available for provenance. */
export const archiveClipIds = ['stage-side', 'crowd-front', 'performance', 'stage-depth'] as const;
export const archiveClips = archiveClipIds.map(id => {
 const clip = worldClips.find(item => item.id === id);
 if (!clip) throw new Error(`Missing reviewed documentary excerpt: ${id}`);
 return clip;
});
