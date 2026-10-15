'use client';
import Image from 'next/image';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { assetUrl } from '@/data/assets';
import type { ReleaseWorldConfig } from '@/data/releaseWorlds';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';

/** One scene, one declarative identity. The world shell survives release changes. */
export function ReleaseWorld({ world, children }: { world: ReleaseWorldConfig; children: ReactNode }) {
 const motion = useSignalMotion();
 const style = { '--release-bg': world.backgroundPreset, '--release-accent': world.accentPreset, '--release-duration': `${visualEffects.releases.duration}ms`, '--release-retract': `${visualEffects.releases.retract}ms`, '--release-emerge': `${visualEffects.releases.duration-visualEffects.releases.retract}ms` } as CSSProperties;
 return <div className="release-world" style={style} data-release={world.id} data-treatment={world.motionPreset} data-motion={motion}>
  <div className="release-atmosphere" data-parallax="atmosphere" aria-hidden="true"/>
  <div className="release-geometry" key={world.id} aria-hidden="true"><svg viewBox="0 0 1000 800" preserveAspectRatio="none"><path d="M840 0H670l-90 180 200 140-90 320h310V0Z" fill="currentColor"/></svg></div>
  {world.sceneAsset && <div className="release-crew-image" aria-hidden="true"><Image src={assetUrl(world.sceneAsset.src)} alt="" fill sizes="(max-width:767px) 100vw, 70vw"/></div>}
  {motion && world.lyricFragments.length > 0 && <div key={`fragment-${world.id}`} className="release-fragment" aria-hidden="true">{world.lyricFragments[0]}</div>}
  {children}
 </div>;
}

/** Retract the outgoing sleeve, then reveal the incoming one; rapid changes cancel old timers. */
export function ReleaseWorldArtwork({ world }: { world: ReleaseWorldConfig }) {
 const motion = useSignalMotion();
 const [visual, setVisual] = useState({ current: world, pending: world, phase: 'idle' });
 if (visual.pending.id !== world.id) setVisual({ current: motion ? visual.current : world, pending: world, phase: motion ? 'outgoing' : 'incoming' });
 useEffect(() => {
  const incoming = setTimeout(() => setVisual({ current: world, pending: world, phase: 'incoming' }), motion ? visualEffects.releases.retract : 0);
  const settled = setTimeout(() => setVisual({ current: world, pending: world, phase: 'idle' }), motion ? visualEffects.releases.duration : visualEffects.releases.reduced);
  return () => { clearTimeout(incoming); clearTimeout(settled); };
 }, [world, motion]);
 return <figure className="deck-artwork world-artwork" data-phase={visual.phase} data-treatment={world.motionPreset} aria-busy={visual.phase === 'outgoing'}>
  {visual.current.coverAsset ? <Image key={visual.current.id} src={assetUrl(visual.current.coverAsset)} alt={`${visual.current.title} — ${visual.current.artists.join(' / ')}`} fill sizes="(max-width:767px) 70vw, 400px" draggable={false}/> : <figcaption>{visual.current.title}</figcaption>}
 </figure>;
}
