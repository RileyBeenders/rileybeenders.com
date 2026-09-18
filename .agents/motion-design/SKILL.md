---
name: motion-design
description: Decide what to animate on this site and how far to take it, using svelte-bits (github.com/DavidHDev/svelte-bits) as the reference for fluid, polished motion, translated into this site's restrained "Blueprint Press" editorial style. Use this before adding, choosing, reviewing, or auditing any animation, transition, hover or cursor effect, scroll effect, text effect, or micro-interaction, and whenever the user mentions svelte-bits, react-bits, "subtle animations", "make it feel smoother / more alive / more polished", "add some motion", or asks which effect would fit a spot. Routes implementation to motion-fluidity and structural patterns to motion-layout.
---

# Motion Design (what to animate, and how far)

One of several repository agent procedures — see `.agents/README.md` for the set. This is the first of three motion skills:

| Skill | Question it answers |
|---|---|
| **`motion-design`** (this one) | *What* should move, *where*, and *how much*? Taste rules, thresholds, and a rated catalog of every svelte-bits component. |
| [`motion-fluidity`](../motion-fluidity/SKILL.md) | *How* do I build it in this codebase? svelte-bits' motion grammar translated to framer-motion + CSS, with copy-ready recipes. |
| [`motion-layout`](../motion-layout/SKILL.md) | *How* does svelte-bits compose navs, heroes, grids, and cards, and how does that map onto the Blueprint Press shell? |

Start here when the task is open-ended ("add some subtle animations", "what would fit the hero?"). Skip straight to `motion-fluidity` when the user has already named the exact effect and spot.

## The reference: svelte-bits, and why it needs translating

svelte-bits is an MIT-licensed library of ~130 animated Svelte 5 components in four groups (Text Animations, Animations, Components, Backgrounds). Its motion is genuinely excellent — everything is spring-damped or eased on a short list of curves, entrances are scroll-gated and play once, pointer effects use distance falloff instead of on/off, and continuous effects pause on hover. That *grammar* is what to borrow.

Its *aesthetic* is the opposite of this site: near-black canvas (`#14110E`), Svelte-orange glow (`#FF8A4C`), frosted-glass cards (`backdrop-filter: blur(32px) saturate(1.3)`), and roughly half the catalog is WebGL (`three`, `ogl`) or physics (`matter-js`). This site is the Blueprint Press design: paper canvas, ink, one red accent, hairline rules, serif type, a fixed blueprint grid texture. A borrowed effect only works here once its glow becomes a hairline, its glass becomes paper, and its amplitude drops by roughly half.

Source layout, for reading an original: `https://github.com/DavidHDev/svelte-bits/blob/main/src/lib/components/library/<Category>/<Name>/<Name>.svelte` where `<Category>` is `TextAnimations`, `Animations`, `Components`, or `Backgrounds` and `<Name>` is PascalCase (e.g. `TextAnimations/BlurText/BlurText.svelte`). Each file opens with a JSON comment listing its dependencies. Never install its runtimes here (`gsap`, `lenis`, `three`, `ogl`, `matter-js`, `motion`) — the site has `framer-motion`, and every subtle effect in the catalog is expressible with it plus CSS.

## What already moves on this site

Read these before proposing anything, so you extend the existing hand rather than adding a second one:

| Piece | File | What it does |
|---|---|---|
| `--ease` | `app/(site)/blueprint.css` (`.bp` block) | The single easing curve, `cubic-bezier(0.22, 0.9, 0.28, 1)`. Every CSS transition uses it. |
| `EASE` | `components/projects/ProjectEntry.tsx`, `ProjectGallery.tsx` | Same curve as a tuple for framer-motion, which can't read CSS vars. |
| `Reveal` | `components/blueprint/Reveal.tsx` | The scroll entrance: `rise` (opacity 0→1, y 22→0, 0.82s) or `rule` (scaleX 0→1 from the left, 0.9s). `once: true`, `amount: 0.25`. Siblings sequence with `delay`. Reduced motion renders a plain `div`. |
| `PageSpine`, `ProjectListSpine` | `components/blueprint/PageSpine.tsx`, `components/projects/ProjectListSpine.tsx` | A hairline track down the left edge whose accent fill draws with scroll, spring-damped (`stiffness 220, damping 34, mass 0.4`). |
| Project entry | `components/projects/ProjectEntry.tsx` | Media column parallax (±56px via `useScroll` + `useSpring`), bullet stagger (`staggerChildren 0.09`), case-study panel `height: 0 → auto` through `AnimatePresence`. |
| Gallery | `components/projects/ProjectGallery.tsx` | Each photo uncovers bottom-to-top with a `clip-path: inset()` wipe, staggered 0.1s. |
| Hero ribbon, mark | `components/blueprint/HeroRibbon.tsx`, `BpMark.tsx`, `blueprint.css` (`bp-draw`, `bp-draw-in`, `bp-chase`, `bp-float`) | SVG stroke-draw on load, replayed on re-entry; the monogram's slow draw/chase loop and 5px float. |
| Hover rules | `blueprint.css` (`.bp-btn`, `.bp-link`, `.bp-role`, `.bp-cert`, `.bp-bullet-link`, `.bp-nav-link`), `projects/projects.css` | Lifts of 2–5px, underline/bar grow via `scaleX`/`scaleY`, arrows nudge 3–5px, all 0.28–0.52s on `--ease`. |
| Back to top, relocation badge | `components/blueprint/BackToTop.tsx`, `BpRelocationBadge.tsx` | Scroll-gated reveal; framer-motion badge. |
| Reduced motion | Bottom of `blueprint.css` | A blanket rule collapses every animation and transition under `.bp` to ~0ms and forces drawn strokes to their final state. Components additionally branch on `useReducedMotion()`. |

The site's motion is already one coherent hand. New work should be indistinguishable in feel from `Reveal` and the button hover: same curve, same range of durations, same "ink on paper" materials.

## Taste rules

These are the reasons behind the thresholds below; when a case isn't covered, reason from these.

1. **Motion explains structure; it never decorates.** svelte-bits' best components (Animated Content, Scroll Reveal, Magnet, Dock) each make a relationship visible — this appears because you reached it, this reacts because you're near it. Before adding an effect, say in one sentence what relationship it reveals. If the sentence is "it looks cool", drop it.
2. **One hand.** Every duration, curve, and distance should feel like it came from the same author as `Reveal`. Use `--ease` / `EASE` for eased motion and the existing spring constants for scroll-linked motion. Don't introduce `back`, `elastic`, or bounce curves — svelte-bits uses them for playful demos; this is a résumé.
3. **Amplitude is halved on paper.** A 24px rise on a dark glassy card reads as subtle; on cream paper with serif type it reads as a jump. The site's `Reveal` uses 22px; hover lifts are 2–5px. Stay inside those.
4. **Continuous motion earns its place or leaves.** The monogram float and draw loop are the site's only always-on motion, and they live in the hero corner and footer. Any new ambient effect (marquee, shine, gradient drift) must pause on hover, stop under reduced motion, and sit at the periphery, never on body text.
5. **Pointer effects are for pointers.** Magnet, spotlight, tilt, and proximity effects gate behind `(hover: hover) and (pointer: fine)` and simply don't exist on touch — svelte-bits itself disables MagicBento below 768px and warns on TiltedCard. Never make content depend on them.
6. **The palette doesn't change for motion.** No neon glow, no orange, no white-on-black. A "glow" becomes `--accent` at low alpha or a hairline in `--rule`; a "spotlight" is `color-mix(in srgb, var(--ink) 4%, transparent)`; a "shine" sweeps `--ink-soft` → `--ink` → `--ink-soft`.
7. **Type stays legible while it moves.** Per-word/per-letter entrances are fine for eyebrows, headings, and the section index; never for prose paragraphs. Blur on text entrance tops out at ~6px and clears within 0.6s.
8. **Reduced motion is a first-class variant**, not a fallback. Every new effect has an explicit reduced branch that shows the final state immediately. The blanket CSS rule handles CSS; components branch on `useReducedMotion()` like `Reveal` does.
9. **Nothing pins, nothing hijacks scroll.** `ProjectEntry` deliberately replaced a pinned scroll-scrubbed panel with an unpinned layout ("no pinning… nothing ever needs its own scrollbar"). Keep that decision: no Scroll Stack, no Lenis, no `position: sticky` pinning for effect.
10. **Fewer, better placements.** A page reads as polished with 3–5 well-placed effects, and as busy with 12. Default to leaving a spot static.

## Subtlety thresholds

Numbers to stay inside. They come from what the site already ships and from the quieter end of svelte-bits' own defaults.

| Property | Entrance (once, on view) | Hover / focus | Scroll-linked (scrub) | Ambient loop |
|---|---|---|---|---|
| Translate | ≤ 24px (`Reveal` uses 22) | 2–5px lift, 3–7px nudge | ±40–60px parallax on media only (`ProjectEntry` uses 56) | ≤ 5px float |
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

1. **Walk each route** — `app/(site)/page.tsx` (hero, summary, experience, toolchain, education, footer), `projects/page.tsx`, `more-info/page.tsx`, `contact/page.tsx` — and list what already animates using the inventory above.
2. **List candidate spots** where a relationship could be made visible but isn't: a heading that arrives as a block when its words could arrive in sequence; a stat that appears as a fixed number; a group of pills that arrives as one slab; a card whose hover only changes color; a nav that doesn't acknowledge scroll depth; an eyebrow with no life on a long page.
3. **Rate each candidate** against the catalog verdicts in [`references/component-catalog.md`](references/component-catalog.md) — adopt, adapt, or avoid — and against the taste rules. Reject anything that fails rule 1.
4. **Pick 3–5 across the whole site**, favoring spots the user will actually scroll past: hero, section heads, the toolchain pills, the certificates, the project entries, the nav.
5. **Present the shortlist** in a table (spot · effect · svelte-bits source · why it fits · amplitude) and get agreement before implementing, unless the user has said to go ahead.
6. **Implement** with `motion-fluidity` (and `motion-layout` for anything structural). Then run `vault-sync` — motion changes touch `components/` and `blueprint.css`, which map to vault notes.

## The catalog

[`references/component-catalog.md`](references/component-catalog.md) rates all ~130 svelte-bits components for this site: the mechanism in one line, its runtime dependency, an **adopt / adapt / avoid** verdict, and the Blueprint translation. Read it when picking effects, or when the user names a svelte-bits component and you need to know whether it belongs here and what it becomes. The short version:

- **Adopt (as-is in spirit, re-implemented in framer-motion/CSS):** Animated Content, Fade Content, Blur Text, Split Text (words), Scroll Reveal, Count Up, Magnet, Spotlight Card, Glare Hover (as a faint paper sheen), Logo Loop (as a slow pill marquee), Animated List's in-view scale, the Navbar's condense-on-scroll and sliding highlight, Stepper's height transition.
- **Adapt (keep the mechanism, cut the amplitude or material):** Tilted Card (≤4°, images only), Border Glow (→ a cursor-angle hairline), Magic Bento (→ hover lift + spotlight only, no particles), Shiny Text (→ ink sweep on an eyebrow), Gradual Blur (→ a soft fade at the bottom of a clipped list), Rotating Text (→ one cycling word in the hero tagline, if at all), True Focus (→ a hairline frame that follows the hovered nav link), Dot Grid (→ the existing blueprint grid gets a faint pointer-proximity darkening), Text Type (→ typed-in eyebrow, once), Scroll Float / Scroll Velocity (→ a slow section-index drift), Star Border (→ a hairline that traces a button on hover).
- **Avoid (wrong material, wrong scale, or wrong runtime):** every WebGL/three/ogl background, every cursor-replacement effect (Blob/Ghost/Splash/Target/Crosshair/Image Trail/Pixel Trail), Glitch/Fuzzy/Decrypted/Scrambled text, Electric Border, Metallic Paint, Sticker Peel, Scroll Stack, Dome/Circular/Infinite galleries, Flying Posters, Ballpit, Falling Text, Click Spark, Bubble/Gooey/Flowing menus.

## Related procedures

- `motion-fluidity` (`.agents/motion-fluidity/SKILL.md`) — implementation grammar and recipes.
- `motion-layout` (`.agents/motion-layout/SKILL.md`) — nav, hero, grid, and card composition patterns.
- `design-guidelines` (`.agents/design-guidelines/SKILL.md`) — color/type tokens if a new surface is needed.
- `vault-sync` (`.agents/vault-sync/SKILL.md`) — required after any change under `components/` or `app/`.
