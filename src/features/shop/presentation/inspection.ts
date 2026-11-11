import type { ViewerPose } from './types.ts';

/** Full turn in about sixteen seconds. */
export function idleInspectionPose(base: ViewerPose, seconds: number): ViewerPose {
 return { yaw: base.yaw + seconds * .40, pitch: base.pitch + Math.sin(seconds * .55) * .04 };
}
export function nextProduct(index: number, direction: number, count: number) {
 return count > 0 ? ((index + direction) % count + count) % count : 0;
}
export function snapYaw(current: number, back: boolean) {
 const target = back ? Math.PI : 0;
 return target + Math.round((current - target) / (Math.PI * 2)) * Math.PI * 2;
}
export function dragPose(yaw: number, pitch: number, dx: number, dy: number, width: number) {
 const rate = Math.PI * 2 / Math.max(240, width);
 return { yaw: yaw + dx * rate, pitch: Math.max(-.28, Math.min(.28, pitch + dy * .002)) };
}
/** Fit horizontal bounds as well as height; tall phone canvases need more distance. */
export function fitCameraDistance(width: number, height: number, objectWidth: number, minimum: number, fov = 37) {
 if (width <= 0 || height <= 0) return minimum;
 return Math.max(minimum, objectWidth * height / (width * 2 * Math.tan(fov * Math.PI / 360)));
}

export const inspectionZoom = { min: 1, max: 1.65, step: .15 } as const;
export function clampInspectionZoom(zoom: number) {
 return Math.max(inspectionZoom.min, Math.min(inspectionZoom.max, zoom));
}
