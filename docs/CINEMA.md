# CEO 1.9 Cinema

WATCH now enters a release world inside the existing native dialog. The release deck, routes, official links, music provider and Signal object are preserved.

## Direction and timing

`src/data/cinema.ts` owns six entry directions and entry/exit durations. `cinemaTiming` sets phrase visibility and aperture opening. Each world inherits the real cover palette from `src/data/channelWorlds.ts`; BCP keeps the CEO blue/cream print identity. These are visual directions, not invented artist facts or production credits.

- ORIGINAL: offline cuts, 880ms.
- KRITIKA: dark impact and supplied repeated typography, 820ms.
- FANTASTIQUE: haze reveal, 1200ms.
- TIMALS: layered shutters, 1100ms; no invented phrase.
- MACHI BATEL: split convergence, 1320ms.
- BCP D’ARGENT: blue poster expansion, 1080ms.

Reduced motion uses a 160ms fade and skips traveling covers, punchline impacts and moving doors. The OS preference is the default; the existing menu can explicitly enable or disable motion.

## Media and assets

Add/edit clips in `src/data/videos.ts`, linked to a release through `releaseId`. Put verified local film posters under `public/images/films/` and set `poster` to the public path. All current posters are null; Cinema uses the real release cover, not an unrelated photograph claimed as a film still.

An optional `cinema` object on a video overrides `cinemaBackground`, `cinemaAccent`, `cinemaForeground`, `cinemaGlow`, `entry`, `entryDuration`, `exitDuration` or `punchline`. Configure colors from verified artwork/stills. Do not add fictional credits or lyrics. Existing release metadata remains in `src/data/releases.ts`.

## Lifecycle

`CinemaWorld.tsx` handles entering → loading → ready/error → exiting. The cover begins at the measured deck artwork position. Entry expands the world, briefly shows a supplied phrase, opens the aperture, then mounts the official YouTube player. During loading the cover remains visible. Playback-ready removes the loading cover and settles into a quiet ambient environment.

`FilmPlayer.tsx` loads the official API only after WATCH and the entry sequence. It uses youtube-nocookie, real controls, autoplay disabled, real ready/error/playback events and a provider timeout with an external link. There is no fake progress or hidden competing video. The visitor presses the official player's Play control to begin playback.

WATCH stops and unloads the global music source. Closing pauses YouTube before the aperture and artwork return, destroys the iframe, restores scroll/focus and never resumes music automatically. Next/previous destroys the old player and enters the next world without returning to the page. `video_play` analytics fires only on an actual YouTube playing event.

The underlying Signal renderer pauses while Cinema is open. Its section target becomes the lens/portal state; closing restores normal rendering. Ambient covers are blurred responsive Next images; no duplicate background video, extra scene or continuously animated playback environment is created.

## Keyboard and layout

Native `showModal` supplies inert page content. A focus loop excludes hidden/inert loading controls. Close stays visible; Escape on Cinema controls runs the designed exit. Left/right arrows on Cinema controls change films; keys inside the cross-origin YouTube player remain governed by YouTube (Tab back to Cinema controls to close/change worlds). This preserves real player seeking and fullscreen behavior.

Mobile uses a full-width 16:9 screen, compact header, large loading cover and bottom navigation; desktop reserves clearance around the frame. Browser QA covered 375, 390, 430, 768, 1024, 1440 and 1920px plus 844×390 landscape, EN/FR, normal/reduced motion, early close, focus restoration, film switching, actual playback and global music unloading. Physical iOS/Android device testing remains a launch check.
