'use client';
import {signalInteraction} from '@/lib/interactions';
import type {CSSProperties} from 'react';
import {motion as timings} from '@/lib/motion';
import {defaultChannelWorld} from '@/data/channelWorlds';
import {ChannelArtwork} from '../channels/ChannelArtwork';
import {ProductionStamp} from '../channels/ProductionStamp';
import {useChannelTransition} from '../channels/useChannelTransition';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { featuredRelease, releases } from '@/data/releases';
import { videos } from '@/data/videos';
import { transmissionCopy } from '@/data/transmissions';
import { dateLabel } from '@/i18n/config';
import type { Locale, Release } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { useMusic } from '../music/MusicProvider';
import { playableSources, releaseLinks } from '../music/musicSources';
import { PlatformIcon } from '../music/PlatformIcon';
import { PlayIcon } from '../music/PersistentPlayer';
import { SignalSlot } from '../signal/SignalSlot';
import { nextIndex } from '../media/archiveMath';
import type {CinemaOrigin} from '../cinema/CinemaWorld';
import { TransmissionViewer } from './TransmissionViewer';

export function TransmissionsExperience({locale}:{locale:Locale}) {
 const music=useMusic(),copy=transmissionCopy[locale],motion=useSignalMotion();
 const [cinemaOrigin,setCinemaOrigin]=useState<CinemaOrigin|null>(null);
 const [filmId,setFilmId]=useState<string|null>(null);
 const root=useRef<HTMLElement|null>(null);
 const [fragment,setFragment]=useState(0);
 const committed=music.selectedRelease;
 const {active,busy}=useChannelTransition(committed,motion,root);
 const world={...defaultChannelWorld,...active};
 const phrases=world.punchlines??[];
 const mainPhrase=active.id==='kritika'?['KRITIKA','KRITIKA','KRITIKA']:phrases[0]?phrases[0].split(' '):[active.title];
 const fragments=phrases.slice(1);
 const duration=timings.channels[world.motionProfile??'press'];
 const styles={'--channel-bg':world.backgroundColor,'--channel-fg':world.foregroundColor,'--channel-accent':world.accentColor,'--channel-duration':`${duration}ms`,'--channel-reveal':`${duration*(1-timings.channelExitRatio)}ms`,'--channel-meta-duration':`${duration*(1-timings.channelExitRatio-timings.channelMetadataRatio)}ms`,'--channel-follow':`${duration*timings.channelMetadataRatio}ms`} as CSSProperties;
 const source=playableSources(committed).find(item=>item.kind==='preview')??playableSources(committed).find(item=>item.kind==='Spotify');
 const video=videos.find(item=>item.releaseId===committed.id);
 const films=releases.flatMap(release=>videos.filter(item=>item.releaseId===release.id));
 const film=films.find(item=>item.id===filmId)??null;
 const buttons=useRef<(HTMLButtonElement|null)[]>([]),opener=useRef<HTMLElement|null>(null);
 const gesture=useRef<{x:number;y:number}|null>(null),wheel=useRef({amount:0,last:0});
 const select=music.selectRelease;
 useEffect(()=>{
  const reveal=()=>{const button=buttons.current[releases.indexOf(committed)],rail=button?.parentElement;
   if(button&&rail&&rail.scrollWidth>rail.clientWidth)rail.scrollTo({left:button.offsetLeft-rail.offsetLeft-rail.clientWidth/2+button.clientWidth/2,behavior:motion?'smooth':'instant'});};
  reveal();window.addEventListener('resize',reveal);return()=>window.removeEventListener('resize',reveal);
 },[committed,motion]);
 useEffect(()=>{
  const restore=()=>{const hash=window.location.hash;const release=releases.find(item=>hash===`#release-${item.id}`||hash===`#film-${item.id}`)??(['#channels','#transmissions','#music','#visuals'].includes(hash)?featuredRelease:null);if(release){select(release);}};
  restore();window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
  return()=>{window.removeEventListener('hashchange',restore);window.removeEventListener('popstate',restore);};
 },[select]);
 function commit(release:Release,focus=false) {
  if(release.id!==committed.id)signalInteraction('channel',`CH.${String(releases.indexOf(release)+1).padStart(2,'0')} / ${release.title}`);
  select(release);setFragment(0);
  const hash=`#release-${release.id}`;
  if(window.location.hash!==hash)window.history.pushState(null,'',hash);
  if(focus)buttons.current[releases.indexOf(release)]?.focus({preventScroll:true});
 }
 function move(direction:number,focus=false) {commit(releases[nextIndex(releases.indexOf(committed),direction,releases.length)],focus);}
 function keyboard(event:KeyboardEvent) {
  const direction=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;
  if(direction){event.preventDefault();move(direction,true);}
  else if(event.key==='Home'||event.key==='End'){event.preventDefault();commit(releases[event.key==='Home'?0:releases.length-1],true);}
 }
 function startGesture(event:PointerEvent<HTMLDivElement>) {
  if(event.button!==0)return;gesture.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);
 }
 function endGesture(event:PointerEvent<HTMLDivElement>) {
  const start=gesture.current;gesture.current=null;if(!start)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)move(dx<0?1:-1);
 }
 function watch(button:HTMLButtonElement) {
  if(!video)return;
  const rect=root.current?.querySelector('.deck-artwork')?.getBoundingClientRect();
  setCinemaOrigin(rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null);
  opener.current=button;commit(committed);music.stop();music.setExpanded(false);setFilmId(video.id);
 }
 function moveFilm(direction:number) {
  const next=films[nextIndex(films.findIndex(item=>item.id===filmId),direction,films.length)];
  if(!next)return;setCinemaOrigin(null);setFilmId(next.id);const release=releases.find(item=>item.id===next.releaseId);if(release){commit(release);opener.current=buttons.current[releases.indexOf(release)];}
 }
 return <section ref={root} id="channels" className="night-scene transmission-deck channel-world" style={styles} data-world={world.textureMode==='paper'?'street-print':'night'} data-channel-id={active.id} data-channel-mode={world.visualMode} data-channel-profile={world.motionProfile} data-texture={world.textureMode} data-transmission-release={active.id} data-signal-energy="1" data-motion={motion} data-film-open={film!==null} aria-labelledby="channels-title">
  <span id="transmissions" className="legacy-anchor"/><span id="music" className="legacy-anchor"/><span id="visuals" className="legacy-anchor"/>
  {releases.map(release=><span key={release.id} id={`release-${release.id}`} className="legacy-anchor"/>)}
  {videos.map(item=><span key={item.id} id={`film-${item.id}`} className="legacy-anchor"/>)}
  <div className="deck-phrase" aria-hidden="true" key={active.id}>{mainPhrase.map((line,index)=><span key={index}>{line}</span>)}</div>
  <header className="deck-heading"><h2 id="channels-title">CHANNELS</h2><p className="channel-mood metadata">{world.mood?.[locale]}</p></header>
  <div className="deck-composition">
   <div className="deck-selector" role="tablist" aria-label={copy.index} onKeyDown={keyboard}>
    {releases.map((release,index)=><button type="button" role="tab" id={`transmission-tab-${release.id}`} aria-controls="transmission-panel" aria-selected={committed.id===release.id} tabIndex={committed.id===release.id?0:-1} key={release.id} ref={element=>{buttons.current[index]=element;}} data-cursor="enter" data-interaction="silent" data-signal-response onClick={()=>commit(release)}><span className="metadata">{release.channel??`CH.${String(index+1).padStart(2,'0')}`}</span><span>{release.title}</span><i aria-hidden="true"/></button>)}
   </div>
   <div id="transmission-panel" className="deck-panel" role="tabpanel" aria-busy={busy} aria-labelledby={`transmission-tab-${committed.id}`} tabIndex={0} onKeyDown={keyboard}>
    <div className="deck-art-stage" data-cursor="drag" onPointerDown={startGesture} onPointerUp={endGesture} onPointerCancel={()=>{gesture.current=null;}} onWheel={event=>{if(Math.abs(event.deltaX)<=Math.abs(event.deltaY))return;const now=Date.now();if(now-wheel.current.last>250)wheel.current.amount=0;wheel.current.amount+=event.deltaX;wheel.current.last=now;if(Math.abs(wheel.current.amount)>90){move(wheel.current.amount>0?1:-1);wheel.current.amount=0;}}}>
     <ChannelArtwork key={active.id} release={active} locale={locale} pending={copy.pending}/>
     <SignalSlot section="music" channel={active}/>
    </div>
    <div className="deck-information" key={`info-${active.id}`}>
     <p className="channel-number">{active.channel}</p><h3>{active.title}</h3>
     <div className="deck-metadata">{active.date&&<time dateTime={active.date}>{dateLabel(active.date)}</time>}{active.featuredArtist&&<span>feat. {active.featuredArtist}</span>}</div>
     <div className="channel-fragment-slot">{fragments.length>1?<button type="button" className="channel-fragment" data-cursor="enter" aria-label={`${copy.fragment}: ${fragments[fragment%fragments.length]}`} onClick={()=>setFragment(value=>value+1)}>{fragments[fragment%fragments.length]}</button>:fragments.length===1?<p className="channel-fragment">{fragments[0]}</p>:null}</div><div className="deck-actions">{source&&<button type="button" disabled={busy} data-cursor="listen" data-signal-response aria-label={`${copy.listen}: ${committed.title}`} onClick={()=>{commit(committed);music.listen(committed,source);}}><span>{copy.listen}</span><PlayIcon playing={false}/></button>}{video&&<button type="button" disabled={busy} data-cursor="play" data-signal-mode="visuals" aria-label={`${copy.watch}: ${committed.title}`} aria-haspopup="dialog" onClick={event=>watch(event.currentTarget)}><span>{copy.watch}</span><PlayIcon playing={false}/></button>}</div>
     <div className="deck-platforms">{releaseLinks(active).map(link=><a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${copy.external} ${link.platform}: ${active.title}`}><PlatformIcon platform={link.platform}/><span>{link.platform}</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10 10 2M2 2h8v8" stroke="currentColor"/></svg></a>)}</div>
    </div>
   </div>
  </div>
  <footer className="deck-footer"><ProductionStamp locale={locale}/><div className="deck-controls"><button type="button" aria-label={copy.previous} onClick={()=>move(-1)}><DeckArrow reverse/></button><span className="metadata">CH.{String(releases.indexOf(committed)+1).padStart(2,'0')} / {String(releases.length).padStart(2,'0')}</span><button type="button" aria-label={copy.next} onClick={()=>move(1)}><DeckArrow/></button></div></footer>
  <p className="sr-only">{copy.hint}</p><p className="sr-only" role="status">{committed.title}{committed.featuredArtist&&` feat. ${committed.featuredArtist}`}</p>
  <TransmissionViewer origin={cinemaOrigin} locale={locale} video={film} opener={opener} onClose={()=>setFilmId(null)} onMove={moveFilm} count={films.length}/>
 </section>;
}
function DeckArrow({reverse=false}:{reverse?:boolean}) {return <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true" style={{transform:reverse?'rotate(180deg)':undefined}}><path d="M1 8h19m-6-6 6 6-6 6" stroke="currentColor"/></svg>;}
