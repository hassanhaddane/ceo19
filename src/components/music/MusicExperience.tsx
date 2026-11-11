'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { featuredRelease, releases, releaseFromHash } from '@/data/releases';
import { releaseWorld } from '@/data/releaseWorlds';
import { releaseCopy } from '@/data/releaseCopy';
import { dateLabel } from '@/i18n/config';
import { releaseAccess } from '@/lib/releaseAccess';
import type { Locale, Release } from '@/types/content';
import { useSoundManager } from '@/features/audio/SoundProvider';
import { useMusic } from './MusicProvider';
import { MusicAction } from '../interactive/MusicAction';
import { ActionButton, ActionLabel, ActionMark } from '../interactive/ActionButton';
import { nextIndex } from '../media/archiveMath';
import { ReleaseWorld } from './ReleaseWorld';
import { ReleaseCarousel } from './ReleaseCarousel';
import { useReleaseCarousel } from './useReleaseCarousel';
import { HkzMark } from '../interaction/HkzMark';
import { PlatformIcon } from './PlatformIcon';
import type { CinemaOrigin } from '../cinema/CinemaWorld';

const GeniusLyricsPanel = dynamic(() => import('./GeniusLyricsPanel'), {ssr:false});
const MusicCinema = dynamic(() => import('../cinema/MusicCinema'), {ssr:false});

export function MusicExperience({locale}:{locale:Locale}) {
 const sound=useSoundManager();
 const music=useMusic(),copy=releaseCopy[locale],fr=locale==='fr';
 const [lyricsOpen,setLyricsOpen]=useState(false),[cinemaMounted,setCinemaMounted]=useState(false),[cinemaOpen,setCinemaOpen]=useState(false);
 const [cinemaRelease,setCinemaRelease]=useState(featuredRelease),[origin,setOrigin]=useState<CinemaOrigin|null>(null);
 const lyricsOpener=useRef<HTMLElement|null>(null),cinemaOpener=useRef<HTMLElement|null>(null);
 const closeLyrics=useCallback(()=>setLyricsOpen(false),[]);
 const select=music.selectRelease;
 const commit=useCallback((release:Release)=>{
  select(release);
  const hash=`#release-${release.id}`;
  // Preserve scene navigation that happened while an artwork was still travelling.
  if(window.location.hash.startsWith('#release-')||window.location.hash.startsWith('#film-')||window.location.hash==='#music'){
   if(window.location.hash!==hash)window.history.pushState(null,'',hash);
  }
 },[select]);
 const carousel=useReleaseCarousel(music.selectedRelease,commit,closeLyrics);
 const {activeRelease,incomingRelease,select:selectCarouselRelease}=carousel;
 const world=releaseWorld(activeRelease.id),access=releaseAccess(activeRelease);
 const [lyricsReleaseId,setLyricsReleaseId]=useState(activeRelease.id);
 if(lyricsReleaseId!==activeRelease.id){setLyricsReleaseId(activeRelease.id);setLyricsOpen(false);}
 useEffect(()=>{
  const restore=()=>{const release=releaseFromHash(window.location.hash);if(release)selectCarouselRelease(release);};
  restore();window.addEventListener('hashchange',restore);window.addEventListener('popstate',restore);
  return()=>{window.removeEventListener('hashchange',restore);window.removeEventListener('popstate',restore);};
 },[selectCarouselRelease]);
 function watch(opener:HTMLElement) {
  sound.pauseRadio();
  cinemaOpener.current=opener;const rect=carousel.stageRef.current?.querySelector('[data-position="center"] .carousel-cover')?.getBoundingClientRect();
  setOrigin(rect?{left:rect.left,top:rect.top,width:rect.width,height:rect.height}:null);
  music.stop();music.setExpanded(false);setCinemaRelease(activeRelease);setCinemaMounted(true);setCinemaOpen(true);
 }
 function moveFilm(step:number) {
  const available=releases.filter(release=>releaseAccess(release).watch);
  const next=available[nextIndex(available.indexOf(cinemaRelease),step,available.length)];
  setOrigin(null);setCinemaRelease(next);carousel.select(next);
 }
 const playLabel=access.playIsArtist?(fr?'SPOTIFY ARTISTE':'ARTIST SPOTIFY'):copy.listen;
 const lyricsLabel=fr?'Paroles':'Lyrics';
 return <section tabIndex={-1} id="music" className="v3-scene music-scene release-universe" aria-labelledby="music-title" data-scene-number="02">
  {releases.flatMap(release=>[<span key={`release-${release.id}`} id={`release-${release.id}`} className="legacy-anchor"/>,<span key={`film-${release.id}`} id={`film-${release.id}`} className="legacy-anchor"/>])}
  <ReleaseWorld world={world} incomingWorld={incomingRelease?releaseWorld(incomingRelease.id):null} worldRef={carousel.worldRef} direction={carousel.direction}>
   <header className="music-world-heading"><h2 id="music-title">{fr?'MUSIQUE':'MUSIC'}</h2><span className="metadata" aria-label={fr?'Sortie sélectionnée':'Selected release'}>{String(releases.indexOf(activeRelease)+1).padStart(2,'0')} / {String(releases.length).padStart(2,'0')}</span></header>
   <div id="release-panel" className="music-release-stage">
    <ReleaseCarousel {...carousel} locale={locale}/>
    <div key={activeRelease.id} className="music-release-identity"><h3>{activeRelease.title}</h3><div className="music-release-metadata"><span>CEO1.9{activeRelease.featuredArtist&&` / ${activeRelease.featuredArtist}`}</span>{activeRelease.date&&<time dateTime={activeRelease.date}>{dateLabel(activeRelease.date)}</time>}</div></div>
    <div className="music-release-actions" inert={carousel.busy}>
     {access.play&&<MusicAction className="music-play" href={access.play} target="_blank" rel="noopener noreferrer" aria-label={`${playLabel}: ${access.playIsArtist?'CEO1.9':activeRelease.title} — Spotify`} onClick={()=>{music.stop();music.setExpanded(false);}}><ActionLabel>{playLabel}</ActionLabel><PlatformIcon platform="Spotify"/></MusicAction>}
     {access.watch&&<MusicAction className="music-watch" aria-label={`${copy.watch}: ${activeRelease.title}`} onClick={event=>watch(event.currentTarget)}><ActionLabel>{copy.watch}</ActionLabel><ActionMark/></MusicAction>}
     <MusicAction className="music-lyrics" cursor="view" aria-label={`${lyricsLabel}: ${activeRelease.title}`} onClick={event=>{lyricsOpener.current=event.currentTarget;setLyricsOpen(true);}}><ActionLabel>{lyricsLabel}</ActionLabel>{world.geniusId?<ActionMark/>:<small>SOON</small>}</MusicAction>
    </div>
   </div>
   <nav className="release-selector" aria-label={copy.index} onKeyDown={carousel.keyboard}>
    {releases.map((release,index)=><ActionButton family="navigation" id={`release-tab-${release.id}`} aria-controls="release-panel" aria-label={`${copy.select}: ${release.title}`} aria-current={activeRelease.id===release.id?'true':undefined} key={release.id} onClick={()=>carousel.select(release)}><span className="metadata">{String(index+1).padStart(2,'0')}</span><ActionLabel>{release.title}</ActionLabel></ActionButton>)}
   </nav>
   <footer className="release-production"><HkzMark/><span className="metadata">HKZ PROD</span></footer>
  </ReleaseWorld>
  {lyricsOpen&&<GeniusLyricsPanel key={world.releaseId} world={world} locale={locale} opener={lyricsOpener} onClose={closeLyrics}/>}
  {cinemaMounted&&<MusicCinema open={cinemaOpen} release={cinemaRelease} locale={locale} opener={cinemaOpener} origin={origin} onClose={()=>setCinemaOpen(false)} onMove={moveFilm}/>}
  <p className="sr-only">{copy.hint}</p><p className="sr-only" role="status">{activeRelease.title}{activeRelease.featuredArtist&&` feat. ${activeRelease.featuredArtist}`}</p>
 </section>;
}
