/** The sleeve timeline writes once. The portal reads the same artwork mix, without React updates. */
export function createReleaseBlend(initial: number) {
 const frame = { from: initial, to: initial, progress: 0, direction: 1 };
 const listeners = new Set<() => void>();
 return {
  frame,
  write(from: number, to: number, progress: number, direction: number) {
   if (frame.from === from && frame.to === to && frame.progress === progress && frame.direction === direction) return;
   Object.assign(frame, { from, to, progress, direction });
   for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
   listeners.add(listener);
   return () => { listeners.delete(listener); };
  },
 };
}

export type ReleaseBlend = ReturnType<typeof createReleaseBlend>;
