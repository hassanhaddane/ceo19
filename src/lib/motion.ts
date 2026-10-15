/** One motion vocabulary, shared by CSS, WAAPI and GSAP. Values are milliseconds. */
const timing = {snap:180, glide:520, impact:320, cinematic:940} as const;
export const motion = {
 ...timing,
 menuClose:320,
 micro:timing.snap, interface:timing.glide, editorial:timing.cinematic, page:timing.glide,
 reveal:22, hover:4, phraseTravel:4, photoScale:1.035,
 ease:'cubic-bezier(.2,.7,.2,1)', snapEase:'cubic-bezier(.2,0,0,1)',
 cinematicEase:'cubic-bezier(.76,0,.24,1)', gsapEase:'power3.inOut',
} as const;

/** V3 foundation: event/scroll driven only. Entry/media presets live in visualEffects.ts. */
export const v3Effects = {
 grainOpacity: 0.035,
} as const;
