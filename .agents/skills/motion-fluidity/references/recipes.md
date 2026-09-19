# Recipes: svelte-bits effects at Blueprint amplitude

Complete, copy-ready code for this codebase (Next.js 16 app router, React 19, framer-motion 12, `blueprint.css`). Each recipe names its grammar, its svelte-bits source, its amplitude, and its reduced-motion behavior. All components are `"use client"`. Where a recipe needs `EASE`, declare it locally with the standard comment — don't import it from another component.

```ts
/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;
```

Contents
- [Reveal extensions](#reveal-extensions) (Animated Content · Fade Content)
- [WordReveal](#wordreveal) (Blur Text · Split Text)
- [ScrollWords](#scrollwords) (Scroll Reveal)
- [useInViewOnce + CSS stagger](#useinviewonce--css-stagger) (landing feature cards)
- [Magnet](#magnet)
- [Spotlight](#spotlight) (Spotlight Card · Magic Bento)
- [Tilt](#tilt) (Tilted Card)
- [CountUp](#countup)
- [Marquee](#marquee) (Logo Loop · Component Marquee)
- [Shine](#shine) (Shiny Text)
- [Expandable](#expandable) (Stepper · case-study panel)
- [SlidingHighlight](#slidinghighlight) (Navbar highlight · True Focus frame)
- [Condensing nav](#condensing-nav) (Navbar scrolled state)
- [Hover-media gating](#hover-media-gating)

---

## Reveal extensions

**Grammar:** entrance. **Source:** Animated Content (`direction`, `scale`), Fade Content (`blur`). **Amplitude:** y 22, x 18, scale 0.98, blur 6px. **Reduced motion:** plain `div` (already).

Extend `components/blueprint/Reveal.tsx` rather than adding a sibling. The current file supports `as: "rise" | "rule"`; add `"fade"` and `"slide"`:

```tsx
type RevealProps = {
  children: ReactNode;
  /** Seconds of stagger, for sequencing siblings. */
  delay?: number;
  /** rise: opacity + lift. rule: grows from the left. fade: opacity only (optionally blurred). slide: enters horizontally. */
  as?: "rise" | "rule" | "fade" | "slide";
  /** For as="slide": which side it comes from. */
  from?: "left" | "right";
  /** For as="fade": start blurred (≤ 6px) and sharpen. */
  blur?: boolean;
  /** For as="rise": also grow from this scale (keep ≥ 0.98). */
  scale?: number;
  className?: string;
};

const VARIANTS = {
  rise: (scale = 1) => ({ hidden: { opacity: 0, y: 22, scale }, shown: { opacity: 1, y: 0, scale: 1 } }),
  rule: () => ({ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }),
  fade: (_s = 1, blur = false) => ({
    hidden: { opacity: 0, filter: blur ? "blur(6px)" : "blur(0px)" },
    shown: { opacity: 1, filter: "blur(0px)" }
  }),
  slide: (_s = 1, _b = false, from: "left" | "right" = "left") => ({
    hidden: { opacity: 0, x: from === "left" ? -18 : 18 },
    shown: { opacity: 1, x: 0 }
  })
};
const DURATION = { rise: 0.82, rule: 0.9, fade: 0.7, slide: 0.72 };
```

…and in the body: `variants={VARIANTS[as](scale, blur, from)}`, `transition={{ duration: DURATION[as], delay, ease: [0.22, 0.9, 0.28, 1] }}`. Keep the `viewport` and `style` exactly as they are.

---

## WordReveal

**Grammar:** entrance. **Source:** Blur Text (3-step keyframes with a 2px overshoot), Split Text (word split, fonts-ready). **Amplitude:** blur 6→2→0, y 14→2→0, stagger 0.06s. **Reduced motion:** static text. **Use on:** eyebrows, section indexes, `pj-title`, the footer note. Never prose.

`components/blueprint/WordReveal.tsx`:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement } from "react";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** Kept to a string union so `motion[as]` stays typeable — a generic ElementType can't be indexed into `motion`. */
type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4";

type WordRevealProps = {
  text: string;
  /** Wrapping element; keeps the semantic tag (p, h2, span…). */
  as?: Tag;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Skip the blur and just rise (for small type where blur reads as smearing). */
  blur?: boolean;
  className?: string;
};

const list = (delay: number) => ({
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: delay } }
});

const word = (blur: boolean) => ({
  hidden: { opacity: 0, y: 14, filter: blur ? "blur(6px)" : "blur(0px)" },
  shown: {
    // The middle step passes 2px below rest before settling — Blur Text's overshoot, scaled down.
    opacity: [0, 0.6, 1],
    y: [14, 2, 0],
    filter: blur ? ["blur(6px)", "blur(2px)", "blur(0px)"] : ["blur(0px)", "blur(0px)", "blur(0px)"],
    transition: { duration: 0.7, ease: EASE, times: [0, 0.55, 1] }
  }
});

/**
 * Splits a short line into words and reveals them in sequence on view. Each
 * word is inline-block so the line still wraps naturally; the trailing
 * non-breaking space keeps word gaps inside the animated span.
 */
export function WordReveal({ text, as = "span", delay = 0, blur = true, className }: WordRevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return createElement(as, { className }, text);

  // Downcast from the union of motion components to one member so JSX accepts it.
  const MotionTag = motion[as] as typeof motion.span;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
      variants={list(delay)}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span key={`${w}-${i}`} variants={word(blur)} style={{ display: "inline-block", willChange: "transform, opacity, filter" }} aria-hidden="true">
          {w}
          {i < words.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
```

Usage in `app/(site)/page.tsx`: `<Reveal><p className="bp-section-index">01&nbsp;&nbsp;Summary</p></Reveal>` → `<WordReveal as="p" className="bp-section-index" text="01  Summary" />`. If a heading uses `next/font` with `display: "swap"`, the span widths can shift when the font lands; for the hero name specifically, wrap the call in a `useEffect` gate on `document.fonts.ready` or keep using `Reveal` per line.

---

## ScrollWords

**Grammar:** scroll-linked. **Source:** Scroll Reveal. **Amplitude:** opacity 0.25→1 per word, rotate 2°→0, no blur. **Reduced motion:** static. **Use on:** one short passage per page (≤ 40 words) — the summary's first sentence or the footer note.

`components/blueprint/ScrollWords.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

type ScrollWordsProps = {
  text: string;
  className?: string;
  /** Degrees the block starts rotated by (Scroll Reveal uses 3; 2 is enough on paper). */
  rotate?: number;
};

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  // Each word owns a slice of the block's progress — this is Scroll Reveal's `stagger: 0.05` under scrub.
  const opacity = useTransform(progress, range, [0.25, 1]);
  return (
    <motion.span style={{ opacity, display: "inline-block" }}>
      {children}&nbsp;
    </motion.span>
  );
}

/**
 * Words brighten one after another as the block scrolls up the viewport, and
 * the block itself straightens from a slight tilt. Tied to scroll, not time,
 * so it reads as the reader's own pace. Always a <p> — it's for a passage, and
 * a fixed tag keeps the ref type exact (React 19's RefObject is invariant).
 */
export function ScrollWords({ text, className, rotate = 2 }: ScrollWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(/\s+/);

  const { scrollYProgress } = useScroll({
    target: ref,
    // Starts as the block's top crosses 85% down the viewport, done by 40%.
    offset: ["start 0.85", "start 0.4"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });
  const rotateZ = useTransform(progress, [0, 1], [rotate, 0]);

  // The ref must still land on a node: useScroll above already holds it, and framer throws if it never hydrates.
  if (reduced) return <p ref={ref} className={className}>{text}</p>;

  return (
    <motion.p ref={ref} className={className} style={{ rotateZ, transformOrigin: "0% 50%" }} aria-label={text}>
      {words.map((w, i) => (
        <Word key={`${w}-${i}`} progress={progress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </motion.p>
  );
}
```

---

## useInViewOnce + CSS stagger

**Grammar:** entrance. **Source:** landing feature cards (`.is-visible` + `transition-delay: i*70ms`). **Amplitude:** y 16, 0.5s, 60ms per item capped at 6. **Reduced motion:** blanket CSS rule. **Use on:** lists of 6–20 small items (`.bp-pill`, `.bp-cert`) where a framer wrapper per item is overkill.

Hook, `lib/useInViewOnce.ts`:

```ts
"use client";

import { useEffect, useRef, useState } from "react";

/** True once the element has been ≥ `amount` visible, then stays true. SSR-safe; falls open if IntersectionObserver is missing. */
export function useInViewOnce<T extends HTMLElement>(amount = 0.2, margin = "0px 0px -60px 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); io.disconnect(); }
    }, { threshold: amount, rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [amount, margin]);

  return { ref, inView };
}
```

CSS in `blueprint.css` next to `.bp-pills`:

```css
/* Pills arrive one after another once the group is on screen (see lib/useInViewOnce.ts). */
.bp-pills[data-stagger] .bp-pill {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease), border-color 0.34s ease, color 0.34s ease;
  transition-delay: calc(min(var(--i, 0), 6) * 60ms);
}
.bp-pills[data-stagger].is-in .bp-pill { opacity: 1; transform: none; transition-delay: calc(min(var(--i, 0), 6) * 60ms), 0s, 0s; }
```

Markup: `<div ref={ref} className={`bp-pills${inView ? " is-in" : ""}`} data-stagger>` and each pill `style={{ ["--i" as string]: index }}`. The `min(var(--i), 6)` cap means late pills don't wait a second to appear. The blanket reduced-motion rule zeroes the transition so pills just appear.

---

## Magnet

**Grammar:** pointer. **Source:** Magnet (`padding`, `magnetStrength`). **Amplitude:** ≤ 5px (strength 8, padding 24). **Spring:** Dock's `150/12/0.1`. **Reduced motion / touch:** renders children unwrapped. **Use on:** `.bp-btn`, `BackToTop`, `BpThemeToggle`. Never on text links.

`components/blueprint/Magnet.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

type MagnetProps = {
  children: ReactNode;
  /** Divides the cursor offset — 8 keeps a 40px button inside ~5px. svelte-bits' default of 2 is for demos. */
  strength?: number;
  /** Extra px around the child that still counts as "near". */
  padding?: number;
  className?: string;
};

const SPRING = { stiffness: 150, damping: 12, mass: 0.1 };

/**
 * The child leans toward the cursor while it's nearby and springs back when
 * it leaves. The wrapper, not window, owns the listener, so the effect costs
 * nothing until the cursor is actually over it.
 */
export function Magnet({ children, strength = 8, padding = 24, className }: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState(false);
  const x = useSpring(useMotionValue(0), SPRING);
  const y = useSpring(useMotionValue(0), SPRING);

  useEffect(() => {
    setPointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (reduced || !pointer) return <div className={className}>{children}</div>;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) / strength);
    y.set((e.clientY - (r.top + r.height / 2)) / strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <div ref={ref} className={className} style={{ display: "inline-block", padding, margin: -padding }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div style={{ x, y, willChange: "transform" }}>{children}</motion.div>
    </div>
  );
}
```

The negative margin cancels the padding so layout doesn't change; the padding is the activation zone.

---

## Spotlight

**Grammar:** pointer. **Source:** Spotlight Card (radial at cursor, opacity 0→0.6/0.5s), Magic Bento (`--glow-x/y` custom-property pattern). **Amplitude:** 5% ink, opacity 0→1 over 0.4s. **Reduced motion / touch:** the `::before` never shows (hover-gated). **Use on:** `.bp-cert`, `.bp-role`, project media frames.

CSS in `blueprint.css` (add to the certificate block; reuse the class elsewhere):

```css
/* A faint wash of ink follows the cursor across the card — light on paper, not a lamp. Position comes from lib/useSpotlight.ts. */
.bp-spot { position: relative; }
.bp-spot::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(240px circle at var(--sx, 50%) var(--sy, 50%), color-mix(in srgb, var(--ink) 5%, transparent), transparent 70%);
  opacity: 0;
  transition: opacity 0.4s var(--ease);
  pointer-events: none;
}
@media (hover: hover) and (pointer: fine) {
  .bp-spot:hover::before { opacity: 1; }
}
```

Hook, `lib/useSpotlight.ts`:

```ts
"use client";

import { useCallback, type PointerEvent } from "react";

/** Writes the cursor position into --sx/--sy on the element so CSS can draw the spotlight. No React state per move. */
export function useSpotlight() {
  return useCallback((e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }, []);
}
```

Markup: `<div className="bp-cert bp-spot" onPointerMove={onSpotMove}>`. Works on server-rendered markup as long as the parent is a client component (or wrap the handler in a tiny client component).

---

## Tilt

**Grammar:** pointer. **Source:** Tilted Card. **Amplitude:** ±4°, scale 1.01. **Spring:** Tilted Card's `100/30/2` (slow, heavy). **Reduced motion / touch:** unwrapped. **Use on:** `.pj-shot` frames, `.bp-cert`. Never on text.

`components/blueprint/Tilt.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const SPRING = { stiffness: 100, damping: 30, mass: 2 };

/** Leans the card a few degrees toward the cursor. Heavy spring so it never feels twitchy. */
export function Tilt({ children, amplitude = 4, className }: { children: ReactNode; amplitude?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [pointer, setPointer] = useState(false);
  const rx = useSpring(useMotionValue(0), SPRING);
  const ry = useSpring(useMotionValue(0), SPRING);
  const scale = useSpring(useMotionValue(1), SPRING);

  useEffect(() => { setPointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches); }, []);

  if (reduced || !pointer) return <div className={className}>{children}</div>;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const ox = e.clientX - r.left - r.width / 2;
    const oy = e.clientY - r.top - r.height / 2;
    rx.set((oy / (r.height / 2)) * -amplitude);
    ry.set((ox / (r.width / 2)) * amplitude);
  };

  return (
    <div ref={ref} className={className} style={{ perspective: 900 }} onPointerMove={onMove}
         onPointerEnter={() => scale.set(1.01)} onPointerLeave={() => { rx.set(0); ry.set(0); scale.set(1); }}>
      <motion.div style={{ rotateX: rx, rotateY: ry, scale, transformStyle: "preserve-3d", willChange: "transform" }}>
        {children}
      </motion.div>
    </div>
  );
}
```

---

## CountUp

**Grammar:** state. **Source:** Count Up (`damping = 20 + 40/d`, `stiffness = 100/d`, `Intl.NumberFormat`). **Reduced motion:** renders the final value. **Use on:** any stat (years, project count, image count).

`components/blueprint/CountUp.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";

type CountUpProps = {
  to: number;
  from?: number;
  /** Seconds; sets the spring, as in svelte-bits' Count Up. */
  duration?: number;
  /** Decimal places to show. Defaults to whatever `to` has. */
  decimals?: number;
  className?: string;
};

function format(v: number, decimals: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

/** A number that springs from `from` to `to` the first time it scrolls into view. Tabular digits so the width doesn't jitter. */
export function CountUp({ to, from = 0, duration = 2, decimals, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const places = decimals ?? (String(to).split(".")[1]?.length ?? 0);

  const raw = useMotionValue(from);
  const value = useSpring(raw, { stiffness: 100 / duration, damping: 20 + 40 / duration });

  useEffect(() => { if (inView) raw.set(to); }, [inView, raw, to]);
  useMotionValueEvent(value, "change", (v) => { if (ref.current) ref.current.textContent = format(v, places); });

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }} aria-live="polite">
      {format(reduced ? to : from, places)}
    </span>
  );
}
```

---

## Marquee

**Grammar:** ambient. **Source:** Logo Loop (doubled track, edge fade, pause on hover, reduced-motion stop), Component Marquee (two rows, opposite directions). **Amplitude:** 50s per loop. **Reduced motion:** the blanket rule stops it and the first N items sit still. **Use on:** toolchain pills, if at all — pills are content and a static grid is the default.

CSS in `blueprint.css`:

```css
/* An endless slow drift of pills. The track holds the list twice; the keyframe moves exactly one copy's width. */
.bp-marquee {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
}
.bp-marquee-track {
  display: flex;
  gap: 8px;
  width: max-content;
  animation: bp-marquee 50s linear infinite;
}
.bp-marquee[data-reverse] .bp-marquee-track { animation-direction: reverse; }
.bp-marquee:hover .bp-marquee-track { animation-play-state: paused; }
@keyframes bp-marquee { to { transform: translateX(-50%); } }
```

Markup (server component is fine):

```tsx
<div className="bp-marquee" aria-label="Toolchain">
  <div className="bp-marquee-track">
    {[...items, ...items].map((item, i) => (
      <span className="bp-pill" key={`${item}-${i}`} aria-hidden={i >= items.length}>{item}</span>
    ))}
  </div>
</div>
```

The `gap` must be included in the copy width for a seamless loop — with a flex `gap` of 8px and a doubled list, the first copy plus its trailing gap is exactly 50% of the track, so `translateX(-50%)` lands on the seam.

---

## Shine

**Grammar:** ambient. **Source:** Shiny Text. **Amplitude:** ink-soft → ink → ink-soft, 7s, pause on hover. **Reduced motion:** blanket rule (text shows in `--ink-soft`). **Use on:** one eyebrow or the footer URL.

```css
/* A slow band of ink passes along the text (see Shiny Text in svelte-bits, CSS-only here). */
.bp-shine {
  background-image: linear-gradient(120deg, var(--ink-soft) 0%, var(--ink-soft) 35%, var(--ink) 50%, var(--ink-soft) 65%, var(--ink-soft) 100%);
  background-size: 200% auto;
  background-position: 150% center;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: bp-shine 7s linear infinite;
}
.bp-shine:hover { animation-play-state: paused; }
@keyframes bp-shine { to { background-position: -50% center; } }
```

If the element already has a `color`, the `-webkit-text-fill-color: transparent` overrides it; set the gradient stops to that color's token.

---

## Expandable

**Grammar:** state. **Source:** Stepper (measured height 0.4s), the site's own case-study panel. **Reduced motion:** conditional render without motion. **Use on:** any show/hide section.

The pattern already in `ProjectEntry.tsx`, extracted:

```tsx
"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

export function Expandable({ open, id, children, className }: { open: boolean; id: string; children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return open ? <div id={id} className={className}>{children}</div> : null;
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div id={id} key="panel" className={className} style={{ overflow: "hidden" }}
          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.55, ease: EASE }}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

Pair it with a toggle whose icon rotates via CSS (`.pj-toggle-icon.is-open { transform: rotate(180deg) }` already exists).

---

## SlidingHighlight

**Grammar:** state. **Source:** Navbar link highlight (one element moves to the hovered link, returns to the active one), True Focus frame. **Amplitude:** a 2px accent line. **Reduced motion:** falls back to the per-link `::after`. **Use on:** `BpNav`.

In `BpNav.tsx`, track `hovered` and render a `layoutId` line inside whichever link is hovered, else the active one:

```tsx
const [hovered, setHovered] = useState<string | null>(null);
const reduced = useReducedMotion();
const lineOn = hovered ?? pathname;
…
<nav className="bp-nav-links" aria-label="Site" onMouseLeave={() => setHovered(null)}>
  {NAV.map((item) => (
    <Link key={item.href} className={pathname === item.href ? "bp-nav-link is-active" : "bp-nav-link"} href={item.href}
          aria-current={pathname === item.href ? "page" : undefined} onMouseEnter={() => setHovered(item.href)} suppressHydrationWarning>
      {item.label}
      {!reduced && lineOn === item.href && (
        <motion.span className="bp-nav-line" layoutId="bp-nav-line" aria-hidden="true"
                     transition={{ type: "spring", stiffness: 300, damping: 25 }} />
      )}
    </Link>
  ))}
</nav>
```

CSS: `.bp-nav-line { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--accent); }` and, when the sliding line is present, scope the old `::after` so it only renders under reduced motion (e.g. `.bp-nav-links[data-static] .bp-nav-link::after { … }` and set `data-static` when `reduced`). framer measures and animates the move between links.

---

## Condensing nav

**Grammar:** state. **Source:** Navbar `scrolled = scrollY > 50` → tighter, solid, bordered inner, all 0.5s. **Amplitude:** padding 16 → 10px, brand name fades to 0.7. **Reduced motion:** blanket rule (snaps). **Use on:** `BpNav`.

`BpNav.tsx` gets a scroll flag (same shape as `BackToTop.tsx`):

```tsx
const [scrolled, setScrolled] = useState(false);
useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
…
<header className={`bp-nav${scrolled ? " is-scrolled" : ""}`}>
```

CSS (the nav already has `transition: background-color 0.4s ease, border-color 0.4s ease`; add `padding` to `.bp-nav-inner`'s transition):

```css
.bp-nav-inner { …; transition: padding 0.4s var(--ease); }
.bp-nav.is-scrolled .bp-nav-inner { padding-block: 10px; }
.bp-nav.is-scrolled { background: color-mix(in srgb, var(--paper) 92%, transparent); }
.bp-nav.is-scrolled .bp-brand-name { opacity: 0.7; }
```

Read `scrollY` once on mount so a page loaded mid-scroll starts in the right state.

---

## Hover-media gating

Every pointer recipe above checks `(hover: hover) and (pointer: fine)`. In CSS wrap the hover rule; in components read it once on mount into state (never during render — it's `window`). Touch devices get the static version, which must be complete on its own: svelte-bits gates Magic Bento at 768px width and prints a warning in Tilted Card; here the gate is capability-based and silent.

```ts
const [pointer, setPointer] = useState(false);
useEffect(() => { setPointer(window.matchMedia("(hover: hover) and (pointer: fine)").matches); }, []);
```
