'use client';
import Image from 'next/image';
import {useEffect,useRef,useState,type PointerEvent} from 'react';
import type {Locale} from '@/types/content';
import {worldImages,worldAssets,worldSceneConfig,worldSceneCopy,type WorldDetail} from '@/data/worldScene';
import {useSignalMotion} from '@/lib/signalMotion';
import {HkzMark} from '../interaction/HkzMark';
import {Architecture} from '../world/Architecture';
import {SignalSlot} from '../signal/SignalSlot';
/** A photographic environment. Interaction labels exist only for assistive technology. */
export function WorldExperience({locale}:{locale:Locale}){
 const scene=useRef<HTMLElement>(null),frame=useRef(0),motion=useSignalMotion();
 const [selected,setSelected]=useState<WorldDetail|null>(null),[preview,setPreview]=useState<WorldDetail|null>(null);
 const active=preview??selected,copy=worldSceneCopy[locale];
 useEffect(()=>{
  const element=scene.current;if(!element)return;
  const observer=new IntersectionObserver(entries=>{element.dataset.visible=String(entries[0].isIntersecting);if(entries[0].isIntersecting)element.dataset.entered='true';},{threshold:.16});
  observer.observe(element);return()=>{observer.disconnect();cancelAnimationFrame(frame.current);};
 },[]);
 function pointer(event:PointerEvent<HTMLElement>){
  if(!motion||event.pointerType!=='mouse'||!window.matchMedia('(pointer:fine)').matches)return;
  const element=scene.current;if(!element)return;
  const rect=element.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width-.5)*worldSceneConfig.parallax,y=((event.clientY-rect.top)/rect.height-.5)*worldSceneConfig.parallax;
  cancelAnimationFrame(frame.current);frame.current=requestAnimationFrame(()=>{element.style.setProperty('--world-x',`${x}px`);element.style.setProperty('--world-y',`${y}px`);});
 }
 function reset(){cancelAnimationFrame(frame.current);scene.current?.style.setProperty('--world-x','0px');scene.current?.style.setProperty('--world-y','0px');setPreview(null);}
 const control=(detail:WorldDetail)=>({type:'button' as const,'aria-label':copy[detail],'aria-pressed':selected===detail,'data-interaction':'silent','data-signal-response':true,onPointerEnter:(event:PointerEvent<HTMLButtonElement>)=>{if(event.pointerType==='mouse')setPreview(detail);},onPointerLeave:()=>setPreview(null),onFocus:()=>setPreview(detail),onBlur:()=>setPreview(null),onClick:()=>{setSelected(value=>value===detail?null:detail);setPreview(null);}});
 return <section ref={scene} id="world" className="night-scene world-diorama" data-world="night" data-detail={active??'quiet'} data-motion={motion} aria-labelledby="world-title" onPointerMove={pointer} onPointerLeave={reset}>
  <div className="world-diorama-backdrop" aria-hidden="true"><Architecture variant="labyrinth"/><div className="world-wall world-wall--left"/><div className="world-wall world-wall--right"/><div className="world-stairs"><i/><i/><i/><i/></div></div>
  <header className="world-diorama-heading"><h2 id="world-title">WORLD <span>1.9</span></h2><p className="metadata">{copy.location}</p></header>
  <button {...control('exposure')} className="world-portrait" data-cursor="view"><Image src={worldImages.artist.src} alt={worldImages.artist.alt[locale]} fill sizes="(max-width:767px) 88vw, 47vw" style={{objectPosition:worldImages.artist.crop}} loading="lazy" draggable={false}/><span className="world-photo-exposure" aria-hidden="true"/></button>
  <button {...control('sound')} className="world-studio-print" data-cursor="enter"><span className="world-studio-photo"><Image src={worldImages.studio.src} alt={worldImages.studio.alt[locale]} fill sizes="(max-width:767px) 42vw, 22vw" loading="lazy" draggable={false}/></span><svg className="world-sound-trace" viewBox="0 0 300 45" aria-hidden="true">{Array.from({length:49},(_,i)=>{const h=Math.round(4+Math.abs(Math.sin(i*1.7)*Math.cos(i*.39))*32);return <path key={i} d={`M${i*6+3} ${22-h/2}v${h}`} stroke="currentColor" strokeWidth="1.4" style={{animationDelay:`${(i*.017).toFixed(3)}s`}}/>;})}</svg></button>
  <button {...control('mark')} className="world-production-paper" data-cursor="enter"><HkzMark/></button>
  <button {...control('passage')} className="world-doorway" data-cursor="view"><span className="world-door-light" aria-hidden="true"/><span className="world-door-photo"><Image src={worldImages.passage.src} alt={worldImages.passage.alt[locale]} fill sizes="(max-width:767px) 30vw, 18vw" style={{objectPosition:'48% 50%'}} loading="lazy" draggable={false}/></span></button>
  <button {...control('reflection')} className="world-chrome" data-cursor="enter"><Image src={worldAssets.chrome} alt="" fill sizes="(max-width:767px) 50vw, 31vw" loading="lazy" draggable={false}/></button>
  <div className="world-floor" aria-hidden="true"/><div className="world-light-sweep" aria-hidden="true"/>
  <p className="world-diorama-signature metadata">CEO 1.9</p><SignalSlot section="world"/>
 </section>;
}
