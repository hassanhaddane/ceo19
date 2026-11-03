import type { SectionId } from '@/types/content';

/** Event-driven effects only; all durations are milliseconds. */
export const visualEffects = {
 background: { duration: 700 },
 scenes: { transition: 720, settleDelay: 180, wheelIdle: 190, wheelIntent: 80 },
 menu: { open: 720, close: 520, aperture: 'polygon(48% 100%,48% 42%,48.5% 36%,50% 33%,51.5% 36%,52% 42%,52% 100%,50% 100%)', full: 'polygon(0% 100%,0% 0%,0% 0%,50% 0%,100% 0%,100% 0%,100% 100%,50% 100%)' },
 parallax: { intensity: .8, mobileIntensity: .28, interpolation: .12 },
 releases: { retract: 160, duration: 760, reduced: 120, fragments: 2400, interruption: 160, wheelIdle: 250, wheelThreshold: 90, easing: 'cubic-bezier(.2,.7,.2,1)' },
 cinema: { entry: 760, change: 650, exit: 520, reduced: 140, providerTimeout: 15000 },
 lyrics: { timeout: 9000, entry: 420 },
 archive: { open: 620, close: 320, reduced: 140, shutter: 280, flash: 70, flashCooldown: 1600, wheelIdle: 160, cameraLerp: .115, pointerLerp: .1, hoverLerp: .16, height: .86, pointerX: [12,56], pointerY: [10,34], dragThreshold: 8, axisLock: 1.15, dragDesktop: .38, dragMobile: .67, maxMomentum: .65, momentum: .22 },
} as const;

export const parallaxPresets = {
 video: { x: 22, y: 15, scroll: 18, rotate: .15 },
 atmosphere: { x: 30, y: 22, scroll: 38, rotate: 0 },
 architecture: { x: 54, y: 38, scroll: 74, rotate: .7 },
 type: { x: 46, y: 30, scroll: 64, rotate: -.2 },
 detail: { x: 14, y: 10, scroll: 22, rotate: 0 },
 archiveFilm: { x: 10, y: 7, scroll: 12, rotate: 0 },
 photograph: { x: 24, y: 18, scroll: 34, rotate: .3 },
} as const;
export type ParallaxLayer = keyof typeof parallaxPresets;

export type VisualScene = SectionId | 'intro' | 'menu';
export const backgroundPresentation: Record<VisualScene, { opacity: number; overlay: number; scale: number; saturation: number }> = {
 intro: { opacity: 1, overlay: .2, scale: 1.075, saturation: .7 },
 menu: { opacity: .7, overlay: .4, scale: 1.06, saturation: .45 },
 home: { opacity: 1, overlay: .2, scale: 1.075, saturation: .7 },
 music: { opacity: 0, overlay: .16, scale: 1.025, saturation: .7 },
 archive: { opacity: 0, overlay: .58, scale: 1.075, saturation: .45 },
};
