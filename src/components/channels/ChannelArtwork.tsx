import Image from 'next/image';
import type {Locale,Release} from '@/types/content';
export function ChannelArtwork({release,locale,pending}:{release:Release;locale:Locale;pending:string}){
 const mode=release.visualMode;
 return <>
  {release.artwork&&<div className="channel-to-archive" aria-hidden="true"><span><Image src={release.artwork} alt="" fill sizes="(max-width:767px) 82vw, 42vw"/></span><span><Image src={release.artwork} alt="" fill sizes="(max-width:767px) 82vw, 42vw"/></span></div>}
  {release.sceneImage&&<figure className="channel-scene-photo"><Image src={release.sceneImage.src} alt={release.sceneImage.alt[locale]} fill sizes="(max-width:767px) 65vw, 30vw" style={{objectPosition:release.sceneImage.crop}} draggable={false}/></figure>}
  <div className="channel-material" aria-hidden="true"><i/><i/><i/></div>
  <figure className="deck-artwork">{release.artwork?<><Image src={release.artwork} loading="eager" alt={`${release.title} — CEO 1.9`} fill sizes="(max-width:767px) 82vw, (max-width:1024px) 40vw, 42vw" draggable={false}/>{mode==='dual'&&<span className="channel-dual-echo" aria-hidden="true"><Image src={release.artwork} loading="eager" alt="" fill sizes="(max-width:767px) 82vw, 42vw" draggable={false}/></span>}</>:<figcaption>{pending}</figcaption>}
  <div className="channel-surface" aria-hidden="true"/>
  </figure>
  {mode==='interrupted'&&<span className="channel-offline metadata" aria-hidden="true">OFFLINE <i/><i/><i/></span>}
 </>;
}
