/** Circular slots wrap only beyond the visible three sleeves. No DOM clones. */
export function carouselSlot(index: number, position: number, count: number) {
 return ((index - position + count / 2) % count + count) % count - count / 2;
}
export function carouselTravel(from: number, to: number, count: number) {
 return carouselSlot(to, from, count);
}
export function carouselPose(slot: number, size: number, spread: number) {
 const distance = Math.abs(slot), near = Math.min(distance, 1);
 return {
  x: slot * spread,
  y: near * size * .025,
  scale: 1 - near * .36 - Math.max(0, distance - 1) * .08,
  rotation: slot === 0 ? 0 : -Math.max(-2, Math.min(2, slot)) * 11,
  opacity: distance <= 1 ? 1 - distance * .38 : Math.max(0, .62 * (2 - distance)),
  zIndex: 30 - Math.round(distance * 10),
 };
}
