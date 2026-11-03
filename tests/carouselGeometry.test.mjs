import test from 'node:test';
import assert from 'node:assert/strict';
import { carouselSlot, carouselTravel, carouselPose } from '../src/lib/carouselGeometry.ts';

const count=6;
test('every catalogue position has a centered sleeve and the correct circular neighbors',()=>{
 for(let center=0;center<count;center++){
  assert.equal(carouselSlot(center,center,count),0);
  assert.equal(carouselSlot((center+1)%count,center,count),1);
  assert.equal(carouselSlot((center+count-1)%count,center,count),-1);
 }
 assert.equal(carouselTravel(5,0,count),1);
 assert.equal(carouselTravel(0,5,count),-1);
 assert.equal(carouselTravel(1,3,count),2);
 assert.equal(carouselTravel(3,1,count),-2);
});
test('next moves the same right-hand sleeve to center, center to left, and old left offstage',()=>{
 for(const center of [0,5,59]){
  const next=(center+1)%count, old=center%count, previous=(center+count-1)%count;
  assert.equal(carouselSlot(next,center,count),1);
  assert.equal(carouselSlot(next,center+.5,count),.5);
  assert.equal(carouselSlot(next,center+1,count),0);
  assert.equal(carouselSlot(old,center+1,count),-1);
  assert.equal(carouselPose(carouselSlot(previous,center+1,count),500,525).opacity,0);
 }
});
test('all circular coordinate discontinuities are invisible, including reverse wrap',()=>{
 for(const direction of [-1,1])for(let center=0;center<count;center++)for(let index=0;index<count;index++){
  let old=carouselSlot(index,center,count);
  for(let frame=1;frame<=120;frame++){
   const slot=carouselSlot(index,center+direction*frame/120,count);
   if(Math.abs(slot-old)>1){
    assert.equal(carouselPose(old,500,525).opacity,0);
    assert.equal(carouselPose(slot,500,525).opacity,0);
   }
   old=slot;
  }
 }
});
test('side artwork stays recognizable at 64% scale while the center remains full size',()=>{
 const center=carouselPose(0,500,525), left=carouselPose(-1,500,525), right=carouselPose(1,500,525);
 assert.equal(center.x,0);assert.equal(center.scale,1);assert.equal(center.opacity,1);assert.equal(center.rotation,0);
 assert.ok(left.scale>=.55&&left.scale<=.7);assert.equal(left.scale,right.scale);
 assert.equal(left.x,-right.x);assert.equal(left.rotation,-right.rotation);
 assert.ok(left.opacity>=.55);assert.ok(center.zIndex>left.zIndex);
});
