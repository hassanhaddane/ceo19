import test from 'node:test';
import assert from 'node:assert/strict';
import { actionMotion, normalizedPointer, settlePointer } from '../src/components/interactive/motion.ts';

test('button pointer input is normalized and bounded even outside the stable hit region', () => {
 assert.equal(normalizedPointer(50, 0, 100), 0);
 assert.equal(normalizedPointer(-100, 0, 100), -1);
 assert.equal(normalizedPointer(900, 0, 100), 1);
 assert.equal(normalizedPointer(40, 40, 0), 0);
 assert.equal(normalizedPointer(150, 100, 100), 0);
});
test('damped button depth settles without overshoot after a long or suspended frame', () => {
 let position = -1;
 for (let index = 0; index < 100; index++) {
  position = settlePointer(position, 1, index === 2 ? 60 : 1 / 60);
  assert.ok(position >= -1 && position <= 1);
 }
 assert.ok(Math.abs(1 - position) < .003);
 assert.equal(settlePointer(0, 1, -1), 0);
 assert.ok(actionMotion.depth <= 4);
 assert.ok(actionMotion.press >= 80 && actionMotion.press <= 160);
 for (const principles of Object.values(actionMotion.families)) assert.ok(principles.length <= 2);
});
