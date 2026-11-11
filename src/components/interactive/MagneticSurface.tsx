'use client';
import { useEffect, useRef } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { getSceneGesture } from '@/lib/sceneNavigation';
import type { Locale } from '@/types/content';
import { actionMotion, normalizedPointer, settlePointer } from './motion';

const labels = {
 en: { enter: 'ENTER', play: 'PLAY', listen: 'PLAY', view: 'VIEW', shop: 'SHOP', close: 'CLOSE', drag: 'DRAG', default: '' },
 fr: { enter: 'ENTRER', play: 'LIRE', listen: 'LIRE', view: 'VOIR', shop: 'SHOP', close: 'FERMER', drag: 'GLISSER', default: '' },
};

/** One delegated pointer owner and one sleeping RAF for all controls + the original leaf.
 * No event is intercepted, no click is deferred and the hit area never follows the mouse. */
export function MagneticSurface({ locale }: { locale: Locale }) {
 const motion = useSignalMotion(), cursor = useRef<HTMLDivElement>(null), label = useRef<HTMLSpanElement>(null);
 useEffect(() => {
  const node = cursor.current;
  if (!node || !motion || typeof node.showPopover !== 'function' || typeof node.hidePopover !== 'function') return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let frame = 0, lastTime = 0, visible = false, mx = 0, my = 0, x = 0, y = 0, tx = 0, ty = 0;
  let surface: HTMLElement | null = null;
  const resetSurface = () => {
   surface?.style.removeProperty('--action-x'); surface?.style.removeProperty('--action-y');
   surface = null; x = y = tx = ty = 0;
  };
  const hide = () => {
   cancelAnimationFrame(frame); frame = 0; lastTime = 0; visible = false;
   delete document.documentElement.dataset.cursorReady;
   node.hidden = true;
   if (node.matches(':popover-open')) node.hidePopover();
   resetSurface();
  };
  const draw = (now: number) => {
   frame = 0;
   if (document.hidden || !visible) return;
   const elapsed = lastTime ? (now - lastTime) / 1000 : 1 / 60; lastTime = now;
   x = settlePointer(x, tx, elapsed); y = settlePointer(y, ty, elapsed);
   surface?.style.setProperty('--action-x', `${(x * actionMotion.depth).toFixed(2)}px`);
   surface?.style.setProperty('--action-y', `${(y * actionMotion.depth).toFixed(2)}px`);
   node.style.transform = `translate3d(${mx}px,${my}px,0)`;
   // The leaf is positioned and in the top layer before the native pointer disappears.
   document.documentElement.dataset.cursorReady = 'true';
   if (surface && Math.abs(tx - x) + Math.abs(ty - y) > .003) frame = requestAnimationFrame(draw);
  };
  const wake = () => { if (!frame) frame = requestAnimationFrame(draw); };
  const update = (event: PointerEvent) => {
   const target = event.target instanceof Element ? event.target : null;
   if (!fine.matches || event.pointerType !== 'mouse' || !target || target.closest('input,textarea,select,[contenteditable="true"],iframe') || typeof node.showPopover !== 'function') { hide(); return; }
   mx = event.clientX; my = event.clientY;
   const action = target.closest<HTMLElement>('[data-ceo-action]');
   const next = action?.matches('[data-ceo-motion~="depth"],[data-ceo-action="entry"],[data-ceo-action="music"],[data-ceo-action="navigation"]') &&
    !action.matches(':disabled,[aria-disabled="true"]') && action.querySelector('.ceo-action-label,.ceo-action-visual,.navigation-label') ? action : null;
   if (surface !== next) { resetSurface(); surface = next; }
   if (surface) {
    const rect = surface.getBoundingClientRect();
    tx = normalizedPointer(mx, rect.left, rect.width); ty = normalizedPointer(my, rect.top, rect.height);
   }
   const kind = getSceneGesture() ? 'drag' : target.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? (target.closest('a,button') ? 'enter' : 'default');
   const state = kind === 'open' ? 'view' : kind;
   node.dataset.state = state;
   if (label.current) label.current.textContent = labels[locale][state as keyof typeof labels.en] ?? '';
   node.hidden = false;
   try { if (!node.matches(':popover-open')) node.showPopover(); } catch { hide(); return; }
   visible = true; wake();
  };
  const visibility = () => { if (document.hidden) hide(); };
  document.addEventListener('pointermove', update, { passive: true });
  document.addEventListener('pointerover', update, { passive: true });
  document.addEventListener('pointerleave', hide); document.addEventListener('pointerdown', hide, { passive: true });
  document.addEventListener('focusin', hide); document.addEventListener('keydown', hide);
  document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', hide); fine.addEventListener('change', hide);
  return () => {
   hide(); document.removeEventListener('pointermove', update); document.removeEventListener('pointerover', update);
   document.removeEventListener('pointerleave', hide); document.removeEventListener('pointerdown', hide);
   document.removeEventListener('focusin', hide); document.removeEventListener('keydown', hide);
   document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', hide); fine.removeEventListener('change', hide);
  };
 }, [locale, motion]);
 return <div ref={cursor} className="ceo-leaf-cursor" popover="manual" hidden aria-hidden="true"><svg width="22" height="27" viewBox="0 0 30 36" fill="currentColor"><path d="M15 1c-3 5-5 10-4 16-3-5-7-8-11-9 1 6 5 11 11 14-4-2-8-2-11 0 4 4 8 6 13 5-3 2-4 4-4 6 3 0 5-1 6-3 1 2 3 3 6 3 0-2-1-4-4-6 5 1 9-1 13-5-3-2-7-2-11 0 6-3 10-8 11-14-4 1-8 4-11 9 1-6-1-11-4-16Z"/><path d="M15 18v17" fill="none" stroke="currentColor" strokeWidth="1.2"/></svg><span ref={label}/></div>;
}
