"""Trace the original front/back study atlases into a small closed relief mesh.

Run with Pillow, OpenCV, NumPy and Shapely >= 2.1.
"""
import json
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
from shapely import Polygon, constrained_delaunay_triangles
from shapely.geometry.polygon import orient

ROOT = Path(__file__).resolve().parents[1]
W, H = 100, 112


def trace(name):
    image = Image.open(ROOT / f"public/media/drop-lab/{name}-study.webp").convert("RGBA")
    w, h = image.size
    top, bottom = round(h * .07), round(h * .93)
    front, back = [np.asarray(image.crop((x, top, x + w // 2, bottom))
                               .getchannel("A").resize((W, H))) for x in (0, w // 2)]
    mask = cv2.medianBlur(np.uint8(np.maximum(front, np.fliplr(back)) > 95), 3)
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contour = cv2.approxPolyDP(max(contours, key=cv2.contourArea), .7, True)
    polygon = orient(Polygon(contour[:, 0, :]), sign=-1)
    distance = cv2.distanceTransform(mask, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    points, indices, lookup = [], [], {}

    def vertex(point):
        if point not in lookup:
            x, y = point
            d = max(0., float(distance[round(y), round(x)]) - 1.)
            lookup[point] = len(points) // 3
            points.extend((round((x + .5) / W, 5), round((y + .5) / H, 5),
                           round(.05 + (.34 if name == "hoodie" else .23) * (d / float(distance.max())) ** .6, 4)))
        return lookup[point]

    def mid(a, b):
        return ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)

    def face(a, b, c, level):
        if not level:
            indices.extend(map(vertex, (a, b, c)))
            return
        ab, bc, ca = mid(a, b), mid(b, c), mid(c, a)
        for triangle in ((a, ab, ca), (ab, b, bc), (ca, bc, c), (ab, bc, ca)):
            face(*triangle, level - 1)

    for triangle in constrained_delaunay_triangles(polygon).geoms:
        face(*list(orient(triangle, sign=-1).exterior.coords)[:3], 2)
    ring = list(polygon.exterior.coords)
    rim = [vertex((a[0] + (b[0] - a[0]) * t / 4, a[1] + (b[1] - a[1]) * t / 4))
           for a, b in zip(ring, ring[1:]) for t in range(4)]
    return dict(points=points, faces=indices, rim=rim)


path = ROOT / "src/features/shop/presentation/apparelShells.json"
path.write_text(json.dumps({name: trace(name) for name in ("hoodie", "tshirt")}, separators=(",", ":")) + "\n")
