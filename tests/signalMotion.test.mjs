import test from 'node:test';
import assert from 'node:assert/strict';
let instance = 0;
const key = 'ceo19:motion:v3';
function storage(values = {}) {
 const data = new Map(Object.entries(values));
 return { getItem: name => data.get(name) ?? null, setItem: (name, value) => data.set(name, value), removeItem: name => data.delete(name) };
}
function setup(t, { reduced = true, saved = {}, session = {}, blocked = false } = {}) {
 const persistent = blocked ? { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); }, removeItem() { throw Error('Blocked'); } } : storage(saved);
 const temporary = storage(session), query = Object.assign(new EventTarget(), { matches: reduced });
 const window = Object.assign(new EventTarget(), { matchMedia: () => query });
 const document = { documentElement: { dataset: {} } };
 const previous = new Map(['window', 'document', 'localStorage', 'sessionStorage'].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
 for (const [name, value] of Object.entries({ window, document, localStorage: persistent, sessionStorage: temporary })) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
 t.motionCleanup = [];
 t.after(() => { for (const stop of t.motionCleanup.reverse()) stop(); for (const [name, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } });
 const update = (value, area = persistent) => window.dispatchEvent(Object.assign(new Event('storage'), { key, newValue: value, storageArea: area }));
 return { persistent, temporary, query, window, document, update };
}
async function load(t) {
 const api = await import(`../src/lib/signalMotion.ts?test=${++instance}`);
 const stop = api.subscribeSignalMotion(() => {}); t.motionCleanup.push(stop);
 return api;
}

test('a fresh visitor respects the device preference and does not silently enable motion', async t => {
 const h = setup(t), api = await load(t);
 assert.equal(api.isSignalMotionEnabled(), false); assert.equal(api.getSignalMotionPreference(), 'system');
 assert.equal(h.document.documentElement.dataset.motionPreference, undefined);
 h.query.matches = false; h.query.dispatchEvent(new Event('change')); assert.equal(api.isSignalMotionEnabled(), true);
});

test('an explicit full-motion choice survives a new store/tab despite reduced system motion', async t => {
 const h = setup(t), first = await load(t); first.setSignalMotion(true);
 assert.equal(h.persistent.getItem(key), 'full'); assert.equal(h.document.documentElement.dataset.motionPreference, 'full');
 const reopened = await load(t); assert.equal(reopened.isSignalMotionEnabled(), true); assert.equal(reopened.getSignalMotionPreference(), 'full');
});

test('legacy session-only preferences migrate without losing the visitor choice', async t => {
 const h = setup(t, { session: { [key]: 'full' } }), api = await load(t);
 assert.equal(api.isSignalMotionEnabled(), true); assert.equal(h.persistent.getItem(key), 'full'); assert.equal(h.temporary.getItem(key), null);
});

test('an explicit reduced choice persists, and resetting restores system control', async t => {
 const h = setup(t, { reduced: false, saved: { [key]: 'reduced' } }), api = await load(t);
 assert.equal(api.isSignalMotionEnabled(), false); api.resetSignalMotion();
 assert.equal(api.getSignalMotionPreference(), 'system'); assert.equal(api.isSignalMotionEnabled(), true);
 assert.equal(h.persistent.getItem(key), null); assert.equal(h.temporary.getItem(key), null); assert.equal(h.document.documentElement.dataset.motionPreference, undefined);
});

test('persistent storage changes synchronize tabs; session events cannot overwrite them', async t => {
 const h = setup(t), api = await load(t);
 h.update('full'); assert.equal(api.isSignalMotionEnabled(), true); assert.equal(h.document.documentElement.dataset.motionPreference, 'full');
 h.update('reduced', h.temporary); assert.equal(api.isSignalMotionEnabled(), true);
 h.update('reduced'); assert.equal(api.isSignalMotionEnabled(), false);
 h.update(null); assert.equal(api.getSignalMotionPreference(), 'system');
});

test('Strict Mode resubscription reapplies CSS state and does not duplicate live listeners', async t => {
 const h = setup(t, { saved: { [key]: 'full' } });
 const api = await import(`../src/lib/signalMotion.ts?test=${++instance}`);
 let calls = 0; const stop = api.subscribeSignalMotion(() => calls++); stop();
 delete h.document.documentElement.dataset.motionPreference;
 const stopAgain = api.subscribeSignalMotion(() => calls++); assert.equal(h.document.documentElement.dataset.motionPreference, 'full');
 h.query.dispatchEvent(new Event('change')); assert.equal(calls, 1);
 stopAgain(); h.query.dispatchEvent(new Event('change')); h.update('reduced'); assert.equal(calls, 1);
});

test('blocked persistent storage retains the session fallback without breaking initialization', async t => {
 const h = setup(t, { blocked: true }), api = await load(t); api.setSignalMotion(true);
 assert.equal(api.isSignalMotionEnabled(), true); assert.equal(h.temporary.getItem(key), 'full');
 const reopened = await load(t); assert.equal(reopened.isSignalMotionEnabled(), true);
});
