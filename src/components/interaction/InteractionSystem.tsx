'use client';
import {useEffect,useRef} from 'react';
import {useSignalMotion} from '@/lib/signalMotion';
import {motion} from '@/lib/motion';
import {interactionEvent,signalInteraction,type Interaction,type InteractionKind} from '@/lib/interactions';
/** Delegated physical controls and one reusable graphic response, never a continuous loop. */
export function InteractionSystem(){
 const flash=useRef<HTMLDivElement>(null),stamp=useRef<HTMLSpanElement>(null);
 const enabled=useSignalMotion();
 useEffect(()=>{
  const surface=flash.current,label=stamp.current;if(!surface||!label)return;
  document.documentElement.dataset.interactionMotion=String(enabled);
  const visibility=()=>{document.documentElement.dataset.documentVisible=String(!document.hidden);};visibility();document.addEventListener('visibilitychange',visibility);
  const fine=window.matchMedia('(hover:hover) and (pointer:fine)');
  let magnetic:HTMLElement|null=null,frame=0,lastImpact=0;
  const animations=new Set<Animation>();
  const animate=(element:HTMLElement,keyframes:Keyframe[],duration:number,easing:string=motion.ease)=>{
   const animation=element.animate(keyframes,{duration,easing});animations.add(animation);
   animation.onfinish=()=>animations.delete(animation);animation.oncancel=()=>animations.delete(animation);return animation;
  };
  const respond=(event:Event)=>{
   const {kind,label:text}=(event as CustomEvent<Interaction>).detail;
   if(!enabled||kind==='print')return;
   // Low-intensity edge exposure, rate limited: no white full-screen camera strobe.
   const impact=['camera','cinema','walls','channel','close'].includes(kind);
   const now=performance.now();if(impact&&now-lastImpact<motion.impact)return;if(impact)lastImpact=now;
   surface.getAnimations().forEach(animation=>animation.cancel());
   surface.dataset.kind=kind;label.textContent=text??'';
   if(typeof surface.showPopover==='function'&&!surface.matches(':popover-open'))surface.showPopover();
   const effect=animate(surface,[{opacity:0,clipPath:'inset(0 50% 0 50%)'},{opacity:1,clipPath:'inset(0)',offset:.18},{opacity:0,clipPath:'inset(0)'}],kind==='cinema'?motion.cinematic:motion.impact);
   effect.onfinish=()=>{animations.delete(effect);if(surface.matches(':popover-open'))surface.hidePopover();};
  };
  const click=(event:MouseEvent)=>{
   const element=(event.target as Element)?.closest<HTMLElement>('a,button,input[type="range"]');
   if(!element||element.matches(':disabled'))return;
   const silent=element.dataset.interaction==='silent';
   const explicit=silent?undefined:element.dataset.interaction as InteractionKind|undefined;
   const kind=explicit??(element.matches('[data-analytics="language_change"]')?'language':element.matches('.menu-toggle')?'walls':element.matches('.viewer-close')?'close':element.matches('[data-cursor="listen"],.player-play,.player-sources button')?'pulse':'print');
   if(enabled&&!element.hasAttribute('data-owned-interaction')){
    // Individual keyframes preserve each element's authored transform and mask.
    const transform=getComputedStyle(element).transform;
    animate(element,[{transform},{transform:`${transform==='none'?'':transform} scale(.97)`},{transform}],motion.snap,motion.snapEase);
   }
   if(!silent&&kind!=='print')signalInteraction(kind);
  };
  const resetMagnetic=()=>{if(magnetic){magnetic.style.removeProperty('translate');magnetic=null;}};
  const pointer=(event:PointerEvent)=>{
   if(document.hidden||!enabled||!fine.matches||event.pointerType!=='mouse')return;
   const target=(event.target as Element)?.closest<HTMLElement>('[data-magnetic],.deck-platforms a,.closing-professional a,.press-socials a');
   if(target!==magnetic){resetMagnetic();magnetic=target??null;}
   if(!magnetic)return;
   const rect=magnetic.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width-.5,y=(event.clientY-rect.top)/rect.height-.5;
   if(frame)cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{frame=0;if(magnetic)magnetic.style.translate=`${x*motion.magnetic}px ${y*motion.magnetic}px`;});
  };
  window.addEventListener(interactionEvent,respond);document.addEventListener('click',click);document.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('pointerleave',resetMagnetic);window.addEventListener('blur',resetMagnetic);
  return()=>{document.removeEventListener('visibilitychange',visibility);delete document.documentElement.dataset.documentVisible;delete document.documentElement.dataset.interactionMotion;cancelAnimationFrame(frame);if(surface.matches(':popover-open'))surface.hidePopover();resetMagnetic();animations.forEach(animation=>animation.cancel());window.removeEventListener(interactionEvent,respond);document.removeEventListener('click',click);document.removeEventListener('pointermove',pointer);document.removeEventListener('pointerleave',resetMagnetic);window.removeEventListener('blur',resetMagnetic);};
 },[enabled]);
 return <div ref={flash} className="interaction-flash" popover="manual" aria-hidden="true"><span ref={stamp}/></div>;
}
