# Fes After Dark / Signal 1.9

This stage establishes a new world and compact scene structure. It is not the final detailed Transmissions experience.

## Composition

Five semantic, directly linkable scenes: `home`, `transmissions`, `archive`, `world`, `connect`. Music and films share a compact bridge scene; their structured sources, manual playback and immersive viewers remain intact. Existing `#music`, `#visuals`, `#release-{id}`, `#film-{id}` and `#archive-{id}` targets remain usable. Release and film hashes select the corresponding record without starting playback.

Home pairs authentic night photography with a street-print ticket and a material study of the Signal. Archive is a finite horizontal wall with native touch/focus scrolling and explicit previous/next controls. World uses an abstract opening, a photograph and confirmed artist facts. Connect uses the supplied DJ photograph and the real artist and HKZ links.

## Source of truth

- `src/data/nightWorld.ts`: five scenes, three worlds, locale copy, photograph references and supplied atmospheric phrases.
- `src/components/world/Architecture.tsx`: abstract passage/stair/opening elevations. These are not a geographic map, a specific landmark or claimed architectural survey.
- `src/components/world/world.css`: scene composition, passage masks, spatial typography, manual mobile layouts.
- `src/app/globals.css`: palette, fonts, shared navigation, player, modal and press primitives.
- `src/lib/motion.ts`: shared timing, reveal distance, phrase travel and photo scale.
- `src/components/motion.tsx`: reversible scroll-driven phrase displacement, passage tracing and photograph reveals; no scroll pinning or wheel interception.

Night uses deep black, photographic shadows and silver. Street Print uses CEO blue, cream lettering and grain behind imagery. Signal uses dirty paper, architectural negative space and the existing morphing surface. The palette remains centrally editable; photographs retain their original colors.

## Preserved systems

Next routes and server metadata; EN/FR data; artist facts and URLs; release/gallery/video data; global single-source music provider; manual iframe loading; fullscreen film/photo viewers and focus restoration; analytics abstraction; reduced-motion behavior; adaptive WebGL quality and tab/modal suspension.

The six physical Signal states are preserved. Five scroll anchors map into them. Hovering/focusing the Transmissions film window activates the lens state. A filled, rounded-coordinate CPU material study replaces the horizontal wireframe fallback. This is the same plane/sphere mapping, not a second random model.

## Reference and intentional adaptations

`fes-after-dark-foundation.png` is the generated foundation board, not a production image or a claim about the artist. Implementation uses authentic supplied photographs and cover art instead of generated portraits, invented posters or invented city scenery. Only confirmed catalogue titles and real platforms appear. No SoundCloud or unconfirmed Apple Music links were added. Mobile framing and French title sizing are independently composed. Lower scenes remain foundation compositions rather than fully developed independent features.

## Later development

Build the detailed Transmissions journey on the existing `releases.ts`, `videos.ts`, MusicProvider and FilmPlayer. Curate additional photographs through `gallery.ts`. Approved film posters, direct legal previews and an updated EPK remain missing. No unconfirmed EP or artist details should be published.
