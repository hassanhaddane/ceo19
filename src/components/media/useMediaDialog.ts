'use client';
import {signalInteraction} from '@/lib/interactions';
import { useEffect, useRef, type RefObject } from 'react';
function restoreFocus(trigger:HTMLElement|null,opener:RefObject<HTMLElement|null>){
 // Film navigation may replace the original trigger; resolve the current, connected control on exit.
 (trigger?.isConnected?trigger:opener.current)?.focus({preventScroll:true});
}
/** Native showModal supplies inert background and focus containment; preserve existing scroll styles. */
export function useMediaDialog(open:boolean, providedOpener?:RefObject<HTMLElement|null>) {
 const dialog=useRef<HTMLDialogElement>(null);
 const localOpener=useRef<HTMLElement|null>(null);
 const openerRef=providedOpener??localOpener;
 useEffect(()=>{
  const element=dialog.current;
  if(!open||!element) return;
  const trigger=openerRef.current;
  const overflow=document.body.style.overflow;
  const padding=document.body.style.paddingRight;
  const scrollbar=Math.max(0,window.innerWidth-document.documentElement.clientWidth);
  document.body.style.overflow='hidden';
  if(scrollbar) document.body.style.paddingRight=`${scrollbar}px`;
  element.showModal();
  if(!element.hasAttribute('data-owned-interaction'))signalInteraction(element.classList.contains('archive-viewer')?'camera':element.classList.contains('menu-dialog')?'walls':'cinema');
  const containFocus=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const controls=Array.from(element.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe, [tabindex="0"]')).filter(control=>control.getClientRects().length>0&&!control.closest('[inert], [hidden]'));
   const first=controls[0],last=controls[controls.length-1];
   if(!first||!last){event.preventDefault();element.focus();return;}
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  element.addEventListener('keydown',containFocus);
  return()=>{element.removeEventListener('keydown',containFocus);if(!element.hasAttribute('data-owned-interaction'))signalInteraction('close');element.close();document.body.style.overflow=overflow;document.body.style.paddingRight=padding;restoreFocus(trigger,openerRef);};
 },[open,openerRef]);
 return {dialog,openerRef};
}
