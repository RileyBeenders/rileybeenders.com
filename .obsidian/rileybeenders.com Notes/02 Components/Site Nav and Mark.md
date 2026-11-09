---
tags: [component, navigation]
---

# Site Nav and Mark

This note covers the site chrome that wraps every route, and the monogram it is built around. Since the Blue Sheet redesign (2026-11-08), the chrome is a floating pill with three links; Clean Bench (2026-11-09) kept it and made it frosted glass. It replaced Blueprint Press's full-width five-link `BpNav` (Home · Projects · Contact · More Info · About this site, with the gradient-swept About tab), which is described in [[Blueprint Press (2026-08 to 2026-11)]].

## `components/bench/SiteNav.tsx`

`"use client"` (it needs `usePathname()` and a scroll listener). It is rendered once from `app/(site)/layout.tsx`, above `.page`, as `<SiteNav name={resumeData.person.name} />`. The name is passed in by the server layout, so no other part of `header.json` reaches the browser bundle.

- **Structure.** `<header class="nav">` holds `<div class="nav-pill">`, which contains:
  - the brand: a `next/link` to `/` with `<BpMark id="nav" size={30} animated />` and `.nav-brand-name` (Site Settings → Person → Name, in the sub-header face at 600), aria-labelled "`<name>`, home";
  - `<nav class="nav-links" aria-label="Site">`;
  - `<BpThemeToggle />`.
- **Links.** The routes are fixed and the labels are data (`ui.nav` from `data/site/interface.json`, Studio: Navigation & labels → Menu):

  ```ts
  const NAV = [
    { label: ui.nav.home, href: "/" },
    { label: ui.nav.projects, href: "/projects" },
    { label: ui.nav.contact, href: "/contact" }
  ];
  ```

  `isActive()` is an exact match for `/`. For the other links it is the path or anything under it, so `/projects/<id>` (including the site's own entry) lights Projects. An active link gets `is-active` and `aria-current="page"`.
- **The sliding tint.** The active link renders a `motion.span.nav-link-bg`: `--tint` with an accent-tinted 22% border. It has a shared `layoutId="nav-active"` and a spring (`stiffness 420, damping 38, mass 0.6`), so the tint slides between links on navigation. Under reduced motion the `layoutId` is dropped and the tint simply appears.
- **Condensing.** A passive scroll listener sets `data-condensed` once `scrollY > 28`. In `bench.css`:
  - `.nav` is `position: sticky; top: 0`, centred, with `pointer-events: none` except on the pill. Its top padding goes from 14 to 8px when condensed.
  - `.nav-pill` is a 999px frosted glass pill at 66% white with `backdrop-filter: blur(18px) saturate(1.4)` and `--shadow-sm`. When condensed it moves to 84% white on `--shadow`.
- **Phone.** Under 760px the pill drops the brand name, and the links tighten to 8×11px padding at 13.5px.

There is no section-anchor nav and no scroll-spy. `/about-this-site` and `/more-info` are not in the nav; they redirect to `/projects/rileybeenders-com` (see [[Routes Overview]]).

## `components/blueprint/BpThemeToggle.tsx` + `ThemeProvider.tsx`

These are kept from Blueprint Press. `ThemeProvider` owns `data-theme` on `<html>` (the root layout's `beforeInteractive` script stamps it before first paint) and the `localStorage` preference; `useTheme()` returns `{ theme, toggleTheme }`. The toggle is a 48×28 switch (`.bp-theme-toggle` in `bench.css`'s theme-toggle section), sitting at the right end of the pill. Its thumb is painted with `--accent-fill`, so in dark mode it is the deeper blue.

## `components/blueprint/BpMark.tsx`

A pure SVG function component (no `"use client"`), the RB monogram. Props:

- `size` (px, default 34);
- `id`, **required** and unique per instance, so multiple marks don't share a gradient id;
- `animated` (draw the strokes on mount);
- `float` (a gentle idle bob);
- `reversed` (light-on-dark);
- `bare` (drop the enclosing circle).

Construction: a `viewBox="0 0 40 40"` with an optional circle, then two `data-draw` paths. One is a vertical stem; the other is one continuous curve that forms **both** bowls of the B without lifting. A `linearGradient` runs along the direction of travel. Stroke weight increases as `size` shrinks. At `size <= 24` the bowl switches from the gradient to a flat blue and the circle stroke thickens, because the gradient muddies at small sizes. `.bp-mark--animated [data-draw]` runs the `bp-draw` keyframe (7.3s loop, per-path `--len` / `--delay`), `[data-chase]` runs `bp-chase`, and `.bp-mark--float` runs `bp-float`. These keyframes live in `sheet.css`'s marks section.

Used by:

| Where | Instance |
|---|---|
| `SiteNav` brand | `id="nav"`, 30px, animated |
| The hero tile's avatar | `id="hero"`, 46px, animated |
| `ProjectCard` typographic cover, for an entry with no photo | `id="cover-<id>"`, 54px, animated |
| `CursorMark` | `id="cursor"`, 24px |
| `SiteFooter` | `id="footer"`, 44px, animated + float |

## Static icon variants

These are not React components, but the same monogram, hand-tuned for tiny sizes and crawlers:

- **`app/icon.svg`**: the favicon. A rounded paper rect plus the mark, with heavier strokes and a solid blue bowl (per the `BpMark` small-size rules). It is a static file with no build step.
- **`app/apple-icon.tsx`**: the iOS home-screen icon (180×180), rendered through `next/og` `ImageResponse`. It has an opaque background and no self-rounded corners (iOS masks it, and a transparent icon renders black).
- **`app/opengraph-image.tsx`**: the 1200×630 social card. Also `next/og`, but it reads `assets/fonts/InstrumentSerif-Regular.ttf` off disk, because Satori needs real font bytes. It draws the blueprint grid as an SVG `<pattern>` data URI, a large stemless "ghost B" watermark, the `page.json` `meta.shareTitle` on two lines in Instrument Serif, a rule, and `footer.siteLink.text` · `person.location`.

All three carry literal copies of the active palette (ink `#111318`, accent `#2457e6`, white `#ffffff`), updated by hand for Clean Bench under `DESIGN.md`'s Hard-Copy Rule; `components/GanttChart.tsx` carries the same values. The social card still draws the blueprint ruling and sets its title in Instrument Serif, the one place the drafting look survives; restyling it is a follow-up. See [[Design System (Clean Bench)]] and `assets/fonts/README.md`.

## Related
- [[Routes Overview]]
- [[Bench Components (Home Page)]]
- [[Design System (Clean Bench)]]
- [[Blueprint Press (2026-08 to 2026-11)]]
- [[Home]]
