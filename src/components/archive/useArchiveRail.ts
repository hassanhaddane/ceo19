'use client';
import { useEffect, useRef, type RefObject, type KeyboardEvent, type MouseEvent } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
/** Native touch/trackpad momentum; a bounded mouse fling, with vertical wheel released at rail ends. */
export function useArchiveRail(rail:RefObject<HTMLDivElement|null>) {
 const motion=useSignalMotion(),suppressClick=useRef(false),stopRef=useRef<()=>void>(()=>{});
 useEffect(()=>{
  const element=rail.current;if(!element)return;
  let frame=0,dragging=false,active=false,startX=0,startScroll=0,lastX=0,lastTime=0,velocity=0;
  const stop=()=>{cancelAnimationFrame(frame);frame=0;velocity=0;};stopRef.current=stop;
  const down=(event:PointerEvent)=>{
   if(event.pointerType!=='mouse'||event.button!==0)return;
   stop();dragging=true;active=false;startX=lastX=event.clientX;startScroll=element.scrollLeft;lastTime=performance.now();suppressClick.current=false;
  };
  const move=(event:PointerEvent)=>{
   if(!dragging)return;
   if(!active&&Math.abs(event.clientX-startX)<7)return;
   if(!active){active=true;element.setPointerCapture(event.pointerId);element.dataset.dragging='true';}
   const now=performance.now(),dt=Math.max(8,now-lastTime);
   velocity=velocity*.35+(lastX-event.clientX)/dt*.65;
   element.scrollLeft=startScroll+startX-event.clientX;lastX=event.clientX;lastTime=now;
  };
  const finish=()=>{
   if(!dragging)return;dragging=false;element.dataset.dragging='false';suppressClick.current=active;
   if(!motion||!active||Math.abs(velocity)<.04||performance.now()-lastTime>100)return;
   let previous=performance.now();
   const fling=(now:number)=>{const dt=Math.min(32,now-previous);previous=now;const before=element.scrollLeft;element.scrollLeft+=velocity*dt;velocity*=Math.pow(.9,dt/16.67);if(Math.abs(velocity)>.025&&Math.abs(element.scrollLeft-before)>.1)frame=requestAnimationFrame(fling);else stop();};
   frame=requestAnimationFrame(fling);
  };
  const wheel=(event:WheelEvent)=>{
   stop();if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
   const max=element.scrollWidth-element.clientWidth,amount=event.deltaY*(event.deltaMode===1?24:event.deltaMode===2?element.clientWidth:1);
   if((amount>0&&element.scrollLeft<max-1)||(amount<0&&element.scrollLeft>1)){event.preventDefault();element.scrollLeft+=amount;}
  };
  const cancel=()=>{dragging=false;element.dataset.dragging='false';stop();};
  const visibility=()=>{if(document.hidden){stop();dragging=false;element.dataset.dragging='false';}};
  element.addEventListener('pointerdown',down);element.addEventListener('pointermove',move);element.addEventListener('pointerup',finish);element.addEventListener('pointercancel',cancel);
  // Mouse release outside the rail still ends a drag before capture has begun.
  window.addEventListener('pointerup',finish);element.addEventListener('wheel',wheel,{passive:false});document.addEventListener('visibilitychange',visibility);
  return()=>{stop();element.removeEventListener('pointerdown',down);element.removeEventListener('pointermove',move);element.removeEventListener('pointerup',finish);element.removeEventListener('pointercancel',cancel);window.removeEventListener('pointerup',finish);element.removeEventListener('wheel',wheel);document.removeEventListener('visibilitychange',visibility);};
 },[rail,motion]);
 function reset(){stopRef.current();rail.current?.scrollTo({left:0,behavior:'instant'});}
 function clickCapture(event:MouseEvent<HTMLDivElement>){if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}}
 function page(direction:number){stopRef.current();const element=rail.current;if(element)element.scrollBy({left:direction*element.clientWidth*.72,behavior:motion?'smooth':'instant'});}
 function keyboard(event:KeyboardEvent<HTMLDivElement>){
  if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;
  event.preventDefault();stopRef.current();const element=rail.current;if(!element)return;
  const controls=Array.from(element.querySelectorAll<HTMLButtonElement>('.archive-image-surface'));
  const current=controls.indexOf(document.activeElement as HTMLButtonElement);
  const index=event.key==='Home'?0:event.key==='End'?controls.length-1:Math.max(0,Math.min(controls.length-1,current+(event.key==='ArrowRight'?1:-1)));
  const button=controls[index];if(!button)return;
  button.focus({preventScroll:true});element.scrollTo({left:button.parentElement!.offsetLeft-element.offsetLeft-20,behavior:motion?'smooth':'instant'});
 }
 return {page,keyboard,clickCapture,reset};
}
