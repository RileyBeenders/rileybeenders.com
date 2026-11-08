---
tags: [styling, design]
---

# Design System (Blue Sheet)

The site's styling is plain global stylesheets: no CSS modules, CSS-in-JS or Tailwind. **Blue Sheet** has been the system since 2026-11-08 (see [[Blue Sheet (2026-11 redesign)]]). It is a resume on a drafting sheet:

- cool blue-white paper with a faint blueprint grid at the top, inside a dashed cut line;
- rounded cards on quiet ink-tinted shadows;
- one blue from a pale wash to a deep fill;
- Instrument Serif headings over an Inter body, with IBM Plex Mono for anything measured, dated or counted;
- one easing curve.

| File | Imported by | Scope |
|---|---|---|
| `app/base.css` | the root `app/layout.tsx` | A bare reset only: `* { box-sizing }`, `body { margin: 0; min-height: 100vh }`, `img`, `button/input { font: inherit }`, `a`, `.sr-only`. Nothing visual. |
| `app/(site)/sheet.css` | `app/(site)/layout.tsx`, first | The site design system (1,120 lines), everything scoped under `.bp`, in banner-commented sections: layout, nav, theme toggle, buttons, card, hero, activity, summary, experience, projects, dialog, project body, stack, education, contact, footer, tables, marks, floating controls, responsive. Then print and reduced motion. It replaced `app/(site)/blueprint.css`. |
| `app/(site)/bullet-link.css` | the site layout, after `sheet.css` (also served to the Studio) | The resume bullets' Read more button and its `data-motion` variants. |
| `app/(site)/skill-pills.css` | the site layout (also served to the Studio) | `.bp-pill`, linked skills, their `data-border` loops and `data-reveal` cards. |
| `app/(site)/projects/projects.css`, `projects/feature.css`, `projects/walkthrough.css` | the site layout (since 2026-11-08; before that, the projects and About routes) | `.pj-*` (gallery, lightbox, case study, date box, status, compare, post card, flow diagrams), `.ft-*` / `.tl-*` / `.dm-*` (the site entry's deep dive), `.wt-*` / `.pj-links`. |

Token **names did not change** from Blueprint Press (`--paper --white --ink --ink-soft --muted --faint --rule --accent --blue --prose --pill-text --on-accent`, `--ease`). That is why the kept component sheets follow the new palette without edits. Four tokens are new: `--tint`, `--accent-soft`, `--accent-fill` and `--glow`.

`design/` (`Main.dc.html`, `Mark.dc.html`, `Interactions.dc.html` + `canvas.json`) holds the Claude Design canvases the *Blueprint Press* direction was chosen from. They are history now, not the source of Blue Sheet. The reference token systems in `.claude/skills/design-guidelines/` (Tesla light, Bugatti dark) are what the Electric preset was seeded from. They are reference material, not the live system (see [[Repository Agent Skills]]).

## The machine-readable spec: `DESIGN.md`

The repo-root **`DESIGN.md`** (Google Stitch `DESIGN.md` format; `name: Blue Sheet`) is the normative token list. Its sidecar is `.impeccable/design.json`. Both were rewritten for Blue Sheet on 2026-11-08. The `impeccable` detector compares literal CSS values against them (see [[Impeccable Design Workflow]]). This note is the narrative and the file map. When a token changes, regenerate or hand-edit `DESIGN.md` in the same session.

Its named rules, for quick reference:

- **The One Blue Rule**: colour is one hue in five jobs (tint, soft, accent, fill, glow), plus a deeper `--blue` for drawn geometry and data. No second hue reaches type or chrome.
- **The Deeper-in-the-Dark Rule**: dark mode lightens the accent for text and darkens the fill for surfaces. Any new fill uses `--accent-fill`, never `--accent`.
- **The Ramp Rule**: never hand-pick a gray or a wash. Tones come from the ramp in `lib/palette.ts`, and surfaces from the accent.
- **The Portal Rule**: tokens are scoped to `.bp`. A portal must land inside it (`[data-sheet-portal]`, used by the project dialog) or carry literal colours (the lightbox, which portals to `<body>`).
- **The Hard-Copy Rule**: `components/GanttChart.tsx`, `app/icon.svg`, `app/apple-icon.tsx` and `app/opengraph-image.tsx` carry literal copies of the active preset. **All four still hold Electric's colours**, because the redesign did not update them. See the follow-ups in [[Blue Sheet (2026-11 redesign)]].
- **The Regular Serif Rule**: Instrument Serif at weight 400 only.
- **The Mono-Measures Rule**: numbers, dates, counts, hashes and tags are set in Plex Mono, sentences in Inter, and names in the serif.
- **The Studio Roles Rule**: three faces are Studio choices among the eight preloaded fonts, and the mono is fixed.
- **The No-Eyebrow-Over-Sections Rule**: section titles stand alone with their rule beneath. An eyebrow appears only to name a project's type.
- **The Lift Rule**: hover lifts are 2px (buttons) or 4px (cards) and never more, and the shadow grows one step.
- **The Blur-Behind Rule**: anything floating (the nav pill, the dialog bar, cover tags, floating pills) is translucent white with a backdrop blur.

## Palette presets and derivation

`lib/palettes.ts` holds **eleven** presets: default, **blue-sheet**, electric, forest, twilight, terracotta, ocean, graphite, amber, rose and slate. Each has five seeds per mode (`paper`, `white`, `ink`, `accent`, `blue`), run through `derivePaletteTokens()` in `lib/palette.ts`. The Studio's Site Settings picks one (`data/header.json` `theme.paletteId`), and `app/(site)/layout.tsx` injects the resolved tokens as a CSS override at render time. `sheet.css`'s own `.bp { … }` block is the no-override fallback, and it now approximates the **Blue Sheet** preset. Its predecessor mirrored Default.

- **The ramp** (from ink toward paper): prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87. `muted` is the floor for text, and `faint` is for lines and dots.
- **`deriveSheetTokens(seeds)`** (2026-11-08):
  - `isDarkPalette()` tests whether the paper is darker than the ink.
  - `accentFill` is the accent on a light palette, and the accent **mixed 30% toward black** on a dark one. It goes toward black rather than toward the paper, which would wash it out.
  - `tint` is the accent mixed toward white (0.92 light, 0.86 dark), and `accentSoft` likewise (0.78 / 0.70).
  - `glow` is the accent mixed toward the paper (0.84 / 0.78).
  - `onAccent` is whichever of paper or ink reads better on the fill.

  It is exported so the hand-tuned Default preset (which skips the ramp) carries the four surfaces too.
- **Currently active: `blue-sheet`.** The light seeds are paper `#f4f7fd`, white `#ffffff`, ink `#0d182c`, accent `#2457e6` and blue `#173ea8`. The dark seeds are paper `#070b15`, white `#0e1627`, ink `#e8eefb`, accent `#6a93ff` and blue `#9db9ff`, which gives a derived dark `--accent-fill` of `#4a67b3`.

## Tokens (the Blue Sheet preset as rendered)

These are the values the layout's override writes for the active preset, as derived by `lib/palette.ts` and recorded in `DESIGN.md`. `sheet.css`'s own `.bp` and `html[data-theme="dark"] .bp` blocks hold near-identical hand-entered fallbacks. The light values match to within a step. The dark surfaces in the fallback differ (`--accent-fill` `#2b4fd1`, `--tint` `#111d3a`, `--accent-soft` `#1b2c5a`, `--glow` `#0f1a3b`), but they only show if the override is missing.

| Variable | Light / dark | Use |
|---|---|---|
| `--paper` | `#f4f7fd` / `#070b15` | The sheet. Also painted on `html` so the overscroll gutter matches |
| `--white` | `#ffffff` / `#0e1627` | Card surfaces |
| `--ink` | `#0d182c` / `#e8eefb` | Headings, primary text |
| `--prose` / `--ink-soft` / `--pill-text` / `--muted` / `--faint` / `--rule` | the ramp | Body prose / secondary text / pills / small text / lines and dots / hairlines |
| `--accent` | `#2457e6` / `#6a93ff` | Text, lines, icons, the rule under a section title, focus rings |
| `--accent-fill` | `#2457e6` / `#4a67b3` | Solid buttons, active filters, the hero cover, the theme-toggle thumb, the "This site" badge, the calendar's level 3 |
| `--tint` | `#eef2fd` / `#1b2845` | Chip and active-link washes, table heads, the contact card's left half |
| `--accent-soft` | `#cfdafa` / `#2a3c68` | Hovered pills, the calendar's first step |
| `--glow` | `#d3ddf9` / `#1d2949` | The radial wash behind the hero (`.bp::after`) |
| `--blue` | `#173ea8` / `#9db9ff` | Drawn geometry and data only |
| `--on-accent` | `#f4f7fd` / `#e8eefb` (the derived pick; the fallback says `#ffffff`) | Text on the fill |
| `--bp-font-header` / `--bp-font-subheader` / `--bp-font-body` | Instrument Serif / Instrument Serif / Inter | Re-pointed by the layout from `header.json.fonts` |
| `--mono` | IBM Plex Mono | Labels, dates, counts, tags (fixed) |
| `--ease` / `--ease-out` | `cubic-bezier(0.22, 0.9, 0.28, 1)` / `cubic-bezier(0.16, 1, 0.3, 1)` | Every transition; `Reveal` uses the same curve as a tuple |
| `--shell` / `--pad` | `1120px` / `clamp(18px, 4vw, 40px)` | Content width and side padding (`.shell`; `.bp-shell` is kept as an alias) |
| `--r-sm` / `--r` / `--r-lg` / `--r-xl` | 10 / 16 / 24 / 30px | Inputs and code / small cards / cards and the dialog / the hero card and sheet frame |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | ink at 5–16% via `color-mix` | Resting cards / hover and the condensed nav / the dialog |
| `--line` | ink at 11% | Card borders |
| `--lv0…--lv4` | from ink, accent-soft and accent-fill (dark mode uses three literal Blue Sheet hexes) | The contribution calendar's five levels |

The blueprint grid is `.bp::before`: a 28px accent-tinted ruling (7%), `position: fixed`, masked by a radial gradient so it reads at the top of the sheet and dissolves below. `.bp::after` is the `--glow` wash behind the hero.

## Layout & components (in `sheet.css`)

- **`.sheet-frame`**: at 1000px and wider, the page's content sits inside a 1px dashed accent-tinted border with a 30px radius and `+` registration marks at the top corners. On a phone the window is the sheet.
- **`.sec` / `.sec--tight` / `.sec-head` / `.sec-title` / `.sec-sub`**: a section is `clamp(40px, 6vw, 72px)` of space, then a title row (a serif title at `clamp(30px, 3.6vw, 42px)` with a 36×3px `--accent-fill` rule under it, and an optional muted aside), then the content.
- **`.nav` / `.nav-pill`**: the floating pill. See [[Site Nav and Mark]].
- **`.btn`** (`.bp-btn` is an alias): a 999px pill on white with a 2px hover lift. `--solid` is the `--accent-fill` button (it darkens toward ink on hover, and its shadow is accent-tinted), with `.bp-sheen` looping on Download PDF. There are also `--ghost`, `--icon` and `--sm`. `.bp-link` is an inline link whose underline wipes in, with a diagonal arrow.
- **`.chip`**: a mono pill with a pinging `.chip-dot` (`bp-ring`), as in "Open to relocation".
- **`.card` / `.card--hover`**: white, `--r-lg`, `--line` border, `--shadow-sm`. On hover it lifts 4px onto `--shadow` with an accent-tinted border. `.bp-spot` adds the cursor wash (`--sx/--sy` from `lib/useSpotlight.ts`, pointer devices only).
- **`.hero-card` / `.hero-cover`**: the hero card, the drawn band, the avatar, the caret, and `.cursor-mark`. See [[Sheet Components (Home Page)]].
- **`.activity`**: the contribution calendar.
- **`.summary-grid` / `.facts`**: the summary and its fact cards.
- **`.roles` / `.role`**: the experience timeline. `.bp-bullet-emphasis` phrases take the accent plus a hairline text stroke when their `li` is hovered.
- **`.filters` / `.project-grid` / `.project-card`** and **`.dlg-*`**: the cards and dialog. **`.pbody-*`** is the project body, and **`.page-back` / `.page-nav`** frame a project's own page. See [[Project Catalog and Dialog]].
- **`.stack-grid` / `.stack-card`**, **`.edu-grid` / `.degree` / `.certs` / `.cert`**, **`.contact-card` / `.contact-ways` / `.form`**, and **`.footer` / `.footer-block`** (the title block).
- **`.bp-table` / `.bp-table-key` / `.bp-gantt`**: the tracker. `tr.is-before-site` cells use `--faint`.
- **`.bp-top` / `.bp-studio-link`**: the floating bottom-left and bottom-right pills (translucent white, `blur(10px)`, mono 11px uppercase).
- **`html[data-lock] { overflow: hidden }`**: the dialog's scroll lock.
- **Keyframes**: `hero-in`, `bp-draw-in` (the cover strokes), `bp-draw` / `bp-chase` / `bp-float` (the monogram), `bp-sheen`, `bp-ring`, `bp-caret`, `activity-in`.

### The kept component sheets

- **`bullet-link.css`**: `.bp-bullet-link`, the Read more button at the end of a resume bullet, keyed on `data-motion`:
  - `sweep`: an ink wipe;
  - `roll`: a per-letter roll;
  - `launch`: the arrow flies out and a second comes in;
  - `offset`: a lift onto a hard shadow;
  - `trace`: a conic ring;
  - `glint`: a looping band offset by `--i` (today's choice);
  - `still`.

  Every hover rule also matches `:focus-visible` and `[data-hover]` (how the Studio plays a card), and every colour is a token.
- **`skill-pills.css`**: `.bp-pill` and `.bp-pill--linked`, with a `::after` border loop keyed on `data-border` (`orbit` today, `march`, `pulse`, `marks`, `signal`, `steady`), offset by `--k`, and a `.bp-skill-card` keyed on `data-reveal` (`card` today, `tab`, `callout`). `AnimationSync` zeroes the per-item offsets under `[data-motion-sync]`.

## Responsive

The breakpoints are **1000px** (the sheet frame appears), **980px** (the project grid drops to two columns, and the summary and education grids go to one) and **760px** (everything is one column, the nav drops its name, roles show their dates inline without the rail, and the dialog rises from the bottom edge as a sheet). `projects/feature.css` and `walkthrough.css` keep their own 860px step from before.

- A `@media print` block prints the home page as the document it imitates. It uses ink on white, drops the grid, nav, hero cover, actions, sheen, cursor mark, calendar, filters and floating controls, removes the frame and shadows, keeps roles and cards whole, and hides the Read more links.
- `prefers-reduced-motion: reduce` collapses every animation and transition under `.bp` to ~0ms, draws the cover and monogram strokes complete, and shows the calendar cells. `SmoothScroll`, `CursorMark` and the nav's `layoutId` slide also branch on it in JS.

## Previously: Blueprint Press

From 2026-08-27 to 2026-11-08 the system was **Blueprint Press**, in `app/(site)/blueprint.css`:

- square corners, no resting shadows, and hairline separation over a fixed 16/96px blueprint ruling;
- the **Electric** preset (Tesla-derived white with `#3e6ae1`, Bugatti-derived black in dark mode);
- the **Default** navy/red/blue fallback;
- Instrument Serif + **Spectral**, with tracked uppercase labels;
- a 1240px shell and one 860px breakpoint;
- `PageSpine`, `HeroRibbon`, the relocation badge and the `ProjectEntry` media parallax.

Its tokens, named rules, the 2026-09-18 impeccable polish pass and the file list are in [[Blueprint Press (2026-08 to 2026-11)]]. The full stylesheet is in git (`git show d1360bb:"app/(site)/blueprint.css"`). Default and Electric remain selectable presets.

## Related
- [[Blue Sheet (2026-11 redesign)]]
- [[Blueprint Press (2026-08 to 2026-11)]]
- [[Site Nav and Mark]]
- [[Sheet Components (Home Page)]]
- [[Project Catalog and Dialog]]
- [[Routes Overview]]
- [[Impeccable Design Workflow]]
- [[Repository Agent Skills]]
- [[Home]]
