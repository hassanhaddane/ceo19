import test from 'node:test';
import assert from 'node:assert/strict';
import {releaseDirection,releaseKeyframes} from '../src/lib/releaseMotion.ts';
import { createReleaseBlend } from '../src/components/music/releaseBlend.ts';

test('release direction is reversible across the circular first/last boundary',()=>{
 assert.equal(releaseDirection(5,0,6),1);
 assert.equal(releaseDirection(0,5,6),-1);
 assert.equal(releaseDirection(1,3,6),1);
 assert.equal(releaseDirection(3,1,6),-1);
});
test('six finite sleeve treatments have distinct plans and settle to an undistorted image',()=>{
 const treatments=['signal','impact','haze','crew','split','paper'];
 assert.equal(new Set(treatments.map(treatment=>JSON.stringify(releaseKeyframes(treatment)))).size,6);
 for(const treatment of treatments){
  for(const direction of [-1,1]){
   const frames=releaseKeyframes(treatment,direction);
   assert.ok(frames.length>=2&&frames.length<=4);
   assert.equal(frames.at(-1).transform,'none');
   if(frames.at(-1).opacity!==undefined)assert.equal(frames.at(-1).opacity,1);
  }
 }
 assert.notDeepEqual(releaseKeyframes('paper',1)[0],releaseKeyframes('paper',-1)[0]);
});

test('the renderer observes the artwork transport in place until it detaches', () => {
 const transport = createReleaseBlend(5), frame = transport.frame;
 const samples = [];
 const unsubscribe = transport.subscribe(() => samples.push({ ...frame }));
 transport.write(5, 1, .45, 1);
 transport.write(5, 1, .45, 1);
 transport.write(1, 1, 0, 1);
 unsubscribe();
 transport.write(1, 0, .8, -1);
 assert.deepEqual(samples, [
  { from: 5, to: 1, progress: .45, direction: 1 },
  { from: 1, to: 1, progress: 0, direction: 1 },
 ]);
});
