import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { backgroundMusic } from '../src/data/audio.ts';
import { AudioManager } from '../src/features/audio/AudioManager.ts';

class Media extends EventTarget {
 src = ''; loop = false; preload = ''; volume = 1; muted = false;
 currentTime = 0; duration = 160; readyState = 0; paused = true; error = null;
 plays = 0; loads = 0; result = null;
 canPlayType() { return 'probably'; }
 getAttribute(name) { return this[name]; }
 play() {
  this.plays++;
  if (this.result) return this.result;
  this.paused = false; this.readyState = 4; this.dispatchEvent(new Event('playing')); return Promise.resolve();
 }
 pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
 load() { this.loads++; this.error = null; }
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };
function setup() { const manager = new AudioManager(), audio = new Media(); manager.attach(audio); return { manager, audio }; }

test('the authoritative MP3 exists, is nonempty, and has an encoded public URL', async () => {
 assert.equal(backgroundMusic.src, '/CEO19/audio/Ceo%201.mp3');
 const stat = await fs.stat(`public${decodeURIComponent(backgroundMusic.src)}`);
 assert.ok(stat.size > 0);
});
test('mount and silent entry never call play; one element uses native looping and metadata preload', () => {
 const {manager, audio} = setup(); manager.chooseMode(false);
 assert.equal(audio.plays, 0); assert.equal(audio.loop, true); assert.equal(audio.preload, 'metadata');
 assert.equal(audio.volume, .35); assert.equal(audio.paused, true); assert.equal(manager.getSnapshot().isPlaying, false);
});
test('PLAY SOUND invokes play synchronously and supports a full-length track', async () => {
 const {manager, audio} = setup(); manager.chooseMode(true);
 assert.equal(audio.plays, 1); assert.equal(audio.muted, false); await flush();
 assert.equal(manager.getSnapshot().isPlaying, true); assert.equal(manager.getDiagnostics().duration, 160);
});
test('OFF retains position and ON resumes the same element without load or rewind', async () => {
 const {manager, audio} = setup(); manager.chooseMode(true); await flush(); audio.currentTime = 45;
 manager.chooseMode(false); assert.equal(audio.paused, true); assert.equal(manager.getSnapshot().currentTime, 45);
 manager.chooseMode(true); await flush(); assert.equal(audio.currentTime, 45); assert.equal(audio.loads, 0); assert.equal(audio.plays, 2);
});
test('nested Cinema/external leases block sound; releasing every lease leaves it paused until a click', async () => {
 const {manager, audio} = setup(); manager.chooseMode(true); await flush();
 const first = manager.holdMedia('cinema'), second = manager.holdMedia('cinema'), external = manager.holdMedia('external');
 assert.equal(audio.paused, true); first(); assert.equal(manager.getSnapshot().isCinemaOpen, true);
 second(); manager.resumeRadio(); assert.equal(audio.plays, 1); external(); await flush();
 assert.equal(audio.plays, 1); manager.resumeRadio(); assert.equal(audio.plays, 2);
});
test('outbound official players pause the MP3 and require explicit resume', async () => {
 const {manager, audio} = setup(); manager.chooseMode(true); await flush(); manager.externalIntent();
 assert.equal(audio.paused, true); assert.equal(manager.getSnapshot().isExternalMediaActive, true);
 manager.resumeRadio(); await flush(); assert.equal(manager.getSnapshot().isExternalMediaActive, false); assert.equal(audio.paused, false);
});
test('play rejection never claims playing and explicit retry recovers', async () => {
 const {manager, audio} = setup(); audio.result = Promise.reject(new DOMException('blocked', 'NotAllowedError'));
 manager.chooseMode(true); assert.equal(manager.getSnapshot().isPlaying, false); await flush();
 assert.equal(manager.getSnapshot().status, 'error'); assert.equal(manager.getDiagnostics().lastError.code, 'NotAllowedError');
 audio.result = null; manager.retryRadio(); await flush(); assert.equal(manager.getSnapshot().isPlaying, true); assert.equal(audio.loads, 1);
});
test('late play promises cannot override OFF, Cinema, or a newer successful request', async () => {
 for (const action of [m => m.chooseMode(false), m => m.holdMedia('cinema')]) {
  const {manager, audio} = setup(); let resolve; audio.result = new Promise(r => { resolve = r; });
  manager.chooseMode(true); action(manager); resolve(); await flush(); assert.equal(manager.getSnapshot().isPlaying, false);
 }
 const {manager, audio} = setup(); let reject; audio.result = new Promise((_, r) => { reject = r; }); manager.chooseMode(true);
 manager.chooseMode(false); audio.result = null; manager.chooseMode(true); await flush(); reject(new Error('stale')); await flush();
 assert.equal(manager.getSnapshot().isPlaying, true); assert.equal(manager.getDiagnostics().lastError, null);
});
test('buffering, real media errors, and interruption publish honest state', async () => {
 const {manager, audio} = setup(); manager.chooseMode(true); await flush(); audio.dispatchEvent(new Event('waiting'));
 assert.equal(manager.getSnapshot().isPlaying, false); assert.equal(manager.getSnapshot().status, 'buffering');
 audio.error = {code: 3}; audio.dispatchEvent(new Event('error')); assert.equal(manager.getSnapshot().status, 'error'); assert.equal(audio.paused, true);
 manager.retryRadio(); await flush(); manager.interrupt(); assert.equal(manager.getSnapshot().status, 'interrupted'); assert.equal(audio.paused, true);
});
test('StrictMode ref detach/reattach is reusable and a new document starts silent', async () => {
 const {manager, audio} = setup(); manager.attach(null); manager.attach(audio); manager.chooseMode(true); await flush();
 assert.equal(audio.plays, 1); manager.attach(null); assert.equal(audio.paused, true);
 manager.attach(audio); assert.equal(manager.getSnapshot().soundEnabled, false); assert.equal(audio.plays, 1);
 assert.equal(new AudioManager().getSnapshot().soundEnabled, false);
});
test('volume is configurable, clamped, and independent of muted visual videos', () => {
 const {manager, audio} = setup(); manager.setVolume(NaN); assert.equal(audio.volume, .35);
 manager.setVolume(2); assert.equal(audio.volume, 1); manager.setVolume(-1); assert.equal(audio.volume, 0);
 manager.setVolume(.25); manager.chooseMode(true); assert.equal(audio.volume, .25); assert.equal(audio.muted, false);
});
