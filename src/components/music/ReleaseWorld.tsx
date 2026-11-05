'use client';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import type { ReleaseWorldConfig } from '@/data/releaseWorlds';
import { useSignalMotion } from '@/lib/signalMotion';
import { useSceneState } from '@/lib/sceneNavigation';
import { visualEffects } from '@/lib/visualEffects';
import { useEntryExperience } from '../visuals/VisualExperience';
import { ReleaseBackground } from './ReleaseBackground';
import { useWorldActivity } from './useWorldActivity';

/** The incoming environment keeps its DOM key when it becomes the committed world.
 * Its opacity, palette and sleeves all read the same transport progress. */
export function ReleaseWorld({ world, incomingWorld, worldRef, children, direction }: { world: ReleaseWorldConfig; incomingWorld: ReleaseWorldConfig | null; worldRef: RefObject<HTMLDivElement | null>; children: ReactNode; direction: number }) {
 const motion = useSignalMotion(), scene = useSceneState(), entry = useEntryExperience();
 const visible = useWorldActivity(worldRef);
 const active = scene.active === 'music' && !!entry?.entered;
 const next = incomingWorld ?? world;
 const style = {
  '--release-bg-from':world.backgroundColor, '--release-bg-to':next.backgroundColor,
  '--release-accent-from':world.accentColor, '--release-accent-to':next.accentColor, '--release-text':world.foregroundColor,
  '--release-duration':`${motion?840:visualEffects.releases.reduced}ms`, '--release-fragments':`${visualEffects.releases.fragments}ms`,
  '--fragment-count':Math.max(1,world.lyricFragments.length), '--release-direction':direction,
 } as CSSProperties;
 return <div ref={worldRef} className="release-world" style={style} data-release={world.releaseId} data-incoming={incomingWorld?.releaseId} data-treatment={world.motionPreset} data-motion={motion} data-active={active} data-ambient={active && motion && visible && !scene.menuOpen} data-transitioning={!!incomingWorld}>
  {[world,...(incomingWorld?[incomingWorld]:[])].map(environment=><div key={environment.releaseId} className="release-environment-layer" data-layer={environment.releaseId===world.releaseId?'current':'incoming'}><ReleaseBackground world={environment}/></div>)}
  {active && motion && <div key={`lyrics-${world.releaseId}`} className="release-fragments" aria-hidden="true">{world.lyricFragments.map((fragment,index)=><span key={fragment} style={{'--fragment-index':index} as CSSProperties}>{fragment}</span>)}</div>}
  {children}
 </div>;
}
