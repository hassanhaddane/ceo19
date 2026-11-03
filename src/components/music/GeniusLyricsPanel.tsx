'use client';
import Image from 'next/image';
import {UtilityButton,UtilityGlyph} from '../interactive/UtilityAction';
import {RevealAction} from '../interactive/RevealAction';
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { geniusEntry } from '@/data/lyrics';
import { assetUrl } from '@/data/assets';
import type { ReleaseWorldConfig } from '@/data/releaseWorlds';
import { geniusEmbedDocument, isGeniusEmbedMessage } from '@/lib/geniusEmbed';
import { visualEffects } from '@/lib/visualEffects';
import type { Locale } from '@/types/content';
import { useSignalMotion } from '@/lib/signalMotion';
import { useMediaDialog } from '../media/useMediaDialog';

/** Client-only, on demand. Genius's document.write stays in a disposable opaque-origin frame. */
export default function GeniusLyricsPanel({ world, locale, opener, onClose }: { world: ReleaseWorldConfig; locale: Locale; opener: RefObject<HTMLElement | null>; onClose: () => void }) {
 const { dialog } = useMediaDialog(true, opener);
 const entry = geniusEntry(world.releaseId), source = geniusEmbedDocument(world.releaseId);
 const frame = useRef<HTMLIFrameElement>(null);
 const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
 const fr = locale === 'fr', motion = useSignalMotion();
 useEffect(()=>{
  if(!motion)return;const surface=dialog.current?.querySelector('.lyrics-embed-area,.lyrics-soon');if(!surface)return;
  const animation=surface.animate([{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:visualEffects.lyrics.entry,easing:visualEffects.releases.easing});
  return()=>animation.cancel();
 },[dialog,motion]);
 useEffect(() => {
  if (!entry) return;
  let alive = true;
  const timeout = setTimeout(() => { if (alive) setStatus('error'); }, visualEffects.lyrics.timeout + 500);
  const message = (event: MessageEvent) => {
   if (!isGeniusEmbedMessage(event, frame.current?.contentWindow, world.releaseId)) return;
   clearTimeout(timeout);
   if(event.data.status==='close') onClose(); else setStatus(event.data.status);
  };
  window.addEventListener('message', message);
  return () => { alive = false; clearTimeout(timeout); window.removeEventListener('message', message); };
 }, [entry, world.releaseId, onClose]);
 return <dialog ref={dialog} className="lyrics-dialog" style={{'--lyrics-bg':world.backgroundColor,'--lyrics-accent':world.accentColor,'--lyrics-text':world.textColor} as CSSProperties} data-release={world.releaseId} data-owned-interaction aria-labelledby="lyrics-panel-title" onCancel={event => { event.preventDefault(); onClose(); }}>
  <header className="lyrics-header"><span className="metadata">CEO1.9 / {fr ? 'PAROLES' : 'LYRICS'}</span><UtilityButton data-cursor="close" onClick={onClose}>{fr ? 'Fermer' : 'Close'}<UtilityGlyph kind="close"/></UtilityButton></header>
  <div className="lyrics-identity">{world.cover && <Image src={assetUrl(world.cover)} alt="" width={100} height={100}/>}<div><h2 id="lyrics-panel-title">{world.title}</h2><span className="metadata">{world.artists.join(' / ')}</span></div></div>
  {entry && source ? <>
   <div className="lyrics-embed-area" data-scroll-owner aria-busy={status === 'loading'}>
    {status === 'loading' && <p className="metadata" role="status">{fr ? 'Chargement depuis Genius…' : 'Loading from Genius…'}</p>}
    {status !== 'error' ? <iframe ref={frame} className="genius-frame" srcDoc={source} title={`${world.title} — Genius lyrics`} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer"/> : <div className="lyrics-fallback"><span className="lyrics-glyph" aria-hidden="true">↗</span><p>{fr ? 'Les paroles vous attendent sur Genius.' : 'The lyrics are waiting on Genius.'}</p></div>}
   </div>
   <RevealAction className="genius-external" href={entry.url} target="_blank" rel="noopener noreferrer" data-cursor="enter">{fr ? 'OUVRIR SUR GENIUS' : 'OPEN ON GENIUS'}</RevealAction>
  </> : <div className="lyrics-soon"><span>SOON</span><p className="metadata">{fr ? 'Paroles à venir' : 'Lyrics to follow'}</p></div>}
 </dialog>;
}
