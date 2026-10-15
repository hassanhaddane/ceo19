'use client';
import { useEffect, useRef } from 'react';
import { useSignalMotion } from '@/lib/signalMotion';
import { visualEffects } from '@/lib/visualEffects';

let sprites: HTMLCanvasElement[] | undefined;
const smooth = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
const noise = (x: number, y: number, seed: number) => {
 const hash = (a: number, b: number) => { const n = Math.sin(a * 127.1 + b * 311.7 + seed * 19.3) * 43758.5453; return n - Math.floor(n); };
 const ix = Math.floor(x), iy = Math.floor(y), fx = smooth(x - ix), fy = smooth(y - iy);
 return (hash(ix, iy) * (1 - fx) + hash(ix + 1, iy) * fx) * (1 - fy) + (hash(ix, iy + 1) * (1 - fx) + hash(ix + 1, iy + 1) * fx) * fy;
};
/** Small cached noise sprites, never a full-screen blur or a continuously running shader. */
function smokeSprites() {
 if (sprites) return sprites;
 sprites = Array.from({ length: 3 }, (_, seed) => {
  const canvas = document.createElement('canvas'), size = visualEffects.smoke.spriteSize;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const pixels = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
   const distance = Math.hypot((x - size / 2) / (size / 2), (y - size / 2) / (size / 2));
   const n = noise(x / 25, y / 25, seed) * .6 + noise(x / 11, y / 11, seed) * .28 + noise(x / 5, y / 5, seed) * .12;
   const i = (y * size + x) * 4;
   pixels.data[i] = 181 + n * 60; pixels.data[i + 1] = 191 + n * 48; pixels.data[i + 2] = 202 + n * 30;
   pixels.data[i + 3] = Math.pow(Math.max(0, 1 - distance), 1.25) * (.18 + n * .82) * 210;
  }
  ctx.putImageData(pixels, 0, 0);
  return canvas;
 });
 return sprites;
}

/** A bounded burst. Increment trigger on a deliberate interaction; zero is idle. */
export function SmokeBurst({ trigger, variant = 'intro' }: { trigger: number; variant?: 'intro' | 'music' }) {
 const canvas = useRef<HTMLCanvasElement>(null), motion = useSignalMotion();
 useEffect(() => {
  const surface = canvas.current;
  if (!surface || !trigger || !motion) return;
  const ctx = surface.getContext('2d');
  if (!ctx) return;
  const rect = surface.getBoundingClientRect();
  const resolution = Math.min(1, visualEffects.smoke.maxWidth / rect.width, visualEffects.smoke.maxHeight / rect.height);
  const width = surface.width = Math.max(1, Math.round(rect.width * resolution));
  const height = surface.height = Math.max(1, Math.round(rect.height * resolution));
  const textures = smokeSprites();
  const intro = variant === 'intro';
  const duration = intro ? visualEffects.entry.duration - visualEffects.entry.smokeAt : visualEffects.smoke.musicDuration;
  const start = performance.now() + (intro ? visualEffects.entry.smokeAt : 0);
  let frame = 0;
  const draw = (now: number) => {
   const p = (now - start) / duration;
   ctx.clearRect(0, 0, width, height);
   if (p >= 1) { surface.dataset.active = 'false'; return; }
   surface.dataset.active = 'true';
   if (p >= 0) {
    const expand = smooth(p / .42), curtain = smooth((p - .48) / .52);
    const count = intro ? visualEffects.smoke.particles : 20;
    for (let i = 0; i < count; i++) {
     const seed = i * 2.39996, side = i % 2 ? 1 : -1;
     const spreadX = Math.sin(seed) * width * .63, spreadY = Math.cos(seed * 1.7) * height * .58;
     const x = width * .5 + spreadX * expand + side * width * curtain * .86 + Math.sin(p * 5 + seed) * width * .055;
     const y = height * (intro ? .7 - expand * .2 : .5) + spreadY * expand - p * height * .13;
     const size = Math.max(width, height) * (.42 + (i % 5) * .055) * (.15 + expand * .85);
     ctx.globalAlpha = smooth(p / .15) * (1 - smooth((p - .58) / .42)) * (intro ? .85 : .4);
     ctx.save(); ctx.translate(x, y); ctx.rotate(seed + p * side * .45);
     ctx.drawImage(textures[i % textures.length], -size / 2, -size / 2, size, size); ctx.restore();
    }
   }
   frame = requestAnimationFrame(draw);
  };
  const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden) frame = requestAnimationFrame(draw); };
  if (!document.hidden) frame = requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', visibility);
  return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', visibility); ctx.clearRect(0, 0, width, height); surface.dataset.active = 'false'; };
 }, [trigger, variant, motion]);
 return <canvas ref={canvas} className={`smoke-burst smoke-burst--${variant}`} aria-hidden="true" />;
}
