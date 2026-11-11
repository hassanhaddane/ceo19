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
export function drawHkzMark(canvas: HTMLCanvasElement, image: HTMLImageElement) {
 const mark = texture(image, true);
 const context = canvas.getContext('2d');
 if (context) context.drawImage(mark.canvas, 0, 0, canvas.width, canvas.height);
 mark.canvas.width = mark.canvas.height = 1;
 return !!context;
}
const seed = (index: number) => { const n = Math.sin(index * 127.1 + 31.7) * 43758.5453; return n - Math.floor(n); };

type Placement = { x: number; y: number; size: number };

/** Raster shards travel in perspective before the source silhouette is restored. */
export function createBrandMorph(canvas: HTMLCanvasElement, brands: Brands, profile: IntroProfile,
 origin?: Placement, destination?: () => Placement | undefined) {
 const context = canvas.getContext('2d');
 if (!context) throw new Error('Canvas unavailable');
 const source = texture(brands.hkz, true), target = texture(brands.ceo, false);
 const count = profile.slices, cell = introSettings.textureSize / count;
 const shards = Array.from({ length: count * count }, (_, index) => {
  const row = Math.floor(index / count), column = index % count;
  return {
   row, column, stagger: seed(index + 9) * .14,
   x: column + .5 - count / 2, y: row + .5 - count / 2,
   angle: (seed(index + 83) - .5) * 2.1,
   depth: .35 + seed(index + 150) * .65,
   sweep: (seed(index + 31) - .35) * 1.2,
  };
 });
 const particles = Array.from({ length: profile.density }, (_, index) => ({
  from: source.points[Math.floor(seed(index + 1) * source.points.length)],
  to: target.points[Math.floor(seed(index + 8021) * target.points.length)],
  x: seed(index + 2001) - .5, y: seed(index + 5001) - .5,
  z: seed(index + 3001), size: .55 + seed(index + 4001) * 1.6,
 })).sort((a, b) => a.z - b.z);
 const particleSplit = particles.findIndex(particle => particle.z > .56);
 let width = 0, height = 0, logoSize = 0, disposed = false, landing: Placement | undefined;
 const resize = () => {
  width = canvas.clientWidth; height = canvas.clientHeight;
  const dpr = Math.min(devicePixelRatio || 1, profile.slices <= 7 ? 1.15 : introSettings.maxDpr);
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  logoSize = Math.min(introSettings.maxLogoSize, Math.min(width, height) * introSettings.logoViewportRatio);
  landing = destination?.();
 };
 resize();
 const observer = new ResizeObserver(resize);
 observer.observe(canvas);
 const image = (art: HTMLCanvasElement, at: Placement, opacity: number) => {
  if (opacity <= 0) return;
  context.globalAlpha = opacity;
  context.drawImage(art, at.x - at.size / 2, at.y - at.size / 2, at.size, at.size);
  context.globalAlpha = 1;
 };
 const mix = (from: Placement, to: Placement, progress: number): Placement => ({
  x: from.x + (to.x - from.x) * progress,
  y: from.y + (to.y - from.y) * progress,
  size: from.size + (to.size - from.size) * progress,
 });
 const project = (z: number) => 650 / (650 - z);
 const slices = (art: HTMLCanvasElement, amount: number, incoming: boolean, center: Placement) => {
  const unit = center.size / count;
  const opacity = incoming ? smooth(.16, .55, amount) * (1 - smooth(.94, 1, amount)) : 1 - smooth(.22, .69, amount);
  if (opacity <= 0) return;
  for (const shard of shards) {
   const travel = incoming ? 1 - smooth(.11 + shard.stagger, .94, amount) : smooth(shard.stagger, .67, amount);
   const z = profile.depth * shard.depth * travel * (incoming ? -1 : 1);
   const lens = project(z);
   const x = (shard.x * unit + shard.sweep * travel * profile.depth) * lens;
   const y = (shard.y * unit - travel * (shard.depth - .38) * profile.depth) * lens;
   context.save();
   context.globalAlpha = opacity;
   context.translate(center.x + x, center.y + y);
   context.rotate(shard.angle * travel);
   context.transform(lens * (1 - travel * .65), travel * .24, travel * -.28, lens, 0, 0);
   context.drawImage(art, shard.column * cell, shard.row * cell, cell, cell, -unit / 2, -unit / 2, unit + .25, unit + .25);
   context.restore();
  }
 };
 return {
  draw(progress: number) {
   if (disposed) return;
   context.clearRect(0, 0, width, height);
   const { morph, exit, reveal } = introFrame(progress);
   const center = { x: width / 2, y: height * .46, size: logoSize };
   if (morph === 0) { image(source.canvas, mix(origin ?? center, center, reveal), 1); return; }
   if (morph === 1) {
    const at = mix(center, landing ?? center, smooth(0, .92, exit));
    image(target.canvas, at, 1 - smooth(.68, 1, exit));
    return;
   }
   slices(source.canvas, morph, false, center);
   slices(target.canvas, morph, true, center);
   const assembly = smooth(.8, 1, morph);
   image(target.canvas, center, assembly);
   const arc = Math.sin(morph * Math.PI);
   context.globalCompositeOperation = 'screen';
   context.globalAlpha = smooth(0, .16, morph) * (1 - assembly) * .84;
   for (const [index, particle] of particles.entries()) {
    if (index === 0 || index === particleSplit) context.fillStyle = index === 0 ? '#edf5ff' : '#76b9ef';
    const lens = project(arc * particle.z * profile.depth);
    const x = ((particle.from.x * (1 - morph) + particle.to.x * morph) * logoSize + particle.x * arc * profile.depth) * lens;
    const y = ((particle.from.y * (1 - morph) + particle.to.y * morph) * logoSize + particle.y * arc * profile.depth * .55) * lens;
    const size = particle.size * lens;
    context.fillRect(center.x + x, center.y + y, size * (1 + arc * particle.z * 1.7), size);
   }
   context.globalAlpha = 1;
   context.globalCompositeOperation = 'source-over';
  },
  dispose() {
   if (disposed) return;
   disposed = true;
   observer.disconnect();
   context.clearRect(0, 0, width, height);
   canvas.width = canvas.height = source.canvas.width = source.canvas.height = target.canvas.width = target.canvas.height = 1;
  },
 };
}
