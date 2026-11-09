---
name: motion-design
description: Decide what to animate on this site and how far to take it, using svelte-bits (github.com/DavidHDev/svelte-bits) as the reference for fluid, polished motion, translated into this site's restrained "Clean Bench" style (the 2026-11-09 redesign: everything is a tile). Use this before adding, choosing, reviewing, or auditing any animation, transition, hover or cursor effect, scroll effect, text effect, or micro-interaction, and whenever the user mentions svelte-bits, react-bits, "subtle animations", "make it feel smoother / more alive / more polished", "add some motion", or asks which effect would fit a spot. Routes implementation to motion-fluidity and structural patterns to motion-layout.
---

# Motion Design (what to animate, and how far)

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set. This is the first of three motion skills:

| Skill | Question it answers |
|---|---|
| **`motion-design`** (this one) | *What* should move, *where*, and *how much*? Taste rules, thresholds, and a rated catalog of every svelte-bits component. |
| [`motion-fluidity`](../motion-fluidity/SKILL.md) | *How* do I build it in this codebase? svelte-bits' motion grammar translated to framer-motion + CSS, with copy-ready recipes. |
| [`motion-layout`](../motion-layout/SKILL.md) | *How* does svelte-bits compose navs, heroes, grids, and cards, and how does that map onto the Clean Bench shell? |

Start here when the task is open-ended ("add some subtle animations", "what would fit the hero?"). Skip straight to `motion-fluidity` when the user has already named the exact effect and spot.

## The reference: svelte-bits, and why it needs translating

svelte-bits is an MIT-licensed library of ~130 animated Svelte 5 components in four groups (Text Animations, Animations, Components, Backgrounds). Its motion is genuinely excellent — everything is spring-damped or eased on a short list of curves, entrances are scroll-gated and play once, pointer effects use distance falloff instead of on/off, and continuous effects pause on hover. That *grammar* is what to borrow.

Its *aesthetic* is the opposite of this site: near-black canvas (`#14110E`), Svelte-orange glow (`#FF8A4C`), frosted-glass cards (`backdrop-filter: blur(32px) saturate(1.3)`), and roughly half the catalog is WebGL (`three`, `ogl`) or physics (`matter-js`). This site is the Clean Bench design (since 2026-11-09; before that, Blue Sheet for one day and Blueprint Press): rounded white tiles on a pale grey-blue ground, ink, one cobalt from a pale wash to a deep fill, quiet shadows, Instrument Sans with Azeret Mono for small labels, and a soft blue bloom drifting behind the top of the page. The nav pill, dialog bar, cover tags and floating controls already use frosted white glass, so translucency is allowed where something floats, but never as glowing or coloured glass. A borrowed effect only works here once its glow becomes a hairline or a `--tint` wash, its glass becomes translucent white, and its amplitude drops by roughly half.

Source layout, for reading an original: `https://github.com/DavidHDev/svelte-bits/blob/main/src/lib/components/library/<Category>/<Name>/<Name>.svelte` where `<Category>` is `TextAnimations`, `Animations`, `Components`, or `Backgrounds` and `<Name>` is PascalCase (e.g. `TextAnimations/BlurText/BlurText.svelte`). Each file opens with a JSON comment listing its dependencies. Never install its runtimes here (`gsap`, `lenis`, `three`, `ogl`, `matter-js`, `motion`) — the site has `framer-motion`, and every subtle effect in the catalog is expressible with it plus CSS.

## What already moves on this site

Read these before proposing anything, so you extend the existing hand rather than adding a second one:

| Piece | File | What it does |
|---|---|---|
| `--ease` | `app/(site)/bench.css` (`.bp` block; `--ease-out` beside it) | The single easing curve, `cubic-bezier(0.22, 0.9, 0.28, 1)`. Every CSS transition uses it. |
| `EASE` | `components/bench/ProjectBody.tsx`, `ProjectCard.tsx`, `ProjectDialog.tsx`, `components/projects/ProjectGallery.tsx` | Same curve as a tuple for framer-motion, which can't read CSS vars. |
| `Reveal` | `components/blueprint/Reveal.tsx` | The scroll entrance for sections below the bento: `rise` (opacity 0→1, y 22→0, 0.82s), `rule` (scaleX 0→1 from the left, 0.9s), `fade`, `slide`. `once: true`, `amount: 0.12`, margin −60px. Siblings sequence with `delay` (`Math.min(index, 3) * 0.05–0.06`). Reduced motion renders a plain `div`. It never fires on an element taller than the viewport, which is why project pages use `.page-in` instead. |
| Nav | `components/bench/SiteNav.tsx`, `bench.css` (nav) | The floating glass pill (66% white, `blur(18px) saturate(1.4)`) condenses at `scrollY > 28` (padding, shadow, opacity, 0.4s); the active link's `--tint` pill slides between links with a shared `layoutId` on a spring (`stiffness 420, damping 38, mass 0.6`). |
| Bloom | `bench.css` (`.bp::before`, `bloom-drift`) | Three radial washes (`--accent-soft`, `--glow`, `--tint`) behind the top of the page drift 2% and scale to 1.04 over 22s, alternating. Held still under reduced motion. |
| Bento tiles, page entrance | `app/(site)/page.tsx`, `bench.css` (bench: `tile-in`, `.page-in`) | Each bento tile rises 16px and fades in once (0.8s), staggered 70ms by its `--i`; `.page-in` is the same entrance (0.7s) for a whole project page, with no observer. |
| Cursor mark | `components/bench/CursorMark.tsx` | A monogram chip trailing the pointer across the bento (`[data-cursor-zone]`) on a spring (`stiffness 260, damping 26, mass 0.5`), leaning ±14° with travel. Pointer devices only; off under reduced motion; Studio switch `motion.cursorMark`. |
| Smooth scroll | `components/bench/SmoothScroll.tsx` | Inertial wheel scrolling (lerp 0.11 per frame, max 1.4 viewports per event). Steps aside for touch/pen, pinch, reduced motion, keys, `data-lock`, and any inner scroller or `data-native-scroll`. Studio switch `motion.smoothScroll`. |
| GitHub calendar | `components/bench/GithubGraph.tsx`, `bench.css` (activity) | Cells pop in column by column once in view (`activity-in`, 0.5s, 11ms per week via `useInViewOnce`). |
| Project tiles, morph, body | `components/bench/ProjectCard.tsx`, `ProjectDialog.tsx`, `ProjectBody.tsx` | Tiles enter on view (0.6s, stagger `min(i,5) × 0.06`), lift 3px and zoom their cover 1.04× on hover. The signature morph: the tile's `motion.article` and the dialog panel share `tileLayoutId(id)`, so the tile grows into the dialog on the `MORPH` spring (`stiffness 380, damping 36, mass 0.8`) over a fading scrim, and the bar and body fade in after 0.18s; reduced motion gets a plain fade; the case study opens `height: 0 → auto` through `AnimatePresence` (0.5s). |
| Experience | `components/bench/Experience.tsx`, `bench.css` (experience) | The role dot fills and scales 1.2× on hover; a bullet nudges 3px and its emphasis phrases take the accent. |
| Gallery | `components/projects/ProjectGallery.tsx` | Each photo uncovers bottom-to-top with a `clip-path: inset()` wipe, staggered 0.1s. |
| Mark | `components/blueprint/BpMark.tsx`, `bench.css` (marks: `bp-draw`, `bp-chase`, `bp-float`) | The monogram's slow draw/chase loop (nav, hero avatar, card covers, footer) and the footer's 5px float. |
| Read more, linked skills | `app/(site)/bullet-link.css` (restyled as a tinted mono chip by `.bp .bp-bullet-link` in `bench.css`), `skill-pills.css`, `components/blueprint/AnimationSync.tsx` | The bullet link's `data-motion` variants and the linked pills' border loops; `AnimationSync` puts the loops on one beat. |
| Hover rules | `bench.css` (`.btn`, `.bp-link`, `.card--hover`, `.tile-arrow`, `.filter`, `.contact-way`, `.nav-link`), `projects/projects.css` | Lifts of 1px (filters), 2px (buttons, pills) and 3px (tiles), the tile arrow nudges 2px up and right, underline grows via `scaleX`, arrows nudge 3–4px, all 0.28–0.52s on `--ease`. |
| Back to top | `components/blueprint/BackToTop.tsx` | Scroll-gated reveal. |
| Reduced motion | Bottom of `bench.css` (and `projects/projects.css`, `feature.css`) | A blanket rule collapses every animation and transition under `.bp` to ~0ms (the bloom holds still), draws the monogram strokes complete, and shows the calendar. Components additionally branch on `useReducedMotion()`. |

Retired with Blueprint Press on 2026-11-08 (don't look for them): `PageSpine`, `ProjectListSpine`, `ProjectEntry`'s ±56px media parallax, `HeroRibbon`, `BpRelocationBadge` (hop + typewriter), the gradient About tab in `BpNav`, `WordReveal`. Retired with Blue Sheet on 2026-11-09: `HeroCover` (the drawn construction-line band), the hero card's blur-in (`hero-in`), the title caret, the blueprint grid and the dashed sheet frame, and the dialog's scale-in from 0.97 (replaced by the morph).

The site's motion is already one coherent hand. New work should be indistinguishable in feel from the tile entrance, the tile hover, the morph and the nav's sliding tint: same curve, same range of durations, same tile-and-ink materials.

## Taste rules

These are the reasons behind the thresholds below; when a case isn't covered, reason from these.

1. **Motion explains structure; it never decorates.** svelte-bits' best components (Animated Content, Scroll Reveal, Magnet, Dock) each make a relationship visible — this appears because you reached it, this reacts because you're near it. Before adding an effect, say in one sentence what relationship it reveals. If the sentence is "it looks cool", drop it.
2. **One hand.** Every duration, curve, and distance should feel like it came from the same author as `Reveal`. Use `--ease` / `EASE` for eased motion and the existing spring constants for scroll-linked motion. Don't introduce `back`, `elastic`, or bounce curves — svelte-bits uses them for playful demos; this is a résumé.
3. **Amplitude is halved on the bench.** A 24px rise on a dark glassy card reads as subtle; on a pale ground of white tiles it reads as a jump. Tiles rise 16px and `Reveal` 22px; hover lifts are 2px (buttons) and 3px (tiles). Stay inside those.
4. **Continuous motion earns its place or leaves.** The always-on motion is the monogram's draw loop (nav, hero avatar, footer float), the bloom's 22s drift, the Download button's sheen, the relocation chip's ping, and the Read more / linked-pill loops; nothing loops on body text. Any new ambient effect (marquee, shine, gradient drift) must pause on hover, stop under reduced motion, and sit at the periphery, never on body text.
5. **Pointer effects are for pointers.** Magnet, spotlight, tilt, and proximity effects gate behind `(hover: hover) and (pointer: fine)` and simply don't exist on touch — svelte-bits itself disables MagicBento below 768px and warns on TiltedCard. Never make content depend on them.
6. **The palette doesn't change for motion.** No neon glow, no orange, no second hue. A "glow" becomes `--accent` at low alpha, `--tint`, or a hairline in `--rule`; a "spotlight" is `color-mix(in srgb, var(--ink) 4%, transparent)`; a "shine" sweeps `--ink-soft` → `--ink` → `--ink-soft`; any painted fill uses `--accent-fill` so it deepens in dark mode.
7. **Type stays legible while it moves.** Per-word/per-letter entrances are fine for eyebrows, headings, and the section index; never for prose paragraphs. Blur on text entrance tops out at ~6px and clears within 0.6s.
8. **Reduced motion is a first-class variant**, not a fallback. Every new effect has an explicit reduced branch that shows the final state immediately. The blanket CSS rule handles CSS; components branch on `useReducedMotion()` like `Reveal` does.
9. **Nothing pins, nothing hijacks scroll.** Blueprint Press's `ProjectEntry` deliberately replaced a pinned scroll-scrubbed panel with an unpinned layout, and Clean Bench keeps that: no Scroll Stack, no Lenis, no `position: sticky` pinning for effect. The one scroll intervention is `SmoothScroll` (Riley asked for imdaryl.com's smooth feel in the 2026-11-07 brief): a plain lerp toward the wheel's target with no transform on the page, which must keep stepping aside for touch, keys, reduced motion, `data-lock` and every inner scroller. Don't widen it, and don't add a second one.
10. **Fewer, better placements.** A page reads as polished with 3–5 well-placed effects, and as busy with 12. Default to leaving a spot static.

## Subtlety thresholds

Numbers to stay inside. They come from what the site already ships and from the quieter end of svelte-bits' own defaults.

| Property | Entrance (once, on view) | Hover / focus | Scroll-linked (scrub) | Ambient loop |
|---|---|---|---|---|
| Translate | ≤ 24px (`Reveal` uses 22, bento tiles and `.page-in` 16) | 1–3px lift, 2–4px nudge | ±40–60px parallax on media only (none on the site today; Blueprint Press's `ProjectEntry` used 56) | ≤ 5px float |
| Opacity | 0 → 1 | 1 → 0.85 for de-emphasis only | 0.1–0.3 → 1 for word reveals | never below 0.2 |
| Scale | 0.98 → 1 (or none) | ≤ 1.02 | none | none |
| Blur | ≤ 6px, text only, clears ≤ 0.6s | none | ≤ 4px, word reveals only | none |
| Rotate / tilt | none | ≤ 4° tilt on image cards only | ≤ 3° rotation-in on a heading block | none |
| Duration | 0.6–0.9s | 0.25–0.5s | n/a (tied to scroll; spring `220/34/0.4`) | 5–30s per cycle |
| Stagger | 0.05–0.09s per item, cap at ~6 items | n/a | 0.05s per word | n/a |
| Curve | `--ease` / `EASE` | `--ease` | `useSpring` | `linear` or `ease-in-out` |
| Trigger | `once: true`, `amount 0.25`, `margin -60 to -80px` | `:hover`, `:focus-visible` | `useScroll` offset | on mount, pause on hover |

## Placement audit

When the ask is broad ("add subtle animations throughout"), don't sprinkle. Do this:

1. **Walk each route** — `app/(site)/page.tsx` (the bento: hero, now, based in, education, GitHub activity, this site, say hello; then Who is Riley?, experience, projects grid, stack, education, contact, footer), `projects/page.tsx` (the grid, filters and the dialog), `projects/[id]/page.tsx` (a project page; `/projects/rileybeenders-com` carries the deep dive and tracker), `contact/page.tsx` — and list what already animates using the inventory above.
2. **List candidate spots** where a relationship could be made visible but isn't: a heading that arrives as a block when its words could arrive in sequence; a stat that appears as a fixed number; a group of pills that arrives as one slab; a card whose hover only changes color; a nav that doesn't acknowledge scroll depth; an eyebrow with no life on a long page.
3. **Rate each candidate** against the catalog verdicts in [`references/component-catalog.md`](references/component-catalog.md) — adopt, adapt, or avoid — and against the taste rules. Reject anything that fails rule 1.
4. **Pick 3–5 across the whole site**, favoring spots the user will actually scroll past: the bento tiles, section heads, the stack pills, the certificates, the project cards and dialog, the nav.
5. **Present the shortlist** in a table (spot · effect · svelte-bits source · why it fits · amplitude) and get agreement before implementing, unless the user has said to go ahead.
6. **Implement** with `motion-fluidity` (and `motion-layout` for anything structural). Then run `vault-sync` — motion changes touch `components/` and `bench.css`, which map to vault notes.

## The catalog

[`references/component-catalog.md`](references/component-catalog.md) rates all ~130 svelte-bits components for this site: the mechanism in one line, its runtime dependency, an **adopt / adapt / avoid** verdict, and the Blueprint translation (written for Blueprint Press; read its "paper/hairline" materials as Clean Bench's ground, tiles and `--tint`). Read it when picking effects, or when the user names a svelte-bits component and you need to know whether it belongs here and what it becomes. The short version:

- **Adopt (as-is in spirit, re-implemented in framer-motion/CSS):** Animated Content, Fade Content, Blur Text, Split Text (words), Scroll Reveal, Count Up, Magnet, Spotlight Card, Glare Hover (as a faint paper sheen), Logo Loop (as a slow pill marquee), Animated List's in-view scale, the Navbar's condense-on-scroll and sliding highlight, Stepper's height transition.
- **Adapt (keep the mechanism, cut the amplitude or material):** Tilted Card (≤4°, images only), Border Glow (→ a cursor-angle hairline), Magic Bento (→ hover lift + spotlight only, no particles), Shiny Text (→ ink sweep on an eyebrow), Gradual Blur (→ a soft fade at the bottom of a clipped list), Rotating Text (→ one cycling word in the hero tagline, if at all), True Focus (→ a hairline frame that follows the hovered nav link), Dot Grid (→ avoid on Clean Bench: the blueprint grid is gone, and the bloom is the only background), Text Type (→ typed-in eyebrow, once), Scroll Float / Scroll Velocity (→ a slow section-index drift), Star Border (→ a hairline that traces a button on hover).
- **Avoid (wrong material, wrong scale, or wrong runtime):** every WebGL/three/ogl background, every cursor-replacement effect (Blob/Ghost/Splash/Target/Crosshair/Image Trail/Pixel Trail), Glitch/Fuzzy/Decrypted/Scrambled text, Electric Border, Metallic Paint, Sticker Peel, Scroll Stack, Dome/Circular/Infinite galleries, Flying Posters, Ballpit, Falling Text, Click Spark, Bubble/Gooey/Flowing menus.

## Related procedures

- `motion-fluidity` (`.claude/skills/motion-fluidity/SKILL.md`) — implementation grammar and recipes.
- `motion-layout` (`.claude/skills/motion-layout/SKILL.md`) — nav, hero, grid, and card composition patterns.
- `design-guidelines` (`.claude/skills/design-guidelines/SKILL.md`) — the Tesla/Bugatti reference tokens; the live tokens are the repo-root `DESIGN.md`.
- `impeccable` (`.claude/skills/impeccable/SKILL.md`) — `$impeccable animate` is the generic version of this procedure; on this site it defers to the thresholds and catalog here. Its craft floor adds two rules this file assumes: one authored motion moment per surface rather than an identical entrance on every section, and no looping ambient effect (typewriter, sheen, ping) that does not convey state. `impeccable detect` will not catch motion; the placement audit above is the check.
- `vault-sync` (`.claude/skills/vault-sync/SKILL.md`) — required after any change under `components/` or `app/`.
