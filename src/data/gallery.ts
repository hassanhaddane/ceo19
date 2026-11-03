import type { ArchiveCategory, Localized } from '@/types/content';

export interface GalleryPhoto {
 id: string;
 asset: { source: string; path: string; width: number; height: number; sourceWidth: number; sourceHeight: number; sourceCrop?: { left:number; top:number; width:number; height:number } };
 slot:number; heightScale:number; y:number; shift:number; depth:number; roll:number;
 category:ArchiveCategory; caption:Localized; alt:Localized; focalPoint:{x:number;y:number};
}

/** Eight reviewed compositions. Originals and unused derivatives remain in public.
 * One large print per column, with varied scale, depth and restrained offsets. */
export const galleryManifest = [
  {
    "id": "show-3",
    "asset": {
      "source": "/CEO19/SHOW/CEO-3.jpg",
      "path": "/media/archive/show-3.webp",
      "width": 1200,
      "height": 1600,
      "sourceWidth": 5464,
      "sourceHeight": 7285
    },
    "heightScale": 0.84,
    "y": -0.035,
    "depth": -20,
    "roll": -0.7,
    "category": "live",
    "caption": {
      "en": "On stage",
      "fr": "Sur scène"
    },
    "alt": {
      "en": "CEO1.9 wearing a black tank top on a dark stage",
      "fr": "CEO1.9 en débardeur noir sur une scène sombre"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 0,
    "shift": 0
  },
  {
    "id": "portrait",
    "asset": {
      "source": "/CEO19/Original/portrait.webp",
      "path": "/media/archive/portrait.webp",
      "width": 1440,
      "height": 1440,
      "sourceWidth": 1440,
      "sourceHeight": 1440
    },
    "heightScale": 0.67,
    "y": 0.09,
    "depth": -180,
    "roll": 1.1,
    "category": "portrait",
    "caption": {
      "en": "ORIGINAL",
      "fr": "ORIGINAL"
    },
    "alt": {
      "en": "CEO1.9 adjusting his chain in a blue-lit room",
      "fr": "CEO1.9 ajuste sa chaîne dans une pièce éclairée en bleu"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 1,
    "shift": 0
  },
  {
    "id": "timals-2887",
    "asset": {
      "source": "/CEO19/TIMALS/IMG_2887.jpg",
      "path": "/media/archive/timals-2887.webp",
      "width": 1068,
      "height": 1600,
      "sourceWidth": 3064,
      "sourceHeight": 4592
    },
    "heightScale": 0.88,
    "y": -0.015,
    "depth": -50,
    "roll": 0.5,
    "category": "shooting",
    "caption": {
      "en": "TIMALS",
      "fr": "TIMALS"
    },
    "alt": {
      "en": "CEO1.9 in blue with the crew on the TIMALS shoot",
      "fr": "CEO1.9 en bleu avec le groupe pendant le tournage de TIMALS"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 2,
    "shift": 0
  },
  {
    "id": "fantastique-still",
    "asset": {
      "source": "/CEO19/Fanstastique/Pasted 2026-10-16 at 1.23.25 PM.png",
      "path": "/media/archive/fantastique-still.webp",
      "width": 1600,
      "height": 879,
      "sourceWidth": 2712,
      "sourceHeight": 1722,
      "sourceCrop": {
        "left": 0,
        "top": 145,
        "width": 2712,
        "height": 1490
      }
    },
    "heightScale": 0.57,
    "y": -0.09,
    "depth": -155,
    "roll": -0.9,
    "category": "visual-stills",
    "caption": {
      "en": "FANTASTIQUE",
      "fr": "FANTASTIQUE"
    },
    "alt": {
      "en": "Black-and-white FANTASTIQUE still with CEO1.9 and the crew by a car",
      "fr": "Image en noir et blanc de FANTASTIQUE, CEO1.9 et le groupe près d’une voiture"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 3,
    "shift": 0
  },
  {
    "id": "bcp-6845",
    "asset": {
      "source": "/CEO19/BCP D'ARGENT images/IMG_6845.JPG",
      "path": "/media/archive/bcp-6845.webp",
      "width": 900,
      "height": 1600,
      "sourceWidth": 3944,
      "sourceHeight": 7008
    },
    "heightScale": 0.82,
    "y": 0.025,
    "depth": -15,
    "roll": 0.7,
    "category": "shooting",
    "caption": {
      "en": "BCP D’ARGENT",
      "fr": "BCP D’ARGENT"
    },
    "alt": {
      "en": "CEO1.9 standing beside a yellow bus during the BCP D’ARGENT shoot",
      "fr": "CEO1.9 près d’un bus jaune pendant le tournage de BCP D’ARGENT"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 4,
    "shift": 0
  },
  {
    "id": "studio",
    "asset": {
      "source": "/images/studio.webp",
      "path": "/media/archive/studio.webp",
      "width": 1440,
      "height": 1440,
      "sourceWidth": 1440,
      "sourceHeight": 1440
    },
    "heightScale": 0.64,
    "y": 0.075,
    "depth": -195,
    "roll": -0.5,
    "category": "studio",
    "caption": {
      "en": "In the studio",
      "fr": "En studio"
    },
    "alt": {
      "en": "Working at a computer in a recording studio",
      "fr": "Travail sur ordinateur dans un studio d’enregistrement"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 5,
    "shift": 0
  },
  {
    "id": "bcp-van",
    "asset": {
      "source": "/CEO19/BCP D'ARGENT images/IMG_6940.JPG",
      "path": "/media/archive/bcp-van.webp",
      "width": 900,
      "height": 1600,
      "sourceWidth": 3944,
      "sourceHeight": 7008
    },
    "heightScale": 0.85,
    "y": -0.035,
    "depth": -70,
    "roll": -0.8,
    "category": "shooting",
    "caption": {
      "en": "BCP D’ARGENT / night shoot",
      "fr": "BCP D’ARGENT / tournage de nuit"
    },
    "alt": {
      "en": "CEO1.9 in the open doorway of a van lit in blue and pink",
      "fr": "CEO1.9 dans la porte ouverte d’un van éclairé en bleu et rose"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 6,
    "shift": 0
  },
  {
    "id": "show-13",
    "asset": {
      "source": "/CEO19/SHOW/CEO-13.jpg",
      "path": "/media/archive/show-13.webp",
      "width": 1200,
      "height": 1600,
      "sourceWidth": 5464,
      "sourceHeight": 7285
    },
    "heightScale": 0.8,
    "y": 0.01,
    "depth": -110,
    "roll": 0.6,
    "category": "live",
    "caption": {
      "en": "The crowd",
      "fr": "Le public"
    },
    "alt": {
      "en": "CEO1.9 and the crowd gathered at the front of the stage",
      "fr": "CEO1.9 et le public devant la scène"
    },
    "focalPoint": {
      "x": 0.5,
      "y": 0.5
    },
    "slot": 7,
    "shift": 0
  }
] satisfies GalleryPhoto[];
