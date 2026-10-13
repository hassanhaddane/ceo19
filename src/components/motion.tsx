'use client';
import { useEffect } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { motion } from '@/lib/motion';
/** Scene motion is scroll-derived and reversible; no clocks, scroll pinning or wheel interception. */
export function Motion() {
 const enabled=useSignalMotion();
 useEffect(()=>{
  let disposed=false,cleanup:(()=>void)|undefined;
  if(!enabled)return;
  Promise.all([import('gsap'),import('gsap/ScrollTrigger')]).then(([{gsap},{ScrollTrigger}])=>{
   if(disposed)return;
   gsap.registerPlugin(ScrollTrigger);
   const media=gsap.matchMedia();
   media.add('(min-width:0px)',()=>{
    const context=gsap.context(()=>{
     gsap.utils.toArray<HTMLElement>('[data-punchline]').forEach(element=>gsap.fromTo(element,{xPercent:-motion.phraseTravel},{xPercent:motion.phraseTravel,ease:'none',scrollTrigger:{trigger:element.closest('.night-scene'),start:'top bottom',end:'bottom top',scrub:true}}));
     // SectionPortal: distinct, reversible entrances; DOM stays complete without animation.
     const entrances=[
      {selector:'#channels .deck-art-stage',from:{clipPath:'inset(0 100% 0 0)',rotation:2}},
      {selector:'#archive .archive-wall',from:{clipPath:'inset(48% 0)'}},
      {selector:'#world .world-wall',from:{xPercent:3}},
      {selector:'#connect .social-zones',from:{clipPath:'inset(0 0 100% 0)'}},
     ];
     entrances.forEach(({selector,from})=>gsap.utils.toArray<HTMLElement>(selector).forEach(element=>gsap.from(element,{...from,duration:motion.glide/1000,ease:motion.gsapEase,scrollTrigger:{trigger:element.closest('section'),start:'top 80%',toggleActions:'play none none reverse'}})));

     // Material hand-offs share the real images and geometry; no new sections or scroll ownership.
     const homePhoto=document.querySelector('.campaign-takeover-photo');
     if(homePhoto)gsap.to(homePhoto,{scale:.62,rotation:0,clipPath:'inset(0)',ease:'none',scrollTrigger:{trigger:'#channels',start:'top 95%',end:'top 35%',scrub:true}});
     const channels=document.getElementById('channels');
     if(channels)gsap.fromTo(channels,{'--contact-progress':0},{'--contact-progress':1,ease:'none',scrollTrigger:{trigger:'#archive',start:'top 92%',end:'top 25%',scrub:true}});
     const archive=document.getElementById('archive');
     if(archive)gsap.fromTo(archive,{'--memory-progress':0},{'--memory-progress':1,ease:'none',scrollTrigger:{trigger:'#world',start:'top 90%',end:'top 25%',scrub:true}});
     gsap.utils.toArray<HTMLElement>('#world .world-studio-print,#world .world-doorway,#world .world-chrome').forEach((element,i)=>gsap.from(element,{yPercent:3+i*2,ease:'none',scrollTrigger:{trigger:'#world',start:'top 85%',end:'top 25%',scrub:true}}));
     gsap.fromTo('#connect .connect-signature',{yPercent:8},{yPercent:-4,ease:'none',scrollTrigger:{trigger:'#connect',start:'top 90%',end:'bottom bottom',scrub:true}});
     gsap.utils.toArray<SVGPathElement>('.night-scene [data-passage-line]').forEach(element=>{const length=element.getTotalLength();gsap.fromTo(element,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:element.closest('.night-scene'),start:'top 95%',end:'top 15%',scrub:true}});});
    });return()=>context.revert();
   });cleanup=()=>media.revert();
  });
  return()=>{disposed=true;cleanup?.();};
 },[enabled]);
 return null;
}
