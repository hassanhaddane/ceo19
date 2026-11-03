# CEO1.9 V4 — repository audit and foundation handoff

Intro update: the original foundation intro described below has been replaced by the automatic HKZ → CEO1.9 cinematic sequence in `src/components/intro/`. Current entry details and timing are in README.md. The audit below records the preceding foundation pass.

World source update: both previously missing media are now supplied and integrated. The aerial source is `/CEO19/WORLD/GPS HKZPROD.png` (884×416); the documentary is `/CEO19/SHOW/CEO DOCCCCC.mp4`, with six muted web excerpts in `/media/world/`. The map stamp uses the pin already present in the source, without adding geographical coordinates. Missing-source statements and counts below describe the original foundation snapshot; README.md and the regenerated `V4-ASSETS.json` describe the current implementation (101 public files, 96 classified assets).

15 October 2026. This is an in-place foundation pass, not a greenfield application or the final motion/design phase. No deployment, publication, dependency upgrade, account action or source-media modification was performed.

## Audit findings and preserved systems

The repository has Next.js App Router localized artist pages at `/en` and `/fr`, a root redirect to English, localized press pages, not-found pages, metadata, sitemap and robots routes. The existing package declarations, package-manager files, route structure and canonical origin remain intact. The installed runtime reports Next.js 16.4.0 / React 19.3.0 / Node 24.21.0. The pnpm files and generated Next environment change existed at intake; this work did not create a new lockfile or switch package managers. Next build regenerated its own environment declarations.

Inspection covered the application tree, components, data, tests, configuration, prior design/audit documentation, and the recursive public inventory. All 74 raster/vector public images were reviewed in four contact sheets, including original photography, six covers, PNG/JPG logos, icons, poster, generated legacy passage and chrome ring. All 82 classified content files were hashed before changes and compared afterward: unchanged. The MP4 container tracks were parsed from both files. Licenses/font files and filesystem metadata remain inventoried.

What already worked and was preserved:

- Six release records and their actual artwork, dates, featuring credit, supplied Spotify/YouTube URLs, four Genius IDs/URLs and nullable unknown values.
- Lazy provider loading, native dialog boundaries, genuine provider playback events, external fallbacks, audio stop before Cinema and persistent player state.
- One background video element, hidden-tab pause/recovery, autoplay-failure poster, and source removal for reduced motion.
- Native document scrolling, CSS snap, scene/release/photo history, gesture ownership, keyboard navigation, focus return and localized destinations.
- Thirteen bounded spatial photographs with optimized, uncropped derivatives. Desktop mounts nearby images; mobile reduces the image neighborhood.
- Self-hosted Anton and DM Sans, professional email, HKZ associations, original biography, SEO and local analytics interface.

GSAP is installed and imported lazily for finite scene entrances. ScrollTrigger is not registered or used. There is no active Three.js/R3F dependency, renderer or scene: Archive uses DOM perspective. An obsolete ESLint exception for nonexistent Three.js files was removed. No new renderer or scroll-pinning system was introduced.

## References actually inspected

[Travis Scott home](https://www.travisscott.com/) was opened in the live browser: dark presentation, a dominant central artwork/mark, sparse Tour/Shop access and an Explore Utopia World link. [Utopia World](https://www.travisscott.com/utopia-world/) was opened and Next Slide was exercised: a central visual with neighboring images, a changing title/background and previous/next controls were visible. This inspection does not establish every transition or mobile gesture on that site.

[CEO1.9 on Grezer](https://ceo19.grezer.io/) was inspected in the browser after the text-fetch tool could not reach it. It displayed the artist photograph, social/streaming icons, Latest Release, Music, Videos and Booking. Listen now opened actual platform destinations for BCP D’ARGENT. Its six video IDs matched the existing repository. Existing supplied destinations were retained; no newer-looking address silently replaced an approved account. The reference’s spaced artist spelling was not adopted: the site displays CEO1.9.

Translated principles: dominant real media, sparse navigation, direct music access, restrained condensed type, and original blue/cream/black composition. No reference graphics, branding, layout code or new bitmap concept was copied. Full concept generation and complex new animation are deferred to the requested later stage.

## Exact assets and readiness

All paths below are exact public URLs, not guessed filenames. `assetUrl()` encodes their path segments where needed.

| Role | Exact path | Verified state |
| --- | --- | --- |
| Official white PNG | `/CEO19/Logo/LOGO CEO OFFICIEL Blanc.png` | 1254×1254, transparent PNG; dark header and intro |
| Official black PNG | `/CEO19/Logo/LOGO CEO OFFICIEL Noir.png` | 1254×1254, transparent PNG; cream header |
| Secondary logo | `/CEO19/Logo/LOGO CEO.jpg` | 1600×1600 JPG; footer only |
| HKZ logo | `/brands/hkz.png` | 160×160 supplied mark, original white ground retained |
| Original visual film | `/CEO19/CEO VISUALS/CEO visuels .mp4` | 50,018,907 bytes; 20.083s video track and audio track |
| Existing web film | `/media/ceo-visuals-background.mp4` | 2,948,192 bytes; 20.083s video track only; fast-start |
| Existing film poster | `/media/ceo-visuals-poster.jpg` | 1600×900 |
| Blue reference | `/CEO19/BCP D'ARGENT art/IMG_7192.PNG` | STOP THE RIOTS reference, 2828×2828; not a release cover |
| Other BCP reference art | `/CEO19/BCP D'ARGENT art/IMG_7193.PNG`, `IMG_7194.PNG` | Both 2048×2048 |
| Six original covers | `/releases/ORIGINAL.png`, `/releases/KRITIKA.png`, `/releases/FANTASTIQUE.png`, `/releases/TIMALS.png`, `/releases/MACHI BATEL.png`, `/releases/BCP D'ARGENT.png` | All 640×640; original colors retained |
| SHOW sources | `/CEO19/SHOW/CEO-3.jpg`, `CEO-6.jpg`, `CEO-7.jpg`, `CEO-9.jpg`, `CEO-12.jpg`, `CEO-13.jpg` | Six supplied concert photographs |
| TIMALS sources | `/CEO19/TIMALS/` | Nine exact photographs listed in the JSON inventory |
| BCP photographs | `/CEO19/BCP D'ARGENT images/` | Eight exact photographs listed in the JSON inventory |
| Aerial neighborhood map | **Missing** | `/CEO19/WORLD/` contains only `.gitkeep`; typed slot remains null |
| `CEO DOCCCCC.mp4` | **Missing** | No MOV anywhere under public; no excerpt or conversion fabricated |
| `LOGO CEO OFFICIEL.jpg` | **Missing optional fallback** | Both required primary PNG variants are present |

No separate original shoots/folders for ORIGINAL, KRITIKA, FANTASTIQUE or MACHI BATEL exist under `public/CEO19`; their actual cover assets are present under `public/releases`. No high-resolution HKZ/GANGSTATION source beyond `/brands/hkz.png` is present. Approved downloadable EPK/press imagery also remain absent, so the existing request-by-email path stays available.

`docs/V4-ASSETS.json` records **87 files / 266,350,551 bytes**: 82 classified assets and five metadata/empty-slot files. It distinguishes legacy generated media from usable artist sources and records SHA-256, dimensions, format and alpha. `src/data/assets.ts` remains the typed stable reference manifest. Run `node scripts/audit-assets.mjs` to regenerate the audit without rewriting media. Previous asset/provenance JSON files remain historical records.

Blue was sampled from the actual `IMG_7192.PNG`, ROI left 150/top 100/width 550/height 600. Filter: B > 1.25R, B > 1.1G, G > 40. The 295,765 selected pixels yielded median RGB **53,114,163 / #3572A3**. Existing cream #EAE5D6 and black #080A0C were retained. The original MACHI BATEL cover contains purple; it remains intact artwork and is not a purple UI gradient.

## V4 scene and component ownership

| Scene | Active foundation |
| --- | --- |
| 00 INTRO | Native accessible overlay, exact official logo, Enter/Skip/Escape, HKZ credit; session migration preserves prior entry; direct release hashes survive entry |
| 01 HOME | Artist identity, persistent film, real mobile portrait, featured-release deep link, existing streaming destinations |
| 02 MUSIC | Six existing ReleaseWorld identities, Play Now / Watch Now / Lyrics, retained provider and Cinema engines |
| 03 ARCHIVE | Existing spatial PhotoStage and DarkroomViewer |
| 04 WORLD | Samadi / CEO1.9, Fez/Morocco, HKZ association; source-gated map/documentary slots |
| 05 CONNECT | Direct official social accounts, HKZ production, professional contact, press route, integrated footer |

There is no sixth content section. Intro is not a document snap stop. Scene numbers, labels and navigation-surface roles live in `src/data/artist.ts`; the navigation consumes those roles. French labels remain secondary through `/fr`. The initial foundation retained old scene aliases for compatibility. The final audit has retired those aliases; the five current scene hashes and per-release/per-photo hashes remain supported.

| Component | Implementation | Ownership |
| --- | --- | --- |
| ArtistLogo | `src/components/design/ArtistLogo.tsx` | Actual white/black primary PNGs; `LogoMark` delegates primary rendering and retains footer-only JPG |
| VideoBackground | `src/components/visuals/GlobalVisualBackground.tsx` | Reuses one decoder and its verified lifecycle; old export retained for compatibility |
| IrregularBlueGradient | `src/components/design/ScenePrimitives.tsx` | Static shared blue print/gradient treatment |
| CinematicMask | same | Shared CSS mask, no extra animation loop |
| EditorialTypography | same | Condensed heading tokens |
| ParallaxLayer | same | Declarative preset for existing GlobalParallax scheduler |
| SectionTransition | `src/components/scenes/SceneTransitions.tsx` | Existing lazy GSAP scene entrances; old export retained |
| FloatingNavigation | `src/components/navigation.tsx` | Existing focus-managed native menu and localized navigation |
| ReleaseWorld | `src/components/music/ReleaseWorld.tsx` | Existing six music identities, artwork transitions and media source contracts |
| PhotoStage | `src/components/gallery.tsx` | Existing bounded spatial gallery; old Gallery export retained |
| WorldMapArtwork | `src/components/world/WorldMapArtwork.tsx` | Renders only the actual configured map with measured aspect/dimensions; returns null while absent |

Colors, font scales, spacing, static masks, grain and foundation overlay strengths live in `src/styles/tokens.css`. Existing motion durations/easing remain in `src/lib/motion.ts`; scene/media/parallax timings and overlay presentation remain in `src/lib/visualEffects.ts`. V4 composition is in `src/components/v4.css`, with retained feature CSS for Music, Archive, Cinema and press. New primitives consume shared tokens rather than creating independent animation systems.

LIGHT UP, the lighter/smoke entry, architectural line drawings, leaf cursor, release-driven World effects and CONNECT’s catalogue previews were retired from active code. Public source media and historical design records remain intact. The main content and navigation never use standalone 1.9 as the brand.

## Verification and limits

Commands after the final code changes:

- `pnpm run lint` — passed.
- `pnpm run typecheck` — passed.
- `pnpm test` — **37 passed**, including V4 scene order/source slots/Connect scope and retained media, lyrics, archive and motion contracts.
- `pnpm run build` — passed; `/en`, `/fr`, both press routes, root and metadata routes generated.
- `git diff --check` — passed.
- `node scripts/audit-assets.mjs` — 87 files; no unclassified content or stale byte counts.
- Pre/post SHA-256 comparison — all 82 content assets unchanged; no public files modified.

Live browser verification used Codex IAB through the available computer/browser API. No Playwright fallback or browser dependency install was needed. Development checks used `http://localhost:3000`; production smoke checks used `http://localhost:3019` (3002 was already occupied). Desktop viewport was 1280×720; responsive viewport was 390×844. The temporary viewport override was reset.

| Check | Evidence/result |
| --- | --- |
| Identity / meaningful render | Correct CEO1.9 page title; five direct main sections; no blank/error overlay in final build |
| Console | Fresh production tab reported zero warnings/errors during Music → Archive viewer → Connect |
| Intro and deep links | Production load at `#release-original` → Enter retained hash and selected ORIGINAL |
| Home music access | Select ORIGINAL → Home → featured link selected BCP D’ARGENT and retained `#release-bcp-dargent` |
| Real providers | Existing ORIGINAL Genius embed rendered and its dialog closed; actual provider source records retained |
| Archive | Production active photograph opened in native viewer; close restored its original button; no open dialog after exit |
| Branding | White PNG on dark Home/World/Connect; black PNG on cream Music/Archive header; one secondary JPG inside footer |
| Responsive | Portrait mobile Home, release rail, World and Connect inspected; document width equals 390 at mobile and 1280 at desktop |
| Locale | EN → FR preserved Connect hash; French headings/contact labels and artist spelling rendered correctly |
| Motion | Full motion and reduced choice exercised; reduced mode retained one video element with no source; mobile-width fine pointers now use reduced parallax coefficients |
| Content | Four direct social accounts, HKZ and email/press access; zero release tabs/previews inside Connect |

A short visual comparison against the brief checked five areas: the exact logo imagery/aspect, sampled palette, condensed heading/UI hierarchy, one media focus on Home/Music, and direct Connect destinations without cards. Foundation screenshots were inspected inline for desktop and mobile. Above-the-fold copy now uses CEO1.9, Fez/Morocco, real release title, music access and existing navigation/control labels; the prior signal slogan and LIGHT UP were removed. No accepted bitmap design was supplied or generated for this foundation stage, so final image-to-implementation fidelity is not claimed.

Two issues were caught and corrected during verification: an import path after renaming the transition export, and featured-release links losing their content hash. A desktop-only mobile image sizing warning was corrected. A narrow viewport with a fine pointer also received the mobile parallax coefficient so text does not travel outside its gutter.

Scenes may grow beyond one viewport on small/short screens, with native document scrolling exposing the remaining contact/footer content above the fixed player. Physical iOS/Android, Safari, assistive technology, exhaustive provider playback, Lighthouse/field performance and final motion direction are not signed off in this foundation pass. Existing cross-origin provider keyboard/privacy behavior remains provider-dependent. Full map/documentary work requires the real missing sources.

## Files changed by this pass

The following list excludes the pnpm files that were already untracked at intake and generated Next environment declarations. Original public sources, package declarations, lockfiles, verified release records, socials, lyrics and professional details were not changed.
- Updated: `README.md`
- Updated: `eslint.config.mjs`
- Updated: `src/app/[locale]/layout.tsx`
- Updated: `src/app/globals.css`
- Removed: `src/components/Cursor.tsx`
- Updated: `src/components/archive/spatialArchive.css`
- Removed: `src/components/connect/connectEditorial.css`
- Updated: `src/components/editorial/ConnectExperience.tsx`
- Updated: `src/components/editorial/HomeExperience.tsx`
- Updated: `src/components/editorial/WorldExperience.tsx`
- Updated: `src/components/gallery.tsx`
- Updated: `src/components/media/ArchiveExperience.tsx`
- Updated: `src/components/music/MusicExperience.tsx`
- Updated: `src/components/navigation.tsx`
- Updated: `src/components/primitives.tsx`
- Updated: `src/components/scenes/SceneFlow.tsx`
- Updated: `src/components/scenes/SceneTransitions.tsx`
- Updated: `src/components/scenes/scenes.css`
- Updated: `src/components/signal-page.tsx`
- Updated: `src/components/v3.css`
- Removed: `src/components/visuals/FezArchitecture.tsx`
- Updated: `src/components/visuals/GlobalParallax.tsx`
- Updated: `src/components/visuals/GlobalVisualBackground.tsx`
- Removed: `src/components/visuals/Lighter.tsx`
- Removed: `src/components/visuals/SmokeBurst.tsx`
- Updated: `src/components/visuals/VisualExperience.tsx`
- Updated: `src/components/visuals/visuals.css`
- Removed: `src/components/world/useWorldField.ts`
- Removed: `src/components/world/worldArtwork.css`
- Updated: `src/data/artist.ts`
- Updated: `src/data/assets.ts`
- Updated: `src/data/releaseCopy.ts`
- Removed: `src/data/socialPreviews.ts`
- Updated: `src/data/worldArtwork.ts`
- Updated: `src/lib/motion.ts`
- Updated: `src/lib/visualEffects.ts`
- Updated: `tests/finalScenes.test.mjs`
- Added: `docs/V4-ASSETS.json`
- Added: `docs/V4-FOUNDATION.md`
- Added: `scripts/audit-assets.mjs`
- Added: `src/components/design/ArtistLogo.tsx`
- Added: `src/components/design/ScenePrimitives.tsx`
- Added: `src/components/v4.css`
- Added: `src/components/world/WorldMapArtwork.tsx`
- Added: `src/data/connect.ts`
- Added: `src/styles/tokens.css`

Saved preview evidence: desktop `/Users/admin/.codex/visualizations/2026/10/15/01a13dd7-5ef9-7e70-885f-65e3b5536c6e/ceo19-v4-desktop.jpg` and mobile `/Users/admin/.codex/visualizations/2026/10/15/01a13dd7-5ef9-7e70-885f-65e3b5536c6e/ceo19-v4-mobile.jpg`. Both were reopened with `view_image` for final inspection.
