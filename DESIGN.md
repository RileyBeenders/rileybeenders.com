---
name: Clean Bench
description: Everything is a tile. White rounded tiles on a pale grey-blue ground under a floating glass nav, one cobalt accent for links, fills and active states, a soft blue bloom behind the top of the page, one grotesque for headings and body with a wide monospace for small labels, and a project tile that morphs into its dialog. Dark mode is the same bench with the lights down, where every blue fill cuts deeper rather than brighter.
colors:
  # The live palette is a Studio-selected preset (data/header.json → theme.paletteId, seeds in lib/palettes.ts).
  # Sixteen roles per mode: six secondary tones are a fixed tint ramp from ink toward paper (lib/palette.ts:
  # prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87); four surfaces come from the
  # accent (tint, accent-soft, accent-fill, glow); on-accent is whichever of paper or ink reads better on the fill.
  # Values below are the ACTIVE preset, "Clean Bench" (added 2026-11-09), as the fallbacks in app/(site)/bench.css.
  paper: "#f4f5f8"
  white: "#ffffff"
  ink: "#111318"
  prose: "#282a2e"
  ink-soft: "#4a4c50"
  pill-text: "#535559"
  muted: "#636469"
  faint: "#838488"
  rule: "#d6d8db"
  accent: "#2457e6"
  blue: "#173ea8"
  tint: "#edf2fd"
  accent-soft: "#cfdafa"
  accent-fill: "#2457e6"
  glow: "#d3dcf5"
  on-accent: "#f4f5f8"
  paper-dark: "#0f1115"
  white-dark: "#181b22"
  ink-dark: "#eceef2"
  prose-dark: "#d6d8dc"
  ink-soft-dark: "#b5b7bb"
  pill-text-dark: "#acaeb2"
  muted-dark: "#9c9ea2"
  faint-dark: "#7e8084"
  rule-dark: "#2c2e32"
  accent-dark: "#6a93ff"
  blue-dark: "#9db9ff"
  tint-dark: "#232c41"
  accent-soft-dark: "#313f64"
  accent-fill-dark: "#4a67b3"
  glow-dark: "#232e48"
  on-accent-dark: "#eceef2"
  # Tile and control borders use --line: ink at 9% (light) / 11% (dark), so they read on both paper and white.
  # The contribution calendar's five steps, from no activity to the most (bench.css --lv0…--lv4, sRGB mixes).
  level-0: "#f1f1f1"
  level-1: "#cfdafa"
  level-2: "#7192ef"
  level-3: "#2457e6"
  level-4: "#1c3c94"
  level-0-dark: "#272a31"
  level-1-dark: "#1d2a4d"
  level-2-dark: "#27408f"
  level-3-dark: "#4a67b3"
  level-4-dark: "#6a93ff"
  # Semantic colors outside the ramp: the timeline's insertion green (paired with the accent for deletions),
  # the lightbox scrim (portalled outside .bp, written as a literal) and the form's error note.
  insertion: "#2e7d4f"
  insertion-dark: "#6cc48e"
  scrim: "rgba(8, 16, 26, 0.93)"
  error: "#c0392b"
  # The hand-tuned "Default" preset (Blueprint Press's original paper and ink, red accent) stays in the list; its
  # surfaces are derived from its seeds the same way. "Blue Sheet" (2026-11-08) also stays as a preset.
  fallback-paper: "#fbfbf9"
  fallback-ink: "#0b1a2b"
  fallback-accent: "#e3342f"
  fallback-paper-dark: "#0d1b2a"
  fallback-ink-dark: "#eef3f7"
  fallback-accent-dark: "#ff6b62"
typography:
  display:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(38px, 5.4vw, 62px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 52px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  section:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(28px, 3.2vw, 38px)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  tagline:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.7vw, 21px)"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0"
  title:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(20px, 1.9vw, 24px)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  tile-value:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.7vw, 21px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  prose:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "clamp(16.5px, 1.3vw, 18px)"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "0"
  body:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0"
  ui:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0"
  small:
    fontFamily: "Instrument Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0"
  label:
    fontFamily: "Azeret Mono, SF Mono, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
    textTransform: "uppercase"
  mono:
    fontFamily: "Azeret Mono, SF Mono, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.04em"
  # Every font-size app/(site)/bench.css sets, in px (fixed values and clamp endpoints):
  # 9, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5, 17, 18, 19, 20, 21, 22, 24, 26, 28,
  # 32, 38, 40, 52, 62.
rounded:
  # Every border-radius app/(site)/bench.css sets: 2px (calendar legend squares, the rule), 4px (focus rings),
  # 10px (--r-sm), 12px (a project cover inside its tile: --r-lg minus the tile's 10px padding), 14px (--r),
  # 22px (--r-lg), 50% and 999px. --r-xl (28px) is defined for larger tiles and unused today.
  xs: "2px"
  focus: "4px"
  sm: "10px"
  cover: "12px"
  md: "14px"
  lg: "22px"
  xl: "28px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
  gap: "clamp(12px, 1.6vw, 16px)"
  tile: "clamp(18px, 2.2vw, 24px)"
  tile-hero: "clamp(22px, 3vw, 36px)"
  section: "clamp(40px, 6vw, 72px)"
  pad: "clamp(18px, 4vw, 40px)"
  shell: "1120px"
components:
  button-solid:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.on-accent}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
    height: "42px"
  button-solid-hover:
    backgroundColor: "color-mix(in srgb, {colors.accent-fill} 88%, {colors.ink})"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
    height: "42px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "11px 18px"
  link-inline:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.ui}"
    padding: "2px 0"
  nav-pill:
    backgroundColor: "color-mix(in srgb, {colors.white} 66%, transparent)"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 8px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  nav-link-active:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 12px"
  pill:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pill-text}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "7px 13px"
  pill-hover:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  read-more:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  filter:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    typography: "{typography.small}"
    rounded: "{rounded.pill}"
    padding: "7px 13px"
  filter-active:
    backgroundColor: "{colors.accent-fill}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
  tile:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.tile}"
  tile-hero:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.tile-hero}"
  tile-arrow:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.muted}"
    rounded: "{rounded.circle}"
    width: "30px"
    height: "30px"
  project-tile:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.lg}"
    padding: "10px"
  dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "clamp(18px, 3vw, 36px)"
    width: "min(1040px, 100%)"
  fact:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    padding: "14px 16px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "11px 13px"
  table-header:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    padding: "12px 14px"
  floating-pill:
    backgroundColor: "color-mix(in srgb, {colors.white} 88%, transparent)"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 15px"
  theme-toggle:
    backgroundColor: "{colors.tint}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    width: "48px"
    height: "28px"
---

# Design System: Clean Bench

## Overview

**Creative North Star: "Everything is a tile"**

The site is a bench of rounded white tiles on a pale grey-blue ground. Under a floating glass nav, the home page opens on a bento: the hero tile (the monogram avatar, the relocation chip, the name, the title, location and current role, the actions), then small tiles for the current role, where Riley is based and the degree, the GitHub calendar across the full width, a tile for this site and one to say hello. A soft blue bloom drifts very slowly behind the top of the page.

One cobalt accent carries every link, fill and active state. Headings and body share one grotesque, Instrument Sans, with headings at weight 600 and negative tracking. Dates, captions, eyebrows, counts and tags are set small in Azeret Mono.

The voice is still a document at rest. Below the bento the resume reads top to bottom (who, experience, projects, stack, education, contact), and the depth opens on request: a project tile morphs into its dialog, with the full page behind it at `/projects/<id>`. Clean Bench replaced Blue Sheet on 2026-11-09 on the same data, the same wording and the same Studio-driven token system, so every palette preset still re-inks the whole bench.

Every CSS transition uses one easing curve, `cubic-bezier(0.22, 0.9, 0.28, 1)`. Tiles rise 16px into place once, 70ms apart; tiles lift 3px on hover; the nav's active tint slides between links on a spring; the calendar's cells pop in; a project tile grows into its dialog on a spring. Wheel scrolling glides, and a monogram chip trails the pointer across the bento.

Dark mode turns the ground near-black and the tiles graphite. The accent lightens for text but every fill cuts deeper (`accent-fill` is the accent mixed 30% toward black).

**Key Characteristics:**

- Everything sits on a tile: white, a 22px radius, an ink hairline (`--line`), `--shadow-sm` at rest.
- One blue, five jobs: `tint` (chips, the active nav link, table heads, the contact card's left column, the Read more chip), `accent-soft` (the bloom, the hero tile's own glow, the calendar's first step), `accent` (text, icons, markers, focus rings), `accent-fill` (solid buttons, active filters, the toggle thumb, the "This site" badge), `glow` (the bloom's second wash).
- One grotesque, two voices: Instrument Sans for names and sentences, Azeret Mono for anything small that labels, dates or counts.
- Rounded throughout: 10px inputs, 14px facts and certificates, 22px tiles and the dialog, pills for every control.
- Three quiet shadow steps, all tinted with ink.
- A frosted glass nav pill and frosted floating controls.
- One easing curve, one tile entrance, hover lifts of 1 to 3px, and a full `prefers-reduced-motion` opt-out.

## Colors

Paper and ink with one accent, where every secondary tone is a fixed mix of the two and every surface is a fixed mix of the accent.

### Primary

- **Accent** (`{colors.accent}` / `{colors.accent-dark}`): the blue as a line or a letter. The hero title, eyebrows, tile-label icons, link text, bullet markers, the role rail's dots, emphasis phrases on a hovered bullet, the chip's text and pulsing dot, focus rings. It lightens in the dark so text keeps contrast.
- **Accent Fill** (`{colors.accent-fill}` / `{colors.accent-fill-dark}`): the same blue as a surface. Solid buttons, the active filter, the theme toggle's thumb, the "This site" badge, a hovered Read more chip, the calendar's fourth step. It deepens in the dark.
- **On Accent** (`{colors.on-accent}`): text on the fill, whichever of paper or ink reads better on it.
- **Blue** (`{colors.blue}` / `{colors.blue-dark}`): the deeper partner for drawn geometry and data: the monogram's bowl, the gantt's secondary series.

### Surfaces

- **Paper** (`{colors.paper}` / `{colors.paper-dark}`): the ground. Also painted on `<html>` so the overscroll gutter matches, and used for the dialog's floor, the tile arrow's circle and the skill pills.
- **White** (`{colors.white}` / `{colors.white-dark}`): every tile and control. One step off the ground in light; graphite one step up from it in the dark.
- **Tint** (`{colors.tint}` / `{colors.tint-dark}`): the faintest accent wash.
- **Accent Soft** (`{colors.accent-soft}` / `{colors.accent-soft-dark}`): the bloom's main wash, the hero tile's glow, the calendar's first step.
- **Glow** (`{colors.glow}` / `{colors.glow-dark}`): the bloom's second wash.

### Neutral

- **Ink** (`{colors.ink}` / `{colors.ink-dark}`): headings and primary text.
- **Prose** (`{colors.prose}`): running text (ink mixed 10% toward paper).
- **Ink Soft** (`{colors.ink-soft}`): bullets, card summaries, role context, issuers (25%).
- **Pill Text** (`{colors.pill-text}`): skill pill labels (29%).
- **Muted** (`{colors.muted}`): nav links at rest, tile labels, dates, counts, the footer note (36%). The smallest tone any text may use.
- **Faint** (`{colors.faint}`): the footer's keys, weekday labels, dots (50%). Not for running text.
- **Rule** (`{colors.rule}`): hairlines between roles, under the dialog bar, between table rows (87%). Tile borders use `--line`.

### Semantic

- **Insertion** (`{colors.insertion}` / `{colors.insertion-dark}`): the "+ lines" count on a timeline entry; deletions use the accent.
- **Scrim** (`{colors.scrim}`): the lightbox backdrop. The dialog's scrim is ink at 45% with a 6px blur.
- **Error**: `#c0392b` on the form's failure note only.

### Named Rules

**The One Blue Rule.** Colour is one hue in five jobs (tint, soft, accent, fill, glow) plus a deeper partner for drawn geometry and data. Surfaces are paper, white and tint; text is ink and its ramp. No second hue reaches type or chrome.

**The Bloom-Stays-Blue Rule.** The bloom behind the top of the page is built only from `accent-soft`, `glow` and `tint`, at low opacity (0.85 light, 0.6 dark), and drifts on a 22s cycle. It never takes a second hue, never sits behind body text further down the page, and holds still under reduced motion.

**The Deeper-in-the-Dark Rule.** Dark mode lightens the accent for text and darkens the fill for surfaces. `lib/palette.ts` derives `accent-fill` as the accent mixed 30% toward black on a dark palette. Any new fill uses `--accent-fill`, never `--accent`.

**The Ramp Rule.** Never hand-pick a gray or a wash. Secondary tones come from the ramp (prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87) and surfaces from the accent, so every preset and any custom palette shares one rhythm. Muted is the floor for text; faint is for lines and dots.

**The Portal Rule.** Tokens are scoped to `.bp`. Anything rendered through a portal must land inside it (`[data-bench-portal]` in the site layout, which the project dialog uses) or carry literal colours (the lightbox, which portals to `<body>`).

**The Hard-Copy Rule.** Four places cannot read CSS variables and carry literal copies of the active preset (ink `#111318`, accent `#2457e6`): `components/GanttChart.tsx` (mermaid theme variables), `app/icon.svg`, `app/apple-icon.tsx` and `app/opengraph-image.tsx`. A palette change must reach them by hand.

## Typography

**Display and Body Font:** Instrument Sans (with system-ui, sans-serif), loaded at 400, 500, 600 and 700.
**Label Font:** Azeret Mono (with SF Mono, Menlo, monospace), loaded at 400 and 500; uppercase and tracked for labels, plain with tabular figures for data.

**Character:** One clean grotesque does both jobs. Headings are weight 600 with tracking from -0.01em to -0.035em, so the name and the section titles read tight and confident; body text is weight 400 at a generous size and line height. Azeret Mono is wide and a little characterful, which is why it stays small: it marks the bench's notes (a tile's label, a date, a photo count) without competing with the words.

### Hierarchy

- **Display** (600, `clamp(38px, 5.4vw, 62px)`, 1, -0.035em): the hero name.
- **Headline** (600, `clamp(32px, 4vw, 52px)`, 1.02, -0.03em): a project's name in its dialog and on its page.
- **Section** (600, `clamp(28px, 3.2vw, 38px)`, 1.08, -0.025em): section titles. The contact card's title runs `clamp(28px, 3.4vw, 40px)`; the outro lead `clamp(20px, 2.2vw, 26px)` at 500.
- **Tagline** (500, `clamp(17px, 1.7vw, 21px)`, 1.35, accent): the title line under the hero name. A project's tagline is `clamp(17px, 1.5vw, 20px)` in ink-soft.
- **Title** (600, `clamp(20px, 1.9vw, 24px)`, 1.2, -0.02em): role titles; the degree's school at 22px and the tracker heading at 24px.
- **Tile value** (600, `clamp(18px, 1.7vw, 21px)`, 1.25): what a bento tile says; the education tile uses `clamp(16px, 1.4vw, 18px)`.
- **Subtitle** (600, 16 to 20px): project tile names (19px), stack and activity headings and the page-nav names (18px), certificate names and the dialog bar (16px), the form title (20px).
- **Prose** (400, `clamp(16.5px, 1.3vw, 18px)`, 1.7, `text-wrap: pretty`, max 68ch): the summary and the contact paragraph. A project's summary is `clamp(16px, 1.3vw, 18px)`.
- **Body** (400, 15.5px, 1.62): bullets. Role context, fact values and footer notes at 15px; the hero meta line at 14.5px; card summaries and tile subs at 14px.
- **UI** (500, 14px): buttons, nav links, inline links. The nav brand is 15px at 600.
- **Small** (400 to 500, 13px): pills, filters, small buttons, the table key; table cells and issuers at 13.5px; field labels and the Show more pill at 12.5px.
- **Label** (mono, 10 to 11px, 0.06 to 0.1em, uppercase): tile labels, eyebrows, chips, type tags on covers, table headers, fact labels, certificate dates, the floating controls, the Read more chip.
- **Mono data** (mono, 11 to 12px, 0.02 to 0.04em): dates on the rail, photo counts, the calendar's total and footer, the footer meta line. Calendar month and day labels drop to 10px and 9px inside the SVG.

### Named Rules

**The Mono-For-Small-Notes Rule.** Azeret Mono is for small things only: labels, dates, counts, tags and captions, never above 12px and never for a sentence a visitor has to read. Names and sentences are Instrument Sans.

**The Weight Rule.** Headings are 600 with negative tracking; emphasis inside a sentence is 500. Nothing on the bench is set at 700, although the weight is loaded.

**The Studio Roles Rule.** Four faces are Studio choices (Site Settings → Typography: header, sub-header, body, small labels) among the ten preloaded in `app/(site)/layout.tsx`, written as `--bp-font-header`, `--bp-font-subheader`, `--bp-font-body` and `--bp-font-mono`. Clean Bench ships with Instrument Sans for the first three and Azeret Mono for small labels.

**The No-Eyebrow-Over-Sections Rule.** Section titles stand alone. Eyebrows (mono, accent) appear only where they name a category: a project's type over its name.

## Layout

A 1120px shell with `clamp(18px, 4vw, 40px)` side padding. The page wrapper is `.page`, with no frame around it. Sections stack with `clamp(40px, 6vw, 72px)` above each and open with a title row (title left, an aside right), followed by one tile, a grid of tiles or a list. Gaps between tiles are `--gap`, `clamp(12px, 1.6vw, 16px)`.

- **Bento** (`.bento`): six columns. The hero tile spans 4 columns and 3 rows; Now, Based in and Education span 2 each; the activity tile spans the full width; This site and Say hello span 3 each. At 980px it becomes two columns with the hero and education full width; at 640px, one column.
- **Summary**: prose beside a 300px column of fact tiles (one column below 980px).
- **Experience**: every role in one `.card.roles` tile; each role has a 150px dated column with a rail and a dot beside it. One column below 760px, with the dates inline.
- **Projects**: three columns of tiles, two below 980px, one below 760px; filters above on `/projects`.
- **Stack**: two columns of tiles, one below 760px.
- **Education**: the degree tile beside a two-column grid of certificates (1.1fr : 2fr), one column below 980px.
- **Contact**: one tile split 1 : 1.15 (the ways in on a tinted column, the form on white), stacked below 760px.
- **Project dialog**: `min(1040px, 100%)` wide, `min(92vh, 100%)` tall, centred. On a phone it rises from the bottom edge with the top corners rounded.
- **Project page**: the same body inside the shell with `.page-in`, a back link above and previous and next links below.

**Breakpoints:** 980px (the bento goes to two columns, grids drop a column), 760px (everything one column, the nav drops its name, the dialog becomes a bottom sheet), 640px (the bento goes to one column).

## Elevation & Depth

Depth is quiet. A tile rests on `--shadow-sm`, lifts 3px onto `--shadow` on hover and tints its border toward the accent; the dialog floats on `--shadow-lg` over a blurred scrim. The nav pill is 66% white with an 18px blur and 1.4 saturation on `--shadow-sm`, and condenses onto `--shadow` at 84% once the page has scrolled 28px. Solid buttons carry an accent-tinted shadow rather than an ink one.

### Shadow Vocabulary

- `--shadow-sm`: `0 1px 2px ink/5%, 0 8px 24px -14px ink/12%`. Resting tiles, the nav at the top, buttons.
- `--shadow`: `0 2px 6px ink/6%, 0 18px 40px -14px ink/16%`. Hovered tiles and buttons, the condensed nav, the cursor mark, the floating controls.
- `--shadow-lg`: `0 10px 30px ink/12%, 0 40px 90px ink/18%`. The dialog.
- Accent shadow: `0 8px 22px -6px accent/45%` on solid buttons, `0 12px 28px -6px accent/50%` on hover.

### Named Rules

**The Lift Rule.** Hover lifts are 1px (filters, the Show more pill), 2px (buttons, skill pills) and 3px (tiles), never more; contact rows and hovered bullets nudge 3px sideways instead. The shadow grows one step with the lift.

**The Glass Rule.** Anything that floats over content (the nav pill, the dialog bar, type tags over a cover, the floating controls) is translucent white with a backdrop blur, never opaque.

## Shapes

- **Rounded**: 10px inputs, contact rows and code blocks (`--r-sm`); 14px facts, certificates, tables and gallery frames (`--r`); 22px tiles, project tiles and the dialog (`--r-lg`). A project's cover sits 12px rounded inside its tile's 10px padding. `--r-xl` (28px) is defined but unused today.
- **Pills**: every button, chip, filter, skill pill, nav link, tag, the Read more chip, the theme toggle, the floating controls.
- **Circles**: the hero avatar, the tile arrow, the cursor mark, the rail dots, the chip's dot, the toggle thumb.
- **Small radii**: 2px on the calendar's legend squares and the rule, 4px on focus rings. Nothing else goes below 10px.

### Named Rules

**The Everything-Is-A-Tile Rule.** A piece of content on the site is either a tile or inside one. New content gets a tile (`.card`, plus `.card--hover` when it is a link) on the shared radius, border and shadow. It never floats loose on the ground and never invents its own corner.

## Components

### Buttons

- **Solid** (`.btn--solid`): accent fill, on-accent text, pill, 42px, an accent shadow and a slow sheen on the primary one (Download PDF, Send message). Hover darkens the fill 12% toward ink.
- **Outline** (`.btn`): white, ink text, an ink/12% border, `--shadow-sm`; hover lifts 2px and tints the border toward the accent.
- **Ghost** (`.btn--ghost`): no fill or shadow; hover fills with tint. The dialog's close.
- **Icon** (`.btn--icon`, 42px) and **Small** (`.btn--sm`, 36px, 13px type).
- Kept aliases: `.bp-btn` and `.bp-btn--solid` resolve to the same styles for the project-body components that still use them.

### Links

- **Inline** (`.bp-link`): accent text, 500, an underline that grows from the left on hover; the arrow nudges.
- **Prose links** (`.prose a`): accent with a 45% underline that fills on hover.
- **Read more** (`.bp-bullet-link`, overridden in bench.css over `app/(site)/bullet-link.css`): a tinted mono chip at the end of a resume bullet that fills with the accent on hover.

### Chips and pills

- **Chip** (`.chip`): tint, accent mono label, a pulsing dot for a live status (Open to relocation).
- **Pill** (`.bp-pill`, `app/(site)/skill-pills.css`): paper, pill-text, hairline; hover tints and lifts 2px. A linked pill keeps its Studio-chosen border and hover card.
- **Filter** (`.filter`): white, muted; the active one is accent fill with on-accent text.
- **Type tag** (`.project-card-type`): mono, uppercase, frosted white over the cover; the "This site" badge is accent fill.

### Tiles

- **Tile** (`.card` + `.tile`): white, `--line` border, 22px radius, `--shadow-sm`. `.card--hover` lifts and tints its border; `.bp-spot` adds a faint accent spotlight under the cursor. A linked tile carries a `.tile-label` (mono, with an accent icon), a `.tile-value`, a `.tile-sub` and a 30px `.tile-arrow` circle top right that nudges on hover.
- **Hero tile** (`.tile-hero`): its own accent-soft glow top right; the 72px avatar circle with the monogram, the relocation chip, the name, the title, the meta line (location and current role) and the actions (`HeroActions`). The bento carries `[data-cursor-zone]` for the cursor mark.
- **Activity tile** (`.tile-activity`, `GithubGraph`): the calendar as an SVG with month and weekday labels in mono, a total and a legend. It scrolls sideways inside its tile below 720px.
- **Fact** (`.fact`): a mono label over a value, 14px radius.
- **Roles** (`.card.roles`): the whole experience list in one tile. Each `.role` has a dated column with a rail and a dot that fills on hover, bullets with reactive emphasis, and a "Show N more" pill.
- **Project tile** (`.project-card`): a 16:10 cover (photo, PDF page, video poster, or the monogram over an accent-soft wash), tags over it, name, two lines of summary, dates and photo count in mono, an arrow that nudges. The whole tile is a button; its id is the hash anchor.
- **Stack, degree, certificate, contact**: `.stack-card`, `.degree`, `.cert` and `.contact-card` are tiles on the same surface.

### Dialog (`.dlg`)

The signature interaction. A project tile's `motion.article` and the dialog panel share a framer-motion `layoutId` (`tileLayoutId(id)` in `components/bench/ProjectCard.tsx`), so the tile grows into the dialog on one spring (`MORPH`: stiffness 380, damping 36, mass 0.8) while the page dims behind an ink/45% scrim with a 6px blur. The bar (name, type, Open full page, close) and the body fade in 0.18s after the morph starts.

It opens with `#project-<id>` in the URL (`-case-study` to expand the case study) and closes on Escape, the scrim or the back button, collapsing home into its tile. Focus is trapped and restored, and the page is locked beneath it. Under reduced motion it is a plain fade.

### Navigation (`.nav`)

A floating glass pill, centred and sticky: the monogram and name, three links (Home, Projects, Contact) with a tint that slides behind the active one on a spring (stiffness 420, damping 38, mass 0.6), and the theme toggle. It condenses after 28px of scroll and drops the name below 760px.

### Form (`.form`)

Name and email side by side, message below, a solid Send. Inputs are 10px-radius white with an accent focus ring at 16%, with a status line under the button and a hidden honeypot field.

### Footer (`.footer`)

The monogram and note, then a `.footer-meta` line in mono: Site, Updated (the commit the page was built from) and Based in.

### Floating controls (`.bp-top`, `.bp-studio-link`)

Pill, mono label, frosted white, `--shadow`. Back to top sits bottom-left; Edit in Studio sits bottom-right in development only.

### Monogram (`BpMark`)

Unchanged since Blueprint Press: the stem draws, the bowl draws in the accent-to-blue gradient, the ring chases. It appears in the nav at 30px, the hero avatar at 46px, the cursor mark at 24px, a typographic cover at 54px and the footer at 44px.

### Named Rules

**The Morph-Not-Modal Rule.** A project never appears from nowhere. It grows out of the tile the visitor touched and collapses back into it, so the dialog reads as the tile opened up. New expandable content on the bench follows the same shared-layout pattern, with a plain fade as the reduced-motion fallback.

**The Resume-At-Rest Rule.** With every tile closed, the home page is the resume: the bento, then who, experience, projects, stack, education and contact, in that order. Nothing on the surface depends on a hover, a click or an animation to be read.

## Motion

- `bloom-drift`: the bloom moves 2% and scales to 1.04 over 22s, alternating.
- `tile-in`: each bento tile rises 16px and fades in over 0.8s, staggered 70ms by `--i`. `.page-in` gives a project page one 0.7s entrance with no observer, so a page taller than the viewport still shows.
- Section content below the bento enters once through `Reveal` (`components/blueprint/Reveal.tsx`); project tiles rise over 0.6s, 0.06s apart.
- The calendar's cells pop in at 11ms per cell once the tile is in view.
- Hovers: tiles 3px over 0.5s, buttons 2px over 0.4s; the tile arrow nudges 2px up and right.
- The cursor mark follows the pointer on a spring (stiffness 260, damping 26, mass 0.5). `SmoothScroll` eases wheel scrolling (0.11 per frame) and steps aside for touch, keys, reduced motion and inner scrollers.
- `prefers-reduced-motion: reduce` collapses every animation and transition to its final frame, holds the bloom still and turns the morph into a fade.

## History

- **Blueprint Press** (2026-08 to 2026-11): a resume printed on paper over a fixed drafting grid; it lives on as the "Default" palette.
- **Blue Sheet** (2026-11-08, one day): a drafting sheet inside a dashed cut line with a drawn construction-line hero; it lives on as the `blue-sheet` palette preset.

## Do's and Don'ts

### Do

- Put every piece of content on a tile and every control in a pill; the ground stays empty apart from the bloom.
- Use `--accent-fill` for anything painted and `--accent` for anything drawn or written.
- Set labels, dates, counts and tags small in the mono; names and sentences in Instrument Sans.
- Keep the home page readable as the resume at rest.
- Open a project by morphing its tile, offer the page behind it (Open full page), and keep `#project-<id>` as the address of a project.
- Lift 1 to 3px on hover, grow the shadow one step, and use the one easing curve.
- Render portals inside `[data-bench-portal]` so tokens resolve.
- Derive new colours from the seeds in `lib/palette.ts`; add new copy as a Studio field, never a string in a component.

### Don't

- Don't introduce a second hue on type, chrome or the bloom; the deeper `blue` is for geometry and data only.
- Don't paint a fill with `--accent` (it goes brighter, not deeper, in the dark).
- Don't square a corner, drop a tile's border or zero its shadow.
- Don't set a sentence in the mono or let the mono grow past 12px.
- Don't bring back the drafting grid, the dashed frame or the construction-line cover; they belong to the history.
- Don't open a dialog with a scale or slide that ignores the tile it came from.
- Don't pin, scroll-jack or trap the wheel.
- Don't hand-pick a gray, a wash or a shadow colour.
- Don't render the dialog, a tooltip or a menu into `<body>` and expect `var(--ink)` to resolve.
- Don't add a hero video, a marketing voice or a metric the data files cannot back.
