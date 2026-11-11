'use client';
import { useRef, type ReactNode } from 'react';
import { UtilityButton, UtilityGlyph, UtilityLink } from '../interactive/UtilityAction';
import { ActionLabel, ActionMark } from '../interactive/ActionButton';
import { artist } from '@/data/artist';
import type { Locale } from '@/types/content';
import { useMusic } from './MusicProvider';
import { musicCopy } from './musicCopy';
import { playableSources, releaseLinks, timeLabel } from './musicSources';
import { PlatformIcon } from './PlatformIcon';
import { ReleaseArtwork } from './ReleaseArtwork';
import { useSceneState } from '@/lib/sceneNavigation';
export function PlayIcon({playing}: {playing:boolean}) {
 return <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">{playing ? <path d="M5 3h3v14H5zm7 0h3v14h-3z"/> : <path d="M6 3v14l11-7z"/>}</svg>;
}
export function PersistentPlayer({locale,embed}: {locale:Locale;embed:ReactNode}) {
 const music=useMusic(), copy=musicCopy[locale];
 const scene=useSceneState();
 const expandButton=useRef<HTMLButtonElement>(null);
 const minimize=()=>{music.setExpanded(false); if(scene.enabled&&!music.source) (document.querySelector<HTMLElement>('#'+scene.active+' .music-player-open')??document.getElementById(scene.active))?.focus({preventScroll:true}); else expandButton.current?.focus();};
 const sources=playableSources(music.activeTrack);
 const label=`${music.isPlaying?copy.pause:copy.play}: ${music.activeTrack.title}`;
 const progress=music.progress!==null&&music.duration ? Math.min(100,music.progress/music.duration*100):0;
 return <aside className="persistent-player" data-idle-scene={scene.enabled&&!music.source&&!music.expanded} data-engaged={!!music.source||music.expanded} data-expanded={music.expanded} data-playing={music.isPlaying} aria-label={`${copy.concept} / ${artist.name}`}>
 <div id="music-player-expanded" className="player-expanded" hidden={!music.expanded} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();minimize();}}}>
  <div className="player-heading"><span className="metadata">{copy.concept} / {music.source?.kind==='preview'?copy.preview:music.source?.kind??artist.name}</span><UtilityButton type="button" data-cursor="close" onClick={minimize} aria-label={copy.minimize}><UtilityGlyph kind="minimize"/></UtilityButton></div>
  <div className="player-release"><ReleaseArtwork release={music.activeTrack} locale={locale} compact/><div><h2>{music.activeTrack.title}</h2><p>{artist.name}{music.activeTrack.featuredArtist&&` feat. ${music.activeTrack.featuredArtist}`}</p></div></div>
  <div className="player-sources">{sources.map(source=><UtilityButton type="button" key={source.kind} aria-pressed={music.source?.kind===source.kind} onClick={()=>music.listen(music.activeTrack,source)}><PlatformIcon platform={source.kind}/>{source.kind==='preview'?copy.preview:source.kind}</UtilityButton>)}</div>
  <p className="player-status" role="status">{music.status==='loading'?copy.loading:music.status==='error'?copy.unavailable:music.source?.kind==='preview'?(music.isPlaying?copy.playing:copy.paused):music.isPlaying?copy.playing:music.progress!==null?copy.paused:music.source?copy.ready:copy.idle}</p>
  {embed}
  {music.source?.kind==='preview'&&music.duration!==null&&<label className="player-seek"><span className="sr-only">{copy.seek}</span><input type="range" min="0" max={music.duration} step=".1" value={music.progress??0} onChange={event=>music.seek(Number(event.target.value))}/><span>{timeLabel(music.progress)} / {timeLabel(music.duration)}</span></label>}
  {music.source?.kind==='YouTube'&&<p className="player-status">{copy.videoNote}</p>}
  <div className="player-external">{releaseLinks(music.activeTrack).map(link=><UtilityLink key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={`${copy.external}: ${link.platform} — ${music.activeTrack.title}`}><PlatformIcon platform={link.platform}/>{link.platform}<ActionMark/></UtilityLink>)}</div>
  {music.source&&<UtilityButton className="player-stop metadata" data-cursor="close" type="button" onClick={()=>{music.stop();expandButton.current?.focus();}}><ActionLabel>{copy.stop}</ActionLabel><UtilityGlyph kind="close"/></UtilityButton>}
 </div>
 <div className="player-bar">
  <UtilityButton type="button" className="player-play" data-cursor={music.isPlaying?"close":"listen"} onClick={music.toggle} aria-label={label} disabled={!sources.length || music.status==='loading'}><PlayIcon playing={music.isPlaying}/></UtilityButton>
  <UtilityButton type="button" className="player-track" data-cursor={music.expanded?"close":"enter"} onClick={()=>music.setExpanded(!music.expanded)} aria-label={`${music.expanded?copy.minimize:copy.expand}: ${music.activeTrack.title}`} aria-controls="music-player-expanded" aria-expanded={music.expanded}><strong>{music.activeTrack.title}</strong><span>{artist.name}</span></UtilityButton>
  <div className="player-timeline" aria-label={copy.progress}><div role="progressbar" aria-label={copy.progress} aria-valuemin={0} aria-valuemax={100} {...(music.duration!==null?{'aria-valuenow':Math.round(progress)}:{'aria-valuetext':copy.noPreview})}><span style={{width:`${progress}%`}}/></div><span>{timeLabel(music.progress)} / {timeLabel(music.duration)}</span></div>
  <UtilityButton type="button" className="player-expand" data-cursor={music.expanded?"close":"enter"} ref={expandButton} onClick={()=>music.setExpanded(!music.expanded)} aria-label={music.expanded?copy.minimize:copy.expand} aria-expanded={music.expanded} aria-controls="music-player-expanded"><UtilityGlyph kind={music.expanded?'minimize':'expand'}/></UtilityButton>
 </div>
 </aside>;
}
