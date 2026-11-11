'use client';

import Image from 'next/image';
import { useCallback, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import type { Locale } from '@/types/content';
import { assets, assetUrl } from '@/data/assets';
import { useSoundManager } from '@/features/audio/SoundProvider';
import { SoundSettings } from '@/features/audio/SoundSettings';
import { isSignalMotionEnabled, subscribeSignalMotion } from '@/lib/signalMotion';
import { BrandMorph, createBrandMorph, drawHkzMark, loadBrands } from './BrandMorph';
import { IntroMask } from './IntroMask';
import { createIntroController, introFrame, introProfile, smooth } from './IntroController';
import { AudioChoice } from '../interactive/AudioChoice';
import { UtilityButton } from '../interactive/UtilityAction';

const subscribeHydration = () => () => {};

export type IntroExit = 'complete' | 'skip' | 'hidden';

export function IntroSequence({ locale, onStart, onReveal, onComplete }: {
 locale: Locale; onStart: () => void; onReveal: () => void; onComplete: (reason: IntroExit) => void;
}) {
 const root = useRef<HTMLElement>(null);
 const canvas = useRef<HTMLCanvasElement>(null);
 const hkzStamp = useRef<HTMLCanvasElement>(null);
 const animation = useRef<(() => void) | null>(null);
 const brandImages = useRef<Awaited<ReturnType<typeof loadBrands>> | null>(null);
 const sound = useSoundManager();
 const hydrated = useSyncExternalStore(subscribeHydration, () => true, () => false);
 const [choice, setChoice] = useState<boolean | null>(null);
 const chosen = useRef<boolean | null>(null), finished = useRef(false);
 const fr = locale === 'fr';

 const done = useCallback((reason: IntroExit) => {
  if (finished.current) return;
  finished.current = true;
  animation.current?.();
  if (chosen.current === null) sound.chooseMode(false);
  if (reason === 'hidden') sound.interrupt();
  onComplete(reason);
 }, [onComplete, sound]);

 useLayoutEffect(() => {
  sound.chooseMode(false);
  onStart();
  let disposed = false;
  void loadBrands().then(brands => {
   if (disposed) return;
   brandImages.current = brands;
   const stamp = hkzStamp.current;
   if (stamp && drawHkzMark(stamp, brands.hkz)) stamp.dataset.ready = 'true';
  }).catch(() => {});
  const visibility = () => { if (document.hidden && chosen.current !== null) done('hidden'); };
  const unsubscribe = subscribeSignalMotion(() => {
   if (chosen.current !== null && !isSignalMotionEnabled()) done('complete');
  });
  document.addEventListener('visibilitychange', visibility);
  return () => {
   disposed = true;
   animation.current?.();
   unsubscribe();
   document.removeEventListener('visibilitychange', visibility);
  };
 }, [done, onStart, sound]);
 useLayoutEffect(() => {
  if (hydrated) root.current?.querySelector<HTMLButtonElement>('.intro-enter-sound')?.focus({ preventScroll: true });
 }, [hydrated]);

 function choose(withSound: boolean) {
  if (chosen.current !== null || finished.current) return;
  chosen.current = withSound;
  // This call must stay synchronous inside the trusted click for audio activation.
  sound.chooseMode(withSound);
  const element = root.current, surface = canvas.current;
  if (!isSignalMotionEnabled() || !element || !surface) { done('complete'); return; }
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const profile = introProfile({
   mobile: matchMedia('(max-width:767px)').matches,
   economy: (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4) || !!device.connection?.saveData,
   reduced: false,
  });
  const position = (selector: string) => {
   const rect = document.querySelector(selector)?.getBoundingClientRect();
   return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width } : undefined;
  };
  const origin = position('.intro-hkz');
  if (origin) {
   element.style.setProperty('--intro-origin-x', `${origin.x}px`);
   element.style.setProperty('--intro-origin-y', `${origin.y}px`);
  }
  let renderer: ReturnType<typeof createBrandMorph> | null = null;
  let rendererAttempted = false, revealed = false;
  setChoice(withSound);
  element.querySelector<HTMLButtonElement>('.intro-skip')?.focus({ preventScroll: true });
  const controller = createIntroController({
   duration: profile.duration, reduced: false,
   choice: element.querySelector('.intro-choice'), wash: element.querySelector('.intro-light-strike'),
   draw(progress) {
    const frame = introFrame(progress);
    if (!rendererAttempted && brandImages.current && progress < .52) {
     rendererAttempted = true;
     try {
      renderer = createBrandMorph(surface, brandImages.current, profile, origin, () => position('.site-header .brand-link .logo-mark'));
      element.dataset.render = 'canvas';
     } catch { /* The CSS logo masks stay visible when Canvas2D is unavailable. */ }
    }
    element.dataset.stage = frame.stage;
    element.style.setProperty('--intro-exit', String(frame.exit));
    element.style.setProperty('--intro-morph', String(frame.morph));
    element.style.setProperty('--intro-drive', String(smooth(0, .32, progress)));
    element.style.setProperty('--intro-light', String((.18 + Math.sin(progress * Math.PI) * .62) * (1 - frame.exit)));
    renderer?.draw(progress);
    if (frame.exit > 0 && !revealed) { revealed = true; onReveal(); }
   },
   complete: () => done('complete'),
  });
  animation.current = () => {
   controller.dispose();
   renderer?.dispose();
   animation.current = null;
  };
  controller.start();
 }

 const keyboard = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key === 'Escape') { event.preventDefault(); done('skip'); return; }
  if (event.key !== 'Tab') return;
  const controls = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])
   .filter(button => button.getClientRects().length && !button.closest('[inert]'));
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
 };

 return <section ref={root} className="intro-sequence" data-state={choice === null ? 'choice' : 'running'} role="dialog" aria-modal="true" aria-labelledby="intro-title" onKeyDown={keyboard}>
  <h2 id="intro-title" className="sr-only">CEO1.9</h2>
  <IntroMask />
  <div className="intro-light-strike" aria-hidden="true" />
  <BrandMorph canvasRef={canvas} />
  <div className="intro-morph-fallback" aria-hidden="true">
   <Image className="intro-fallback-hkz" src={assetUrl(assets.productionLogo)} alt="" width={256} height={256} unoptimized />
   <Image className="intro-fallback-ceo" src={assetUrl(assets.introLogo)} alt="" width={256} height={256} unoptimized />
  </div>
  <div className="intro-choice" aria-hidden={choice !== null} inert={choice !== null}>
   <div className="intro-identity">
    <div className="intro-hkz">
     <canvas ref={hkzStamp} width={256} height={256} aria-hidden="true" />
     <Image src={assetUrl(assets.productionLogo)} alt="HKZ PROD" width={256} height={256} unoptimized loading="eager" />
    </div>
    <p className="intro-presenter">HKZ GANGSTATION PRESENTS</p>
   </div>
   <Image className="intro-ceo-signature" src={assetUrl(assets.introLogo)} alt="CEO1.9" width={256} height={256} unoptimized preload />
   <div className="intro-choices">
    <AudioChoice className="intro-enter-sound" disabled={!hydrated || choice !== null} mode="sound" locale={locale} onClick={() => choose(true)} />
    <AudioChoice disabled={!hydrated || choice !== null} mode="silent" locale={locale} onClick={() => choose(false)} />
   </div>
  </div>
  <UtilityButton className="intro-skip" disabled={!hydrated} cursor="close" aria-label={fr ? 'Passer l’intro' : 'Skip intro'} onClick={() => done('skip')}>{fr ? 'PASSER' : 'SKIP'}</UtilityButton>
  {choice !== null && <div className="intro-live-sound-control"><SoundSettings locale={locale}/></div>}
  <noscript><style>{'.intro-sequence{display:none}.visual-site-shell[data-intro-state]{visibility:visible}'}</style></noscript>
 </section>;
}
