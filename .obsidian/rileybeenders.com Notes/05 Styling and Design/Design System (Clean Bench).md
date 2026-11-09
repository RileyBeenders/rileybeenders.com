---
tags: [styling, design]
---

# Design System (Clean Bench)

The site's styling is plain global stylesheets: no CSS modules, CSS-in-JS or Tailwind. **Clean Bench** has been the system since 2026-11-09 (see [[Clean Bench (2026-11 redesign)]]). Everything is a tile:

- white rounded tiles on a pale grey-blue ground, under a floating glass nav;
- one cobalt accent from a pale wash to a deep fill, and a soft blue bloom behind the top of the page;
- Instrument Sans for headings and body, with Azeret Mono for small labels, dates and counts;
- project tiles that morph into their dialog;
- one easing curve.

| File | Imported by | Scope |
|---|---|---|
| `app/base.css` | the root `app/layout.tsx` | A bare reset only: `* { box-sizing }`, `body { margin: 0; min-height: 100vh }`, `img`, `button/input { font: inherit }`, `a`, `.sr-only`. Nothing visual. |
| `app/(site)/bench.css` | `app/(site)/layout.tsx`, first | The site design system (1,119 lines), everything scoped under `.bp`, in banner-commented sections: layout, nav, theme toggle, buttons, tile, bench, activity, summary, experience, projects, dialog, project body, stack, education, contact, footer, tables, marks, floating controls, responsive. Then print and reduced motion. It replaced `app/(site)/sheet.css` (Blue Sheet), which had replaced `blueprint.css`. |
| `app/(site)/bullet-link.css` | the site layout, after `bench.css` (also served to the Studio) | The resume bullets' Read more link and its `data-motion` variants. `bench.css` restyles it on the site as a tinted mono chip (`.bp .bp-bullet-link`). |
| `app/(site)/skill-pills.css` | the site layout (also served to the Studio) | `.bp-pill`, linked skills, their `data-border` loops and `data-reveal` cards. |
| `app/(site)/projects/projects.css`, `projects/feature.css`, `projects/walkthrough.css` | the site layout | `.pj-*` (gallery, lightbox, case study, date box, status, compare, post card, flow diagrams), `.ft-*` / `.tl-*` / `.dm-*` (the site entry's deep dive), `.wt-*` / `.pj-links`. `bench.css` softens their radii to the bench's (`--r`, `--r-lg`, pills). |

Token **names did not change** from Blueprint Press or Blue Sheet (`--paper --white --ink --ink-soft --muted --faint --rule --accent --blue --prose --pill-text --on-accent --tint --accent-soft --accent-fill --glow`, `--ease`). That is why the kept component sheets follow the palette without edits. New on the bench: `--mono` (from `--bp-font-mono`), `--gap`, and new values for the radii and shadows.

`design/` holds the Claude Design canvases the Blueprint Press direction was chosen from; they are history. The Clean Bench direction contract is `.impeccable/surfaces/app-site-page-tsx.md`. The reference token systems in `.claude/skills/design-guidelines/` (Tesla light, Bugatti dark) are what the Electric preset was seeded from, not the live system (see [[Repository Agent Skills]]).

## The machine-readable spec: `DESIGN.md`

The repo-root **`DESIGN.md`** (Google Stitch `DESIGN.md` format; `name: Clean Bench`) is the normative token list, including every font size and radius `bench.css` sets. Its sidecar is `.impeccable/design.json`. Both were rewritten for Clean Bench. The `impeccable` detector compares literal CSS values against them (see [[Impeccable Design Workflow]]). This note is the narrative and the file map. When a token changes, regenerate or hand-edit `DESIGN.md` in the same session.

Its named rules, for quick reference:

- **The One Blue Rule**: colour is one hue in five jobs (tint, soft, accent, fill, glow), plus a deeper `--blue` for drawn geometry and data.
- **The Bloom-Stays-Blue Rule**: the bloom is built only from `--accent-soft`, `--glow` and `--tint` at low opacity, drifts over 22s, and holds still under reduced motion.
- **The Deeper-in-the-Dark Rule**: dark mode lightens the accent for text and darkens the fill for surfaces. Any new fill uses `--accent-fill`, never `--accent`.
- **The Ramp Rule**: never hand-pick a gray or a wash.
- **The Portal Rule**: a portal lands inside `.bp` (`[data-bench-portal]`, used by the project dialog) or carries literal colours (the lightbox).
- **The Hard-Copy Rule**: `components/GanttChart.tsx`, `app/icon.svg`, `app/apple-icon.tsx` and `app/opengraph-image.tsx` carry literal copies of the active preset, now ink `#111318` and accent `#2457e6`.
- **The Mono-For-Small-Notes Rule**: Azeret Mono only for labels, dates, counts, tags and captions, never above 12px and never for a sentence.
- **The Weight Rule**: headings at 600 with negative tracking, emphasis at 500, nothing at 700.
- **The Studio Roles Rule**: four Studio font roles (header, sub-header, body, small labels) among ten preloaded faces.
- **The No-Eyebrow-Over-Sections Rule**: an eyebrow names a project's type only.
- **The Lift Rule**: hover lifts of 1px (filters), 2px (buttons, pills) and 3px (tiles), never more.
- **The Glass Rule**: anything floating is translucent white with a backdrop blur.
- **The Everything-Is-A-Tile Rule**: content is a tile or inside one, on the shared radius, border and shadow.
- **The Morph-Not-Modal Rule**: a project grows out of the tile the visitor touched and collapses back into it.
- **The Resume-At-Rest Rule**: with every tile closed, the home page is the resume in order.

## Palette presets and derivation

`lib/palettes.ts` holds **twelve** presets: default, **clean-bench**, blue-sheet, electric, forest, twilight, terracotta, ocean, graphite, amber, rose and slate. Each has five seeds per mode (`paper`, `white`, `ink`, `accent`, `blue`), run through `derivePaletteTokens()` in `lib/palette.ts`. The Studio's Site Settings picks one (`data/header.json` `theme.paletteId`), and `app/(site)/layout.tsx` injects the resolved tokens as a CSS override at render time. `bench.css`'s own `.bp { … }` and `html[data-theme="dark"] .bp { … }` blocks are the no-override fallback, and they match what `derivePaletteTokens()` produces for the Clean Bench seeds exactly.

- **The ramp** (from ink toward paper): prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87. `muted` is the floor for text, and `faint` is for lines and dots.
- **`deriveSheetTokens(seeds)`** (the name is kept from Blue Sheet):
  - `isDarkPalette()` tests whether the paper is darker than the ink.
  - `accentFill` is the accent on a light palette, and the accent **mixed 30% toward black** on a dark one.
  - `tint` is the accent mixed toward white (0.92 light, 0.86 dark), and `accentSoft` likewise (0.78 / 0.70).
  - `glow` is the accent mixed toward the paper (0.84 / 0.78).
  - `onAccent` is whichever of paper or ink reads better on the fill.
- **Currently active: `clean-bench`.** Light seeds: paper `#f4f5f8`, white `#ffffff`, ink `#111318`, accent `#2457e6`, blue `#173ea8`. Dark seeds: paper `#0f1115`, white `#181b22`, ink `#eceef2`, accent `#6a93ff`, blue `#9db9ff`.

## Tokens (the Clean Bench preset)

| Variable | Light / dark | Use |
|---|---|---|
| `--paper` | `#f4f5f8` / `#0f1115` | The ground. Also painted on `html` so the overscroll gutter matches; the dialog's floor; skill pills; the tile arrow |
| `--white` | `#ffffff` / `#181b22` | Every tile and control |
| `--ink` | `#111318` / `#eceef2` | Headings, primary text |
| `--prose` / `--ink-soft` / `--pill-text` / `--muted` / `--faint` / `--rule` | `#282a2e` `#4a4c50` `#535559` `#636469` `#838488` `#d6d8db` / `#d6d8dc` `#b5b7bb` `#acaeb2` `#9c9ea2` `#7e8084` `#2c2e32` | The ramp |
| `--accent` | `#2457e6` / `#6a93ff` | Text, icons, markers, focus rings |
| `--accent-fill` | `#2457e6` / `#4a67b3` | Solid buttons, active filters, the toggle thumb, the "This site" badge, a hovered Read more chip |
| `--tint` | `#edf2fd` / `#232c41` | Chips, the active nav link, table heads, the contact card's left column, the Read more chip |
| `--accent-soft` | `#cfdafa` / `#313f64` | The bloom, the hero tile's glow, the calendar's first step |
| `--glow` | `#d3dcf5` / `#232e48` | The bloom's second wash |
| `--blue` | `#173ea8` / `#9db9ff` | Drawn geometry and data only |
| `--on-accent` | `#f4f5f8` / `#eceef2` | Text on the fill |
| `--line` | ink at 9% / 11% | Tile and control borders |
| `--bp-font-header` / `--bp-font-subheader` / `--bp-font-body` / `--bp-font-mono` | Instrument Sans ×3 / Azeret Mono | Re-pointed by the layout from `header.json.fonts`; `--mono` reads the last |
| `--ease` / `--ease-out` | `cubic-bezier(0.22, 0.9, 0.28, 1)` / `cubic-bezier(0.16, 1, 0.3, 1)` | Every transition; framer-motion uses the same curve as a tuple |
| `--shell` / `--pad` / `--gap` | `1120px` / `clamp(18px, 4vw, 40px)` / `clamp(12px, 1.6vw, 16px)` | Content width, side padding, the gap between tiles |
| `--r-sm` / `--r` / `--r-lg` / `--r-xl` | 10 / 14 / 22 / 28px | Inputs and contact rows / facts, certificates, tables / tiles and the dialog / defined, unused today |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | `0 1px 2px` ink 5% + `0 8px 24px -14px` ink 12% / `0 2px 6px` ink 6% + `0 18px 40px -14px` ink 16% / `0 10px 30px` ink 12% + `0 40px 90px` ink 18% | Resting tiles / hover and the condensed nav / the dialog |
| `--lv0…--lv4` | from ink, accent-soft and accent-fill (dark mode uses three literal hexes) | The contribution calendar's five levels |

The bloom is `.bp::before`: three radial gradients (`--accent-soft` at 28% 32%, `--glow` at 74% 24%, `--tint` at 50% 0%) in a `min(1500px, 150vw)` × 82vh box above the page, at 0.85 opacity (0.6 in the dark), drifting on `bloom-drift` (22s, alternate). The hero tile carries a second, smaller glow of its own (`.tile-hero::before`).

## Layout & components (in `bench.css`)

- **`.page`**: every page's wrapper (bottom padding only). The dashed `.sheet-frame` is gone.
- **`.sec` / `.sec--tight` / `.sec-head` / `.sec-title` / `.sec-sub`**: a section is `clamp(40px, 6vw, 72px)` of space, then a title row (Instrument Sans 600 at `clamp(28px, 3.2vw, 38px)`, no rule under it, an optional muted aside), then the content.
- **`.nav` / `.nav-pill`**: the floating glass pill. See [[Site Nav and Mark]].
- **`.btn`** (`.bp-btn` is an alias): a 999px pill on white with a 2px hover lift. `--solid` is the `--accent-fill` button, with `.bp-sheen` looping on Download PDF; also `--ghost`, `--icon` and `--sm`. `.bp-link` is an inline link whose underline wipes in, with a diagonal arrow.
- **`.chip`**: a tinted mono pill with a pinging `.chip-dot` (`bp-ring`), as in "Open to relocation".
- **`.card` / `.card--hover`**: the tile surface. White, `--r-lg`, `--line` border, `--shadow-sm`; on hover it lifts 3px onto `--shadow` with an accent-tinted border. `.bp-spot` adds the cursor wash (`--sx/--sy` from `lib/useSpotlight.ts`, pointer devices only).
- **`.tile` / `.tile-label` / `.tile-value` / `.tile-sub` / `.tile-arrow`**: the anatomy of a bento tile. The label is mono with an accent icon; the arrow is a 30px circle that nudges on hover.
- **`.bento`** and its tiles (`.tile-hero`, `.tile-now`, `.tile-where`, `.tile-edu`, `.tile-activity`, `.tile-site`, `.tile-contact`), **`.hero-*`** (avatar, name, role, meta, actions) and **`.cursor-mark`**. See [[Bench Components (Home Page)]].
- **`.activity`**: the contribution calendar.
- **`.summary-grid` / `.facts`**: the summary and its fact tiles.
- **`.roles` / `.role`**: the experience list in one tile, with a dated rail. `.bp-bullet-emphasis` phrases take the accent plus a hairline text stroke when their `li` is hovered.
- **`.filters` / `.project-grid` / `.project-card`** and **`.dlg-*`**: the project tiles and the dialog they morph into. **`.pbody-*`** is the project body; **`.page-back` / `.page-nav`** frame a project's own page. See [[Project Catalog and Dialog]].
- **`.stack-grid` / `.stack-card`**, **`.edu-grid` / `.degree` / `.certs` / `.cert`**, **`.contact-card` / `.contact-ways` / `.form`**, and **`.footer` / `.footer-meta`** (Site, Updated, Based in in mono).
- **`.bp-table` / `.bp-table-key` / `.bp-gantt`**: the tracker. `tr.is-before-site` cells use `--faint`.
- **`.bp-top` / `.bp-studio-link`**: the floating bottom-left and bottom-right pills (frosted white, `blur(10px)`, mono 10.5px uppercase).
- **`html[data-lock] { overflow: hidden }`**: the dialog's scroll lock.
- **Keyframes**: `bloom-drift`, `tile-in` (also `.page-in`), `bp-draw` / `bp-draw-in` / `bp-chase` / `bp-float` (the monogram), `bp-sheen`, `bp-ring`, `activity-in`.

### The kept component sheets

- **`bullet-link.css`**: `.bp-bullet-link`, the Read more link at the end of a resume bullet, keyed on `data-motion` (`sweep`, `roll`, `launch`, `offset`, `trace`, `glint`, `still`). Every hover rule also matches `:focus-visible` and `[data-hover]` (how the Studio plays a card), and every colour is a token. On the site, `bench.css` sets its shape: a 999px tinted chip in the mono at 10.5px.
- **`skill-pills.css`**: `.bp-pill` and `.bp-pill--linked`, with a `::after` border loop keyed on `data-border` (`orbit` today, `march`, `pulse`, `marks`, `signal`, `steady`), offset by `--k`, and a `.bp-skill-card` keyed on `data-reveal` (`card` today, `tab`, `callout`). `AnimationSync` zeroes the per-item offsets under `[data-motion-sync]`.

## Responsive

The breakpoints are **980px** (the bento goes to two columns with the hero and education full width, the project grid to two, the summary and education grids to one), **760px** (everything is one column, the nav drops its name, roles show their dates inline without the rail, and the dialog rises from the bottom edge as a sheet) and **640px** (the bento goes to one column). `projects/feature.css` and `walkthrough.css` keep their own 860px step.

- A `@media print` block prints the home page as a document: ink on white, without the bloom, nav, actions, sheen, cursor mark, calendar, filters, tile arrows and floating controls, with tile shadows removed and roles and cards kept whole, and the Read more links hidden.
- `prefers-reduced-motion: reduce` collapses every animation and transition under `.bp` to ~0ms (the bloom holds still), draws the monogram strokes complete, and shows the calendar cells. `SmoothScroll`, `CursorMark`, the morph and the nav's `layoutId` slide also branch on it in JS.

## Previously

- **Blue Sheet** (2026-11-08, one day), in `app/(site)/sheet.css`: a drafting sheet inside a dashed cut line with `+` marks, a faint blueprint grid, a drawn construction-line hero cover, Instrument Serif over Inter with IBM Plex Mono, radii 10 / 16 / 24 / 30px. See [[Blue Sheet (2026-11-08, one day)]]; the stylesheet is in git at `8d75e07`. Its palette stays as the `blue-sheet` preset.
- **Blueprint Press** (2026-08-27 to 2026-11-08), in `app/(site)/blueprint.css`: square corners, hairlines over a fixed blueprint ruling, Instrument Serif + Spectral, the Electric preset. See [[Blueprint Press (2026-08 to 2026-11)]]; the stylesheet is in git (`git show d1360bb:"app/(site)/blueprint.css"`). Default and Electric remain selectable presets.

## Related
- [[Clean Bench (2026-11 redesign)]]
- [[Blue Sheet (2026-11-08, one day)]]
- [[Blueprint Press (2026-08 to 2026-11)]]
- [[Site Nav and Mark]]
- [[Bench Components (Home Page)]]
- [[Project Catalog and Dialog]]
- [[Routes Overview]]
- [[Impeccable Design Workflow]]
- [[Repository Agent Skills]]
- [[Home]]
