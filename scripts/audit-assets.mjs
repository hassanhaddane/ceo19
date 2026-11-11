import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { publicAssets, assets } from '../src/data/assets.ts';

// Read-only source audit. Writes only the generated report, never original media.
const root = new URL('../public/', import.meta.url);
const walk = async (directory, prefix = '') => {
 const result = [];
 for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
  if (entry.name.startsWith('.')) continue;
  const path = `${prefix}${entry.name}`;
  if (entry.isDirectory()) result.push(...await walk(new URL(`${encodeURIComponent(entry.name)}/`, directory), `${path}/`));
  else if (entry.isFile()) result.push(path);
 }
 return result.sort();
};
function boxes(buffer, start = 0, end = buffer.length) {
 const result = [];
 for (let offset = start; offset + 8 <= end;) {
  let size = buffer.readUInt32BE(offset), header = 8;
  if (size === 1) { size = Number(buffer.readBigUInt64BE(offset + 8)); header = 16; }
  if (size === 0) size = end - offset;
  if (size < header || offset + size > end) break;
  result.push({ type: buffer.toString('ascii', offset + 4, offset + 8), start: offset + header, end: offset + size }); offset += size;
 }
 return result;
}
function videoMetadata(buffer) {
 const moov = boxes(buffer).find(box => box.type === 'moov');
 if (!moov) return null;
 const tracks = boxes(buffer, moov.start, moov.end).filter(box => box.type === 'trak').map(track => {
  const mdia = boxes(buffer, track.start, track.end).find(box => box.type === 'mdia');
  if (!mdia) return null;
  const children = boxes(buffer, mdia.start, mdia.end), header = children.find(box => box.type === 'mdhd'), handler = children.find(box => box.type === 'hdlr');
  if (!header || !handler) return null;
  const version = buffer[header.start], timeOffset = header.start + (version === 1 ? 20 : 12), scale = buffer.readUInt32BE(timeOffset);
  const duration = version === 1 ? Number(buffer.readBigUInt64BE(timeOffset + 4)) : buffer.readUInt32BE(timeOffset + 4);
  return { kind: buffer.toString('ascii', handler.start + 8, handler.start + 12), durationSeconds: scale ? duration / scale : null };
 }).filter(Boolean);
 return { tracks, fastStart: moov.start < (boxes(buffer).find(box => box.type === 'mdat')?.start ?? Infinity) };
}
const inventory = [];
const pending = new Map(publicAssets.map(asset => [asset.path, asset]));
if (pending.size !== publicAssets.length) throw new Error('Duplicate public asset path');
for (const path of await walk(root)) {
 const bytes = await fs.readFile(new URL(path.split('/').map(encodeURIComponent).join('/'), root));
 const known = pending.get(`/${path}`);
 if (!known) throw new Error(`Unclassified public asset: ${path}`);
 pending.delete(known.path);
 if (known.bytes !== bytes.length) throw new Error(`Stale byte count: ${path}`);
 const metadata = known.kind === 'image' ? await sharp(bytes).metadata() : null;
 inventory.push({ path: `/${path}`, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), role: known.role, kind: known.kind, dimensions: metadata ? { width: metadata.autoOrient?.width ?? metadata.width, height: metadata.autoOrient?.height ?? metadata.height, format: metadata.format, alpha: metadata.hasAlpha } : null, ...(known.kind === 'video' ? { video: videoMetadata(bytes) } : {}) });
}
if (pending.size) throw new Error(`Missing classified assets: ${[...pending.keys()].join(', ')}`);
const roi = { left: 150, top: 100, width: 550, height: 600 };
const sample = await sharp(await fs.readFile(new URL(`../public${assets.blueReference}`, import.meta.url))).extract(roi).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const channels = [[], [], []];
for (let i = 0; i < sample.data.length; i += sample.info.channels) {
 const [r, g, b] = sample.data.subarray(i, i + 3);
 if (b > 1.25 * r && b > 1.1 * g && g > 40) { channels[0].push(r); channels[1].push(g); channels[2].push(b); }
}
if (!channels[0].length) throw new Error('No blue pixels in the supplied reference ROI');
const medianRGB = channels.map(channel => channel.sort((a, b) => a - b)[Math.floor(channel.length / 2)]);
const hex = `#${medianRGB.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
const report = { version: 5, sourcePolicy: 'Exact filenames; original files untouched; SHA-256 verifies provenance.', roles: assets, blueSample: { path: assets.blueReference, roi, filter: 'B > 1.25R, B > 1.1G, G > 40', sampledPixels: channels[0].length, medianRGB, hex }, missing: [...(!assets.documentaryVideo ? ['CEO DOCCCCC.mp4'] : []), ...(!assets.neighborhoodMap ? ['Approved aerial neighborhood map'] : []), 'LOGO CEO OFFICIEL.jpg (optional fallback)'], inventory };
await fs.writeFile(new URL('../docs/V5-ASSETS.json', import.meta.url), `${JSON.stringify(report, null, 2)}\n`);
console.log(`${inventory.length} files audited, ${publicAssets.length} classified content assets; originals unchanged.`);
