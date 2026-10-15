'use client';
import Image from 'next/image';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { geniusEntry } from '@/data/lyrics';
import { assetUrl } from '@/data/assets';
import type { ReleaseWorldConfig } from '@/data/releaseWorlds';
import { geniusEmbedDocument, isGeniusEmbedMessage } from '@/lib/geniusEmbed';
import { visualEffects } from '@/lib/visualEffects';
import type { Locale } from '@/types/content';
import { useMediaDialog } from '../media/useMediaDialog';

/** Client-only, on demand. Genius's document.write stays in a disposable opaque-origin frame. */
export default function GeniusLyricsPanel({ world, locale, opener, onClose }: { world: ReleaseWorldConfig; locale: Locale; opener: RefObject<HTMLElement | null>; onClose: () => void }) {
 const { dialog } = useMediaDialog(true, opener);
 const entry = geniusEntry(world.id), source = geniusEmbedDocument(world.id);
 const frame = useRef<HTMLIFrameElement>(null);
 const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
 const fr = locale === 'fr';
 useEffect(() => {
  if (!entry) return;
  let alive = true;
  const timeout = setTimeout(() => { if (alive) setStatus('error'); }, visualEffects.lyrics.timeout + 500);
  const message = (event: MessageEvent) => {
   if (!isGeniusEmbedMessage(event, frame.current?.contentWindow, world.id)) return;
   clearTimeout(timeout); setStatus(event.data.status);
  };
  window.addEventListener('message', message);
  return () => { alive = false; clearTimeout(timeout); window.removeEventListener('message', message); };
 }, [entry, world.id]);
 return <dialog ref={dialog} className="lyrics-dialog" data-owned-interaction aria-labelledby="lyrics-panel-title" onCancel={event => { event.preventDefault(); onClose(); }}>
  <header className="lyrics-header"><span className="metadata">CEO1.9 / {fr ? 'PAROLES' : 'LYRICS'}</span><button data-cursor="close" onClick={onClose}>{fr ? 'Fermer' : 'Close'} ×</button></header>
  <div className="lyrics-identity">{world.coverAsset && <Image src={assetUrl(world.coverAsset)} alt="" width={100} height={100}/>}<div><h2 id="lyrics-panel-title">{world.title}</h2><span className="metadata">{world.artists.join(' / ')}</span></div></div>
  {entry && source ? <>
   <div className="lyrics-embed-area" data-scroll-owner aria-busy={status === 'loading'}>
    {status === 'loading' && <p className="metadata" role="status">{fr ? 'Chargement depuis Genius…' : 'Loading from Genius…'}</p>}
    {status !== 'error' ? <iframe ref={frame} className="genius-frame" srcDoc={source} title={`${world.title} — Genius lyrics`} sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer"/> : <div className="lyrics-fallback"><span className="lyrics-glyph" aria-hidden="true">↗</span><p>{fr ? 'Les paroles vous attendent sur Genius.' : 'The lyrics are waiting on Genius.'}</p></div>}
   </div>
   <a className="genius-external" href={entry.url} target="_blank" rel="noopener noreferrer" data-cursor="enter">{fr ? 'Ouvrir les paroles sur Genius' : 'Open lyrics on Genius'} ↗</a>
  </> : <div className="lyrics-soon"><span>SOON</span><p className="metadata">{fr ? 'Paroles à venir' : 'Lyrics to follow'}</p></div>}
 </dialog>;
}
