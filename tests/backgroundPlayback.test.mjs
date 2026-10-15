import test from 'node:test';
import assert from 'node:assert/strict';
import { attachBackgroundPlayback } from '../src/lib/backgroundPlayback.ts';

function harness(t) {
 const document = Object.assign(new EventTarget(), { hidden: false });
 const window = new EventTarget();
 const previous = Object.fromEntries(['document', 'window', 'HTMLMediaElement', 'MediaError'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
 Object.assign(globalThis, { document, window, HTMLMediaElement: { HAVE_CURRENT_DATA: 2 }, MediaError: { MEDIA_ERR_NETWORK: 2 } });
 t.after(() => { for (const [key, descriptor] of Object.entries(previous)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } });
 const media = Object.assign(new EventTarget(), { paused: true, muted: false, readyState: 0, error: null, loads: 0, plays: [],
  play() { return new Promise((resolve, reject) => this.plays.push({ resolve, reject })); },
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')); }, load() { this.loads++; },
 });
 const states = [], errors = [], playing = [];
 const attach = (enabled = true) => attachBackgroundPlayback(media, { enabled, onPlaying: value => playing.push(value), onStatus: state => states.push(state), onError: error => errors.push(error) });
 return { media, document, window, states, errors, playing, attach };
}
const flush = async () => { await Promise.resolve(); await Promise.resolve(); };

test('Strict Mode cleanup invalidates old play promises without changing the new controller', async t => {
 const h = harness(t), disposeFirst = h.attach(); disposeFirst(); const disposeSecond = h.attach();
 h.media.paused = false; h.media.readyState = 4; h.media.dispatchEvent(new Event('playing'));
 h.media.plays[0].reject(new DOMException('Unmounted play', 'AbortError')); await flush();
 assert.equal(h.playing.at(-1), true); assert.equal(h.errors.length, 0);
 disposeSecond();
});

test('an interrupted start retries on canplay, with no concurrent play attempts', async t => {
 const h = harness(t), dispose = h.attach();
 h.media.dispatchEvent(new Event('loadeddata')); assert.equal(h.media.plays.length, 1);
 h.media.plays[0].reject(new DOMException('Source interrupted', 'AbortError')); await flush();
 assert.equal(h.states.at(-1), 'interrupted'); assert.equal(h.errors.length, 0);
 h.media.readyState = 3; h.media.dispatchEvent(new Event('canplay')); assert.equal(h.media.plays.length, 2);
 h.media.paused = false; h.media.dispatchEvent(new Event('playing')); h.media.plays[1].resolve(); await flush();
 assert.equal(h.playing.at(-1), true); dispose();
});

test('a stale rejection or queued pause event cannot veil a newer playing frame', async t => {
 const h = harness(t), dispose = h.attach();
 h.media.paused = false; h.media.readyState = 4; h.media.dispatchEvent(new Event('playing'));
 h.media.plays[0].reject(new DOMException('Old attempt aborted', 'AbortError'));
 h.media.dispatchEvent(new Event('pause')); await flush();
 assert.equal(h.playing.at(-1), true); assert.equal(h.states.at(-1), 'playing'); dispose();
});

test('hidden tabs pause and recover on visibility, and disposal removes recovery listeners', async t => {
 const h = harness(t), dispose = h.attach();
 h.document.hidden = true; h.document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(h.media.paused, true); assert.equal(h.states.at(-1), 'hidden');
 h.document.hidden = false; h.document.dispatchEvent(new Event('visibilitychange')); assert.equal(h.media.plays.length, 2);
 dispose(); const count = h.media.plays.length;
 for (const type of ['canplay','loadeddata']) h.media.dispatchEvent(new Event(type));
 for (const type of ['online','pageshow']) h.window.dispatchEvent(new Event(type));
 h.document.dispatchEvent(new Event('pointerdown')); assert.equal(h.media.plays.length, count);
});

test('autoplay denial keeps the poster and allows a user gesture retry without timer loops', async t => {
 const h = harness(t), dispose = h.attach();
 h.media.plays[0].reject(new DOMException('Autoplay denied', 'NotAllowedError')); await flush();
 assert.equal(h.playing.at(-1), false); assert.equal(h.errors.length, 1); assert.equal(h.media.plays.length, 1);
 h.document.dispatchEvent(new Event('pointerdown')); assert.equal(h.media.plays.length, 2); dispose();
});

test('reduced motion releases the source without trying to play on readiness or gestures', t => {
 const h = harness(t), dispose = h.attach(false);
 h.media.dispatchEvent(new Event('canplay')); h.document.dispatchEvent(new Event('pointerdown'));
 assert.equal(h.media.plays.length, 0); assert.equal(h.media.loads, 1); dispose();
});

test('network recovery reloads the same failed element once until successful playback', t => {
 const h = harness(t), dispose = h.attach(); h.media.error = { code: 2 }; h.media.dispatchEvent(new Event('error'));
 h.window.dispatchEvent(new Event('online')); h.window.dispatchEvent(new Event('pageshow'));
 assert.equal(h.media.loads, 1); assert.equal(h.errors.length, 1); dispose();
});
