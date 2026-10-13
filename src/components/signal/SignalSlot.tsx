import { useId } from 'react';
import type { Release, SectionId } from '@/types/content';
import { sampleBaseSurface } from './signalMath';
import { resolveSignalState } from './signalStates';
/** Filled facets of the existing surface: a material study, never a wireframe placeholder. */
export function SignalSlot({section,channel}:{section:SectionId;channel?:Release}) {
 const id=useId().replace(/:/g,''),state=resolveSignalState(section,channel?.id);
 if(section==='home') return <div className="signal-slot signal-slot--home" data-signal-anchor="home" aria-hidden="true"><svg className="signal-fallback" viewBox="0 0 240 460"><defs><linearGradient id={id} x1="0" x2="1"><stop stopColor="var(--color-black)"/><stop offset=".14" stopColor="var(--color-silver)"/><stop offset=".2" stopColor="var(--color-black)"/><stop offset=".72" stopColor="var(--color-black)"/><stop offset=".83" stopColor="var(--color-blue)"/><stop offset="1" stopColor="var(--color-black)"/></linearGradient><linearGradient id={`${id}-edge`}><stop stopColor="var(--color-cream)"/><stop offset=".45" stopColor="var(--color-silver)"/><stop offset="1" stopColor={channel?.accentColor??"var(--color-blue)"}/></linearGradient></defs><path d="M64 16 176 37 191 409 86 443 52 418 39 42Z" fill={`url(#${id})`}/><path d="M64 16 52 418 86 443 78 46Z" fill={`url(#${id}-edge)`}/><path d="m78 46 98-9 15 372-105 34Z" fill={`url(#${id})`}/><path d="m64 16 14 30 8 397M176 37l15 372" fill="none" stroke={`url(#${id}-edge)`} strokeWidth="1.5"/></svg></div>;
 const patches=[];
 for(let row=0;row<14;row++)for(let col=0;col<18;col++) {
  const points=[[col/18,row/14],[(col+1)/18,row/14],[(col+1)/18,(row+1)/14],[col/18,(row+1)/14]].map(([u,v])=>{
   const [x,y,z]=sampleBaseSurface(u,v,state.morph,state.lens,state.architecture,state.duality);
   const offset=state.fragmentation*Math.sin(col*7+row*11)*9;
   return `${(220+x*78+z*28+offset).toFixed(2)},${(180-y*72+z*42+offset).toFixed(2)}`;
  });
  patches.push(<polygon key={`${row}-${col}`} points={points.join(' ')} fill={`url(#${id})`} opacity={Number((.8+Math.abs(Math.sin(col*.27+row*.34))*.2).toFixed(3))}/>);
 }
 return <div className={`signal-slot signal-slot--${section}`} data-signal-anchor={section} aria-hidden="true"><svg className="signal-fallback" viewBox="0 0 440 360"><defs><linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="440" y2="360"><stop stopColor="var(--color-black)"/><stop offset=".35" stopColor="var(--color-silver)"/><stop offset=".48" stopColor="var(--color-white)"/><stop offset=".55" stopColor="var(--color-black)"/><stop offset="1" stopColor={channel?.accentColor??"var(--color-blue)"}/></linearGradient></defs><g transform="rotate(-18 220 180)">{patches}</g></svg></div>;
}
