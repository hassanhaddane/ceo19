'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject, type MouseEvent, type KeyboardEvent } from 'react';
import { archiveWorld, archiveStart, archiveDepthGain } from '@/data/archiveWorld';
import { acquireSceneGesture } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';
import { ARCHIVE_IDLE_DELAY, archiveCycleSpeed, archiveLoopX, createArchiveLayout, shortestArchiveDistance, wrapArchive } from '@/lib/archiveGeometry';

/** One RAF owns camera, velocity and depth. React only receives photo boundaries,
 * nearby-image membership and keyboard focus changes, never animation frames. */
export function useSpatialArchive(stage:RefObject<HTMLDivElement|null>,options:{paused:boolean;blocked:boolean}) {
 const motion=useSignalMotion();
 const [active,setActive]=useState(archiveStart),[compact,setCompact]=useState(false),[nearby,setNearby]=useState<number[]>([0,1,2,3]),[focused,setFocused]=useState(false);
 const {paused,blocked}=options;
 const position=useRef<number|null>(null),suppressClick=useRef(false),flags=useRef({paused,blocked});
 const command=useRef<(index:number,step?:number)=>void>(()=>{}),wakeRef=useRef(()=>{});
 useLayoutEffect(()=>{ flags.current={paused,blocked};wakeRef.current(); },[paused,blocked]);
 const select=useCallback((index:number)=>command.current(index),[]);
 const step=useCallback((direction:number)=>command.current(0,direction),[]);
 useEffect(()=>{
  const element=stage.current;if(!element)return;
  const root=element.parentElement!,controls=root.querySelector<HTMLElement>('.spatial-controls')!,planes=Array.from(element.querySelectorAll<HTMLElement>('[data-photo-plane]'));
  const buttons=planes.map(plane=>plane.querySelector<HTMLButtonElement>('button')!);
  const settings=visualEffects.archive;
  const device=navigator as Navigator & {deviceMemory?:number;connection?:{saveData?:boolean}};
  const economy=(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||(device.deviceMemory!==undefined&&device.deviceMemory<=4)||!!device.connection?.saveData;
  let width=element.clientWidth,height=element.clientHeight,mobile=width<700;
  let layout=createArchiveLayout(archiveWorld,width,height,mobile),camera=position.current??layout.prints[0].center-(width*(mobile?.5:.25));
  let frame=0,lastFrame=0,inView=false,velocity=0,autoSpeed=0,idleUntil=0;
  let px=0,py=0,tx=0,ty=0,hover=-1,hoverDrawn=-1,hoverMix=0,inside=false,keyboardFocus=false,focusIndex=-1,controlsHover=false;
  let down=false,dragging=false,pointerId=-1,startX=0,startY=0,startCamera=0,lastX=0,lastTime=0;
  let release:(()=>void)|undefined,wheelTimer:ReturnType<typeof setTimeout>|undefined;
  let navigation:{from:number;to:number;start:number;index:number}|null=null,chosen:number|null=null,notified=archiveStart,nearbyKey='';
  const remember=(index:number)=>{if(location.hash.startsWith('#archive'))history.replaceState(null,'',`#archive-${archiveWorld[index].id}`);};
  const halt=()=>{autoSpeed=0;velocity=0;navigation=null;lastFrame=0;};
  const draw=(now:number)=>{
   frame=0;if(document.hidden)return;
   const dt=lastFrame?Math.min(.04,(now-lastFrame)/1000):1/60;lastFrame=now;
   const blocked=flags.current.blocked||!inView;
   if(blocked){halt();tx=ty=0;}
   const autoAllowed=motion&&!flags.current.paused&&!blocked&&!keyboardFocus&&!controlsHover&&!down&&now>idleUntil;
   const desired=autoAllowed?archiveCycleSpeed(layout.length)*(inside?.1:1):0;
   autoSpeed+= (desired-autoSpeed)*(1-Math.exp(-dt*3.5));
   if(!autoAllowed&&!inside)autoSpeed=0;
   if(navigation&&!blocked){
    const t=motion?Math.min(1,(now-navigation.start)/800):1;
    camera=navigation.from+(navigation.to-navigation.from)*(1-Math.pow(1-t,4));
    if(t===1)navigation=null;
   }else if(!down&&!blocked){
    if(motion&&Math.abs(velocity)>.5){camera+=velocity*dt;velocity*=Math.exp(-dt*5.1);}
    if(autoAllowed){camera+=autoSpeed*dt;if(!inside)chosen=null;}
   }
   camera=wrapArchive(camera,layout.length);position.current=camera;
   px+=(tx-px)*(1-Math.exp(-dt*7));py+=(ty-py)*(1-Math.exp(-dt*7));
   const pointed=hover>=0?hover:focusIndex;
   hoverMix+=((pointed>=0?1:0)-hoverMix)*(1-Math.exp(-dt*9));if(pointed>=0)hoverDrawn=pointed;
   let nearest=0,nearestDistance=Infinity;const loaded:number[]=[];
   const strength=motion&&!mobile&&!economy?visualEffects.parallax.intensity:0;
   const sceneTop=element.closest('section')?.getBoundingClientRect().top??0;
   const sceneProgress=Math.max(-1,Math.min(1,-sceneTop/innerHeight));
   for(let index=0;index<planes.length;index++){
    const plane=planes[index],print=layout.prints[index],photo=archiveWorld[index];
    const x=archiveLoopX(print.center,camera,layout.length,layout.buffer);
    const visible=x+print.width*.6>-90&&x-print.width*.6<width+90;
    if(x+print.width*.6>-width*.4&&x-print.width*.6<width*1.4)loaded.push(index);
    plane.style.visibility=visible?'visible':'hidden';plane.inert=!visible;buttons[index].tabIndex=visible?0:-1;
    const distance=Math.abs(x-(width*(mobile?.5:.25)));if(distance<nearestDistance){nearest=index;nearestDistance=distance;}
    if(!visible)continue;
    const gain=archiveDepthGain(photo.depth),selected=index===hoverDrawn?hoverMix:0;
    const depth=motion&&!mobile&&!economy?photo.depth*.23+selected*115-(1-selected)*hoverMix*40:0;
    const parallaxX=px*(14+gain*54)*strength;
    const drift=Math.sin((x-width*.5)/width*Math.PI)*(gain-.5)*18*strength;
    const yLimit=Math.max(0,height/2-print.height*(1+selected*.08)/2-12);
    const y=Math.max(-yLimit,Math.min(yLimit,print.y+py*(12+gain*34)*strength-sceneProgress*(15+gain*28)*strength));
    const hoverX=hoverDrawn>=0?archiveLoopX(layout.prints[hoverDrawn].center,camera,layout.length,layout.buffer):x;
    const push=(1-selected)*hoverMix*Math.sign(x-hoverX)*8*strength;
    plane.style.width=`${print.width}px`;plane.style.height=`${print.height}px`;
    plane.style.transform=`translate3d(${(x+parallaxX+drift+push).toFixed(2)}px,${y.toFixed(2)}px,${depth.toFixed(2)}px) rotateY(${(px*(1.3+gain*2.8)*strength-selected*px*2).toFixed(2)}deg) rotateZ(${(motion&&!mobile?photo.roll+px*strength*.5:0).toFixed(2)}deg)`;
    plane.style.zIndex=String(Math.round(10+gain*10+selected*20));
    plane.style.setProperty('--photo-light',String(1-(1-selected)*hoverMix*.24));
    plane.dataset.highlighted=selected>.4?'true':'false';
   }
   const nextActive=chosen??nearest;if(nextActive!==notified){notified=nextActive;setActive(nextActive);}
   const key=loaded.join(',');if(key!==nearbyKey){nearbyKey=key;setNearby(loaded);}
   element.dataset.camera=camera.toFixed(3);element.dataset.cycle=layout.length.toFixed(2);
   element.dataset.autoState=!motion?'reduced':blocked?'suspended':flags.current.paused?'paused':keyboardFocus?'focus':controlsHover?'controls':down?'dragging':now<idleUntil?'idle':inside?'hover':'moving';
   root.style.setProperty('--archive-progress',String(wrapArchive(camera+(width*(mobile?.5:.25)),layout.length)/layout.length));
   const unsettled=Math.abs(tx-px)+Math.abs(ty-py)>.002||Math.abs((pointed>=0?1:0)-hoverMix)>.002;
   if(inView&&!blocked&&(autoAllowed||navigation||Math.abs(velocity)>.5||unsettled||motion&&!flags.current.paused&&!keyboardFocus&&!controlsHover))wake();
  };
  function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(draw);}
  wakeRef.current=wake;
  const go=(index:number,direction?:number)=>{
   const next=wrapArchive(direction===undefined?index:(chosen??notified)+direction,archiveWorld.length);
   const target=layout.prints[next].center-(width*(mobile?.5:.25));
   const delta=shortestArchiveDistance(camera,target,layout.length);
   velocity=0;autoSpeed=0;chosen=next;navigation={from:camera,to:camera+delta,start:performance.now(),index:next};
   idleUntil=performance.now()+ARCHIVE_IDLE_DELAY;remember(next);setActive(next);notified=next;wake();
  };
  command.current=go;
  const unlock=()=>{release?.();release=undefined;element.dataset.dragging='false';const id=pointerId;pointerId=-1;if(id>=0&&element.hasPointerCapture(id))element.releasePointerCapture(id);};
  const start=(event:PointerEvent)=>{
   if(!event.isPrimary||event.button!==0||flags.current.blocked)return;
   clearTimeout(wheelTimer);unlock();down=true;dragging=false;suppressClick.current=false;navigation=null;chosen=null;autoSpeed=velocity=0;
   startX=lastX=event.clientX;startY=event.clientY;startCamera=camera;lastTime=performance.now();idleUntil=lastTime+ARCHIVE_IDLE_DELAY;
  };
  const move=(event:PointerEvent)=>{
   if(!down){
    if(event.pointerType==='mouse'&&motion&&!mobile){const rect=element.getBoundingClientRect();tx=(event.clientX-rect.left)/width*2-1;ty=(event.clientY-rect.top)/height*2-1;wake();}return;
   }
   const dx=event.clientX-startX,dy=event.clientY-startY;
   if(!dragging){
    if(Math.max(Math.abs(dx),Math.abs(dy))<settings.dragThreshold)return;
    if(Math.abs(dy)>Math.abs(dx)*settings.axisLock){down=false;wake();return;}
    if(Math.abs(dx)<Math.abs(dy)*settings.axisLock)return;
    dragging=true;pointerId=event.pointerId;element.setPointerCapture(pointerId);release=acquireSceneGesture('archive',element);element.dataset.dragging='true';hover=-1;
   }
   event.preventDefault();const now=performance.now();
   velocity=velocity*.4+(lastX-event.clientX)/Math.max(8,now-lastTime)*600;
   camera=startCamera-dx;lastX=event.clientX;lastTime=now;idleUntil=now+ARCHIVE_IDLE_DELAY;wake();
  };
  const finish=()=>{
   if(!down)return;down=false;
   if(dragging){suppressClick.current=true;velocity=motion&&performance.now()-lastTime<180?Math.max(-1800,Math.min(1800,velocity)):0;idleUntil=performance.now()+ARCHIVE_IDLE_DELAY;}
   dragging=false;unlock();wake();
  };
  const cancel=()=>{suppressClick.current ||= dragging;down=dragging=false;halt();unlock();clearTimeout(wheelTimer);wake();};
  const lostCapture=(event:PointerEvent)=>{if(event.target===element&&event.pointerId===pointerId&&dragging)cancel();};
  const enter=(event:PointerEvent)=>{if(event.pointerType==='mouse'){inside=true;wake();}};
  const leave=()=>{inside=false;tx=ty=0;hover=-1;if(down&&!dragging)down=false;wake();};
  const over=(event:PointerEvent)=>{if(dragging||event.pointerType!=='mouse'||mobile)return;const plane=(event.target as Element).closest<HTMLElement>('[data-photo-plane]');hover=plane?Number(plane.dataset.photoPlane):-1;wake();};
  const out=(event:PointerEvent)=>{const next=event.relatedTarget instanceof Element?event.relatedTarget.closest('[data-photo-plane]'):null;if(!next){hover=-1;wake();}};
  const wheel=(event:WheelEvent)=>{
   if(event.ctrlKey||flags.current.blocked||dragging||!(Math.abs(event.deltaX)>Math.abs(event.deltaY)*1.1||event.shiftKey))return;
   event.preventDefault();event.stopPropagation();release??=acquireSceneGesture('archive',element);
   const delta=(event.shiftKey?event.deltaY||event.deltaX:event.deltaX)*(event.deltaMode===1?16:event.deltaMode===2?width:1);
   navigation=null;chosen=null;autoSpeed=velocity=0;camera+=delta;idleUntil=performance.now()+ARCHIVE_IDLE_DELAY;wake();
   clearTimeout(wheelTimer);wheelTimer=setTimeout(unlock,settings.wheelIdle);
  };
  const focusIn=(event:FocusEvent)=>{
   const target=event.target as HTMLElement;
   // Pointer-opened photos also restore focus. Only keyboard-visible focus holds autoplay.
   if(target.matches(':focus-visible')){keyboardFocus=true;setFocused(true);velocity=autoSpeed=0;}
   focusIndex=Number(target.closest<HTMLElement>('[data-photo-plane]')?.dataset.photoPlane??-1);wake();
  };
  const focusOut=(event:FocusEvent)=>{if(event.relatedTarget instanceof Node&&root.contains(event.relatedTarget))return;keyboardFocus=false;focusIndex=-1;setFocused(false);idleUntil=performance.now()+ARCHIVE_IDLE_DELAY;wake();};
  const keyFocus=(event:globalThis.KeyboardEvent)=>{if(!event.metaKey&&!event.ctrlKey&&!event.altKey){keyboardFocus=true;setFocused(true);velocity=autoSpeed=0;wake();}};
  const pointerInteraction=()=>{keyboardFocus=false;focusIndex=-1;setFocused(false);autoSpeed=0;idleUntil=performance.now()+ARCHIVE_IDLE_DELAY;wake();};
  const controlsEnter=(event:PointerEvent)=>{if(event.pointerType==='mouse'){controlsHover=true;autoSpeed=0;wake();}};
  const controlsLeave=()=>{controlsHover=false;idleUntil=performance.now()+500;wake();};
  const resize=()=>{
   const fraction=camera/layout.length,intended=navigation?.index;
   width=element.clientWidth;height=element.clientHeight;mobile=width<700;
   layout=createArchiveLayout(archiveWorld,width,height,mobile);camera=fraction*layout.length;velocity=0;
   // Caption reflow and orientation changes retain a navigation already in flight.
   if(intended!==undefined){const target=layout.prints[intended].center-width*(mobile?.5:.25);navigation={from:camera,to:camera+shortestArchiveDistance(camera,target,layout.length),start:performance.now(),index:intended};}
   setCompact(mobile);wake();
  };
  const historyChange=()=>{const index=archiveWorld.findIndex(photo=>photo.id===location.hash.slice(9));if(index>=0){go(index);if(!inView){camera=layout.prints[index].center-(width*(mobile?.5:.25));position.current=camera;navigation=null;}}};
  const visibility=()=>{if(document.hidden){cancel();cancelAnimationFrame(frame);frame=0;}else{lastFrame=0;idleUntil=performance.now()+500;wake();}};
  const intersection=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(!inView){cancel();cancelAnimationFrame(frame);frame=0;}else{lastFrame=0;wake();}},{threshold:.1});intersection.observe(element);
  const observer=new ResizeObserver(resize);observer.observe(element);
  element.addEventListener('pointerdown',start);element.addEventListener('pointermove',move,{passive:false});element.addEventListener('pointerenter',enter);element.addEventListener('pointerleave',leave);element.addEventListener('pointerover',over);element.addEventListener('pointerout',out);element.addEventListener('wheel',wheel,{passive:false});element.addEventListener('pointercancel',cancel);element.addEventListener('lostpointercapture',lostCapture);
  root.addEventListener('focusin',focusIn);root.addEventListener('focusout',focusOut);root.addEventListener('keydown',keyFocus);root.addEventListener('pointerdown',pointerInteraction,{passive:true});controls.addEventListener('pointerenter',controlsEnter);controls.addEventListener('pointerleave',controlsLeave);
  window.addEventListener('pointerup',finish);window.addEventListener('blur',cancel);window.addEventListener('hashchange',historyChange);window.addEventListener('popstate',historyChange);document.addEventListener('visibilitychange',visibility);
  setCompact(mobile);historyChange();wake();
  return()=>{
   command.current=()=>{};wakeRef.current=()=>{};down=dragging=false;unlock();clearTimeout(wheelTimer);cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();
   element.removeEventListener('pointerdown',start);element.removeEventListener('pointermove',move);element.removeEventListener('pointerenter',enter);element.removeEventListener('pointerleave',leave);element.removeEventListener('pointerover',over);element.removeEventListener('pointerout',out);element.removeEventListener('wheel',wheel);element.removeEventListener('pointercancel',cancel);element.removeEventListener('lostpointercapture',lostCapture);
   root.removeEventListener('focusin',focusIn);root.removeEventListener('focusout',focusOut);root.removeEventListener('keydown',keyFocus);root.removeEventListener('pointerdown',pointerInteraction);controls.removeEventListener('pointerenter',controlsEnter);controls.removeEventListener('pointerleave',controlsLeave);
   window.removeEventListener('pointerup',finish);window.removeEventListener('blur',cancel);window.removeEventListener('hashchange',historyChange);window.removeEventListener('popstate',historyChange);document.removeEventListener('visibilitychange',visibility);
  };
 },[stage,motion]);
 const clickCapture=(event:MouseEvent)=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false;}};
 const keyboard=(event:KeyboardEvent)=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();event.stopPropagation();
  if(event.key==='Home'||event.key==='End')select(event.key==='Home'?0:archiveWorld.length-1);else step(event.key==='ArrowRight'?1:-1);
  stage.current?.focus({preventScroll:true});
 };
 return {active,compact,motion,nearby,focused,select,step,clickCapture,keyboard};
}
