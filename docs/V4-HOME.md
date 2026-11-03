# CEO1.9 V4 — responsive Home and scene navigation

## Result

Desktop Home gives the full screen to the existing film, with the supplied official header logo, a discreet BCP D’ARGENT direct listening action, artist Spotify/YouTube links and MUSIC access. No central duplicate logo, biography, platform cards or invented slogan is rendered. The unused Home slogan dictionary fields and old portrait/Home styles were removed.

Mobile Home is a server-rendered music hub: official identity in the header, the actual BCP D’ARGENT cover, direct Play/Watch links, artist platform actions, immediate booking email, six compact cover rows, contact and MUSIC access. The first actions fit at both 390×844 and 320×568. The six rows use the exact same Release objects as MUSIC; no release title, image or platform URL is copied into a separate catalogue. BCP remains the featured record and its unknown date remains null. The live Grezer reference was inspected and confirms its featured position and six-release hierarchy.

Only the existing supplied Spotify and YouTube destinations are displayed. No Apple Music or Deezer destination was newly verified or added. An unavailable per-release Spotify source falls back to an explicitly labelled artist action; an unavailable video does not fabricate a Watch destination. Every current release has its supplied direct Spotify and YouTube destination.

## Scroll, navigation and motion

The five document scenes remain HOME / MUSIC / ARCHIVE / WORLD / CONNECT. Desktop retains one-gesture adjacent scene settling, input/drag ownership and compact-on-scroll navigation. Mobile Home grows with its content. While Home is being read and its final links are still passing through the viewport, its document-level snap is disabled. It resumes when MUSIC reaches the top, avoiding premature snapping during longer swipes. A long wheel burst first pauses at the hub’s readable end; a fresh gesture can continue to MUSIC. Native touch/keyboard paging stays free through the exit. There is no nested panel or touch-scroll trap. Menu/anchor navigation can leave Home immediately, including from the middle of the catalogue. Release hashes continue selecting the matching MUSIC release.

Header motion and language utilities remain in the mobile menu. The mobile header shows the supplied official PNG, CEO1.9 and MENU. The idle player bar is hidden on Home, while a user-initiated active player remains available. Minimizing an idle Home player returns focus to Home rather than a hidden control.

The existing global MP4 decoder remains the only video element. Mobile uses a darker viewport-scaled overlay and a responsive crop; the old separate portrait layer is gone. The shared parallax scheduler moves the video, artwork and blue field. Links/actions are outside moving layers, with 44px release-platform targets. Existing 8/10 desktop and reduced mobile coefficients remain centralized. Reduced motion releases the movie source and uses the real poster with immediately available links.

## Exact assets and sources

- Global playback: `/media/ceo-visuals-background.mp4`, the existing silent faststart derivative of `/CEO19/CEO VISUALS/CEO visuels .mp4`.
- Official logos: `/CEO19/Logo/LOGO CEO OFFICIEL Blanc.png` and `/CEO19/Logo/LOGO CEO OFFICIEL Noir.png`.
- Six real covers: existing `assets.releases` entries under `/releases/`.
- Platform glyphs: existing `/icons/spotify.svg` and `/icons/youtube.svg`.
- Professional email: existing `professional.email`.

No public assets, dependencies, package-manager settings or original media were changed. No assets required for this Home are missing. Unrelated map/documentary gaps remain documented in the foundation audit.

## Production verification

`pnpm lint`, `pnpm typecheck`, `pnpm test` (48 passing), `pnpm build`, and `git diff --check` passed. New tests protect catalogue identity/order, direct destinations, unknown-date preservation honest missing-source fallbacks and long-gesture Home handoff boundaries.

Codex In-app Browser was used against the production build at `http://localhost:3019` and the existing dev server. No fallback browser was needed. Checked:

- Desktop 1280×720: full-frame moving silent film; one video element; direct links; no slogan; header compresses from 1160×72 to 930×62 after one gesture settles at MUSIC. Official PNG switches from white to black on the cream navigation surface.
- Mobile 390×844: actual cover loaded; Play and Watch end at y=560; all six rows and booking reachable within Home; reading state disables snap while Home remains in view; scrolling through its exit reaches MUSIC and resumes snap without pulling the last links away.
- Small mobile 320×568: title and both actions visible, actions end at y=432; no horizontal overflow; release-platform targets are 44×44.
- Clicking the FANTASTIQUE row preserved `#release-fantastique` and selected FANTASTIQUE in MUSIC.
- Locale change preserved release selection; French Home actions and titles fit without overflow.
- Reduced motion retained one video element with no source, removed artwork transforms and kept first-viewport CTAs accessible. Keyboard Tab reached the direct Play action with a visible outline.
- Production console returned no errors or warnings during these checks.

This is viewport and browser QA, not a physical iOS/Android or in-app Instagram/TikTok test. Third-party playback/login behavior was not exhaustively retested; supplied destinations are unchanged.

## Visual comparison ledger

Built-in Image Gen produced a planning board using the actual supplied logo, BCP cover and film poster as references. No generated art is shipped. The board and final production screenshots were reopened together with `view_image`.

Evidence directory: `/Users/admin/.codex/visualizations/2026/10/15/01a13dd7-5ef9-7e70-885f-65e3b5536c6e/home/`.

| Area | Concept → production comparison and decision |
| --- | --- |
| Composition | Desktop remains full film with small lower-edge actions and floating header; mobile gives the real cover one dominant focus. |
| Assets | Exact supplied logo/BCP artwork are used. Concept placeholders for five thumbnails are replaced by the actual catalogue covers. The concept's unrequested duplicate mobile cover backdrop is replaced by the required same persistent film. |
| Typography | Existing Anton display and DM Sans UI retained. Mobile title uses a smaller responsive scale than the planning board to keep both CTAs visible on short phones. |
| Palette | Existing sampled CEO blue #3572a3, cream #eae5d6 and black #080a0c retained; no chrome UI, purple, glass or pills. |
| Controls/icons | Existing real platform glyphs with text on artist actions, icon-only 44px targets on release rows. Direct email link replaces the board's redundant separate email button. |
| Density/spacing | Six 76px editorial rows, no giant repeated cards; generous gap after the mobile primary actions. A booking shortcut is added beside the platform row to satisfy immediate contact access. |
| Desktop data access | A restrained featured-release action is included above the icon row so desktop also consumes the shared catalogue, as requested. |
| Copy | Above-fold text uses only artist identity, actual release title, LATEST RELEASE, PLAY NOW, WATCH NOW, platform names, BOOKING, MUSIC and required navigation. No slogan replacement. French equivalents are localized. |

The rendered design was verified against the planning board with these brief-driven adaptations. No unresolved clipping, overflow, missing-artwork or contrast issue was observed in the checked viewports. The planning board is a design aid, not a user-approved pixel-exact screenshot spec.

## Files changed in this Home pass

- `src/components/editorial/HomeExperience.tsx` — responsive server-rendered Home, catalogue rows and direct actions.
- `src/components/editorial/home.css` — new Home composition, responsive controls, mobile film treatment and navigation details.
- `src/components/v4.css` — removes obsolete Home/portrait styles.
- `src/components/intro/intro.css` — removes obsolete portrait transition selectors.
- `src/components/navigation.tsx` — mobile official identity label.
- `src/components/scenes/SceneFlow.tsx` — mobile document-reading handoff and diagnostics.
- `src/components/scenes/SceneTransitions.tsx` — artwork entrance replaces removed giant Home lettering animation.
- `src/components/scenes/scenes.css` — removes obsolete moving-home overrides.
- `src/components/music/PersistentPlayer.tsx` — hides idle Home player without interrupting an engaged source; focus restoration.
- `src/app/[locale]/layout.tsx` — imports Home stylesheet in the existing ordered CSS entry point.
- `src/styles/tokens.css` — centralized Home cover, typography, row, tap and overlay tokens.
- `src/data/releases.ts` — stable featured lookup and a derived featured-first Home order.
- `src/lib/releaseAccess.ts` — validated release actions and honest artist fallback from existing social data.
- `src/lib/sceneScroll.ts` — mobile reading and wheel handoff policy.
- `src/i18n/dictionaries.ts` — removes unused invented Home slogans.
- `tests/homeMusic.test.mjs` — six catalogue/source and scroll-handoff regression tests.
- `docs/V4-HOME.md` — this report.
