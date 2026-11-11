/** Presentation-only contract. No price, stock, variant, cart or commerce provider. */
export interface PresentationAsset {
 src: string;
 /** Normalized region in a front/back atlas. Never mirror a front to make a back. */
 region?: { x: number; y: number; width: number; height: number };
}
export interface ProductPresentation {
 id: string;
 previewType: 'apparel-shell' | 'sticker-stack' | 'keychain-3d';
 frontAsset: PresentationAsset;
 backAsset: PresentationAsset | null;
 model3dAsset: string | null;
 accent: string;
 material: string;
 graphicColor: string;
 graphicScale: number;
 graphicAsset: PresentationAsset;
 graphicOffsetY: number;
}
export type InspectionView = 'front' | 'back' | 'rotate';
export interface ViewerPose { yaw: number; pitch: number; }
