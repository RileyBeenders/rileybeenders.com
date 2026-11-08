---
name: motion-layout
description: How svelte-bits (github.com/DavidHDev/svelte-bits) composes pages — floating nav that condenses on scroll, layered heroes with fade masks, 12-column bento/feature grids with staggered reveals, marquee rows, card anatomy, dock/pill/tab navigation, expandable steps — and how each maps onto this site's Blue Sheet shell (.shell, .sec / .sec-head, the .hero-card, the .nav / .nav-pill in SiteNav, the card grids). Use this when adding or restructuring a section, hero, nav/header, card grid, list, gallery, tabs, stepper, marquee, sticky element, dialog, or any layout that needs to animate as a unit; when asked to make a page "flow" or "feel more designed"; and when deciding where new layout CSS belongs in sheet.css.
---

# Motion Layout (composition that moves as one)

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set. Third of three motion skills: [`motion-design`](../motion-design/SKILL.md) picks *what*; [`motion-fluidity`](../motion-fluidity/SKILL.md) is the element-level *how*; this skill is the *structure* — how sections, navs, grids, and cards are built so that motion reads as a page settling into place rather than parts twitching.

svelte-bits' library components are the famous part, but its own landing site (`src/lib/components/landing/`) is where the *composition* lives: a floating nav that condenses when you scroll, a hero stacked in z-layers with a fade mask at the bottom, a 12-column feature grid whose cards arrive in a 70ms cadence, marquee rows, and cards with a fixed visual/body split. Those patterns transfer; the glass and the orange do not. Detailed CSS for every pattern is in [`references/svelte-bits-layouts.md`](references/svelte-bits-layouts.md) (its "Here" notes were written for the earlier Blueprint Press shell; the table below is the current one).

## The Blue Sheet shell (what you're composing into)

The site was redesigned as **Blue Sheet** on 2026-11-08. Blueprint Press's `.bp-shell` / `.bp-section-grid` / `PageSpine` / `BpNav` / `ProjectEntry` structure is gone; it is recorded in the vault's `09 Design History/` notes and in git at `d1360bb`.

| Piece | Where | Rhythm |
|---|---|---|
| `.bp` | `app/(site)/layout.tsx` → `app/(site)/sheet.css` | Everything is scoped here. Owns the tokens (`--paper`, `--white`, `--ink`, `--rule`, `--accent`, `--accent-fill`, `--tint`, `--glow`, `--ease`, `--shell: 1120px`, `--pad: clamp(18px, 4vw, 40px)`, radii `--r-sm/--r/--r-lg/--r-xl` 10/16/24/30px, `--shadow-sm/--shadow/--shadow-lg`). `.bp::before` is a 28px blueprint grid masked to fade out below the top of the page; `.bp::after` is the `--glow` wash behind the hero. |
| `.sheet-frame` | the site layout | Wraps every page's content. At ≥ 1000px it is a dashed accent-tinted cut line (30px radius) with `+` registration marks; on a phone the window is the sheet. |
| `.shell` | `sheet.css` (layout) | `max-width: var(--shell); margin: 0 auto; padding-inline: var(--pad)`. Every section is a `section.shell.sec`. (`.bp-shell` is kept as an alias for older markup.) |
| `.sec` / `.sec--tight` / `.sec-head` | `sheet.css` (layout), every page | A section is `clamp(40px, 6vw, 72px)` of top space (`--tight`: 28–44px), then a `.sec-head` row — `h2.sec-title` (serif, `clamp(30px, 3.6vw, 42px)`, a 36×3px `--accent-fill` rule under it) on the left and an optional `.sec-sub` / `.sec-aside` on the right — inside a `Reveal`, then one card, a grid of cards, or a list. No index column, no section numbers. |
| `.nav` / `.nav-pill` | `components/sheet/SiteNav.tsx`, `sheet.css` (nav) | A sticky, centred, floating pill (72% white, `blur(16px)`, `--shadow-sm`) with the brand, three links and the theme toggle. Condenses at `scrollY > 28` (`data-condensed`: tighter top padding, 86% white, `--shadow`). The active link's `--tint` pill slides between links with a shared `layoutId`. |
| `.hero-card` | `app/(site)/page.tsx`, `components/sheet/HeroCover.tsx`, `sheet.css` (hero) | A full-shell-width white card (30px radius, `--shadow`) that rises out of a 6px blur once: the drawn `.hero-cover` band (150–250px), the avatar overlapping it, then name, role, meta line, actions. `[data-cursor-zone]` scopes `CursorMark`. |
| Card grids | `sheet.css` | `.project-grid` 3 columns / 18px gap; `.stack-grid` 2 / 16px; `.edu-grid` 1.1fr : 2fr with `.certs` 2 / 12px; `.summary-grid` `1fr 300px`; the experience `.role` `150px 1fr` timeline rail. Cards are `.card` (white, `--r-lg`, `--line` border, `--shadow-sm`), `.card--hover` lifts 4px onto `--shadow`. |
| `.dlg` | `components/sheet/ProjectDialog.tsx`, `sheet.css` (dialog) | The project dialog, `min(1040px, 100%)`, portalled into `[data-sheet-portal]` inside `.bp`. Its body scrolls on its own (`data-native-scroll`), the page is locked with `html[data-lock]`. On a phone it rises from the bottom as a sheet. |
| `.footer` / `.footer-block` | `components/sheet/SiteFooter.tsx` | The animated, floating mark + note, and the Sheet · Rev. · Drawn in title block, on every page. |
| Fixed corners | `components/blueprint/BackToTop.tsx` (bottom-left), `StudioLink.tsx` (bottom-right, dev only) | New fixed elements need a corner that isn't taken. The relocation badge that used to dock bottom-right is gone (the hero carries a chip instead). |
| Breakpoints | `sheet.css` (responsive) | **1000px** (the sheet frame appears), **980px** (grids drop a column), **760px** (everything one column; the nav drops its name; the dialog becomes a bottom sheet). `projects/feature.css` and `walkthrough.css` keep their own 860px. svelte-bits uses 1275 / 1024 / 640; fold those into 980 / 760 unless a pattern genuinely needs another step. |

CSS goes in `sheet.css` under the matching banner comment (`/* ---- nav --- */`, `/* ---- hero --- */`, `/* ---- projects --- */`, `/* ---- dialog --- */` … dash-ruled to a fixed width), or in `projects/projects.css` for `.pj-` media pieces. Classes are named for their section (`.hero-*`, `.activity-*`, `.role-*`, `.project-*`, `.pbody-*`, `.stack-*`, `.contact-*`); `.bp-` stays for the kept primitives (`.bp-link`, `.bp-pill`, `.bp-top`, `.bp-spot`). New banners follow the existing dash-ruled style.

## Composition patterns from svelte-bits, translated

Each pattern: what svelte-bits does (with its numbers), then what it becomes here. Amplitudes follow `motion-design`'s thresholds.

### 1. Nav that condenses on scroll — shipped

svelte-bits: fixed `top: 20px`, an inner bar `max-width: 1680px`, `height: 56px`, transparent; at `scrollY > 50` the inner tightens to `max-width: 1276px`, gets a solid `#14110e` background and a 4%-white border; all four properties transition `0.5s ease`. A single absolutely positioned highlight pill slides to the hovered link (`transform`/`width`/`height` 0.3s) and returns to the active one on leave.

Here: this is `SiteNav` — a floating pill that condenses at `scrollY > 28` (0.4s on `--ease`) and an active-link tint that slides on a `layoutId` spring (`420 / 38 / 0.6`). Extend it rather than adding a second nav; the one open idea is letting the tint follow *hover* and return to the active link on leave, as svelte-bits does.

### 2. Hero as stacked layers — shipped as a card

svelte-bits: `min-height: 100vh`, `overflow: hidden`; z-layers `0` background canvas → `1` band (`mix-blend-mode: screen`) → `2` an SVG `linearGradient` rect fading to the page color over the bottom half → `3` content grid `1fr 1fr` at `max-width: 1324px`, padding `clamp(120px, 16vw, 240px) 24px 80px`; headline `clamp(28px, 5.5vw, 68px)`, `line-height 1.1`, `letter-spacing -0.02em`; description `max-width: 42ch`; collapses to one column at 1275px.

Here: the hero is a card, not a full-bleed stage. Its layers are the `--accent-fill` cover band with `HeroCover`'s drawn construction lines (grid patterns + a radial fade + strokes drawing on in sequence), then the white body. The page-level layering is `.bp::before` (the grid, masked to fade) and `.bp::after` (the `--glow` wash). Keep the hero short enough that the GitHub calendar shows above the fold on a laptop; don't grow it to `100vh`.

### 3. Feature / bento grid with cadence — adopt (the cadence), adapt (the grid)

svelte-bits: `grid-template-columns: repeat(12, 1fr)`, `gap: 16px`, cards `span 7 / 5 / 4 / 3`; each card starts `opacity: 0; translateY(24px)` and gets `.is-visible` from an IntersectionObserver (once, unobserve after) with `transition-delay: i * 70ms`; hover `border-color` brighten + `translate: 0 -2px`, 0.3s. Card anatomy: a 180px visual on top, a body with `border-top: 1px solid 4%-white`, `h3` 15px/600, `p` 13px/1.55.

Here: the cadence is `Reveal`'s sibling delays (`Math.min(index, 3) * 0.05–0.06`), `ProjectCard`'s `min(index, 5) * 0.06`, and the CSS version (`useInViewOnce` + `--i`, as the calendar uses). For grids of small items (`.certs`, `.bp-pills`) prefer the CSS stagger; for a few large blocks keep `Reveal`. An asymmetric 12-column grid is still unused — if a future "at a glance" section wants one, build it from `.card`s (white, `--r-lg`, `--shadow-sm`) at a 16–18px gap, spans 7/5 or 8/4. The project card is the visual/body split already: a 16:10 cover, then the body.

### 4. Marquee rows — adapt

svelte-bits: two `.ln-feat-marquee-track` rows, items doubled, CSS `translateX` keyframes, the second row reversed; items are pill links; the whole page wrapper has 300px `::before/::after` side fades.

Here: recipe `Marquee` (mask-image edge fade instead of page-wide side fades). One row, 50s, pause on hover. Only if the stack section wants an "everything" strip above its grouped cards — grouped, static pills remain the default because they're content.

### 5. Card anatomy and hover — shipped, keep the numbers

svelte-bits: cards lift `−2px` and brighten their border over 0.3s; Magic Bento adds a cursor-tracked border highlight. Spotlight Card adds a radial wash.

Here: `.card--hover` lifts `−4px` onto `--shadow` with an accent-tinted border; `.btn` lifts `−2px`; `.contact-way` nudges right; project covers zoom 1.04× over 0.9s; `.bp-spot` (the cursor wash) is on project cards and the stat tiles. Those are the site's numbers (the Lift Rule in `DESIGN.md`); don't change them per card. One hover signature per card type.

### 6. Dock / pill nav / tabs — avoid, with one exception

svelte-bits: Dock magnifies items by cursor distance; Pill Nav swaps labels with a circle wipe; Gooey/Bubble/Flowing menus are SVG-filter or marquee-driven; `VariantTabs` on the landing page slides an indicator.

Here: nothing on the site is a toolbar. The exception is a **tab or filter indicator** — the `/projects` type filters are chips today; a sliding indicator would reuse the nav's `layoutId` approach.

### 7. Stepper / expandable content — shipped

svelte-bits: wrapper `height: {measured}px; transition: height 0.4s cubic-bezier(0.5, 1, 0.5, 1)`; incoming step keyed and slid in from `±100%` over 0.4s; progress line `width 0 → 100%`.

Here: the case-study panel in `ProjectBody` (`AnimatePresence` height-auto, 0.5s `EASE`) and the experience "Show N more" fold are the models; the panel walkthrough swaps stops in place. For multi-step content, `mode="wait"` with a 24px slide, not 100%. A progress line is `scaleX` from the left on `--ease`.

### 8. Scroll stack / pinned cards — avoid

svelte-bits: Lenis smooth scroll + cards pinned at `20%` of the viewport scaling `0.85 + i·0.03` with 30px stack offset.

Here: no pinning, ever. `SmoothScroll` is the one scroll intervention (a plain wheel lerp, no transform, no pinning), and it must keep stepping aside for touch, keys, reduced motion, `data-lock` and inner scrollers. Depth comes from cards and shadows, not from scroll-scrubbed stacks.

### 9. Section rhythm

svelte-bits: sections `padding: 80px 0 100px`, inner `max-width: 1324px; padding: 0 24px`, titles `clamp(28px, 4vw, 42px)` with `margin-bottom: 40px`, a gradient-shift keyframe on section titles (`gradientShift`, 0%→100%→0% background-position).

Here: `.sec` / `.sec-head` is almost exactly that rhythm already (`clamp(40px, 6vw, 72px)` above, a `clamp(30px, 3.6vw, 42px)` title, its short accent rule). The only motion a section title gets is `Reveal` — no gradient shift, no eyebrow above it. If a new page needs a section, build it as `section.shell.sec > Reveal(.sec-head) > body`.

### 10. Loader → page reveal — avoid

svelte-bits: a fixed overlay with a pulsing logo (`opacity 0.2 ↔ 0.6`, 1.8s) fades out 0.6s, then header (0.7s) and hero (0.8s, +0.1s) fade in.

Here: the hero card's `hero-in` and its cover's stroke-draw are the page reveal. An overlay adds a beat before content for no structural reason.

### 11. Card → dialog → page — shipped (from liumichelle.com)

Not a svelte-bits pattern; it came from the 2026-11-07 brief. A tile opens a centred dialog over a blurred scrim (scale 0.97 → 1, y 24 → 0, 0.45s), the URL hash names it (`#project-<id>`), Escape and the back button close it, and the dialog's bar links to the same body on its own page (`/projects/<id>`). Any new "open in place" surface should reuse `ProjectDialog` (portal into `[data-sheet-portal]` so tokens resolve, focus trap, `data-lock`), not invent a second modal.

## Responsive translation

| svelte-bits breakpoint | Does | Here |
|---|---|---|
| 1275px | hero 2 → 1 column | n/a (the hero is one card) |
| 1024px | tighter hero padding, smaller headline | fold into 980px, or use `clamp()` and skip the query |
| 768px | Magic Bento disables pointer effects | capability-based gating (`(hover: hover) and (pointer: fine)`), not width; layout steps at 760px |
| 640px | smaller buttons/tags, 16px gutters | `--pad: clamp(18px, 4vw, 40px)` already handles gutters; nothing to add |

## Procedure for a new animated section

1. **Place it in the shell:** `<section className="shell sec" id="…"><Reveal><div className="sec-head"><h2 className="sec-title">…</h2></div></Reveal>…</section>`, with the heading text from the Studio (`data/home/page.json` `headings`), never hard-coded. Keep the home page's section order (hero, activity, who, experience, projects, stack, education, contact) unless Riley asks.
2. **Choose the grid:** one full-width card, a card grid (2 or 3 columns, 12–18px gaps), or a list. Text + media inside a project belongs in `ProjectBody`, not a new layout.
3. **Sequence the reveal:** header first (`Reveal`), then body blocks with `delay` steps of 0.05–0.06, capped at ~3 steps; lists get the CSS stagger.
4. **Add one hover signature** per card type (lift, accent border, spotlight — not all three).
5. **Write the CSS** under the right banner in `sheet.css`, with the `--ease` token and token colours only (fills on `--accent-fill`, washes on `--tint`), and a targeted reduced-motion rule only if the final state differs from the animated one.
6. **Check at 980px and 760px** in the preview (`resize_window` mobile preset), and with the theme toggled to dark — the fills deepen and the accent lightens, so any `color-mix` must be token-based.
7. **Run `vault-sync`** — `sheet.css` and `components/` changes update `05 Styling and Design/Design System (Blue Sheet).md` and the relevant `02 Components/*` note.

## Related procedures

- `motion-design` (`.claude/skills/motion-design/SKILL.md`) — thresholds and the catalog.
- `motion-fluidity` (`.claude/skills/motion-fluidity/SKILL.md`) — the element-level recipes referenced above.
- `design-guidelines` (`.claude/skills/design-guidelines/SKILL.md`) — reference tokens; the live system is the repo-root `DESIGN.md`.
- `vault-sync` (`.claude/skills/vault-sync/SKILL.md`) — required afterwards.
