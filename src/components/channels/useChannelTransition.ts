'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import type {Release} from '@/types/content';
import {motion} from '@/lib/motion';
/** A cancellable physical exit before the incoming sleeve mounts. Native history and selection
 * update immediately; rapid input cancels the old request instead of queuing stale worlds. */
export function useChannelTransition(selected:Release,enabled:boolean,root:RefObject<HTMLElement|null>){
 const [displayed,setDisplayed]=useState(selected);
 const current=useRef(selected);
 useEffect(()=>{
  const element=root.current;
  if(!enabled){current.current=selected;queueMicrotask(()=>setDisplayed(selected));return;}
  if(!element||selected.id===current.current.id)return;
  let canceled=false;
  const duration=motion.channels[selected.motionProfile??'press']*motion.channelExitRatio;
  const sleeve=element.querySelector<HTMLElement>('.deck-artwork');
  const transform=sleeve?getComputedStyle(sleeve).transform:'none';
  element.setAttribute('data-transition','exit');
  const animation=sleeve?.animate([{transform},{transform:`${transform==='none'?'':transform} scaleX(.08) scaleY(.96)`,clipPath:'inset(0 8%)'}],{duration,easing:motion.snapEase,fill:'forwards'});
  const enter=()=>{if(canceled)return;current.current=selected;setDisplayed(selected);element.setAttribute('data-transition','enter');};
  if(animation)animation.finished.then(enter).catch(()=>{});else queueMicrotask(enter);
  return()=>{canceled=true;animation?.cancel();element.removeAttribute('data-transition');};
 },[selected,enabled,root]);
 // An OS reduction makes the latest channel immediate; palette and composition remain intact.
 const active=enabled?displayed:selected;
 return {active,busy:enabled&&active.id!==selected.id};
}
