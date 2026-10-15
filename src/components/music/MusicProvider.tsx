'use client';
import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { track } from '@/lib/analytics';
import { featuredRelease } from '@/data/releases';
import type { Locale, Release } from '@/types/content';
import type { EmbedControls, PlaybackUpdate } from './embedApi';
import { playableSources, type MusicSource } from './musicSources';
import { PersistentPlayer } from './PersistentPlayer';
const EmbedPlayer=dynamic(()=>import('./EmbedPlayer'),{ssr:false});
type Status='idle'|'loading'|'ready'|'error';
interface MusicContextValue { selectedRelease:Release; selectRelease:(release:Release)=>void; activeTrack:Release; isPlaying:boolean; progress:number|null; duration:number|null; status:Status; source:MusicSource|null; expanded:boolean; setExpanded:(expanded:boolean)=>void; listen:(release:Release,source?:MusicSource)=>void; toggle:()=>void; stop:()=>void; seek:(seconds:number)=>void; }
const MusicContext=createContext<MusicContextValue|null>(null);
export function useMusic(){const context=useContext(MusicContext);if(!context) throw new Error('MusicProvider is required');return context;}
export function MusicProvider({children,locale}: {children:ReactNode;locale:Locale}) {
 const [selectedRelease,selectRelease]=useState(featuredRelease);
 const [activeTrack,setActiveTrack]=useState(featuredRelease);
 const [source,setSource]=useState<MusicSource|null>(null);
 const [session,setSession]=useState(0);
 const [expanded,changeExpanded]=useState(false);
 const [status,setStatus]=useState<Status>('idle');
 const [playback,setPlayback]=useState<PlaybackUpdate>({isPlaying:false,position:null,duration:null});
 const audio=useRef<HTMLAudioElement>(null);
 const controls=useRef<EmbedControls|null>(null);
 const onControls=useCallback((value:EmbedControls|null)=>{controls.current=value;},[]);
 const onUpdate=useCallback((update:PlaybackUpdate)=>setPlayback(update),[]);
 const onStatus=useCallback((value:'loading'|'ready'|'error')=>{setStatus(value);if(value==='error')setPlayback({isPlaying:false,position:null,duration:null});},[]);
 const setExpanded=useCallback((value:boolean)=>{
  // A YouTube video always remains visible while it plays.
  if(!value && source?.kind==='YouTube') {controls.current?.pause();setPlayback(p=>({...p,isPlaying:false}));}
  changeExpanded(value);
 },[source]);
 const listen=useCallback((release:Release,requested?:MusicSource)=>{
  const next=requested??playableSources(release)[0];
  if(!next) return;
  if(next.kind==='Spotify')track('spotify_click',{id:release.id});if(next.kind==='YouTube')track('youtube_click',{id:release.id});
  audio.current?.pause(); controls.current=null;
  setActiveTrack(release);setSource(next);changeExpanded(true);setStatus('loading');setSession(s=>s+1);
  setPlayback({isPlaying:false,position:null,duration:null});
  if(next.kind==='preview' && audio.current) {
   audio.current.src=next.url;
   void audio.current.play().catch(()=>{setStatus('error');setPlayback({isPlaying:false,position:null,duration:null});});
  }
 },[]);
 const stop=useCallback(()=>{
  audio.current?.pause();controls.current?.pause();controls.current=null;
  if(audio.current){audio.current.removeAttribute('src');audio.current.load();}
  setSource(null);setStatus('idle');setPlayback({isPlaying:false,position:null,duration:null});
 },[]);
 const toggle=useCallback(()=>{
  if(!source){listen(activeTrack);return;}
  if(source.kind==='preview') {
   if(audio.current?.paused) void audio.current.play().catch(()=>setStatus('error')); else audio.current?.pause();
  } else if(status==='ready') {
   if(playback.duration!==null&&playback.position!==null&&playback.position>=playback.duration){listen(activeTrack,source);return;}
   if(playback.isPlaying) controls.current?.pause(); else {changeExpanded(true);controls.current?.play();}
  } else if(status==='error') listen(activeTrack,source); else changeExpanded(true);
 },[source,activeTrack,listen,status,playback.isPlaying,playback.position,playback.duration]);
 const seek=useCallback((seconds:number)=>{if(source?.kind==='preview'&&audio.current&&Number.isFinite(audio.current.duration))audio.current.currentTime=Math.max(0,Math.min(seconds,audio.current.duration));},[source]);
 const updateAudio=()=>{const element=audio.current;if(element)setPlayback({isPlaying:!element.paused&&!element.ended,position:element.currentTime,duration:Number.isFinite(element.duration)?element.duration:null});};
 const value=useMemo(()=>({selectedRelease,selectRelease,activeTrack,isPlaying:playback.isPlaying,progress:playback.position,duration:playback.duration,status,source,expanded,setExpanded,listen,toggle,stop,seek}),[selectedRelease,activeTrack,playback,status,source,expanded,setExpanded,listen,toggle,stop,seek]);
 return <MusicContext.Provider value={value}>{children}
 <audio ref={audio} preload="none" onPlay={()=>{setStatus('ready');updateAudio();}} onPause={updateAudio} onEnded={updateAudio} onTimeUpdate={updateAudio} onLoadedMetadata={()=>{setStatus('ready');updateAudio();}} onWaiting={()=>setPlayback(p=>({...p,isPlaying:false}))} onPlaying={updateAudio} onError={()=>{setStatus('error');setPlayback({isPlaying:false,position:null,duration:null});}} />
 <PersistentPlayer locale={locale} embed={source && source.kind!=='preview' ? <EmbedPlayer key={session} source={source} title={activeTrack.title} onControls={onControls} onUpdate={onUpdate} onStatus={onStatus} /> : null} />
 </MusicContext.Provider>;
}
