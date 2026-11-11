'use client';
import {useEffect,useRef,useState,type RefObject} from 'react';
import {SoundSettings} from '@/features/audio/SoundSettings';
import {useSoundManager} from '@/features/audio/SoundProvider';
import {videos} from '@/data/videos';
import {cinemaCopy} from '@/data/cinema';
import {visualEffects} from '@/lib/visualEffects';
import {useSignalMotion} from '@/lib/signalMotion';
import type {Locale,Release} from '@/types/content';
import {useMediaDialog} from '../media/useMediaDialog';
import {LogoMark} from '../primitives';
import {UtilityButton,UtilityGlyph} from '../interactive/UtilityAction';
import {CinemaWorld,type CinemaOrigin} from './CinemaWorld';

/** Mounted once on first Watch, retained across films and later openings. Native dialog supplies inert/focus semantics. */
export default function MusicCinema({open,release,locale,opener,origin,getReturnOrigin,onClose,onMove}:{open:boolean;release:Release;locale:Locale;opener:RefObject<HTMLElement|null>;origin:CinemaOrigin|null;getReturnOrigin:()=>CinemaOrigin|null;onClose:()=>void;onMove:(direction:number)=>void}){
 const sound=useSoundManager();
 useEffect(()=>open?sound.holdMedia('cinema'):undefined,[open,sound]);
 const {dialog}=useMediaDialog(open,opener),motion=useSignalMotion(),copy=cinemaCopy[locale];
 const [closing,setClosing]=useState(false);
 const [returnOrigin,setReturnOrigin]=useState<CinemaOrigin|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null),closingRef=useRef(false);
 const video=videos.find(video=>video.releaseId===release.id);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 function close(){
  if(closingRef.current)return;
  closingRef.current=true;setReturnOrigin(getReturnOrigin());setClosing(true);
  timer.current=setTimeout(()=>{onClose();setClosing(false);closingRef.current=false;},motion?visualEffects.cinema.exit:visualEffects.cinema.reduced);
 }
 return <dialog ref={dialog} className="media-viewer cinema-dialog" data-owned-interaction data-closing={closing} data-motion={motion} aria-label={`${copy.cinema} / ${release.title}`} aria-describedby="music-cinema-help" onCancel={event=>{event.preventDefault();close();}} onKeyDown={event=>{
  if(closing||event.target instanceof HTMLIFrameElement)return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();onMove(event.key==='ArrowLeft'?-1:1);}
 }}>
  <header className="cinema-header"><div className="cinema-signature"><LogoMark/><span>CEO1.9</span></div><div className="cinema-channel"><span className="metadata">{locale==='fr'?'CINÉMA':'CINEMA'} / CEO1.9</span><h2>{release.title}{release.featuredArtist&&<small> feat. {release.featuredArtist}</small>}</h2></div><SoundSettings locale={locale}/><UtilityButton type="button" className="cinema-close" data-cursor="close" aria-label={copy.close} disabled={closing} onClick={close}>{locale==='fr'?'Fermer':'Close'}<UtilityGlyph kind="close"/></UtilityButton></header>
  {video&&<CinemaWorld video={video} release={release} locale={locale} closing={closing} origin={origin} returnOrigin={returnOrigin} onMove={onMove} count={videos.length} motion={motion} visible={open}/>}
  <p id="music-cinema-help" className="sr-only">{copy.hint}</p>
 </dialog>;
}
