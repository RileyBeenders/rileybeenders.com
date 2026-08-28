---
tags: [styling, design]
---

# Design System (globals.css)

Single stylesheet, `app/globals.css` (~1740 lines), imported once from `app/layout.tsx`. No CSS modules, no CSS-in-JS, no Tailwind — plain global CSS with BEM-ish class names and a `:root` design-token layer.

## Design tokens (`:root`)

| Variable | Value | Use |
|---|---|---|
| `--bg` | `#081217` | Page background (deep near-black teal) |
| `--panel` / `--panel-strong` | translucent dark rgba | Panel backgrounds |
| `--paper` / `--paper-muted` | warm off-white / muted gray-green | Resume "paper" surfaces (light-on-dark inversion for readable body content) |
| `--ink` / `--ink-soft` | near-black / soft charcoal | Text on `--paper` surfaces |
| `--line` | translucent warm tan | Hairline borders throughout |
| `--accent` | `#ff8a3d` (orange) | Primary CTA color, active nav state, gallery caption gradient |
| `--accent-2` | `#8be3d6` (teal) | Secondary accent — proof panel, gantt chart secondary color |
| `--accent-warm` | `#e9c46a` (gold) | Tertiary accent — gradients, gantt tertiary color |
| `--font-body` | Segoe UI / Trebuchet MS / sans-serif | Body text |
| `--font-display` | Iowan Old Style / Palatino / Georgia serif | Headings (`h1`/`h2`/`h3`) |
| `--font-mono` | Cascadia Code / Consolas | Debug log text |
| `--pointer-x` / `--pointer-y` / `--rotate-x` / `--rotate-y` | set dynamically by JS | Drive the pointer-reactive ambient glow and 3D tilt — see [[InteractiveResume]] |

These same accent colors are explicitly re-declared inside `GanttChart`'s mermaid `themeVariables` (see [[BulletList GanttChart and JobsTable]]) since mermaid can't read CSS custom properties.

## Major layout patterns

- **`.site-shell`** — full-page container with three stacked `radial-gradient`s: one that tracks `--pointer-x/y` (the pointer glow), two fixed ambient blooms.
- **`.ambient-grid`** — a `fixed`, `pointer-events: none` perspective-tilted grid background (`perspective(900px) rotateX(58deg)`), faded via a bottom `mask-image` — the faux-3D "horizon grid" behind every page.
- **`.resume-stage`** — wraps the whole resume content; its `transform` is driven live by `--rotate-x/--rotate-y` for the pointer-tilt effect (disabled on mobile via a `@media (max-width: 720px)` override to `transform: none`).
- **`.resume-paper` / `.resume-column-main` / `.resume-column-side`** — the 2-column (main + sidebar) resume grid, collapsing to 1 column under `1000px`.
- **`.interactive-card`** — shared hover-glow base class (radial gradient following the pointer) applied to the hero card, timeline cards, and the proof panel.
- **`.hero-card`** — the big name/title header block, shared shape between the homepage header and the simpler heroes on `/projects`, `/contact`, `/more-info`.

## Component-specific class groups worth knowing

- **Header/nav** (`.site-header*`) — see [[SiteHeader]] for behavior; CSS handles the sticky positioning, backdrop blur, and the animated underline's transition timing (`cubic-bezier(0.34, 1.56, 0.64, 1)` — an overshoot/bounce easing).
- **Gallery/lightbox** (`.project-gallery*`, `.image-lightbox*`) — carousel, progress ring (`stroke-dasharray: 100`, animated via `stroke-dashoffset`), full-screen modal, thumbnail strip.
- **Drawer** (`.drawer-backdrop`, `.additional-info-drawer`, `.asset-strip`) — the slide-in project detail panel.
- **Gantt/tracker** (`.gantt-chart-wrap`, `.gantt-chart`, `.jobs-table*`) — note `.gantt-chart { overflow: auto }` is what makes the chart horizontally scrollable per the "Made the Gantt chart scrollable" commit.
- **Coming-soon system** (`.coming-*`, `.signal-*`, `.kanban-*`, `.debug-*`, `.log-dock*`) — fully built out (including 4 kanban tone variants: `tone-live`/`tone-building`/`tone-queued`/`tone-polishing`, and a charge-meter `.signal-meter`) but **currently unused by any component** — see [[Data Layer and Types]] for why.

## Responsive breakpoints

Two breakpoints only:
- **`max-width: 1000px`** — collapses `.resume-paper`/`.hero-card`/`.coming-grid`/`.kanban-board`/`.preview-row` to single-column; `.proof-panel` switches from `sticky` to `static`.
- **`max-width: 720px`** — mobile: reduces shell padding, disables the 3D tilt transform, stacks most grids to 1 column, and switches the image lightbox to edge-to-edge full-viewport (no border/radius, wider nav-arrow padding adjustments).

## Related
- [[InteractiveResume]]
- [[SiteHeader]]
- [[ProjectsExplorer and ProjectDetails]]
- [[Home]]
