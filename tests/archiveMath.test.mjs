import test from 'node:test';
import assert from 'node:assert/strict';
import { archivePlacement,gallerySource,visualMetadata,nextIndex } from '../src/components/media/archiveMath.ts';
import { videos } from '../src/data/videos.ts';
import { releases } from '../src/data/releases.ts';
const image={type:'image',id:'test',src:'/images/test.webp',alt:{en:'Image',fr:'Image'},category:'street',caption:null};
test('archive placements cannot overflow the twelve-column composition',()=>{
 const value=archivePlacement({...image,placement:{column:12,span:8,offset:-20}},0);
 assert.deepEqual(value,{column:5,span:8,offset:0});
 for(let i=0;i<20;i++){const p=archivePlacement(image,i);assert.ok(p.column>=1&&p.column+p.span<=13);}
});
test('Instagram uses only an explicitly supplied fallback photograph',()=>{
 assert.equal(gallerySource(image),image.src);
 assert.equal(gallerySource({...image,type:'instagram',postUrl:'https://www.instagram.com/p/example/',fallbackImage:null}),null);
 assert.equal(gallerySource({...image,type:'instagram',postUrl:'https://www.instagram.com/p/example/',fallbackImage:'/images/fallback.webp'}),'/images/fallback.webp');
});
test('unknown visual metadata stays absent while confirmed fields render',()=>{
 assert.deepEqual(visualMetadata(null),[]);assert.deepEqual(visualMetadata({location:null,year:null,format:null}),[]);
 assert.deepEqual(visualMetadata({reference:'A',year:2026,format:'Digital'}),['A','2026','Digital']);
});
test('viewer navigation wraps in either direction and handles a singleton',()=>{
 assert.equal(nextIndex(0,-1,6),5);assert.equal(nextIndex(5,1,6),0);assert.equal(nextIndex(0,1,1),0);assert.equal(nextIndex(0,1,0),0);
});
test('every supplied film agrees with its music release source',()=>{
 for(const video of videos){const release=releases.find(r=>r.id===video.releaseId);assert.ok(release);assert.equal(video.url,release.youtubeUrl);}
});
