'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {videos} from '@/data/videos';
import {cinemaCopy} from '@/data/cinema';
import {visualEffects} from '@/lib/visualEffects';
import {useSignalMotion} from '@/lib/signalMotion';
import type {Locale,Release} from '@/types/content';
import {useMediaDialog} from '../media/useMediaDialog';
import {LogoMark} from '../primitives';
import {CinemaWorld,type CinemaOrigin} from './CinemaWorld';

/** Mounted once on first Watch, retained across films and later openings. Native dialog supplies inert/focus semantics. */
export default function MusicCinema({open,release,locale,opener,origin,onClose,onMove}:{open:boolean;release:Release;locale:Locale;opener:RefObject<HTMLElement|null>;origin:CinemaOrigin|null;onClose:()=>void;onMove:(direction:number)=>void}){
 const {dialog}=useMediaDialog(open,opener),motion=useSignalMotion(),copy=cinemaCopy[locale];
 const [closing,setClosing]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),closingRef=useRef(false);
 const video=videos.find(video=>video.releaseId===release.id);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 function close(){
  if(closingRef.current)return;
  closingRef.current=true;setClosing(true);
  timer.current=setTimeout(()=>{onClose();setClosing(false);closingRef.current=false;},motion?visualEffects.cinema.exit:visualEffects.cinema.reduced);
 }
 return <dialog ref={dialog} className="media-viewer cinema-dialog" data-owned-interaction data-closing={closing} data-motion={motion} aria-label={`${copy.cinema} / ${release.title}`} aria-describedby="music-cinema-help" onCancel={event=>{event.preventDefault();close();}} onKeyDown={event=>{
  if(closing||event.target instanceof HTMLIFrameElement)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();onMove(event.key==='ArrowLeft'?-1:1);}
 }}>
  <header className="cinema-header"><div className="cinema-signature"><LogoMark/><span>CEO1.9</span></div><div className="cinema-channel"><span className="metadata">{locale==='fr'?'CINÉMA':'CINEMA'} / CEO1.9</span><h2>{release.title}{release.featuredArtist&&<small> feat. {release.featuredArtist}</small>}</h2></div><button type="button" className="cinema-close" data-cursor="close" aria-label={copy.close} disabled={closing} onClick={close}>{locale==='fr'?'Fermer':'Close'} ×</button></header>
  {video&&<CinemaWorld video={video} release={release} locale={locale} closing={closing} origin={origin} onMove={onMove} count={videos.length} motion={motion} visible={open}/>}
  <p id="music-cinema-help" className="sr-only">{copy.hint}</p>
 </dialog>;
}
