'use client';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRef, useState, type CSSProperties } from 'react';
import { archiveWorld, archiveCopy } from '@/data/archiveWorld';
import { useSpatialArchive } from './archive/useSpatialArchive';
import { visualEffects } from '@/lib/visualEffects';
import { useSceneState } from '@/lib/sceneNavigation';
import type { Locale } from '@/types/content';
import type { PhotoOrigin } from './archive/DarkroomViewer';
const DarkroomViewer = dynamic(() => import('./archive/DarkroomViewer').then(module => module.DarkroomViewer), { ssr: false });

export function Gallery({ locale }: { locale: Locale }) {
 const stage = useRef<HTMLDivElement>(null), opener = useRef<HTMLElement | null>(null), lastFlash = useRef(-Infinity);
 const { active, compact, motion, select, clickCapture, keyboard } = useSpatialArchive(stage);
 const [selected, setSelected] = useState<number | null>(null), [origin, setOrigin] = useState<PhotoOrigin | null>(null);
 const [exposure, setExposure] = useState(true), [flash, setFlash] = useState(false);
 const copy = archiveCopy[locale], current = archiveWorld[active], scene = useSceneState();
 const handleOpen = (index: number, button: HTMLButtonElement, now: number) => {
  opener.current = button; const rect = button.getBoundingClientRect();
  setOrigin({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
  const allowed = motion && exposure && now - lastFlash.current > visualEffects.archive.flashCooldown;
  setFlash(allowed); if (allowed) lastFlash.current = now;
  select(index); setSelected(index);
 };
 return <div className="spatial-archive" data-viewer-open={selected !== null} data-motion={motion}>
  <div className="spatial-stage" ref={stage} role="region" tabIndex={0} aria-label={copy.room} aria-describedby="archive-help" data-cursor="drag" data-scene-interaction="archive" onKeyDown={keyboard} onClickCapture={clickCapture}>
   {archiveWorld.map((photo, index) => {
    const nearby = Math.abs(index - active) <= (compact ? 1 : 2);
    return <figure key={photo.id} className="spatial-photo" data-photo-plane={index} data-active={index === active} inert={!nearby} style={{ '--photo-ratio': photo.aspectRatio } as CSSProperties}>
     <button type="button" data-photo-id={photo.id} className="spatial-photo-button" data-cursor="view" aria-label={`${copy.view}: ${photo.item.alt[locale]}`} aria-haspopup="dialog" tabIndex={index === active ? 0 : -1} onClick={event => handleOpen(index, event.currentTarget, event.timeStamp)}>
      {nearby && <Image src={photo.asset.path} alt={photo.item.alt[locale]} fill sizes={compact ? '78vw' : '(min-width:1600px) 600px, 36vw'} loading={scene.active === 'archive' && index === active ? 'eager' : 'lazy'} draggable={false} />}
      <span className="spatial-photo-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
     </button>
    </figure>;
   })}
  </div>
  <footer className="spatial-controls">
   <div className="spatial-caption" aria-live="polite" aria-atomic="true"><span className="metadata">{String(active + 1).padStart(2, '0')} / {String(archiveWorld.length).padStart(2, '0')}</span><p>{current.item.caption?.[locale] ?? current.item.alt[locale]}</p></div>
   <div className="spatial-navigation"><button type="button" aria-label={copy.previous} disabled={active === 0} onClick={() => select(active - 1)}>←</button><span className="metadata">{compact ? copy.touch : copy.hint}</span><button type="button" aria-label={copy.next} disabled={active === archiveWorld.length - 1} onClick={() => select(active + 1)}>→</button></div>
   <button type="button" className="spatial-exposure metadata" aria-pressed={exposure && motion} disabled={!motion} onClick={() => setExposure(value => !value)}>{copy.exposure} <span>{exposure && motion ? copy.on : copy.off}</span></button>
   <div className="spatial-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / archiveWorld.length})` }} /></div>
  </footer>
  <p id="archive-help" className="sr-only">{copy.help}</p>
  {selected !== null && <DarkroomViewer locale={locale} index={selected} origin={origin} flash={flash} opener={opener} onClose={() => setSelected(null)} onMove={setSelected} />}
 </div>;
}
