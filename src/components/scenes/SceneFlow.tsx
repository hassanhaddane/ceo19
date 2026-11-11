'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isSignalMotionEnabled, subscribeSignalMotion } from '@/lib/signalMotion';
import { publishScene, sceneNavigateEvent, sceneSettledEvent } from '@/lib/sceneNavigation';
import { chapterFromHash, contactResourceAnchor, sceneChapterOrder, sceneScrollTarget, type SceneChapter } from '@/lib/sceneTargets';
import type { createSceneMotion } from './sceneMotion';
import { EntityLayer } from '../entity/EntityLayer';
import { createEntitySignal } from '../entity/entitySignal';
import '../entity/entity.css';

type NavigationRequest = { chapter: SceneChapter; focus: HTMLElement | null };
type HistoryMode = 'push' | 'replace' | 'restore';
/** Native scrolling owns position. This effect coordinates anchors, history and the cinematic layer. */
export function SceneFlow({ children }: { children: ReactNode }) {
 const root = useRef<HTMLElement>(null);
 const [entity] = useState(createEntitySignal);
 useEffect(() => {
  const main = root.current;
  if (!main) return;
  const chapters = sceneChapterOrder.flatMap(id => {
   const element = main.querySelector<HTMLElement>(`#${id}`);
   return element ? [{ id, element }] : [];
  });
  const publicPath = location.pathname;
  const oldRestoration = history.scrollRestoration;
  let disposed = false, frame = 0, motionTicket = 0;
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let cinematic: ReturnType<typeof createSceneMotion> | undefined;
  let committed = chapterFromHash(location.hash) ?? 'home';
  let request: NavigationRequest | null = null;
  let observedURL = location.href;
  let viewportWidth = innerWidth;
  let ready = false;
  const ownsPage = () => !disposed && location.pathname === publicPath;
  const isCovered = () => !!document.querySelector('dialog[open],.intro-sequence');
  function currentChapter() {
   const line = innerHeight * .5;
   if (Math.ceil(scrollY + innerHeight) >= document.documentElement.scrollHeight - 1) return 'connect';
   return chapters.find(({ element }) => element.getBoundingClientRect().bottom > line)?.id ?? 'connect';
  }

  function paint(id: SceneChapter, phase: 'idle' | 'scrolling') {
   main!.dataset.scene = id;
   main!.dataset.transition = phase;
   publishScene({ active: id, phase, compact: scrollY > 32, enabled: true });
  }

  function writeHash(hash: string, mode: 'push' | 'replace') {
   if (hash === location.hash) return;
   history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', hash);
   observedURL = location.href;
  }

  function settle() {
   clearTimeout(settleTimer);
   if (!ownsPage() || !ready || isCovered()) return;
   const arrived = request;
   request = null;
   const id = currentChapter(), previous = committed;
   committed = id;
   paint(id, 'idle');
   publishScene({ settled: id, previous });
   if (arrived?.chapter === id) arrived.focus?.focus({ preventScroll: true });
   if (chapterFromHash(location.hash) !== id || location.hash === '') writeHash(`#${id}`, 'replace');
   if (id !== previous) window.dispatchEvent(new CustomEvent(sceneSettledEvent, { detail: { id, previous } }));
  }

  function schedule() {
   if (!ownsPage()) return;
   if (!frame) frame = requestAnimationFrame(() => {
    frame = 0;
    if (!ownsPage() || !ready || isCovered()) return;
    paint(currentChapter(), 'scrolling');
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 160);
   });
  }

  function go(chapter: SceneChapter, mode: HistoryMode, hash = `#${chapter}`, instant = false, focus?: HTMLElement) {
   const destination = chapters.find(item => item.id === chapter)?.element;
   if (!ownsPage() || !destination) return;
   if (mode !== 'restore') writeHash(hash, mode);
   const resourceId = chapter === 'connect' ? contactResourceAnchor(hash) : null;
   const resource = resourceId ? destination.querySelector<HTMLElement>(`#${resourceId}`) : null;
   const dossier = resource?.closest('details');
   if (dossier) dossier.open = true;
   request = { chapter, focus: resource ?? focus ?? null };
   const top = destination.getBoundingClientRect().top + scrollY;
   const header = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0;
   const start = chapter === 'connect' ? top - header : top;
   const target = sceneScrollTarget(start, resource ? resource.getBoundingClientRect().top + scrollY : null,
    innerHeight, document.documentElement.scrollHeight, header + 18);
   window.scrollTo({ top: target, behavior: !instant && isSignalMotionEnabled() ? 'smooth' : 'instant' });
   schedule();
  }

  const onHistory = () => {
   if (!ownsPage() || observedURL === location.href) return;
   observedURL = location.href;
   const chapter = chapterFromHash(location.hash);
   if (chapter) go(chapter, 'restore', location.hash);
  };

  const onNavigate = (event: Event) => {
   const { id, history: mode } = (event as CustomEvent<{ id: SceneChapter; history: 'push' | 'replace' }>).detail;
   go(id, mode, `#${id}`, false, chapters.find(chapter => chapter.id === id)?.element);
  };

  const click = (event: MouseEvent) => {
   if (!ownsPage() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
   const link = event.target.closest<HTMLAnchorElement>('a[href]');
   if (!link || link.target && link.target !== '_self' || link.hasAttribute('download')) return;
   const url = new URL(link.href, location.href);
   if (url.origin !== location.origin || url.pathname !== publicPath || url.search !== location.search || !url.hash) return;
   const chapter = chapterFromHash(url.hash);
   if (!chapter) return;
   const oldURL = location.href;
   event.preventDefault();
   go(chapter, 'push', url.hash, false, url.hash === '#main' ? main : chapters.find(item => item.id === chapter)?.element);
   // Release and photo players still own their selection hashes.
   if (url.hash !== `#${chapter}` && oldURL !== location.href) window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
  };

  const onResize = () => {
   if (innerWidth === viewportWidth) { schedule(); return; }
   viewportWidth = innerWidth;
   // A different column layout changes chapter offsets; mobile browser chrome only changes height.
   go(request?.chapter ?? committed, 'restore', location.hash, true, request?.focus ?? undefined);
  };
  const interrupt = () => { if (!isCovered()) request = null; };
  const keyboard = (event: KeyboardEvent) => {
   if (['Tab', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) interrupt();
  };
  const alignEntry = () => {
   const chapter = chapterFromHash(location.hash) ?? 'home';
   go(chapter, 'restore', location.hash, true);
  };
  const entered = () => {
   ready = true;
   alignEntry();
  };
  const startIntro = () => {
   ready = false;
   alignEntry();
  };

  const syncMotion = () => {
   const ticket = ++motionTicket;
   if (!isSignalMotionEnabled()) {
    cinematic?.dispose();
    cinematic = undefined;
    if (request && ready && !isCovered()) go(request.chapter, 'restore', location.hash, true, request.focus ?? undefined);
    return;
   }
   if (cinematic) return;
   void import('./sceneMotion').then(({ createSceneMotion }) => {
    if (ownsPage() && ticket === motionTicket) cinematic = createSceneMotion(main, chapters, entity);
   }).catch(() => { /* Reading and navigation remain native if the animation chunk cannot load. */ });
  };

  history.scrollRestoration = 'manual';
  ready = !isCovered();
  paint(committed, 'idle');
  publishScene({ settled: committed, previous: committed });
  alignEntry();
  const unsubscribeMotion = subscribeSignalMotion(syncMotion);
  syncMotion();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('scrollend', settle);
  window.addEventListener('resize', onResize);
  window.addEventListener('popstate', onHistory);
  window.addEventListener('hashchange', onHistory);
  window.addEventListener(sceneNavigateEvent, onNavigate);
  window.addEventListener('ceo:intro-start', startIntro);
  window.addEventListener('ceo:entry-complete', entered);
  window.addEventListener('ceo:overlay-close', schedule);
  main.addEventListener('click', click, { capture: true });
  document.addEventListener('click', click);
  document.addEventListener('wheel', interrupt, { passive: true });
  document.addEventListener('pointerdown', interrupt, { passive: true });
  document.addEventListener('keydown', keyboard);
  return () => {
   disposed = true;
   cancelAnimationFrame(frame);
   clearTimeout(settleTimer);
   unsubscribeMotion();
   cinematic?.dispose();
   window.removeEventListener('scroll', schedule);
   window.removeEventListener('scrollend', settle);
   window.removeEventListener('resize', onResize);
   window.removeEventListener('popstate', onHistory);
   window.removeEventListener('hashchange', onHistory);
   window.removeEventListener(sceneNavigateEvent, onNavigate);
   window.removeEventListener('ceo:intro-start', startIntro);
   window.removeEventListener('ceo:entry-complete', entered);
   window.removeEventListener('ceo:overlay-close', schedule);
   main.removeEventListener('click', click, { capture: true });
   document.removeEventListener('click', click);
   document.removeEventListener('wheel', interrupt);
   document.removeEventListener('pointerdown', interrupt);
   document.removeEventListener('keydown', keyboard);
   history.scrollRestoration = oldRestoration;
   publishScene({ enabled: false });
  };
 }, [entity]);
 return <main ref={root} id="main" className="signal-page v3-page scene-flow" tabIndex={-1}>
  <div className="scene-spine" aria-hidden="true">
   <div className="scene-spine-camera">
    <div className="scene-spine-cut" />
    <EntityLayer signal={entity} />
   </div>
  </div>
  {children}
 </main>;
}
