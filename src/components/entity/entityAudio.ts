import { backgroundMusic } from '../../data/audio.ts';
import type { SoundState } from '../../features/audio/AudioManager.ts';
import envelope from './radioEnvelope.json' with { type: 'json' };

/** Read only the authored bass envelope of the exact, currently playing local MP3. */
export function entityBass(audio: HTMLAudioElement | null, state: SoundState) {
 if (!audio || audio.paused || audio.ended || audio.muted || audio.volume === 0 ||
  state.status !== 'playing' || !state.isPlaying || !Number.isFinite(audio.currentTime) ||
  !audio.currentSrc.endsWith(backgroundMusic.src)) return 0;
 const index = audio.currentTime * envelope.fps;
 const lower = Math.floor(index);
 const from = envelope.samples[lower];
 if (from === undefined) return 0;
 const to = envelope.samples[lower + 1] ?? from;
 return (from + (to - from) * (index - lower)) / 255 * Math.min(1, audio.volume * 2.4);
}
