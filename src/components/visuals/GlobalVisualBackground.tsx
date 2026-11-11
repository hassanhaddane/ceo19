'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { assets, assetUrl } from '@/data/assets';
import { useSceneState } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import { attachBackgroundPlayback } from '@/lib/backgroundPlayback';
import { backgroundPresentation, visualEffects } from '@/lib/visualEffects';

/** One decoder in the persistent locale layout. Covered scenes pause without replacing its element or source. */
export function VideoBackground({ intro }: { intro: boolean }) {
 const video = useRef<HTMLVideoElement>(null);
 const motion = useSignalMotion();
 const { active: scene, menuOpen } = useSceneState();
 // Covered scenes keep the same element, source and playhead, without decoding
 // an invisible background behind an explicitly opened music provider.
 const suspended = intro || (!menuOpen && scene !== 'home');
 const [playing, setPlaying] = useState(false);
 useEffect(() => {
  const media = video.current;
  if (!media) return;
  if (!motion) {
   if (media.hasAttribute('src')) {
    media.removeAttribute('src');
    media.load();
   }
   return;
  }
  if (suspended && !media.hasAttribute('src')) return;
  if (!media.hasAttribute('src')) media.src = assetUrl(assets.backgroundVideo);
  return attachBackgroundPlayback(media, { enabled: true, suspended, onPlaying: setPlaying });
 }, [motion, suspended]);
 const active = intro ? 'intro' : menuOpen ? 'menu' : scene;
 const presentation = backgroundPresentation[active];
 const style = {
  '--background-opacity': presentation.opacity,
  '--background-overlay': presentation.overlay,
  '--background-scale': motion ? presentation.scale : 1,
  '--background-saturation': presentation.saturation,
  '--background-duration': `${visualEffects.background.duration}ms`,
  backgroundImage: `url("${assetUrl(assets.videoPoster)}")`,
 } as CSSProperties;
 return <div className="global-visual-background" data-scene={active} style={style} aria-hidden="true">
  <video ref={video} muted loop playsInline controls={false} preload="none" tabIndex={-1} disablePictureInPicture data-playing={playing && motion} />
  <div className="global-visual-shade" />
 </div>;
}
