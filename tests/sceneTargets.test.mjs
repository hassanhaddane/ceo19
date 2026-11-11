import test from 'node:test';
import { legacyProfessionalDestination } from '../src/lib/experienceRoutes.ts';
import assert from 'node:assert/strict';
import { sceneOrder, sceneChapterOrder, chapterFromHash, resolveSceneTarget, sceneFromHash, sceneScrollTarget } from '../src/lib/sceneTargets.ts';

test('public scene targets preserve content links and send CONNECT bookmarks to the footer',()=>{
 assert.deepEqual(sceneOrder,['home','music','archive']);
 for(const hash of ['#connect','#network']){
  assert.deepEqual(resolveSceneTarget(hash),{scene:'archive',anchor:'connect'});
  assert.equal(sceneFromHash(hash),'archive');
 }
 assert.deepEqual(resolveSceneTarget('#world'),null);
 assert.equal(sceneFromHash('#release-original'),'music');
 assert.equal(sceneFromHash('#film-timals'),'music');
 assert.equal(sceneFromHash('#archive-show-13'),'archive');
 assert.equal(resolveSceneTarget('#unrecognized'),null);
});
test('the cinematic chapter follows legacy and content anchors without rewriting them',()=>{
 assert.deepEqual(sceneChapterOrder,['home','music','archive','connect']);
 for (const hash of ['#connect','#network']) assert.equal(chapterFromHash(hash),'connect');
 for (const hash of ['#release-original','#film-timals']) assert.equal(chapterFromHash(hash),'music');
 assert.equal(chapterFromHash('#archive-show-13'),'archive');
 assert.equal(chapterFromHash('#main'),'home');
 assert.equal(chapterFromHash(''),'home');
 assert.equal(chapterFromHash('#world'),null);
});
test('an interior network target settles at the document end on compact and tall final scenes',()=>{
 // Desktop: the entire combined scene already fills the last viewport.
 assert.equal(sceneScrollTarget(2700,3300,900,3600),2700);
 // Phone: the network and contact remain visible when the available tail is shorter than a screen.
 assert.equal(sceneScrollTarget(2600,3300,844,3900,90),3056);
 // Long content and large zoom keep an ordinary interior anchor below the header.
 assert.equal(sceneScrollTarget(2600,3300,600,4600,90),3210);
 assert.equal(sceneScrollTarget(2600,null,600,4600),2600);
 assert.equal(sceneScrollTarget(0,20,900,500),0);
});

test('obsolete biography bookmarks replace with the locale EPK while release and contact hashes stay public',()=>{
 for (const locale of ['en','fr']) {
  for (const hash of ['#world','#world-title','#world-biography-label']) assert.equal(legacyProfessionalDestination(locale,hash),`/${locale}/epk#biography`);
  for (const hash of ['#connect','#network','#release-original','#archive-show-13','#music']) assert.equal(legacyProfessionalDestination(locale,hash),null);
 }
});
