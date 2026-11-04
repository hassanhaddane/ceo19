import test from 'node:test';
import assert from 'node:assert/strict';
import { createMenuController } from '../src/components/navigation/MenuController.ts';
function menu() {
 const sheet = {clipPath:'none'}, cut = {xPercent:0,opacity:0}, items = Array.from({length:4},()=>({y:0,opacity:1})), signature={clipPath:'none',opacity:1};
 let closed = 0; const stages=[];
 const controller = createMenuController({sheet,cut,items,signature,onClosed:()=>closed++,onStage:stage=>stages.push(stage)});
 return {controller,sheet,cut,items,signature,stages,closed:()=>closed,start(){controller.open();controller.timeline.pause();}};
}
test('the editorial sheet and stagger share one 780ms clock; labels never become hidden or disabled',()=>{
 const m=menu(); m.start(); assert.equal(m.controller.timeline.duration(),.78);
 m.controller.timeline.totalTime(.3,false); assert.ok(m.items.every(i=>i.opacity>=.45));
 m.controller.timeline.totalTime(.78,false); assert.ok(m.items.every(i=>i.y===0&&i.opacity===1));
 assert.equal(m.signature.opacity,1);assert.equal(m.cut.opacity,0);assert.equal(m.stages.at(-1),'open');m.controller.dispose();
});
test('close reverses the same timeline and notifies once, including a partially opened menu',()=>{
 for(const progress of [.2,.78]){const m=menu();m.start();m.controller.timeline.totalTime(progress,false);m.controller.close();m.controller.timeline.pause();
  assert.equal(m.controller.timeline.reversed(),true);m.controller.timeline.totalTime(0,false);assert.equal(m.closed(),1);
  m.controller.close();m.controller.settle();assert.equal(m.closed(),1);m.controller.dispose();}
});
test('turning motion OFF settles open content or completes a queued close without stale callbacks',()=>{
 const m=menu();m.start();m.controller.timeline.totalTime(.15,false);m.controller.settle();assert.equal(m.items[3].opacity,1);assert.equal(m.closed(),0);
 m.controller.close();m.controller.settle();assert.equal(m.closed(),1);m.controller.dispose();
});
test('cleanup restores the original styles and invalidates pending callbacks under Strict Mode',()=>{
 const m=menu();m.start();m.controller.timeline.totalTime(.2,false);m.controller.close();m.controller.dispose();
 assert.equal(m.sheet.clipPath,'none');assert.equal(m.items[0].opacity,1);assert.equal(m.controller.timeline.parent,null);
 m.controller.timeline.totalTime(0,false);m.controller.settle();assert.equal(m.closed(),0);
 const fresh=menu();fresh.start();fresh.controller.timeline.totalTime(.78,false);assert.equal(fresh.items[3].opacity,1);fresh.controller.dispose();
});
