'use client';
import { useRouter } from 'next/navigation';
import { legacyProfessionalDestination } from '@/lib/experienceRoutes';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Locale, SectionId } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';
import { isHomeReading, mobileHomeWheelEnd, mobileHomeExit } from '@/lib/sceneScroll';
import { getSceneGesture, ownsVerticalScroll, publishScene, resolveSceneTarget, sceneScrollTarget, sceneFromHash, sceneNavigateEvent, sceneOrder, sceneSettledEvent } from '@/lib/sceneNavigation';

/** Native document scrolling and CSS snap. JS owns links/history, not ordinary wheel deltas. */
export function SceneFlow({ children, locale }: { children: ReactNode; locale: Locale }) {
 const root = useRef<HTMLElement>(null), motion = useSignalMotion(), router = useRouter();
 useEffect(() => {
  const main = root.current;
  if (!main) return;
  const sections = sceneOrder.map(id => document.getElementById(id)).filter((item): item is HTMLElement => !!item);
  const html = document.documentElement;
  const oldRestoration = history.scrollRestoration;
  let frame = 0, initialFrame = 0, leaving = false;
  const publicPath = location.pathname;
  // Route commits can precede effect cleanup. Public scrolling must never
  // rewrite an editorial/Shop URL during that brief handoff.
  const ownsPage = () => !leaving && location.pathname === publicPath;
  let settleTimer: ReturnType<typeof setTimeout> | undefined, wheelTimer: ReturnType<typeof setTimeout> | undefined;
  const redirectLegacy = () => {
   if (!ownsPage()) return true;
   const destination = legacyProfessionalDestination(locale, location.hash);
   if (!destination) return false;
   // App Router replacement is asynchronous. The old public scene can still
   // receive scroll/resize events while EPK mounts; none may rewrite its hash.
   leaving = true;
   cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); frame = 0;
   clearTimeout(settleTimer); clearTimeout(wheelTimer);
   router.replace(destination); return true;
  };
  if (redirectLegacy()) return;
  history.scrollRestoration = 'manual';
  html.dataset.sceneScroll = 'true';
  let committed = sceneFromHash(location.hash) ?? 'home', moving = false, restoring = false;
  let viewportWidth=innerWidth,viewportHeight=innerHeight;
  const didResize=()=>viewportWidth!==innerWidth||(innerWidth>=768&&matchMedia('(pointer: fine)').matches&&viewportHeight!==innerHeight);
  let requested: SectionId | null = null;
  let requestedAnchor:HTMLElement|null=null;
  let focusDestination: HTMLElement | null = null;
  let burst: { index: number; direction: number; last: number; locked: boolean; amount: number; originY: number; atEdge: boolean } | null = null;
  const top = (element: HTMLElement) => element.getBoundingClientRect().top + window.scrollY;
  const destinationTop=(section:HTMLElement,anchor:HTMLElement|null=null)=>sceneScrollTarget(top(section),anchor?top(anchor):null,innerHeight,document.documentElement.scrollHeight,(document.querySelector('.site-header')?.getBoundingClientRect().bottom??80)+20);
  const current = () => sections.find(section => { const r = section.getBoundingClientRect(); return r.top <= innerHeight * .5 && r.bottom > innerHeight * .5; }) ?? (scrollY >= top(sections[sections.length - 1]) ? sections[sections.length - 1] : sections[0]);
  const isModal = () => !!document.querySelector('dialog[open],.intro-sequence[data-active="true"]');
  // Home uses the document, never a nested panel. Keep normal scrolling until
  // its last links have passed; restoring snap at the viewport's bottom edge
  // would pull a longer swipe away from those links before they can be read.
  const syncHomeReading = () => {
   if (!ownsPage()) return;
   const home = sections[0]?.getBoundingClientRect();
   const reading = isHomeReading(innerWidth, innerHeight, home, requested);
   html.dataset.homeReading = String(reading);
  };
  const resetBurst = () => { burst = null; clearTimeout(wheelTimer); };
  const interrupt = () => { requested = null; requestedAnchor=null; focusDestination = null; restoring = false; resetBurst(); };
  const settle = () => {
   if (!ownsPage()) return;
   if(didResize()){resize();return;}
   if (getSceneGesture() || isModal()) return;
   clearTimeout(settleTimer);
   const section = current(); if (!section) return;
   const rect = section.getBoundingClientRect();
   const home = sections[0];
   const handoff = burst && !burst.locked ? mobileHomeExit(innerWidth, innerHeight, top(home), home.getBoundingClientRect().height, burst.originY, scrollY, burst.direction, burst.amount, visualEffects.scenes.wheelIntent) : null;
   if (handoff !== null && burst) {
    burst.locked = true; requested = 'music'; syncHomeReading();
    window.scrollTo({ top: handoff, behavior: motion ? 'smooth' : 'instant' }); onScroll(); return;
   }
   if (requested && (requested !== section.id || Math.abs(scrollY-destinationTop(section,requestedAnchor)) > 3)) return;
   const atDocumentEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 3;
   if (!requestedAnchor && !atDocumentEnd && rect.height <= innerHeight + 3 && Math.abs(rect.top) > 3) return;
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
   if (!ownsPage()) return;
   syncHomeReading();
   const section = current(); if (!section) return;
   const id = section.id as SectionId;
   if (!moving) { moving = true; main.dataset.transition = 'scrolling'; }
   publishScene({ active: id, phase: 'scrolling', compact: scrollY > 32, enabled: true });
   clearTimeout(settleTimer); settleTimer = setTimeout(settle, visualEffects.scenes.settleDelay);
  };
  const onScroll = () => { if(!ownsPage())return; if(didResize()){resize();return;} if (!frame) frame = requestAnimationFrame(update); };
  const go = (id: SectionId, mode: 'push' | 'replace' | 'restore' = 'push', instant = false, focus = false, anchorId:'connect'|null=null) => {
   if (!ownsPage() || getSceneGesture()) return;
   const section = sections.find(item => item.id === id); if (!section) return;
   resetBurst(); restoring = mode === 'restore'; requested = id; requestedAnchor=anchorId?document.getElementById(anchorId):null;
   syncHomeReading();
   focusDestination = focus ? requestedAnchor??section : null;
   if (mode !== 'restore' && location.hash !== `#${id}`) history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', `#${id}`);
   window.scrollTo({ top: destinationTop(section,requestedAnchor), behavior: motion && !instant ? 'smooth' : 'instant' });
   onScroll();
  };
  const onNavigate = (event: Event) => { const { id, history: mode } = (event as CustomEvent<{ id: SectionId; history: 'push' | 'replace' }>).detail; go(id, mode, false, true); };
  const onHistory = () => { if (redirectLegacy()) return; const target=resolveSceneTarget(location.hash); if(target)go(target.scene,'restore',false,!!target.anchor,target.anchor); };
  const click = (event: MouseEvent) => {
   if (!ownsPage() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
   const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
   if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
   const url = new URL(anchor.href, location.href), id = sceneFromHash(url.hash);
   if (url.origin !== location.origin || url.pathname !== location.pathname) return;
   if (url.hash === '#main') { event.preventDefault(); go('home'); focusDestination = main; return; }
   if (!id) return;
   event.preventDefault();
   // Content hashes select a release/photo as well as a scene. Let hashchange
   // notify both owners; canonicalizing to #music would discard that selection.
   if (url.hash !== `#${id}`) { location.hash = url.hash; return; }
   go(id, 'push', false, true);
  };
  const keyboard = (event: KeyboardEvent) => {
   if (!ownsPage()) return;
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
   if (!ownsPage()) return;
   if (event.ctrlKey || isModal() || ownsVerticalScroll(event.target, Math.sign(event.deltaY)) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) { resetBurst(); return; }
   if (getSceneGesture()) { resetBurst(); event.preventDefault(); return; }
   if (!event.deltaY) return;
   // A fresh wheel gesture can interrupt an explicit anchor / keyboard move.
   requested = null; requestedAnchor=null; focusDestination = null; restoring = false;
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
   const origin = sections[burst.index];
   const homeEnd = origin.id === 'home' ? mobileHomeWheelEnd(innerWidth, innerHeight, top(origin), origin.getBoundingClientRect().height, burst.originY, direction) : null;
   const limit = homeEnd ?? top(destination);
   const exceeds = direction > 0 ? scrollY + delta >= limit : scrollY + delta <= limit;
   // Only drain the tail/overshoot at one scene boundary. All earlier deltas remain native.
   if (burst.locked || exceeds) {
    event.preventDefault();
    if (!burst.locked) { burst.locked = true; window.scrollTo({ top: limit, behavior: motion ? 'smooth' : 'instant' }); }
   }
  };
  const resize = () => {
   if (!ownsPage()) return;
   resetBurst();
   // Mobile browser chrome changes height during normal reading; it must never
   // reset the reader's position. Width/orientation changes still restore scenes.
   const viewportChanged=didResize();
   viewportWidth=innerWidth;viewportHeight=innerHeight;
   // A phone's long Home changes the offsets when the viewport becomes wide.
   // Restore the settled scene before native snap can commit its neighbor.
   if(viewportChanged&&!requested&&!isModal()&&!getSceneGesture()){
    const target=resolveSceneTarget(location.hash);
    go(committed,'restore',true,false,target?.scene===committed?target.anchor:null);
    return;
   }
   // Native smooth scrolling retains its old absolute destination across layout
   // changes. Re-anchor that pending request to the newly measured scene, once
   // per ResizeObserver notification; never leave the controller awaiting an
   // alignment the browser can no longer reach.
   if (requested && !isModal() && !getSceneGesture()) {
    const destination = sections.find(section => section.id === requested);
    if (destination) window.scrollTo({ top: destinationTop(destination,requestedAnchor), behavior: 'instant' });
   }
   onScroll();
  };
  const ownershipChanged = () => { if(!ownsPage())return; resetBurst(); if (!getSceneGesture()) onScroll(); };
  const entered = () => {
   if (!ownsPage()) return;
   const target=resolveSceneTarget(location.hash);interrupt();
   if(target)go(target.scene,'restore',true,true,target.anchor);
   else onScroll();
  };
  const introStarted = () => {
   if (!ownsPage()) return;
   const target=resolveSceneTarget(location.hash);
   interrupt();go(target?.scene??'home','restore',true,false,target?.anchor);
  };
  const pointer = () => { if(!ownsPage())return; if (!isModal()) interrupt(); else resetBurst(); };
  const focus = (event: FocusEvent) => {
   if (!ownsPage()) return;
   // A new header/dialog interaction takes focus ownership from a queued scene
   // arrival. Keep the scroll animation, but never steal focus back on settling.
   if (event.target instanceof Element && event.target.closest('.site-header,dialog[open]')) focusDestination = null;
   const section = event.target instanceof Element ? event.target.closest<HTMLElement>('.v3-scene') : null;
   if (!isModal() && requested && section && section.id !== requested) { interrupt(); onScroll(); }
  };
  const initial = resolveSceneTarget(location.hash);
  publishScene({ active: committed, settled: committed, previous: committed, phase: 'idle', compact: scrollY > 32, enabled: true });
  // Prepare the requested scene underneath the matte without rewriting content hashes.
  initialFrame = requestAnimationFrame(() => { if (initial) go(initial.scene, 'restore', true, !!initial.anchor, initial.anchor); else onScroll(); });
  syncHomeReading();
  const observer = new ResizeObserver(resize); sections.forEach(section => observer.observe(section));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize',resize);
  window.addEventListener('scrollend', settle);
  window.addEventListener('popstate', onHistory); window.addEventListener('hashchange', onHistory);
  window.addEventListener(sceneNavigateEvent, onNavigate);
  window.addEventListener('ceo:entry-complete', entered);
  window.addEventListener('ceo:intro-start', introStarted);
  window.addEventListener('ceo:overlay-close', onScroll);
  window.addEventListener('ceo:gesture-change', ownershipChanged);
  document.addEventListener('pointerdown', pointer, { passive: true });
  document.addEventListener('focusin', focus);
  document.addEventListener('click', click); document.addEventListener('keydown', keyboard);
  document.addEventListener('wheel', wheel, { passive: false });
  return () => {
   leaving = true;
   cancelAnimationFrame(frame); cancelAnimationFrame(initialFrame); clearTimeout(settleTimer); clearTimeout(wheelTimer); observer.disconnect();
   window.removeEventListener('scroll', onScroll); window.removeEventListener('resize',resize); window.removeEventListener('scrollend', settle);
   window.removeEventListener('popstate', onHistory); window.removeEventListener('hashchange', onHistory);
   window.removeEventListener(sceneNavigateEvent, onNavigate);
   window.removeEventListener('ceo:entry-complete', entered);
   window.removeEventListener('ceo:intro-start', introStarted);
   window.removeEventListener('ceo:overlay-close', onScroll);
   window.removeEventListener('ceo:gesture-change', ownershipChanged); document.removeEventListener('pointerdown', pointer); document.removeEventListener('focusin', focus);
   document.removeEventListener('click', click); document.removeEventListener('keydown', keyboard); document.removeEventListener('wheel', wheel);
   delete html.dataset.sceneScroll; delete html.dataset.homeReading; history.scrollRestoration = oldRestoration; publishScene({ enabled: false });
  };
 }, [motion, locale, router]);
 return <main ref={root} id="main" className="signal-page v3-page scene-flow" tabIndex={-1}>{children}</main>;
}
