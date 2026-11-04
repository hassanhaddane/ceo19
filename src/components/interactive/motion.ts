export type ActionFamily = 'entry' | 'music' | 'navigation' | 'shop' | 'utility';
export type ActionPrinciple = 'cutout' | 'ink' | 'shift' | 'depth';

/** One vocabulary; a control never combines more than two principles. */
export const actionMotion = {
 press: 110, reveal: 320, shift: 220, settle: 320, depth: 3.5,
 families: {
  entry: ['shift'], music: ['ink', 'shift'],
  navigation: ['cutout', 'shift'], shop: ['ink', 'depth'], utility: ['cutout'],
 } satisfies Record<ActionFamily, readonly ActionPrinciple[]>,
};
export const interactionTokens = {
 '--action-press': `${actionMotion.press}ms`, '--action-reveal': `${actionMotion.reveal}ms`,
 '--action-shift': `${actionMotion.shift}ms`, '--action-settle': `${actionMotion.settle}ms`,
 '--action-ease': 'cubic-bezier(.18,.76,.24,1)',
};
export function normalizedPointer(position: number, start: number, size: number) {
 return size > 0 ? Math.max(-1, Math.min(1, (position - start) / size * 2 - 1)) : 0;
}
export function settlePointer(current: number, target: number, elapsed: number) {
 return current + (target - current) * (1 - Math.exp(-Math.min(.04, Math.max(0, elapsed)) * 18));
}
