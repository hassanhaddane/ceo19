'use client';
import { useEffect } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { parallaxPresets, visualEffects, type ParallaxLayer } from '@/lib/visualEffects';

/** Shared frame scheduler. No pointer/scroll React state, no work once interpolation settles. */
export function GlobalParallax() {
 const enabled = useSignalMotion();
 useEffect(() => {
  if (!enabled) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const economy = (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) || (device.deviceMemory !== undefined && device.deviceMemory <= 4) || !!device.connection?.saveData;
  let nodes: { element: HTMLElement; section: HTMLElement | null; preset: typeof parallaxPresets[ParallaxLayer] }[] = [];
  let frame = 0, px = 0, py = 0, x = 0, y = 0;
  const collect = () => { nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')).flatMap(element => {
   const preset = parallaxPresets[element.dataset.parallax as ParallaxLayer];
   return preset ? [{ element, section: element.closest('section'), preset }] : [];
  }); schedule(); };
  const tick = () => {
   frame = 0; if (document.hidden) return;
   x += (px - x) * visualEffects.parallax.interpolation; y += (py - y) * visualEffects.parallax.interpolation;
   const modal = !!document.querySelector('dialog[open],.intro-sequence[data-active="true"]');
   if (modal) px = py = x = y = 0;
   const rects = new Map<HTMLElement, DOMRect>();
   // Read geometry before writing any transforms; a scene is measured once per frame.
   for (const {element,section:owner} of nodes) {
    const section=owner??(element.dataset.parallax==='video'?document.getElementById(element.dataset.scene??''):null);
    if(section&&!rects.has(section))rects.set(section,section.getBoundingClientRect());
   }
   const intensity = fine.matches && innerWidth >= 768 && !economy ? visualEffects.parallax.intensity : visualEffects.parallax.mobileIntensity;
   for (const { element, section: owningSection, preset } of nodes) {
    const section = owningSection ?? (element.dataset.parallax === 'video' ? document.getElementById(element.dataset.scene ?? '') : null);
    let progress = 0;
    if (section) {
     const rect = rects.get(section)!;
     if (rect.bottom < -120 || rect.top > innerHeight + 120) continue;
     progress = Math.max(-1, Math.min(1, (innerHeight * .5 - (rect.top + rect.height * .5)) / innerHeight));
    }
    let tx = modal ? 0 : x * preset.x * intensity;
    let ty = modal ? 0 : (y * preset.y - progress * preset.scroll) * intensity;
    if (element instanceof HTMLImageElement) {
     // Crop margins bound image movement, so even small gallery prints never expose an edge.
     tx = Math.max(-element.clientWidth * .035, Math.min(element.clientWidth * .035, tx));
     ty = Math.max(-element.clientHeight * .035, Math.min(element.clientHeight * .035, ty));
    }
    element.style.translate = `${tx.toFixed(2)}px ${ty.toFixed(2)}px`;
    element.style.rotate = `${modal ? 0 : x * preset.rotate * intensity}deg`;
   }
   if (Math.abs(px - x) + Math.abs(py - y) > .001) schedule();
  };
  function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
  const pointer = (event: PointerEvent) => { if (!fine.matches || event.pointerType !== 'mouse') return; px = (event.clientX / innerWidth - .5) * 2; py = (event.clientY / innerHeight - .5) * 2; schedule(); };
  const reset = () => { px = py = 0; schedule(); };
  const visibility = () => { cancelAnimationFrame(frame); frame = 0; if (!document.hidden) schedule(); };
  const observer = new MutationObserver(collect); observer.observe(document.querySelector('.visual-site-shell') ?? document.body, { childList: true, subtree: true });
  const modalObserver = new MutationObserver(schedule); modalObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['open'] });
  collect();
  document.addEventListener('pointermove', pointer, { passive: true }); document.addEventListener('pointerleave', reset);
  window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule); window.addEventListener('blur', reset);
  document.addEventListener('visibilitychange', visibility); fine.addEventListener('change', reset);
  return () => {
   cancelAnimationFrame(frame); observer.disconnect(); modalObserver.disconnect(); nodes.forEach(({ element }) => { element.style.removeProperty('translate'); element.style.removeProperty('rotate'); });
   document.removeEventListener('pointermove', pointer); document.removeEventListener('pointerleave', reset); window.removeEventListener('scroll', schedule);
   window.removeEventListener('resize', schedule); window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', visibility); fine.removeEventListener('change', reset);
  };
 }, [enabled]);
 return null;
}
