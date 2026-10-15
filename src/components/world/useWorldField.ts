'use client';
import { useEffect, type RefObject } from 'react';
import { animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { visualEffects } from '@/lib/visualEffects';
/** Small damped camera tilt complements the independent shared depth layers. */
export function useWorldField(ref: RefObject<HTMLDivElement | null>, motion: boolean) {
 useEffect(() => {
  const field = ref.current; if (!field || !motion) return;
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  let x = 0, y = 0, tx = 0, ty = 0, frame = 0, visible = false;
  const draw = () => {
   frame = 0; if (document.hidden || !visible) return;
   x += (tx - x) * visualEffects.parallax.interpolation; y += (ty - y) * visualEffects.parallax.interpolation;
   field.style.setProperty('--world-tilt-x', `${(-y * 5).toFixed(3)}deg`);
   field.style.setProperty('--world-tilt-y', `${(x * 8).toFixed(3)}deg`);
   if (Math.abs(tx - x) + Math.abs(ty - y) > .001) frame = requestAnimationFrame(draw);
  };
  const wake = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw); };
  const move = (event: PointerEvent) => {
   if (!fine.matches || event.pointerType !== 'mouse') return;
   const rect = field.getBoundingClientRect(); tx = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)); ty = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1)); wake();
  };
  const reset = () => { tx = ty = 0; wake(); };
  const visibility = () => { cancelAnimationFrame(frame); frame = 0; if (!document.hidden) wake(); };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } }); observer.observe(field);
  animationStatus('world', 'ready');
  const unregister = registerAnimationProbe('world', () => ({ visible, framePending: !!frame, x, y }));
  field.addEventListener('pointermove', move, { passive: true }); field.addEventListener('pointerleave', reset);
  document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', reset);
  return () => { unregister(); animationStatus('world', 'disposed'); observer.disconnect(); cancelAnimationFrame(frame); field.removeEventListener('pointermove', move); field.removeEventListener('pointerleave', reset); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', reset); field.style.removeProperty('--world-tilt-x'); field.style.removeProperty('--world-tilt-y'); };
 }, [ref, motion]);
}
