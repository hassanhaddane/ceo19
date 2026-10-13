# Archive camera / WORLD diorama

The existing routes, release deck, Cinema, global music player, gallery data, horizontal rail and shared Signal renderer remain intact.

## Archive

`src/components/gallery.tsx` still builds the horizontal contact sheet from `src/data/gallery.ts`. `useArchiveRail.ts` retains native touch/trackpad momentum, bounded mouse drag, wheel movement with normal page scrolling at the ends, keyboard browsing and drag-click suppression.

`src/components/archive/DarkroomViewer.tsx` replaces the generic photo dialog content. The native dialog retains body scroll lock, inert background and focus containment. Clicking a photograph measures the thumbnail and opens the image from that position. One warm cream exposure lasts 80ms, followed by a silent shutter and 560ms enlargement. The finished viewer shows the whole image on deep black, with index, caption, real optional metadata, previous/next and Close. No camera audio or fabricated dates/locations are added.

Photo changes use a 220ms contact-sheet snap. Smaller exposures are rate-limited to one per 800ms, including initial opening. React development effect replay cannot produce a second flash. Escape and Close share the 420ms shutter exit; focus returns to the original photo. Reduced motion skips exposure and traveling images and closes in 120ms. The shared renderer pauses while the dialog is open.

Tune these values in `motion.camera` in `src/lib/motion.ts`; geometry and palette live in `darkroom.css`. All existing photographs and Instagram fallbacks are preserved. New photos still belong in `gallery.ts` and `public/images/`.

## WORLD

`WorldExperience.tsx` is now a photographic diorama rather than a constellation of lifestyle labels. Visible copy is limited to WORLD 1.9, the localized Fez/Morocco line and CEO 1.9. Functional descriptions exist only as accessible button labels.

`src/data/worldScene.ts` selects the real night facade, studio and street photographs and the new abstract chrome asset. The studio/street sources reuse gallery entries by ID; retain those IDs when editing the gallery or update the selections here. No identities, friendships or family relationships are inferred from these images.

`diorama.css` assembles stepped openings, shadowed wall planes and stairs behind the artist. The main portrait remains central. A studio print, original HKZ mark, blue doorway photograph and reflective silver form occupy different depth layers. The existing Signal object sits behind the photographic planes.

Hover/focus previews a detail; click/tap selects it and a second tap clears it. The studio waveform activates, the doorway brightens its real photograph, the chrome form sends a slow reflection through the scene, the portrait has a small exposure response and the HKZ paper highlights. No tooltips or lifestyle word list appear. Desktop pointer parallax is bounded by `worldSceneConfig.parallax`; mobile gets its own vertical composition and no pointer parallax. Reduced motion keeps the scene and color discoveries without travel, flashes or looping waveforms.

## Asset provenance

All photographs and the HKZ logo are artist-supplied existing files. `public/images/world/chrome-ring.png` is an abstract material asset produced with the built-in Image Gen tool, not a photograph of artist-owned jewelry. Prompt: one polished silver/chrome oval sculpture, oblique still-life perspective, cream highlight and muted blue reflection, transparent ground, no people/text/currency markings. It is served through responsive Next Image; the original alpha is preserved. No generated people or studio imagery are used.

The prior WORLD word-button component, response copy and scoped constellation styling were removed. Its old concept document is historical, superseded by this implementation.
