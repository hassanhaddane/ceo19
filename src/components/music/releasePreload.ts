'use client';
import { getImageProps } from 'next/image';
import { assetUrl } from '@/data/assets';
import { releaseWorld } from '@/data/releaseWorlds';

/** Same optimized srcset/sizes as the visible planes; never request the raw large photo.
 * Only adjacent worlds are warmed. Covers use their existing eager/lazy Image policy. */
const warmed = new Map<string, Promise<void>>();
export function preloadReleaseBackground(releaseId: string) {
 const world = releaseWorld(releaseId);
 return Promise.all([
  [world.backgroundAsset, '100vw'],
  [world.backgroundGraphic, '(max-width:767px) 100vw, 70vw'],
 ].map(([source, sizes]) => {
  const { props } = getImageProps({ src:assetUrl(source), alt:'', fill:true, sizes });
  const key = `${props.srcSet}:${sizes}`;
  const existing = warmed.get(key); if (existing) return existing;
  const image = new window.Image();
  image.sizes = sizes; image.srcset = props.srcSet ?? ''; image.src = props.src;
  const ready = image.decode().catch(() => { warmed.delete(key); });
  warmed.set(key, ready); return ready;
 }));
}
