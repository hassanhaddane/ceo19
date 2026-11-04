'use client';
import { useEffect, useRef } from 'react';
import { archiveClips } from '@/data/archiveClips';
import { assets, assetUrl } from '@/data/assets';
import { attachArchiveDocumentary } from '@/lib/archiveDocumentary';
import { useSceneState } from '@/lib/sceneNavigation';
import { useSignalMotion } from '@/lib/signalMotion';
import { useEntryExperience } from '@/components/visuals/VisualExperience';

/** Persistent two-slot stage; only the short dissolve overlaps playback. */
export function ArchiveDocumentary({ paused = false }: { paused?: boolean }) {
 const front = useRef<HTMLVideoElement>(null), back = useRef<HTMLVideoElement>(null), stage = useRef<HTMLDivElement>(null);
 const controller = useRef<ReturnType<typeof attachArchiveDocumentary> | null>(null);
 const pausedRef = useRef(paused);
 const { active, enabled, menuOpen } = useSceneState(), motion = useSignalMotion();
 const entered = useEntryExperience()?.entered ?? true;
 useEffect(() => { pausedRef.current = paused; controller.current?.setPaused(paused); }, [paused]);
 useEffect(() => {
  const first = front.current, second = back.current, layer = stage.current;
  if (!first || !second || !layer) return;
  if (!entered || !enabled || active !== 'archive' || menuOpen) { layer.dataset.state = 'hidden'; return; }
  if (!motion) { layer.dataset.state = 'poster'; return; }
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const economy = !!device.connection?.saveData || device.deviceMemory !== undefined && device.deviceMemory <= 2;
  const mobile = matchMedia('(max-width:767px)').matches;
  const playback = attachArchiveDocumentary([first, second], layer, archiveClips, { fade: economy ? 100 : mobile ? 350 : 550, preloadLead: economy ? 400 : mobile ? 1100 : 1500, loadTimeout: 8000, paused: pausedRef.current });
  controller.current = playback;
  return () => { playback.dispose(); controller.current = null; };
 }, [active, enabled, menuOpen, motion, entered]);
 return <div ref={stage} className="archive-documentary" data-state="poster" data-parallax="archiveFilm" style={{ backgroundImage: `url("${assetUrl(archiveClips[0]?.poster ?? assets.videoPoster)}")` }} aria-hidden="true">
  <video ref={front} muted playsInline preload="none" data-front="false" tabIndex={-1} disablePictureInPicture />
  <video ref={back} muted playsInline preload="none" data-front="false" tabIndex={-1} disablePictureInPicture />
  <div className="archive-film-treatment"/>
 </div>;
}
