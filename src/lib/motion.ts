/** One motion vocabulary, shared by CSS, WAAPI and GSAP. Values are milliseconds. */
const timing = {snap:180, glide:520, impact:320, cinematic:940} as const;
export const motion = {
 ...timing,
 language:160, menuClose:320,
 exits:{instagram:180,tiktok:180,youtube:240,spotify:240,studio:220},
 camera:{exposure:80,open:560,snap:220,close:420,cooldown:800,reduced:120},
 channels:{snap:620,cut:560,float:880,heavy:820,cinematic:900,press:740},
 channelExitRatio:.2, channelMetadataRatio:.32,
 micro:timing.snap, interface:timing.glide, editorial:timing.cinematic, page:timing.glide,
 reveal:22, hover:4, phraseTravel:4, photoScale:1.035,
 ease:'cubic-bezier(.2,.7,.2,1)', snapEase:'cubic-bezier(.2,0,0,1)',
 cinematicEase:'cubic-bezier(.76,0,.24,1)', gsapEase:'power3.inOut',
 magnetic:5, impulseDecay:5,
} as const;
