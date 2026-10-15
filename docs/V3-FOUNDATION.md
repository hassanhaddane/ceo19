> Current implementation status and approved logo variants are documented in [V3-AUDIT.md](V3-AUDIT.md). This file records an earlier milestone.

# CEO1.9 V3 — foundation handoff

This is an upgrade of the existing project. No project scaffold, dependency replacement, animated intro or new Cinema implementation was introduced.

## Repository inspection

Inspected the repository's app routes, page composition, UI primitives, locale dictionaries, master content, professional contact and SEO; traced release selection, player state, embed API loading, modal focus handling, archive dragging, GSAP, global interaction/cursor systems, and the R3F signal renderer. Inventoried every file beneath `public`, including `public/CEO19`, and compared the original supplied library in `/Users/admin/Documents/CEO19`. Read the installed Next.js 16.3.8 guides for Image, layouts and Server/Client Components before editing.

Routes preserved: `/` redirects to `/en`; `/en`, `/fr`, `/en/press`, `/fr/press`, localized/global 404, robots and sitemap. The artist pages are statically generated. The existing Next.js, React, TypeScript, Tailwind, GSAP, Three.js, Fiber and Drei dependencies and npm lockfile are unchanged.

The previous public presentation had a release deck, persistent metallic signal surface, architectural line layers, camera exposure effects, a multi-object World scene, social exit transitions, and a drawn text logo. V3 replaces that active presentation while retaining the content, player infrastructure and useful interactions.

## Actual asset paths

| Supplied group | Resolved public location | Count |
| --- | --- | --- |
| BCP photographs | `/CEO19/BCP D'ARGENT images/` | 8 JPGs |
| BCP art / references | `/CEO19/BCP D'ARGENT art/` | 3 PNGs |
| TIMALS | `/CEO19/TIMALS/` | 9 JPGs |
| SHOW | `/CEO19/SHOW/` | 6 JPGs |
| Logo | `/CEO19/Logo/` | 3 JPGs after primary recovery |
| CEO VISUALS | `/CEO19/CEO VISUALS/CEO visuels .mp4` | 1 MP4 |
| Release covers | `/releases/` | 6 PNGs |

Primary: `/CEO19/Logo/LOGO CEO OFFICIEL.jpg` (1600 × 1600), recovered from `/Users/admin/Documents/CEO19/Logo/LOGO CEO OFFICIEL.jpg`. SHA-256 comparison confirms a byte-identical copy. Used in header, menu, HOME, 404 and favicon metadata. Its white background and full proportions remain intact. The intro is deferred; it will use this same manifest entry.

Secondary: `/CEO19/Logo/LOGO CEO.jpg` (1600 × 1600), used only in the site footer. Its original colors remain part of the supplied image, rather than UI tokens. `PHOTO-2026-05-11-14-18-07 2.jpg` is a separate logo variant, inventoried but not substituted for the primary.

The typed manifest and JSON inventory cover all **67 public files: 60 images, one video, three fonts and three license/source documents**. Images include six covers, 37 photographs, three visual references, three artist logo images, a production mark, six platform SVG icons, grain, social imagery and two inactive generated assets. Original filenames, case, spaces and apostrophes remain unchanged. `assetUrl()` encodes raw path segments once. Every manifest path exists and returns HTTP 200 via HEAD.

The existing source-provenance inventory is retained as `docs/source-asset-inventory.json`; it is not the current public-file inventory. The architecture and chrome images are marked `legacy-generated` and are absent from the active V3 pages. The MP4 is available in the manifest but does not download or autoplay on page load.

## Design and content

- HOME: one real portrait with an arched crop referencing Fez, complete CEO1.9 name, primary logo patch and two native scene links.
- MUSIC: one release artwork, numbered selection, LISTEN / WATCH, original platform destinations. No second release/visuals scene. Selection, arrow keys, swipe and browser history remain functional. WATCH uses the supplied external YouTube URL; LISTEN retains the existing player.
- ARCHIVE: one photographic rail, filters, native horizontal scrolling, bounded mouse drag and a simple accessible photo viewer. Four additional real photographs from TIMALS, BCP and SHOW join the nine existing selections. Vertical wheel scrolling remains native.
- WORLD: one supplied facade portrait and the existing artist biography. The chrome object, simulated waveform, production-paper objects and multiple hotspots are removed from the active scene.
- CONNECT: large typography, four open social rows and compact professional access. The footer contains the secondary logo.

The canonical five-scene order and localized labels live in `artist.ts`. The public SectionId type has exactly five values; a separately named legacy optical state type supports parked WebGL code. Legacy music/film hashes resolve into the same MUSIC scene, rather than creating additional sections.

`assets.ts`, `artist.ts`, `releases.ts`, `lyrics.ts`, `socials.ts` and `gallery.ts` own content. Dates and URLs were preserved from the repository. `lyrics` is deliberately empty because no verified lyric text or source was supplied. Visual phrases are never attributed as lyrics. There is no announced EP.

CEO blue is **#3572A3**, the median RGB (53, 114, 163) from the supplied STOP THE RIOTS reference `/CEO19/BCP D'ARGENT art/IMG_7192.PNG`. Sample ROI: x=150–700, y=100–700; blue selection B > 1.25R, B > 1.1G, G > 40. 295,765 selected pixels. The reference informs the palette and is not presented as release artwork.

`globals.css` defines `--ceo-blue`, `--ceo-blue-deep`, `--ceo-blue-light`, `--ceo-cream`, `--ceo-white`, `--ceo-black` and semantic text, overlay, surface and border tokens. Existing styles use compatibility aliases. Anton and DM Sans remain self-hosted with their existing licenses. `v3.css` replaces eleven competing scene/effect stylesheet imports. `motion.ts` centralizes timings and V3 settings; a small scroll-derived desktop photograph movement replaces global metallic rendering and delayed exit effects. Reduced motion disables it. Server-rendered content remains readable before enhancement; no canvas or media iframe mounts on initial load.

## Missing supplied content

No required logo, release cover, scene photo or local MP4 remains missing. Still unavailable: BCP D’ARGENT's release date, verified lyrics, official film posters, confirmed durations and track credits, approved direct audio previews, Apple Music/Deezer destinations, an approved refreshed EPK and a curated authorized downloadable press-image package. Nullable fields remain nullable. Availability and playback through third-party providers are controlled by those providers and were not asserted from UI selection alone.

## Verification

Commands executed:

```sh
npm ci
npm run dev -- --port 3000
npm run lint
npm run typecheck
npm test
npm run build
npm start -- --port 3000
git diff --check
```

Additionally: byte-preserving `cp` recovery of the primary JPG, a Node HTTP smoke check of the root redirect, EN/FR artist/press pages and 404 status responses; recursive `rg --files` inspection, installed Next guide reads, `git status --short`, `git diff --stat`, `git diff --name-only`, and `git show HEAD:docs/asset-inventory.json` to preserve provenance. Bundled Python/Pillow inspected image dimensions, built a private asset contact sheet, sampled blue and wrote the exact manifest. A `node --input-type=module` check verified manifest file existence, HEAD responses for every asset, primary-logo SHA-256 identity and six release IDs. No browser or application dependencies were added.

Lint, typecheck and the production build pass. All 22 existing tests pass. The build statically generates EN/FR artist and press pages. The production client chunks contain no SignalScene, WebGLRenderer or Cinema direction implementation, and unused inventory records are tree-shaken from the client bundle.

The built-in browser was used, without Playwright fallback. Checked 1440 × 900 desktop and 390 × 844 mobile: meaningful rendering, exact five scene IDs, no page overflow, correct logo roles, native scene links, click/keyboard release selection and corresponding hashes, archive filtering, modal opening, Escape and focus restoration, menu navigation and locale anchor preservation. No app error overlay was present. Development-only LCP advisories referred to the reused archive portrait and the selected cover on an anchored MUSIC entry; the HOME instance explicitly uses eager loading/high fetch priority. Fast Refresh also reported a full reload while editing shared data. The final production browser reported no console errors. Third-party playback was not exercised; the retained player expanded/minimized correctly without creating an iframe until a source is requested.

Private concept: `/Users/admin/.codex/generated_images/01a13777-75d2-7493-9ce4-94d4cc67c811/exec-0455ccd2-9940-4e9f-9380-34f0dca66377.png`. A five-panel foundation board was inspected with view_image; no generated imagery was published. The user's concrete asset/copy rules take precedence over generative mockup details.

Fidelity comparisons: condensed typography and precise controls; sampled blue / cream / black surfaces; primary logo's actual white JPG ground; real portrait and Fez crop; six-row release index with one supplied cover; archive contact rail; direct social rows; mobile stacking without page overflow. Intentional differences from the board: preserve the complete primary JPG instead of its generated cutout; keep the real contact email and existing biography; use only actual supplied archive photos; preserve the artist's existing positioning line. The first foundation pass does not claim final animation or Cinema sign-off.

Production screenshots were captured through the built-in browser and inspected alongside the concept using view_image:
- Desktop: `/Users/admin/.codex/visualizations/2026/10/13/01a13777-75d2-7493-9ce4-94d4cc67c811/ceo19-v3-desktop.png`
- Mobile: `/Users/admin/.codex/visualizations/2026/10/13/01a13777-75d2-7493-9ce4-94d4cc67c811/ceo19-v3-mobile.png`
- All five scenes: `/Users/admin/.codex/visualizations/2026/10/13/01a13777-75d2-7493-9ce4-94d4cc67c811/ceo19-v3-full-page.png`

The generative board's native size is 2146 × 733 and contains five miniature panels; the app was checked at practical full-page desktop/mobile viewports, rather than treating that board as a browser viewport. Foundation deviations are documented above. Above-the-fold copy was checked against the concrete artist data: CEO1.9, existing positioning, origin, Listen/Explore, five navigation labels, languages and player data. No invented claims, extra scene, or standalone artist-number label appears. Source-specific archive filters replace the board's illustrative categories. Desktop MUSIC originally placed controls too far below its large artwork; reduced heading/artwork sizes and spacing brought the six selections and Listen/Watch controls into the primary viewport.

## Changed files

- `docs/HANDOFF.md`
- `README.md`
- `docs/V3-FOUNDATION.md`
- `docs/asset-inventory.json`
- `docs/design/FES-AFTER-DARK.md`
- `docs/source-asset-inventory.json`
- `public/CEO19/Logo/LOGO CEO OFFICIEL.jpg`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/press/page.tsx`
- `src/app/globals.css`
- `src/app/icon.svg`
- `src/app/not-found.tsx`
- `src/components/archive/DarkroomViewer.tsx`
- `src/components/archive/useArchiveRail.ts`
- `src/components/channels/ChannelArtwork.tsx`
- `src/components/editorial/ConnectExperience.tsx`
- `src/components/editorial/HomeExperience.tsx`
- `src/components/editorial/WorldExperience.tsx`
- `src/components/footer.tsx`
- `src/components/gallery.tsx`
- `src/components/interaction/interaction.css`
- `src/components/media/ArchiveExperience.tsx`
- `src/components/media/mediaCopy.ts`
- `src/components/motion.tsx`
- `src/components/music/MusicExperience.tsx`
- `src/components/music/ReleaseArtwork.tsx`
- `src/components/navigation.tsx`
- `src/components/navigation/NoSignal.tsx`
- `src/components/primitives.tsx`
- `src/components/signal-page.tsx`
- `src/components/signal/SignalExperience.tsx`
- `src/components/signal/SignalSlot.tsx`
- `src/components/signal/signalStates.ts`
- `src/components/signal/useSignalScroll.ts`
- `src/components/transmissions/TransmissionViewer.tsx`
- `src/components/transmissions/TransmissionsExperience.tsx`
- `src/components/v3.css`
- `src/data/artist.ts`
- `src/data/assets.ts`
- `src/data/channelWorlds.ts`
- `src/data/cinema.ts`
- `src/data/closingScenes.ts`
- `src/data/editorial.ts`
- `src/data/gallery.ts`
- `src/data/homeCampaign.ts`
- `src/data/lyrics.ts`
- `src/data/nightWorld.ts`
- `src/data/releases.ts`
- `src/data/socials.ts`
- `src/data/transmissions.ts`
- `src/data/videos.ts`
- `src/i18n/dictionaries.ts`
- `src/lib/motion.ts`
- `src/lib/seo.ts`
- `src/types/content.ts`
