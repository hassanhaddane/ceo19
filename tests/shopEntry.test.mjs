import test from 'node:test';
import assert from 'node:assert/strict';
import { ShopEntryCoordinator } from '../src/lib/shopEntry.ts';
const origin = { x:.7, y:.05 };
const storage = () => { const values = new Map(); return {getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}; };
test('direct entry is claimed once, including repeated hydration/Strict Mode subscriptions',()=>{
 const entry=new ShopEntryCoordinator(()=>null); assert.equal(entry.claim().source,'direct'); assert.equal(entry.claim(),null); assert.equal(entry.claim(),null);
});
test('navbar intent survives the route loading and is consumed exactly once',()=>{
 const entry=new ShopEntryCoordinator(()=>null); entry.request(origin); assert.deepEqual(entry.claim(),{source:'navigation',origin}); assert.equal(entry.claim(),null);
});
test('closing never immediately reopens and direct reload respects this tab dismissal',()=>{
 const session=storage(), entry=new ShopEntryCoordinator(()=>session); entry.claim(); entry.dismiss(); assert.equal(entry.claim(),null);
 const reload=new ShopEntryCoordinator(()=>session); assert.equal(reload.claim(),null);
});
test('explicit navigation overrides dismissal but cannot leave a stale intent after close',()=>{
 const session=storage(), entry=new ShopEntryCoordinator(()=>session); entry.dismiss(); entry.request(origin); assert.equal(entry.claim().source,'navigation'); entry.dismiss(); assert.equal(entry.claim(),null);
 entry.request(origin); assert.equal(entry.claim().source,'navigation');
});
test('same-route SHOP clicks notify the mounted dialog, without a second route load',()=>{
 const entry=new ShopEntryCoordinator(()=>null); entry.claim(); entry.dismiss(); let opened=0;
 const unsubscribe=entry.subscribe(()=>{if(entry.claim())opened++;}); entry.request(origin); assert.equal(opened,1); assert.equal(entry.claim(),null);
 unsubscribe(); entry.request(origin); assert.equal(opened,1); assert.equal(entry.claim().source,'navigation');
});
test('blocked storage still keeps dismissal effective during this document',()=>{
 const entry=new ShopEntryCoordinator(()=>{throw new Error('Blocked');}); assert.equal(entry.claim().source,'direct'); entry.dismiss(); assert.equal(entry.claim(),null); entry.request(origin); assert.equal(entry.claim().source,'navigation');
});
test('latest navigation intent wins before the destination is mounted; coordinates are bounded',()=>{
 const entry=new ShopEntryCoordinator(()=>null); entry.request(origin); entry.request({x:Infinity,y:-4}); assert.deepEqual(entry.claim().origin,{x:.85,y:0}); assert.equal(entry.claim(),null);
});
test('a new tab visit without previous dismissal may receive the optional direct prompt',()=>{
 const session=storage(); const first=new ShopEntryCoordinator(()=>session); first.claim();
 const nextVisit=new ShopEntryCoordinator(()=>storage()); assert.equal(nextVisit.claim().source,'direct');
});
