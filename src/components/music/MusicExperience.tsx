'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from 'react';
import { featuredRelease, releases } from '@/data/releases';
import { sceneCopy } from '@/data/artist';
import { releaseWorld } from '@/data/releaseWorlds';
import { channelProduction } from '@/data/socials';
import { releaseCopy } from '@/data/releaseCopy';
import { dateLabel } from '@/i18n/config';
import type { Locale, Release } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { useMusic } from './MusicProvider';
import { playableSources } from './musicSources';
import { PlayIcon } from './PersistentPlayer';
import { Arrow } from '../primitives';
import { nextIndex } from '../media/archiveMath';
import { ReleaseWorld, ReleaseWorldArtwork } from './ReleaseWorld';
import { HkzMark } from '../interaction/HkzMark';
import type { CinemaOrigin } from '../cinema/CinemaWorld';
import { acquireSceneGesture } from '@/lib/sceneNavigation';

const GeniusLyricsPanel = dynamic(() => import('./GeniusLyricsPanel'), {ssr:false});
const MusicCinema = dynamic(() => import('../cinema/MusicCinema'), {ssr:false});

const mobileQuery = '(max-width: 767px)';
function subscribeLayout(listener: () => void) {
 const query = window.matchMedia(mobileQuery);
 query.addEventListener('change', listener);
 return () => query.removeEventListener('change', listener);
}
const mobileSnapshot = () => window.matchMedia(mobileQuery).matches;
const serverSnapshot = () => false;

export function MusicExperience({locale}:{locale:Locale}) {
 const music=useMusic(),copy=releaseCopy[locale],motion=useSignalMotion();
 const [lyricsOpen, setLyricsOpen] = useState(false), [cinemaMounted, setCinemaMounted] = useState(false), [cinemaOpen, setCinemaOpen] = useState(false);
 const [cinemaRelease, setCinemaRelease] = useState(featuredRelease), [origin, setOrigin] = useState<CinemaOrigin|null>(null);
 const lyricsOpener = useRef<HTMLElement|null>(null), cinemaOpener = useRef<HTMLElement|null>(null);
 const mobile = useSyncExternalStore(subscribeLayout, mobileSnapshot, serverSnapshot);
 const committed=music.selectedRelease, active=committed, world=releaseWorld(committed.id);
 const text=sceneCopy[locale];
 const source=playableSources(committed).find(item=>item.kind==='Spotify');
 const buttons=useRef<(HTMLButtonElement|null)[]>([]);
 const artStage=useRef<HTMLDivElement>(null);
 const gesture=useRef<{x:number;y:number;release?:()=>void}|null>(null),wheel=useRef({amount:0,last:0});
 const select=music.selectRelease;
 useEffect(()=>{
  const reveal=()=>{const button=buttons.current[releases.indexOf(committed)],rail=button?.parentElement;
   if(button&&rail&&rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:button.offsetLeft-rail.offsetLeft-rail.clientWidth/2+button.clientWidth/2,behavior:motion?'smooth':'instant'});};
  reveal();window.addEventListener('resize',reveal);return()=>window.removeEventListener('resize',reveal);
 },[committed,motion]);
 useEffect(()=>{
  const restore=()=>{const hash=window.location.hash;const release=releases.find(item=>hash===`#release-${item.id}`||hash===`#film-${item.id}`)??(['#channels','#transmissions','#music','#visuals'].includes(hash)?featuredRelease:null);if(release){select(release);if(cinemaOpen&&cinemaRelease.id!==release.id){setOrigin(null);setCinemaRelease(release);}}};
  restore();window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
  return()=>{window.removeEventListener('hashchange',restore);window.removeEventListener('popstate',restore);};
 },[select,cinemaOpen,cinemaRelease.id]);
 const commit = useCallback((release:Release,focus=false) => {
  select(release);
  const hash=`#release-${release.id}`;
  if(window.location.hash!==hash)window.history.pushState(null,'',hash);
  if(focus)buttons.current[releases.indexOf(release)]?.focus({preventScroll:true});
 }, [select]);
 const move = useCallback((direction:number,focus=false) => {commit(releases[nextIndex(releases.indexOf(committed),direction,releases.length)],focus);}, [committed,commit]);
 useEffect(()=>{
  const stage=artStage.current;if(!stage)return;
  const wheelSelect=(event:WheelEvent)=>{
   if(event.ctrlKey||Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;
   event.preventDefault();event.stopPropagation();const now=performance.now();
   if(now-wheel.current.last>250)wheel.current.amount=0;
   wheel.current.amount+=event.deltaX;wheel.current.last=now;
   if(Math.abs(wheel.current.amount)>90){move(wheel.current.amount>0?1:-1);wheel.current.amount=0;}
  };
  stage.addEventListener('wheel',wheelSelect,{passive:false});
  return()=>stage.removeEventListener('wheel',wheelSelect);
 },[move]);
 useEffect(()=>{
  const cancel=()=>{gesture.current?.release?.();gesture.current=null;};
  const visibility=()=>{if(document.hidden)cancel();};
  window.addEventListener('blur',cancel);window.addEventListener('pointerup',cancel);
  document.addEventListener('visibilitychange',visibility);
  return()=>{cancel();window.removeEventListener('blur',cancel);window.removeEventListener('pointerup',cancel);document.removeEventListener('visibilitychange',visibility);};
 },[]);
 function keyboard(event:KeyboardEvent) {
  const direction=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;
  if(direction){event.preventDefault();move(direction,true);}
  else if(event.key==='Home'||event.key==='End'){event.preventDefault();commit(releases[event.key==='Home'?0:releases.length-1],true);}
 }
 function startGesture(event:PointerEvent<HTMLDivElement>) {
  if(event.button!==0||!event.isPrimary)return;gesture.current={x:event.clientX,y:event.clientY};
 }
 function trackGesture(event:PointerEvent<HTMLDivElement>) {
  const start=gesture.current;if(!start||start.release)return;
  const dx=Math.abs(event.clientX-start.x),dy=Math.abs(event.clientY-start.y);
  if(dx>10&&dx>dy*1.3){event.currentTarget.setPointerCapture(event.pointerId);start.release=acquireSceneGesture('music',event.currentTarget);}
 }
 function endGesture(event:PointerEvent<HTMLDivElement>) {
  const start=gesture.current;gesture.current=null;if(!start)return;start.release?.();
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);
 }
 function watch(opener: HTMLElement) {
  cinemaOpener.current=opener;const rect=artStage.current?.getBoundingClientRect();
  setOrigin(rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null);
  music.stop();music.setExpanded(false);setCinemaRelease(committed);setCinemaMounted(true);setCinemaOpen(true);
 }
 function moveFilm(direction: number) {
  const available=releases.filter(release=>playableSources(release).some(source=>source.kind==='YouTube'));
  const next=available[nextIndex(available.indexOf(cinemaRelease),direction,available.length)];
  setOrigin(null);setCinemaRelease(next);commit(next);
 }
 return <section tabIndex={-1} id="music" className="v3-scene music-scene release-universe" data-motion={motion} aria-labelledby="music-title">
  {/* Old URLs resolve to this same scene; they are not additional navigation entries. */}
  <span id="channels" className="legacy-anchor"/><span id="transmissions" className="legacy-anchor"/><span id="visuals" className="legacy-anchor"/>
  {releases.map(release=><span key={release.id} id={`release-${release.id}`} className="legacy-anchor"/>)}
  {releases.map(release=><span key={release.id} id={`film-${release.id}`} className="legacy-anchor"/>)}
  <ReleaseWorld world={world}>
  <header className="scene-heading"><h2 id="music-title">{text.music}</h2><span className="metadata">{world.mood[locale]} / {String(releases.length).padStart(2,'0')}</span></header>
  <div className="deck-composition">
   <div className="deck-selector" role="tablist" aria-label={copy.index} aria-orientation={mobile ? 'horizontal' : 'vertical'} onKeyDown={keyboard}>
    {releases.map((release,index)=><button type="button" role="tab" id={`release-tab-${release.id}`} aria-controls="release-panel" aria-selected={committed.id===release.id} tabIndex={committed.id===release.id?0:-1} key={release.id} ref={element=>{buttons.current[index]=element;}} onClick={()=>commit(release)}><span className="metadata">{String(index+1).padStart(2,'0')}</span><span>{release.title}{release.featuredArtist&&<small>feat. {release.featuredArtist}</small>}</span><Arrow /></button>)}
   </div>
   <div id="release-panel" className="deck-panel" role="tabpanel" aria-labelledby={`release-tab-${committed.id}`} tabIndex={0} onKeyDown={keyboard}>
    <div ref={artStage} className="deck-art-stage" data-parallax="type" data-scene-interaction="music" data-cursor="drag" onPointerDown={startGesture} onPointerMove={trackGesture} onPointerUp={endGesture} onPointerCancel={()=>{gesture.current?.release?.();gesture.current=null;}} onLostPointerCapture={event=>{if(event.target===event.currentTarget){gesture.current?.release?.();gesture.current=null;}}}>
     <ReleaseWorldArtwork world={world}/>
    </div>
    <div className="deck-information" data-parallax="detail">
     <div className="deck-caption"><h3>{active.title}</h3><div className="deck-metadata">{active.date&&<time dateTime={active.date}>{dateLabel(active.date)}</time>}{active.featuredArtist&&<span>feat. {active.featuredArtist}</span>}</div></div>
     <div className="deck-actions">{source&&<button type="button" data-cursor="play" aria-label={`${copy.listen}: ${committed.title}`} onClick={()=>{commit(committed);music.listen(committed,source);}}><span>{copy.listen}</span><PlayIcon playing={false}/></button>}{playableSources(committed).some(source=>source.kind==='YouTube')&&<button type="button" data-cursor="view" aria-label={`${copy.watch}: ${committed.title}`} onClick={event=>watch(event.currentTarget)}><span>{copy.watch}</span><Arrow diagonal/></button>}<button type="button" data-cursor="view" aria-label={`${locale==='fr'?'Paroles':'Lyrics'}: ${committed.title}`} onClick={event=>{lyricsOpener.current=event.currentTarget;setLyricsOpen(true);}}><span>{locale==='fr'?'Paroles':'Lyrics'}</span>{world.geniusSongId?<Arrow diagonal/>:<small>SOON</small>}</button></div>
    </div>
   </div>
  </div>
  <footer className="deck-footer"><p className="metadata">CEO1.9 / {text.catalogue}</p><div className="deck-controls"><button type="button" aria-label={copy.previous} onClick={()=>move(-1)}><DeckArrow reverse/></button><span className="metadata">{String(releases.indexOf(committed)+1).padStart(2,'0')} / {String(releases.length).padStart(2,'0')}</span><button type="button" aria-label={copy.next} onClick={()=>move(1)}><DeckArrow/></button></div></footer>
  <div className="release-production"><HkzMark/><span className="metadata">PRODUCTION BY HKZ PROD</span><a href={channelProduction.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={channelProduction.youtube} target="_blank" rel="noopener noreferrer">YouTube ↗</a></div>
  </ReleaseWorld>
  {lyricsOpen&&<GeniusLyricsPanel world={world} locale={locale} opener={lyricsOpener} onClose={()=>setLyricsOpen(false)}/>}
  {cinemaMounted&&<MusicCinema open={cinemaOpen} release={cinemaRelease} locale={locale} opener={cinemaOpener} origin={origin} onClose={()=>setCinemaOpen(false)} onMove={moveFilm}/>}
  <p className="sr-only">{copy.hint}</p><p className="sr-only" role="status">{committed.title}{committed.featuredArtist&&` feat. ${committed.featuredArtist}`}</p>
 </section>;
}
function DeckArrow({reverse=false}:{reverse?:boolean}) {return <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true" style={{transform:reverse?'rotate(180deg)':undefined}}><path d="M1 8h19m-6-6 6 6-6 6" stroke="currentColor"/></svg>;}
