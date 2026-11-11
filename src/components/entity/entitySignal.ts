export type EntityAnchor = { x: number; y: number; span: number };

export interface EntityFrame {
 progress: number;
 scrollAngle: number;
 seam: number;
 homeVisibility: number;
 contactVisibility: number;
 homeAnchor: EntityAnchor | null;
 contactAnchor: EntityAnchor | null;
 x: number;
 y: number;
}

export function createEntitySignal() {
 const frame: EntityFrame = { progress: 0, scrollAngle: 0, seam: 0, homeVisibility: 1, contactVisibility: 0, homeAnchor: null, contactAnchor: null, x: 0, y: 0 };
 const listeners = new Set<() => void>();
 return {
  frame,
  update(patch: Partial<EntityFrame>) {
   Object.assign(frame, patch);
   for (const listener of listeners) listener();
  },
  subscribe(listener: () => void) {
   listeners.add(listener);
   return () => { listeners.delete(listener); };
  },
 };
}

export type EntitySignal = ReturnType<typeof createEntitySignal>;
