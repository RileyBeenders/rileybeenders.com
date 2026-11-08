---
name: Blue Sheet
description: A resume on a drafting sheet. Cool blue-white paper inside a dashed cut line, rounded cards with soft shadows, one blue that runs from a pale wash to a deep fill, an editorial serif over a plain sans with a mono for labels, and one easing curve shared by every transition. Dark mode is the same sheet in the darkroom, where every blue fill cuts deeper rather than brighter.
colors:
  # The live palette is a Studio-selected preset (data/header.json → theme.paletteId, seeds in lib/palettes.ts).
  # Sixteen roles per mode: six secondary tones are a fixed tint ramp from ink toward paper (lib/palette.ts:
  # prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87); four sheet surfaces come from the
  # accent (tint, accent-soft, accent-fill, glow); on-accent is whichever of paper or ink reads better on the fill.
  # Values below are the ACTIVE preset, "Blue Sheet" (added 2026-11-08).
  paper: "#f4f7fd"
  white: "#ffffff"
  ink: "#0d182c"
  prose: "#242e41"
  ink-soft: "#475060"
  pill-text: "#505969"
  muted: "#606877"
  faint: "#818895"
  rule: "#d6dae2"
  accent: "#2457e6"
  blue: "#173ea8"
  tint: "#eef2fd"
  accent-soft: "#cfdafa"
  accent-fill: "#2457e6"
  glow: "#d3ddf9"
  on-accent: "#f4f7fd"
  paper-dark: "#070b15"
  white-dark: "#0e1627"
  ink-dark: "#e8eefb"
  prose-dark: "#d2d7e4"
  ink-soft-dark: "#b0b5c2"
  pill-text-dark: "#a7acb8"
  muted-dark: "#979ca8"
  faint-dark: "#787d88"
  rule-dark: "#242933"
  accent-dark: "#6a93ff"
  blue-dark: "#9db9ff"
  tint-dark: "#1b2845"
  accent-soft-dark: "#2a3c68"
  accent-fill-dark: "#4a67b3"
  glow-dark: "#1d2949"
  on-accent-dark: "#e8eefb"
  # The contribution calendar's five steps, from no activity to the most (app/(site)/sheet.css --lv0…--lv4).
  level-0: "#f0f1f5"
  level-1: "#cfdafa"
  level-2: "#7f9bee"
  level-3: "#2457e6"
  level-4: "#1a3a9a"
  level-0-dark: "#1e2636"
  level-1-dark: "#16254d"
  level-2-dark: "#1f3a8f"
  level-3-dark: "#4a67b3"
  level-4-dark: "#6a93ff"
  # Two semantic colors outside the ramp: the timeline's insertion green (paired with the accent for deletions)
  # and the lightbox scrim, which is portalled outside .bp and written as a literal.
  insertion: "#2e7d4f"
  insertion-dark: "#6cc48e"
  scrim: "rgba(8, 16, 26, 0.93)"
  error: "#c0392b"
  # The hand-tuned "Default" preset (Blueprint Press's original paper and ink, red accent) stays in the list; its
  # sheet surfaces are derived from its seeds the same way.
  fallback-paper: "#fbfbf9"
  fallback-ink: "#0b1a2b"
  fallback-accent: "#e3342f"
  fallback-paper-dark: "#0d1b2a"
  fallback-ink-dark: "#eef3f7"
  fallback-accent-dark: "#ff6b62"
typography:
  display:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(42px, 6.4vw, 74px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(34px, 4.4vw, 56px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  section:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(30px, 3.6vw, 42px)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  tagline:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(21px, 2.6vw, 30px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "0"
  title:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(24px, 2.4vw, 30px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  subtitle:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  prose:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.4vw, 19px)"
    fontWeight: 400
    lineHeight: 1.72
    letterSpacing: "0"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15.5px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "0"
  ui:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0"
  small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
    textTransform: "uppercase"
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "10px"
  md: "16px"
  lg: "24px"
  xl: "30px"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "18px"
  xl: "28px"
  card: "18px 20px"
  section: "clamp(40px, 6vw, 72px)"
  pad: "clamp(18px, 4vw, 40px)"
  shell: "1120px"
  frame: "48px"
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
  button-outline-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
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
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "6px 8px 6px 10px"
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
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card}"
  card-hover:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
  hero-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 clamp(20px, 3.4vw, 40px) clamp(24px, 3.4vw, 36px)"
  hero-cover:
    backgroundColor: "{colors.accent-fill}"
    textColor: "#ffffff"
    height: "clamp(150px, 24vw, 250px)"
  project-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.lg}"
    padding: "16px 18px 18px"
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
  title-block:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.small}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  floating-pill:
    backgroundColor: "{colors.white}"
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

# Design System: Blue Sheet

## Overview

**Creative North Star: "The Blue Sheet"**

A resume laid out on a drafting sheet rather than printed on paper. The page is a cool blue-white sheet with a faint blueprint grid at the top that dissolves as the reading begins, trimmed by a dashed cut line with registration marks in the corners. Everything on it sits in rounded cards with soft, low shadows: the hero card (a drawn blueprint band of construction lines across the top, the monogram breaking out of it, then the name, title and actions), the contribution calendar, the roles on their rail, the project tiles, the four cards of skill pills, the degree and certificates, and the two-part contact card. One blue does all the work, from the palest wash under a chip to the deep fill of a solid button. Headings are Instrument Serif at regular weight; running text is Inter; dates, labels, counts and tags are IBM Plex Mono, tracked and uppercase.

The voice is still a document, not a campaign: at rest the home page reads top to bottom as the resume it complements (hero, activity, who, experience, projects, stack, education, contact), and the depth (a project's dialog and full page, the case study, the walkthrough, the site's own deep dive and tracker) opens on request. Blue Sheet replaced Blueprint Press on 2026-11-08 on the same data, the same wording and the same Studio-driven token system: paper, ink and accent are still five seeds per mode run through one ramp, so every palette preset re-inks the whole sheet.

Every transition uses one easing curve, `cubic-bezier(0.22, 0.9, 0.28, 1)`: sections rise 22px into place once, cards lift 4px on hover, the nav's active tint slides between links on a spring, the hero's cover draws itself on, the calendar's cells pop in column by column, the dialog scales in from 97%. Wheel scrolling glides (an inertial scroll that steps aside for touch, keyboard, reduced motion and anything that scrolls on its own), and a monogram chip trails the pointer across the hero. Dark mode swaps the sheet for near-black navy and lifts the ink to pale blue-white; the accent lightens for text but every fill cuts deeper (`accent-fill` is the accent mixed 30% toward black), so the darkroom print is the same hue turned down, not a brighter button on black.

**Key Characteristics:**

- One blue, five jobs: `tint` (chip and active-link washes, table heads, the contact card's left half), `accent-soft` (hovered pills, the calendar's first step), `accent` (text, lines, icons, the active rule under a section title), `accent-fill` (solid buttons, active filters, the hero cover, the toggle thumb), `glow` (the radial wash behind the hero and the grid's tint).
- Serif display over sans body over mono labels. Instrument Serif at 400 only; Inter for everything read; IBM Plex Mono for anything measured, dated or counted.
- Rounded everywhere: 10px inputs, 16px small cards, 24px cards and the dialog, 30px the hero card and the sheet frame, pills for every control.
- Shadows exist, quietly: three steps (`sm` for resting cards, default for hovers and the nav once scrolled, `lg` for the dialog), all tinted with ink at 5–16%.
- The dashed sheet frame on wide screens; on a phone the window is the sheet.
- One easing curve, one entrance pattern (`Reveal`), hover lifts of 2 to 4px, and a full `prefers-reduced-motion` opt-out that freezes every animation on its final frame and turns the smooth scroll and cursor mark off.

## Colors

Paper and ink with one accent, where every secondary tone is a fixed mix of the two and every surface is a fixed mix of the accent.

### Primary

- **Accent** (`{colors.accent}` / `{colors.accent-dark}`): the sheet's blue as a line or a letter. Section-title rules, the hero title, eyebrows, link text, icons beside meta lines, bullet markers, the role rail's dots, the calendar's hover stroke, emphasis phrases on a hovered bullet, the chip's text and pulsing dot. Lightens in the dark so text keeps contrast.
- **Accent Fill** (`{colors.accent-fill}` / `{colors.accent-fill-dark}`): the same blue as a surface. Solid buttons, the active filter, the hero cover's gradient, the theme toggle's thumb, the "This site" tag, the section rule, the calendar's third step. Deepens in the dark: the hue turned down, never brighter.
- **On Accent** (`{colors.on-accent}`): text on the fill, whichever of paper or ink reads better on it.
- **Blue** (`{colors.blue}` / `{colors.blue-dark}`): the second, deeper blue for drawn geometry and data: the monogram's bowl, the calendar's fourth step, the gantt's secondary series, the cover gradient's upper edge.

### Surfaces

- **Paper** (`{colors.paper}` / `{colors.paper-dark}`): the sheet. Also painted on `<html>` so the overscroll gutter matches, and the dialog's floor.
- **White** (`{colors.white}` / `{colors.white-dark}`): every card and control (the hero card, the activity card, project tiles, stack cards, certificates, the contact card's right half, inputs, the nav pill, the title block, the floating pills). One visible step off the sheet in light; one step up from it in the dark.
- **Tint** (`{colors.tint}` / `{colors.tint-dark}`): the faintest accent wash. Chips, the active nav link, table headers, the contact card's left half, the theme toggle's track, the "Show more" button, the project card's typographic cover.
- **Accent Soft** (`{colors.accent-soft}` / `{colors.accent-soft-dark}`): a stronger wash for the calendar's first step and hover states that need more than tint.
- **Glow** (`{colors.glow}` / `{colors.glow-dark}`): the radial wash behind the hero and the grid lines' colour, at low opacity.

### Neutral

- **Ink** (`{colors.ink}` / `{colors.ink-dark}`): headings, primary text, the section rule's partner, card hover borders.
- **Prose** (`{colors.prose}`): running text (ink mixed 10% toward paper).
- **Ink Soft** (`{colors.ink-soft}`): bullets, summaries on cards, role context, certificate issuers (25%).
- **Pill Text** (`{colors.pill-text}`): skill pill labels (29%).
- **Muted** (`{colors.muted}`): nav links at rest, dates, counts, meta lines, the footer note, table headers, legend text (36%). The smallest tone any text may use.
- **Faint** (`{colors.faint}`): the title block's keys, weekday labels, dots and ticks (50%). Not for running text.
- **Rule** (`{colors.rule}`): hairline borders between roles, under the dialog bar, between table rows (87%). Card borders use `--line`, ink at 11%, so they read on both paper and white.

### Semantic

- **Insertion** (`{colors.insertion}` / `{colors.insertion-dark}`): the "+ lines" count on a timeline entry; deletions use the accent.
- **Scrim** (`{colors.scrim}`): the lightbox backdrop. The dialog's scrim is ink at 50% with a 6px blur.
- **Error**: `#c0392b` on the form's failure note only.

### Named Rules

**The One Blue Rule.** Colour is one hue in five jobs (tint, soft, accent, fill, glow) plus a deeper partner for drawn geometry and data. Surfaces are paper, white and tint; text is ink and its ramp. No second hue reaches type or chrome.

**The Deeper-in-the-Dark Rule.** Dark mode lightens the accent for text and darkens the fill for surfaces. `lib/palette.ts` derives `accent-fill` as the accent mixed 30% toward black on a dark palette, so a solid button in the dark is the same blue turned down, never a brighter block on black. Any new fill uses `--accent-fill`, never `--accent`.

**The Ramp Rule.** Never hand-pick a gray or a wash. Secondary tones come from the ramp (prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87) and surfaces from the accent (tint 0.92/0.86 toward white, soft 0.78/0.70, glow 0.84/0.78 toward paper, light/dark), so every preset and any custom palette shares one rhythm. muted is the floor for text; faint is for lines and dots.

**The Portal Rule.** Tokens are scoped to `.bp`. Anything rendered through a portal must land inside it (`[data-sheet-portal]` in the site layout, which the project dialog uses) or carry literal colours (the lightbox, which portals to `<body>`).

**The Hard-Copy Rule.** Four places cannot read CSS variables and carry literal copies of the active preset: `components/GanttChart.tsx` (mermaid theme variables), `app/icon.svg`, `app/apple-icon.tsx`, and `app/opengraph-image.tsx`. A palette change must reach them by hand.

## Typography

**Display Font:** Instrument Serif (with Iowan Old Style, Georgia, serif)
**Body Font:** Inter (with system-ui, sans-serif)
**Label Font:** IBM Plex Mono (with ui-monospace, SF Mono, Menlo, monospace), uppercase and tracked for labels, plain for data.

**Character:** A drafting pairing. Instrument Serif is high-contrast and narrow, set large with tight negative tracking and a line height at or below 1, so the name, the section titles and the project names read like the title of a drawing. Inter is a neutral reading sans at generous size and line height, so the resume's bullets and summaries read quickly on a screen. Plex Mono carries every measurement: dates on the rail, photo counts, the calendar's totals, the eyebrow over a project, the title block in the footer.

### Hierarchy

- **Display** (400, `clamp(42px, 6.4vw, 74px)`, 0.98, -0.03em): the hero name, on one line.
- **Headline** (400, `clamp(34px, 4.4vw, 56px)`, 1, -0.025em): a project's name in its dialog and on its page.
- **Section** (400, `clamp(30px, 3.6vw, 42px)`, 1.05, -0.02em): "Who is Riley?", "Experience", "Projects", "Tech & hardware stack", "Education", page titles on `/projects` and `/contact`; each carries a 36×3px accent rule beneath it.
- **Tagline** (400, `clamp(21px, 2.6vw, 30px)`, 1.2, accent): the title line under the hero name, with a blinking caret.
- **Title** (400, `clamp(24px, 2.4vw, 30px)`, 1.15, -0.015em): role titles on the rail, project names on cards, stack card headings, the degree's school.
- **Subtitle** (400, 18–24px): the activity card's title, certificate names, the form's title, the dialog bar's name, the footer note (italic).
- **Prose** (400, `clamp(17px, 1.4vw, 19px)`, 1.72, `text-wrap: pretty`, max 68ch): the summary, a project's summary, the contact paragraph.
- **Body** (400, 15.5px, 1.62): bullets, role context (italic), card summaries at 14px.
- **UI** (500, 14px): buttons, nav links, filters, the "Show more" button.
- **Small** (400, 13px): pills, table cells, issuers, fact values, meta lines at 14.5px.
- **Label** (400, 11–12px, 0.08–0.16em, uppercase, mono): eyebrows, chips, type tags on covers, the title block's keys, table headers, certificate dates, "Back to top", the cover's sheet label.
- **Data** (400, 12.5px, 0.04em, mono): dates on the rail, photo counts, the calendar's total and month labels, link notes.

### Named Rules

**The Regular Serif Rule.** Instrument Serif is loaded at weight 400 only. Emphasis in the serif comes from size, never from a synthesized bold.

**The Mono-Measures Rule.** Anything that is a number, a date, a count, a hash or a tag is set in Plex Mono. Anything that is a sentence is set in Inter. The serif names things; it never labels them.

**The Studio Roles Rule.** Three faces are Studio choices (Site Settings → Typography: header, sub-header, body) among the eight preloaded in `app/(site)/layout.tsx`; the mono is fixed. Blue Sheet ships with Instrument Serif / Instrument Serif / Inter.

**The No-Eyebrow-Over-Sections Rule.** Section titles stand alone with their rule beneath. Eyebrows (mono, accent) appear only where they name a category: a project's type over its name.

## Layout

A 1120px shell with `clamp(18px, 4vw, 40px)` side padding, inside a dashed sheet frame on screens 1000px and wider (the frame adds 48px, its corners carry `+` marks). Sections are stacked with `clamp(40px, 6vw, 72px)` above each; a section opens with its title row (title left, an aside right) and then one card, a grid of cards, or a list.

- **Hero card**: full shell width, a 150–250px drawn cover band, the 96px avatar circle overlapping the band's bottom edge by 44px with the status chip on the right, then name, title, meta line, actions.
- **Activity card**: full width; the calendar scrolls sideways inside it below 720px.
- **Summary**: prose beside a 300px column of fact cards (one column below 980px).
- **Experience**: a 150px date column with a rail and a dot, then the role; one column below 760px with the dates inline.
- **Projects**: three columns of tiles, two below 980px, one below 760px; filters above on `/projects`.
- **Stack**: two columns of cards, one below 760px.
- **Education**: the degree card beside a two-column grid of certificates (1.1fr : 2fr), one column below 980px.
- **Contact**: one card split 1 : 1.15 (the ways in on tint, the form on white), stacked below 760px.
- **Project dialog**: `min(1040px, 100%)` wide, `min(92vh, 100%)` tall, centred; on a phone it rises from the bottom edge with the top corners rounded.
- **Project page**: the same body inside the shell, with a back link above and previous/next links below.

**Breakpoints:** 1000px (frame appears), 980px (grids drop a column), 760px (everything one column, the nav drops its name, the dialog becomes a sheet).

## Elevation & Depth

Depth is quiet: a card rests on `--shadow-sm`, lifts 4px onto `--shadow` on hover, and the dialog floats on `--shadow-lg` over a blurred scrim. The nav pill starts on `--shadow-sm` at 72% white with a 16px blur and condenses onto `--shadow` at 86% once the page has scrolled 28px. Solid buttons carry an accent-tinted shadow (30% at rest, 36% on hover) rather than an ink one.

### Shadow Vocabulary

- `--shadow-sm`: `0 1px 2px ink/6%, 0 6px 18px ink/5%` — resting cards, the nav at the top, the floating pills.
- `--shadow`: `0 2px 6px ink/6%, 0 18px 44px ink/9%` — hovered cards, the hero card, the condensed nav, the avatar.
- `--shadow-lg`: `0 10px 30px ink/12%, 0 40px 90px ink/16%` — the dialog.
- Accent shadow: `0 8px 22px accent/30%` on solid buttons.

### Named Rules

**The Lift Rule.** Hover lifts are 2px (buttons), 3px (contact rows nudge right instead), 4px (cards) and never more; the shadow grows one step with the lift.

**The Blur-Behind Rule.** Anything that floats over content (the nav pill, the dialog bar, type tags over a cover, the floating pills) is translucent white with a backdrop blur, never opaque.

## Shapes

- **Rounded**: 10px inputs and code blocks; 16px small cards, facts, certificates, the title block, gallery frames; 24px cards, project tiles, the dialog, the contact card; 30px the hero card and the sheet frame.
- **Pills**: every button, chip, filter, skill pill, nav link, date box, tag, the theme toggle, the floating controls.
- **Circles**: the avatar, the cursor mark, the rail dots, the chip's dot, the tour button.
- **Squares**: only the calendar's cells (2.5px radius) and the monogram's own geometry. The `xs` 4px step is for focus rings, the section rule, and the calendar cells; nothing else goes below 10px.

## Components

### Buttons

- **Solid** (`.btn--solid`): accent fill, on-accent text, pill, 42px, an accent shadow and a slow sheen on the primary one (Download PDF, Send message, Generate PDF). Hover darkens the fill 12% toward ink.
- **Outline** (`.btn`): white, ink text, an ink/14% border, `--shadow-sm`; hover lifts 2px and tints the border toward the accent. Email, LinkedIn, GitHub, View all projects, project links, Open full page.
- **Ghost** (`.btn--ghost`): no fill or shadow; hover fills with tint. The dialog's close.
- **Icon** (`.btn--icon`): a 42px circle for one icon.
- **Small** (`.btn--sm`): 36px, 13px type, for links inside a project body and the dialog bar.
- Kept aliases: `.bp-btn` and `.bp-btn--solid` resolve to the same styles for the project-body components that still use them.

### Links

- **Inline** (`.bp-link`): accent text, 500, an accent underline that grows from the left on hover; the arrow icon nudges. Certificate credentials, "View on GitHub".
- **Prose links** (`.prose a`): accent with a 45% underline that fills on hover.
- **Read more** (`.bp-bullet-link`, `app/(site)/bullet-link.css`): the accent button at the end of a resume bullet, in whichever motion the Studio chose (glint by default).

### Chips and pills

- **Chip** (`.chip`): tint, accent mono label, a pulsing dot when it marks a live status (Open to relocation).
- **Pill** (`.bp-pill`, `app/(site)/skill-pills.css`): paper, pill-text, hairline; hover tints and lifts 2px. A linked pill (`.bp-pill--linked`) keeps its Studio-chosen border and hover card.
- **Filter** (`.filter`): white, muted, pill; the active one is accent fill with on-accent text.
- **Type tag** (`.project-card-type`): mono, uppercase, translucent white over the cover; the "This site" tag is accent fill.

### Cards

- **Card** (`.card`): white, `--line` border, 24px radius, `--shadow-sm`; `.card--hover` lifts and tints its border; `.bp-spot` adds an accent spotlight under the cursor.
- **Hero card** (`.hero-card`): 30px radius, the drawn cover (`HeroCover`), the avatar circle, the status chip, name, title with caret, meta line, actions; `[data-cursor-zone]` for the cursor mark.
- **Activity card** (`.activity`): the calendar as an SVG (12px cells, 3px gaps, Sunday on top), month and weekday labels in mono, a total and a legend.
- **Fact** (`.fact`): a mono label over a value, 16px radius; four of them beside the summary.
- **Role** (`.role`): a dated row on a rail; the dot fills on hover; bullets with reactive emphasis; a "Show N more" pill after six.
- **Project tile** (`.project-card`): a 16:10 cover (photo, PDF page, video poster, or the monogram over a grid), tags over it, name, two lines of summary, dates and photo count in mono, an arrow that nudges on hover. The whole tile is a button; its id is the hash anchor.
- **Stack card** (`.stack-card`): a heading with a count, then pills.
- **Degree / Certificate** (`.degree`, `.cert`): the school with a cap icon; name, issuer, mono date, credential link.
- **Contact card** (`.contact-card`): tint half with the tagline, the paragraph and the ways in as rows; white half with the form.

### Dialog (`.dlg`)

A centred panel over an ink/50% blurred scrim: a bar with the name, type, Open full page and close; a scrolling body holding the project body (eyebrow, name, tagline, date box and count, gallery, summary, bullets, links, case study toggle, walkthrough, deep dive, tracker). Opens with `#project-<id>` in the URL (`-case-study` to expand the case study), closes on Escape, the scrim or the back button; focus is trapped and restored; the page is locked beneath it.

### Navigation (`.nav`)

A floating pill, centred and sticky: the monogram and name, three links with a sliding tint behind the active one, the theme toggle. Condenses (tighter padding, deeper shadow, more opaque) after 28px of scroll. Drops the name below 760px.

### Form (`.form`)

Name and email side by side, message below, a solid Send; inputs are 10px-radius white with an accent focus ring at 16%; a status line under the button; a hidden honeypot field.

### Title block (`.footer-block`)

The drawing's title block: sheet, revision (the commit hash and date the page was built from), drawn in; mono keys, tabular values, 16px radius.

### Floating controls (`.bp-top`, `.bp-studio-link`)

Pill, mono label, translucent white with blur, `--shadow`; Back to top bottom-left once the page has scrolled 80% of a screen, Edit in Studio bottom-right in development only.

### Monogram (`BpMark`)

Unchanged from Blueprint Press: the stem draws, the bowl draws in the accent-to-blue gradient, the ring chases. In the nav at 30px, in the hero avatar at 60px, in the cursor mark at 24px, on a typographic cover at 54px, in the footer at 52px (floating).

## Do's and Don'ts

### Do

- Put every surface on a card and every control in a pill; the sheet itself stays uncluttered.
- Use `--accent-fill` for anything painted and `--accent` for anything drawn or written, so dark mode deepens the one and lightens the other.
- Set measurements, dates, counts and tags in the mono; sentences in Inter; names in the serif.
- Keep the home page readable as the resume at rest: hero, activity, who, experience, projects, stack, education, contact, in that order.
- Open a project where the visitor is (the dialog) and offer the page behind it (Open full page); keep `#project-<id>` as the address of a project so resume links and shared links land.
- Lift 2–4px on hover, grow the shadow one step, and use the one easing curve.
- Render portals inside `[data-sheet-portal]` so tokens resolve.
- Derive new colours from the seeds in `lib/palette.ts`; add new copy as a Studio field, never a string in a component.

### Don't

- Don't introduce a second hue on type or chrome; the deeper `blue` is for geometry and data only.
- Don't paint a fill with `--accent` (it goes brighter, not deeper, in the dark).
- Don't square a corner or drop a shadow to zero on a card; the sheet is rounded and quietly raised.
- Don't put an eyebrow over a section title; eyebrows name a project's type only.
- Don't pin, scroll-jack or trap the wheel: the smooth scroll must keep stepping aside for touch, keys, reduced motion and inner scrollers.
- Don't hand-pick a gray, a wash or a shadow colour.
- Don't render the dialog, a tooltip or a menu into `<body>` and expect `var(--ink)` to resolve.
- Don't add a hero video, a marketing voice or a metric the data files cannot back.
