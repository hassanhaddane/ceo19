import type { SectionId } from '@/types/content';

/** Event-driven effects only; all durations are milliseconds. */
export const visualEffects = {
 entry: { duration: 2200, smokeAt: 650, revealAt: 1450, reduced: 140 },
 smoke: { musicDuration: 700, maxWidth: 960, maxHeight: 640, particles: 48, spriteSize: 128 },
 background: { duration: 700 },
 scenes: { transition: 720, settleDelay: 180, wheelIdle: 190, wheelIntent: 80 },
 menu: { open: 720, close: 520, aperture: 'polygon(48% 100%,48% 42%,48.5% 36%,50% 33%,51.5% 36%,52% 42%,52% 100%,50% 100%)', full: 'polygon(0% 100%,0% 0%,0% 0%,50% 0%,100% 0%,100% 0%,100% 100%,50% 100%)' },
 parallax: { intensity: .8, mobileIntensity: .28, interpolation: .12 },
 releases: { retract: 160, duration: 760, reduced: 120 },
 cinema: { entry: 760, change: 650, exit: 520, reduced: 140, providerTimeout: 15000 },
 lyrics: { timeout: 9000 },
 world: { phrase: 1600, signal: 650, impact: 900, haze: 2400, crew: 1800, split: 1900, paper: 1300 },
 connect: { preview: 450, exposure: 450, rhythm: 480, aperture: 650, pulse: 850 },
 archive: { open: 620, close: 320, flash: 70, flashCooldown: 1600, wheelIdle: 160 },
} as const;

export const parallaxPresets = {
 video: { x: 22, y: 15, scroll: 18, rotate: .15 },
 atmosphere: { x: 30, y: 22, scroll: 38, rotate: 0 },
 architecture: { x: 54, y: 38, scroll: 74, rotate: .7 },
 type: { x: 46, y: 30, scroll: 64, rotate: -.2 },
 detail: { x: 14, y: 10, scroll: 22, rotate: 0 },
 worldMap: { x: 62, y: 38, scroll: 40, rotate: .65 },
 photograph: { x: 24, y: 18, scroll: 34, rotate: .3 },
} as const;
export type ParallaxLayer = keyof typeof parallaxPresets;

export type VisualScene = SectionId | 'intro' | 'menu';
export const backgroundPresentation: Record<VisualScene, { opacity: number; overlay: number; scale: number; saturation: number }> = {
 intro: { opacity: 1, overlay: .24, scale: 1, saturation: .65 },
 menu: { opacity: .7, overlay: .4, scale: 1.06, saturation: .45 },
 home: { opacity: 1, overlay: .2, scale: 1.075, saturation: .7 },
 music: { opacity: 0, overlay: .16, scale: 1.025, saturation: .7 },
 archive: { opacity: .3, overlay: .5, scale: 1.075, saturation: .45 },
 world: { opacity: .25, overlay: .65, scale: 1.08, saturation: .45 },
 connect: { opacity: .38, overlay: .68, scale: 1.075, saturation: .6 },
};
