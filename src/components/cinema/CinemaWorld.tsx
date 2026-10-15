'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import {cinemaCopy} from '@/data/cinema';
import {releaseWorld} from '@/data/releaseWorlds';
import {assetUrl} from '@/data/assets';
import {visualEffects} from '@/lib/visualEffects';
import {dateLabel} from '@/i18n/config';
import type {Locale,Release,Video} from '@/types/content';
export interface CinemaOrigin {left:number;top:number;width:number;height:number;}
const FilmPlayer=dynamic(()=>import('../media/FilmPlayer'),{ssr:false});
type MediaState='loading'|'ready'|'playing'|'paused'|'error';

/** Persistent release environment. Only the official player is disposed on close/video change. */
export function CinemaWorld({video,release,locale,closing,origin,onMove,count,motion,visible=true}:{video:Video;release:Release|undefined;locale:Locale;closing:boolean;origin: CinemaOrigin|null;onMove:(direction:number)=>void;count:number;motion:boolean;visible?:boolean}){
 const copy=cinemaCopy[locale],world=releaseWorld(release?.id??video.releaseId??video.id);
 const scene=useRef<HTMLDivElement>(null);
 const [entry,setEntry]=useState<{id:string;visible:boolean;kind:'opening'|'changing';run:number}>({id:video.id,visible,kind:'opening',run:0});
 if(entry.id!==video.id||entry.visible!==visible)setEntry({id:video.id,visible,kind:entry.visible&&visible?'changing':'opening',run:entry.run+1});
 const [arrived,setArrived]=useState(-1);
 const [media,setMedia]=useState<{id:string;status:MediaState}>({id:video.id,status:'loading'});
 const opening=arrived!==entry.run;
 const phase=!visible?'closed':closing?'closing':opening?entry.kind:media.id===video.id?media.status:'loading';
 const status=useCallback((value:'ready'|'error')=>setMedia({id:video.id,status:value}),[video.id]);
 const playback=useCallback((value:'playing'|'paused'|'loading'|'ready')=>setMedia({id:video.id,status:value}),[video.id]);
 const poster=video.poster??world.cinemaPoster;
 const duration=motion?(entry.kind==='changing'?visualEffects.cinema.change:visualEffects.cinema.entry):visualEffects.cinema.reduced;
 const style={'--cinema-bg':world.cinemaBackground,'--cinema-accent':world.cinemaAccent,'--cinema-fg':'var(--ceo-cream)','--cinema-entry':`${duration}ms`,'--cinema-exit':`${motion?visualEffects.cinema.exit:visualEffects.cinema.reduced}ms`} as CSSProperties;
 useEffect(()=>{
  if(!visible)return;
  const element=scene.current;if(!element)return;
  const coverSize=Math.min(innerWidth*.6,innerHeight*.55);
  const from=origin??document.querySelector('#music .deck-artwork')?.getBoundingClientRect();
  element.style.setProperty('--origin-x',`${from?from.left+from.width/2-innerWidth/2:0}px`);
  element.style.setProperty('--origin-y',`${from?from.top+from.height/2-innerHeight/2:0}px`);
  element.style.setProperty('--origin-scale',String(from?from.width/coverSize:1));
  const start=requestAnimationFrame(()=>setMedia({id:video.id,status:'loading'}));
  const timer=setTimeout(()=>setArrived(entry.run),duration);
  return()=>{cancelAnimationFrame(start);clearTimeout(timer);};
 },[video.id,visible,duration,origin,entry.run]);
 useEffect(()=>{
  if(!visible)return;
  document.documentElement.dataset.cinemaPhase=phase;
  return()=>{delete document.documentElement.dataset.cinemaPhase;};
 },[visible,phase]);
 return <div ref={scene} className="cinema-world" style={style} data-motion={motion} data-stage={phase} data-treatment={world.cinemaAtmosphere} data-release={world.id}>
  <div className="cinema-ambient" aria-hidden="true">{poster&&<Image src={assetUrl(poster)} alt="" fill sizes="100vw"/>}</div>
  <div className="cinema-atmosphere" aria-hidden="true"/>
  <div key={`entry-${video.id}-${entry.run}`} className="cinema-takeover" aria-hidden="true"/>
  <div key={`phrase-${video.id}-${entry.run}`} className="cinema-punchline" aria-hidden="true">{world.lyricFragments[0]}</div>
  <div key={`poster-${video.id}-${entry.run}`} className="cinema-poster" aria-hidden="true">{poster&&<Image src={assetUrl(poster)} alt="" fill sizes="(max-width:767px) 60vw, 55vh"/>}</div>
  <div className="cinema-aperture" data-cursor="play" aria-busy={phase==='loading'}>
   {visible&&<FilmPlayer video={video} title={`${video.title} — ${copy.official}`} suspended={closing} onStatus={status} onPlayback={playback}/>}
  </div>
  <div className="cinema-load-label" role="status" aria-live="polite">{phase==='opening'||phase==='changing'?'':phase==='loading'?copy.loading:phase==='error'?copy.failed:phase==='playing'?(locale==='fr'?'Lecture':'Playing'):phase==='paused'?(locale==='fr'?'En pause':'Paused'):copy.ready}</div>
  <footer className="cinema-footer">
   <div className="cinema-track"><span className="metadata">{copy.official}{release?.featuredArtist&&` / feat. ${release.featuredArtist}`}</span>{release?.date&&<time className="metadata" dateTime={release.date}>{dateLabel(release.date)}</time>}{release?.credits?.length?<p>{release.credits.join(' / ')}</p>:null}</div>
   <nav aria-label={copy.cinema}>{count>1&&<button type="button" disabled={closing} data-cursor="enter" onClick={()=>onMove(-1)} aria-label={copy.previous}>←</button>}<a href={video.url} target="_blank" rel="noopener noreferrer" data-cursor="enter">{copy.external} ↗</a>{count>1&&<button type="button" disabled={closing} data-cursor="enter" onClick={()=>onMove(1)} aria-label={copy.next}>→</button>}</nav>
  </footer>
 </div>;
}
