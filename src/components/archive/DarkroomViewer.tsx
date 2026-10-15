'use client';
import Image, { getImageProps } from 'next/image';
import { useEffect, useRef, useState, type RefObject, type CSSProperties } from 'react';
import { archiveWorld, archiveCopy } from '@/data/archiveWorld';
import type { Locale } from '@/types/content';
import { useMediaDialog } from '../media/useMediaDialog';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';
import { nextIndex, visualMetadata } from '../media/archiveMath';
function viewerSizes(ratio: number) { return `(max-width:767px) min(94vw, ${(ratio * 78).toFixed(2)}svh), min(90vw, ${(ratio * 80).toFixed(2)}svh)`; }
export interface PhotoOrigin { left: number; top: number; width: number; height: number; }

export function DarkroomViewer({ locale, index, origin, flash, opener, onClose, onMove }: { locale: Locale; index: number; origin: PhotoOrigin | null; flash: boolean; opener: RefObject<HTMLElement | null>; onClose: () => void; onMove: (index: number) => void }) {
 const { dialog } = useMediaDialog(true, opener), motion = useSignalMotion();
 const [hasMoved, setHasMoved] = useState(false);
 const [closing, setClosing] = useState(false), [loaded, setLoaded] = useState<string | null>(null), [failed, setFailed] = useState<string | null>(null);
 const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), swipe = useRef<{ x: number; y: number } | null>(null);
 const copy = archiveCopy[locale], photo = archiveWorld[index], item = photo.item;
 const close = () => { if (closing) return; setClosing(true); timer.current = setTimeout(onClose, motion ? visualEffects.archive.close : 120); };
 const move = (direction: number) => { if (!closing) { setHasMoved(true); onMove(nextIndex(index, direction, archiveWorld.length)); } };
 useEffect(() => {
  document.documentElement.dataset.darkroomState = 'open';
  return () => { clearTimeout(timer.current); delete document.documentElement.dataset.darkroomState; };
 }, []);
 useEffect(() => {
  // Only immediate neighbors, at the same responsive size as the viewer. No full originals.
  const images = [-1, 1].map(direction => {
   const neighbor = archiveWorld[nextIndex(index, direction, archiveWorld.length)];
   const { props } = getImageProps({ src: neighbor.asset.path, alt: '', fill: true, sizes: viewerSizes(neighbor.aspectRatio) });
   const image = new window.Image(); image.sizes = props.sizes ?? ''; image.srcset = props.srcSet ?? ''; image.src = props.src;
   return image;
  });
  return () => images.forEach(image => { image.srcset = ''; image.removeAttribute('src'); });
 }, [index]);
 const styles = { '--exposure-duration': `${visualEffects.archive.flash}ms`, '--photo-open': `${visualEffects.archive.open}ms`, '--photo-close': `${visualEffects.archive.close}ms`, '--origin-x': origin ? `${origin.left + origin.width / 2}px` : '50vw', '--origin-y': origin ? `${origin.top + origin.height / 2}px` : '50svh', '--origin-width': origin ? `${origin.width}px` : '40vw', '--origin-height': origin ? `${origin.height}px` : '50svh' } as CSSProperties;
 return <dialog ref={dialog} className="media-viewer spatial-viewer" data-owned-interaction data-scroll-owner data-motion={motion} data-closing={closing} style={styles} aria-label={copy.room} aria-describedby="archive-viewer-caption" onCancel={event => { event.preventDefault(); close(); }} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
  <header className="spatial-viewer-header"><span className="metadata">CEO1.9 / {String(index + 1).padStart(2, '0')} — {String(archiveWorld.length).padStart(2, '0')}</span><button type="button" data-cursor="close" onClick={close}>{copy.close} <span>×</span></button></header>
  <div key={photo.id} className="spatial-viewer-exposure" data-initial={!hasMoved} data-loaded={loaded === photo.id} onPointerDown={event => { if (event.pointerType !== 'mouse') swipe.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={event => { const start = swipe.current; swipe.current = null; if (start && Math.abs(event.clientX - start.x) > 45 && Math.abs(event.clientX - start.x) > Math.abs(event.clientY - start.y) * 1.3) move(event.clientX < start.x ? 1 : -1); }} onPointerCancel={() => { swipe.current = null; }}>
   <div className="spatial-viewer-image"><Image src={photo.asset.path} alt={item.alt[locale]} fill sizes={viewerSizes(photo.aspectRatio)} loading="eager" draggable={false} onLoad={() => setLoaded(photo.id)} onError={() => setFailed(photo.id)} /></div>
   <div className="spatial-shutter" aria-hidden="true"><i /><i /></div>
   {loaded !== photo.id && <span className="spatial-image-status metadata" role="status">{failed === photo.id ? (locale === 'fr' ? 'Image indisponible' : 'Image unavailable') : (locale === 'fr' ? 'Développement…' : 'Developing…')}</span>}
  </div>
  {flash && motion && <div className="spatial-flash" aria-hidden="true" />}
  <footer className="spatial-viewer-footer"><button type="button" aria-label={copy.previous} onClick={() => move(-1)}>←</button><div id="archive-viewer-caption" aria-live="polite"><p>{item.caption?.[locale] ?? item.alt[locale]}</p><span className="metadata">{visualMetadata(item.metadata).join(' / ')}</span></div><button type="button" aria-label={copy.next} onClick={() => move(1)}>→</button></footer>
 </dialog>;
}
