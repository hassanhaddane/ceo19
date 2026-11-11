import type { ViewerPose } from './types.ts';
export const initialInspectionPose: ViewerPose = { yaw: -.12, pitch: .035 };
/** One renderer consumes mutable input. Manual inspection permanently yields the idle pose until reset. */
export class InspectionController {
 private pose: ViewerPose = { ...initialInspectionPose };
 private displayed: ViewerPose = { ...initialInspectionPose };
 private idle = true;
 private hoverPaused = false;
 private resetVersion = 0;
 private pointer = { x: 0, y: 0 };
 private draw: () => void = () => {};
 getPose() { return this.pose; }
 getDisplayedPose() { return this.displayed; }
 isIdle() { return this.idle; }
 isHoverPaused() { return this.hoverPaused; }
 setHoverPaused(value: boolean) {
  if (this.hoverPaused === value) return;
  this.hoverPaused = value;
  if (value) this.pointer = { x: 0, y: 0 };
  this.draw();
 }
 getResetVersion() { return this.resetVersion; }
 present(pose: ViewerPose) { this.displayed = pose; }
 beginInteraction() { this.idle = false; this.pose = { ...this.displayed }; this.pointer = { x: 0, y: 0 }; this.draw(); }
 getPointer() { return this.pointer; }
 setPose(pose: ViewerPose) { this.idle = false; this.pose = pose; this.draw(); }
 setPointer(pointer: { x: number; y: number }) { this.pointer = pointer; this.draw(); }
 /** New specimens discard old turns; a same-specimen reset can take the shortest path. */
 reset(nearest = false) {
  this.idle = true; this.resetVersion++;
  this.pose = { ...initialInspectionPose, yaw: initialInspectionPose.yaw + (nearest ? Math.round((this.displayed.yaw - initialInspectionPose.yaw) / (Math.PI * 2)) * Math.PI * 2 : 0) };
  if (!nearest) this.displayed = { ...this.pose };
  this.pointer = { x: 0, y: 0 }; this.draw();
 }
 attach(draw: () => void) { this.draw = draw; return () => { if (this.draw === draw) this.draw = () => {}; }; }
}
