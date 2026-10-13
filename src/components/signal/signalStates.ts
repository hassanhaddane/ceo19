import { motion } from '@/lib/motion';
import type { SectionId } from '@/types/content';

export type Quality = 'desktop' | 'low' | 'mobile';
export interface SignalState {
 duality: number; chrome: number; noiseSpeed: number; architecture: number; morph: number; lens: number; scale: number; rotation: [number, number, number];
 noiseFrequency: number; noiseAmplitude: number; frequency: number; fragmentation: number;
 emission: number; wireframe: number; nodes: number; metalness: number; roughness: number;
 camera: number; mobileCamera: number; keyLight: number; blueLight: number; mode: 'digital' | 'raw';
}
/** Art direction and performance controls. Palette is read from the existing CSS tokens. */
export const signalConfig = {
 colorTokens: { silver: '--color-silver', blue: '--color-blue', black: '--color-black', cream: '--color-cream' },
 morphSpeed: 3.2, // exponential damping, higher = faster settling
 noise: { strength: 1, speed: 0.085 },
 bloom: { intensity: 0.16, threshold: 0.85, smoothing: 0.5 },
 grain: 0.004,
 pointerStrength: 0.09,
 cameraDistance: 1, // multiplier for every state's dedicated camera distance
 backgroundDuration: motion.editorial,
 quality: {
  desktop: { tilesX: 12, tilesY: 10, subdivisions: 8, maxDpr: 1.75 },
  low: { tilesX: 10, tilesY: 8, subdivisions: 5, maxDpr: 1.25 },
  mobile: { tilesX: 8, tilesY: 6, subdivisions: 5, maxDpr: 1.25 }
 },
} as const;
export const signalSections: SectionId[] = ['home', 'music', 'visuals', 'archive', 'world', 'connect'];
const base: SignalState = {
 duality: 0, chrome: 0, noiseSpeed: .085, architecture: 0, morph: 0, lens: 0, scale: 1, rotation: [-0.45, -0.55, -0.18], noiseFrequency: 1.5, noiseAmplitude: 0.22,
 frequency: 0, fragmentation: 0, emission: 0.16, wireframe: 0, nodes: 0,
 metalness: 0.68, roughness: 0.33, camera: 7.5, mobileCamera: 8.8,
 keyLight: 3.5, blueLight: 4, mode: 'digital'
};
export const signalStates: Record<SectionId, SignalState> = {
 home: { ...base, chrome:.48, architecture:1, rotation:[.12,-.48,-.2], scale:1.2, metalness:.94, roughness:.27, keyLight:7, noiseAmplitude:.002, emission:.055 },
 music: { ...base, morph: 0.85, lens:.95, rotation: [-0.16, 0.42, -0.12], noiseAmplitude: 0.035, noiseFrequency: 2.1, frequency: .55, scale: 1.05, metalness:.94, roughness:.24, emission: 0.16, mode: 'raw' },
 visuals: { ...base, morph: 0.55, lens: 1, rotation: [0.12, -0.3, 0.08], noiseAmplitude: 0.045, noiseFrequency: 2.6, scale: 1.18, roughness: 0.23, emission: 0.22, wireframe: 0 },
 archive: { ...base, morph: 0.62, rotation: [-0.22, 0.48, -0.14], fragmentation: 0.7, noiseAmplitude: 0.06, scale: 1.08, roughness: 0.48, wireframe: 0, mode: 'raw' },
 world: { ...base, morph: 1, rotation: [0.06, -0.35, 0], noiseAmplitude: 0.008, noiseFrequency: 1.1, scale: 1.3, emission: 0.12, wireframe: 0, roughness: 0.27, keyLight: 5.2, mode: 'raw' },
 connect: { ...base, morph: 1, rotation: [0.15, 0.3, 0], noiseAmplitude: 0.012, scale: 1.25, emission: 0.12, wireframe: 0, nodes: 1, roughness: 0.36 }
};

/** Channel variations share the original UV surface, renderer and scroll blend. */
export const channelSignalStates: Record<string, SignalState> = {
 original: {...signalStates.music, morph:.65, lens:.65, fragmentation:.6, noiseAmplitude:.025, noiseSpeed:.12},
 kritika: {...signalStates.music, architecture:.3, morph:.25, lens:.35, noiseAmplitude:.008, roughness:.2, scale:.95, chrome:.45},
 fantastique: {...signalStates.music, morph:.72, lens:.82, noiseAmplitude:.075, noiseFrequency:.9, frequency:.22, roughness:.5, noiseSpeed:.035},
 timals: {...signalStates.music, morph:.95, lens:.25, fragmentation:.28, scale:.94, roughness:.35, noiseSpeed:.05},
 'machi-batel': {...signalStates.music, morph:.8, lens:.9, duality:1, noiseAmplitude:.025, noiseFrequency:1.1, roughness:.35, noiseSpeed:.04},
 'bcp-dargent': {...signalStates.music, morph:.85, lens:.94, chrome:.75, metalness:1, roughness:.12, noiseAmplitude:.009, emission:.08}
};
export function resolveSignalState(section: SectionId, channel?: string) {
 return section==='music' && channel ? channelSignalStates[channel]??signalStates.music : signalStates[section];
}
