import { ExtrudeGeometry, Float32BufferAttribute, Path, Shape, ShapeUtils, Vector2 } from 'three';
import contours from './logoContours.json' with { type: 'json' };

export const logoSpan = 4;
const aspect = contours.size[0] / contours.size[1];

function ringPoints(ring: number[], x: number, y: number, clockwise: boolean) {
 const points = [];
 for (let index = 0; index < ring.length; index += 2) {
  points.push(new Vector2((ring[index] - x) * logoSpan * aspect, (y - ring[index + 1]) * logoSpan));
 }
 return ShapeUtils.isClockWise(points) === clockwise ? points : points.reverse();
}

export function buildEntityShards() {
 return contours.shards.map(({ center: [x, y], shapes }, shard) => {
  const outlines = shapes.map(([outer, ...holes]) => {
   const shape = new Shape(ringPoints(outer, x, y, true));
   shape.holes = holes.map(hole => new Path(ringPoints(hole, x, y, false)));
   return shape;
  });
  const geometry = new ExtrudeGeometry(outlines, {
   depth: .19, bevelEnabled: true, bevelThickness: .014, bevelSize: .009, bevelSegments: 1, steps: 1,
  });
  geometry.translate(0, 0, -.095);
  const positions = geometry.getAttribute('position');
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const uv = new Float32Array(positions.count * 2);
  const print = new Float32Array(positions.count * 3);
  for (let index = 0; index < positions.count; index++) {
   uv[index * 2] = x + positions.getX(index) / (logoSpan * aspect);
   uv[index * 2 + 1] = 1 - y + positions.getY(index) / logoSpan;
   print[index * 3] = (positions.getX(index) - box.min.x) / (box.max.x - box.min.x);
   print[index * 3 + 1] = (positions.getY(index) - box.min.y) / (box.max.y - box.min.y);
   print[index * 3 + 2] = shard % 4;
  }
  geometry.setAttribute('logoUv', new Float32BufferAttribute(uv, 2));
  geometry.setAttribute('printUv', new Float32BufferAttribute(print, 3));
  return { geometry, x: (x - .5) * logoSpan * aspect, y: (.5 - y) * logoSpan };
 });
}


/** The portal's frame repeats the brim and the briefcase's staggered perimeter. */
export function buildPortalFrame() {
 const plates = [
  [[-2.75, -1.77], [-2.72, .15], [-2.53, .19], [-2.62, 1.05], [-2.28, 1.71], [-1.09, 2.03],
   [-1.18, 1.91], [-2.20, 1.61], [-2.51, 1.01], [-2.43, .12], [-2.63, .07], [-2.65, -1.71]],
  [[-.8, 2.04], [.81, 2.05], [1.04, 1.97], [1.94, 1.97], [2.42, 1.53], [2.44, 1.42], [1.89, 1.86],
   [1.02, 1.86], [.77, 1.95], [-.72, 1.94]],
  [[2.59, 1.29], [2.69, .47], [2.56, .42], [2.72, -.22], [2.66, -1.38], [2.32, -1.77],
   [2.20, -1.80], [2.55, -1.32], [2.61, -.22], [2.44, .45], [2.57, .55], [2.50, 1.22]],
  [[2.04, -1.91], [.73, -2.07], [.48, -1.97], [-.43, -2.06], [-1.62, -1.92], [-2.21, -1.78],
   [-2.14, -1.88], [-1.61, -2.02], [-.39, -2.16], [.47, -2.08], [.71, -2.17], [1.97, -2.02]],
 ];
 return new ExtrudeGeometry(plates.map(plate => new Shape(plate.map(([x, y]) => new Vector2(x, y)))),
  { depth: .065, bevelEnabled: false });
}
