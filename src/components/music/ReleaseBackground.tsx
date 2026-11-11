import Image from 'next/image';
import type { CSSProperties } from 'react';
import { assetUrl } from '@/data/assets';
import type { ReleaseWorldConfig } from '@/data/releaseWorlds';

/** Decorative planes only. The shared parallax scheduler never moves the controls.
 * Nested image crops keep motion transforms independent from source framing. */
export function ReleaseBackground({ world }: { world: ReleaseWorldConfig }) {
 const style = {
  '--release-background-position':world.backgroundPosition,
  '--release-background-scale':world.backgroundScale,
  '--release-background-overlay':world.backgroundOverlay,
  '--release-background-gradient':world.backgroundGradient,
  '--release-graphic-position':world.backgroundGraphicPosition,
  '--world-image-period':`${world.ambient.imagePeriod}s`, '--world-detail-period':`${world.ambient.detailPeriod}s`,
 } as CSSProperties;
 return <div key={world.releaseId} className="release-environment" data-effects={world.backgroundEffects} style={style} aria-hidden="true">
  <div className="release-background-plane" data-parallax={world.backgroundParallax}>
   <div className="release-background-crop"><Image className="release-ambient-image" src={assetUrl(world.backgroundAsset)} alt="" fill sizes="100vw" draggable={false} loading="eager" /></div>
  </div>
  <div className="release-background-overlay" />
  <div className="release-graphic-plane" data-parallax={world.backgroundParallax==='detail'?'atmosphere':'detail'}>
   <div className="release-graphic-crop"><Image className="release-ambient-detail" src={assetUrl(world.backgroundGraphic)} alt="" fill sizes="(max-width:767px) 100vw, 70vw" draggable={false} loading="eager" /></div>
  </div>
  <div className="release-atmosphere" />
  <div className="release-graphic-texture" />
  <div className="release-grain" />
 </div>;
}
