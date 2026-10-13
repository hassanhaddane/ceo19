'use client';
import Image from 'next/image';
import {useEffect,useLayoutEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import {motion} from '@/lib/motion';
import {useSignalMotion} from '@/lib/signalMotion';
import type {GalleryItem,Locale} from '@/types/content';
import {mediaCopy} from '../media/mediaCopy';
import {gallerySource,visualMetadata} from '../media/archiveMath';
import {useMediaDialog} from '../media/useMediaDialog';
let lastCameraExposure=-Infinity;
export interface PhotoOrigin {left:number;top:number;width:number;height:number;}
function Photograph({item,locale,origin,initial,flash,closing,moving,reduced}:{item:GalleryItem;locale:Locale;origin:PhotoOrigin|null;initial:boolean;flash:boolean;closing:boolean;moving:boolean;reduced:boolean}){
 const frame=useRef<HTMLDivElement>(null),surface=useRef<HTMLDivElement>(null),exposureChecked=useRef(false);
 useLayoutEffect(()=>{if(reduced||!flash){if(surface.current)surface.current.dataset.flashAllowed="false";return;}if(exposureChecked.current)return;exposureChecked.current=true;const now=performance.now(),allowed=now-lastCameraExposure>=motion.camera.cooldown;if(surface.current)surface.current.dataset.flashAllowed=String(allowed);if(allowed)lastCameraExposure=now;},[reduced,flash]);
 const [settled,setSettled]=useState(false),[loaded,setLoaded]=useState(false);
 const source=gallerySource(item);
 useEffect(()=>{
  const element=frame.current;if(!element)return;
  element.style.setProperty('--photo-x',`${origin?origin.left+origin.width/2-window.innerWidth/2:0}px`);
  element.style.setProperty('--photo-y',`${origin?origin.top+origin.height/2-window.innerHeight/2:0}px`);
  const timer=window.setTimeout(()=>setSettled(true),reduced?motion.camera.reduced:initial?motion.camera.open:motion.camera.snap);
  return()=>clearTimeout(timer);
 },[origin,initial,reduced]);
 const style={'--photo-origin-width':`${origin?.width??300}px`,'--photo-origin-height':`${origin?.height??300}px`} as CSSProperties;
 return <div ref={surface} key={item.id} className="darkroom-exposure" data-motion={!reduced} data-initial={initial} data-flash={flash} data-settled={settled} data-closing={closing} data-moving={moving}>
  <div className="darkroom-image" ref={frame} style={style} data-loaded={loaded}>
   {source?<Image src={source} alt={item.alt[locale]} fill sizes="(max-width:767px) 94vw, 80vw" loading="eager" draggable={false} onLoad={()=>setLoaded(true)}/>:<div className="archive-instagram-placeholder">IG</div>}
   <span className="darkroom-exposure-line" aria-hidden="true"/>
  </div>
  <div className="darkroom-flash" aria-hidden="true"/><div className="darkroom-shutter" aria-hidden="true"><i/><i/></div>
 </div>;
}
export function DarkroomViewer({locale,item,index,count,origin,opener,onClose,onMove}:{locale:Locale;item:GalleryItem|null;index:number;count:number;origin:PhotoOrigin|null;opener:RefObject<HTMLElement|null>;onClose:()=>void;onMove:(direction:number)=>void}){
 const copy=mediaCopy[locale],enabled=useSignalMotion();
 const {dialog}=useMediaDialog(item!==null,opener);
 const [closing,setClosing]=useState(false),[moving,setMoving]=useState(false),[flash,setFlash]=useState(true);
 const lastExposure=useRef(0),finished=useRef(onClose);
 useEffect(()=>{finished.current=onClose;},[onClose]);
 useEffect(()=>{
  if(!item)return;
  document.documentElement.dataset.darkroomState=closing?'closing':'open';
  return()=>{delete document.documentElement.dataset.darkroomState;};
 },[item,closing]);
 useEffect(()=>{
  if(!closing)return;
  const timer=window.setTimeout(()=>{finished.current();setClosing(false);setMoving(false);setFlash(true);},enabled?motion.camera.close:motion.camera.reduced);
  return()=>clearTimeout(timer);
 },[closing,enabled]);
 function close(){if(!closing)setClosing(true);}
 function move(direction:number){
  if(closing||count<2)return;
  const now=performance.now();setFlash(now-lastExposure.current>=motion.camera.cooldown);lastExposure.current=now;setMoving(true);onMove(direction);
 }
 return <dialog ref={dialog} className="media-viewer archive-viewer darkroom-viewer" style={{"--camera-exposure":`${motion.camera.exposure}ms`,"--camera-open":`${motion.camera.open}ms`,"--camera-snap":`${motion.camera.snap}ms`,"--camera-close":`${motion.camera.close}ms`} as CSSProperties} data-owned-interaction data-motion={enabled} data-closing={closing} aria-labelledby="archive-viewer-caption" aria-describedby="darkroom-help" onCancel={event=>{event.preventDefault();close();}} onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1);}}}>
  <header className="darkroom-header"><p className="metadata">{copy.archiveTitle} / {String(index+1).padStart(3,'0')} / {String(count).padStart(3,'0')}</p><button type="button" className="darkroom-close" data-cursor="close" data-interaction="silent" aria-label={copy.close} aria-disabled={closing} onClick={close}>{copy.close} <span aria-hidden="true">×</span></button></header>
  {item&&<Photograph key={item.id} item={item} locale={locale} origin={moving?null:origin} initial={!moving} flash={flash} closing={closing} moving={moving} reduced={!enabled}/>}
  <footer className="darkroom-footer"><button type="button" data-interaction="silent" data-cursor="enter" disabled={count<2||closing} aria-label={copy.previousImage} onClick={()=>move(-1)}>←</button><div className="darkroom-caption"><p id="archive-viewer-caption">{item?.caption?.[locale]??item?.alt[locale]??copy.archiveTitle}</p><div className="metadata">{visualMetadata(item?.metadata).map(value=><span key={value}>{value}</span>)}</div>{item?.type==='instagram'&&<a href={item.postUrl} target="_blank" rel="noopener noreferrer">{copy.instagram} ↗</a>}</div><button type="button" data-interaction="silent" data-cursor="enter" disabled={count<2||closing} aria-label={copy.nextImage} onClick={()=>move(1)}>→</button></footer>
  <p className="sr-only" id="darkroom-help">{copy.navigationHint}</p>
 </dialog>;
}
