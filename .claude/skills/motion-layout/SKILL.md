---
name: motion-layout
description: How svelte-bits (github.com/DavidHDev/svelte-bits) composes pages — floating nav that condenses on scroll, layered heroes with fade masks, 12-column bento/feature grids with staggered reveals, marquee rows, card anatomy, dock/pill/tab navigation, expandable steps — and how each maps onto this site's Clean Bench shell (.shell, .page, .sec / .sec-head, the six-column .bento of .card.tile tiles with .tile-hero, the glass .nav / .nav-pill in SiteNav, the project tiles that morph into their dialog). Use this when adding or restructuring a section, hero, nav/header, card grid, list, gallery, tabs, stepper, marquee, sticky element, dialog, or any layout that needs to animate as a unit; when asked to make a page "flow" or "feel more designed"; and when deciding where new layout CSS belongs in bench.css.
---

# Motion Layout (composition that moves as one)

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set. Third of three motion skills: [`motion-design`](../motion-design/SKILL.md) picks *what*; [`motion-fluidity`](../motion-fluidity/SKILL.md) is the element-level *how*; this skill is the *structure* — how sections, navs, grids, and cards are built so that motion reads as a page settling into place rather than parts twitching.

svelte-bits' library components are the famous part, but its own landing site (`src/lib/components/landing/`) is where the *composition* lives: a floating nav that condenses when you scroll, a hero stacked in z-layers with a fade mask at the bottom, a 12-column feature grid whose cards arrive in a 70ms cadence, marquee rows, and cards with a fixed visual/body split. Those patterns transfer; the glass and the orange do not. Detailed CSS for every pattern is in [`references/svelte-bits-layouts.md`](references/svelte-bits-layouts.md) (its "Here" notes were written for the earlier Blueprint Press shell; the table below is the current Clean Bench one).

## The Clean Bench shell (what you're composing into)

The site was redesigned as **Clean Bench** on 2026-11-09 (everything is a tile; direction contract in `.impeccable/surfaces/app-site-page-tsx.md`). It replaced Blue Sheet (2026-11-08, one day), whose `.sheet-frame`, `.hero-card` and `HeroCover` are gone; Blueprint Press's `.bp-shell` / `.bp-section-grid` / `PageSpine` / `BpNav` / `ProjectEntry` went before that. Both are recorded in the vault's `09 Design History/` notes.

| Piece | Where | Rhythm |
|---|---|---|
| `.bp` | `app/(site)/layout.tsx` → `app/(site)/bench.css` | Everything is scoped here. Owns the tokens (`--paper`, `--white`, `--ink`, `--rule`, `--line`, `--accent`, `--accent-fill`, `--tint`, `--accent-soft`, `--glow`, `--ease`, `--mono`, `--shell: 1120px`, `--pad: clamp(18px, 4vw, 40px)`, `--gap: clamp(12px, 1.6vw, 16px)`, radii `--r-sm/--r/--r-lg/--r-xl` 10/14/22/28px, `--shadow-sm/--shadow/--shadow-lg`). `.bp::before` is the bloom: three radial washes behind the top of the page, drifting on `bloom-drift` (22s). |
| `.page` | the site layout | Wraps every page's content (bottom padding only; no frame). `[data-bench-portal]` sits beside it inside `.bp` for portals. |
| `.shell` | `bench.css` (layout) | `max-width: var(--shell); margin: 0 auto; padding-inline: var(--pad)`. Every section is a `section.shell.sec`. (`.bp-shell` is kept as an alias for older markup.) |
| `.sec` / `.sec--tight` / `.sec-head` | `bench.css` (layout), every page | A section is `clamp(40px, 6vw, 72px)` of top space (`--tight`: 28 to 44px), then a `.sec-head` row (`h2.sec-title`, Instrument Sans 600, `clamp(28px, 3.2vw, 38px)`, on the left and an optional `.sec-sub` / `.sec-aside` on the right) inside a `Reveal`, then one tile, a grid of tiles, or a list. No index column, no section numbers, no rule under the title. |
| `.nav` / `.nav-pill` | `components/bench/SiteNav.tsx`, `bench.css` (nav) | A sticky, centred, floating glass pill (66% white, `blur(18px) saturate(1.4)`, `--shadow-sm`) with the brand, three links and the theme toggle. Condenses at `scrollY > 28` (`data-condensed`: tighter top padding, 84% white, `--shadow`). The active link's `--tint` pill slides between links with a shared `layoutId`. |
| `.bento` | `app/(site)/page.tsx`, `bench.css` (bench) | Six columns at `--gap`. `.tile-hero` spans 4 × 3 rows (avatar, chip, name, title, meta, `HeroActions`, its own accent-soft glow); `.tile-now`, `.tile-where`, `.tile-edu` span 2; `.tile-activity` spans the full width (`GithubGraph`); `.tile-site` and `.tile-contact` span 3. Each child enters with `tile-in` (16px, 0.8s) staggered 70ms by `--i`, which `page.tsx` numbers in order. `[data-cursor-zone]` on the bento scopes `CursorMark`. |
| Tiles | `bench.css` (tile) | `.card` (white, `--r-lg`, `--line` border, `--shadow-sm`) plus `.tile` (grid, `clamp(18px, 2.2vw, 24px)` padding) and, for links, `.card--hover` (lifts 3px onto `--shadow`, tints its border) with a `.tile-label` / `.tile-value` / `.tile-sub` / `.tile-arrow` anatomy. |
| Tile grids | `bench.css` | `.project-grid` 3 columns; `.stack-grid` 2; `.edu-grid` 1.1fr : 2fr with `.certs` 2; all at `--gap`. `.summary-grid` `1fr 300px`; the experience list is one `.card.roles` tile with each `.role` on a `150px 1fr` rail. |
| `.dlg` | `components/bench/ProjectDialog.tsx`, `bench.css` (dialog) | The project dialog, `min(1040px, 100%)`, portalled into `[data-bench-portal]` inside `.bp`. Its panel shares `tileLayoutId(id)` with the tile that opened it, so it morphs out of that tile on `MORPH` (`380 / 36 / 0.8`). Its body scrolls on its own (`data-native-scroll`), the page is locked with `html[data-lock]`. On a phone it rises from the bottom as a sheet. |
| `.page-in` | `bench.css` (bench), project pages | A whole page body arriving once (`tile-in`, 0.7s, no observer). Use it for anything taller than the viewport, where `Reveal` would never fire. |
| `.footer` / `.footer-meta` | `components/bench/SiteFooter.tsx` | The animated, floating mark and note, then a mono line of Site, Updated and Based in, on every page. |
| Fixed corners | `components/blueprint/BackToTop.tsx` (bottom-left), `StudioLink.tsx` (bottom-right, dev only) | New fixed elements need a corner that isn't taken. |
| Breakpoints | `bench.css` (responsive) | **980px** (the bento goes to two columns with the hero and education full width; grids drop a column), **760px** (everything one column; the nav drops its name; the dialog becomes a bottom sheet), **640px** (the bento goes to one column). `projects/feature.css` and `walkthrough.css` keep their own 860px. svelte-bits uses 1275 / 1024 / 640; fold those into 980 / 760 / 640 unless a pattern genuinely needs another step. |

CSS goes in `bench.css` under the matching banner comment (`/* ---- nav --- */`, `/* ---- tile --- */`, `/* ---- bench --- */`, `/* ---- projects --- */`, `/* ---- dialog --- */` and so on, dash-ruled to a fixed width), or in `projects/projects.css` for `.pj-` media pieces. Classes are named for their section (`.tile-*`, `.hero-*`, `.activity-*`, `.role-*`, `.project-*`, `.pbody-*`, `.stack-*`, `.contact-*`); `.bp-` stays for the kept primitives (`.bp-link`, `.bp-pill`, `.bp-top`, `.bp-spot`). New banners follow the existing dash-ruled style.

## Composition patterns from svelte-bits, translated

Each pattern: what svelte-bits does (with its numbers), then what it becomes here. Amplitudes follow `motion-design`'s thresholds.

### 1. Nav that condenses on scroll — shipped

svelte-bits: fixed `top: 20px`, an inner bar `max-width: 1680px`, `height: 56px`, transparent; at `scrollY > 50` the inner tightens to `max-width: 1276px`, gets a solid `#14110e` background and a 4%-white border; all four properties transition `0.5s ease`. A single absolutely positioned highlight pill slides to the hovered link (`transform`/`width`/`height` 0.3s) and returns to the active one on leave.

Here: this is `SiteNav` — a floating pill that condenses at `scrollY > 28` (0.4s on `--ease`) and an active-link tint that slides on a `layoutId` spring (`420 / 38 / 0.6`). Extend it rather than adding a second nav; the one open idea is letting the tint follow *hover* and return to the active link on leave, as svelte-bits does.

### 2. Hero as stacked layers — shipped as a tile

svelte-bits: `min-height: 100vh`, `overflow: hidden`; z-layers `0` background canvas → `1` band (`mix-blend-mode: screen`) → `2` an SVG `linearGradient` rect fading to the page color over the bottom half → `3` content grid `1fr 1fr` at `max-width: 1324px`, padding `clamp(120px, 16vw, 240px) 24px 80px`; headline `clamp(28px, 5.5vw, 68px)`, `line-height 1.1`, `letter-spacing -0.02em`; description `max-width: 42ch`; collapses to one column at 1275px.

Here: the hero is a tile in the bento, not a full-bleed stage. Its layers are the page's bloom (`.bp::before`), the tile's own accent-soft glow (`.tile-hero::before`, top right) and the content above it. Keep the bento short enough that the activity tile starts above the fold on a laptop; don't grow the hero to `100vh`.

### 3. Feature / bento grid with cadence — shipped

svelte-bits: `grid-template-columns: repeat(12, 1fr)`, `gap: 16px`, cards `span 7 / 5 / 4 / 3`; each card starts `opacity: 0; translateY(24px)` and gets `.is-visible` from an IntersectionObserver (once, unobserve after) with `transition-delay: i * 70ms`; hover `border-color` brighten + `translate: 0 -2px`, 0.3s. Card anatomy: a 180px visual on top, a body with `border-top: 1px solid 4%-white`, `h3` 15px/600, `p` 13px/1.55.

Here: this is the home page's `.bento`: six columns rather than twelve, spans 4 / 2 / 3 / full, and the same 70ms cadence as a CSS `tile-in` keyed by `--i` (set once on mount, no observer, since the bento is above the fold). Below the fold the cadence is `Reveal`'s sibling delays (`Math.min(index, 3) * 0.05–0.06`), `ProjectCard`'s `min(index, 5) * 0.06`, and the CSS version (`useInViewOnce` + `--i`, as the calendar uses). A new tile in the bento takes the next `--i` from `page.tsx`'s counter and a span that keeps the rows full at 6, 2 and 1 columns. The project tile is the visual/body split already: a 16:10 cover, then the body.

### 4. Marquee rows — adapt

svelte-bits: two `.ln-feat-marquee-track` rows, items doubled, CSS `translateX` keyframes, the second row reversed; items are pill links; the whole page wrapper has 300px `::before/::after` side fades.

Here: recipe `Marquee` (mask-image edge fade instead of page-wide side fades). One row, 50s, pause on hover. Only if the stack section wants an "everything" strip above its grouped cards — grouped, static pills remain the default because they're content.

### 5. Card anatomy and hover — shipped, keep the numbers

svelte-bits: cards lift `−2px` and brighten their border over 0.3s; Magic Bento adds a cursor-tracked border highlight. Spotlight Card adds a radial wash.

Here: `.card--hover` lifts `−3px` onto `--shadow` with an accent-tinted border and nudges its `.tile-arrow`; `.btn` lifts `−2px`; `.contact-way` nudges right; project covers zoom 1.04× over 0.9s; `.bp-spot` (the cursor wash) is on project tiles and the feature stat and pillar tiles. Those are the site's numbers (the Lift Rule in `DESIGN.md`); don't change them per card. One hover signature per card type.

### 6. Dock / pill nav / tabs — avoid, with one exception

svelte-bits: Dock magnifies items by cursor distance; Pill Nav swaps labels with a circle wipe; Gooey/Bubble/Flowing menus are SVG-filter or marquee-driven; `VariantTabs` on the landing page slides an indicator.

Here: nothing on the site is a toolbar. The exception is a **tab or filter indicator** — the `/projects` type filters are chips today; a sliding indicator would reuse the nav's `layoutId` approach.

### 7. Stepper / expandable content — shipped

svelte-bits: wrapper `height: {measured}px; transition: height 0.4s cubic-bezier(0.5, 1, 0.5, 1)`; incoming step keyed and slid in from `±100%` over 0.4s; progress line `width 0 → 100%`.

Here: the case-study panel in `ProjectBody` (`AnimatePresence` height-auto, 0.5s `EASE`) and the experience "Show N more" fold are the models; the panel walkthrough swaps stops in place. For multi-step content, `mode="wait"` with a 24px slide, not 100%. A progress line is `scaleX` from the left on `--ease`.

### 8. Scroll stack / pinned cards — avoid

svelte-bits: Lenis smooth scroll + cards pinned at `20%` of the viewport scaling `0.85 + i·0.03` with 30px stack offset.

Here: no pinning, ever. `SmoothScroll` is the one scroll intervention (a plain wheel lerp, no transform, no pinning), and it must keep stepping aside for touch, keys, reduced motion, `data-lock` and inner scrollers. Depth comes from tiles and shadows, not from scroll-scrubbed stacks.

### 9. Section rhythm

svelte-bits: sections `padding: 80px 0 100px`, inner `max-width: 1324px; padding: 0 24px`, titles `clamp(28px, 4vw, 42px)` with `margin-bottom: 40px`, a gradient-shift keyframe on section titles (`gradientShift`, 0%→100%→0% background-position).

Here: `.sec` / `.sec-head` is almost exactly that rhythm already (`clamp(40px, 6vw, 72px)` above, a `clamp(28px, 3.2vw, 38px)` title). The only motion a section title gets is `Reveal` — no gradient shift, no eyebrow above it. If a new page needs a section, build it as `section.shell.sec > Reveal(.sec-head) > body`.

### 10. Loader → page reveal — avoid

svelte-bits: a fixed overlay with a pulsing logo (`opacity 0.2 ↔ 0.6`, 1.8s) fades out 0.6s, then header (0.7s) and hero (0.8s, +0.1s) fade in.

Here: the bento's `tile-in` cadence (and `.page-in` on project pages) is the page reveal. An overlay adds a beat before content for no structural reason.

### 11. Tile → dialog → page — shipped as a morph (from liumichelle.com)

Not a svelte-bits pattern; it came from the 2026-11-07 brief and became Clean Bench's signature on 2026-11-09. A project tile grows into a centred dialog through a shared `layoutId` (`tileLayoutId(id)`, `MORPH` spring `380 / 36 / 0.8`) while an ink/45% scrim fades in with a 6px blur; the bar and body fade in after 0.18s. The URL hash names it (`#project-<id>`), Escape and the back button collapse it home into its tile, and the dialog's bar links to the same body on its own page (`/projects/<id>`). Reduced motion drops the `layoutId` and fades. Any new "open in place" surface should reuse `ProjectDialog` (portal into `[data-bench-portal]` so tokens resolve, focus trap, `data-lock`, the shared morph), not invent a second modal.

## Responsive translation

| svelte-bits breakpoint | Does | Here |
|---|---|---|
| 1275px | hero 2 → 1 column | n/a (the hero is one tile in the bento) |
| 1024px | tighter hero padding, smaller headline | fold into 980px, or use `clamp()` and skip the query |
| 768px | Magic Bento disables pointer effects | capability-based gating (`(hover: hover) and (pointer: fine)`), not width; layout steps at 760px |
| 640px | smaller buttons/tags, 16px gutters | the bento goes to one column; `--pad: clamp(18px, 4vw, 40px)` already handles gutters |

## Procedure for a new animated section

1. **Place it in the shell:** `<section className="shell sec" id="…"><Reveal><div className="sec-head"><h2 className="sec-title">…</h2></div></Reveal>…</section>`, with the heading text from the Studio (`data/home/page.json` `headings`), never hard-coded. Keep the home page's order (the bento, then who, experience, projects, stack, education, contact) unless Riley asks.
2. **Choose the grid:** one full-width tile, a tile grid (2 or 3 columns at `--gap`), or a list. Text + media inside a project belongs in `ProjectBody`, not a new layout.
3. **Sequence the reveal:** header first (`Reveal`), then body blocks with `delay` steps of 0.05–0.06, capped at ~3 steps; lists get the CSS stagger.
4. **Add one hover signature** per tile type (lift, accent border, spotlight — not all three).
5. **Write the CSS** under the right banner in `bench.css`, with the `--ease` token and token colours only (fills on `--accent-fill`, washes on `--tint`), and a targeted reduced-motion rule only if the final state differs from the animated one.
6. **Check at 980px and 760px** in the preview (`resize_window` mobile preset), and with the theme toggled to dark — the fills deepen and the accent lightens, so any `color-mix` must be token-based.
7. **Run `vault-sync`** — `bench.css` and `components/` changes update `05 Styling and Design/Design System (Clean Bench).md` and the relevant `02 Components/*` note.

## Related procedures

- `motion-design` (`.claude/skills/motion-design/SKILL.md`) — thresholds and the catalog.
- `motion-fluidity` (`.claude/skills/motion-fluidity/SKILL.md`) — the element-level recipes referenced above.
- `design-guidelines` (`.claude/skills/design-guidelines/SKILL.md`) — reference tokens; the live system is the repo-root `DESIGN.md`.
- `vault-sync` (`.claude/skills/vault-sync/SKILL.md`) — required afterwards.
