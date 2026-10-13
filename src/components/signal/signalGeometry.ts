import { BufferAttribute, BufferGeometry, Float32BufferAttribute } from 'three';
import { signalConfig, type Quality } from './signalStates';

/** One UV surface, duplicated only at tile boundaries so archive patches can separate. */
export function createSignalGeometry(quality: Quality) {
 const { tilesX, tilesY, subdivisions: n } = signalConfig.quality[quality];
 const vertices = tilesX * tilesY * (n + 1) * (n + 1);
 const positions = new Float32Array(vertices * 3);
 const normals = new Float32Array(vertices * 3);
 const uvs = new Float32Array(vertices * 2);
 const tiles = new Float32Array(vertices * 2);
 const indices = new Uint16Array(tilesX * tilesY * n * n * 6);
 let vertex = 0, index = 0;
 for (let ty = 0; ty < tilesY; ty++) for (let tx = 0; tx < tilesX; tx++) {
  const start = vertex;
  for (let y = 0; y <= n; y++) for (let x = 0; x <= n; x++) {
   const u = (tx + x / n) / tilesX, v = (ty + y / n) / tilesY;
   positions[vertex * 3] = (u - 0.5) * 3.7; positions[vertex * 3 + 1] = (v - 0.5) * 3;
   normals[vertex * 3 + 2] = 1;
   uvs[vertex * 2] = u; uvs[vertex * 2 + 1] = v;
   tiles[vertex * 2] = (tx + 0.5) / tilesX; tiles[vertex * 2 + 1] = (ty + 0.5) / tilesY;
   vertex++;
  }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
   const a = start + y * (n + 1) + x, b = a + 1, c = a + n + 1, d = c + 1;
   indices[index++] = a; indices[index++] = b; indices[index++] = c;
   indices[index++] = b; indices[index++] = d; indices[index++] = c;
  }
 }
 const geometry = new BufferGeometry();
 geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
 geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
 geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
 geometry.setAttribute('signalTile', new Float32BufferAttribute(tiles, 2));
 geometry.setIndex(new BufferAttribute(indices, 1));
 return geometry;
}
