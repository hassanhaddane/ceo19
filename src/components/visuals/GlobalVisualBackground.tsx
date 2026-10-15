'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { assets, assetUrl } from '@/data/assets';
import { useSceneState } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import { attachBackgroundPlayback } from '@/lib/backgroundPlayback';
import { animationError, animationStatus, registerAnimationProbe } from '@/lib/animationDiagnostics';
import { backgroundPresentation, visualEffects } from '@/lib/visualEffects';

/** One decoder in the persistent locale layout. Scene changes only update presentation. */
export function GlobalVisualBackground({ intro }: { intro: boolean }) {
 const video = useRef<HTMLVideoElement>(null);
 const motion = useSignalMotion();
 const { active: scene, menuOpen } = useSceneState();
 const [playing, setPlaying] = useState(false);
 useEffect(() => {
  const media = video.current;
  if (!media) return;
  const unregister = registerAnimationProbe('video', () => ({
   count: document.querySelectorAll('.global-visual-background video').length,
   src: media.currentSrc, readyState: media.readyState, paused: media.paused,
   muted: media.muted, currentTime: media.currentTime, error: media.error?.code ?? null,
  }));
  const dispose = attachBackgroundPlayback(media, {
   enabled: motion, onPlaying: setPlaying,
   onStatus: (state, detail) => animationStatus('video', state, detail),
   onError: error => animationError('background playback', error),
  });
  return () => { dispose(); unregister(); };
 }, [motion]);
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
 return <div className="global-visual-background" data-scene={active} data-parallax="video" style={style} aria-hidden="true">
  <video ref={video} src={motion ? assetUrl(assets.backgroundVideo) : undefined} poster={assetUrl(assets.videoPoster)} autoPlay muted loop playsInline controls={false} preload={motion ? 'auto' : 'none'} tabIndex={-1} disablePictureInPicture data-playing={playing && motion} />
  <div className="global-visual-shade" />
 </div>;
}
