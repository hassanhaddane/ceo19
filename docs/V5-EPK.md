# V5 EPK / Media

Routes: `/en/epk`, `/fr/epk`. Existing `/press` redirects and `#world` → EPK biography compatibility remain intact. The secondary menu and compact footer already use client-side EPK links. The public Home, Music carousel, Archive and sound system are unchanged by this pass.

## Editorial content

The former WORLD statement is exclusively professional content in `src/data/epk.ts`: Samadi / CEO1.9, independent Moroccan artist based in Fez; contemporary international rap connected to Moroccan everyday life; official project launch late 2025; local culture, fashion and visual storytelling. Both languages preserve that meaning. The core positioning is LOCAL ROOTS. GLOBAL REACH.

Seven modules: About, Music, Selected visuals, Milestones, Press / Media, Production, Contact. Selected official videos sit within Music; the legacy `#videos` anchor remains available. Natural document scrolling, no scene snap, WebGL, show footage, player embeds or intro on the professional routes. Sections preserve `#biography`, `#discography`, `#media`, `#press`, `#production`, `#contact`; `#milestones` is added.

Discography derives from the shared six-release catalogue; only supplied dates render. BCP D’ARGENT has no date and none is inferred. Three official YouTube references: BCP D’ARGENT, MACHI BATEL, ORIGINAL. Their thumbnails are existing release covers, explicitly labelled as cover artwork rather than video stills. No external player initializes on this page.

Hero: official black CEO logo and `/images/portrait.webp`. Selected display photography: `/images/live.webp` (artist with microphone on stage) and `/media/archive/bcp-6845.webp` (yellow bus photo session). Existing image colors and HKZ logo remain intact. A route-local event-driven component adds bounded 8px pointer depth with CSS damping, no continuous RAF. Coarse pointers, reduced-motion preferences and the existing site motion setting disable it. Only image depth and the copy-email control are client components.

Media, label, brand and live categories describe enquiries and future opportunities, not existing partnerships. Production uses HKZ PROD / HKZ GANGSTATION, the supplied logo, official Instagram and YouTube links. Email is CEO1.9CONTACT@GMAIL.COM; clipboard denial/unsupported browsers show a manual-copy instruction without an exception or misleading success state.

## Source and publication status

The actual PDF is **not present in the current checkout**, including hidden project files and recursive public assets. The old `docs/source-asset-inventory.json` names `CEO 1.9 — EPK Media.pdf` (three pages, `publicDownload: false`), and `docs/HANDOFF.md` records that it was withheld because its contents conflicted with publication instructions. Searches of Documents, Downloads, Desktop and the indexed filename also did not locate it. This is a historical inventory reference, not evidence that a usable downloadable file exists now.

Consequently the PDF could not be inspected, its 2026 traction snapshot/date cannot be verified, **no audience or stream figures are published**, and the page provides a genuine email request rather than a fabricated download. `epkSources` records this absence. No historical figures are presented as current; no press coverage is invented.

`professional.pressImages` is empty: supplied photographs are selected for existing website display, but no explicit permission for downloadable press reuse is recorded. EPK therefore offers a press-image request. The former unguarded original-photo/logo download controls have been removed; original files stay untouched in public. This is a UI publication allowlist, not private asset storage.

To publish approved resources later:

1. Supply/review the actual PDF. Place the approved document under `public/press/` with a descriptive name such as `ceo19-epk-en.pdf`, set `assets.epk` to that real path, and register its exact bytes/role in the central public asset manifest. The existing control then becomes DOWNLOAD EPK. Do not relabel an outdated kit as current.
2. If publishing historical metrics, transcribe only source-supported figures with their exact reference date and an explicit historical-snapshot label. Retain source page provenance in the data. No source date means no displayed figure.
3. Add only explicitly approved press files to `professional.pressImages`, using descriptive filenames (for example `ceo19-press-portrait.webp`) and localized descriptions. The page renders downloads only for this allowlist. Keep the selected display images separate from reuse approval.

EPK metadata has route-specific factual EN/FR descriptions, existing official social imagery, canonical URLs and language alternates. It does not alter public metadata or bundles.
