---
tags: [component, navigation]
---

# Blueprint Nav and Mark

The site chrome that wraps every route, plus the monogram it's built around. Replaces the old two-tier `SiteHeader` (sticky nav **plus** per-route scroll-spy section nav) — the scroll-spy tier does not exist on `main`.

## `components/blueprint/BpNav.tsx`

`"use client"` (needs `usePathname()`). Rendered once from `app/(site)/layout.tsx`, above every page's `{children}`. Single sticky bar (`.bp-nav`, `position: sticky; top: 0`, translucent paper background + `backdrop-filter: blur(12px)`, bottom hairline).

- **Brand**: a `next/link` to `/` — `<BpMark id="nav" size={34} animated />` plus `.bp-brand-name` "Riley Beenders" (uppercased, letter-spaced, greys→ink on hover).
- **Nav**: a hardcoded array, rendered as `next/link`s inside `.bp-nav-right` next to `<BpThemeToggle />` (the light/dark switch, backed by `ThemeProvider`'s `useTheme()`):

  ```ts
  const NAV = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
    { label: "More Info", href: "/more-info" },
    { label: "About this site", href: "/about-this-site", gradient: true }
  ];
  ```

  Active state is `pathname === item.href` (exact match) → adds `is-active` and `aria-current="page"`. The `.bp-nav-link::after` underline scales in on hover and stays scaled for the active link. The `gradient` flag adds `bp-nav-link--gradient` (see below).
- Under `max-width: 860px` the bar becomes two rows (see **The About-this-site link**).

No section-anchor navigation, no `SECTIONS_BY_ROUTE` map, no scroll listeners — adding a section to a page needs no nav bookkeeping now.

## `components/blueprint/BpMark.tsx`

A pure SVG function component (no `"use client"`) — the RB monogram. Props: `size` (px, default 34), `id` (**required**, unique per instance so multiple marks don't share a gradient id), `animated` (draw the strokes on mount), `float` (gentle idle bob — used on the footer mark), `reversed` (light-on-dark), `bare` (drop the enclosing circle).

Construction: a `viewBox="0 0 40 40"` with an optional circle, then two `data-draw` paths — a vertical stem, and one continuous curve forming **both** bowls of the B without lifting. A `linearGradient` runs along the direction of travel (navy → blue). Stroke weight increases as `size` shrinks, and below `size <= 24` the bowl switches from the gradient to a flat blue and the circle stroke thickens, because the gradient muddies at small sizes. `.bp-mark--animated [data-draw]` runs the `bp-draw` keyframe (stroke-dashoffset) with per-path `--len` / `--delay`; `.bp-mark--float` runs `bp-float`.

Used by: `BpNav` (brand), `app/(site)/page.tsx` footer (`id="footer"`, animated + float).

## Static icon variants

Not React components, but the same monogram, hand-tuned for tiny sizes / crawlers:

- **`app/icon.svg`** — the favicon. A rounded paper rect + the mark with heavier strokes and a solid blue bowl (per the `BpMark` small-size rules). Static file, no build step.
- **`app/apple-icon.tsx`** — iOS home-screen icon (180×180), rendered through `next/og` `ImageResponse`. Opaque `#fbfbf9` background, no self-rounded corners (iOS masks it; a transparent icon renders black).
- **`app/opengraph-image.tsx`** — the 1200×630 social card. Also `next/og`, but reads `assets/fonts/InstrumentSerif-Regular.ttf` off disk because Satori needs real font bytes. Draws the blueprint grid as an SVG `<pattern>` data URI (Satori can't do `repeating-linear-gradient`), a large stemless "ghost B" watermark, the headline "Riley's / Professional Portfolio" in Instrument Serif, a rule, and "rileybeenders.com · Bethlehem, PA".

See [[Design System (Blueprint Press)]] and `assets/fonts/README.md`.

## The About-this-site link (2026-09-17)

`NAV`'s fifth entry, `{ label: "About this site", href: "/about-this-site", gradient: true }`, is drawn in a 9s `background-clip: text` gradient sweep of the palette's own inks (ink → accent → blue → ink; `.bp-nav-link--gradient` + `@keyframes bp-nav-gradient` in `blueprint.css`, 4.5s on hover, frozen on its first frame under reduced motion). **This is still the state of `main`.** The 2026-09-18 impeccable critique flagged gradient text (it also disappears in forced-colors mode, since it relies on `-webkit-text-fill-color: transparent`) and the decision was to make it a flat link like the other four — but that change was never committed: `BpNav.tsx` was last touched on 2026-09-17 and the CSS rule is still there. Flattening it is one line in `BpNav` plus deleting the rule. Under 860px the bar is two rows (a CSS grid with `grid-template-areas: "brand toggle" "links links"`, `.bp-nav-right` set to `display: contents`): the brand and the theme switch share the first row, and the five links sit on one horizontally scrolling row (`overflow-x: auto`, hidden scrollbar, a `mask-image` fade at both edges so a clipped last tab reads as "more"). That took the phone nav from 151px tall to about 95px. See [[About This Site Page]].

## Related
- [[Routes Overview]]
- [[Blueprint UI Components]]
- [[Design System (Blueprint Press)]]
- [[Home]]
