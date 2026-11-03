export interface WorldClip {
 id: string;
 src: string;
 poster: string;
 duration: number;
 sourceTime?: number;
 selection?: 'reviewed' | 'technical';
}

/** Actual muted H.264 excerpts; source times refer to the preserved documentary. */
export const worldClips: readonly WorldClip[] = [
  {
    "id": "stage-side",
    "src": "/media/world/stage-side.mp4",
    "poster": "/media/world/stage-side.jpg",
    "duration": 4,
    "sourceTime": 6,
    "selection": "reviewed"
  },
  {
    "id": "crowd-front",
    "src": "/media/world/crowd-front.mp4",
    "poster": "/media/world/crowd-front.jpg",
    "duration": 4,
    "sourceTime": 40,
    "selection": "reviewed"
  },
  {
    "id": "performance",
    "src": "/media/world/performance.mp4",
    "poster": "/media/world/performance.jpg",
    "duration": 4,
    "sourceTime": 58,
    "selection": "reviewed"
  },
  {
    "id": "night-audience",
    "src": "/media/world/night-audience.mp4",
    "poster": "/media/world/night-audience.jpg",
    "duration": 4,
    "sourceTime": 93,
    "selection": "reviewed"
  },
  {
    "id": "stage-depth",
    "src": "/media/world/stage-depth.mp4",
    "poster": "/media/world/stage-depth.jpg",
    "duration": 4,
    "sourceTime": 145,
    "selection": "reviewed"
  },
  {
    "id": "crowd-close",
    "src": "/media/world/crowd-close.mp4",
    "poster": "/media/world/crowd-close.jpg",
    "duration": 4,
    "sourceTime": 177,
    "selection": "reviewed"
  }
];
