'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {useCallback,useEffect,useRef,useState,type CSSProperties} from 'react';
import {cinemaCopy,cinemaTiming,resolveCinemaWorld} from '@/data/cinema';
import type {Locale,Release,Video} from '@/types/content';
export interface CinemaOrigin {left:number;top:number;width:number;height:number;}
const FilmPlayer=dynamic(()=>import('../media/FilmPlayer'),{ssr:false});
export function CinemaWorld({video,release,locale,closing,origin,onMove,count,motion}:{video:Video;release:Release|undefined;locale:Locale;closing:boolean;origin: CinemaOrigin|null;onMove:(direction:number)=>void;count:number;motion:boolean}){
 const copy=cinemaCopy[locale],world=resolveCinemaWorld(release,video.cinema);
 const scene=useRef<HTMLDivElement>(null);
 const [stage,setStage]=useState<'entering'|'loading'|'ready'|'error'>('entering');
 const [load,setLoad]=useState(false);

 const status=useCallback((value:'ready'|'error')=>setStage(value),[]);
 const poster=video.poster??release?.artwork??null;
 const styles={'--cinema-bg':world.cinemaBackground,'--cinema-accent':world.cinemaAccent,'--cinema-fg':world.cinemaForeground,'--cinema-glow':world.cinemaGlow,'--cinema-entry':`${world.entryDuration}ms`,'--cinema-exit':`${world.exitDuration}ms`,'--cinema-phrase-start':`${world.entryDuration*cinemaTiming.phraseStart}ms`,'--cinema-phrase-duration':`${world.entryDuration*(cinemaTiming.phraseEnd-cinemaTiming.phraseStart)}ms`,'--cinema-doors-delay':`${world.entryDuration*cinemaTiming.doorsStart}ms`,'--cinema-doors-duration':`${world.entryDuration*(1-cinemaTiming.doorsStart)}ms`} as CSSProperties;
 useEffect(()=>{
  const element=scene.current;
  if(!element)return;
  // The visitor's motion preference includes the existing menu override.
  const enabled=motion;
  element.setAttribute('data-motion',String(enabled));
  const coverSize=Math.min(window.innerWidth*(window.innerWidth<768?.7:.38),window.innerHeight*.56);
  element.style.setProperty('--origin-x',`${origin?origin.left+origin.width/2-window.innerWidth/2:0}px`);
  element.style.setProperty('--origin-y',`${origin?origin.top+origin.height/2-window.innerHeight/2:0}px`);
  element.style.setProperty('--origin-scale',String(origin?origin.width/coverSize:1));
  if(closing)return;
  const timer=window.setTimeout(()=>{setStage(current=>current==='entering'?'loading':current);setLoad(true);},enabled?world.entryDuration:cinemaTiming.reducedEntry);
  return()=>clearTimeout(timer);
 },[origin,world.entryDuration,motion,closing]);
 useEffect(()=>{
  const phase=closing?'exiting':stage;
  document.documentElement.setAttribute('data-cinema-phase',phase);
  return()=>document.documentElement.removeAttribute('data-cinema-phase');
 },[closing,stage]);
 return <div ref={scene} className="cinema-world" style={styles} data-motion={motion} data-stage={closing?'exiting':stage} data-entry={world.entry} data-release={release?.id??video.id}>
  <div className="cinema-ambient" aria-hidden="true">{poster&&<Image src={poster} alt="" fill sizes="100vw" loading="eager"/>}</div>
  <div className="cinema-takeover" aria-hidden="true"/>
  <div className="cinema-punchline" aria-hidden="true">{world.punchline}</div>
  <div className="cinema-poster" aria-hidden="true">{poster&&<Image src={poster} alt="" fill sizes="(max-width:767px) 70vw, 38vw" loading="eager"/>}<span className="cinema-poster-cut"/></div>
  <div className="cinema-doors" aria-hidden="true"><i/><i/><i/><i/></div>
  <div className="cinema-aperture" inert={stage!=='ready'||closing} data-cursor="play" aria-busy={stage!=='ready'&&stage!=='error'}>
   {load&&<FilmPlayer video={video} title={`${video.title} — ${copy.official}`} suspended={closing} onStatus={status}/>}
  </div>
  <div className="cinema-load-label" role="status" aria-live="polite"><span>{release?.channel}</span><span>{stage==='error'?copy.failed:stage==='ready'?copy.ready:copy.loading}</span>{stage==='error'&&<a href={video.url} target="_blank" rel="noopener noreferrer">{copy.external} ↗</a>}</div>
  <footer className="cinema-footer" inert={stage!=='ready'||closing}>
   <div className="cinema-track"><h2 id="transmission-film-title">{video.title}</h2><p>{copy.official}{release?.featuredArtist&&` / feat. ${release.featuredArtist}`}</p>{release?.credits?.length? <p>{release.credits.join(' / ')}</p>:null}</div>
   <nav aria-label={copy.cinema}>{count>1&&<button type="button" disabled={closing} data-cursor="enter" onClick={()=>onMove(-1)} aria-label={copy.previous}><span>←</span>{copy.previous}</button>}<a href={video.url} target="_blank" rel="noopener noreferrer" data-cursor="enter">YouTube ↗</a>{count>1&&<button type="button" disabled={closing} data-cursor="enter" onClick={()=>onMove(1)} aria-label={copy.next}>{copy.next}<span>→</span></button>}</nav>
  </footer>
 </div>;
}
