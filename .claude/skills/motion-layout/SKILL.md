---
name: motion-layout
description: How svelte-bits (github.com/DavidHDev/svelte-bits) composes pages — floating nav that condenses on scroll, layered heroes with fade masks, 12-column bento/feature grids with staggered reveals, marquee rows, card anatomy, dock/pill/tab navigation, expandable steps — and how each maps onto this site's Blueprint Press shell (.bp-shell, .bp-section-grid, PageSpine, BpNav). Use this when adding or restructuring a section, hero, nav/header, card grid, list, gallery, tabs, stepper, marquee, sticky element, or any layout that needs to animate as a unit; when asked to make a page "flow" or "feel more designed"; and when deciding where new layout CSS belongs in blueprint.css.
---

# Motion Layout (composition that moves as one)

One of several repository agent procedures — see `.agents/README.md` for the set. Third of three motion skills: [`motion-design`](../motion-design/SKILL.md) picks *what*; [`motion-fluidity`](../motion-fluidity/SKILL.md) is the element-level *how*; this skill is the *structure* — how sections, navs, grids, and cards are built so that motion reads as a page settling into place rather than parts twitching.

svelte-bits' library components are the famous part, but its own landing site (`src/lib/components/landing/`) is where the *composition* lives: a floating nav that condenses when you scroll, a hero stacked in z-layers with a fade mask at the bottom, a 12-column feature grid whose cards arrive in a 70ms cadence, marquee rows, and cards with a fixed visual/body split. Those patterns transfer; the glass and the orange do not. Detailed CSS for every pattern is in [`references/svelte-bits-layouts.md`](references/svelte-bits-layouts.md).

## The Blueprint Press shell (what you're composing into)

| Piece | Where | Rhythm |
|---|---|---|
| `.bp` | `app/(site)/layout.tsx` → `blueprint.css` | Everything is scoped here. Owns the tokens (`--paper`, `--ink`, `--rule`, `--accent`, `--ease`, `--shell: 1240px`, `--pad: clamp(20px, 5vw, 64px)`) and the fixed blueprint grid texture (16px minor / 96px major lines). |
| `.bp-shell` | `blueprint.css` | `max-width: var(--shell); margin: 0 auto; padding-inline: var(--pad)`. Every section's content sits in one. |
| `.bp-nav` | `components/blueprint/BpNav.tsx` | Sticky, `top: 0`, hairline bottom border, 82% paper + `blur(12px)`. Inner is `padding: 16px var(--pad)`. Links underline with a `scaleX` accent line. |
| `.bp-hero` | `app/(site)/page.tsx` | Eyebrow → two-line `h1` → rule → tagline/location → actions, each in its own `Reveal` with delays 0.05 → 0.54s. `HeroRibbon` draws behind. Single column. |
| `.bp-section` + `.bp-section-grid` | `page.tsx`, `blueprint.css` | Each section opens with `<Reveal as="rule"><div class="bp-rule bp-rule--hair"/></Reveal>` then a two-column grid: `.bp-section-index` ("01  Summary") on the left, content on the right. Collapses to one column at 860px. |
| `PageSpine` | `components/blueprint/PageSpine.tsx` | Wraps the home page's four sections; a hairline track down the left edge fills with `--accent` as you scroll (spring `220/34/0.4`). Projects have their own `ProjectListSpine`. |
| `.pj-entry` | `components/projects/ProjectEntry.tsx`, `projects/projects.css` | Full-height entries, text column beside a media column, alternating with `pj-entry--reverse`. No pinning, no clipped-height scrollers. |
| `.bp-footer` | `page.tsx` | Mark (animated, floating) + note + URL. |
| `BackToTop`, `BpFixedRelocationBadge` | `components/blueprint/` | The two fixed-corner elements (bottom-left / bottom-right). New fixed elements need a corner that isn't taken. |
| Breakpoint | `blueprint.css` | One: `860px`. svelte-bits uses 1275 / 1024 / 640; when translating, fold them into 860 unless a pattern genuinely needs a second step. |

CSS goes in `blueprint.css` under the matching banner comment (`/* --- nav --- */`, `/* --- pills --- */`…), or in `projects/projects.css` for `.pj-`. Home-page-only layout uses `.hp-` (see `PageSpine`'s `.hp-list` / `.hp-spine`). New banners follow the existing dash-ruled style.

## Composition patterns from svelte-bits, translated

Each pattern: what svelte-bits does (with its numbers), then what it becomes here. Amplitudes follow `motion-design`'s thresholds.

### 1. Nav that condenses on scroll — adopt

svelte-bits: fixed `top: 20px`, an inner bar `max-width: 1680px`, `height: 56px`, transparent; at `scrollY > 50` the inner tightens to `max-width: 1276px`, gets a solid `#14110e` background and a 4%-white border; all four properties transition `0.5s ease`. A single absolutely positioned highlight pill slides to the hovered link (`transform`/`width`/`height` 0.3s) and returns to the active one on leave.

Here: `BpNav` is already sticky with a hairline; give it `is-scrolled` at `scrollY > 40` → `.bp-nav-inner` padding `16 → 10px`, paper opacity `82% → 92%`, brand name to 70% opacity, `0.4s var(--ease)`. Replace the per-link `::after` with one shared sliding accent line via `layoutId` (recipe `SlidingHighlight`). Keep it sticky — a floating detached pill is the wrong register for a résumé.

### 2. Hero as stacked layers — adapt (the fade mask only)

svelte-bits: `min-height: 100vh`, `overflow: hidden`; z-layers `0` background canvas → `1` band (`mix-blend-mode: screen`) → `2` an SVG `linearGradient` rect fading to the page color over the bottom half → `3` content grid `1fr 1fr` at `max-width: 1324px`, padding `clamp(120px, 16vw, 240px) 24px 80px`; headline `clamp(28px, 5.5vw, 68px)`, `line-height 1.1`, `letter-spacing -0.02em`; description `max-width: 42ch`; collapses to one column at 1275px.

Here: the hero already sequences via `Reveal` and keeps one column. The one borrowable layer is the bottom fade: a `::after` on `.bp-hero` with `background: linear-gradient(to bottom, transparent, var(--paper))` over the last ~120px, so the first section rule lands on clean paper. Test it against the fixed grid (`background-attachment: fixed`) — the fade must be of the *paper*, not a solid block that hides the grid abruptly. Keep `clamp()` type sizing; the site already does.

### 3. Feature / bento grid with cadence — adopt (the cadence), adapt (the grid)

svelte-bits: `grid-template-columns: repeat(12, 1fr)`, `gap: 16px`, cards `span 7 / 5 / 4 / 3`; each card starts `opacity: 0; translateY(24px)` and gets `.is-visible` from an IntersectionObserver (once, unobserve after) with `transition-delay: i * 70ms`; hover `border-color` brighten + `translate: 0 -2px`, 0.3s. Card anatomy: a 180px visual on top, a body with `border-top: 1px solid 4%-white`, `h3` 15px/600, `p` 13px/1.55.

Here: the cadence is exactly `Reveal`'s sibling delays (`Math.min(index, 3) * 0.06`) and the CSS version in recipe `useInViewOnce`. For grids of small items (`.bp-certs`, `.bp-pills`) prefer the CSS stagger; for a few large blocks keep `Reveal`. The 12-column asymmetric grid is worth using for a future "at a glance" or stats section — hairline cards (`border: 1px solid var(--rule)`, `background: var(--white)`), `gap: 14px` (matches `.bp-section-grid`), spans of 7/5 or 8/4, never glass. Keep the visual/body split with a `--rule` hairline between.

### 4. Marquee rows — adapt

svelte-bits: two `.ln-feat-marquee-track` rows, items doubled, CSS `translateX` keyframes, the second row reversed; items are pill links; the whole page wrapper has 300px `::before/::after` side fades.

Here: recipe `Marquee` (mask-image edge fade instead of page-wide side fades, which would hide the grid). One row, 50s, pause on hover. Only if the toolchain wants an "everything" strip above its grouped pills — grouped, static pills remain the default because they're content.

### 5. Card anatomy and hover — already shipped, align the numbers

svelte-bits: cards lift `−2px` and brighten their border over 0.3s; Magic Bento adds a cursor-tracked border highlight. Spotlight Card adds a radial wash.

Here: `.bp-cert` lifts `−5px` (0.44s), `.bp-role` shifts `+7px` right (0.42s), `.bp-bullets li` lifts `−2px`. Those are the site's numbers; don't "align" them down to svelte-bits'. Add `Spotlight` (recipe) to `.bp-cert` and project media frames if `motion-design`'s audit picks them. Card structure for anything new: hairline border, paper fill, one accent bar (`.bp-cert-bar`'s `scaleX` grow) as the hover signature.

### 6. Dock / pill nav / tabs — avoid, with one exception

svelte-bits: Dock magnifies items by cursor distance; Pill Nav swaps labels with a circle wipe; Gooey/Bubble/Flowing menus are SVG-filter or marquee-driven; `VariantTabs` on the landing page slides an indicator.

Here: nothing on the site is a toolbar. The exception is a **tab indicator** (the sliding line from pattern 1) for any future tabbed content — `layoutId` again, `stiffness 300 / damping 25`.

### 7. Stepper / expandable content — adopt the measured-height pattern

svelte-bits: wrapper `height: {measured}px; transition: height 0.4s cubic-bezier(0.5, 1, 0.5, 1)`; incoming step keyed and slid in from `±100%` over 0.4s; progress line `width 0 → 100%`.

Here: recipe `Expandable` (the case-study panel pattern, `AnimatePresence` height-auto, 0.55s `EASE`). For multi-step content, `mode="wait"` with a 24px slide, not 100%. A progress line is `scaleX` from the left on `--ease`.

### 8. Scroll stack / pinned cards — avoid

svelte-bits: Lenis smooth scroll + cards pinned at `20%` of the viewport scaling `0.85 + i·0.03` with 30px stack offset.

Here: `ProjectEntry` explicitly replaced a pinned panel ("no pinning… nothing ever needs its own scrollbar"). Don't reintroduce it. Depth on the projects page comes from the media parallax (±56px) and the spine fill.

### 9. Section rhythm

svelte-bits: sections `padding: 80px 0 100px`, inner `max-width: 1324px; padding: 0 24px`, titles `clamp(28px, 4vw, 42px)` with `margin-bottom: 40px`, a gradient-shift keyframe on section titles (`gradientShift`, 0%→100%→0% background-position).

Here: `.bp-section` rhythm is set by the hairline rule + index column; keep it. The only motion a section *title* gets is `Reveal` or `WordReveal` — no gradient shift. If a new page needs a section type that doesn't fit index + content, build it as `.bp-section > .bp-shell > (rule, header row, body)` and give the header row a `Reveal`.

### 10. Loader → page reveal — avoid

svelte-bits: a fixed overlay with a pulsing logo (`opacity 0.2 ↔ 0.6`, 1.8s) fades out 0.6s, then header (0.7s) and hero (0.8s, +0.1s) fade in.

Here: the hero's `Reveal` chain is the page reveal. An overlay adds a beat before content for no structural reason and fights the fixed grid texture, which should be visible from the first frame.

## Responsive translation

| svelte-bits breakpoint | Does | Here |
|---|---|---|
| 1275px | hero 2 → 1 column | n/a (already 1 column) |
| 1024px | tighter hero padding, smaller headline | fold into 860px, or use `clamp()` and skip the query |
| 768px | Magic Bento disables pointer effects | capability-based gating (`(hover: hover) and (pointer: fine)`), not width |
| 640px | smaller buttons/tags, 16px gutters | `--pad: clamp(20px, 5vw, 64px)` already handles gutters; nothing to add |

## Procedure for a new animated section

1. **Place it in the shell:** `<section className="bp-section"><div className="bp-shell">…</div></section>`, opening with the hairline `Reveal as="rule"`. If it's on the home page and should be part of the spine, put it inside `<PageSpine>`.
2. **Choose the grid:** index + content (`.bp-section-grid`) for editorial sections; 12-col hairline cards for "at a glance" blocks; the project entry grid for text + media.
3. **Sequence the reveal:** header first (`Reveal`, or `WordReveal` for a short heading), then body blocks with `delay` steps of 0.06, capped at ~3 steps; lists get the CSS stagger.
4. **Add one hover signature** per card type (lift, accent bar, spotlight — not all three).
5. **Write the CSS** under the right banner in `blueprint.css`, with the `--ease` token, and a targeted reduced-motion rule only if the final state differs from the animated one.
6. **Check at 860px and below** in the preview (`resize_window` mobile preset), and with the theme toggled to dark — `--paper`/`--ink` swap, so any `color-mix` should be token-based.
7. **Run `vault-sync`** — `blueprint.css` and `components/` changes update `05 Styling and Design/Design System (Blueprint Press).md` and the relevant `02 Components/*` note.

## Related procedures

- `motion-design` (`.agents/motion-design/SKILL.md`) — thresholds and the catalog.
- `motion-fluidity` (`.agents/motion-fluidity/SKILL.md`) — the element-level recipes referenced above.
- `design-guidelines` (`.agents/design-guidelines/SKILL.md`) — tokens for any new surface.
- `vault-sync` (`.agents/vault-sync/SKILL.md`) — required afterwards.
