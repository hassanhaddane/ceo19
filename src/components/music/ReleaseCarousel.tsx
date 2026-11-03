'use client';
import Image from 'next/image';
import { UtilityButton, UtilityGlyph } from '../interactive/UtilityAction';
import { releases } from '@/data/releases';
import { assetUrl } from '@/data/assets';
import { releaseCopy } from '@/data/releaseCopy';
import { carouselPose, carouselSlot } from '@/lib/carouselGeometry';
import type { Locale } from '@/types/content';
import type { useReleaseCarousel } from './useReleaseCarousel';

type Controller = ReturnType<typeof useReleaseCarousel>;
export function ReleaseCarousel({ activeRelease, incomingRelease, busy, stageRef, select, move, keyboard, stageEvents, locale }: Controller & { locale: Locale }) {
 const current = releases.indexOf(activeRelease), incoming = incomingRelease ? releases.indexOf(incomingRelease) : current;
 const copy = releaseCopy[locale];
 return <div ref={stageRef} className="music-carousel" data-busy={busy} data-scene-interaction="music" data-cursor="drag" role="region" aria-roledescription="carousel" aria-label={copy.index} aria-busy={busy} tabIndex={0} onKeyDown={keyboard} {...stageEvents}>
  <div className="carousel-track">
   {releases.map((release, index) => {
    const slot = carouselSlot(index, current, releases.length), pose = carouselPose(slot, 0, 0);
    const near = Math.abs(slot) <= 1 || Math.abs(carouselSlot(index, incoming, releases.length)) <= 1;
    return <div key={release.id} className="carousel-slide" data-release={release.id} data-position={slot===0?'center':slot===-1?'previous':slot===1?'next':'moving'} aria-hidden={pose.opacity===0} style={{ transform:`translateX(calc(var(--carousel-spread) * ${slot})) rotateY(${pose.rotation}deg) scale(${pose.scale})`, opacity:pose.opacity, zIndex:pose.zIndex, visibility:pose.opacity===0?'hidden':'visible' }}>
     <button data-ceo-action="utility" data-ceo-motion="cutout" data-cursor="view" className="carousel-cover" type="button" tabIndex={Math.abs(slot)<=1?0:-1} aria-label={`${index===current?(locale==='fr'?'Sortie sélectionnée':'Selected release'):copy.select}: ${release.title}`} aria-current={index===current?'true':undefined} onClick={()=>select(release)}>
      <span className="carousel-tilt">{release.artwork&&<Image src={assetUrl(release.artwork)} alt="" fill sizes="(max-width:767px) 82vw, (max-height:760px) 420px, 580px" loading={near?'eager':'lazy'} fetchPriority={index===current?'high':'auto'} draggable={false}/>}</span>
     </button>
     <p className="carousel-side-title" aria-hidden="true" style={{opacity:Math.min(1,Math.abs(slot))}}><span>{String(index+1).padStart(2,'0')}</span>{release.title}</p>
    </div>;
   })}
  </div>
  <UtilityButton className="carousel-arrow music-previous" type="button" aria-label={copy.previous} onClick={()=>move(-1)}><UtilityGlyph kind="previous"/></UtilityButton>
  <UtilityButton className="carousel-arrow music-next" type="button" aria-label={copy.next} onClick={()=>move(1)}><UtilityGlyph kind="next"/></UtilityButton>
 </div>;
}
