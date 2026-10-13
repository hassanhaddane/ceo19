'use client';
import {useSyncExternalStore} from 'react';
let override:boolean|null=null,query:MediaQueryList|null=null;
const listeners=new Set<()=>void>();
const notify=()=>listeners.forEach(listener=>listener());
function subscribe(listener:()=>void){
 if(listeners.size===0){query=window.matchMedia('(prefers-reduced-motion: reduce)');query.addEventListener('change',notify);}
 listeners.add(listener);
 return()=>{listeners.delete(listener);if(listeners.size===0){query?.removeEventListener('change',notify);query=null;}};
}
/** Session-only preference; one shared system listener, also readable by click-only controls. */
export function setSignalMotion(enabled:boolean){override=enabled;notify();}
export function isSignalMotionEnabled(){return typeof window==='undefined'?false:override??!(query??window.matchMedia('(prefers-reduced-motion: reduce)')).matches;}
export function useSignalMotion(){return useSyncExternalStore(subscribe,isSignalMotionEnabled,()=>false);}
