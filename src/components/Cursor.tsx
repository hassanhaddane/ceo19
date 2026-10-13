'use client';
import {useEffect,useRef} from 'react';
import {useSignalMotion} from '@/lib/signalMotion';
import type {Locale} from '@/types/content';
import {editorialCopy} from '@/data/editorial';
export function Cursor({locale}:{locale:Locale}){
 const enabled=useSignalMotion();
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const cursor=ref.current;if(!cursor||!enabled||typeof cursor.showPopover!=='function')return;
  const media=window.matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  let frame=0,x=0,y=0,initialized=false;
  const reset=()=>{initialized=false;cancelAnimationFrame(frame);frame=0;delete document.documentElement.dataset.cursorReady;cursor.hidden=true;if(cursor.matches(':popover-open'))cursor.hidePopover();};
  const update=(event:PointerEvent)=>{
   const cinemaPhase=document.documentElement.dataset.cinemaPhase;
   if(initialized&&media.matches&&(cinemaPhase==='entering'||cinemaPhase==='exiting')){cursor.setAttribute('data-locked','true');return;}
   if(!media.matches||event.pointerType!=='mouse'||(event.target as Element)?.closest('iframe')){reset();return;}
   const target=(event.target as Element)?.closest<HTMLElement>('[data-cursor],a,button');
   const phase=document.documentElement.dataset.cinemaPhase;
   const locked=phase==='entering'||phase==='exiting'||!!document.documentElement.dataset.exitWorld;
   const state=locked?'enter':target?.dataset.cursor??(target?'enter':'default');
   cursor.setAttribute('data-locked',String(locked));
   cursor.textContent=editorialCopy[locale].cursor[state as keyof typeof editorialCopy.en.cursor]??'';
   cursor.dataset.state=state;cursor.hidden=false;if(!cursor.matches(':popover-open'))cursor.showPopover();x=event.clientX;y=event.clientY;
   if(!frame)frame=requestAnimationFrame(()=>{frame=0;initialized=true;cursor.style.transform=`translate3d(${x}px,${y}px,0)`;document.documentElement.dataset.cursorReady='true';});
  };
  const cinemaCursor=()=>{if(document.documentElement.dataset.exitWorld){cursor.setAttribute('data-locked','true');cursor.textContent='';return;}const phase=document.documentElement.dataset.cinemaPhase;if(initialized&&media.matches&&(phase==='entering'||phase==='exiting')){cursor.setAttribute('data-locked','true');cursor.textContent='';return;}cursor.setAttribute('data-locked','false');if(!phase)reset();};
  const cinemaObserver=new MutationObserver(cinemaCursor);cinemaObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-cinema-phase','data-exit-world']});
  const modalObserver=new MutationObserver(()=>{const phase=document.documentElement.dataset.cinemaPhase;if(phase==='entering'||phase==='exiting')cinemaCursor();else reset();});modalObserver.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('pointermove',update,{passive:true});document.addEventListener('pointerleave',reset);window.addEventListener('blur',reset);media.addEventListener('change',reset);
  return()=>{cancelAnimationFrame(frame);reset();modalObserver.disconnect();cinemaObserver.disconnect();document.removeEventListener('pointermove',update);document.removeEventListener('pointerleave',reset);window.removeEventListener('blur',reset);media.removeEventListener('change',reset);};
 },[locale,enabled]);
 return <div ref={ref} className="ceo-cursor" popover="manual" hidden aria-hidden="true"/>;
}
