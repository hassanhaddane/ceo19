# Archive / World / Connect production pass

## Scope and architecture

Home and the unified Transmission deck are preserved. Replaced the old Archive/World/Connect CSS in `world.css` with the dedicated `closingScenes.css`. Removed the biography-column composition, small social-link layout and club-photo Connect treatment. Connect now includes the landing-page footer; press pages retain the shared compact footer.

- `src/components/archive/useArchiveRail.ts`: native overflow for touch/trackpad; thresholded mouse drag and bounded, frame-time-adjusted inertia. Wheel moves the rail only while movement is possible; at either end vertical page scrolling resumes. RAF stops on tab hiding, teardown, wheel, filtering or keyboard navigation. Reduced motion disables mouse inertia.
- `src/components/gallery.tsx`: existing data, category filters, real images, nullable metadata and native fullscreen dialog retained. Arrow keys, Home/End, previous/next, Escape, focus restoration and scroll lock verified. Photos are responsive, lazy next/image assets; gallery order is unchanged.
- `src/components/editorial/WorldExperience.tsx`: five concepts from `src/data/closingScenes.ts`. Desktop pointer/focus previews; click/Enter/Space commits the concept for touch and keyboard. ARGENT reveals a silver reflection, STUDIO a waveform, FEZ the abstract passage network, NIGHT a dark scene, ART a different architectural crop. No family relationships or HKZ logo were fabricated.
- `src/components/editorial/ConnectExperience.tsx`: four large 2×2 zones use the original SVG brand shapes from `public/icons`, with platform name, handle and real official URLs. Shared Signal hover response retained. Email, HKZ and Press/EPK are secondary; EN/FR and current copyright are integrated below.
- `src/components/world/Architecture.tsx`: new abstract labyrinth elevation; explicitly not an accurate Fez map.

## Visual specification and comparison

Reference images:

- `docs/design/archive-contact-concept.png`
- `docs/design/world-constellation-concept.png`
- `docs/design/connect-zones-concept.png`

Initial screenshots and interaction QA used the Codex in-app browser. The final build was also rechecked in the available Chrome browser (the browser connection changed after the repeated user request). Production screenshots were captured through the browser plugin at the concepts' native 1536×1024 dimensions and inspected with `view_image`, alongside each concept. Mobile layout was inspected at 390×844, tablet at 768×1024. This verifies the composition against the references with the intentional differences below; generated concepts are not shipped as website imagery.

| Comparison | Concept / render evidence | Resolution |
| --- | --- | --- |
| Archive composition | Mixed photographs across one horizontal table, large cream heading, oversized phrase behind photos | Preserved mixed heights and offsets; initial rail shows four complete images and the next image edge. |
| Artist imagery | Concept generator altered the street photo pose and supplied ordering | Production uses the original supplied images and existing gallery order. No generated artist photos. |
| World silhouette | Large portrait framed by a stepped opening, five spatial words, abstract passages | Implemented a stepped clip-path with functional, reversible concept states. |
| Type and hierarchy | Condensed display headings with smaller metadata, four dominant social zones | Existing Anton and interface fonts retained; no biography essay or social icon row. |
| Palette / texture | Blue print Archive, cream architectural World, black/cream/blue Connect | Existing centralized CEO blue and paper tokens retained. Grain is lighter than the generated reference and sits behind photographs. |
| Brand shapes | Huge recognizable platform logos | Original supplied SVG masks retained, no generic icon substitutions. |
| Page length | One main scene for each section | At 1440×1024 all three scenes are 876px tall. At 390×844 Archive/Connect are 716px and World 720px. At 1536×1024 Archive needs 887px, World/Connect 876px. |
| Header / player | Concepts generated cream navigation, fake playback times and unrelated controls | Existing black navigation and honest persistent player deliberately retained. Unknown duration remains unknown. |
| Connect photography | Concept generator inserted tourist photographs and a monument | Omitted these invented images; the four official brand zones carry the composition. |
| NIGHT contrast | Cream inherited text on the paper roots statement became hard to read | Roots text explicitly keeps black ink on paper in every concept state. |
| Mobile footer | Initial ending extended slightly under the fixed player | Reduced mobile zone height and spacing; copyright now fits above the player. |

Allowed visible copy is the supplied artist vocabulary, artist facts, existing gallery captions, official social names/handles/email, localized controls and interaction labels. No lyric, new biography, fake duration or future EP was added. The background phrases remain atmosphere, never track lyrics or biography.

## Browser interaction checks

- Mouse drag moves the rail without opening a photograph. With motion enabled, release scroll was 530px and continued to 1071px through inertia.
- Vertical wheel and horizontal scroll both move the rail while leaving page scroll unchanged inside the rail. Native touch panning remains enabled through CSS; no touch event interception.
- Arrow/Home/End navigation, Enter opening, viewer previous/next, Tab containment, Escape, body scroll restoration and opener focus verified.
- World STUDIO click updated committed state and displayed the waveform; keyboard Enter on NIGHT updated the selected state and background. All five concepts share the same selection architecture.
- Live WebGL status was ready/rendering in Archive; rendering became false while the photo viewer was open. Reduced-motion static fallback remains readable and functional.
- Official social URLs and SVG mask sources verified. No iframes load before interaction. Production console reported no application errors.
- EN/FR inspected across 375, 390, 430, 768, 1024, 1280, 1440 and 1920px: zero horizontal page overflow and no overflowing headings or email.
- Physical touchscreen / real-phone gesture testing remains a launch check: the available in-app browser exposes viewport and mouse/keyboard input, but no touchscreen-emulation API. Mobile viewport, buttons and drag behaviour were verified; this is not claimed as physical-device testing.

## Validation

`npm run lint`, `npm run typecheck`, `npm run build` pass. All 19 existing tests pass. No dependencies were installed. Production preview remains at http://localhost:3000/en.
