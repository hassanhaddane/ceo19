'use client';
import { useEffect, useState } from 'react';
import type { AudioManager } from './AudioManager';

/** One development-only observer, outside route lifecycles. No audio allocation. */
export function AudioDiagnostics({ manager }: { manager: AudioManager }) {
 const [sample, setSample] = useState<ReturnType<AudioManager['getDiagnostics']> | null>(null);
 const [state, setState] = useState(manager.getServerSnapshot);
 useEffect(() => {
  if (process.env.NODE_ENV !== 'development') return;
  const update = () => { setSample(manager.getDiagnostics()); setState(manager.getSnapshot()); };
  const unsubscribe = manager.subscribe(update);
  const timer = setInterval(update, 500); // Also observes context/load state without transport events.
  return () => { unsubscribe(); clearInterval(timer); };
 }, [manager]);
 if (process.env.NODE_ENV !== 'development' || !sample) return null;
 return <aside className="audio-diagnostics" aria-label="Development audio diagnostics" data-audio-diagnostics>
  <h2>Audio · development</h2>
  <dl>
   <dt>Audio supported</dt><dd>{sample.supported === null ? 'Unknown' : sample.supported ? 'Yes' : 'No'}</dd>
   <dt>File loaded</dt><dd>{sample.fileLoaded ? 'Yes · decoded' : 'No'}</dd>
   <dt>Media readyState</dt><dd>{sample.readyState}</dd>
   <dt>Current source</dt><dd>{sample.source ?? 'None'}</dd>
   <dt>Playback</dt><dd>{state.status} · {state.isPlaying ? 'playing' : 'not playing'}</dd>
   <dt>Volume</dt><dd>{Math.round(state.volume * 100)}% · {state.muted ? 'muted' : 'unmuted'}</dd>
   <dt>Last error</dt><dd>{sample.lastError ? `${sample.lastError.code}: ${sample.lastError.message}` : 'None'}</dd>
  </dl>
 </aside>;
}
