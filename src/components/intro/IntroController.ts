import { gsap } from 'gsap';

/** One finite timeline. Units are milliseconds; phases are normalized progress. */
export const introSettings = {
 duration: { desktop: 2480, mobile: 1540, reduced: 520 },
 density: { desktop: 1600, mobile: 560, economy: 260 },
 slices: { desktop: 9, mobile: 5, economy: 4 },
 depth: { desktop: 180, mobile: 70, economy: 36 },
 maxDpr: 1.5, textureSize: 256, maxLogoSize: 280, logoViewportRatio: .48,
 loadHintAfter: 180, loadTimeout: 1400,
 phases: { black: .055, reveal: .22, hold: .31, morph: .64, settle: .78 },
 color: { black: '#020304', blue: '#3572a3', cream: '#eae5d6' },
} as const;
export type IntroProfile = { duration: number; density: number; slices: number; depth: number; reduced: boolean };
export function introProfile({ mobile, economy, reduced }: { mobile: boolean; economy: boolean; reduced: boolean }): IntroProfile {
 return { duration: reduced ? introSettings.duration.reduced : mobile ? introSettings.duration.mobile : introSettings.duration.desktop,
  density: reduced ? 0 : economy ? introSettings.density.economy : mobile ? introSettings.density.mobile : introSettings.density.desktop,
  slices: economy ? introSettings.slices.economy : mobile ? introSettings.slices.mobile : introSettings.slices.desktop,
  depth: reduced ? 0 : economy ? introSettings.depth.economy : mobile ? introSettings.depth.mobile : introSettings.depth.desktop, reduced };
}
export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const smooth = (from: number, to: number, value: number) => { const t = clamp((value - from) / (to - from)); return t * t * (3 - 2 * t); };
export function introFrame(progress: number) {
 const p = clamp(progress), phase = introSettings.phases;
 return { progress: p, reveal: smooth(phase.black, phase.reveal, p), morph: smooth(phase.hold, phase.morph, p), exit: smooth(phase.settle, 1, p),
  stage: p < phase.black ? 'black' : p < phase.reveal ? 'hkz-reveal' : p < phase.hold ? 'hkz-hold' : p < phase.morph ? 'morph' : p < phase.settle ? 'ceo-settle' : 'home-reveal' };
}
/** One GSAP clock coordinates expansion, source masks and the opening matte.
 * Completion/Skip disposal cannot leave a second RAF or queued logo callback alive. */
export function createIntroController({ duration, reduced, choice, wash, draw, complete }: {
 duration: number; reduced: boolean; choice: gsap.TweenTarget; wash: gsap.TweenTarget;
 draw: (progress: number) => void; complete: () => void;
}) {
 let started = false, disposed = false, completed = false;
 const clock = { progress: 0 };
 const timeline = gsap.timeline({ paused: true, onComplete: () => {
  if (disposed || completed) return; completed = true; complete();
 } });
 timeline.to(choice, { opacity: 0, duration: reduced ? .08 : .2, ease: 'power2.out' }, 0);
 if (!reduced) timeline.fromTo(wash, { scale: 0, opacity: .8 }, { scale: 1, opacity: .8, duration: .36, ease: 'power3.in' }, 0)
  .to(wash, { opacity: 0, duration: .28, ease: 'power2.out' }, .36);
 timeline.to(clock, { progress: 1, duration: duration / 1000, ease: 'none', onUpdate: () => { if (!disposed) draw(clock.progress); } }, 0);
 return {
  timeline,
  start() { if (started || disposed) return; started = true; draw(0); timeline.play(0); },
  dispose() { disposed = true; timeline.kill(); },
 };
}
