# V5 — minimal public experience and cinematic archive

This pass reduces the displayed archive from 26 compositions to eight. No original image, unused derivative, logo or video was deleted or modified. Home keeps the same composition, mobile music hub, streaming links, parallax and persistent film; its only changes are clearer featured-action contrast, keyboard focus outlines and eased arrow movement. MUSIC code and its carousel, release backgrounds, Genius panels and Cinema remain unchanged in this pass.

## Exact photographs, in display order

Paths below are relative to `public/`. All selected derivatives already existed; no crop or color treatment was added to the photographs.

| # | Original source | Display derivative | Selection |
| --- | --- | --- | --- |
| 01 | `CEO19/SHOW/CEO-3.jpg` | `media/archive/show-3.webp` | Clear live artist portrait against a dark stage |
| 02 | `CEO19/Original/portrait.webp` | `media/archive/portrait.webp` | Strong blue portrait and recognizable artist identity |
| 03 | `CEO19/TIMALS/IMG_2887.jpg` | `media/archive/timals-2887.webp` | Full-body street composition and local surroundings |
| 04 | `CEO19/Fanstastique/Pasted 2026-10-16 at 1.23.25 PM.png` | `media/archive/fantastique-still.webp` | Contrasting monochrome landscape and performance gesture |
| 05 | `CEO19/BCP D'ARGENT images/IMG_6845.JPG` | `media/archive/bcp-6845.webp` | Bus-shoot architecture, color and fashion silhouette |
| 06 | `images/studio.webp` | `media/archive/studio.webp` | Authentic studio work and a change of setting |
| 07 | `CEO19/BCP D'ARGENT images/IMG_6940.JPG` | `media/archive/bcp-van.webp` | Neon night shoot with a distinct light palette |
| 08 | `CEO19/SHOW/CEO-13.jpg` | `media/archive/show-13.webp` | Crowd energy and audience connection |

The eight optimized files total 1,338,258 bytes before responsive Next Image variants. `src/data/gallery.ts` remains the single source for both the strip and fullscreen viewer. Desktop uses one image per column with varied height, offset and depth. Mobile retains contained images, large swipe targets and a single bounded scene. Captions remain accessible through alt text/screen readers; no per-photo metadata is displayed in the strip.

## Exact documentary excerpts

Preserved master: `public/CEO19/SHOW/CEO DOCCCCC.mp4` (409,256,910 bytes). The active playlist in `src/data/archiveClips.ts` reuses these existing, reviewed exports, in this order:

| Order | Optimized path | Source range in the master |
| --- | --- | --- |
| 01 | `public/media/world/stage-side.mp4` | 00:06–00:10 |
| 02 | `public/media/world/crowd-front.mp4` | 00:40–00:44 |
| 03 | `public/media/world/performance.mp4` | 00:58–01:02 |
| 04 | `public/media/world/stage-depth.mp4` | 02:25–02:29 |

All are 1280×720, four seconds, H.264/yuv420p, fast-start, with no audio stream; each is about 1 MB. Existing posters accompany them. The unused night-audience and crowd-close exports remain preserved. No new FFmpeg export was necessary and the original MOV is never a browser background source.

## Playback and motion ownership

`ArchiveDocumentary` owns two persistent video slots. `attachArchiveDocumentary` uses native media readiness/time/playing/ended events; it creates no RAF loop. Only the current clip runs until the next excerpt is loaded near its end. Playback overlaps for a 550 ms desktop dissolve or 350 ms mobile dissolve. The outgoing source is released afterward. A late clip keeps the outgoing final frame visible, and failures retain a real poster/frame while another reviewed clip loads. There are no programmed black gaps or random source changes.

PhotoStage owns viewer/pause/focus state and passes its pause condition directly to the documentary. Opening the fullscreen viewer, using the motion pause control, or keyboard focus pauses both gallery and footage. Closing the viewer continues the existing playheads. Menu/scene exit releases documentary sources; hidden tabs pause them. Reduced motion and data-saving/very-low-memory devices use a static documentary poster without starting playback.

The original global CEO-visuels video stays mounted with its existing source and playhead, visually suppressed and paused in ARCHIVE. Its previous treatment returns through the existing 700 ms background transition. MUSIC continues using its own release environments. No footage is mounted behind EPK, Shop or a WORLD biography.

Photos retain the existing 0.8 desktop depth/parallax intensity and damped pointer interpolation. The documentary uses a smaller movement preset (10/7 px pointer, 12 px scroll) with overscan, keeping it slower than the photographs. The gallery retains its one controlled RAF, hover slowdown, keyboard pause, manual ownership and eased idle return. No WebGL renderer or dependency was introduced.

Dark CEO-blue film treatment, restrained contrast and grain sit behind the original photo colors. The existing depth entrance and a restrained departure fade remain. Archive-to-Shop navigation lets the gallery/film fade for 220 ms before the client route changes; reduced motion follows the link immediately. Flash/shutter controls and opt-in SFX are preserved; a silent sound choice never starts interface audio.

## Validation

Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. The regression suite includes native-media controller tests for brief decoder overlap, delayed next-clip readiness, failed-clip recovery, viewer/visibility pause and disposal. Browser evidence and temporary scripts are kept outside the repository. The pre-existing Next.js security-advisory reminder remains a separate dependency issue. Physical mobile/Safari performance and provider-side streaming availability still require device/service testing.
