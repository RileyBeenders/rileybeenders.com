---
tags: [styling, design]
---

# Design System (Blueprint Press)

Two plain global stylesheets, no CSS modules / CSS-in-JS / Tailwind. The pre-reskin single `app/globals.css` (~1740 lines, `--bg: #081217` dark theme, pointer-tilt vars, kanban/coming-soon system) was deleted.

| File | Imported by | Scope |
|---|---|---|
| `app/base.css` | root `app/layout.tsx` | Bare reset only: `* { box-sizing }`, `body { margin: 0; min-height: 100vh }`, `img { display: block; max-width: 100% }`, `button/input { font: inherit }`, `a { color: inherit; text-decoration: none }`, `.sr-only`. Nothing visual. |
| `app/(site)/blueprint.css` | `app/(site)/layout.tsx` | The entire visible design system (~590 lines). Almost everything is scoped under `.bp`. |

The design source is a Claude Design canvas in `design/` (`*.dc.html` artboards + `canvas.json`, published as `design/rileybeenders-directions.html`).

## Tokens (`.bp { … }`)

| Variable | Value | Use |
|---|---|---|
| `--paper` | `#fbfbf9` | Page background (warm off-white). Also set on bare `html` so the overscroll gutter matches. |
| `--white` | `#ffffff` | Card surfaces (pills, certs, table, gantt frame). |
| `--ink` | `#0b1a2b` | Primary text, headings, rules, buttons. |
| `--ink-soft` / `--muted` / `--faint` | `#46545f` / `#6f7d88` / `#97a3ac` | Secondary → tertiary text. |
| `--rule` | `#d9dee3` | Hairline borders. |
| `--accent` | `#e3342f` (red) | Section index numbers, eyebrows, the solid CTA button, link underlines, active nav, hover bars, badge dot. |
| `--blue` | `#2f86c4` | The monogram bowl, gantt secondary, coming-soon ring. |
| `--ease` | `cubic-bezier(0.22, 0.9, 0.28, 1)` | Shared easing for every transition/animation (matches `Reveal`'s framer-motion curve). |
| `--shell` | `1240px` | Max content width (`.bp-shell`). |
| `--pad` | `clamp(20px, 5vw, 64px)` | Horizontal page padding. |
| `--bp-font-display` / `--bp-font-body` | set by `next/font` in `app/(site)/layout.tsx` | Instrument Serif (headings, italic hero tagline, drop-cap, cert titles) / Spectral (body). Fallbacks: `"Iowan Old Style", Georgia, serif`. |

The blueprint-grid texture is four stacked `linear-gradient`s on `.bp` (`16px` fine + `96px` coarse ruling), `background-attachment: fixed`. `GanttChart` re-declares the accent colors in its mermaid `themeVariables` because mermaid can't read CSS custom properties — see [[GanttChart JobsTable and gantt.ts]].

## Layout & motion patterns

- **`.bp-shell`** — centered `max-width: var(--shell)` column with `--pad` inline padding. Used inside every `<section>`.
- **`.bp-nav`** — sticky, `backdrop-filter: blur(12px)`, translucent paper, bottom hairline. See [[Blueprint Nav and Mark]].
- **`.bp-hero`** — `overflow: hidden`, holds a decorative one-stroke ribbon SVG (`.bp-hero-ribbon`, `bp-draw` stroke animation). `h1` is `clamp(58px, 12vw, 152px)`, `line-height: 0.86`.
- **`.bp-section` + `.bp-section-grid`** — a `190px | 1fr` two-column grid: the uppercase `.bp-section-index` ("01 Summary" …) in the narrow column, content in the wide one. Collapses to one column under `860px`.
- **`.bp-rule` / `.bp-rule--hair`** — 2px ink divider / 1px hairline; animated via `Reveal as="rule"` (scaleX from left).
- **`.bp-prose`** — `clamp(18px, 1.55vw, 22px)`, `max-width: 74ch`, `text-wrap: pretty`. `.bp-dropcap` floats an Instrument Serif capital.
- **`.bp-role`** — experience entry: a left rule that gains a red overlay bar and the whole row shifts `translateX(7px)` on hover.
- **`.bp-pill`** — skill tag: white, hairline border, lifts + shadows on hover.
- **`.bp-cert`** — education card: lifts on hover, a `.bp-cert-bar` wipes in.
- **`.bp-btn`** — outline button with a `::before` fill that wipes in on hover (`scaleX`), arrow nudges. `.bp-btn--solid` is the red Download button; `.bp-sheen` is its looping highlight; `:disabled` shows the wait state.
- **`.bp-link`** — inline link with an underline that wipes in on hover and a diagonal arrow. `.bp-readmore` is the uppercased, letter-spaced, accent-colored variant used for the "Read more" link on `/more-info`.
- **`.bp-soon-*`** — the `BpComingSoon` loader/rings/status/queue. `.bp-badge` — the fixed "Open to relocation" pill with a pinging dot (`bp-ring`).
- **`.bp-gantt` / `.bp-table`** — the tracker frame: `.bp-gantt` is `height: 50vh; overflow: auto` (horizontal scroll for the rescaled chart); `.bp-table-wrap` is `overflow-x: auto`.
- Keyframes: `bp-draw` (stroke draw-on), `bp-float`, `bp-sheen`, `bp-spin` / `bp-pulse` / `bp-sweep` (coming-soon), `bp-ring` (badge).

## Responsive

One breakpoint: **`max-width: 860px`** — `.bp-section-grid` and `.bp-hero-place` go single-column/left-aligned, the nav stacks and its links scroll horizontally, `.bp-soon-type` hides. Everything else scales fluidly through `clamp()`. There is no separate mobile transform-disable step anymore (no 3D tilt exists).

## Related
- [[Blueprint Nav and Mark]]
- [[Blueprint UI Components]]
- [[Routes Overview]]
- [[Home]]
