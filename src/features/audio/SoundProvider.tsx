'use client';
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { AudioManager } from './AudioManager';
import { AudioDiagnostics } from './AudioDiagnostics';

const SoundContext = createContext<AudioManager | null>(null);
export function SoundProvider({ children }: { children: ReactNode }) {
 const [manager] = useState(() => new AudioManager());
 const bindAudio = useCallback((element: HTMLAudioElement | null) => { manager.attach(element); }, [manager]);
 useEffect(() => {
  const outbound = (event: MouseEvent) => {
   if (event.defaultPrevented || event.button !== 0 || !(event.target instanceof Element)) return;
   const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
   if (!anchor || anchor.hasAttribute('download')) return;
   const url = new URL(anchor.href, location.href);
   if (['open.spotify.com', 'youtube.com', 'www.youtube.com', 'youtu.be', 'music.apple.com', 'deezer.com', 'www.deezer.com'].includes(url.hostname)) manager.externalIntent();
  };
  document.addEventListener('click', outbound); window.addEventListener('pagehide', manager.interrupt);
  return () => { document.removeEventListener('click', outbound); window.removeEventListener('pagehide', manager.interrupt); };
 }, [manager]);
 return <SoundContext.Provider value={manager}>
  <audio ref={bindAudio} data-background-music loop preload="metadata" />
  {children}{process.env.NODE_ENV === 'development' && <AudioDiagnostics manager={manager}/>}
 </SoundContext.Provider>;
}
export function useSoundManager() {
 const manager = useContext(SoundContext);
 if (!manager) throw new Error('SoundProvider is required');
 return manager;
}
export function useSound() {
 const manager = useSoundManager();
 const state = useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getServerSnapshot);
 return { ...state, manager };
}
