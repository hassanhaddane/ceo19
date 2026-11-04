import { gsap } from 'gsap';
import { visualEffects } from '../../lib/visualEffects.ts';

/** One reversible clock owns the decorative sheet; links remain usable throughout. */
export function createMenuController({ sheet, cut, items, signature, scope, onClosed, onStage }: {
 sheet: gsap.TweenTarget; cut: gsap.TweenTarget; items: gsap.TweenTarget; signature: gsap.TweenTarget;
 scope?: Element; onClosed: () => void; onStage?: (stage: 'opening' | 'open' | 'closing') => void;
}) {
 let disposed = false, closing = false, completed = false;
 let timeline!: gsap.core.Timeline;
 const finish = () => { if (!disposed && closing && !completed) { completed = true; onClosed(); } };
 const context = gsap.context(() => {
  timeline = gsap.timeline({ paused: true, onComplete: () => { if (!disposed && !closing) onStage?.('open'); }, onReverseComplete: finish });
  timeline.fromTo(sheet, { clipPath: 'polygon(0% 0%,0% 0%,-8% 100%,0% 100%)' }, {
   clipPath: 'polygon(0% 0%,108% 0%,100% 100%,0% 100%)', duration: visualEffects.menu.open / 1000, ease: 'power3.inOut',
  }, 0);
  timeline.fromTo(cut, { xPercent: -8, opacity: 0 }, { xPercent: 108, opacity: .6, duration: .68, ease: 'power3.inOut' }, 0)
   .to(cut, { opacity: 0, duration: .1 }, .68);
  timeline.fromTo(items, { y: 18, opacity: .45 }, { y: 0, opacity: 1, duration: .46, stagger: .045, ease: 'power3.out' }, .12);
  // Keep the CSS translate used for row positioning independent from GSAP transforms.
  timeline.fromTo(signature, { clipPath: 'inset(50% 0)', opacity: 0 }, { clipPath: 'inset(0% 0)', opacity: 1, duration: .3, ease: 'power2.out' }, .44);
 }, scope);
 return {
  timeline,
  open() { if (disposed) return; onStage?.('opening'); timeline.play(0); },
  close() {
   if (disposed || closing) return;
   closing = true; onStage?.('closing');
   if (timeline.time() === 0) finish();
   else timeline.timeScale(visualEffects.menu.open / visualEffects.menu.close).reverse();
  },
  settle() { if (disposed) return; if (closing) { timeline.pause(); finish(); } else { timeline.progress(1).pause(); onStage?.('open'); } },
  dispose() { disposed = true; context.revert(); },
 };
}
