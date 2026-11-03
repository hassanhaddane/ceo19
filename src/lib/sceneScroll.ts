import type { SectionId } from '../types/content.ts';

/** Free document scrolling includes the last Home links passing through view. */
export function isHomeReading(width: number, height: number, home: Pick<DOMRect, 'height' | 'top' | 'bottom'> | undefined, requested: SectionId | null) {
 return width < 768 && !!home && home.height > height + 3 && home.top <= 3 && home.bottom > 3 && (!requested || requested === 'home');
}

/** Drain a long wheel burst at the end of the hub; the next gesture can leave.
 * Touch and keyboard scrolling remain native, with no snap until Home passes. */
export function mobileHomeWheelEnd(width: number, viewportHeight: number, homeTop: number, homeHeight: number, originY: number, direction: number) {
 const end = homeTop + homeHeight - viewportHeight;
 return width < 768 && direction > 0 && homeHeight > viewportHeight + 3 && originY < end - 3 ? end : null;
}

/** A new deliberate wheel gesture after the last Home links have been read
 * finishes on Music, even when its native delta is less than one viewport. */
export function mobileHomeExit(width: number, viewportHeight: number, homeTop: number, homeHeight: number, originY: number, currentY: number, direction: number, amount: number, intent: number) {
 const end = homeTop + homeHeight - viewportHeight, next = homeTop + homeHeight;
 return width < 768 && homeHeight > viewportHeight + 3 && direction > 0 && amount >= intent && originY >= end - 3 && originY < next - 3 && currentY < next - 3 ? next : null;
}
