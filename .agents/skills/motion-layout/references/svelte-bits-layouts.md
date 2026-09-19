# svelte-bits layout patterns — the CSS, with numbers

Excerpts from `DavidHDev/svelte-bits` @ `ad44142` (MIT + Commons Clause, © David Haz), `src/lib/components/landing/**` and `src/lib/css/**`, trimmed to the properties that carry the composition. Colors, fonts, and glass are left in so the *material* difference from Blueprint Press is visible; each block ends with what the site keeps.

Contents
1. [Design tokens](#1-design-tokens-variablescss)
2. [Navbar](#2-navbar)
3. [Hero](#3-hero)
4. [Features grid](#4-features-grid)
5. [Marquee](#5-marquee)
6. [Landing wrapper and side fades](#6-landing-wrapper-and-side-fades)
7. [Loader and page reveal](#7-loader-and-page-reveal)
8. [Dropdown / popover](#8-dropdown--popover)
9. [Stepper content wrapper](#9-stepper-content-wrapper)
10. [Animated list masks](#10-animated-list-masks)

---

## 1. Design tokens (`variables.css`)

```css
:root {
  --bg-body: #14110E;   --bg-card: #1D1814;   --bg-hover: #3A312A;
  --border-primary: #322A24;
  --color-primary: #FF8A4C;  --color-accent-muted: #FFB089;
  --text-primary: #fff;  --text-muted: #aaaaaa;  --text-dimmed: #a1a1aa;
  --radius-sm: 10px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 24px; --radius-full: 50px;
  --shadow-dropdown: 0 8px 32px rgba(0, 0, 0, 0.4);
  --transition-fast: 0.15s ease;  --transition-base: 0.2s ease;  --transition-slow: 0.3s ease;
  --gradient-title: linear-gradient(135deg, #fff 0%, #ffb089 20%, #ff8a4c 40%, #ff3e00 60%, #ff8a4c 80%, #fff 100%);
}
@keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
```

Three named transition speeds (0.15 / 0.2 / 0.3s), all on plain `ease`, is the whole timing system for the chrome. Blueprint keeps: the idea of *one* token (`--ease`) reused everywhere. Blueprint has radii of 0–6px and 999px (pills), not 10–24px; hairlines, not shadows.

## 2. Navbar

`Navbar.css`:

```css
.ln-navbar { position: fixed; top: 20px; left: 0; right: 0; z-index: 1500;
  display: flex; flex-direction: column; align-items: center; padding: 0 24px; pointer-events: none; }

.ln-navbar-inner { width: 100%; max-width: 1680px; height: 56px;
  display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 20px;
  border-radius: 16px; border: 1px solid transparent; background: transparent;
  transition: max-width 0.5s ease, background 0.5s ease, border-color 0.5s ease, padding 0.5s ease;
  pointer-events: auto; position: relative; }

.ln-navbar.ln-navbar-scrolled .ln-navbar-inner { max-width: calc(1300px - 24px); background: #14110e; border-color: rgba(255, 255, 255, 0.04); }

.ln-navbar-links { position: relative; display: flex; align-items: center; gap: 8px; }

.ln-navbar-link-highlight { position: absolute; top: 0; left: 0; border-radius: 12px;
  background: rgba(23, 19, 15, 0.45); backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.2), inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  opacity: 0; pointer-events: none;
  transition: transform 0.3s ease, width 0.3s ease, height 0.3s ease, opacity 0.2s ease; }

.ln-navbar-link { font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em;
  padding: 6px 10px; border-radius: 12px; transition: color var(--transition-fast); }

.ln-navbar-hamburger span { transition: transform 0.25s ease, opacity 0.25s ease; }
.ln-navbar-hamburger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
.ln-navbar-hamburger.open span:nth-child(2) { opacity: 0; }
.ln-navbar-hamburger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

.ln-navbar-mobile-menu { animation: ln-menu-slide-in 0.2s ease; }
@keyframes ln-menu-slide-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
```

`Navbar.svelte` (the scroll flag and the highlight):

```ts
const onScroll = () => { scrolled = window.scrollY > 50; };
window.addEventListener('scroll', onScroll, { passive: true });

function positionHighlight(el) {
  const linkRect = el.getBoundingClientRect(), containerRect = linksEl.getBoundingClientRect();
  highlightEl.style.width = `${linkRect.width}px`; highlightEl.style.height = `${linkRect.height}px`;
  highlightEl.style.transform = `translateX(${linkRect.left - containerRect.left}px)`; highlightEl.style.opacity = '1';
}
function handleLinksLeave() { const active = getActiveEl(); active ? positionHighlight(active) : (highlightEl.style.opacity = '0'); }
```

Note the outer `pointer-events: none` / inner `pointer-events: auto` pair — the fixed header's full-width band doesn't block clicks beside the pill. Also: the highlight is re-positioned on route change inside `requestAnimationFrame` so it measures after layout.

**Blueprint keeps:** the scroll flag (threshold 40), the transition list (padding + background + border), the highlight-returns-to-active behavior (via `layoutId`), the hamburger morph if ever needed. Drops the floating pill, glass, uppercase mono.

## 3. Hero

`Hero.css`:

```css
.ln-hero { position: relative; width: 100%; min-height: 100vh; overflow: hidden; }
.ln-hero-dots { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.ln-hero-band { position: absolute; mix-blend-mode: screen; bottom: 0; left: 0; right: 0; height: 150%; pointer-events: none; z-index: 1; }
.ln-hero-bottom-fade { position: absolute; bottom: 0; left: 0; right: 0; width: 100%; height: 100%; display: block; pointer-events: none; z-index: 2; }

.ln-hero-content { position: relative; z-index: 3; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start;
  max-width: 1324px; margin: 0 auto; padding: clamp(120px, 16vw, 240px) 24px 80px; overflow: hidden; }
.ln-hero-left { display: flex; flex-direction: column; gap: 20px; }

.ln-hero-tag { display: flex; align-items: center; gap: 10px; font-size: 12px; width: fit-content; padding: 5px 16px 5px 5px; border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(18, 15, 23, 0.45); backdrop-filter: blur(32px) saturate(1.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25), inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease; }

.ln-hero-headline { font-size: clamp(28px, 5.5vw, 68px); font-weight: 500; line-height: 1.1; letter-spacing: -0.02em; margin: 0; }
.ln-hero-headline-line { white-space: nowrap; }
.ln-hero-description { font-size: 16px; line-height: 1.6; color: rgba(255, 255, 255, 0.606); max-width: 42ch; }
.ln-hero-buttons { display: flex; gap: 12px; margin-top: 4px; }
.ln-hero-btn { font-size: 14px; padding: 12px 24px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); transition: filter var(--transition-fast); }
.ln-hero-btn-primary:hover { filter: brightness(0.85); }

@media (max-width: 1275px) { .ln-hero-content { grid-template-columns: 1fr; gap: 40px; } }
@media (max-width: 1024px) { .ln-hero-content { padding: clamp(110px, 14vw, 160px) 24px 60px; } .ln-hero-headline { font-size: clamp(36px, 6vw, 48px); } }
@media (max-width: 640px)  { .ln-hero-content { padding: clamp(90px, 16vw, 120px) 16px 48px; } .ln-hero-headline { font-size: clamp(30px, 8vw, 40px); } }
```

The bottom fade is an inline SVG so the gradient stops can be tuned precisely:

```svelte
<svg class="ln-hero-bottom-fade" preserveAspectRatio="none" viewBox="0 0 1 1">
  <linearGradient id="hero-bottom-fade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="50%" stop-color="#14110E" stop-opacity="0" />
    <stop offset="68%" stop-opacity="0.1" /> <stop offset="80%" stop-opacity="0.38" />
    <stop offset="90%" stop-opacity="0.72" /> <stop offset="100%" stop-opacity="1" />
  </linearGradient>
  <rect width="1" height="1" fill="url(#hero-bottom-fade)" />
</svg>
```

An eased curve of stops (0 → 0.1 → 0.38 → 0.72 → 1 across the bottom half) rather than a linear two-stop gradient — that's why it reads as atmosphere, not a bar.

**Blueprint keeps:** `clamp()` type and padding; the eased multi-stop fade idea (as a `::after` in `var(--paper)` over ~120px, with stops like `0 / 0.35 / 0.7 / 1` at `0 / 50 / 80 / 100%`); `max-width: 42ch` for a description; `white-space: nowrap` per headline line. Drops the two-column hero, glass tag, shadowed buttons.

## 4. Features grid

`Features.css`:

```css
.ln-features-section { position: relative; width: 100%; padding: 80px 0 100px; }
.ln-features-inner { max-width: 1324px; margin: 0 auto; padding: 0 24px; }
.ln-features-title { font-size: clamp(28px, 4vw, 42px); font-weight: 500; line-height: 1.1; letter-spacing: -0.02em; margin: 0 0 40px; }

.ln-features-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.ln-features-card--span-7 { grid-column: span 7; }  .ln-features-card--span-5 { grid-column: span 5; }
.ln-features-card--span-4 { grid-column: span 4; }  .ln-features-card--span-3 { grid-column: span 3; }

.ln-features-card { background: rgba(18, 15, 23, 0.45); backdrop-filter: blur(32px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; display: flex; flex-direction: column;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.25), inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  transition: border-color 0.3s ease, translate 0.3s ease, opacity 0.5s ease, transform 0.5s ease;
  overflow: hidden; opacity: 0; transform: translateY(24px); }
.ln-features-card.is-visible { opacity: 1; transform: translateY(0); }
.ln-features-card:hover { border-color: rgba(255, 255, 255, 0.15); translate: 0 -2px; }

.ln-features-card-visual { height: 180px; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
.ln-features-card-body { padding: 18px 22px 22px; border-top: 1px solid rgba(255, 255, 255, 0.04); }
.ln-features-card-body h3 { font-size: 15px; font-weight: 600; margin: 0 0 6px; letter-spacing: -0.01em; }
.ln-features-card-body p { font-size: 13px; line-height: 1.55; color: rgba(255, 255, 255, 0.5); margin: 0; }
```

`Features.svelte` (the reveal):

```svelte
<div bind:this={cardEls[i]} class="ln-features-card ln-features-card--span-{card.span}" class:is-visible={visible[i]} style="transition-delay: {i * 70}ms;">
```
```ts
const io = new IntersectionObserver((entries) => { for (const e of entries) { if (!e.isIntersecting) continue; visible[i] = true; io.unobserve(e.target); } }, { threshold: 0.15 });
if (typeof IntersectionObserver === 'undefined') visible = visible.map(() => true);   // fall open, never hide content
```

Two details worth copying: the hover uses the `translate` *property* separately from `transform`, so the entrance transform and the hover lift don't fight; and the IO-missing fallback reveals everything.

**Blueprint keeps:** 12-col with 7/5 or 8/4 spans for an at-a-glance block, `gap: 14px` to match `.bp-section-grid`, the `translate`-vs-`transform` separation, the IO fallback, the 70ms cadence (as 60ms capped at 6), visual/body split with a `--rule` hairline. Drops glass, shadows, 14px radius (use 4px or none).

## 5. Marquee

`Features.css` (marquee block):

```css
.ln-feat-marquee { display: flex; flex-direction: column; gap: 10px; width: 100%; overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent); }
.ln-feat-marquee-track { overflow: hidden; width: 100%; }
.ln-feat-marquee-scroll { display: flex; gap: 8px; width: max-content; animation: ln-marquee 28s linear infinite; }
.ln-feat-marquee-scroll--rev { animation-direction: reverse; }
.ln-feat-marquee:hover .ln-feat-marquee-scroll { animation-play-state: paused; }
@keyframes ln-marquee { to { transform: translateX(-50%); } }

.ln-feat-pill { font-size: 12px; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); white-space: nowrap;
  transition: border-color 0.2s ease, color 0.2s ease; }
.ln-feat-pill:hover { border-color: rgba(255, 255, 255, 0.15); color: rgba(255, 255, 255, 0.85); }
```

`ComponentMarquee.svelte`: `const rowADoubled = [...ROW_A, ...ROW_A];` — the list is rendered twice and the keyframe moves exactly one copy (`-50%`).

**Blueprint keeps:** all of it structurally (recipe `Marquee`), at 50s not 28s, one row, `--rule` borders. Mark the second copy `aria-hidden`.

## 6. Landing wrapper and side fades

`landing.css`:

```css
.landing-wrapper { min-height: 100dvh; position: relative; overflow-x: hidden; }
.landing-wrapper::before { content: ''; position: absolute; top: 0; left: 0; width: 300px; height: 100vh;
  background: linear-gradient(to right, var(--bg-body), transparent); z-index: 2; pointer-events: none; }
.landing-wrapper::after  { /* mirrored on the right */ }
.landing-content { max-width: calc(1200px + 6em); margin: 0 auto; padding: 0 4em; min-height: 1000px; }
@media (max-width: 1024px) { .landing-content { min-height: 700px; } }
@media (max-width: 768px)  { .landing-content { min-height: 600px; } }
```

**Blueprint keeps:** nothing. The grid texture reaches the edges by design; `overflow-x: hidden` on a wrapper would also break `position: sticky` on the nav.

## 7. Loader and page reveal

`LandingLoader.css`:

```css
.ln-loader { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; background: var(--bg-body);
  transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
.ln-loader--hide { opacity: 0; visibility: hidden; pointer-events: none; }
.ln-loader-logo { animation: ln-loader-fade 1.8s ease-in-out infinite; opacity: 0.6; }
@keyframes ln-loader-fade { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.6; } }

.landing-wrapper.ln-loading { opacity: 0; }
.landing-wrapper.ln-loaded  { opacity: 1; }
.landing-wrapper > header   { opacity: 0; transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
.landing-wrapper > .ln-hero { opacity: 0; transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s; }
.landing-wrapper.ln-loaded > header, .landing-wrapper.ln-loaded > .ln-hero { opacity: 1; }
```

**Blueprint keeps:** nothing; noted so nobody re-proposes it. `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo) is the closest svelte-bits curve to `--ease`.

## 8. Dropdown / popover

`Hero.css`:

```css
.ln-hero-code-dropdown-menu { position: absolute; top: calc(100% + 9px); right: -10px; min-width: 140px; padding: 4px;
  background: rgba(18, 15, 23, 0.95); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.06); z-index: 10;
  opacity: 0; transform: translateY(-4px) scale(0.97); pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease; }
.ln-hero-code-dropdown-menu.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
.ln-hero-code-caret { transition: transform 0.25s ease; }
.ln-hero-code-caret.open { transform: rotate(180deg); }
```

Closed on outside `pointerdown` and on `Escape` (from `Hero.svelte` / `Navbar.svelte`).

**Blueprint keeps:** verbatim with `--ease`, paper background, `--rule` border, for any popover (theme menu, Studio).

## 9. Stepper content wrapper

`Stepper.svelte`:

```svelte
<div style="position:relative;overflow:hidden;height:{isCompleted ? 0 : parentHeight}px;transition:height 0.4s cubic-bezier(0.5,1,0.5,1);">
  {#key currentStep}
    <div bind:this={measureRef} style="position:absolute;left:0;right:0;top:0;animation:stepper-enter 0.4s cubic-bezier(0.4,0,0.2,1) forwards;--enter-x:{direction >= 0 ? '-100%' : '100%'};">
```
```css
@keyframes stepper-enter { from { transform: translateX(var(--enter-x)); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
/* progress line between indicators */
.line-fill { transition: width 400ms, background-color 400ms; }
```
```ts
$effect(() => { void currentStep; (async () => { await tick(); if (measureRef) parentHeight = measureRef.offsetHeight; })(); });
```

The incoming step is absolutely positioned inside a wrapper whose height is measured *after* the DOM updates (`tick()`), so the wrapper animates to the new content's height while the content slides in.

**Blueprint keeps:** the case-study panel already does the height animation through `AnimatePresence`; for stepped content use `mode="wait"` and a 24px slide. Progress line as `scaleX`.

## 10. Animated list masks

`AnimatedList.svelte`:

```ts
function handleScroll(e) {
  topGradientOpacity = Math.min(t.scrollTop / 50, 1);
  const bottomDistance = t.scrollHeight - (t.scrollTop + t.clientHeight);
  bottomGradientOpacity = t.scrollHeight <= t.clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
}
```
```svelte
<div class="absolute top-0 left-0 right-0 h-[50px] pointer-events-none" style="background: linear-gradient(to bottom, #14110E, transparent); opacity: {topGradientOpacity}; transition: opacity 0.3s ease;"></div>
<div class="absolute bottom-0 left-0 right-0 h-[100px] pointer-events-none" style="background: linear-gradient(to top, #14110E, transparent); opacity: {bottomGradientOpacity}; transition: opacity 0.3s ease;"></div>
```

Items: `transform: scale(inView ? 1 : 0.7); opacity: inView ? 1 : 0; transition: transform 0.2s ease 0.1s, opacity 0.2s ease 0.1s`, with an IntersectionObserver rooted on the list (`root: listRef, threshold: [0, 0.5, 1]`) and `inView = ratio >= 0.5`.

**Blueprint keeps:** the scroll-position-driven edge masks (in `var(--paper)`) for any clipped list — the top mask appears only once you've scrolled, the bottom one disappears at the end — and the IO-rooted-on-container idea. Scale `0.98`, not `0.7`.
