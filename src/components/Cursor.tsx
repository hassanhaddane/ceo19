'use client';
import { useEffect, useRef } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { getSceneGesture } from '@/lib/sceneNavigation';
import type { Locale } from '@/types/content';
import { editorialCopy } from '@/data/editorial';

/** Compact original silhouette in the top layer, with event-driven velocity / state feedback. */
export function Cursor({ locale }: { locale: Locale }) {
 const enabled = useSignalMotion();
 const ref = useRef<HTMLDivElement>(null), label = useRef<HTMLSpanElement>(null), leaf = useRef<SVGSVGElement>(null);
 useEffect(() => {
  const cursor = ref.current, text = label.current, shape = leaf.current;
  if (!cursor || !text || !shape || !enabled || typeof cursor.showPopover !== 'function') return;
  const media = matchMedia('(hover:hover) and (pointer:fine)');
  let frame = 0, tx = 0, ty = 0, x = 0, y = 0, angle = 0, velocity = 0, lastX = 0, lastY = 0, initialized = false;
  const hide = () => { cancelAnimationFrame(frame); frame = 0; initialized = false; delete document.documentElement.dataset.cursorReady; cursor.hidden = true; if (cursor.matches(':popover-open')) cursor.hidePopover(); };
  const state = (target: Element | null) => {
   const control = target?.closest<HTMLElement>('[data-cursor],a,button,[role="tab"]');
   const kind = getSceneGesture() ? 'drag' : control?.dataset.cursor ?? (control ? 'enter' : 'default');
   const normalized = kind === 'listen' ? 'play' : kind === 'open' ? 'view' : kind;
   if (cursor.dataset.state !== normalized) {
    cursor.dataset.state = normalized;
    text.textContent = editorialCopy[locale].cursor[normalized as keyof typeof editorialCopy.en.cursor] ?? '';
   }
  };
  const draw = () => {
   frame = 0;
   if (document.hidden || !initialized) return;
   x += (tx - x) * .62; y += (ty - y) * .62; angle *= .86; velocity *= .8;
   cursor.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
   const interaction = cursor.dataset.state === 'default' ? 1 : cursor.dataset.state === 'drag' ? 1.12 : 1.06;
   shape.style.transform = `rotate(${angle.toFixed(2)}deg) scale(${interaction + Math.min(velocity, 20) * .006})`;
   if (Math.abs(tx - x) + Math.abs(ty - y) > .1 || Math.abs(angle) > .1 || velocity > .05) frame = requestAnimationFrame(draw);
  };
  const update = (event: PointerEvent) => {
   const target = event.target instanceof Element ? event.target : null;
   if (!media.matches || event.pointerType !== 'mouse' || target?.closest('input,textarea,select,[contenteditable="true"],iframe')) { hide(); return; }
   tx = event.clientX; ty = event.clientY;
   if (!initialized) { x = tx; y = ty; lastX = x; lastY = y; initialized = true; }
   velocity = Math.hypot(tx - lastX, ty - lastY); angle = Math.max(-22, Math.min(22, (tx - lastX) * .9)); lastX = tx; lastY = ty;
   state(target); cursor.hidden = false; if (!cursor.matches(':popover-open')) cursor.showPopover();
   document.documentElement.dataset.cursorReady = 'true';
   if (!frame) frame = requestAnimationFrame(draw);
  };
  const ownership = () => { if (initialized) state(document.elementFromPoint(tx, ty)); };
  const visibility = () => { if (document.hidden) hide(); };
  document.addEventListener('pointermove', update, { passive: true }); document.addEventListener('pointerover', update, { passive: true });
  document.addEventListener('pointerleave', hide); document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', hide);
  window.addEventListener('ceo:gesture-change', ownership); media.addEventListener('change', hide);
  return () => { hide(); document.removeEventListener('pointermove', update); document.removeEventListener('pointerover', update); document.removeEventListener('pointerleave', hide); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', hide); window.removeEventListener('ceo:gesture-change', ownership); media.removeEventListener('change', hide); };
 }, [locale, enabled]);
 return <div ref={ref} className="ceo-cursor leaf-cursor" popover="manual" hidden aria-hidden="true"><svg ref={leaf} width="22" height="27" viewBox="0 0 30 36" fill="currentColor"><path d="M15 1c-3 5-5 10-4 16-3-5-7-8-11-9 1 6 5 11 11 14-4-2-8-2-11 0 4 4 8 6 13 5-3 2-4 4-4 6 3 0 5-1 6-3 1 2 3 3 6 3 0-2-1-4-4-6 5 1 9-1 13-5-3-2-7-2-11 0 6-3 10-8 11-14-4 1-8 4-11 9 1-6-1-11-4-16Z"/><path d="M15 18v17" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg><span ref={label}/></div>;
}
