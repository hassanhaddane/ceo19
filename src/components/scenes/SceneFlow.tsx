'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Locale, SectionId } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { visualEffects } from '@/lib/visualEffects';
import { getSceneGesture, ownsVerticalScroll, publishScene, sceneFromHash, sceneNavigateEvent, sceneOrder, sceneSettledEvent } from '@/lib/sceneNavigation';

/** Native document scrolling and CSS snap. JS owns links/history, not ordinary wheel deltas. */
export function SceneFlow({ children, locale }: { children: ReactNode; locale: Locale }) {
 const root = useRef<HTMLElement>(null), motion = useSignalMotion();
 useEffect(() => {
  const main = root.current;
  if (!main) return;
  const sections = sceneOrder.map(id => document.getElementById(id)).filter((item): item is HTMLElement => !!item);
  const html = document.documentElement;
  const oldRestoration = history.scrollRestoration;
  history.scrollRestoration = 'manual';
  html.dataset.sceneScroll = 'true';
  let frame = 0, settleTimer: ReturnType<typeof setTimeout> | undefined, wheelTimer: ReturnType<typeof setTimeout> | undefined;
  let committed = sceneFromHash(location.hash) ?? 'home', moving = false, restoring = false;
  let requested: SectionId | null = null;
  let focusDestination: HTMLElement | null = null;
  let burst: { index: number; direction: number; last: number; locked: boolean; amount: number; originY: number; atEdge: boolean } | null = null;
  const top = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
  const current = () => sections.find(section => { const r = section.getBoundingClientRect(); return r.top <= innerHeight * .5 && r.bottom > innerHeight * .5; }) ?? sections[0];
  const isModal = () => !!document.querySelector('dialog[open]');
  const resetBurst = () => { burst = null; clearTimeout(wheelTimer); };
  const interrupt = () => { requested = null; focusDestination = null; restoring = false; resetBurst(); };
  const settle = () => {
   if (getSceneGesture() || isModal()) return;
   clearTimeout(settleTimer);
   const section = current(); if (!section) return;
   const rect = section.getBoundingClientRect();
   if (requested && (requested !== section.id || Math.abs(rect.top) > 3)) return;
   if (rect.height <= innerHeight + 3 && Math.abs(rect.top) > 3) return;
   // Some engines snap a small native wheel back to its origin. Resolve accumulated
   // intent only after native settling, never while paging through an oversized scene.
   if (burst && !burst.locked && burst.atEdge && burst.amount >= visualEffects.scenes.wheelIntent && sections.indexOf(section) === burst.index && Math.abs(scrollY - burst.originY) < 3) {
    const destination = sections[burst.index + burst.direction];
    if (destination) { burst.locked = true; window.scrollTo({ top: top(destination), behavior: motion ? 'smooth' : 'instant' }); onScroll(); return; }
   }
   const id = section.id as SectionId, previous = committed;
   committed = id; moving = false; requested = null;
   focusDestination?.focus({ preventScroll: true }); focusDestination = null;
   main.dataset.transition = 'idle'; main.dataset.scene = id;
   publishScene({ active: id, settled: id, previous, phase: 'idle', compact: scrollY > 32, enabled: true });
   if (sceneFromHash(location.hash) !== id && !restoring) history.pushState(null, '', `#${id}`);
   restoring = false;
   if (id !== previous) window.dispatchEvent(new CustomEvent(sceneSettledEvent, { detail: { id, previous } }));
  };
  const update = () => {
   frame = 0;
   const section = current(); if (!section) return;
   const id = section.id as SectionId;
   if (!moving) { moving = true; main.dataset.transition = 'scrolling'; }
   publishScene({ active: id, phase: 'scrolling', compact: scrollY > 32, enabled: true });
   clearTimeout(settleTimer); settleTimer = setTimeout(settle, visualEffects.scenes.settleDelay);
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  const go = (id: SectionId, mode: 'push' | 'replace' | 'restore' = 'push', instant = false, focus = false) => {
   if (getSceneGesture()) return;
   const section = sections.find(item => item.id === id); if (!section) return;
   resetBurst(); restoring = mode === 'restore'; requested = id;
   focusDestination = focus ? section : null;
   if (mode !== 'restore' && sceneFromHash(location.hash) !== id) history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', `#${id}`);
   window.scrollTo({ top: top(section), behavior: motion && !instant ? 'smooth' : 'instant' });
   onScroll();
  };
  const onNavigate = (event: Event) => { const { id, history: mode } = (event as CustomEvent<{ id: SectionId; history: 'push' | 'replace' }>).detail; go(id, mode, false, true); };
  const onHistory = () => { const id = sceneFromHash(location.hash); if (id) go(id, 'restore'); };
  const click = (event: MouseEvent) => {
   if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
   const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
   if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
   const url = new URL(anchor.href, location.href), id = sceneFromHash(url.hash);
   if (url.origin !== location.origin || url.pathname !== location.pathname) return;
   if (url.hash === '#main') { event.preventDefault(); go('home'); focusDestination = main; return; }
   if (!id) return;
   event.preventDefault(); go(id, 'push', false, true);
  };
  const keyboard = (event: KeyboardEvent) => {
   if (!event.defaultPrevented && !isModal() && ['Tab', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' '].includes(event.key)) interrupt();
   if (event.defaultPrevented || !['PageDown', 'PageUp'].includes(event.key) || event.altKey || event.metaKey || event.ctrlKey || isModal()) return;
   const direction = event.key === 'PageDown' ? 1 : -1;
   if (getSceneGesture()) { event.preventDefault(); return; }
   if (ownsVerticalScroll(event.target, direction)) return;
   const section = current(); if (!section) return;
   const rect = section.getBoundingClientRect();
   // Oversized scenes / browser zoom retain native paging until their content edge.
   if (direction > 0 ? rect.bottom > innerHeight + 3 : rect.top < -3) return;
   const index = sections.indexOf(section), destination = sections[index + direction];
   if (destination) { event.preventDefault(); go(destination.id as SectionId, 'push', false, true); }
  };
  const wheel = (event: WheelEvent) => {
   if (event.ctrlKey || isModal() || ownsVerticalScroll(event.target, Math.sign(event.deltaY)) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) { resetBurst(); return; }
   if (getSceneGesture()) { resetBurst(); event.preventDefault(); return; }
   if (!event.deltaY) return;
   // A fresh wheel gesture can interrupt an explicit anchor / keyboard move.
   requested = null; focusDestination = null; restoring = false;
   const now = performance.now(), direction = Math.sign(event.deltaY);
   const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
   if (!burst || now - burst.last > visualEffects.scenes.wheelIdle || burst.direction !== direction) {
    const section = current(), rect = section.getBoundingClientRect();
    burst = { index: sections.indexOf(section), direction, last: now, locked: false, amount: 0, originY: scrollY, atEdge: direction > 0 ? rect.bottom <= innerHeight + 3 : rect.top >= -3 };
   }
   burst.last = now;
   burst.amount += Math.abs(delta);
   clearTimeout(wheelTimer); wheelTimer = setTimeout(settle, visualEffects.scenes.wheelIdle + 20);
   const destination = sections[burst.index + direction]; if (!destination) return;
   const limit = top(destination);
   const exceeds = direction > 0 ? scrollY + delta >= limit : scrollY + delta <= limit;
   // Only drain the tail/overshoot at one scene boundary. All earlier deltas remain native.
   if (burst.locked || exceeds) {
    event.preventDefault();
    if (!burst.locked) { burst.locked = true; window.scrollTo({ top: limit, behavior: motion ? 'smooth' : 'instant' }); }
   }
  };
  const resize = () => {
   resetBurst();
   // Native smooth scrolling retains its old absolute destination across layout
   // changes. Re-anchor that pending request to the newly measured scene, once
   // per ResizeObserver notification; never leave the controller awaiting an
   // alignment the browser can no longer reach.
   if (requested && !isModal() && !getSceneGesture()) {
    const destination = sections.find(section => section.id === requested);
    if (destination) window.scrollTo({ top: top(destination), behavior: 'instant' });
   }
   onScroll();
  };
  const ownershipChanged = () => { resetBurst(); if (!getSceneGesture()) onScroll(); };
  const entered = () => { interrupt(); onScroll(); };
  const pointer = () => { if (!isModal()) interrupt(); else resetBurst(); };
  const focus = (event: FocusEvent) => {
   const section = event.target instanceof Element ? event.target.closest<HTMLElement>('.v3-scene') : null;
   if (!isModal() && requested && section && section.id !== requested) { interrupt(); onScroll(); }
  };
  animationStatus('scrollController', 'ready');
  const unregister = registerAnimationProbe('scrollController', () => ({ scroller: 'document', committed, requested, moving, restoring, burstLocked: burst?.locked ?? false }));
  const initial = sceneFromHash(location.hash);
  publishScene({ active: committed, settled: committed, previous: committed, phase: 'idle', compact: scrollY > 32, enabled: true });
  // One frame allows native anchor positioning and child release restoration to finish.
  const initialFrame = requestAnimationFrame(() => { if (initial && !isModal()) go(initial, 'restore', true); else onScroll(); });
  const observer = new ResizeObserver(resize); sections.forEach(section => observer.observe(section));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('scrollend', settle);
  window.addEventListener('popstate', onHistory); window.addEventListener('hashchange', onHistory);
  window.addEventListener(sceneNavigateEvent, onNavigate);
  window.addEventListener('ceo:entry-complete', entered);
  window.addEventListener('ceo:overlay-close', onScroll);
  window.addEventListener('ceo:gesture-change', ownershipChanged);
  document.addEventListener('pointerdown', pointer, { passive: true });
  document.addEventListener('focusin', focus);
  document.addEventListener('click', click); document.addEventListener('keydown', keyboard);
  document.addEventListener('wheel', wheel, { passive: false });
  return () => {
   unregister(); animationStatus('scrollController', 'disposed');
   cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); clearTimeout(settleTimer); clearTimeout(wheelTimer); observer.disconnect();
   window.removeEventListener('scroll', onScroll); window.removeEventListener('scrollend', settle);
   window.removeEventListener('popstate', onHistory); window.removeEventListener('hashchange', onHistory);
   window.removeEventListener(sceneNavigateEvent, onNavigate);
   window.removeEventListener('ceo:entry-complete', entered);
   window.removeEventListener('ceo:overlay-close', onScroll);
   window.removeEventListener('ceo:gesture-change', ownershipChanged); document.removeEventListener('pointerdown', pointer); document.removeEventListener('focusin', focus);
   document.removeEventListener('click', click); document.removeEventListener('keydown', keyboard); document.removeEventListener('wheel', wheel);
   delete html.dataset.sceneScroll; history.scrollRestoration = oldRestoration; publishScene({ enabled: false });
  };
 }, [motion, locale]);
 return <main ref={root} id="main" className="signal-page v3-page scene-flow" tabIndex={-1}>{children}</main>;
}
