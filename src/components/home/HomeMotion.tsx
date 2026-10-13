'use client';
import { useEffect } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import {motion} from '@/lib/motion';
import { homeCampaign } from '@/data/homeCampaign';
/** Native, reversible scroll; each layer has its own depth without a continuous animation loop. */
export function HomeMotion() {
 const enabled = useSignalMotion();
 useEffect(() => {
  if(!enabled) return;
  let disposed = false, cleanup: (() => void) | undefined;
  Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
   if (disposed) return;
   const root = document.getElementById('home');
   if (!root) return;
   gsap.registerPlugin(ScrollTrigger);
   const media = gsap.matchMedia();
   media.add('(min-width:0px)', () => {
    const context = gsap.context(() => {
     gsap.from('.campaign-portrait', { clipPath: 'inset(0 0 100% 0)', duration: motion.cinematic/1000, ease: motion.gsapEase });
     gsap.to('.campaign-portrait', { yPercent: homeCampaign.motion.portraitTravel, scale: homeCampaign.motion.photoScale, ease: 'none', scrollTrigger: { trigger: '.campaign-hero', start: 'top top', end: 'bottom top', scrub: true } });
     gsap.fromTo('.campaign-passage span', { xPercent: homeCampaign.motion.phraseTravel }, { xPercent: -homeCampaign.motion.phraseTravel, ease: 'none', scrollTrigger: { trigger: '.campaign-passage', start: 'top bottom', end: 'bottom top', scrub: true } });
     gsap.from('.campaign-blue-field', { clipPath: 'polygon(0 100%,100% 86%,100% 100%,0 100%)', ease: 'none', scrollTrigger: { trigger: '.campaign-takeover', start: 'top 95%', end: 'top 20%', scrub: true } });
     gsap.from('.campaign-takeover h2 span', { clipPath: 'inset(0 0 100% 0)', stagger: .12, ease: 'none', scrollTrigger: { trigger: '.campaign-takeover', start: 'top 85%', end: 'top 10%', scrub: true } });
     gsap.to('.campaign-takeover-photo', { rotation: -4, yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.campaign-takeover', start: 'top bottom', end: 'bottom top', scrub: true } });
    }, root);
    return () => context.revert();
   });
   media.add('(hover:hover) and (pointer:fine)', () => {
    const depth = root.querySelector<HTMLElement>('.campaign-portrait-depth');
    if (!depth) return;
    const x = gsap.quickTo(depth, 'x', { duration: motion.glide/1000, ease: motion.gsapEase });
    const y = gsap.quickTo(depth, 'y', { duration: motion.glide/1000, ease: motion.gsapEase });
    const move = (event: PointerEvent) => {
     if (event.pointerType !== 'mouse' || document.hidden) return;
     x((event.clientX / window.innerWidth - .5) * homeCampaign.motion.pointerTravel);
     y((event.clientY / window.innerHeight - .5) * homeCampaign.motion.pointerTravel);
    };
    const reset = () => { x(0); y(0); };
    root.addEventListener('pointermove', move, { passive: true }); root.addEventListener('pointerleave', reset);
    return () => { root.removeEventListener('pointermove', move); root.removeEventListener('pointerleave', reset); x.tween.kill(); y.tween.kill(); gsap.set(depth, { clearProps: 'transform' }); };
   });
   cleanup = () => media.revert();
  });
  return () => { disposed = true; cleanup?.(); };
 }, [enabled]);
 return null;
}
