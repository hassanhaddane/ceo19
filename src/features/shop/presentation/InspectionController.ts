import type { ViewerPose } from './types.ts';
/** Mutable WebGL input lives outside React state; pointer events never rerender the app. */
export class InspectionController {
 private pose: ViewerPose = { yaw: 0, pitch: 0 };
 private pointer = { x: 0, y: 0 };
 private draw: () => void = () => {};
 getPose() { return this.pose; }
 getPointer() { return this.pointer; }
 setPose(pose: ViewerPose) { this.pose = pose; this.draw(); }
 setPointer(pointer: { x: number; y: number }) { this.pointer = pointer; this.draw(); }
 reset() { this.pose = { yaw: 0, pitch: 0 }; this.pointer = { x: 0, y: 0 }; this.draw(); }
 attach(draw: () => void) { this.draw = draw; return () => { if (this.draw === draw) this.draw = () => {}; }; }
}
