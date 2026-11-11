import test from 'node:test';
import assert from 'node:assert/strict';
import { createIntroController, introFrame, introProfile, introSettings } from '../src/components/intro/IntroController.ts';

function entry(profile = introProfile({mobile:false,economy:false,reduced:false})) {
 const frames = [], choice = { opacity: 1 }, wash = { xPercent: 0, opacity: 0 }; let completed = 0;
 const controller = createIntroController({ duration: profile.duration, reduced: profile.reduced, choice, wash,
  draw: progress => frames.push(introFrame(progress)), complete: () => completed++ });
 return { controller, frames, choice, wash, completed: () => completed,
  start() { controller.start(); controller.timeline.pause(); },
  advance(seconds) { controller.timeline.totalTime(seconds, false); } };
}
test('the real GSAP clock reaches each official mark in order and completes exactly once', () => {
 const item = entry(); item.start(); item.controller.start(); item.controller.timeline.pause();
 const duration = introSettings.duration.desktop / 1000;
 assert.equal(item.controller.timeline.duration(), duration);
 assert.equal(item.frames[0].stage, 'black');
 for (const progress of [.1, .2, .45, .65, .85, 1]) item.advance(duration * progress);
 assert.ok(item.frames.some(frame => frame.stage === 'hkz-reveal'));
 assert.ok(item.frames.some(frame => frame.stage === 'hkz-hold'));
 assert.ok(item.frames.some(frame => frame.stage === 'morph'));
 assert.ok(item.frames.some(frame => frame.stage === 'ceo-settle'));
 assert.equal(item.frames.at(-1).exit, 1); assert.equal(item.choice.opacity, 0);
 assert.equal(item.wash.opacity, 0); assert.equal(item.completed(), 1);
 item.controller.start(); assert.equal(item.completed(), 1); item.controller.dispose();
});
test('Skip/unmount kills the coordinated timeline and invalidates stale draw/completion callbacks', () => {
 const item = entry(); item.start(); item.advance(.45);
 const before = item.frames.length; item.controller.dispose();
 item.advance(introSettings.duration.desktop / 1000); item.controller.start();
 assert.equal(item.frames.length, before); assert.equal(item.completed(), 0);
 assert.equal(item.controller.timeline.parent, null);
});
test('mobile and economy bound work; reduced motion has no particles, depth or expansion', () => {
 const desktop = introProfile({mobile:false,economy:false,reduced:false});
 const mobile = introProfile({mobile:true,economy:false,reduced:false});
 const economy = introProfile({mobile:true,economy:true,reduced:false});
 const reduced = introProfile({mobile:false,economy:false,reduced:true});
 assert.ok(desktop.duration >= 1500 && desktop.duration <= 2500);
 assert.ok(mobile.duration >= 1000 && mobile.duration <= 1600 && mobile.duration < desktop.duration);
 assert.ok(mobile.density < desktop.density && economy.density < mobile.density);
 assert.ok(economy.slices < desktop.slices && economy.depth < desktop.depth);
 assert.equal(reduced.density, 0); assert.equal(reduced.depth, 0); assert.ok(reduced.duration < 600);
 const item = entry(reduced); item.start(); item.advance(reduced.duration / 1000);
 assert.equal(item.controller.timeline.duration(), reduced.duration / 1000); assert.equal(item.wash.xPercent, 0); assert.equal(item.wash.opacity, 0);
 assert.equal(item.completed(), 1); item.controller.dispose();
 assert.equal(introFrame(-10).progress, 0); assert.equal(introFrame(20).exit, 1);
});
test('new document entries always restart; no completed timeline state carries across reloads', () => {
 for (let reload = 0; reload < 3; reload++) {
  const item = entry(introProfile({mobile:false,economy:false,reduced:true}));
  item.start(); item.advance(introSettings.duration.reduced / 1000);
  assert.equal(item.frames[0].stage, 'black'); assert.equal(item.frames.at(-1).stage, 'home-reveal');
  assert.equal(item.completed(), 1); item.controller.dispose();
 }
});
