---
name: motion-fluidity
description: How to implement any animation, transition, hover or pointer effect, scroll-linked effect, text reveal, counter, or marquee in this Next.js + framer-motion codebase so it feels as fluid as svelte-bits (github.com/DavidHDev/svelte-bits) while staying inside the site's own motion system (--ease, Reveal, useReducedMotion). Use this whenever writing or editing framer-motion, CSS transitions/keyframes, useScroll/useSpring/useTransform, whileInView, AnimatePresence, springs, staggers, easing, parallax, magnet/spotlight/tilt hovers, blur-in or split-text entrances, count-ups, or when translating a svelte-bits, react-bits, GSAP, or Motion One component into React. Also use when something "feels janky", "pops in", or "doesn't feel smooth".
---

# Motion Fluidity (how to build it here)

One of several repository agent procedures — see `.agents/README.md` for the set. Second of three motion skills: [`motion-design`](../motion-design/SKILL.md) decides *what* and *how much*; this skill is the *how*; [`motion-layout`](../motion-layout/SKILL.md) covers nav/hero/grid/card composition.

svelte-bits feels fluid for reasons that have nothing to do with Svelte: every effect belongs to one of five motion grammars, each grammar uses a consistent trigger and curve, and the numbers are small. This skill maps each grammar onto framer-motion 12 + CSS as this site already uses them. Read the whole thing once; then use the [grammar map](references/grammar-map.md) when translating a specific component and the [recipes](references/recipes.md) for copy-ready code.

## The site's motion system (extend it, don't parallel it)

| Thing | Where | Use it for |
|---|---|---|
| `--ease: cubic-bezier(0.22, 0.9, 0.28, 1)` | `app/(site)/blueprint.css`, `.bp` block | Every CSS `transition` and `animation` that eases. |
| `const EASE = [0.22, 0.9, 0.28, 1] as const` | `components/projects/ProjectEntry.tsx`, `ProjectGallery.tsx` | Every framer-motion `transition.ease`. framer can't read CSS vars, so the tuple is duplicated with the comment `/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */`. Copy that line and comment into any new file that needs it; don't import it across components. |
| `Reveal` | `components/blueprint/Reveal.tsx` | Scroll entrances. `as="rise"` (opacity + y 22) or `as="rule"` (scaleX from left). Extend this component with new `as` variants before writing a new wrapper. |
| Spring `{ stiffness: 220, damping: 34–36, mass: 0.4 }` | `PageSpine.tsx`, `ProjectListSpine.tsx`, `ProjectEntry.tsx` | Smoothing any `useScroll` progress. Reuse these numbers so scroll-linked motion settles at one speed site-wide. |
| Variants pattern | `ProjectEntry.tsx` (`bulletListVariants` / `bulletItemVariants`), `ProjectGallery.tsx` (`gridVariants` / `shotVariants`) | Staggered children: parent carries `staggerChildren`/`delayChildren`, children carry `hidden`/`shown`. |
| `useReducedMotion()` branch | Every client component that animates | The convention is an explicit early branch that renders the static markup (`if (reduced) return <div>…</div>`), not a transition-duration hack. Match it. |
| Blanket reduced-motion CSS | Bottom of `blueprint.css` and `projects/projects.css` | Already collapses all CSS animation/transition under `.bp`. New CSS effects get this for free; only add a targeted rule if the final *state* differs from the animated one (e.g. a drawn stroke must be forced to `stroke-dashoffset: 0`). |
| `viewport` defaults | `Reveal.tsx` | `{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }`. Reuse for any `whileInView`. |
| Class prefixes | `blueprint.css` | `.bp-` site-wide, `.hp-` home page, `.pj-` projects. New classes follow the section they live in; keep the section-comment banners (`/* --- pills --- */`). |

Every animating component is `"use client"`. Server components (`app/(site)/page.tsx`) compose them; they don't animate.

## The five grammars

Each svelte-bits component is one of these. Identify which, then apply the mapping.

### 1. Entrance on view (play once when scrolled into view)

svelte-bits: Animated Content, Fade Content, Blur Text, Split Text, the landing `.is-visible` cards. Mechanism: set the "from" state on mount, wait for an IntersectionObserver / ScrollTrigger `once`, tween to the "to" state. Trigger point is ~90% down the viewport (`threshold 0.1` → `start: top 90%`).

Here: `motion.div` with `initial="hidden" whileInView="shown"` and the `viewport` defaults, or plain CSS `opacity/transform` + an `is-in` class toggled by `useInView`. For lists, variants with `staggerChildren`. Prefer extending `Reveal`.

```tsx
// Word-by-word blur-in (Blur Text). Parent staggers, children carry the keyframes.
const words = { hidden: {}, shown: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const word = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  shown: { opacity: [0, 0.6, 1], y: [14, 2, 0], filter: ["blur(6px)", "blur(2px)", "blur(0px)"],
           transition: { duration: 0.7, ease: EASE, times: [0, 0.55, 1] } }
};
```

Rules: `once: true` always (svelte-bits never replays entrances); wait for `document.fonts.ready` before measuring split text; never animate `height`/`width` for an entrance (use `clip-path` like `ProjectGallery`).

### 2. Scroll-linked (progress scrubbed to scroll position)

svelte-bits: Scroll Reveal, Scroll Float, Scroll Velocity, Scroll Stack, `ScrollTrigger { scrub: true }`. Mechanism: map the element's position in the viewport to a 0→1 progress and drive properties from it, often with a spring so it settles instead of tracking 1:1.

Here: `useScroll({ target, offset })` → `useSpring(progress, { stiffness: 220, damping: 34, mass: 0.4 })` → `useTransform(smooth, [0, 1], [from, to])` → `style={{ y }}`. `PageSpine` and `ProjectEntry` are the models.

GSAP `start`/`end` strings map to framer `offset` pairs: `"top bottom"` → `"start end"`, `"top 80%"` → `"start 0.8"`, `"bottom bottom"` → `"end end"`, `"center center"` → `"center center"`. Scroll Reveal's `start: "top bottom-=20%", end: "bottom bottom"` becomes `offset: ["start 0.8", "end 1"]`.

Rules: transform/opacity/filter only; the spring numbers above; no pinning (`position: sticky` for effect) — see `ProjectEntry`'s comment; keep the per-word stagger for word reveals by offsetting each word's input range (`[i/n, (i+1)/n]`) rather than spawning a hook per word.

### 3. Pointer proximity (continuous response to cursor position)

svelte-bits: Magnet, Spotlight Card, Tilted Card, Border Glow, Magic Bento, Dock, Variable Proximity, Dot Grid. Mechanism: on `pointermove`, compute the cursor relative to the element's rect (`getBoundingClientRect`), derive a value with **distance falloff** (linear, `norm²`, or gaussian — Variable Proximity has all three), push it into a spring, and render from the spring. On leave, spring back to rest.

Here: `useMotionValue` for the raw target, `useSpring(value, cfg)` for the rendered value, `style={{ x, y }}` or `useMotionTemplate` for gradient positions. Springs from svelte-bits that feel right at Blueprint amplitude: Tilted Card `{ stiffness: 100, damping: 30, mass: 2 }` (slow, heavy — good for tilt), Dock `{ stiffness: 150, damping: 12, mass: 0.1 }` (quick — good for magnet), Rotating Text `{ stiffness: 300, damping: 25 }` (snappy — good for a sliding highlight).

For CSS-driven effects (spotlight gradient, border highlight) write the cursor position into CSS custom properties (`el.style.setProperty("--sx", …)`) and let CSS `transition: opacity` handle the fade, exactly as Magic Bento does with `--glow-x/--glow-y/--glow-intensity`.

Rules: gate with `@media (hover: hover) and (pointer: fine)` in CSS and `window.matchMedia` in JS; listen on the element (or a wrapper) not `window`, unless the effect has a proximity `padding` like Magnet; use `pointermove` with `{ passive: true }`; store nothing in React state per move — motion values and CSS vars don't re-render.

### 4. Ambient loop (continuous, no trigger)

svelte-bits: Shiny Text, Gradient Text, Logo Loop, Star Border, Noise, the loader pulse. Mechanism: rAF or CSS keyframes advancing a `background-position` or `translate3d`; pause on hover; velocity eased with `1 - Math.exp(-dt / τ)` where it changes speed.

Here: CSS `@keyframes` on `--ease`-free `linear`/`ease-in-out`, `animation-play-state: paused` on `:hover`, and nothing else. The site already owns `bp-float`, `bp-chase`, `bp-sheen`. Reach for rAF only when the speed must respond to input (Scroll Velocity) — then `useAnimationFrame` + `useVelocity(scrollY)`.

Rules: cycle ≥ 5s; periphery only (eyebrows, footer, pills), never prose; the blanket reduced-motion rule stops it, but also give the static state a sensible look (a marquee should show its first N items, not a blank track).

### 5. State transition (enter/exit/morph on a state change)

svelte-bits: Stepper, dropdown menus, hamburger, Counter, Count Up, True Focus frame, Rotating Text. Mechanism: measure the incoming content, transition `height`/`transform`, key the content so it re-mounts, spring numbers to their targets.

Here: `AnimatePresence` + `motion.div` with `initial/animate/exit` (the case-study panel in `ProjectEntry` is the model for `height: 0 ↔ "auto"`); `layout` / `layoutId` for a highlight that moves between siblings (the nav highlight pill); `useSpring` on a `MotionValue` + `useMotionValueEvent` for numbers (Count Up); keyed `motion.span` with `y: "100%" → 0 → "-120%"` for cycling words (Rotating Text).

Rules: `AnimatePresence initial={false}` so the first render doesn't animate; `mode="wait"` when swapping words in place; `aria-live="polite"` on counters and rotating text; `tabular-nums` on any number that changes width.

## Translation tables

**GSAP ease → framer / CSS**

| GSAP | framer `ease` / CSS |
|---|---|
| `power2.out`, `power3.out`, `power4.out`, `expo.out` | `EASE` / `var(--ease)` — the site curve is already an ease-out of this family. Don't pick per-effect curves. |
| `power2.in`, `power3.in` (disappear/exit) | `[0.4, 0, 1, 1]` for exits only, or reverse the entrance with `EASE` and a shorter duration. |
| `power1.inOut`, `sine.inOut` (ambient) | CSS `ease-in-out`. |
| `none` / `linear` (scrub, marquee) | `linear`, or omit — `useTransform` is linear by construction. |
| `back.out(1.4–1.7)`, `elastic.out`, `bounce` | Not used here; convert to a spring with `damping ≥ 25` if overshoot is really wanted. |

**ScrollTrigger → `useScroll`**

| GSAP | framer |
|---|---|
| `trigger: el` | `target: ref` |
| `start: "top 90%"` (from `threshold 0.1`) | `offset: ["start 0.9", …]` |
| `end: "bottom bottom"` | `…, "end end"]` |
| `scrub: true` | drive `style` from `useTransform` (add `useSpring` for damping) |
| `once: true` | `whileInView` + `viewport.once` instead of `useScroll` |
| `stagger: 0.05` under scrub | per-word input ranges |

**Motion One → framer-motion** (svelte-bits' `motion` import is the vanilla sibling of framer-motion; the option names are identical)

| Motion One | framer-motion |
|---|---|
| `animate(el, keyframes, { duration, delay, ease, times })` | `<motion.el animate={keyframes} transition={{ duration, delay, ease, times }}>` |
| `animate(mv, target, { type: "spring", stiffness, damping, mass })` | `animate(mv, target, { type: "spring", … })` (same `animate` export) or `useSpring(mv, { stiffness, damping, mass })` |
| `motionValue(0)` + `.on("change")` | `useMotionValue(0)` + `useMotionValueEvent(mv, "change", cb)` |
| `transform([-d, 0, d], [a, b, a])(x)` | `useTransform(mv, [-d, 0, d], [a, b, a])` |
| `inView(el, cb)` | `useInView(ref, { once: true, margin })` |

**Svelte → React glue**

| Svelte | React here |
|---|---|
| `bind:this={el}` | `useRef<HTMLDivElement>(null)` |
| `$effect(() => { …; return cleanup })` | `useEffect(() => { …; return cleanup }, [deps])` |
| `use:action={params}` | a small hook that takes the ref, or a wrapper component |
| `$state` updated per frame | a `MotionValue` (never `useState` per frame) |
| `{#key value}` remount | `<AnimatePresence mode="wait"><motion.div key={value}>` |
| `style:--var={x}` | `style={{ ["--sx" as string]: x }}` or `el.style.setProperty` in the handler |
| `{@render children()}` | `{children}` |

## Implementation checklist

Before opening a PR for any motion change:

- [ ] Component is `"use client"`, and its static (reduced-motion) branch renders the same DOM minus motion wrappers.
- [ ] Curve is `EASE`/`--ease` (eased) or one of the site springs (scroll/pointer). No new curves without a reason in a comment.
- [ ] Amplitudes are inside `motion-design`'s thresholds (rise ≤ 24px, lift 2–5px, blur ≤ 6px, tilt ≤ 4°, stagger 0.05–0.09s).
- [ ] Entrances use `once: true`. Scroll-linked effects use the `220/34/0.4` spring. Pointer effects are hover-media gated and listen with `passive: true`.
- [ ] Only `transform`, `opacity`, `clip-path`, `filter`, `background-position`, or CSS custom properties change per frame. No `height`/`width`/`top`/`left` except through `AnimatePresence` height-auto.
- [ ] No per-frame `setState`. Motion values or CSS vars only.
- [ ] Listeners, observers, and `requestAnimationFrame` are cleaned up in the effect's return.
- [ ] SSR-safe: `IntersectionObserver`, `matchMedia`, `window` are only touched inside effects (see `HeroRibbon.tsx`'s guard).
- [ ] `will-change` only on elements that actually animate for more than a hover, and removed when idle if it was added dynamically.
- [ ] Split text waits for `document.fonts.ready`; counters and rotating text have `aria-live="polite"`; decorative wrappers have `aria-hidden`.
- [ ] Type-checks (`npm run typecheck`) and the dev preview shows no console errors. Verify reduced motion by emulating it in the preview (`resize_window` won't do it; toggle it in DevTools rendering settings or test the `reduced` branch directly).
- [ ] `vault-sync` run: `components/**` and `blueprint.css` changes map to `02 Components/*` and `05 Styling and Design/Design System (Blueprint Press).md`.

## Where to go next

- [`references/grammar-map.md`](references/grammar-map.md) — each borrow-worthy svelte-bits component: the exact numbers it uses, the mechanism excerpt, and the framer/CSS translation with the site's numbers. Read the section for the component you're translating.
- [`references/recipes.md`](references/recipes.md) — complete, copy-ready TSX/CSS for this codebase: `Reveal` extensions, `WordReveal`, `ScrollWords`, `Magnet`, `Spotlight`, `Tilt`, `CountUp`, `Marquee`, `Shine`, `Expandable`, `SlidingHighlight`, `CondensingNav`. Each states which grammar it is, its amplitude, and its reduced-motion behavior.
- [`../motion-design/references/component-catalog.md`](../motion-design/references/component-catalog.md) — the adopt/adapt/avoid verdicts, if the component isn't in the grammar map.
