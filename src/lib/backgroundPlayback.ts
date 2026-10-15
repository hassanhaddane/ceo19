/** One controller per mounted media element. Recovery follows real browser readiness,
 * visibility, network or user-gesture events; it never polls or replaces the decoder. */
export function attachBackgroundPlayback(media: HTMLVideoElement, options: {
 enabled: boolean;
 onPlaying: (playing: boolean) => void;
 onStatus?: (state: string, detail?: unknown) => void;
 onError?: (error: unknown) => void;
}) {
 let disposed = false, attempt = 0, pending = false, networkRecovery = false;
 const eligible = () => !disposed && options.enabled && !document.hidden;
 const status = options.onStatus ?? (() => {});
 const sync = () => {
  if (!eligible()) { attempt++; pending = false; media.pause(); options.onPlaying(false); status(options.enabled ? 'hidden' : 'reduced motion'); return; }
  if (pending || (!media.paused && media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA)) return;
  media.muted = true;
  const ticket = ++attempt; pending = true; status('starting');
  void media.play().then(() => {
   if (disposed || ticket !== attempt) return;
   pending = false;
   if (eligible() && !media.paused) { options.onPlaying(true); status('playing'); }
  }).catch(error => {
   if (disposed || ticket !== attempt) return;
   pending = false;
   // A late rejection must not veil a video that a newer native play has started.
   if (!media.paused && media.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) { options.onPlaying(true); status('playing'); return; }
   options.onPlaying(false);
   const aborted = error instanceof DOMException && error.name === 'AbortError';
   status(aborted ? 'interrupted' : 'blocked', String(error));
   if (!aborted) options.onError?.(error);
  });
 };
 const playing = () => {
  if (!eligible()) { media.pause(); return; }
  attempt++; pending = false; networkRecovery = false;
  options.onPlaying(true); status('playing');
 };
 const pause = () => { if (media.paused) { options.onPlaying(false); status(document.hidden ? 'hidden' : 'paused'); } };
 const waiting = () => status('buffering');
 const error = () => { attempt++; pending = false; options.onPlaying(false); status('error', media.error?.code); options.onError?.(new Error(`Background video media error ${media.error?.code ?? 'unknown'}`)); };
 const recover = () => {
  if (!eligible()) return;
  // Only a failed network source warrants a reload, and at most once before playing.
  if (media.error?.code === MediaError.MEDIA_ERR_NETWORK && !networkRecovery) { networkRecovery = true; attempt++; pending = false; media.load(); }
  sync();
 };
 media.addEventListener('playing', playing); media.addEventListener('pause', pause);
 media.addEventListener('waiting', waiting); media.addEventListener('error', error);
 media.addEventListener('loadeddata', sync); media.addEventListener('canplay', sync);
 document.addEventListener('visibilitychange', sync); document.addEventListener('pointerdown', recover, { passive: true });
 document.addEventListener('keydown', recover); window.addEventListener('online', recover); window.addEventListener('pageshow', recover);
 if (!options.enabled) media.load();
 sync();
 return () => {
  disposed = true; attempt++;
  media.removeEventListener('playing', playing); media.removeEventListener('pause', pause);
  media.removeEventListener('waiting', waiting); media.removeEventListener('error', error);
  media.removeEventListener('loadeddata', sync); media.removeEventListener('canplay', sync);
  document.removeEventListener('visibilitychange', sync); document.removeEventListener('pointerdown', recover); document.removeEventListener('keydown', recover);
  window.removeEventListener('online', recover); window.removeEventListener('pageshow', recover);
  media.pause();
 };
}
