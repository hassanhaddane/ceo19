'use client';
import Image from 'next/image';
import { useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Locale } from '@/types/content';
import { assetUrl } from '@/data/assets';
import { worldMapAsset, worldModes, worldArtworkCopy } from '@/data/worldArtwork';
import { visualEffects } from '@/lib/visualEffects';
import { useSignalMotion } from '@/lib/signalMotion';
import { useWorldField } from '../world/useWorldField';
import { FezArchitecture } from '../visuals/FezArchitecture';

export function WorldExperience({ locale }: { locale: Locale }) {
 const [selection, setSelection] = useState({ index: 5, run: 0 });
 const field = useRef<HTMLDivElement>(null), tabs = useRef<(HTMLButtonElement | null)[]>([]);
 const motion = useSignalMotion(), copy = worldArtworkCopy[locale], mode = worldModes[selection.index];
 useWorldField(field, motion);
 const select = (index: number, replay = false) => setSelection(current => current.index === index && !replay ? current : { index, run: current.run + 1 });
 const keyboard = (event: KeyboardEvent) => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault(); event.stopPropagation();
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? worldModes.length - 1 : (selection.index + (event.key === 'ArrowRight' ? 1 : -1) + worldModes.length) % worldModes.length;
  select(index); tabs.current[index]?.focus({ preventScroll: true });
 };
 return <section id="world" tabIndex={-1} className="v3-scene world-artwork" aria-labelledby="world-title" data-treatment={mode.treatment} data-motion={motion} style={{ '--world-accent': mode.accent, '--world-background': mode.background, '--world-duration': `${visualEffects.world[mode.treatment]}ms`, '--world-phrase': `${visualEffects.world.phrase}ms` } as CSSProperties}>
  <header className="world-artwork-heading"><h2 id="world-title">CEO1.9 <span>WORLD</span></h2><span className="metadata">{copy.location}</span></header>
  <div className="world-artwork-field" ref={field} data-scene-interaction="world" aria-label={copy.field}>
   <div className="world-light-field" data-parallax="atmosphere" aria-hidden="true" />
   <div className="world-camera">
    <figure className="world-map-plane" data-map-status={worldMapAsset ? 'available' : 'missing'} data-parallax="worldMap">
     {worldMapAsset ? <Image src={assetUrl(worldMapAsset.src)} alt={worldMapAsset.alt[locale]} fill sizes="(max-width:767px) 94vw, 72vw" style={{ objectFit: 'contain' }} /> : <div className="world-map-pending"><span className="metadata">{copy.missing}</span><span className="sr-only">{copy.pending}</span></div>}
     <div className="world-map-ink" aria-hidden="true" />
    </figure>
    <div className="world-architecture" data-parallax="architecture"><FezArchitecture /></div>
    <div key={selection.run} className="world-gesture" data-running={selection.run > 0} aria-hidden="true">
     <div className="world-signal-cuts"><i /><i /><i /><i /></div>
     <div className="world-convergence">{[0, 1, 2, 3, 4].map(index => <i key={index} style={{ '--point': index } as CSSProperties} />)}</div>
     <div className="world-haze"><i /><i /></div>
     <div className="world-split"><i /><i /></div>
     <div className="world-fragment" data-parallax="type">{mode.fragments.map(fragment => <span key={fragment}>{fragment}</span>)}{mode.treatment === 'impact' && <><span>KRITIKA KRITIKA KRITIKA</span><span>KRITIKA KRITIKA KRITIKA</span></>}</div>
    </div>
   </div>
   <div className="world-field-caption" data-parallax="detail"><span className="metadata">CEO1.9</span><span className="metadata">HKZ PROD</span></div>
   <button className="world-replay" type="button" onClick={() => select(selection.index, true)} aria-label={copy.replay} data-cursor="enter">↻<span className="sr-only">{copy.replay}</span></button>
  </div>
  <div className="world-mode-index" role="tablist" aria-label={copy.select} onKeyDown={keyboard}>{worldModes.map((world, index) => <button type="button" key={world.id} ref={element => { tabs.current[index] = element; }} id={`world-mode-${world.id}`} role="tab" aria-selected={selection.index === index} aria-controls="world-mode-panel" tabIndex={selection.index === index ? 0 : -1} onFocus={() => select(index)} onPointerEnter={event => { if (event.pointerType === 'mouse') select(index); }} onClick={() => select(index, true)} data-cursor="view"><span>{String(index + 1).padStart(2, '0')}</span><strong>{world.title}</strong></button>)}</div>
  <div id="world-mode-panel" className="world-mode-status" role="tabpanel" aria-labelledby={`world-mode-${mode.id}`}><span className="metadata">{mode.title}</span><p aria-live="polite">{mode.fragments.join(' / ')}</p></div>
 </section>;
}
