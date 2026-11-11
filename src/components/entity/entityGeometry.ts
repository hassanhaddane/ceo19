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
