import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { archiveWorld, galleryDiscovery, archiveDepthGain } from '../src/data/archiveWorld.ts';
import { archiveCycleSpeed, archiveLoopX, createArchiveLayout, shortestArchiveDistance, wrapArchive } from '../src/lib/archiveGeometry.ts';
import { publicAssets } from '../src/data/assets.ts';

test('the curated archive has unique source imagery, valid optimized files and documented screenshot crops',async()=>{
 assert.equal(archiveWorld.length,8);
 assert.equal(new Set(archiveWorld.map(photo=>photo.id)).size,archiveWorld.length);
 assert.equal(new Set(archiveWorld.map(photo=>photo.asset.source)).size,archiveWorld.length);
 assert.equal(galleryDiscovery.selectedImages,archiveWorld.length);
 assert.equal(galleryDiscovery.uniqueImages,49);
 for(let i=1;i<archiveWorld.length;i++)assert.ok(archiveWorld[i].slot>=archiveWorld[i-1].slot);
 for(const photo of archiveWorld){
  const original=await sharp(`public${photo.asset.source}`).metadata(),derived=await sharp(`public${photo.asset.path}`).metadata();
  assert.equal(photo.asset.sourceWidth,original.autoOrient.width);assert.equal(photo.asset.sourceHeight,original.autoOrient.height);
  assert.equal(photo.asset.width,derived.width);assert.equal(photo.asset.height,derived.height);
  const crop=photo.asset.sourceCrop;
  const sourceRatio=crop?crop.width/crop.height:original.autoOrient.width/original.autoOrient.height;
  assert.ok(Math.abs(derived.width/derived.height-sourceRatio)<.002);
  if(crop){assert.ok(crop.left+crop.width<=original.autoOrient.width);assert.ok(crop.top+crop.height<=original.autoOrient.height);}
  assert.ok(Math.max(derived.width,derived.height)<=1600);
  assert.ok((await fs.stat(`public${photo.asset.path}`)).size<450_000);
  assert.ok(publicAssets.some(asset=>asset.path===photo.asset.path&&asset.width===derived.width&&asset.height===derived.height));
 }
});

test('the editorial strip remains varied, deterministic and inside its vertical stage',()=>{
 for(const [width,height] of [[1440,525],[1280,359],[390,520],[320,350]]){
  const compact=width<700,layout=createArchiveLayout(archiveWorld,width,height,compact);
  assert.deepEqual(createArchiveLayout(archiveWorld,width,height,compact),layout);
  const duration=layout.length/archiveCycleSpeed(layout.length);
  assert.ok(duration>=40&&duration<=70);
  assert.ok(new Set(layout.prints.map(p=>Math.round(p.height))).size>=(compact?3:6));
  for(const print of layout.prints){
   assert.ok(Math.abs(print.y)+print.height/2<=height*.53);
   assert.ok(print.width<=width*(compact?.83:.48));
  }
  // Every desktop shared column has vertically separated prints, never an accidental stack.
  if(!compact)for(let i=0;i<archiveWorld.length;i++)for(let j=i+1;j<archiveWorld.length;j++){
   if(archiveWorld[i].slot!==archiveWorld[j].slot)continue;
   assert.ok(Math.abs(layout.prints[i].y-layout.prints[j].y)>(layout.prints[i].height+layout.prints[j].height)/2);
  }
 }
});

test('the loop crosses the seam continuously with each photo wrapping strictly offscreen',()=>{
 for(const [width,height] of [[1440,525],[390,520]]){
  const {prints,length,buffer}=createArchiveLayout(archiveWorld,width,height,width<700);
  for(let camera=-2*length;camera<2*length;camera+=137){
   for(const print of prints){
    const before=archiveLoopX(print.center,camera,length,buffer),after=archiveLoopX(print.center,camera+1,length,buffer);
    assert.ok(Math.abs(archiveLoopX(print.center,camera+length,length,buffer)-before)<1e-8);
    if(Math.abs(after-before)>2){
     assert.ok(before+print.width/2<0||before-print.width/2>width);
     assert.ok(after+print.width/2<0||after-print.width/2>width);
    }else assert.ok(Math.abs(after-before+1)<1e-8);
   }
  }
  assert.equal(wrapArchive(-1,length),length-1);
  assert.equal(shortestArchiveDistance(length-10,10,length),20);
  assert.equal(shortestArchiveDistance(10,length-10,length),-20);
 }
 assert.equal(wrapArchive(500,0),0);
});

test('foreground photography receives stronger parallax than the background prints',()=>{
 assert.ok(new Set(archiveWorld.map(photo=>photo.depth)).size>=6);
 const ordered=[...archiveWorld].sort((a,b)=>a.depth-b.depth);
 for(let i=1;i<ordered.length;i++)assert.ok(archiveDepthGain(ordered[i].depth)>=archiveDepthGain(ordered[i-1].depth));
 assert.equal(archiveDepthGain(-1000),0);assert.equal(archiveDepthGain(1000),1);
});
