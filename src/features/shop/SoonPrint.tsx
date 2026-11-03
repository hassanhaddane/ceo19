'use client';
import { useRef, type ReactNode, type PointerEvent, type KeyboardEvent } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { shopCopy } from '@/data/shop';
import type { Locale } from '@/types/content';

const clamp = (value: number, max: number) => Math.max(-max, Math.min(max, value));
/** One typographic object; bounded event-driven transforms, no WebGL or RAF loop. */
export function SoonPrint({ locale, children }: { locale: Locale; children: ReactNode }) {
 const copy = shopCopy[locale], motion = useSignalMotion();
 const print = useRef<HTMLDivElement>(null);
 const drag = useRef<{ id: number; x: number; y: number } | null>(null);
 const offset = useRef({ x: 0, y: 0 });
 function move(x: number, y: number) {
  if (!print.current) return;
  offset.current = { x: clamp(x, 28), y: clamp(y, 16) };
  print.current.style.setProperty('--print-x', `${offset.current.x}px`);
  print.current.style.setProperty('--print-y', `${offset.current.y}px`);
  print.current.style.setProperty('--print-tilt', `${offset.current.x * .045}deg`);
 }
 function release(event?: PointerEvent<HTMLDivElement>) {
  if (event && drag.current && event.currentTarget.hasPointerCapture(drag.current.id)) event.currentTarget.releasePointerCapture(drag.current.id);
  drag.current = null;
  if (print.current) delete print.current.dataset.dragging;
  move(0, 0);
 }
 function pointerMove(event: PointerEvent<HTMLDivElement>) {
  if (!motion) return;
  if (drag.current) { move((event.clientX - drag.current.x) * .18, (event.clientY - drag.current.y) * .12); return; }
  if (event.pointerType !== 'mouse') return;
  const bounds = event.currentTarget.getBoundingClientRect();
  move(((event.clientX - bounds.left) / bounds.width - .5) * 20, ((event.clientY - bounds.top) / bounds.height - .5) * 12);
 }
 function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
  event.preventDefault();
  if (!motion || event.key === 'Home') { release(); return; }
  move(offset.current.x + (event.key === 'ArrowRight' ? 6 : event.key === 'ArrowLeft' ? -6 : 0), offset.current.y + (event.key === 'ArrowDown' ? 4 : event.key === 'ArrowUp' ? -4 : 0));
 }
 return <div ref={print} className="shop-print" data-motion={motion} onPointerMove={pointerMove} onPointerDown={event => {
  if (!motion || !event.isPrimary || event.button !== 0) return;
  drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  event.currentTarget.dataset.dragging = 'true'; event.currentTarget.setPointerCapture(event.pointerId);
 }} onPointerUp={release} onPointerCancel={release} onPointerLeave={() => { if (!drag.current) release(); }} onLostPointerCapture={() => release()}>
  <div className="shop-print-top"><span>{copy.title}</span><span>{copy.subtitle}</span></div>
  <h1 id="shop-title" aria-label="SOON."><button type="button" data-ceo-action="shop" data-cursor="drag" className="shop-type-object" aria-label={copy.artwork} aria-describedby="shop-print-help" onKeyDown={keyboard} onClick={() => release()}><span>SOON.</span></button></h1>
  <div className="shop-print-bottom"><span id="shop-print-help">{copy.gesture}<span className="sr-only">{locale === 'fr' ? ' : flèches pour déplacer, Entrée pour recentrer. Le mouvement respecte vos préférences.' : ': arrow keys to move, Enter to reset. Motion follows your preferences.'}</span><span aria-hidden="true"> ↔</span></span>{children}</div>
 </div>;
}
