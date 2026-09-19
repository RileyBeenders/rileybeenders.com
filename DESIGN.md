---
name: Blueprint Press
description: A resume set on paper with ink, one accent, hairline rules, and a fixed blueprint grid showing through the page. Editorial serif type, square hairline cards, no labels above headings, and one easing curve shared by every transition.
colors:
  # The live palette is a Studio-selected preset (data/header.json → theme.paletteId, seeds in lib/palettes.ts).
  # Twelve roles per mode; the six secondary tones are a fixed tint ramp from ink toward paper (lib/palette.ts:
  # prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87) and on-accent is whichever of
  # paper or ink reads better on the accent. Values below are the ACTIVE preset, "Electric".
  paper: "#ffffff"
  white: "#f4f4f4"
  ink: "#171a20"
  prose: "#2e3136"
  ink-soft: "#515358"
  pill-text: "#5a5c61"
  muted: "#6b6c70"
  faint: "#8b8d90"
  rule: "#e1e1e2"
  accent: "#3e6ae1"
  blue: "#3e6ae1"
  on-accent: "#ffffff"
  paper-dark: "#000000"
  white-dark: "#141414"
  ink-dark: "#ffffff"
  prose-dark: "#e6e6e6"
  ink-soft-dark: "#bfbfbf"
  pill-text-dark: "#b5b5b5"
  muted-dark: "#a3a3a3"
  faint-dark: "#808080"
  rule-dark: "#212121"
  accent-dark: "#3e6ae1"
  blue-dark: "#3e6ae1"
  on-accent-dark: "#ffffff"
  # Two semantic colors outside the ramp: the timeline's insertion green (paired with the accent for deletions)
  # and the lightbox scrim.
  insertion: "#2e7d4f"
  insertion-dark: "#6cc48e"
  scrim: "rgba(8, 16, 26, 0.93)"
  # The hand-tuned "Default" preset is the no-JS fallback written literally in blueprint.css.
  fallback-paper: "#fbfbf9"
  fallback-white: "#ffffff"
  fallback-ink: "#0b1a2b"
  fallback-prose: "#26333f"
  fallback-ink-soft: "#46545f"
  fallback-pill-text: "#4a5c6b"
  fallback-muted: "#616b75"
  fallback-faint: "#838b92"
  fallback-rule: "#d9dee3"
  fallback-accent: "#e3342f"
  fallback-blue: "#2f86c4"
  fallback-on-accent: "#fbfbf9"
  fallback-paper-dark: "#0d1b2a"
  fallback-white-dark: "#142a3d"
  fallback-ink-dark: "#eef3f7"
  fallback-prose-dark: "#d7e0e8"
  fallback-ink-soft-dark: "#b7c4d1"
  fallback-pill-text-dark: "#a9b8c5"
  fallback-muted-dark: "#9da5ad"
  fallback-faint-dark: "#7e8791"
  fallback-rule-dark: "#24384a"
  fallback-accent-dark: "#ff6b62"
  fallback-blue-dark: "#5aa9e6"
  fallback-on-accent-dark: "#0d1b2a"
typography:
  display:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(58px, 12vw, 152px)"
    fontWeight: 400
    lineHeight: 0.86
    letterSpacing: "-0.038em"
  headline:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(48px, 9vw, 116px)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  tagline:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(23px, 3vw, 33px)"
    fontWeight: 400
    lineHeight: 1.22
    letterSpacing: "0"
    fontStyle: "italic"
  title:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(28px, 3.2vw, 38px)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.012em"
  subtitle:
    fontFamily: "Instrument Serif, Iowan Old Style, Georgia, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  prose:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "clamp(18px, 1.55vw, 22px)"
    fontWeight: 400
    lineHeight: 1.68
    letterSpacing: "0"
  body:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.66
    letterSpacing: "0"
  ui:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0"
  small:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  index:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.26em"
    textTransform: "uppercase"
  label:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.12em"
    textTransform: "uppercase"
  caption:
    fontFamily: "Spectral, Georgia, serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.1em"
    textTransform: "uppercase"
rounded:
  none: "0"
  pill: "999px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "9px"
  md: "12px"
  lg: "24px"
  xl: "40px"
  grid-gap: "50px"
  section: "clamp(36px, 5vw, 56px)"
  hero-top: "clamp(48px, 8vw, 92px)"
  pad: "clamp(20px, 5vw, 64px)"
  index-column: "190px"
  shell: "1240px"
components:
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "15px 28px"
    height: "48px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  button-solid:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.ui}"
    rounded: "{rounded.none}"
    padding: "15px 28px"
    height: "48px"
  button-solid-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  link-inline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "3px 0"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.ui}"
    padding: "6px 2px"
  nav-link-active:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.ui}"
    padding: "6px 2px"
  pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.pill-text}"
    typography: "{typography.small}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  pill-hover:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.subtitle}"
    rounded: "{rounded.none}"
    padding: "18px 20px"
  section-index:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.index}"
    padding: "12px 0 0"
  bullet-link:
    backgroundColor: "transparent"
    textColor: "{colors.accent}"
    typography: "{typography.ui}"
    padding: "0 0 1px"
  footer-block:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "7px 12px"
  role-entry:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    padding: "26px 0 26px 30px"
  floating-pill:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "11px 20px"
  theme-toggle:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    width: "44px"
    height: "24px"
  table-header:
    backgroundColor: "{colors.white}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    padding: "13px 16px"
---

# Design System: Blueprint Press

## Overview

**Creative North Star: "The Blueprint Press"**

A resume printed on paper, over the drafting grid it was laid out on. The page is set on paper with ink, a single accent, and hairline rules, and a fixed blueprint grid (a 16px fine ruling inside a 96px coarse one) shows through the whole page at a few percent of ink. Headings are Instrument Serif at regular weight, tight and large, with nothing above them: no kicker, no eyebrow, no category label. Running text is Spectral. Numbered section indexes sit in a narrow left column like the margin of an engineering drawing, every card is a square hairline box on a slightly whiter sheet, and the page ends in a drawing's title block (sheet, revision, typefaces, place). Nothing is rounded except small controls and dots.

The voice is a document, not a campaign. At rest the home page reads top to bottom exactly like the PDF it complements (summary, experience, toolchain, education); the design's job is to make the reading feel considered and to surface evidence (project links, case studies, galleries) without ever turning into a marketing page. Density is generous: a 1240px shell, a 190px index column with a 50px gutter, and prose at 18 to 22px with a 1.68 line height.

Every transition on the site uses one easing curve, `cubic-bezier(0.22, 0.9, 0.28, 1)`, so the motion reads as a single hand: rules draw from the left, sections rise 22px into place once, hover states lift by a few pixels, and the monogram draws itself on. Dark mode swaps paper and ink to black and white (or navy and pale on the Default preset) and changes nothing else. The palette itself is a Studio setting: five seed colors per mode run through a fixed tint ramp, so any preset inherits the same tonal rhythm.

**Key Characteristics:**

- Warm-neutral paper with one accent; the accent is used for indexes, the solid CTA, inline evidence links, link underlines, active nav, hover bars, and the badge dot, never for surfaces.
- Instrument Serif display at weight 400 only (the face ships no bold), Spectral body, both loaded through `next/font`; the three roles (header, sub-header, body) are Studio choices among eight preloaded faces.
- Square hairline cards on `white` (one step off `paper`), 1px `rule` borders, 2px ink rules under headings.
- A visible blueprint grid on the page background, fixed to the viewport.
- Uppercase, tracked labels in Spectral for indexes, dates, and captions, never as a label above a heading; the serif never appears in small caps.
- One easing curve, one entrance pattern (`Reveal`), hover lifts of 2 to 5px, and a full `prefers-reduced-motion` opt-out that freezes every animation on its final frame.

## Colors

Paper and ink with a single accent, where every secondary tone is a fixed mix of the two.

### Primary

- **Accent** (`{colors.accent}`, Electric Blue #3e6ae1 on the active preset; Signal Red #e3342f on Default): the one voltage on the page. Section index numerals, the solid Download button, the "see ICARUS-Lite" evidence link on a resume bullet, link underline wipes, the active nav underline, the role entry's hover bar, the cert card's wipe bar, the relocation badge's dot, drop caps, and inline links inside prose and tables.
- **On Accent** (`{colors.on-accent}`): text set on the accent fill. Derived per preset as whichever of paper or ink reads better on the accent, so the solid button stays white on blue in dark mode.
- **Blue** (`{colors.blue}`): a second hue for diagrams and data (the monogram's bowl, the gantt chart's secondary series, the coming-soon ring). On the Electric preset it equals the accent; on the other nine presets it is a distinct cooler tone.

### Neutral

- **Paper** (`{colors.paper}` / `{colors.paper-dark}`): the page floor. Also painted on `<html>` so the overscroll gutter matches.
- **White** (`{colors.white}` / `{colors.white-dark}`): card and control surfaces (pills, cert cards, the table frame, the gantt frame, the theme toggle, the floating pills). One visible step off paper.
- **Ink** (`{colors.ink}` / `{colors.ink-dark}`): headings, primary text, 2px rules, button borders and fills.
- **Prose** (`{colors.prose}`): running text in `.bp-prose` (ink mixed 10% toward paper).
- **Ink Soft** (`{colors.ink-soft}`): bullets, secondary copy, the hero tagline (25% toward paper).
- **Pill Text** (`{colors.pill-text}`): skill pill labels (29%).
- **Muted** (`{colors.muted}`): nav links at rest, the brand name, issuers, cert dates, the footer note and title-block values, table headers, timeline ticks (36%). The smallest tone any text may use.
- **Faint** (`{colors.faint}`): rules, ticks, dots, scrollbar thumbs, and the title block's 11px keys (50%). Not for running text.
- **Rule** (`{colors.rule}`): every hairline border and divider (87%).

### Semantic

- **Insertion** (`{colors.insertion}` / `{colors.insertion-dark}`): the "+ lines" count on a timeline entry; deletions use the accent.
- **Scrim** (`{colors.scrim}`): the lightbox backdrop, a near-ink navy at 93%.

### Named Rules

**The One Accent Rule.** Color lives in the accent alone. Surfaces are paper and white; text is ink and its tints. A second hue (`blue`) appears only inside drawn geometry and data, never on type or chrome.

**The Ramp Rule.** Never hand-pick a gray. Secondary tones come from `lib/palette.ts`'s ramp (prose 0.10, ink-soft 0.25, pill-text 0.29, muted 0.36, faint 0.50, rule 0.87) so all ten presets and any custom palette share one tonal rhythm. muted is the floor for text (it clears 4.5:1 on paper and white in both themes on every preset); faint is for lines and dots.

**The Hard-Copy Rule.** Four places cannot read CSS variables and carry literal copies of the active preset: `components/GanttChart.tsx` (mermaid theme variables), `app/icon.svg` (the tab icon), `app/apple-icon.tsx`, and `app/opengraph-image.tsx`. A palette change must reach them by hand.

## Typography

**Display Font:** Instrument Serif (with Iowan Old Style, Georgia, serif)
**Body Font:** Spectral (with Georgia, serif)
**Label Font:** Spectral, uppercase and tracked. IBM Plex Mono appears only for data on `/about-this-site` (commit hashes, line counts, the demos' file paths), never as a costume.

**Character:** An editorial pairing. Instrument Serif is high-contrast and narrow, set very large with tight negative tracking and a line height below 1, so the name and page titles read like a masthead. Spectral is a warm reading serif at generous size and line height, so the resume body reads like a printed document rather than a UI.

### Hierarchy

- **Display** (400, `clamp(58px, 12vw, 152px)`, 0.86, -0.038em): the home hero name, two lines, each revealed separately.
- **Headline** (400, `clamp(48px, 9vw, 116px)`, 0.9): page titles on the other routes (`/projects`, `/contact`, `/more-info` at `clamp(44px, 8vw, 96px)`, `/about-this-site`).
- **Tagline** (400 italic, `clamp(23px, 3vw, 33px)`, 1.22, ink-soft, max 24ch): the line under the hero rule.
- **Title** (400, `clamp(28px, 3.2vw, 38px)`, 1.12, -0.012em): role titles in Experience, degree names in Education. Regular weight; the size carries the hierarchy.
- **Subtitle** (400, 20–21px): skill group headings, cert card titles, contact card titles.
- **Prose** (400, `clamp(18px, 1.55vw, 22px)`, 1.68, `text-wrap: pretty`): summary and page intros, with an accent drop cap on the summary.
- **Body** (400, 17px, 1.6–1.66): bullets and role context (context in italic).
- **UI** (500, 15px): buttons, nav links, the footer note.
- **Small** (400, 14px): pills, table cells, issuers, the location line.
- **Index** (400, 16px, 0.26em, uppercase, accent): "01  Summary" and its siblings, written as the section's `h2`.
- **Label** (500, 11–13px, 0.1–0.2em, uppercase): dates, the brand name, "Read more", "Back to top", table headers, cert dates, the footer URL.

### Named Rules

**The Regular Serif Rule.** Instrument Serif is loaded at weight 400 only. Emphasis in the serif comes from size, never from a synthesized bold.

**The Tracked Label Rule.** Anything uppercase is Spectral, 11 to 16px, with 0.1 to 0.3em of tracking. The serif is never uppercased.

**The No-Eyebrow Rule.** Nothing sits above a heading. A page title is the first line of its hero; a section's index is its heading; a card's title is its first line. The words a kicker would have carried go into a fact line beside or below the heading (the hero's "Lead, Research & Development Engineer, Proteor, since January 2025") or into the heading itself.

**The Measure Rule.** Prose runs at most 70 characters per line (`max-width: 70ch` on `.bp-prose`); dates and counts use tabular numerals.

## Layout

The page is a single centered column, `--shell: 1240px` wide, with `--pad: clamp(20px, 5vw, 64px)` of side padding, and every route is a stack of `<section class="bp-section">` blocks separated by a 1px hairline rule that draws in from the left. Inside a section, `.bp-section-grid` is a two-column grid: a fixed `190px` index column holding the uppercase accent-colored "01  Summary" label, then the content column, with a `50px` gutter. On the home page a 2px spine runs down the left gutter beside the sections and fills with the accent as the reader scrolls.

The hero is the one section without the grid: the two-line display name, a 2px ink rule, then a meta row (italic tagline left; on the right the uppercase location over an italic fact line naming the current role, employer, and start date) and the action row (one solid button, three outline buttons). A decorative one-stroke ribbon sits behind the hero at 10% opacity, flush with the shell's right edge.

Vertical rhythm: sections are `clamp(36px, 5vw, 56px)` tall in padding, the hero opens with `clamp(48px, 8vw, 92px)`, role entries stack with 26px of padding and a 4px gap, bullets sit 10px apart, skill groups 26px, cert cards on a 12px gap in an `auto-fill, minmax(260px, 1fr)` grid. The footer closes with a 2px ink rule, the monogram and one italic line on the left, and the title block on the right.

One breakpoint, `max-width: 860px`: the section grid collapses to one column with the index above the content, the nav becomes two rows (brand and theme switch, then a horizontally scrolling link row whose edges fade), the hero location left-aligns, and the relocation badge docks in the corner from the start. Everything else scales fluidly through `clamp()`. There is no tablet step. A print stylesheet drops the chrome, the grid, the badge, and the ribbon so the home page prints as the document it imitates.

## Elevation & Depth

Flat by default. Depth is drawn, not lit: hairline borders in `rule`, 2px rules in ink, and the blueprint grid behind everything. Cards sit on `white`, one step off `paper`, with no shadow at rest. Shadows appear only as a response to hover (pills, cert cards, the bullet's project link) and on the two floating pills (the relocation badge and the back-to-top control), which need lift to read over the grid. The nav and the floating pills also blur what passes behind them (`backdrop-filter: blur(10–12px)`) over a translucent paper or white.

### Shadow Vocabulary

- **Hover lift** (`0 6px 18px color-mix(ink 10%)`): skill pills on hover, with a 3px rise.
- **Card lift** (`0 16px 34px color-mix(ink 13%)`): cert cards on hover, with a 5px rise.
- **Floating pill** (`0 10px 28px color-mix(ink 10%)`): the relocation badge and the back-to-top control at rest.

All three derive from `--ink`, so they exist on every paper, including black.

### Named Rules

**The Drawn Depth Rule.** Rest states have no shadow. If an element needs separation at rest, it gets a hairline border or a whiter sheet, not a shadow.

## Shapes

Square. Cards, buttons, pills, inputs, the table, and the gantt frame all have `border-radius: 0` and a 1px `rule` border (buttons use a 1px ink border). The only rounded forms are small controls and marks: the theme toggle, the relocation badge, the back-to-top control, and the bullet's project link are full pills (`999px`); dots, rings, and the badge's ping are circles. Rules are 2px in ink under headings and 1px in `rule` between sections. The blueprint grid is 1px hairlines at 4.5% ink (fine) and 8.5% ink (coarse).

## Components

### Buttons

- **Shape:** square, 1px border, 48px tall, `15px 28px` padding, 15px/500 label with a 16px stroke-icon arrow.
- **Outline (`.bp-btn`):** transparent on ink border and ink text. On hover the fill wipes in from the left (`::before` scaleX 0→1 over 0.48s), text flips to paper, the button rises 2px, and the arrow nudges 5px.
- **Solid (`.bp-btn--solid`):** accent fill, on-accent text, accent border; the wipe on hover is ink. `:disabled` shows `cursor: wait` at 75% opacity with the wipe held off. A looping diagonal sheen (`.bp-sheen`, 3.6s) runs across the solid button while idle.
- **Focus:** 2px accent outline, 3px offset, on every control.

### Links

- **Inline (`.bp-link`):** ink text with a 1.6px accent underline that wipes in from the left on hover and a 13px diagonal arrow that moves up-right 3px.
- **Read more (`.bp-readmore`):** the same link uppercased, 13px, 0.14em tracking, in the accent.
- **Prose and table links:** accent-colored with a 1px underline at 55% accent, offset 0.18em, solid on hover.
- **Evidence link (`.bp-bullet-link`):** at the end of a resume bullet, "see ICARUS-Lite" plus an 11px diagonal arrow, 15px/500 accent text with the same underline treatment. No fill, no radius: it is part of the sentence.
- **Nav (`.bp-nav-link`):** 15px muted text, a 2px accent underline that scales in from the left on hover and stays on the active route (ink text). All five links are flat color.

### Pills (`.bp-pill`)

- **Style:** white sheet, hairline border, 14px pill-text label, `8px 16px` padding, square corners.
- **Hover:** border to ink, text to ink, 3px rise, hover-lift shadow.

### Cards (`.bp-cert`, contact cards)

- **Corner Style:** square.
- **Background:** white, 1px rule border, `18px 20px` padding.
- **Content:** a 21px serif title, a 14px muted issuer, a 12px faint uppercase date, an optional inline link, and a 2px accent bar at the bottom that wipes in on hover.
- **Hover:** border to ink, 5px rise, card-lift shadow.

### Role entry (`.bp-role`)

A resume entry with a 2px rule down its left edge. Hover shifts the whole entry 7px right and wipes an accent bar down that rule. Inside: the serif title and an uppercase 13px date on one baseline row, the organization in 20px accent, italic 17px context, then a bullet list with accent markers. Each bullet's emphasized phrases take the accent (with a hairline text stroke) when the bullet is hovered, and a bullet can carry a small accent pill linking to its project.

### Section index (`.bp-section-index`)

The section's `h2`: the uppercase 16px accent label ("02  Experience") in the 190px column, 0.26em tracking, set in the body face, aligned to the content's top with 12px of padding. Each section carries an id (`#summary`, `#experience`, `#skills`, `#education`) so the index doubles as a jump target.

### Title block (`.bp-footer-block`)

A hairline-boxed `<dl>` on the footer's right: Sheet (the domain), Rev. (short commit and build date, read from Vercel's environment or git at build time), Set in (the header and body typefaces plus the palette name, from the Studio's choices), Drawn in (the location). 11px uppercase faint keys, 12px ink-soft values, tabular numerals.

### Navigation (`.bp-nav`)

Sticky, 82% paper with a 12px backdrop blur and a hairline bottom rule. Brand at left (the 34px animated monogram plus the uppercase 13px muted name), links and the theme toggle at right. The toggle is a 44×24 white pill whose 18px ink thumb slides 20px and turns accent when dark is on. Under 860px the bar stacks and the links wrap.

### Floating pills (`.bp-badge`, `.bp-top`)

Fixed to the bottom corners: a white pill at 92% with blur, hairline border, floating-pill shadow. The relocation badge (right) carries a 9px accent dot with a pinging ring and a typewriter label that types, holds, and deletes on a loop; on the home page it rests beside the hero rule on wide screens and hops to the corner on scroll, and starts docked below 860px. Back to top (left) is 11px uppercase with an arrow and fades in after scrolling.

### Table (`.bp-table`)

White frame with hairline border, `overflow-x: auto`. 11px uppercase muted headers over a 2px ink rule, 14px cells with hairline row dividers, rows tint 3% ink on hover. Inline links in the accent.

### Monogram (`BpMark`)

The site's "B" drawn as strokes: a `[data-draw]` set that draws on and off over 7.3s, a `[data-chase]` dash that circulates, and an optional 5px float. The bowl uses `blue`; the stem uses ink.

## Do's and Don'ts

### Do

- **Do** put color only in the accent: indexes, the solid CTA, evidence links, underlines, hover bars, the badge dot. Surfaces stay paper and white.
- **Do** derive every gray from the ramp in `lib/palette.ts` and every palette from five seeds, so all presets and dark mode keep the same rhythm.
- **Do** keep cards, buttons, and frames square with 1px `rule` borders; reserve `999px` for small floating controls and `50%` for dots.
- **Do** run every transition on `--ease` (`cubic-bezier(0.22, 0.9, 0.28, 1)`) and every entrance through `Reveal`; keep hover lifts between 2 and 5px.
- **Do** honor `prefers-reduced-motion` by freezing on the final frame, never by hiding content.
- **Do** keep the index column, the hairline section rules, and the 2px ink rule under every page title; they are the page's structure.
- **Do** put `suppressHydrationWarning` on every `<a>` and `<Link>`.
- **Do** write section indexes as `h2` and keep the heading outline unbroken (h1 title, h2 index, h3 entry, h4 detail).
- **Do** theme the browser's own surfaces: `::selection`, `caret-color`, `accent-color`, underline offset, scrollbars, tabular numerals.

### Don't

- **Don't** synthesize a bold Instrument Serif; the face has none. Go larger instead.
- **Don't** put a kicker, eyebrow, or category label above any heading, on any page, in any card.
- **Don't** set text in `faint` or below 11px; the miniature Studio preview on `/about-this-site` is the one decorative exception (`aria-hidden`, 9px).
- **Don't** draw gradient text; emphasis is size, weight, or the accent.
- **Don't** add a second surface color, a colored band, or a gradient surface; paper, white, and ink are the whole material.
- **Don't** add shadows at rest to cards or controls that are not floating over the page.
- **Don't** hand-write a gray or an accent tint; use the ramp or `color-mix()` from a token.
- **Don't** introduce a second breakpoint or a mobile-only layout; scale with `clamp()` and collapse at 860px.
- **Don't** change the palette in `blueprint.css` alone; the active preset lives in `data/header.json` and is injected by `app/(site)/layout.tsx`, and three files carry hard copies of it.
