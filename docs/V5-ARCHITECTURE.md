# CEO1.9 V5

This is an incremental change to the supplied working V4 tree. Existing uncommitted work, original assets, the intro controller, music carousel, cinema, lyrics, providers and player state are preserved. No dependencies were added or upgraded.

## Destinations

| Experience | English | French |
| --- | --- | --- |
| Public artist site | `/en` | `/fr` |
| EPK / Media | `/en/epk` | `/fr/epk` |
| Shop Coming Soon | `/en/shop` | `/fr/shop` |

Public scene order is HOME → MUSIC → ARCHIVE. SHOP is a separate route in the primary navigation; EPK / Media is secondary menu and footer access. The footer holds the four supplied artist destinations and professional contact. Booking shortcuts were removed from the mobile Home hub.

## Content migration

- WORLD biography: moved verbatim from `artist.biography` into `epkBiography` in `src/data/epk.ts`. The public client graph no longer imports the detailed biography.
- WORLD positioning, origin and official late-2025 project launch: presented in the EPK biography and milestone sections.
- WORLD professional links and HKZ identity: moved into EPK production/contact; the original HKZ logo and supplied social destinations are reused. Channel-level credit is distinguished from unavailable per-track credits.
- `/press` information: consolidated in EPK with the shared catalogue, video references and a curated display gallery. Press downloads require an explicit approval allowlist; original-photo/logo download controls were removed in the dedicated EPK pass. The former route permanently redirects to EPK in its locale. See [EPK sources and publication configuration](V5-EPK.md).
- SHOW documentary: the same playlist/controller now renders in ARCHIVE as `ArchiveDocumentary`, behind the existing curated photo space. Four of its six reviewed H.264 excerpts now run in a fixed, gapless-dissolve playlist; all exports retain their exact `/media/world/` filenames and source timestamps. See [the eight-photo/four-clip curation](V5-ARCHIVE.md). The 409 MB original MOV is preserved and never streamed as a background. EPK contains no video background.
- Public social links: reduced to a compact footer, with no explanatory previews or large CONNECT scene.

Only the supplied project launch is presented as a milestone. No press quotes, audience metrics, awards, unconfirmed EP, release dates or individual production credits were invented. BCP D’ARGENT retains its missing-date state.

## Compatibility and history

- `#world`, `#world-title`, `#world-biography-label`: browser replacement to the same locale’s `/epk#biography`. Hashes never reach the server, so SceneFlow handles this compatibility step.
- `#connect`, `#network`: the compact footer below ARCHIVE; footer scroll destinations clamp to the real document end.
- `#release-*`, `#film-*`, `#archive-*`: retain the existing selection controllers and scene destinations.
- Native history restoration and locale switching preserve destination paths and hashes.

## Architecture and loading

New server-rendered features live in `src/features/epk/` and `src/features/shop/`, with shared `ExperiencePage`, navigation and footer components. The established public, archive, intro and audio directories remain in place to limit churn. One existing MusicProvider remains in the persistent locale layout; no second state manager is introduced. Idle player chrome is hidden on the professional/store routes; an engaged player remains accessible.

Each new page imports its own styles/content. Navigation disables automatic route prefetch for the new destinations. Direct EPK and Shop loads do not run the intro, global film or public parallax, and never request documentary clips or third-party video players. The global film pauses behind MUSIC and ARCHIVE; ARCHIVE alone starts its documentary decoder after entry and releases it on scene exit, menu opening, reduced motion or hidden-tab state.

The public asset manifest remains `src/data/assets.ts`. `node scripts/audit-assets.mjs` recursively verifies names/byte counts, hashes files, inspects dimensions/video tracks and writes `docs/V5-ASSETS.json`: 122 files, including 116 classified content assets and six filesystem metadata files. Original media was not modified.

## Deliberately deferred

- The historical inventory names an EPK PDF, but its actual file is absent from the checkout and could not be inspected. No performance metrics are published. `assets.epk` remains null and the EPK offers a truthful email request instead of a broken download. Set that manifest entry to an approved actual local PDF when supplied; the existing button will become a download.
- No verified press coverage or technical rider has been supplied. EPK offers contact for these materials.
- Shop is an editorial black/cream/CEO-blue SOON print with drag/keyboard depth, future categories and a single early-access action. The optional Shop-only dialog contains the real email/SMS consent form. The selected Vercel/serverless target uses Neon Postgres over HTTPS, with a restricted application login, atomic channel writes, consent audit, suppression and shared rate limits. Managed Neon connection/deployment is not yet configured. SQLite stays local development only for this target and is rejected on serverless hosts; broken remote storage never falls back to an empty local database. Verification/delivery states remain explicit. See [waitlist storage and activation](V5-MARKETING.md). Typed server-only Shopify configuration and commerce contracts remain prepared; product operations, cart/checkout and live commerce remain unimplemented. See [Shop architecture and integration status](V5-SHOP.md).
- Sound entrance and global interface sound are now implemented in the subsequent [V5 sound pass](V5-SOUND.md); cleared artist excerpts and final store art direction remain outstanding.

## Validation

Required commands: `npm run lint`, `npm run typecheck`, `npm run build`; regression suite: `npm test` (68 tests). The existing installed Next.js 16.4.0 emits a security-advisory warning; the build succeeds after its one-time reminder. Dependency remediation remains separate from V5.

Browser QA uses the production server at `http://localhost:3100`, Playwright with installed Chrome, desktop 1440×1000 and mobile 390×844. The Browser plugin was not available in this session. Temporary QA scripts, screenshots and logs are outside the repository in `/tmp/ceo19-v5-*`. Provider playback depends on external services; opening/closing the selected cinema is tested independently of provider playback availability.

The primary browser run passed 31 checks with zero console/page errors. It covered all four EPK/Shop locale routes, no public media requests on those direct loads, three public scenes, no public biography, music release selection and cinema open/close, photo viewer open/close, CONNECT footer visibility, old press and WORLD destinations, route Back navigation, mobile menu navigation and locale switching, direct TIMALS selection, actual documentary playback and release of the documentary source behind the menu. No blank pages or framework overlays appeared. Desktop and mobile screenshots were inspected for clipping, overlap and readability. Build inspection also confirms that the detailed biography appears only in EPK HTML and in no client JavaScript chunk.

Safari, Firefox, physical phone gestures, and successful third-party streaming playback were not verified. Browser can be installed for future in-app navigation and QA; this pass used the already available Playwright runtime without adding project dependencies.
