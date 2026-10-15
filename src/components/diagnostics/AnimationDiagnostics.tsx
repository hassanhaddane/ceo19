'use client';
import { useEffect } from 'react';
import { animationError, animationSnapshot, animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { getSceneGesture, getSceneState } from '@/lib/sceneNavigation';
import { isSignalMotionEnabled } from '@/lib/signalMotion';

export function AnimationDiagnostics() {
 useEffect(() => {
  if (process.env.NODE_ENV !== 'development') return;
  const api = { snapshot: animationSnapshot }; window.__CEO19_ANIMATIONS__ = api;
  animationStatus('hydration', 'ready');
  const fonts = () => animationStatus('fonts', document.fonts.status);
  const unregister = registerAnimationProbe('runtime', () => ({
   scene: getSceneState(), gesture: getSceneGesture()?.owner ?? null, scrollY,
   visibility: document.visibilityState, motion: isSignalMotionEnabled(),
   motionPreference: document.documentElement.dataset.motionPreference ?? 'system',
   systemReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
   fonts: document.fonts.status, webgl: 'not configured — spatial gallery uses DOM perspective',
   scrollTriggerCount: 0, scrollTrigger: 'not installed — native document snap',
  }));
  const error = (event: ErrorEvent) => animationError('runtime', event.error ?? event.message);
  const rejection = (event: PromiseRejectionEvent) => animationError('unhandledrejection', event.reason);
  fonts(); let disposed = false;
  void document.fonts.ready.then(() => { if (!disposed) fonts(); });
  document.fonts.addEventListener('loading', fonts); document.fonts.addEventListener('loadingdone', fonts);
  window.addEventListener('error', error); window.addEventListener('unhandledrejection', rejection);
  return () => {
   disposed = true; unregister();
   if (window.__CEO19_ANIMATIONS__ === api) delete window.__CEO19_ANIMATIONS__;
   document.fonts.removeEventListener('loading', fonts); document.fonts.removeEventListener('loadingdone', fonts);
   window.removeEventListener('error', error); window.removeEventListener('unhandledrejection', rejection);
  };
 }, []);
 return null;
}
