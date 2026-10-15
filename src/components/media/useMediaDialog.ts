'use client';
import { useLayoutEffect, useRef, type RefObject } from 'react';
function restoreFocus(trigger:HTMLElement|null,opener:RefObject<HTMLElement|null>){
 // Film navigation may replace the original trigger; resolve the current, connected control on exit.
 const control=trigger?.isConnected?trigger:opener.current;
 const stranded=document.activeElement===document.body||!!document.activeElement?.closest('dialog:not([open])');
 if(control?.isConnected&&stranded&&!document.querySelector('dialog[open]'))control.focus({preventScroll:true});
}
/** Native showModal supplies inert background and focus containment; preserve existing scroll styles. */
export function useMediaDialog(open:boolean, providedOpener?:RefObject<HTMLElement|null>) {
 const dialog=useRef<HTMLDialogElement>(null);
 const localOpener=useRef<HTMLElement|null>(null);
 const openerRef=providedOpener??localOpener;
 useLayoutEffect(()=>{
  const element=dialog.current;
  if(!open||!element) return;
  const trigger=openerRef.current;
  const overflow=document.body.style.overflow;
  const rootOverflow=document.documentElement.style.overflow;
  const padding=document.body.style.paddingRight;
  const scrollbar=Math.max(0,window.innerWidth-document.documentElement.clientWidth);
  document.body.style.overflow='hidden';
  document.documentElement.style.overflow='hidden';
  if(scrollbar) document.body.style.paddingRight=`${scrollbar}px`;
  element.showModal();
  const containFocus=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const controls=Array.from(element.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], iframe, [tabindex="0"]')).filter(control=>control.getClientRects().length>0&&!control.closest('[inert], [hidden]'));
   const first=controls[0],last=controls[controls.length-1];
   if(!first||!last){event.preventDefault();element.focus();return;}
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  element.addEventListener('keydown',containFocus);
  return()=>{
   element.removeEventListener('keydown',containFocus);
   // The native close event runs after top-layer/inert teardown and the menu's
   // visibility cleanup. Restoring earlier can leave focus on a hidden opener.
   if(element.open){
    element.addEventListener('close',()=>{ setTimeout(()=>restoreFocus(trigger,openerRef),0); },{once:true});
    element.close();
   }
   document.body.style.overflow=overflow;document.documentElement.style.overflow=rootOverflow;document.body.style.paddingRight=padding;
   restoreFocus(trigger,openerRef);
   // Reduced-motion menus can close before their visibility effect is cleaned up.
   // Retry once after that cleanup, without stealing focus from another dialog/control.
   requestAnimationFrame(()=>restoreFocus(trigger,openerRef));
   window.dispatchEvent(new Event('ceo:overlay-close'));
  };
 },[open,openerRef]);
 return {dialog,openerRef};
}
