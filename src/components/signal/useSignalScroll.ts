'use client';
import { useEffect, type RefObject } from 'react';
import type { SectionId } from '@/types/content';
import { mix, smoothstep } from './signalMath';
import { interactionEvent } from '@/lib/interactions';
import { nightScenes } from '@/data/nightWorld';
const signalSections=nightScenes.map(scene=>scene.signal);

export interface SignalRuntime {
 from: SectionId; to: SectionId; progress: number;
 x: number; y: number; width: number; height: number;
 pointerX: number; pointerY: number; playing: boolean; hover?: boolean; channelId?:string; transmissionEnergy?:number; impulse?:number;
}
/** Passive native scroll -> reversible state blend. No scroll setters, pinning or wheel handlers. */
export function useSignalScroll(runtime: RefObject<SignalRuntime>, onSection: (section: SectionId) => void) {
 useEffect(() => {
  const sections = nightScenes.map((scene) => document.getElementById(scene.id));
  const anchors = signalSections.map((id) => document.querySelector<HTMLElement>(`[data-signal-anchor="${id}"]`));
  let scheduled = 0;
  let filmFocused=false;
  const update = () => {
   scheduled = 0;
   const y = window.scrollY, h = window.innerHeight, w = window.innerWidth;
   let index = 0, t = 0;
   for (let i = 1; i < sections.length; i++) {
    const nextTop = (sections[i]?.getBoundingClientRect().top ?? Infinity) + y;
    const blend = (y - nextTop + h * .78) / (h * .56);
    if (blend >= 1) { index = i; t = 0; }
    else if (blend > 0) { index = i - 1; t = smoothstep(blend); break; }
    else break;
   }
   const next = t > 0 ? Math.min(index+1,signalSections.length-1) : index;
   const a = anchors[index]?.getBoundingClientRect(), b = anchors[next]?.getBoundingClientRect();
   if (!a || !b) return;
   const state = runtime.current;
   const deck=document.getElementById('channels');
   state.channelId=deck?.dataset.channelId;
   state.transmissionEnergy=Number(deck?.dataset.signalEnergy??1);
   state.from = (filmFocused||deck?.dataset.filmOpen==='true')&&signalSections[index]==='music'?'visuals':signalSections[index]; state.to = (filmFocused||deck?.dataset.filmOpen==='true')&&signalSections[next]==='music'?'visuals':signalSections[next]; state.progress = t;
   state.x = mix(a.left + a.width/2, b.left + b.width/2, t)/w;
   state.y = Math.max(.36, Math.min(.64, mix(a.top+a.height/2,b.top+b.height/2,t)/h));
   // The campaign sculpture follows its photograph out of view; never floats over the printed story.
   const visibility = index === 0 ? Math.max(0,Math.min(1,a.bottom/(h*.3))) : 1;
   state.width = mix(a.width*visibility,b.width,t); state.height = mix(a.height*visibility,b.height,t);
   onSection(t > .5 ? state.to : state.from);
  };
  const impulse=()=>{runtime.current.impulse=1;};
  window.addEventListener(interactionEvent,impulse);
  const schedule = () => { if (!scheduled) scheduled = requestAnimationFrame(update); };
  const filmInteraction=(event:Event)=>{const next=!!(event.target as Element)?.closest('[data-signal-mode="visuals"]');if(next!==filmFocused){filmFocused=next;schedule();}};
  document.addEventListener('pointerover',filmInteraction,{passive:true});
  document.addEventListener('focusin',filmInteraction);
  const observer = new ResizeObserver(schedule);
  const deck=document.getElementById('channels');
  const deckObserver=new MutationObserver(schedule);
  if(deck)deckObserver.observe(deck,{attributes:true,attributeFilter:['data-signal-energy','data-film-open','data-channel-id']});
  sections.forEach((element) => { if (element) observer.observe(element); });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  window.addEventListener('hashchange',schedule);
  let disposed = false;
  document.fonts.ready.then(() => { if (!disposed) schedule(); });
  update();
  return () => { disposed = true; window.removeEventListener(interactionEvent,impulse); document.removeEventListener('pointerover',filmInteraction);document.removeEventListener('focusin',filmInteraction); cancelAnimationFrame(scheduled); observer.disconnect();deckObserver.disconnect(); window.removeEventListener('scroll',schedule); window.removeEventListener('resize',schedule); window.removeEventListener('hashchange',schedule); };
 }, [runtime,onSection]);
}
