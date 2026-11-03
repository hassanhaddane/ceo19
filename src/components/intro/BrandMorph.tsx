'use client';
import type { RefObject } from 'react';
import { assets, assetUrl } from '@/data/assets';
import { smooth, introFrame, introSettings, type IntroProfile } from './IntroController';

type Brands = { hkz: HTMLImageElement; ceo: HTMLImageElement };
let decoded: Promise<Brands> | undefined;
/** Two official marks; the CEO texture uses the inventoried 256px transparent derivative.
 * Replays reuse decoded images. No video or font gate. */
export function loadBrands(): Promise<Brands> {
 if (!decoded) {
  const load = (path: string) => new Promise<HTMLImageElement>((resolve, reject) => {
   const image = new Image(); image.decoding = 'async';
   image.onload = () => { image.onload = image.onerror = null; resolve(image); };
   image.onerror = () => { image.onload = image.onerror = null; reject(new Error('Brand artwork unavailable')); };
   image.src = assetUrl(path);
  });
  decoded = Promise.all([load(assets.productionLogo), load(assets.introLogo)]).then(([hkz, ceo]) => ({ hkz, ceo })).catch(error => { decoded = undefined; throw error; });
 }
 return decoded;
}
export function BrandMorph({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
 return <canvas ref={canvasRef} className="intro-brand-canvas" aria-hidden="true" />;
}
/** Derived alpha masks exist only in memory; original source files are never modified. */
function texture(image: HTMLImageElement, inkOnWhite: boolean) {
 const size = introSettings.textureSize, canvas = document.createElement('canvas');
 canvas.width = canvas.height = size;
 const context = canvas.getContext('2d', { willReadFrequently: true });
 if (!context) throw new Error('Canvas unavailable');
 context.drawImage(image, 0, 0, size, size);
 const pixels = context.getImageData(0, 0, size, size);
 if (inkOnWhite) {
  for (let i = 0; i < pixels.data.length; i += 4) {
   const ink = 1 - (pixels.data[i] * .2126 + pixels.data[i + 1] * .7152 + pixels.data[i + 2] * .0722) / 255;
   pixels.data[i + 3] *= ink; pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = 244;
  }
  context.putImageData(pixels, 0, 0);
 }
 const points: { x: number; y: number }[] = [];
 for (let y = 0; y < size; y += 2) for (let x = 0; x < size; x += 2) {
  if (pixels.data[(y * size + x) * 4 + 3] > 100) points.push({ x: x / size - .5, y: y / size - .5 });
 }
 if (!points.length) throw new Error('Empty brand mask');
 return { canvas, points };
}
/** Transparent presentation of the actual black-on-white HKZ file; no asset replacement. */
export function drawHkzMark(canvas: HTMLCanvasElement, image: HTMLImageElement) {
 const mark = texture(image, true);
 canvas.width = canvas.height = introSettings.textureSize;
 canvas.getContext('2d')?.drawImage(mark.canvas, 0, 0);
 mark.canvas.width = mark.canvas.height = 1;
}
const seed = (index: number) => { const n = Math.sin(index * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); };

/** Actual image tiles fragment into a bounded mask-particle flow and reassemble.
 * One Canvas2D surface, no WebGL context, no React state updates per frame. */
export function createBrandMorph(canvas: HTMLCanvasElement, brands: Brands, profile: IntroProfile, origin?: { x: number; y: number; size: number }) {
 const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas unavailable');
 const source = texture(brands.hkz, true), target = texture(brands.ceo, false);
 const particles = Array.from({ length: profile.density }, (_, i) => ({
  from: source.points[Math.floor(seed(i + 1) * source.points.length)],
  to: target.points[Math.floor(seed(i + 8021) * target.points.length)],
  x: (seed(i + 2001) - .5) * 2, y: (seed(i + 5001) - .5) * 1.3,
  z: seed(i + 3001), size: .7 + seed(i + 4001) * 1.2,
 }));
 let width = 0, height = 0, logoSize = 0, disposed = false;
 const resize = () => {
  width = canvas.clientWidth; height = canvas.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, introSettings.maxDpr);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  logoSize = Math.min(introSettings.maxLogoSize, Math.min(width, height) * introSettings.logoViewportRatio);
 };
 resize();
 const image = (art: HTMLCanvasElement, opacity: number, scale = 1, lean = 0, anchor = { x: width / 2, y: height / 2 }) => {
  if (opacity <= 0) return;
  context.save(); context.globalAlpha = opacity; context.translate(anchor.x, anchor.y);
  context.transform(scale, lean, -lean * .2, scale, 0, 0);
  context.drawImage(art, -logoSize / 2, -logoSize / 2, logoSize, logoSize); context.restore();
 };
 const slices = (art: HTMLCanvasElement, amount: number, incoming: boolean) => {
  const count = profile.slices, cell = introSettings.textureSize / count, unit = logoSize / count;
  for (let row = 0; row < count; row++) for (let column = 0; column < count; column++) {
   const index = row * count + column, stagger = seed(index + 9) * .12;
   const travel = incoming ? 1 - smooth(.4 + stagger, 1, amount) : smooth(stagger, .68, amount);
   const opacity = incoming ? smooth(.4, .72, amount) : 1 - smooth(.17, .58, amount);
   if (opacity <= 0) continue;
   const angle = (seed(index + 83) - .5) * travel * 1.8;
   const depth = 1 + travel * seed(index + 150) * profile.depth / 280;
   const x = (column + .5 - count / 2) * unit, y = (row + .5 - count / 2) * unit;
   context.save(); context.globalAlpha = opacity; context.translate(width / 2 + x * depth + travel * (seed(index + 31) - .5) * profile.depth, height / 2 + y * depth - travel * seed(index + 81) * profile.depth * .45);
   context.rotate(angle); context.scale(Math.max(.12, 1 - travel * .8), 1 - travel * .3);
   context.drawImage(art, column * cell, row * cell, cell, cell, -unit / 2, -unit / 2, unit + .3, unit + .3); context.restore();
  }
 };
 return {
  draw(progress: number) {
   if (disposed) return;
   if (width !== canvas.clientWidth || height !== canvas.clientHeight) resize();
   const frame = introFrame(progress), m = frame.morph;
   context.clearRect(0, 0, width, height);
   if (profile.reduced) {
    // The access mode is deliberately a short, static logo handoff, with no depth/particles.
    const handoff = smooth(.3, .65, progress);
    image(source.canvas, (1 - handoff) * smooth(0, .15, progress));
    image(target.canvas, handoff * (1 - frame.exit)); return;
   }
   if (m === 0) {
    const r = frame.reveal, start = origin ?? { x: width / 2, y: height / 2, size: logoSize };
    image(source.canvas, 1, start.size / logoSize * (1 - r) + r, Math.sin(progress * 5) * .003,
     { x: start.x * (1 - r) + width / 2 * r, y: start.y * (1 - r) + height / 2 * r }); return;
   }
   if (m === 1) { image(target.canvas, 1 - smooth(0, .7, frame.exit), 1 + frame.exit * .12); return; }
   slices(source.canvas, m, false); slices(target.canvas, m, true);
   const arc = Math.sin(m * Math.PI), opacity = smooth(0, .15, m) * (1 - smooth(.8, 1, m));
   context.globalAlpha = opacity;
   for (const particle of particles) {
    const depth = 1 + arc * particle.z * profile.depth / 300;
    const x = ((particle.from.x * (1 - m) + particle.to.x * m) * logoSize + particle.x * arc * profile.depth * .65) * depth;
    const y = ((particle.from.y * (1 - m) + particle.to.y * m) * logoSize + particle.y * arc * profile.depth * .4) * depth;
    const size = particle.size * (1 + arc * particle.z);
    context.fillStyle = particle.z > .7 ? introSettings.color.blue : introSettings.color.cream;
    context.fillRect(width / 2 + x, height / 2 + y, size, size);
   }
   context.globalAlpha = 1;
  },
  dispose() { disposed = true; context.clearRect(0, 0, width, height); canvas.width = canvas.height = 1; source.canvas.width = target.canvas.width = 1; },
 };
}
