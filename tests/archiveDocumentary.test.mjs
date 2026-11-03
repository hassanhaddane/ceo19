import test from 'node:test';
import assert from 'node:assert/strict';
import { attachArchiveDocumentary } from '../src/lib/archiveDocumentary.ts';
import { archiveClips } from '../src/data/archiveClips.ts';

class Media extends EventTarget {
 constructor() { super(); this.dataset={};this.style={};this.attributes=new Map();this.paused=true;this.currentTime=0;this.duration=4;this.readyState=0;this.ended=false;this.error=null;this.plays=0; }
 set src(value) { this.attributes.set('src',value); }
 get src() { return this.attributes.get('src')??''; }
 set poster(value) { this.attributes.set('poster',value); }
 removeAttribute(name) { this.attributes.delete(name); }
 load() { this.readyState=0;this.currentTime=0;this.ended=false; }
 play() { this.plays++;this.paused=false;if(this.readyState>=2)this.dispatchEvent(new Event('playing'));return Promise.resolve(); }
 pause() { this.paused=true; }
 ready() { this.readyState=3;this.dispatchEvent(new Event('loadeddata'));if(!this.paused)this.dispatchEvent(new Event('playing')); }
 at(time) { this.currentTime=time;this.ended=time>=4;if(this.ended){this.paused=true;this.dispatchEvent(new Event('ended'));}else this.dispatchEvent(new Event('timeupdate')); }
}
function setup(t) {
 t.mock.timers.enable({apis:['setTimeout']});
 const old=globalThis.document,document=new EventTarget();document.hidden=false;globalThis.document=document;
 const layer={dataset:{},style:{setProperty(){}}}, videos=[new Media(),new Media()];
 const controller=attachArchiveDocumentary(videos,layer,archiveClips,{fade:550,preloadLead:1500,loadTimeout:8000});
 t.after(()=>{controller.dispose();globalThis.document=old;});
 return {videos,layer,controller,document};
}
test('the reviewed film playlist uses four distinct real excerpts in a stable order',()=>{
 assert.deepEqual(archiveClips.map(clip=>clip.id),['stage-side','crowd-front','performance','stage-depth']);
 assert.deepEqual(archiveClips.map(clip=>clip.sourceTime),[6,40,58,145]);
 assert.ok(archiveClips.every(clip=>clip.duration===4&&clip.selection==='reviewed'));
});
test('one decoder plays until the short dissolve; the outgoing slot is then released',t=>{
 const {videos:[a,b],layer}=setup(t);a.ready();
 assert.equal(a.dataset.front,'true');assert.equal(b.src,'');
 a.at(2.5);assert.match(b.src,/crowd-front.mp4$/);b.ready();assert.equal(b.plays,0);
 a.at(3.5);assert.equal(b.plays,1);assert.equal(layer.dataset.state,'crossfading');assert.equal(a.dataset.front,'true');assert.equal(b.dataset.front,'true');
 t.mock.timers.tick(550);assert.equal(a.paused,true);assert.equal(a.src,'');assert.equal(layer.dataset.clip,'crowd-front');
 b.at(2.5);assert.match(a.src,/performance.mp4$/);assert.equal(a.plays,1);
});
test('a delayed next clip holds the outgoing last frame until a real playing event',t=>{
 const {videos:[a,b],layer}=setup(t);a.ready();a.at(2.5);a.at(4);t.mock.timers.tick(2000);
 assert.equal(layer.dataset.state,'holding');assert.equal(a.dataset.front,'true');assert.match(a.src,/stage-side.mp4$/);assert.equal(b.dataset.front,'false');
 b.ready();assert.equal(layer.dataset.state,'crossfading');t.mock.timers.tick(550);assert.equal(layer.dataset.clip,'crowd-front');
});
test('viewer and hidden-tab pauses retain frames without playing or replacing sources',t=>{
 const {videos:[a,b],controller,document}=setup(t);a.ready();a.at(1.5);const source=a.src;
 controller.setPaused(true);assert.equal(a.paused,true);assert.equal(b.paused,true);t.mock.timers.tick(9000);assert.equal(a.src,source);
 controller.setPaused(false);assert.equal(a.paused,false);assert.equal(a.currentTime,1.5);
 document.hidden=true;document.dispatchEvent(new Event('visibilitychange'));assert.equal(a.paused,true);
 document.hidden=false;document.dispatchEvent(new Event('visibilitychange'));assert.equal(a.paused,false);
});
test('a failed standby is skipped without hiding the outgoing frame, and cleanup cancels timers',t=>{
 const {videos:[a,b],layer,controller}=setup(t);a.ready();a.at(2.5);b.error={code:4};b.dispatchEvent(new Event('error'));
 assert.match(b.src,/performance.mp4$/);assert.equal(a.dataset.front,'true');
 controller.dispose();t.mock.timers.tick(20000);assert.equal(a.src,'');assert.equal(b.src,'');assert.equal(layer.dataset.state,'hidden');
});
