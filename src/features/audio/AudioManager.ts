import { backgroundMusic } from '../../data/audio.ts';
import { audioFailure, type AudioFailure } from './audioFailure.ts';

export interface SoundState {
 soundEnabled: boolean; muted: boolean; volume: number;
 isPlaying: boolean; currentTime: number; userPaused: boolean;
 isCinemaOpen: boolean; isExternalMediaActive: boolean; mediaLeaseActive: boolean;
 availability: 'locked' | 'ready' | 'unavailable';
 status: 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'interrupted' | 'error';
}
export const initialSoundState: SoundState = {
 soundEnabled: false, muted: true, volume: backgroundMusic.volume,
 isPlaying: false, currentTime: 0, userPaused: false,
 isCinemaOpen: false, isExternalMediaActive: false, mediaLeaseActive: false,
 availability: 'locked', status: 'idle',
};

/** One native element owned by the persistent layout provider; no playlist or AudioContext. */
export class AudioManager {
 private state = initialSoundState;
 private listeners = new Set<() => void>();
 private audio: HTMLAudioElement | null = null;
 private blockers = new Map<symbol, 'cinema' | 'external'>();
 private outbound = false;
 private intent = 0;
 private wantsPlayback = false;
 private lastError: AudioFailure | null = null;
 getSnapshot = () => this.state;
 getServerSnapshot = () => initialSoundState;
 subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
 private patch(patch: Partial<SoundState>) {
  if (Object.entries(patch).every(([key, value]) => this.state[key as keyof SoundState] === value)) return;
  this.state = { ...this.state, ...patch }; this.listeners.forEach(listener => listener());
 }
 private allowed() { return this.state.soundEnabled && !this.state.muted && !this.state.mediaLeaseActive && !this.outbound; }
 getDiagnostics = () => ({
  supported: this.audio ? !!this.audio.canPlayType('audio/mpeg') : null,
  source: this.audio?.currentSrc || this.audio?.getAttribute('src') || null,
  fileLoaded: (this.audio?.readyState ?? 0) >= 2,
  readyState: this.audio?.readyState ?? 0,
  duration: this.audio && Number.isFinite(this.audio.duration) ? this.audio.duration : null,
  lastError: this.lastError,
 });
 private events = ['playing', 'pause', 'waiting', 'timeupdate', 'loadedmetadata', 'error', 'volumechange'] as const;
 /** React ref cleanup is reusable under StrictMode; navigation never detaches this ref. */
 attach = (audio: HTMLAudioElement | null) => {
  if (audio === this.audio) return;
  if (this.audio) {
   this.events.forEach(event => this.audio!.removeEventListener(event, this.onMedia));
   this.audio.pause();
  }
  this.intent++; this.wantsPlayback = false; this.audio = audio;
  this.blockers.clear(); this.outbound = false; this.lastError = null;
  this.patch(initialSoundState);
  if (!audio) return;
  audio.src = backgroundMusic.src; audio.loop = true; audio.preload = 'metadata';
  audio.volume = this.state.volume; audio.muted = true;
  this.events.forEach(event => audio.addEventListener(event, this.onMedia));
 };
 private onMedia = (event: Event) => {
  const audio = this.audio;
  if (!audio) return;
  if (event.type === 'error') {
   this.fail({ code: `MEDIA_${audio.error?.code ?? 'ERROR'}`, message: 'The background MP3 could not load or decode. Retry sound.' });
  } else if (event.type === 'playing') {
   if (!this.wantsPlayback || !this.allowed()) { audio.pause(); return; }
   this.lastError = null;
   this.patch({ isPlaying: true, status: 'playing', availability: 'ready', currentTime: audio.currentTime });
  } else if (event.type === 'pause') {
   if (!audio.paused) return; // A queued pause event may arrive after a new click resumes playback.
   this.patch({ isPlaying: false, currentTime: audio.currentTime, status: this.state.status === 'error' ? 'error' : 'paused' });
  } else if (event.type === 'waiting' && this.wantsPlayback) {
   this.patch({ isPlaying: false, status: 'buffering' });
  } else if (event.type === 'volumechange') {
   this.patch({ muted: audio.muted, volume: audio.volume });
  } else {
   this.patch({ currentTime: audio.currentTime });
  }
 };
 private fail(error: AudioFailure) {
  this.wantsPlayback = false; this.lastError = error;
  this.audio?.pause();
  this.patch({ isPlaying: false, status: 'error', availability: 'unavailable' });
 }
 /** play() is called before any promise, animation, fetch or timer in the click stack. */
 private play = (retry = false) => {
  this.outbound = false; this.syncBlockers();
  this.patch({ soundEnabled: true, muted: false, userPaused: false });
  if (!this.allowed()) return;
  const audio = this.audio, ticket = ++this.intent;
  if (!audio) { this.fail({ code: 'NO_ELEMENT', message: 'Sound is not ready. Retry sound.' }); return; }
  this.wantsPlayback = true; this.lastError = null;
  audio.muted = false; audio.volume = this.state.volume;
  this.patch({ status: 'loading', isPlaying: false });
  try {
   if (retry || audio.error) audio.load();
   const playing = audio.play();
   void playing.then(() => {
    if (ticket !== this.intent || audio !== this.audio || !this.allowed() || !this.wantsPlayback) return;
    if (!audio.paused) this.patch({ isPlaying: true, status: 'playing', availability: 'ready' });
   }).catch(error => {
    if (ticket === this.intent && audio === this.audio) this.fail(audioFailure(error, 'Playback could not start. Retry sound with a click.'));
   });
  } catch (error) { this.fail(audioFailure(error, 'Playback could not start. Retry sound with a click.')); }
 };
 chooseMode = (enabled: boolean) => {
  if (enabled) this.play();
  else {
   this.pauseRadio();
   if (this.audio) this.audio.muted = true;
   this.patch({ soundEnabled: false, muted: true });
  }
 };
 setVolume = (volume: number) => {
  if (!Number.isFinite(volume)) return;
  const bounded = Math.max(0, Math.min(1, volume));
  if (this.audio) this.audio.volume = bounded;
  this.patch({ volume: bounded });
 };
 pauseRadio = () => {
  this.intent++; this.wantsPlayback = false; this.audio?.pause();
  this.patch({ isPlaying: false, userPaused: true, currentTime: this.audio?.currentTime ?? this.state.currentTime, status: 'paused' });
 };
 resumeRadio = () => this.play();
 retryRadio = () => this.play(true);
 private syncBlockers() {
  const kinds = [...this.blockers.values()];
  this.patch({ isCinemaOpen: kinds.includes('cinema'), isExternalMediaActive: this.outbound || kinds.includes('external'), mediaLeaseActive: kinds.length > 0 });
 }
 holdMedia = (kind: 'cinema' | 'external') => {
  const token = Symbol(kind); this.blockers.set(token, kind); this.syncBlockers(); this.pauseRadio();
  return () => { this.blockers.delete(token); this.syncBlockers(); }; // Closing media never resumes music.
 };
 externalIntent = () => { this.outbound = true; this.syncBlockers(); this.pauseRadio(); };
 interrupt = () => { this.pauseRadio(); this.patch({ status: 'interrupted' }); };
}
