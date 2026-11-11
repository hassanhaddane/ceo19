import { gsap } from 'gsap';

/** One finite timeline. Units are milliseconds; phases are normalized progress. */
export const introSettings = {
 duration: { desktop: 1860, mobile: 1370, reduced: 220 },
 density: { desktop: 1080, mobile: 460, economy: 230 },
 slices: { desktop: 12, mobile: 7, economy: 5 },
 depth: { desktop: 260, mobile: 115, economy: 70 },
 maxDpr: 1.5, textureSize: 256, maxLogoSize: 440, logoViewportRatio: .57,
 phases: { black: .015, reveal: .17, hold: .22, morph: .61, settle: .68 },
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
 if (!reduced) timeline.fromTo(wash, { xPercent: -75, opacity: 0 }, { xPercent: 12, opacity: .8, duration: .32, ease: 'power3.out' }, 0)
  .to(wash, { xPercent: 120, opacity: 0, duration: .28, ease: 'power2.in' }, .32);
 timeline.to(clock, { progress: 1, duration: duration / 1000, ease: 'none', onUpdate: () => { if (!disposed) draw(clock.progress); } }, 0);
 return {
  timeline,
  start() { if (started || disposed) return; started = true; draw(0); timeline.play(0); },
  dispose() { disposed = true; timeline.kill(); },
 };
}
