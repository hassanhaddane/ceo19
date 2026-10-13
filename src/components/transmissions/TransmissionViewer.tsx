'use client';
import {useEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import {releases} from '@/data/releases';
import {cinemaCopy,cinemaTiming,resolveCinemaWorld} from '@/data/cinema';
import {useSignalMotion} from '@/lib/signalMotion';
import type {Locale,Video} from '@/types/content';
import {useMediaDialog} from '../media/useMediaDialog';
import {CinemaWorld,type CinemaOrigin} from '../cinema/CinemaWorld';
/** Native dialog owns accessibility; cinema owns the timed exit before it releases the page. */
export function TransmissionViewer({locale,video,opener,onClose,onMove,count,origin}:{locale:Locale;video:Video|null;opener:RefObject<HTMLElement|null>;onClose:()=>void;onMove:(direction:number)=>void;count:number;origin:CinemaOrigin|null}){
 const copy=cinemaCopy[locale],motion=useSignalMotion();
 const [closing,setClosing]=useState(false);
 const [returnOrigin,setReturnOrigin]=useState<CinemaOrigin|null>(null);
 const finished=useRef(onClose);
 const {dialog}=useMediaDialog(video!==null,opener);
 const release=releases.find(item=>item.id===video?.releaseId);
 const world=resolveCinemaWorld(release,video?.cinema);
 useEffect(()=>{finished.current=onClose;},[onClose]);
 useEffect(()=>{
  if(!closing)return;
  const timer=window.setTimeout(()=>{finished.current();setClosing(false);},motion?world.exitDuration:cinemaTiming.reducedExit);
  return()=>clearTimeout(timer);
 },[closing,motion,world.exitDuration]);
 const close=()=>{
  if(closing)return;
  const rect=document.querySelector('#channels .deck-artwork')?.getBoundingClientRect();
  setReturnOrigin(rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null);
  setClosing(true);
 };
 return <dialog ref={dialog} className="media-viewer cinema-dialog" data-owned-interaction style={{'--cinema-fg':world.cinemaForeground,'--cinema-exit':`${world.exitDuration}ms`} as CSSProperties} data-closing={closing} data-motion={motion} aria-label={`${copy.cinema}${video?` / ${video.title}`:''}`} aria-describedby="cinema-keyboard-help" onCancel={event=>{event.preventDefault();close();}} onKeyDown={event=>{if(closing)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();onMove(event.key==='ArrowRight'?1:-1);}}}>
  <header className="cinema-header"><div className="cinema-signature">CEO 1.9</div><p className="cinema-channel">{release?.channel}<span>{video?.title}</span></p><button type="button" className="cinema-close" data-cursor="close" data-interaction="silent" aria-label={copy.close} aria-disabled={closing} onClick={close}>{locale==='fr'?'Fermer':'Close'} <span aria-hidden="true">×</span></button></header>
  {video&&<CinemaWorld motion={motion} key={video.id} video={video} release={release} locale={locale} closing={closing} origin={closing?returnOrigin:origin} onMove={onMove} count={count}/>}
  <p id="cinema-keyboard-help" className="sr-only">{copy.hint}</p>
 </dialog>;
}
