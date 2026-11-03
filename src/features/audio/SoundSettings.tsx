'use client';
import { useEffect, useId, useRef, useState } from 'react';
import type { Locale } from '@/types/content';
import { backgroundMusic } from '@/data/audio';
import { useSound } from './SoundProvider';
import './sound.css';
import { UtilityButton, UtilityGlyph } from '@/components/interactive/UtilityAction';

function popoverPosition(rect: DOMRect) {
 return { left: Math.max(12, Math.min(innerWidth - 300, rect.right - 288)), top: Math.max(12, Math.min(innerHeight - 320, rect.bottom + 12)) };
}

/** One compact master switch + optional nonmodal radio settings, never a player bar. */
export function SoundSettings({ locale }: { locale: Locale }) {
 const state = useSound(), { soundEnabled, isPlaying, status: playbackStatus, manager } = state;
 const fr = locale === 'fr', enabled = isPlaying || playbackStatus === 'loading' || playbackStatus === 'buffering', id = useId();
 const panel = useRef<HTMLDivElement>(null), [open, setOpen] = useState(false);
 const wrapper = useRef<HTMLDivElement>(null), [fallback, setFallback] = useState(false), [above, setAbove] = useState(false);
 const [position, setPosition] = useState({ left: 12, top: 72 });
 const label = enabled ? 'SOUND ON' : 'SOUND OFF';
 const blocked = state.mediaLeaseActive;
 const error = playbackStatus === 'error' || state.availability === 'unavailable';
 const status = error ? fr ? 'La lecture est indisponible. Réessayez quand vous le souhaitez.' : 'Playback is unavailable. Retry when you are ready.'
  : blocked ? fr ? 'En pause pour le média ouvert.' : 'Paused for the open media.'
  : playbackStatus === 'loading' || playbackStatus === 'buffering' ? fr ? 'Chargement du son…' : 'Loading sound…'
  : isPlaying ? `${fr ? 'EN LECTURE' : 'NOW PLAYING'}: ${backgroundMusic.title}`
  : fr ? 'En pause. Reprenez quand vous le souhaitez.' : 'Paused. Resume when you are ready.';
 useEffect(() => { if (!enabled) panel.current?.hidePopover?.(); }, [enabled]);
 useEffect(() => {
  if (!open || fallback) return;
  const reposition = () => {
   const trigger = wrapper.current?.querySelector('.radio-settings-toggle');
   if (trigger) setPosition(popoverPosition(trigger.getBoundingClientRect()));
  };
  window.addEventListener('resize', reposition);
  return () => window.removeEventListener('resize', reposition);
 }, [open, fallback]);
 useEffect(() => {
  if (!fallback || !open) return;
  const outside = (event: PointerEvent) => { if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setOpen(false); };
  document.addEventListener('pointerdown', outside);
  return () => document.removeEventListener('pointerdown', outside);
 }, [fallback, open]);
 return <div ref={wrapper} className="sound-settings" data-radio-playing={isPlaying && enabled}>
  <UtilityButton cursor={enabled ? 'close' : 'play'} className="sound-toggle" aria-label={label} title={label} aria-pressed={enabled} disabled={blocked} onClick={() => { panel.current?.hidePopover?.(); setOpen(false); manager.chooseMode(!enabled); }}>
   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/>{enabled ? <g className="sound-waves"><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></g> : <path d="m16 9 6 6m0-6-6 6"/>}</svg>
   <span className="sound-toggle-label">{label}</span>
  </UtilityButton>
  {error && <UtilityButton className="sound-retry" disabled={blocked} onClick={manager.retryRadio} aria-label={fr ? 'Réessayer le son' : 'Retry sound'}>{fr ? 'RÉESSAYER' : 'RETRY'}</UtilityButton>}
  {soundEnabled && <UtilityButton className="radio-settings-toggle" cursor="view" aria-label={fr ? 'Réglages CEO RADIO' : 'CEO RADIO settings'} aria-expanded={open} aria-controls={id} popoverTarget={id} onClick={event => {
   const rect = event.currentTarget.getBoundingClientRect();
   setPosition(popoverPosition(rect));
   if (typeof panel.current?.showPopover !== 'function') { event.preventDefault(); setFallback(true); setAbove(rect.bottom > innerHeight / 2); setOpen(value => !value); }
  }} title={error ? status : undefined}>RADIO{error && <span className="radio-error-mark" aria-hidden="true">!</span>}</UtilityButton>}
  <div ref={panel} id={id} popover="auto" className="radio-settings" data-owned-interaction data-fallback-open={fallback && open && soundEnabled || undefined} data-above={above} style={position} onToggle={event => setOpen(event.newState === 'open')} onKeyDown={event => { event.stopPropagation(); if (fallback && event.key === 'Escape') { event.preventDefault(); setOpen(false); wrapper.current?.querySelector<HTMLButtonElement>('.radio-settings-toggle')?.focus(); } }} onWheel={event => event.stopPropagation()}>
   <div className="radio-settings-heading"><span>CEO RADIO</span><UtilityButton aria-label={fr ? 'Fermer les réglages audio' : 'Close sound settings'} onClick={() => { panel.current?.hidePopover?.(); setOpen(false); }}><UtilityGlyph kind="close"/></UtilityButton></div>
   <p className="radio-status" role="status">{status}</p>
   {isPlaying && <span className="radio-artist">{backgroundMusic.artist}</span>}
   <UtilityButton className="radio-play-control" disabled={blocked} onClick={() => isPlaying || playbackStatus === 'loading' || playbackStatus === 'buffering' ? manager.pauseRadio() : error ? manager.retryRadio() : manager.resumeRadio()}>
    {isPlaying || playbackStatus === 'loading' || playbackStatus === 'buffering' ? fr ? 'PAUSE' : 'PAUSE' : error ? fr ? 'RÉESSAYER' : 'RETRY' : fr ? 'REPRENDRE' : 'RESUME'}
   </UtilityButton>
   <label className="radio-volume">Volume<input type="range" min="0" max="1" step=".01" value={state.volume} aria-valuetext={`${Math.round(state.volume * 100)}%`} aria-label={fr ? 'Volume du son et de CEO RADIO' : 'Sound and CEO RADIO volume'} onChange={event => manager.setVolume(Number(event.target.value))}/></label>
   <UtilityButton className="radio-disable" onClick={() => { manager.chooseMode(false); panel.current?.hidePopover?.(); setOpen(false); }}>{fr ? 'COUPER LE SON' : 'SOUND OFF'}</UtilityButton>
  </div>
  <span className="sr-only" role="status">{error ? status : ''}</span>
 </div>;
}
