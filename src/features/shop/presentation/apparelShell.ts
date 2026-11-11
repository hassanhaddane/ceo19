import { BufferGeometry, Float32BufferAttribute } from 'three';
import shells from './apparelShells.json' with { type: 'json' };

export const apparelWidth = 4.1;
export const apparelHeight = 4.7;

/** The source silhouettes share one UV grid; edge quads close each textile volume. */
export function createApparelShell(study: keyof typeof shells) {
 const { points, faces, rim } = shells[study];
 const count = points.length / 3, positions: number[] = [], uv: number[] = [];
 for (const side of [1, -1]) {
  for (let index = 0; index < points.length; index += 3) {
   const [u, v, relief] = points.slice(index, index + 3);
   positions.push((u - .5) * apparelWidth, (.5 - v) * apparelHeight, relief * side);
   uv.push(side === 1 ? u : 1 - u, 1 - v);
  }
 }
 const indices = [...faces];
 for (let index = 0; index < faces.length; index += 3) indices.push(faces[index] + count, faces[index + 2] + count, faces[index + 1] + count);
 for (let index = 0; index < rim.length; index++) {
  const a = rim[index], b = rim[(index + 1) % rim.length];
  indices.push(b, a, a + count, b, a + count, b + count);
 }
 const geometry = new BufferGeometry();
 geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
 geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
 geometry.setIndex(indices);
 geometry.addGroup(0, faces.length, 0);
 geometry.addGroup(faces.length, faces.length, 1);
 geometry.addGroup(faces.length * 2, rim.length * 6, 2);
 geometry.computeVertexNormals();
 return geometry;
}
