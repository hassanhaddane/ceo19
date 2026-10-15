'use client';
import { useEffect } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { getSceneState, sceneOrder, subscribeSceneState } from '@/lib/sceneNavigation';
import { animationError, animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { visualEffects } from '@/lib/visualEffects';
import { useEntryExperience } from '../visuals/VisualExperience';
import type { SectionId } from '@/types/content';

/** Reconcile durable scene state, including a direct load, rather than a lossy DOM event.
 * A generation belongs to this effect lifetime; delayed imports cannot animate an old scene. */
export function SceneTransitions() {
 const enabled = useSignalMotion(), entry = useEntryExperience();
 const entered = entry?.entered ?? true;
 useEffect(() => {
  if (!enabled || !entered) { animationStatus('gsap', enabled ? 'waiting for entry' : 'reduced motion'); return; }
  let disposed = false, generation = 0, started: SectionId | null = null;
  let pending: { id: SectionId; generation: number } | null = null;
  let context: { revert: () => void } | undefined, section: HTMLElement | null = null;
  let unregister = () => {};
  const reconcile = () => {
   const scene = getSceneState();
   if (!scene.enabled || scene.phase !== 'idle') {
    if (pending) { generation++; pending = null; }
    return;
   }
   const id = scene.settled;
   if (started === id || pending?.id === id) return;
   const ticket = ++generation; pending = { id, generation: ticket };
   animationStatus('gsap', 'loading', { scene: id });
   void import('gsap').then(({ gsap }) => {
    const current = getSceneState();
    if (disposed || ticket !== generation || !current.enabled || current.phase !== 'idle' || current.active !== id) return;
    pending = null;
    const destination = document.getElementById(id); if (!destination?.isConnected) return;
    context?.revert(); if (section) delete section.dataset.sceneEntrance;
    section = destination; started = id; section.dataset.sceneEntrance = 'running';
    unregister(); unregister = registerAnimationProbe('gsap', () => ({
     version: gsap.version, scene: started, pending: pending?.id ?? null,
     activeTweens: gsap.globalTimeline.getChildren(true, true, false).filter(tween => tween.isActive()).length,
     scrollTriggerCount: 0,
    }));
    animationStatus('gsap', 'running', { scene: id });
    const direction = sceneOrder.indexOf(id) >= sceneOrder.indexOf(scene.previous) ? 1 : -1;
    context = gsap.context(() => {
     const timeline = gsap.timeline({ onComplete: () => {
      destination.dataset.sceneEntrance = 'complete'; animationStatus('gsap', 'ready', { scene: id });
     } });
     const duration = visualEffects.scenes.transition / 1000;
     if (id === 'home') timeline.fromTo('.hero-title-line', { y: direction * 60, clipPath: 'inset(0% 0% 100% 0%)' }, { y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration, stagger: .07, ease: 'power3.out' });
     if (id === 'music') timeline.fromTo('.deck-artwork', { clipPath: direction > 0 ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration, ease: 'power3.inOut' });
     if (id === 'archive') timeline.fromTo('.spatial-stage', { '--archive-entry': `${direction * 32}px`, '--archive-angle': `${direction * 5}deg` }, { '--archive-entry': '0px', '--archive-angle': '0deg', duration, ease: 'power3.out' });
     if (id === 'world') timeline.fromTo('.world-camera', { clipPath: 'inset(0% 48% 0% 48% round 45% 45% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0% round 0% 0% 0% 0%)', duration: .8, ease: 'power3.inOut' });
     if (id === 'connect') timeline.fromTo('.connect-platform', { x: direction * 48, clipPath: 'inset(0% 100% 0% 0%)' }, { x: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: .58, stagger: .045, ease: 'power3.out' });
    }, destination);
   }).catch(error => {
    if (disposed || ticket !== generation) return;
    pending = null; started = null; context?.revert(); context = undefined;
    if (section) delete section.dataset.sceneEntrance;
    animationStatus('gsap', 'error'); animationError('gsap initialization', error);
    // Content has no hidden initial CSS; failed imports leave the scene readable.
   });
  };
  const unsubscribe = subscribeSceneState(reconcile);
  window.addEventListener('online', reconcile); window.addEventListener('pageshow', reconcile);
  reconcile();
  return () => {
   disposed = true; generation++; unsubscribe(); unregister(); context?.revert();
   if (section) delete section.dataset.sceneEntrance;
   window.removeEventListener('online', reconcile); window.removeEventListener('pageshow', reconcile);
   animationStatus('gsap', 'disposed');
  };
 }, [enabled, entered]);
 return null;
}
