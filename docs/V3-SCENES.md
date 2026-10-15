> Current implementation status and approved logo variants are documented in [V3-AUDIT.md](V3-AUDIT.md). This file records an earlier milestone.

# CEO1.9 V3 — Home and scene interactions

This continues the existing asset, typography, persistent-film and LIGHT UP foundations. No dependencies or replacement project were introduced. Cinema and Genius lyrics have since been implemented; see the current media architecture in README.md.

## Architecture

The document remains the scroll container, with CSS mandatory vertical snap and five `100svh` minimum scene areas. CONNECT owns the footer. Content can grow at short viewport heights or increased text size; paging exposes that content before advancing. There is no pinned scroller or fixed nested container around the scenes.

`SceneFlow` tracks active/settled scenes and enhances native scrolling. Ordinary wheel deltas remain native; an accumulated-intent fallback handles small gestures that snap back to their origin, and a boundary guard drains only overshoot/momentum tails. A new gesture after 190ms of quiet remains available. Touch vertical panning remains native. GSAP adds finite, different destination reveals without controlling document scroll position.

Links, PageUp/PageDown, deep links, Back/Forward and language changes share hash resolution. Explicit scene navigation focuses the destination after alignment. The skip link focuses the main landmark. Pointer, native paging and focus changes clear abandoned navigation requests. Release and legacy film hashes resolve to MUSIC. Archive drag and Music swipes claim gesture ownership only after horizontal intent is clear and release it on completion/cancellation, blur and unmount. Dialogs own background focus/scroll; scrollable panels can use `data-scroll-owner` to yield to document navigation at their edges.

The adaptive navbar uses the actual primary JPG, five localized labels and a moving blue marker. The native fullscreen menu opens/closes through a Fez-inspired aperture over the existing film. Its native close event restores opener focus after top-layer teardown and the header's visibility mask have cleared; it preserves focus in a newly opened dialog or a chosen scene landmark.

Home has one dominant film, two condensed headline lines, restrained original architectural SVG, small origin/artist details, a corner official logo and one scroll cue. Six depth planes use separate coefficients in `visualEffects.ts`, intensity .8 and mobile factor .28. `GlobalParallax` writes independent CSS translate/rotate properties through one event-driven frame scheduler, leaving GSAP transform effects independent. It stops at rest and in hidden tabs. Pointer events do not update React state.

The original compact SVG leaf cursor supports DEFAULT, PLAY, VIEW, DRAG, ENTER and CLOSE, bounded velocity rotation/scale, no particle trail, native input cursors and no touch cursor. A manual popover keeps it visible over native dialogs.

The system's reduced-motion setting is the default. The header's MOTION / FX control and the menu's localized Full motion toggle offer an explicit choice, stored persistently in localStorage as `ceo19:motion:v3` and synchronized between tabs. Former session choices migrate automatically; the menu can restore the device setting. Reduced mode releases the decoder and disables parallax/cursor/smoke. Full mode opts back into CSS and JS effects without changing the OS setting. The existing video element stays mounted across scenes and releases; MUSIC hides it visually. Reloading or changing locale creates a new document and can restart playback.

## Files

- Composition: `src/components/editorial/HomeExperience.tsx`, `src/components/navigation.tsx`, `src/components/scenes/scenes.css`, `src/components/signal-page.tsx`.
- Scrolling/transitions: `src/components/scenes/SceneFlow.tsx`, `SceneTransitions.tsx`, `src/lib/sceneNavigation.ts`, `visualEffects.ts`.
- Shared motion/presentation: `src/components/visuals/GlobalParallax.tsx`, `GlobalVisualBackground.tsx`, `VisualExperience.tsx`, `visuals.css`, `src/lib/signalMotion.ts`, `src/components/Cursor.tsx`, `v3.css`.
- Interaction/focus: `src/components/archive/useSpatialArchive.ts`, `src/components/music/MusicExperience.tsx`, `src/components/media/useMediaDialog.ts`; destination landmarks in Archive, World and Connect.
- Documentation: `README.md`, this handoff. Existing content and real asset paths remain unchanged in this continuation.

## Verification — 14 October 2026

Actual commands executed in the current continuation:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start -- --port 3002
git diff --check
```

Lint, typecheck, build and all 22 existing tests pass. The production preview was rebuilt/restarted while repairing focus, then reloaded in the existing in-app browser tab. No new browser tabs or dependencies were required.

In-app browser checks covered the natural 598×766 viewport, 390×844 mobile layout and 1440×900 desktop layout. Verified native wheel settling, small scroll bursts, PageDown, scene anchors, interrupted anchor navigation, Archive dragging followed by vertical navigation, Music swiping without section movement, Back/Forward, EN/FR hash preservation, skip-link landmark focus, menu Shift+Tab containment and Escape focus return. At 390×844 all five sections measure 844px high and document width is 390px. No horizontal document overflow was observed at the tested sizes.

The preview requests reduced motion. Verified its poster-only default, explicit full-motion opt-in, explicit reduction releasing the source, and choice persistence across reload/language changes. Returning sessions retain the intro marker. Replayed LIGHT UP with Space in full mode: the lighter animation and smoke canvas activate, the native dialog closes after the 2.2-second reveal, focus reaches main, and one silent video remains playing. Verified distinct live parallax translations, active marker sizing, MUSIC video opacity zero while playback continues, and no final console warnings/errors.

Previous implementation validation also exercised Chromium pixel-delta streams and synthetic touch input. Those are simulations, not physical device certification. Physical Mac trackpad inertia and mobile Safari touch behavior still need device checks; the in-app viewport override changes dimensions, not its mouse into a touchscreen. Browser-specific snap physics remain a practical limitation. This document records the earlier scene pass. The later Music continuation implements Cinema and on-demand Genius lyrics using these interaction boundaries; its current architecture is in README.md.

Screenshots live in `/Users/admin/.codex/visualizations/2026/10/13/01a13777-75d2-7493-9ce4-94d4cc67c811/`: `v3-home-final.png`, `v3-menu-final.png`, `v3-mobile-final.png`.
