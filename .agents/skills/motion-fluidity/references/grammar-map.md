# Grammar map: svelte-bits mechanisms → framer-motion + CSS

For each svelte-bits component worth borrowing: the numbers it ships with, the core of how it works (short excerpts, MIT + Commons Clause © David Haz, `DavidHDev/svelte-bits` @ `ad44142`), and the translation into this codebase with Blueprint amplitude. Complete code lives in [`recipes.md`](recipes.md); this file is for understanding *why* a recipe has the numbers it has, and for translating anything the recipes don't cover.

Contents
1. [Entrance on view](#1-entrance-on-view) — Animated Content · Fade Content · Blur Text · Split Text · `.is-visible` cards
2. [Scroll-linked](#2-scroll-linked) — Scroll Reveal · Scroll Float · Scroll Velocity · Logo Loop's velocity easing
3. [Pointer proximity](#3-pointer-proximity) — Magnet · Spotlight Card · Tilted Card · Border Glow · Magic Bento · Dock · Variable Proximity falloffs · Dot Grid
4. [Ambient loop](#4-ambient-loop) — Shiny Text · Gradient Text · Star Border · Glare Hover · loader pulse
5. [State transition](#5-state-transition) — Stepper · dropdown · hamburger · Count Up · Counter · Rotating Text · True Focus · Navbar highlight
6. [svelte-bits' motion vocabulary](#6-svelte-bits-motion-vocabulary) — the full set of curves, springs, staggers, and durations it uses

---

## 1. Entrance on view

### Animated Content (`Animations/AnimatedContent`) — gsap

Defaults: `distance 100`, `direction "vertical"`, `duration 0.8`, `ease "power3.out"`, `initialOpacity 0`, `scale 1`, `threshold 0.1`, `delay 0`. Optional `disappearAfter` re-tweens out with `power3.in` 0.5s.

```ts
const startPct = (1 - threshold) * 100;                    // 0.1 → "top 90%"
gsap.set(el, { [axis]: offset, scale, opacity: initialOpacity, visibility: 'visible' });
const tl = gsap.timeline({ paused: true, delay }).to(el, { [axis]: 0, scale: 1, opacity: 1, duration, ease });
ScrollTrigger.create({ trigger: el, start: `top ${startPct}%`, once: true, onEnter: () => tl.play() });
```

Translation: this is `Reveal`. Its defaults are already Blueprint-scaled (y 22 not 100, 0.82s not 0.8, `EASE` not `power3.out`). Add variants to `Reveal` for what it lacks:

| Animated Content prop | `Reveal` |
|---|---|
| `direction "horizontal"`, `reverse` | `as="slide"` with `from="left" \| "right"`, x ±18 |
| `scale 0.95` | `as="rise"` + `scale` prop → `{ opacity: 0, y: 22, scale: 0.98 }` |
| `threshold` | `viewport.amount` (keep 0.25) |
| `delay` | `delay` (already exists) |
| `disappearAfter` | don't — nothing on this site leaves once it's arrived |

### Fade Content (`Animations/FadeContent`) — gsap

Defaults: `duration 1000ms`, `ease "power2.out"`, `blur false` (→ `blur(10px)`), `threshold 0.1`, `initialOpacity 0`. Uses `autoAlpha` (opacity + visibility) and sets `willChange: 'opacity, filter, transform'` up front.

Translation: `Reveal as="fade"` → `{ hidden: { opacity: 0, filter: blur ? "blur(6px)" : "none" }, shown: { opacity: 1, filter: "blur(0px)" } }`, duration 0.7. Use for images and cards where a rise would fight the grid lines. Keep blur ≤ 6px — 10px on paper looks like a focus error.

### Blur Text (`TextAnimations/BlurText`) — motion

Defaults: `animateBy "words"`, `direction "top"`, `delay 200ms` (stagger), `stepDuration 0.35`, `threshold 0.1`, IntersectionObserver once. Three-step keyframes per span:

```ts
from: { filter: 'blur(10px)', opacity: 0, y: -50 }            // direction 'top'
to:  [{ filter: 'blur(5px)', opacity: 0.5, y: 5 }, { filter: 'blur(0px)', opacity: 1, y: 0 }]
animate(el, keyframes, { duration: stepDuration * steps, times: [0, 0.5, 1], delay: index * delay / 1000, ease });
```

The middle step overshoots past rest by 5px (`y: 5` when coming from `-50`) — that tiny counter-move is what makes it feel like settling rather than stopping.

Translation (recipe `WordReveal`): blur 6 → 2 → 0, opacity 0 → 0.6 → 1, y 14 → 2 → 0 (keep the overshoot, keep it small), `times: [0, 0.55, 1]`, duration 0.7, `staggerChildren 0.06`. Words only. Each word is `display: inline-block` with a trailing ` ` so wrapping behaves.

### Split Text (`TextAnimations/SplitText`) — gsap (SplitText plugin)

Defaults: `splitType "chars"`, `from {opacity 0, y 40}`, `to {opacity 1, y 0}`, `duration 1.25`, `ease "power3.out"`, `delay 50ms` stagger, `threshold 0.1`, `rootMargin "-100px"`, waits for `document.fonts.status === 'loaded'`, `force3D: true`, `willChange: 'transform, opacity'`, `once: true`.

Translation: same as Blur Text without the blur. Split on words (`text.split(/(\s+)/)` keeps the whitespace tokens so you can render spaces as text nodes and words as spans — Scroll Reveal does this). Chars only for the hero's two-word name, and even then `Reveal` per line already does the job. The `fonts.ready` wait matters: measure or split only after `await document.fonts.ready` or the spans re-flow when Instrument Serif arrives.

### Landing `.is-visible` cards (`landing/Features`) — CSS

```css
.ln-features-card { opacity: 0; transform: translateY(24px); transition: … opacity 0.5s ease, transform 0.5s ease; }
.ln-features-card.is-visible { opacity: 1; transform: translateY(0); }
```
```svelte
<div class:is-visible={visible[i]} style="transition-delay: {i * 70}ms;">   <!-- IO once, unobserve after -->
```

Translation (recipe `useInViewOnce` + CSS): the cheapest stagger for lists of 6–20 items (`.bp-pill`, `.bp-cert`) where a framer wrapper per item is overkill. y 24 → 16 here, delay 60ms, cap the delay at index 6 so late items don't wait (`Math.min(i, 6) * 60`). The site already caps `Reveal` delays at `Math.min(index, 3) * 0.06` on the home page — same idea.

---

## 2. Scroll-linked

### Scroll Reveal (`TextAnimations/ScrollReveal`) — gsap

Defaults: `baseOpacity 0.1`, `baseRotation 3`, `blurStrength 4`, `enableBlur true`, rotation `start "top bottom"` → `end "bottom bottom"`, words `start "top bottom-=20%"` → `end "bottom bottom"`, `stagger 0.05`, all `scrub: true, ease: 'none'`.

```ts
gsap.fromTo(el, { transformOrigin: '0% 50%', rotate: baseRotation }, { rotate: 0, scrollTrigger: { start: 'top bottom', end: rotationEnd, scrub: true } });
gsap.fromTo(words, { opacity: baseOpacity }, { opacity: 1, stagger: 0.05, scrollTrigger: { start: 'top bottom-=20%', end: wordAnimationEnd, scrub: true } });
```

Translation (recipe `ScrollWords`): one `useScroll({ target, offset: ["start 0.85", "start 0.4"] })` for the block; each word's opacity is `useTransform(progress, [i/n, (i+1)/n], [0.25, 1])` — that's the stagger under scrub. Rotation 2° → 0 from `transformOrigin: "0% 50%"` on the block. Blur 3 → 0 if wanted. Use once per page, on a short passage (≤ 40 words).

### Scroll Float (`TextAnimations/ScrollFloat`) — gsap

Defaults: chars from `{opacity 0, yPercent 120, scaleY 2.3, scaleX 0.7, transformOrigin '50% 0%'}`, `ease "back.inOut(2)"`, `start "center bottom+=50%"`, `end "bottom bottom-=40%"`, `stagger 0.03`, scrubbed.

Translation: the squash-and-stretch is off-brand. Keep the *scrubbed rise*: a section index drifting `y 12 → 0` and `opacity 0.4 → 1` over `offset: ["start 0.95", "start 0.6"]`. No scale.

### Scroll Velocity (`TextAnimations/ScrollVelocity`) — vanilla

Defaults: `velocity 100 px/s`, `numCopies 6`, spring `stiffness 400, damping 50`, `velocityMapping { input [0,1000], output [0,5] }`. A hand-rolled spring smooths scroll velocity; direction flips with scroll direction; the track wraps with `wrap(-copyWidth, 0, x)`.

```ts
const accel = stiffness * (scrollVelocity - smoothVelocity) - damping * springVel;
springVel += accel * dt; smoothVelocity += springVel * dt;
moveBy += directionFactors[i] * moveBy * velocityFactor;
```

Translation: `useScroll()` → `useVelocity(scrollY)` → `useSpring(velocity, { stiffness: 400, damping: 50 })` → `useTransform(v, [0, 1000], [0, 5])` → `useAnimationFrame` accumulating `baseX`. Only on a marquee that already exists; otherwise the CSS marquee in the recipes is enough.

### Logo Loop's velocity easing (`Animations/LogoLoop`) — vanilla

```ts
const ef = 1 - Math.exp(-dt / SMOOTH_TAU);   // exponential approach, frame-rate independent
velocity += (target - velocity) * ef;
```

Translation: the standard way to ease *any* per-frame value toward a target without a spring library. `τ` ≈ 0.25s feels right. Also: `prefers-reduced-motion` check up front sets `transform: translate3d(0,0,0)` and returns — copy that.

---

## 3. Pointer proximity

### Magnet (`Animations/Magnet`) — vanilla

Defaults: `padding 100` (activation zone beyond the bounds), `magnetStrength 2` (offset = distance / strength → *half* the cursor offset!), `activeTransition "transform 0.3s ease-out"`, `inactiveTransition "transform 0.5s ease-in-out"`, listens on `window`.

```ts
const dx = Math.abs(cx - e.clientX), dy = Math.abs(cy - e.clientY);
if (dx < width / 2 + padding && dy < height / 2 + padding) pos = { x: (e.clientX - cx) / magnetStrength, y: (e.clientY - cy) / magnetStrength };
else pos = { x: 0, y: 0 };
```

Translation (recipe `Magnet`): strength 2 moves a button 50px — far too much. Use strength 7–8 (≈ 4–6px at the edge of a 40px button), padding 24, and a spring `{ stiffness: 150, damping: 12, mass: 0.1 }` (Dock's) instead of two CSS transitions. Listen on a wrapper sized `padding` larger than the child, not on `window`. Gate: `(hover: hover) and (pointer: fine)`.

### Spotlight Card (`Components/SpotlightCard`) — vanilla

Defaults: `spotlightColor "rgba(255,255,255,0.25)"`, opacity `0 → 0.6` on enter, `transition-opacity duration-500 ease-in-out`, gradient `radial-gradient(circle at {x}px {y}px, color, transparent 80%)`.

Translation (recipe `Spotlight`): set `--sx/--sy` on `pointermove`, CSS draws `radial-gradient(circle at var(--sx) var(--sy), color-mix(in srgb, var(--ink) 5%, transparent), transparent 70%)` on a `::before`, `opacity` 0 → 1 over 0.4s `--ease`. On paper the "light" is a faint ink wash, so the number is 4–6% ink, not 25% white. Never re-render per move.

### Tilted Card (`Components/TiltedCard`) — motion

Defaults: `rotateAmplitude 14`, `scaleOnHover 1.1`, `perspective 800px`, `SPRING { stiffness 100, damping 30, mass 2 }`, caption spring `{ 350, 30, 1 }` with velocity-based rotation `-velocityY * 0.6`.

```ts
const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;
animate(mvRX, rotationX, SPRING); animate(mvRY, rotationY, SPRING);
```

Translation (recipe `Tilt`): amplitude 4, scale 1.01, same spring (it's slow and heavy, which is exactly right on paper), `transform-style: preserve-3d` on the inner, `perspective: 900px` on the wrapper. Images and certificate cards only. No caption. Gate for hover media; the original literally prints "not optimized for mobile".

### Border Glow (`Components/BorderGlow`) — vanilla

Cursor angle: `atan2(dy, dx) * 180/π + 90`. Edge proximity: `1 / min(cx/|dx|, cy/|dy|)` clamped 0–1 — i.e. how close to *any* edge, 0 at center, 1 at the edge. Border mask: `conic-gradient(from {angle}deg at center, black {spread}%, transparent {spread+15}%, transparent {100-spread-15}%, black {100-spread}%)` with `coneSpread 25`. Opacity `(proximity·100 − sensitivity) / (100 − sensitivity)`, transitions `0.25s ease-out` in / `0.75s ease-in-out` out.

Translation: a hairline (`1px`, `--ink-soft`) masked by that conic gradient so only the edge nearest the cursor shows, appearing only as the cursor nears the edge. Use `mask-image` on a `::after` with `border: 1px solid`. Optional; `.bp-cert-bar`'s scaleX bar already gives certificates a hover accent.

### Magic Bento (`Components/MagicBento`) — gsap

Card: hover `translateY(-2px)` + `box-shadow`, `transition: all 0.3s ease`. Tilt ±10° with `duration 0.1` on move and `0.3` on leave. Magnetism `(x - cx) * 0.05`. Click ripple scales a radial gradient from 0 → 1 over 0.8s. Global spotlight: 800px fixed radial following the cursor with `duration 0.1`, opacity by distance to nearest card. `--glow-x/--glow-y/--glow-intensity/--glow-radius` custom properties per card. **Disabled ≤ 768px.**

Translation: only the CSS-custom-property pattern for per-card cursor position. Lift already exists. Everything else is off-brand.

### Dock (`Components/Dock`) — motion

`spring { mass 0.1, stiffness 150, damping 12 }`, `magnification 70`, `baseItemSize 50`, `distance 200`. Per item:

```ts
const md = mx - rect.x - baseItemSize / 2;                          // cursor distance from item center
target.set(transform([-distance, 0, distance], [baseItemSize, magnification, baseItemSize])(md));
animate(animated, target, { type: 'spring', ...spring });          // then size = animated
```

Translation: the *shape* of any proximity effect — a three-point `useTransform([-d, 0, d], [rest, peak, rest])` fed by cursor distance, through a spring. With `peak` tiny (a 1px lift, 0.02em letter-spacing) it's a nav-link hover that anticipates the cursor. Probably too much for this site; documented because it's the cleanest expression of the pattern.

### Variable Proximity falloffs (`TextAnimations/VariableProximity`) — vanilla

```ts
const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
if (falloff === 'exponential') return norm ** 2;
if (falloff === 'gaussian') return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
return norm;   // linear
```

Translation: use `gaussian` for anything that should feel soft (spotlight intensity, magnet strength by distance). Linear feels mechanical; `norm²` is a good middle.

### Dot Grid (`Backgrounds/DotGrid`) — gsap

`proximity 150`, `speedTrigger 100`, `shockRadius 250`, `shockStrength 5`, `maxSpeed 5000`, `resistance 750`, `returnDuration 1.5` with `elastic.out(1, 0.75)`. Color lerps `baseColor → activeColor` by `1 - dist/proximity`; fast cursor pushes dots with inertia.

Translation: none of the physics. If the blueprint grid should acknowledge the cursor at all, it's a `radial-gradient` of ≤ 8% ink at `--mx/--my` layered under the grid lines with `opacity` fading in/out, driven by a single `pointermove` on `.bp`. Test it; it may be too much.

---

## 4. Ambient loop

### Shiny Text (`TextAnimations/ShinyText`) — vanilla (rAF)

`speed 2s`, `spread 120deg`, gradient `color 0% → color 35% → shine 50% → color 65% → color 100%`, `background-size 200% auto`, `background-position` driven from a rAF progress `150 - progress * 2 %`, `yoyo` and `pauseOnHover` options, `delay` between cycles.

Translation (recipe `Shine`): pure CSS — same gradient with `--ink-soft` / `--ink` / `--ink-soft`, `@keyframes` on `background-position 150% → -50%`, 7s, `animation-play-state: paused` on hover. One eyebrow or the footer URL. The rAF loop exists in the original only to support runtime prop changes.

### Gradient Text — motion (rAF)

8s yoyo, `300%` background size. Off-palette; skip.

### Star Border (`Animations/StarBorder`) — CSS

Two `radial-gradient(circle, color, transparent 10%)` divs sized `300% × 50%`, offset outside the box, `translate(±100%)` with opacity fade, `linear infinite alternate`, `6s`.

Translation: a traced hairline instead. Either an SVG `<rect>` with `stroke-dasharray` and the site's `bp-draw-in` keyframe (`stroke-dashoffset: var(--len) → 0`, 1.7s `cubic-bezier(0.5, 0, 0.2, 1)`) triggered on hover, or a `conic-gradient` mask rotating on `::after`. Ink, 1px.

### Glare Hover (`Animations/GlareHover`) — vanilla

Overlay gradient `linear-gradient(-45deg, transparent 60%, glare 70%, transparent 100%)`, `background-size 250%`, position jumps from `-100% -100%` to `100% 100%` over `650ms ease` on enter (with a forced reflow to restart), back on leave unless `playOnce`.

Translation: `--white` at 30% alpha, band 12%, 0.6s `--ease`, on `.bp-cert::after` or a gallery frame. It should be almost invisible — the reflow trick (`void el.offsetWidth`) is how to restart a CSS transition instantly.

### Loader pulse (`landing/LandingLoader`) — CSS

`opacity 0.2 ↔ 0.6`, 1.8s ease-in-out infinite. Overlay hides with `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)`; header then fades 0.7s `cubic-bezier(0.16, 1, 0.3, 1)`; hero 0.8s +0.1s.

Translation: no loader (the hero reveals already sequence). `cubic-bezier(0.16, 1, 0.3, 1)` is close kin to `--ease`; not needed.

---

## 5. State transition

### Stepper (`Components/Stepper`) — motion

Content wrapper `height: {measured}px; transition: height 0.4s cubic-bezier(0.5, 1, 0.5, 1)`; the step is `{#key currentStep}`-remounted with `animation: stepper-enter 0.4s cubic-bezier(0.4, 0, 0.2, 1)` from `translateX(±100%)`; progress line `width 0 → 100%` and color over `400ms`; indicator `background-color, color 300ms`.

Translation: `AnimatePresence` height-auto (the case-study panel) covers expand/collapse. For step content, `mode="wait"` + `initial={{ x: dir * 24, opacity: 0 }}` (24px, not 100%). Progress line: `scaleX` with `transform-origin: left`, `--ease`, 0.4s.

### Dropdown (`landing/Hero` `.ln-hero-code-dropdown-menu`) — CSS

`opacity 0; transform: translateY(-4px) scale(0.97); pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease;` → `.open { opacity 1; transform: none; pointer-events: auto }`. Caret `rotate(180deg)` 0.25s.

Translation: verbatim with `--ease`, for any popover. `pointer-events: none` while closed is the important detail.

### Hamburger (`landing/Navbar`) — CSS

Bars: `transition: transform 0.25s ease, opacity 0.25s ease`; open: bar 1 `translateY(5.5px) rotate(45deg)`, bar 2 `opacity 0`, bar 3 `translateY(-5.5px) rotate(-45deg)`.

Translation: verbatim if a hamburger is ever added.

### Count Up (`TextAnimations/CountUp`) — motion

`duration 2` → `damping = 20 + 40 / duration`, `stiffness = 100 / duration`; `animate(start, end, { type: 'spring', damping, stiffness, onUpdate })`; `Intl.NumberFormat('en-US', { useGrouping: !!sep, min/maxFractionDigits })`; decimals derived from `from`/`to`; IntersectionObserver `threshold 0` once; `startWhen` gate.

Translation (recipe `CountUp`): `useMotionValue(from)` → `useSpring(mv, { stiffness: 100 / d, damping: 20 + 40 / d })` → `useMotionValueEvent(spring, "change", v => el.textContent = fmt(v))`; kick it with `mv.set(to)` inside `useInView` once. `font-variant-numeric: tabular-nums`. `aria-live="polite"`, and render the final value in the static branch.

### Counter (`Components/Counter`) — motion

One `motionValue` per digit slot, `animate(mv, target, { type: 'spring', stiffness: 250, damping: 30 })`; each slot stacks digits 0–9 absolutely and translates by `offsetForNumber(latest, n, height)` with the `> 5 → -10h` wrap so it rolls the short way; top/bottom gradient masks 16px.

Translation: only if a hero stat exists. Count Up is the quiet default.

### Rotating Text (`TextAnimations/RotatingText`) — motion

`initialY "100%"`, `animateY 0`, `exitY "-120%"`, spring `{ stiffness 300, damping 25 }`, `staggerDuration 0` default, `staggerFrom "first" | "last" | "center" | "random"`, 2s rotation interval, `splitBy "characters"`.

Translation: `AnimatePresence mode="wait"` around a keyed `motion.span`, words not characters, `initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }}`, `transition={{ duration: 0.5, ease: EASE }}`, 4s hold, `overflow: hidden` on the parent with `display: inline-flex`. `aria-live="polite"`.

### True Focus (`TextAnimations/TrueFocus`) — motion

Active word `filter: blur(0)`, others `blur(5px)` with `transition: filter 0.5s ease`; a cornered frame `animate(overlay, { x, y, width, height }, { duration 0.5 })` measured from `getBoundingClientRect` differences; 1s pause between words.

Translation: the frame as a `layoutId` highlight — one absolutely positioned `motion.div` with `layoutId="nav-frame"` rendered inside whichever link is hovered/active; framer animates the move. No blur.

### Navbar highlight (`landing/Navbar`) — CSS + JS

```ts
highlightEl.style.width = `${linkRect.width}px`; highlightEl.style.height = `${linkRect.height}px`;
highlightEl.style.transform = `translateX(${linkRect.left - containerRect.left}px)`; highlightEl.style.opacity = '1';
```
`transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease, opacity 0.2s ease`; on leave, return to `.ln-navbar-link-active` or fade out.

Translation (recipe `SlidingHighlight`): `layoutId` does the measuring for free. As a hairline underline (`height: 1px`, `--ink`) it replaces `.bp-nav-link::after`'s per-link scaleX with one shared line that slides. Return to the active link on leave.

---

## 6. svelte-bits' motion vocabulary

Everything it uses, counted across `src/lib` (for calibrating "what does fluid mean, numerically"):

**CSS curves:** `cubic-bezier(0.23, 1, 0.32, 1)` ×4 (ease-out-quint), `cubic-bezier(0.16, 1, 0.3, 1)` ×4 (ease-out-expo), `cubic-bezier(0.175, 0.885, 0.32, 1.275)` ×4 (back-out, demos only), `cubic-bezier(0.4, 0, 0.2, 1)` ×6 (material standard), `cubic-bezier(0.83, 0, 0.17, 1)` ×3 (ease-in-out-quint), `cubic-bezier(0.25, 0.1, 0.25, 1)` ×4 (= `ease`), `cubic-bezier(0.55, 0, 1, 0.45)` ×2 (ease-in). The site's `--ease (0.22, 0.9, 0.28, 1)` sits between the quint and expo ease-outs — same family, slightly softer landing.

**GSAP eases:** `power2.out` ×19, `power3.out` ×16, `power4.out` ×5, `power3.in` ×4 (exits), `none` ×8 (scrub), `back.out(1.4–1.7)` ×4, `back.inOut(2)` ×1, `elastic.out(1, 0.75)` ×1 (Dot Grid return), `expo` ×3.

**Springs (motion):** `damping 30` ×6 (with `stiffness 100–350`), `stiffness 400/damping 50` (Scroll Velocity), `300/25` (Rotating Text), `250/30` (Counter), `150/12/mass 0.1` (Dock), `100/30/mass 2` (Tilted Card), `260/20` (Stack). Site: `220/34/0.4`.

**Staggers:** `0.05` ×3 (words), `0.03` (chars), `0.08`, `0.09`; DOM staggers `70ms` (cards), `50ms` (Split Text chars), `200ms` (Blur Text words). Site: `0.09` (bullets), `0.1` (gallery), `0.06` (`Reveal` siblings).

**CSS transition durations:** `0.2s` ×42, `0.3s` ×32, `0.15s` ×20, `0.5s` ×13, `0.18s` ×10, `0.4s` ×5, `0.25s` ×5, `0.8s` ×3, `0.6s` ×3. Site: `0.28–0.52s` on hovers, `0.4s` theme change, `0.82–0.9s` entrances.

**Entrance distances:** 100 (Animated Content default), 40 (Split Text), 50 (Blur Text), 24 (landing cards), `100%` (Rotating Text, relative). Site: 22 (`Reveal`), 14 (bullets).

**`prefers-reduced-motion`:** honored in 3 of ~130 files (Logo Loop, one background, one CSS file). The site honors it everywhere; that's a deliberate difference, not an omission to copy.
