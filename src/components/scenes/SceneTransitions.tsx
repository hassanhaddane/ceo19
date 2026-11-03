'use client';
import { useEffect } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { getSceneState, sceneOrder, subscribeSceneState } from '@/lib/sceneNavigation';
import { visualEffects } from '@/lib/visualEffects';
import { useEntryExperience } from '../visuals/VisualExperience';
import type { SectionId } from '@/types/content';

/** Reconcile durable scene state, including a direct load, rather than a lossy DOM event.
 * A generation belongs to this effect lifetime; delayed imports cannot animate an old scene. */
export function SectionTransition() {
 const enabled = useSignalMotion(), entry = useEntryExperience();
 const entered = entry?.entered ?? true;
 useEffect(() => {
  if (!enabled || !entered) return;
  let disposed = false, generation = 0, started: SectionId | null = null;
  let pending: { id: SectionId; generation: number } | null = null;
  let context: { revert: () => void } | undefined, section: HTMLElement | null = null;
  const reconcile = () => {
   const scene = getSceneState();
   if (!scene.enabled || scene.phase !== 'idle') {
    if (pending) { generation++; pending = null; }
    return;
   }
   const id = scene.settled;
   if (started === id || pending?.id === id) return;
   const ticket = ++generation; pending = { id, generation: ticket };
   void import('gsap').then(({ gsap }) => {
    const current = getSceneState();
    if (disposed || ticket !== generation || !current.enabled || current.phase !== 'idle' || current.active !== id) return;
    pending = null;
    const destination = document.getElementById(id); if (!destination?.isConnected) return;
    context?.revert(); if (section) delete section.dataset.sceneEntrance;
    section = destination; started = id; section.dataset.sceneEntrance = 'running';
    // The intro has already revealed Home in one shot. Do not hide/re-enter its
    // lettering again after the matte has finished opening.
    if (id === 'home' && document.documentElement.dataset.introHomeReveal === 'true') {
     delete document.documentElement.dataset.introHomeReveal;
     destination.dataset.sceneEntrance = 'complete';
     return;
    }
    const direction = sceneOrder.indexOf(id) >= sceneOrder.indexOf(scene.previous) ? 1 : -1;
    context = gsap.context(() => {
     const timeline = gsap.timeline({ onComplete: () => {
      destination.dataset.sceneEntrance = 'complete';
     } });
     const duration = visualEffects.scenes.transition / 1000;
     if (id === 'home') timeline.fromTo('.home-latest-artwork', { clipPath: 'inset(0% 0% 15% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power3.out' });
     if (id === 'music') timeline.fromTo('.music-release-identity h3', { clipPath:'inset(0% 0% 100% 0%)' }, { clipPath:'inset(0% 0% 0% 0%)', duration, ease:'power3.out' });
     if (id === 'archive') timeline.fromTo('.spatial-stage', { '--archive-entry': `${direction * 32}px`, '--archive-angle': `${direction * 5}deg` }, { '--archive-entry': '0px', '--archive-angle': '0deg', duration, ease: 'power3.out' });
    }, destination);
   }).catch(() => {
    if (disposed || ticket !== generation) return;
    pending = null; started = null; context?.revert(); context = undefined;
    if (section) delete section.dataset.sceneEntrance;
    // Content has no hidden initial CSS; failed imports leave the scene readable.
   });
  };
  const unsubscribe = subscribeSceneState(reconcile);
  window.addEventListener('online', reconcile); window.addEventListener('pageshow', reconcile);
  reconcile();
  return () => {
   disposed = true; generation++; unsubscribe(); context?.revert();
   if (section) delete section.dataset.sceneEntrance;
   window.removeEventListener('online', reconcile); window.removeEventListener('pageshow', reconcile);
  };
 }, [enabled, entered]);
 return null;
}

export { SectionTransition as SceneTransitions };
