import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveCinemaWorld,cinemaDirections,cinemaTiming} from '../src/data/cinema.ts';
import {releases} from '../src/data/releases.ts';
import {videos} from '../src/data/videos.ts';
test('cinema inherits the six real release worlds and only supplied visual phrases',()=>{
 const modes=new Set(),backgrounds=new Set();
 for(const release of releases){
  const world=resolveCinemaWorld(release);
  modes.add(world.entry);backgrounds.add(world.cinemaBackground);
  assert.ok(world.entryDuration>=700&&world.entryDuration<=1400);
  assert.ok(world.exitDuration>0&&world.exitDuration<800);
  if(release.id==='kritika')assert.equal(world.punchline,'KRITIKA KRITIKA KRITIKA');
  else assert.equal(world.punchline,release.punchlines?.[0]??null);
  assert.ok(videos.some(video=>video.releaseId===release.id));
 }
 assert.equal(modes.size,6);assert.equal(backgrounds.size,6);
 assert.ok(cinemaTiming.reducedEntry<250&&cinemaTiming.reducedExit<250);
 assert.deepEqual(Object.keys(cinemaDirections).sort(),releases.map(release=>release.id).sort());
});
test('a verified video poster can override cinema direction without changing release or media sources',()=>{
 const release=releases.find(release=>release.id==='fantastique');
 const before=JSON.stringify(release);
 const world=resolveCinemaWorld(release,{cinemaAccent:'var(--color-cream)',entryDuration:1000,punchline:null});
 assert.equal(world.cinemaAccent,'var(--color-cream)');assert.equal(world.entryDuration,1000);assert.equal(world.punchline,null);
 assert.equal(world.entry,'haze');assert.equal(JSON.stringify(release),before);
 const unknown=resolveCinemaWorld(undefined);
 assert.equal(unknown.punchline,null);assert.equal(unknown.entry,'poster');
});
