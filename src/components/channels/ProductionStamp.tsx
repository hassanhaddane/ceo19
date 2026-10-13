import Image from 'next/image';
import type {Locale} from '@/types/content';
import {channelProduction} from '@/data/socials';
import {transmissionCopy} from '@/data/transmissions';
import {worldImages} from '@/data/worldScene';
import {HkzMark} from '../interaction/HkzMark';
import {PlatformIcon} from '../music/PlatformIcon';
import {ExitLink} from '../interaction/ExitLink';
/** Artist-supplied global production identity, never a per-track credit. */
export function ProductionStamp({locale,variant='channel'}:{locale:Locale;variant?:'channel'|'closing'}){
 return <div className={`channel-production production-stamp production-stamp--${variant}`}>
 <div className="production-atmosphere" aria-hidden="true"><Image src={worldImages.studio.src} alt="" fill sizes="(max-width:767px) 90vw, 380px"/><span className="production-wave">{Array.from({length:17},(_,i)=><i key={i} style={{height:`${6+(i*13)%17}px`}}/>)}</span></div>
 <ExitLink world="studio" className="production-logo" href={channelProduction.youtube} aria-label="HKZ PROD YouTube" data-cursor="enter" data-signal-response data-analytics="social_click" data-id="hkz-logo"><HkzMark/><span className="production-rec" aria-hidden="true">REC</span></ExitLink>
 <div className="production-credit"><span>{transmissionCopy[locale].production}</span><strong>{channelProduction.name}</strong></div>
 <nav aria-label={channelProduction.name}><ExitLink world="studio" aria-label="HKZ PROD Instagram" href={channelProduction.instagram} data-cursor="enter" data-analytics="social_click" data-id="hkz-instagram"><PlatformIcon platform="Instagram"/><span>Instagram</span></ExitLink><ExitLink world="studio" aria-label="HKZ PROD YouTube channel" href={channelProduction.youtube} data-cursor="enter" data-analytics="social_click" data-id="hkz-youtube"><PlatformIcon platform="YouTube"/><span>YouTube</span></ExitLink></nav>
 </div>;
}
