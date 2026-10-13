'use client';
import {useEffect,useRef,useState,type AnchorHTMLAttributes,type MouseEvent,type CSSProperties} from 'react';
import {isSignalMotionEnabled} from '@/lib/signalMotion';
import {motion} from '@/lib/motion';
import {signalInteraction} from '@/lib/interactions';
const restores=new Set<()=>void>();
const restorePage=()=>restores.forEach(restore=>restore());
export type ExitWorld='instagram'|'tiktok'|'youtube'|'spotify'|'studio'|'language';
/** Real links remain available to modified clicks, context menus and visitors without JS. */
export function ExitLink({world,children,onClick,...props}:AnchorHTMLAttributes<HTMLAnchorElement>&{world:ExitWorld}){
 const [leaving,setLeaving]=useState(false),timer=useRef(0);
 useEffect(()=>{const restore=()=>{setLeaving(false);delete document.documentElement.dataset.exitWorld;};if(restores.size===0)window.addEventListener('pageshow',restorePage);restores.add(restore);return()=>{clearTimeout(timer.current);restores.delete(restore);if(restores.size===0)window.removeEventListener('pageshow',restorePage);delete document.documentElement.dataset.exitWorld;};},[]);
 function leave(event:MouseEvent<HTMLAnchorElement>){
  onClick?.(event);
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  if(world==='language'&&event.currentTarget.getAttribute('aria-current')){event.preventDefault();return;}
  if(!isSignalMotionEnabled())return;
  event.preventDefault();if(leaving)return;
  const href=event.currentTarget.href;
  setLeaving(true);if(world!=='language')document.documentElement.dataset.exitWorld=world;signalInteraction(world==='spotify'?'pulse':world==='studio'?'studio':'print');
  timer.current=window.setTimeout(()=>window.location.assign(href),world==='language'?motion.language:motion.exits[world]);
 }
 return <a {...props} onClick={leave} style={{...props.style,'--exit-duration':`${world==='language'?motion.language:motion.exits[world]}ms`} as CSSProperties} data-exit={world} data-leaving={leaving} data-interaction="silent" data-owned-interaction>{children}</a>;
}
