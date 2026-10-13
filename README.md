> **Current creative foundation: FES AFTER DARK / SIGNAL 1.9.** The page now has five compact scenes: Home, Transmissions, Archive, World and Connect. The technical systems documented below remain in place; the previous long Music/Visuals/Gallery layouts have been replaced. See [the current art-direction guide](docs/design/FES-AFTER-DARK.md) for composition, token and motion ownership. Transmissions is a compact bridge for this stage, ready for its later detailed implementation.

# CEO 1.9 — The Signal System

Official artist website with its persistent Signal Object: Next.js App Router, React, TypeScript and Tailwind CSS. A continuous editorial experience built from the supplied artist photography, with dark digital, cream paper and CEO-blue states.

## Run

```sh
npm ci
npm run dev
```

Visit `/en` or `/fr`. `/` redirects to English. For production, run `npm run build` then `npm start`.

```sh
npm run lint
npm run typecheck
npm run build
```

npm is the package manager; the starting repository had no application, dependencies or lockfile. `.npmrc` uses a project-local cache and excludes incompatible optional native peer resolution for this browser-only project. TypeScript and ESLint are pinned to versions compatible with Next's lint plugins.

## Architecture

- `src/app/[locale]`: statically generated localized artist pages and `/press` professional pages. Root layouts emit the correct HTML language on the server.
- `src/app/(entry)`: English default redirect.
- `src/components/signal-page.tsx`: one shared page composition for both languages.
- `src/i18n`: typed English/French UI dictionaries, locale validation and date formatting.
- `src/data`: artist, releases, videos, gallery, socials and professional contact, shared by every page.
- `src/types/content.ts`: content types with nullable unprovided fields.
- `src/components/primitives.tsx`: Section, Container, SectionLabel, MassiveTitle, EditorialText, Metadata, PlatformLink, MediaFrame, Divider, ArrowLink and LogoMark.
- `navigation.tsx`: sticky navigation, native hash links, fullscreen modal index, current section and language switching that preserves section anchors.
- `gallery.tsx`: category filtering and native modal photo viewer, with keyboard arrows and focus return.
- `motion.tsx`: deferred GSAP/ScrollTrigger enhancement respecting reduced motion. Content is rendered and readable without animations.
- `public/images`: optimized, selected supplied images; source files remain untouched in Downloads.

Sections: `#home`, `#music`, `#visuals`, `#archive`, `#world`, `#connect`. Releases also have anchors such as `/en#release-kritika`. Native navigation preserves browser history. Contact uses `mailto:`; streaming/video/social links open their real supplied destinations. A single persistent player supports approved native previews and on-demand platform embeds.

Three.js, Fiber and Drei drive one persistent Signal Object; desktop postprocessing loads separately and is omitted on mobile or reduced quality. No Lenis, autoplay, microphone input, fake statistics, fabricated credits or EP promotion. The earlier first-stage handoff remains a historical record in `docs/HANDOFF.md`.

## Design tokens

All palette values live in `src/app/globals.css` under `:root`:

| Token | Value |
|---|---|
| `--color-black` | `#101110` |
| `--color-cream` | `#eae5d6` |
| `--color-blue` | `#24659c` |
| `--color-white` | `#faf9f4` |
| `--color-grey` | `#aba99f` |
| `--color-border` | `#3c3d37` |
| `--color-ink-border` | `#b8b3a5` |

Cream sections override the border token. Tailwind exposes `ceo-blue`, `ceo-cream`, `ceo-black`. Typography uses self-hosted Anton display and DM Sans interface fonts with their bundled licenses. Central gutter, section spacing, header height, duration and easing tokens control layout and motion. Photographic blue/cyan lighting remains intrinsic to the supplied photo; UI colors use the single CEO blue.

Mobile has its own stacked Signal Object composition, manually composed archive, single-column index and independent heading sizes. Desktop uses overlap, asymmetry, ruled catalogue rows and staggered photography. Rectangular geometry throughout.

## Assets and missing content

The six current covers are in `public/releases/`. Add future artwork under `public/images/releases/` and update `artwork` in `src/data/releases.ts`. Add approved video posters under `public/images/videos/` and update `poster` in `src/data/videos.ts`; six supplied official-video URLs now open a lazy fullscreen viewer. Gallery photos belong in `public/images/gallery/` with localized alt text and captions in `src/data/gallery.ts`.

Still missing:

- Higher-resolution masters if needed for large press exports; all six supplied 640 × 640 release covers are now connected.
- The release date of BCP D'ARGENT.
- Approved Apple Music/Deezer links and direct audio previews.
- Confirmed durations and production credits.
- Approved video posters, actual Instagram post URLs and optional verified photo metadata.
- A refreshed public EPK. Place it under `public/press/` and set `professional.epk` only after its content is approved. The supplied EPK includes an EP announcement the website must omit, so the current press page provides biography and a real email request link instead of hosting that PDF.

Unprovided values remain `null` or empty lists. The supplied “STOP THE RIOTS” reference is not CEO release artwork and is not published. The concept's generated portraits and architecture are not published either; all site photographs come from the supplied library.

See `docs/asset-inventory.json` for all 32 supplied photographs and the 20 sampled videos. `docs/design/signal-system-concept.png` records the six-section visual direction. `docs/HANDOFF.md` records files and validation.

## The Signal Object

`src/components/signal/` extends the existing page, routes, data and navigation:

- `SignalExperience.tsx`: deferred initialization, palette from CSS tokens, motion consent, context fallback, native visibility and modal pause, bounded pointer input and confirmed global playback integration.
- `SignalScene.tsx`: the single R3F Canvas, dedicated mobile camera, adaptive DPR/quality and WebGL lifecycle.
- `SignalObject.tsx`: persistent mesh transforms and uniform damping; no per-frame React state updates or CPU vertex-buffer rewriting.
- `SignalMaterial.ts`: MeshPhysicalMaterial extended with coherent gradient noise, vertex morphing, finite-difference normals, blue Fresnel rim, faint surface traces and sparse Connect nodes.
- `signalGeometry.ts`: one tiled subdivided UV plane, with duplicated patch-edge vertices so Archive can open real gaps.
- `signalMath.ts`: pure interpolation and damping plus the CPU reference used for static fallback rendering.
- `useSignalScroll.ts`: passive native scrolling and resize observation drive a reversible blend between adjacent states; no scroll-jacking or pinned scroll sections.
- `SignalLights.tsx`: cream key and CEO-blue directional lighting, blended by section.
- `SignalPostFX.tsx`: modest bloom/noise only on full desktop quality.
- `SignalSlot.tsx`: reserved layout space and server-rendered samples of the mathematical surface, readable without WebGL or JavaScript.

### Geometry

UV coordinates identify each vertex across all states. A 3.7 × 3 surface folds into a sphere of radius 1.35 via `mix(plane, sphere, morph)`. The same UV strip bends into an annular lens when the lens control rises. Archive contracts each tile around its center and offsets it deterministically; World sets fragmentation to zero, closes the longitude seam and collapses the latitude boundary vertices into poles. Finite differences of the final deformation supply smooth surface normals. No object replacement, image-textured globe, or opacity-based morphing.

### Section states and controls

Change the central `signalConfig` and `signalStates` in `src/components/signal/signalStates.ts`:

| State | Morph | Lens | Fragmentation | Behaviour |
|---|---:|---:|---:|---|
| Home | 0 | 0 | 0 | Slowly displaced architectural plane |
| Music | .2 | 0 | 0 | Deterministic harmonic compression and restrained pulse |
| Visuals | .55 | 1 | 0 | Annular optical surface |
| Archive | .62 | 0 | .7 | Separated UV patches |
| World | 1 | 0 | 0 | Clean abstract sphere |
| Connect | 1 | 0 | 0 | Sparse luminous junctions on the same sphere |

Every state also controls scale, rotation, camera distance, noise frequency/amplitude, metallic roughness, emission, surface trace influence and light intensities. `noise.strength`, `noise.speed`, `morphSpeed`, `bloom`, `grain`, `pointerStrength`, `cameraDistance`, and geometry/DPR limits are common tuning controls. BLUE remains the existing `--color-blue` token in `globals.css`; the scene reads it at initialization. Digital states use black; Music, Archive and World use the blue raw mode with paper grain. Existing editorial content remains in DOM beside or above the scene.

### Performance and accessibility

Desktop: 9,720 vertices / 15,360 triangles, up to 1.75 DPR, two noise octaves and optional bloom/noise. Reduced desktop: 2,880 vertices / 4,000 triangles, lower DPR, one noise octave and no postprocessing. Mobile: 1,728 vertices / 2,400 triangles, up to 1.25 DPR, one noise octave, dedicated camera and no pointer parallax or postprocessing. Quality can step down without replacing the section-state model. PerformanceMonitor adjusts DPR from measured rendering performance.

When a tab is hidden or a modal opens, the canvas uses `frameloop="never"`; resuming does not advance procedural time by the hidden interval. Geometry and materials are disposed on replacement/unmount. Three.js and the scene are not imported by the initial DOM/fallback logic; initialization starts after the first paint.

Reduced motion defaults to static sampled surfaces and avoids WebGL initialization. The localized Motion control allows deliberate opt-in or disabling animation; it changes only this page session. WebGL creation failure, context loss and shader errors restore the static path. The decorative canvas is hidden from accessibility APIs and has no pointer interception; links, text, navigation and media remain ordinary HTML.

The global music provider owns approved native audio and on-demand Spotify/YouTube embeds. Only confirmed playback events increase Signal intensity: noise +13%, harmonic deformation +10% and emission +8%. Merely selecting a release, opening an embed or following an external link does not energize it. Completed or buffering previews remain calm.

Run `npm test` on Node 24 (or a compatible Node version with native TypeScript stripping) for sphere radius/seams, real interpolated vertices, lens center, derived normal finiteness and frame-rate-independent reversible damping. The tests exercise the same CPU surface reference used by the static fallback. Lint exempts Three engine objects and ref-backed runtime data from React's immutability rule in the three imperative integration files only.

The 60 fps desktop goal and recent-phone smoothness are design targets, not universal measured guarantees; validate on the deployment's actual target devices. Canvas data attributes provide low-frequency state, quality, morph and frame-rate diagnostics for development inspection.

The installed React Three Fiber creates a Three.js `Clock`, which Three r186 marks deprecated in favour of `Timer`. This produces one upstream console warning when a Canvas starts; it does not prevent rendering. Application and shader errors still remain visible and trigger the fallback where appropriate.

## Frequencies / music experience

Music alone gains a new editorial release index. Hover, keyboard focus and click reveal the selected release; playback selection remains independent. Mobile reveals details directly beneath the selected row. BCP D’ARGENT switches Music to CEO-blue raw mode; other selections use black. All six supplied covers under `public/releases/` are connected; nullable artwork still supports deliberate placeholders for future releases. Brand glyphs are sourced and credited in `public/icons/SOURCES.md`.

### Add content

Edit `src/data/releases.ts`; keep missing dates, artwork, duration and credits nullable. The existing helper supplies these defaults. Add an entry to `releases`; the index numbers and count derive from the array. Give it a unique stable `id`, which creates `/en#release-ID` and `/fr#release-ID` links.

- **Spotify:** set `spotifyUrl` to the real supplied track/album/playlist URL. Existing `platforms: [{ platform: 'Spotify', url }]` entries also work; links deduplicate by platform. An entity ID is parsed from the supplied URL, never invented. The SDK and one embed load only after a Listen/Play/source-button action.
- **YouTube:** set `youtubeUrl` to the actual watch URL or youtu.be link, or use the existing platform list. The video loads only on request, with autoplay disabled and official controls intact. Minimizing pauses the video so playback never continues through a hidden YouTube player.
- **Preview:** place an approved direct preview under `public/audio/` and set `audioPreviewUrl: '/audio/approved-file.mp3'`, or supply an approved direct HTTPS asset URL. No previews are currently supplied. Native audio uses `preload="none"`, starts inside the explicit click handler, and exposes real duration/progress and a seek control. Audio errors remain visible; no Spotify stream URL is extracted or scraped.
- **Artwork:** place approved covers under `public/images/releases/` and set `artwork` to the public path. Original assets are used intact.
- **Other platforms:** add existing Apple Music, Deezer or other URLs to `platforms`; only real links render. Unsupported embed sources remain external links.

`MusicProvider.tsx` lives in the existing locale layout, above navigation, pages and footer. It owns a single audio element and at most one active embed, shared playback state (`isPlaying`, `activeTrack`, optional progress/duration), independent catalogue selection and player expansion. It persists across section anchors and Next.js navigation to the press page. Language changes use the existing locale root layouts, so switching language or reloading starts a fresh player session and never autoplays.

`PersistentPlayer.tsx` provides a bottom listening bar and a compact nonmodal expanded panel. Safe-area padding and page space protect the footer; header/menu remain above it. Native buttons support Enter/Space, Escape within the expanded panel minimizes it, and focus returns to the bar. Minimize preserves Spotify/native audio and the source instance; Stop destroys/unloads the current source. External platform links remain available when an embed is blocked or unavailable. Playback availability and preview length remain controlled by each platform, region and browser.

`EmbedPlayer.tsx` uses the documented Spotify iFrame API and YouTube IFrame Player API to observe real playback. No embed is created during catalogue hover or page load. Switching sources destroys the old controller before mounting the next; the initial embed always awaits a user play action. Preview-end and buffering guards prevent false playing states. API scripts are loaded once per page only after a source request, with loading timeouts and retry paths.

References: https://developer.spotify.com/documentation/embeds/references/iframe-api and https://developers.google.com/youtube/iframe_api_reference


## Visual transmissions / Archive 1.9

`src/components/transmissions/TransmissionsExperience.tsx` unifies each release into one compact selector / artwork / actions deck. Desktop has a numbered selector on the left, one artwork in the centre and LISTEN / WATCH on the right. Mobile uses a native horizontal title rail below the artwork. Click, arrow keys, artwork drag/swipe, next/previous and horizontal wheel gestures change the selected release; vertical scrolling stays native. Release fragments remain shareable and browser Back/Forward restores committed selections. Hover previews artwork and art direction without starting media.

`TransmissionViewer.tsx` loads one privacy-enhanced YouTube player after WATCH. It never autoplays; previous/next and arrow keys browse films, Escape closes and focus returns to WATCH. Shared `useMediaDialog.ts` locks body scrolling and contains focus. Opening a film stops the persistent music source. The Signal becomes a reflective frequency disc here, blends toward a lens on WATCH hover/focus, and pauses rendering while a dialog is open. `src/data/transmissions.ts` controls supplied atmospheric phrases, visual modes, energy and EN/FR interface copy. No film poster panel or repeated release section remains.

`ArchiveExperience.tsx` and `gallery.tsx` render nine supplied photographs on a twelve-column editorial system, with deliberate gaps, varied aspect ratios, cream paper blocks and oversized indices. Each entry declares a desktop placement and an independent mobile composition. Category filters derive from actual data. The immersive viewer loads only the selected large image, supports wrapped previous/next, arrows, Escape and focus return. Images use `next/image`, responsive `sizes` and lazy loading. Unknown location, year, medium and credits remain absent.

### Add a photograph

Place approved files in `public/images/gallery/` and add one object to `src/data/gallery.ts`:

```ts
{
 id: 'unique-photo-id', type: 'image', src: '/images/gallery/photo.webp',
 alt: { en: 'Accurate description', fr: 'Description exacte' },
 category: 'street', caption: null, metadata: null,
 layout: 'portrait-large', placement: { column: 1, span: 6, offset: 0 },
 mobile: 'full', paper: true, crop: '50% 50%',
}
```

Layouts: `portrait-small`, `portrait-large`, `landscape`, `square`, `full-width`, `offset`, `floating`. Desktop placement uses columns 1–12, a column span and a pixel offset; omitted placement receives a rhythmic default. Mobile choices are `full`, `inset`, `edge`. Optional metadata supports `reference`, `location`, `year`, `format`; supply only verified values. Categories support shooting, street, Fez, backstage, fashion, live, visual stills, Instagram, campaign and lifestyle, plus portrait/studio.

### Add an Instagram post

Use `type: 'instagram'`, a real `postUrl` and `fallbackImage: '/images/gallery/approved-image.webp'` (or `null`) instead of `src`. Include the same localized alt text and layout options. Caption is optional/nullable. The archive always provides a View on Instagram link; it uses the supplied fallback rather than scraping posts or depending on third-party embed availability. With no fallback, a neutral Instagram panel appears. No post URLs were supplied yet.

### Add a film

Add one entry to `src/data/videos.ts` with a stable `id`, `title`, real YouTube `url`, `releaseId` (or `null`) and `poster` (public image path or `null`). Place posters in `public/images/videos/`. Optional `fallbackImage` and localized `imageAlt` explicitly identify an artist image while the approved poster is missing; they are never labelled as film stills. Optional `crop` and verified `metadata` control the presentation. Index, film frame and viewer navigation derive from the array. Each film has a directly linkable `#film-ID` anchor; each photograph has `#archive-ID`. Shared localized UI copy lives in `src/components/media/mediaCopy.ts`.


## Final production pass

Home leads with CEO / 1.9, one Enter the signal link and the existing plane. A brief photographic street-to-sound sequence links the selected release, selected film and World without claiming an unknown latest release date. World presents confirmed facts (Samadi, Fez, independent artist, official project began late 2025), facade photography and the same mesh's sphere endpoint. Connect uses large social rows, real handles, recognizable official icons and a secondary HKZ visual-network credit. The cream Press route has a concise biography, real contact/social links and honest EPK/press-download placeholders. Footer typography closes with Fez → World.

### Final folder architecture

```text
src/app/                  App Router pages, locale roots, SEO routes, icon, CSS
  (entry)/                Default English redirect
  [locale]/               Shared EN / FR pages and press/page.tsx
  robots.ts, sitemap.ts   Domain-aware crawler routes
src/components/
  editorial/              HomeExperience, WorldExperience, ConnectExperience
  signal/                 Existing persistent WebGL geometry and section states
  music/                  Catalogue, provider, persistent player, embed APIs
  media/                  Film sequence/player, Archive section, dialog utilities
  gallery.tsx             Data-composed archive and image viewer
  Analytics.tsx           Delegated events and confirmed music playback
  Cursor.tsx              Initialized fine-pointer-only cursor; native modal cursor
  PageArrival.tsx         Fast blue route arrival; absent for reduced motion
  navigation/footer       Shared navigation, focus-managed index, monumental footer
src/data/                 Artist, releases, videos, gallery, socials, professional, editorial
src/i18n/                 Locale validation and common dictionaries
src/lib/                  SEO, shared motion controls, provider-neutral analytics
src/types/                Structured content contracts
public/releases/          Supplied six release covers, filenames preserved
public/images/            Supplied optimized photos, editorial photo, OG image, grain
public/fonts/             Self-hosted licensed Anton and DM Sans
public/icons/             Official brand shapes and their source/license record
tests/                    Geometry, sources, archive navigation and event classification
```

### Shared motion and grain

`src/lib/motion.ts` controls 220 ms micro, 420 ms interface/page arrival, 760 ms editorial reveal, 22 px reveal distance, 4 px hover travel and the shared easing. Locale layout applies those as CSS variables; GSAP reads the same values. WebGL keeps reversible exponential section damping in `signalStates.ts`; the background transition shares the editorial duration. Touch/reduced-motion users retain the native cursor and ordinary page content. Cursor hiding starts only after a real mouse move and completed positioning; modals immediately restore the native cursor. The single backdrop grain layer is .018 digital / .055 raw, behind photographs; static Press backgrounds use the same grain asset if extended later. Bloom reduced to .16, shader grain to .004.

### Analytics

`src/lib/analytics.ts` exports `track` and `setAnalyticsProvider`. Default behavior dispatches a local `ceo:analytics` CustomEvent and sends no requests, sets no cookies and loads no vendor SDK. Register one adapter inside the client Analytics component after choosing a provider/consent policy. Events prepared: music_play (confirmed native/embed playback), spotify_click, youtube_click, social_click, video_play (official API PLAYING), archive_open, contact_click, epk_click and language_change. Properties contain stable content identifiers and locale/source, not visitor personal details. Opening an embed never counts as playback.

### SEO and environment

`src/lib/seo.ts` sets the exact official title, factual EN/FR descriptions, canonical URLs, language alternates, OpenGraph/Twitter image and confirmed Person structured data. `src/app/icon.svg` is a replaceable 1.9 favicon. The OG JPEG and icon are static brand assets using the current token palette; update them when rebranding.

**SITE_URL** is the only site configuration variable: set it to the confirmed HTTPS origin before building production. No API keys are required. The official domain has not been supplied; localhost is the explicit development metadata base. Indexing and public sitemap entries remain off until an HTTPS SITE_URL is set. Vercel Preview remains noindex even with that domain configured. `.env.example` documents the field. Rebuild after changing it because localized pages and metadata are statically generated.

### Where to add future content

- Releases: `src/data/releases.ts`; covers under `public/releases/` or `public/images/releases/`, approved previews under `public/audio/`. Change `featuredRelease` explicitly when the selected feature changes; never derive "latest" from an unknown date.
- Clips: `src/data/videos.ts`; approved posters under `public/images/videos/`. First entry drives Home's selected transmission.
- Photos/Instagram posts: `src/data/gallery.ts`; assets under `public/images/gallery/`. Actual post URLs and supplied fallback images only.
- Home/World photos and editorial EN/FR copy: `src/data/editorial.ts`.
- Updated EPK: `public/press/`, then `professional.epk` in `src/data/professional.ts`. Approved downloads: append `{id,src,alt:{en,fr}}` to `professional.pressImages`; the Press route renders downloads automatically.

### Vercel deployment

1. Commit the project (currently the existing repository contents are untracked) and push it to your Git provider.
2. Import that repository in Vercel, use the Next.js preset and repository root. Select Node.js 24.x; package.json declares it. Use npm with the existing package-lock.json, `npm run build`, and default output settings. Do not static-export this application: keep Next image optimization.
3. Add confirmed HTTPS SITE_URL to Production environment variables. Add the desired public domain in project settings. Keep Preview indexing disabled.
4. Deploy a preview, exercise both locales, Press, embeds and WebGL on actual phones, then deploy Production. Verify real-domain canonical/alternate/OG URLs, robots.txt and sitemap.xml. Changing environment variables requires a redeploy.

Official references: [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions), [environment variables](https://vercel.com/docs/environment-variables/managing-environment-variables).

### Missing content and launch recommendations

- Confirmed public domain (SITE_URL).
- Updated public EPK without the old future EP announcement; approved downloadable press photography.
- Approved film posters/stills; current artist-image fallbacks are labelled honestly.
- BCP D’ARGENT release date, optional durations/credits and verified photo metadata.
- Actual Instagram post URLs, any approved audio previews and Apple Music/Deezer links.
- Analytics provider choice if real collection is wanted; current abstraction is local only.

The six supplied release covers and all supplied streaming/video links are in place. No artist biography, representation, stream counts or future releases are fabricated. Before launch, verify rights/approval for published assets, test actual iOS Safari/Android and target desktop browsers, test regional platform playback and check social card previews against the final domain. The 60 fps goal is not a guarantee on every device. YouTube may capture Escape while embedded controls have focus; the persistent Close control remains accessible. The upstream React Three Fiber / Three r186 Clock deprecation warning remains documented above.
