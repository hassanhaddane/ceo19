import type { WorldMotion } from '../data/releaseWorlds.ts';

/** Symmetric direction on the circular catalogue, including first/last wrap. */
export function releaseDirection(from: number, to: number, count: number) {
 const forward = (to - from + count) % count;
 return forward > count / 2 ? -1 : 1;
}
/** Finite, cancellable image-plane transitions; no full-frame flashing loop. */
export function releaseKeyframes(treatment: WorldMotion, direction = 1): Keyframe[] {
 switch (treatment) {
  case 'signal': return [
   {clipPath:'inset(22% 0 68% 0)',transform:`translateX(${direction*48}px) skewX(-5deg)`},
   {clipPath:'inset(0 0 42% 0)',transform:`translateX(${-direction*14}px)`,offset:.28},
   {clipPath:'inset(0)',transform:`translateX(${direction*6}px)`,offset:.55},
   {clipPath:'inset(0)',transform:'none'},
  ];
  case 'impact': return [{clipPath:'polygon(0 0,0 0,0 100%,0 100%)',transform:`scale(1.08) translateX(${direction*12}px)`},{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)',transform:'scale(1.02)',offset:.32},{clipPath:'inset(0)',transform:'none'}];
  case 'haze': return [{filter:'blur(12px)',opacity:0,transform:`translateY(${direction*24}px) scale(1.04)`},{filter:'blur(0px)',opacity:1,transform:'none'}];
  case 'crew': return [{transform:`perspective(900px) translateZ(-180px) rotateY(${direction*-12}deg)`,clipPath:'inset(0 20%)'},{transform:'perspective(900px) translateZ(12px) rotateY(0deg)',clipPath:'inset(0)',offset:.72},{transform:'none',clipPath:'inset(0)'}];
  case 'split': return [{transform:`translateX(${direction*42}px)`,clipPath:'inset(0 48%)'},{transform:'none',clipPath:'inset(0)'}];
  case 'paper': return [{clipPath:`inset(0 ${direction>0?'100% 0 0':'0 0 100%'})`,transform:'scale(1.06)'},{clipPath:'inset(0)',transform:'none'}];
 }
}
