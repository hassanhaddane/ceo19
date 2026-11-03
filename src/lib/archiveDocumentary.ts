import { assetUrl } from '../data/assets.ts';
import type { WorldClip } from '../data/worldClips.ts';

/** Native media events own scheduling. One running decoder, plus a short overlap.
 * A late next clip leaves the outgoing last frame on screen instead of a black gap. */
export function attachArchiveDocumentary(
 videos: readonly [HTMLVideoElement, HTMLVideoElement],
 layer: HTMLElement,
 clips: readonly WorldClip[],
 options: { fade: number; preloadLead: number; loadTimeout: number; paused?: boolean },
) {
 let disposed = false, suspended = !!options.paused || document.hidden, active = 0;
 let requesting = false, transition: { from: number; to: number } | null = null;
 const records = [{ clip: -1, ticket: 0 }, { clip: -1, ticket: 0 }];
 const failed = new Set<number>();
 const loads = new Map<number, ReturnType<typeof setTimeout>>();
 let fadeTimer: ReturnType<typeof setTimeout> | undefined;
 const state = (value: string) => { layer.dataset.state = suspended ? 'paused' : value; };
 const clearLoad = (index: number) => { clearTimeout(loads.get(index)); loads.delete(index); };
 const release = (index: number) => {
  clearLoad(index); records[index].ticket++; records[index].clip = -1;
  const video = videos[index]; video.pause(); video.removeAttribute('src'); video.removeAttribute('poster'); video.load(); video.dataset.front = 'false';
 };
 const nextClip = (after: number) => {
  for (let step = 1; step <= clips.length; step++) {
   const candidate = (after + step) % clips.length;
   if (!failed.has(candidate)) return candidate;
  }
  return -1;
 };
 const poster = (clip: number) => { if (clips[clip]) layer.style.backgroundImage = `url("${assetUrl(clips[clip].poster)}")`; };
 const remaining = () => {
  const video = videos[active], clip = clips[records[active].clip];
  return video.ended || failed.has(records[active].clip) ? 0 : Math.max(0, (Number.isFinite(video.duration) ? video.duration : clip?.duration ?? 4) - video.currentTime);
 };
 const play = (index: number) => {
  const media = videos[index], ticket = records[index].ticket;
  if (disposed || suspended || records[index].clip < 0) return;
  media.muted = true;
  void media.play().then(() => {
   if (disposed || records[index].ticket !== ticket) return;
   if (suspended) media.pause();
  }).catch(error => {
   if (disposed || records[index].ticket !== ticket) return;
   requesting = false;
   // Autoplay denial holds the poster/frame and retries only on a real gesture.
   if (error instanceof DOMException && ['NotAllowedError', 'AbortError'].includes(error.name)) { state('holding'); return; }
   fail(index);
  });
 };
 const load = (index: number, clip: number) => {
  release(index); if (clip < 0) return;
  const video = videos[index]; records[index].clip = clip;
  video.muted = true; video.defaultMuted = true; video.preload = 'auto';
  video.poster = assetUrl(clips[clip].poster); video.src = assetUrl(clips[clip].src); video.load();
  loads.set(index, setTimeout(() => { if (!disposed) fail(index); }, options.loadTimeout));
 };
 const prepare = () => {
  const standby = 1 - active;
  if (transition || records[standby].clip >= 0 || clips.length < 2) return;
  const next = nextClip(records[active].clip);
  if (next !== records[active].clip) { load(standby, next); layer.dataset.nextClip = clips[next]?.id ?? ''; }
 };
 const complete = () => {
  if (!transition || disposed) return;
  const { from, to } = transition;
  active = to; transition = null; requesting = false;
  poster(records[active].clip); release(from);
  videos[active].style.zIndex = '1';
  layer.dataset.clip = clips[records[active].clip]?.id ?? '';
  delete layer.dataset.nextClip; state('visible');
  if (suspended) videos[active].pause();
 };
 const switchIfReady = () => {
  const standby = 1 - active;
  if (disposed || suspended || transition || requesting || remaining() > options.fade / 1000 || records[standby].clip < 0 || videos[standby].readyState < 2) return;
  requesting = true; play(standby);
 };
 const tick = () => {
  if (disposed || suspended || transition) return;
  if (remaining() <= options.preloadLead / 1000) prepare();
  switchIfReady();
 };
 const fail = (index: number) => {
  if (disposed || records[index].clip < 0) return;
  const broken = records[index].clip; failed.add(broken); clearLoad(index);
  if (suspended) return;
  if (transition?.to === index) {
   clearTimeout(fadeTimer); transition = null; requesting = false;
   videos[active].dataset.front = 'true'; videos[active].style.zIndex = '1';
  }
  if (index === active) {
   poster(broken); videos[index].pause(); videos[index].dataset.front = 'false'; state('holding');
   prepare(); switchIfReady();
  } else {
   release(index); requesting = false;
   const next = nextClip(broken);
   if (next >= 0 && next !== records[active].clip) load(index, next);
  }
 };
 const removers = videos.map((video, index) => {
  const ready = () => { if (video.readyState >= 2) { clearLoad(index); if (index !== active) switchIfReady(); } };
  const playing = () => {
   if (records[index].clip < 0 || video.readyState < 2) return;
   if (disposed || suspended) { video.pause(); requesting = false; return; }
   clearLoad(index);
   if (index === active) {
    video.dataset.front = 'true'; video.style.zIndex = '1'; poster(records[index].clip);
    layer.dataset.clip = clips[records[index].clip]?.id ?? ''; state('visible'); tick();
   } else if (!transition) {
    requesting = false; transition = { from: active, to: index };
    video.style.zIndex = '2'; video.dataset.front = 'true'; state('crossfading');
    fadeTimer = setTimeout(complete, options.fade);
   }
  };
  const update = () => { if (index === active) tick(); };
  const ended = () => { if (index === active && !transition) { state('holding'); prepare(); switchIfReady(); } };
  const error = () => { if (video.error) fail(index); };
  video.addEventListener('loadeddata', ready); video.addEventListener('canplay', ready);
  video.addEventListener('playing', playing); video.addEventListener('timeupdate', update);
  video.addEventListener('ended', ended); video.addEventListener('error', error);
  return () => { video.removeEventListener('loadeddata', ready); video.removeEventListener('canplay', ready); video.removeEventListener('playing', playing); video.removeEventListener('timeupdate', update); video.removeEventListener('ended', ended); video.removeEventListener('error', error); };
 });
 const syncPause = () => {
  if (suspended) { videos.forEach((video, index) => { video.pause(); clearLoad(index); }); state('paused'); }
  else {
   const standby = 1 - active;
   if (failed.has(records[standby].clip)) release(standby);
   videos.forEach((video, index) => { if (records[index].clip >= 0 && video.readyState < 2 && !failed.has(records[index].clip)) loads.set(index, setTimeout(() => fail(index), options.loadTimeout)); });
   state('visible');
   if (videos[active].ended || failed.has(records[active].clip)) { prepare(); switchIfReady(); }
   else { play(active); tick(); }
  }
 };
 let requestedPause = !!options.paused;
 const visibility = () => { suspended = requestedPause || document.hidden; syncPause(); };
 const gesture = () => { if (!suspended && videos[active].paused && !videos[active].ended) play(active); else switchIfReady(); };
 document.addEventListener('visibilitychange', visibility);
 document.addEventListener('pointerdown', gesture, { passive: true }); document.addEventListener('keydown', gesture);
 layer.style.setProperty('--archive-film-fade', `${options.fade}ms`);
 poster(0); state('poster'); load(0, 0); if (!suspended) play(0);
 return {
  setPaused(paused: boolean) { requestedPause = paused; suspended = paused || document.hidden; syncPause(); },
  dispose() {
   disposed = true; clearTimeout(fadeTimer); removers.forEach(remove => remove());
   document.removeEventListener('visibilitychange', visibility); document.removeEventListener('pointerdown', gesture); document.removeEventListener('keydown', gesture);
   layer.dataset.state = 'hidden'; videos.forEach((_, index) => release(index));
  },
 };
}
