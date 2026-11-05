import type { ProductPresentation, ViewerPose } from './types.ts';
/** Pure interaction math, independent of Three.js and commerce. */
export function idleInspectionPose(base: ViewerPose, type: ProductPresentation['previewType'], seconds: number): ViewerPose {
 return { yaw: base.yaw + (type === 'keychain-3d' ? seconds * .055 : Math.sin(seconds * .22) * .14), pitch: base.pitch + Math.sin(seconds * .17) * .015 };
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
