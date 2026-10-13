'use client';
import Image from 'next/image';
import {useState} from 'react';
import type {Social} from '@/types/content';
import {editorialImages} from '@/data/editorial';
import {worldImages} from '@/data/worldScene';
import {featuredRelease} from '@/data/releases';
import {PlatformIcon} from '../music/PlatformIcon';
import {ExitLink,type ExitWorld} from '../interaction/ExitLink';
export function SocialWorld({social}:{social:Social}){
 const [active,setActive]=useState(false);
 return <ExitLink world={social.id as ExitWorld} className={`social-zone social-zone--${social.id}`} href={social.url} data-active={active} onPointerEnter={event=>{if(event.pointerType==='mouse')setActive(true);}} onPointerLeave={()=>setActive(false)} onFocus={()=>setActive(true)} onBlur={()=>setActive(false)} onTouchStart={()=>setActive(true)} data-analytics="social_click" data-id={social.id} data-cursor={social.id==='youtube'?'play':social.id==='spotify'?'listen':'enter'} data-signal-response>
 {active&&<span className="social-fragments" aria-hidden="true">{social.id==='instagram'?<><Image src={worldImages.artist.src} alt="" width={120} height={150}/><Image src={editorialImages.street.src} alt="" width={110} height={130}/></>:social.id==='youtube'?<span className="social-cinema"><Image src={worldImages.artist.src} alt="" fill sizes="280px"/></span>:social.id==='spotify'&&featuredRelease.artwork?<Image src={featuredRelease.artwork} alt="" width={135} height={135}/>:<span className="social-split"/>}</span>}
 <PlatformIcon platform={social.platform}/><span className="social-zone-name">{social.platform}<small>{social.handle}</small></span><svg className="social-zone-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 21 21 3M4 3h17v17" stroke="currentColor" strokeWidth="1.2"/></svg><span className="social-exit" aria-hidden="true"/>
 </ExitLink>;
}
