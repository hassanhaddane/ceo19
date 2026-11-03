'use client';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Locale } from '@/types/content';
import { assets, assetUrl } from '@/data/assets';
import { useSoundManager } from '@/features/audio/SoundProvider';
import { SoundSettings } from '@/features/audio/SoundSettings';
import { isSignalMotionEnabled, subscribeSignalMotion } from '@/lib/signalMotion';
import { BrandMorph, createBrandMorph, drawHkzMark, loadBrands } from './BrandMorph';
import { IntroMask } from './IntroMask';
import { IntroFallback } from './IntroFallback';
import { createIntroController, introFrame, introProfile, introSettings, smooth } from './IntroController';
import { AudioChoice } from '../interactive/AudioChoice';
import { UtilityButton } from '../interactive/UtilityAction';

export type IntroExit = 'complete' | 'skip' | 'unavailable' | 'hidden';
export function IntroSequence({ enabled, locale, onStart, onReveal, onComplete }: {
 enabled: boolean; locale: Locale; onStart: () => void; onReveal: () => void; onComplete: (reason: IntroExit) => void;
}) {
 const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null), hkz = useRef<HTMLCanvasElement>(null);
 const sound = useSoundManager();
 const [choice, setChoice] = useState<boolean | null>(null), [waiting, setWaiting] = useState(false);
 const chosen = useRef<boolean | null>(null), finished = useRef(false);
 const fr = locale === 'fr';
 const done = useCallback((reason: IntroExit) => {
  if (finished.current) return;
  finished.current = true;
  if (chosen.current === null) sound.chooseMode(false);
  if (reason === 'hidden') sound.interrupt();
  onComplete(reason);
 }, [onComplete, sound]);
 const choose = (withSound: boolean, button: HTMLButtonElement) => {
  if (chosen.current !== null || finished.current) return;
  chosen.current = withSound; // Lock immediately, before React or any animation work.
  sound.chooseMode(withSound);
  // Native MP3 playback starts synchronously inside chooseMode, in this click.
  const rect = button.getBoundingClientRect(), element = root.current;
  if (element) {
   element.style.setProperty('--entry-origin-x', `${rect.left + rect.width / 2}px`);
   element.style.setProperty('--entry-origin-y', `${rect.top + rect.height / 2}px`);
   element.style.setProperty('--entry-diameter', `${Math.hypot(innerWidth, innerHeight) * 2}px`);
  }
  setChoice(withSound);
 };
 useEffect(() => {
  sound.chooseMode(false);
  onStart();
  // Tiny inventoried logos decode while the visitor considers the two choices.
  let disposed = false;
  void loadBrands().then(brands => { if (!disposed && hkz.current) drawHkzMark(hkz.current, brands.hkz); }).catch(() => {});
  root.current?.querySelector<HTMLButtonElement>('.intro-enter-sound')?.focus({ preventScroll: true });
  return () => { disposed = true; };
 }, [onStart, sound]);
 useEffect(() => {
  const visibility = () => { if (document.hidden && chosen.current !== null) done('hidden'); };
  document.addEventListener('visibilitychange', visibility);
  return () => document.removeEventListener('visibilitychange', visibility);
 }, [done]);
 useEffect(() => {
  if (!enabled || choice === null) return;
  const element = root.current, surface = canvas.current;
  if (!element || !surface) return;
  element.querySelector<HTMLButtonElement>('.intro-skip')?.focus({ preventScroll: true });
  let disposed = false, revealed = false;
  let controller: ReturnType<typeof createIntroController> | undefined, renderer: ReturnType<typeof createBrandMorph> | undefined;
  const unsubscribe = subscribeSignalMotion(() => { if (controller && !isSignalMotionEnabled()) done('skip'); });
  const hint = setTimeout(() => { if (!disposed) setWaiting(true); }, introSettings.loadHintAfter);
  const timeout = setTimeout(() => done('unavailable'), introSettings.loadTimeout);
  void loadBrands().then(brands => {
   if (disposed || finished.current) return;
   clearTimeout(hint); clearTimeout(timeout); setWaiting(false);
   const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
   const profile = introProfile({ mobile: matchMedia('(max-width:767px)').matches,
    economy: (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || (device.deviceMemory !== undefined && device.deviceMemory <= 4) || !!device.connection?.saveData,
    reduced: !isSignalMotionEnabled() });
   const logo = element.querySelector('.intro-hkz')!.getBoundingClientRect();
   renderer = createBrandMorph(surface, brands, profile, { x: logo.left + logo.width / 2, y: logo.top + logo.height / 2, size: logo.width });
   element.dataset.reduced = String(profile.reduced);
   element.dataset.ready = 'true'; element.dataset.duration = String(profile.duration);
   const draw = (progress: number) => {
    const frame = introFrame(progress);
    element.dataset.stage = frame.stage; element.dataset.progress = progress.toFixed(4);
    element.style.setProperty('--intro-exit', String(frame.exit));
    element.style.setProperty('--intro-light', String(profile.reduced ? 0 : smooth(.08, .22, progress) * (1 - frame.exit) * .16));
    element.style.setProperty('--intro-sweep', `${-45 + smooth(.64, .95, progress) * 150}%`);
    element.style.setProperty('--intro-caption', String((1 - frame.exit) * smooth(.2, .32, progress)));
    renderer?.draw(progress);
    if (frame.exit > 0 && !revealed) { revealed = true; onReveal(); }
   };
   // One GSAP timeline coordinates graphic expansion, real logo masks and Home reveal.
   // Its finite duration never depends on audio duration, decoding or media time.
   controller = createIntroController({ duration: profile.duration, reduced: profile.reduced,
    choice: element.querySelector('.intro-choice'), wash: element.querySelector('.intro-selection-wash'), draw, complete: () => done('complete') });
   controller.start();
  }).catch(() => done('unavailable'));
  return () => {
   disposed = true; controller?.dispose(); renderer?.dispose(); clearTimeout(hint); clearTimeout(timeout); unsubscribe();
  };
 }, [enabled, choice, done, onReveal, sound]);
 const keyboard = (event: KeyboardEvent<HTMLElement>) => {
  if (event.key === 'Escape') { event.preventDefault(); done('skip'); return; }
  if (event.key !== 'Tab') return;
  const controls = Array.from(root.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []).filter(button => button.getClientRects().length);
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
 };
 const style = { '--intro-black': introSettings.color.black, '--intro-blue': introSettings.color.blue, '--intro-cream': introSettings.color.cream,
  '--intro-logo-max': `${introSettings.maxLogoSize}px`, '--intro-logo-ratio': `${introSettings.logoViewportRatio * 100}vmin` } as CSSProperties;
 return <section ref={root} className="intro-sequence" data-active="true" data-state={choice === null ? 'choice' : 'running'} data-mode={choice === null ? undefined : choice ? 'sound' : 'silent'} data-stage="black" style={style} role="dialog" aria-modal="true" aria-labelledby="intro-title" onKeyDown={keyboard}>
  <h2 id="intro-title" className="sr-only">CEO1.9</h2>
  <IntroMask />
  <div className="intro-grain" aria-hidden="true"/>
  <div className="intro-selection-wash" aria-hidden="true"/>
  <BrandMorph canvasRef={canvas} />
  <div className="intro-choice" aria-hidden={choice !== null} inert={choice !== null}>
   <div className="intro-identity"><p className="intro-presenter">HKZ GANGSTATION PRESENTS</p><canvas ref={hkz} className="intro-hkz" width={256} height={256} role="img" aria-label="HKZ PROD"/></div>
   <Image className="intro-ceo-signature" src={assetUrl(assets.introLogo)} alt="CEO1.9" width={256} height={256} loading="eager"/>
   <div className="intro-choices"><AudioChoice className="intro-enter-sound" disabled={choice !== null} mode="sound" locale={locale} onClick={event => choose(true, event.currentTarget)}/><AudioChoice disabled={choice !== null} mode="silent" locale={locale} onClick={event => choose(false, event.currentTarget)}/></div>
  </div>
  <p className="intro-caption" aria-hidden="true">HKZ GANGSTATION PRESENTS</p>
  <UtilityButton className="intro-skip" cursor="close" aria-label={fr ? 'Passer l’intro' : 'Skip intro'} onClick={() => done('skip')}>{fr ? 'PASSER' : 'SKIP'}</UtilityButton>
  {choice !== null && <div className="intro-live-sound-control"><SoundSettings locale={locale}/></div>}
  {waiting && <IntroFallback locale={locale} />}
  <noscript><style>{'.intro-sequence{display:none}.visual-site-shell .site-header{opacity:1}'}</style></noscript>
 </section>;
}
