"""Build the Logo Entity derivatives. Requires Pillow, NumPy, OpenCV and Shapely.

Pass a mono 22.05 kHz, 16-bit WAV decoded from public/CEO19/audio/Ceo 1.mp3.
On macOS: afconvert -f WAVE -d LEI16@22050 -c 1 "public/CEO19/audio/Ceo 1.mp3" /tmp/ceo19-radio.wav
The official images and audio are read only.
"""

import hashlib
import json
import sys
import wave
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageOps
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
MEDIA = PUBLIC / "media/entity"
DATA = ROOT / "src/components/entity"
WHITE = PUBLIC / "CEO19/Logo/LOGO CEO OFFICIEL Blanc.png"
DARK = PUBLIC / "CEO19/Logo/LOGO CEO OFFICIEL Noir.png"
TRACK = PUBLIC / "CEO19/audio/Ceo 1.mp3"

# Seeds follow the cap, eyes, wrists, briefcase and lettering of the original.
SEEDS = [
    (.47, .11), (.59, .16), (.37, .23), (.54, .29),
    (.25, .39), (.40, .40), (.59, .41), (.76, .50),
    (.28, .60), (.43, .60), (.58, .61), (.73, .69),
    (.20, .85), (.39, .88), (.59, .88), (.77, .86),
]
COVERS = ["ORIGINAL", "KRITIKA", "FANTASTIQUE", "TIMALS", "MACHI BATEL", "BCP D'ARGENT"]
PRINTS = ["live", "timals-duo", "fantastique-still", "bcp-backstage"]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def polygons(geometry):
    if geometry.geom_type == "Polygon":
        if not geometry.is_empty:
            yield geometry
    elif hasattr(geometry, "geoms"):
        for part in geometry.geoms:
            yield from polygons(part)


def partition(index):
    """Intersect the half-planes nearest to this seed inside the source frame."""
    seed = np.array(SEEDS[index])
    vertices = [np.array(p, dtype=float) for p in [(0, 0), (1, 0), (1, 1), (0, 1)]]
    for other_index, other in enumerate(SEEDS):
        if index == other_index:
            continue
        normal = np.array(other) - seed
        middle = (np.array(other) + seed) / 2
        clipped = []
        for a, b in zip(vertices, vertices[1:] + vertices[:1]):
            da, db = np.dot(a - middle, normal), np.dot(b - middle, normal)
            if da <= 0:
                clipped.append(a)
            if (da <= 0) != (db <= 0):
                clipped.append(a + (b - a) * da / (da - db))
        vertices = clipped
    return Polygon(vertices)


def contours():
    alpha = np.asarray(Image.open(WHITE).convert("RGBA"))[:, :, 3]
    height, width = alpha.shape
    mask = cv2.medianBlur(np.uint8(alpha >= 112) * 255, 3)
    rings, hierarchy = cv2.findContours(mask, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_SIMPLE)
    hierarchy = hierarchy[0]

    def loop(index):
        return [(float(x) / width, float(y) / height)
                for x, y in cv2.approxPolyDP(rings[index], .83, True)[:, 0, :]]

    shapes = []
    for index, info in enumerate(hierarchy):
        if info[3] != -1 or cv2.contourArea(rings[index]) < 24:
            continue
        outer = loop(index)
        if len(outer) < 3:
            continue
        holes = [loop(child) for child, record in enumerate(hierarchy)
                 if record[3] == index and cv2.contourArea(rings[child]) >= 14]
        shapes.extend(polygons(make_valid(Polygon(outer, [ring for ring in holes if len(ring) >= 3]))))
    silhouette = unary_union(shapes).intersection(box(0, 0, 1, 1))

    def flat(ring):
        return [round(value, 5) for point in list(ring.coords)[:-1] for value in point]

    shards = []
    for index in range(len(SEEDS)):
        pieces = [part for part in polygons(silhouette.intersection(partition(index))) if part.area > .000012]
        center = unary_union(pieces).centroid
        shards.append({"center": [round(center.x, 5), round(center.y, 5)],
                       "shapes": [[flat(part.exterior), *[flat(hole) for hole in part.interiors]] for part in pieces]})
    geometry = {"size": [width, height], "sources": [digest(WHITE), digest(DARK)], "shards": shards}
    (DATA / "logoContours.json").write_text(json.dumps(geometry, separators=(",", ":")) + "\n")


def atlas():
    size = 256
    image = Image.new("RGB", (4 * size, 3 * size), "#101928")
    paths = [PUBLIC / f"releases/{name}.png" for name in COVERS]
    paths += [PUBLIC / f"media/archive/{name}.webp" for name in PRINTS]
    for index, path in enumerate(paths):
        with Image.open(path) as source:
            tile = ImageOps.fit(source.convert("RGB"), (size, size), Image.Resampling.LANCZOS)
            image.paste(tile, (index % 4 * size, index // 4 * size))
    image.save(MEDIA / "imprints.webp", quality=81, method=6)


def envelope(path):
    with wave.open(str(path)) as source:
        assert source.getnchannels() == 1 and source.getsampwidth() == 2 and source.getframerate() == 22050
        rate = source.getframerate()
        pcm = np.frombuffer(source.readframes(source.getnframes()), dtype="<i2").astype(float) / 32768
    fps = 25
    block = rate // fps
    frames = np.pad(pcm, (0, (-len(pcm)) % block)).reshape(-1, block)
    spectrum = np.abs(np.fft.rfft(frames * np.hanning(block))) ** 2
    bands = np.fft.rfftfreq(block, 1 / rate)
    bass = np.sqrt(spectrum[:, (bands >= 40) & (bands <= 180)].sum(axis=1))
    reference = max(.01, np.percentile(bass, 96))
    levels = np.rint(np.clip(bass / reference, 0, 1) * 255).astype(int)
    data = {"fps": fps, "sha256": digest(TRACK), "samples": levels.tolist()}
    (DATA / "radioEnvelope.json").write_text(json.dumps(data, separators=(",", ":")) + "\n")


MEDIA.mkdir(exist_ok=True, parents=True)
contours()
atlas()
envelope(Path(sys.argv[1]))
