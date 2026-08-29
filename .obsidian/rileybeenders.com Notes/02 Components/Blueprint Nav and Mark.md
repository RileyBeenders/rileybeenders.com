---
tags: [component, navigation]
---

# Blueprint Nav and Mark

The site chrome that wraps every route, plus the monogram it's built around. Replaces the old two-tier `SiteHeader` (sticky nav **plus** per-route scroll-spy section nav) — the scroll-spy tier does not exist on `main`.

## `components/blueprint/BpNav.tsx`

`"use client"` (needs `usePathname()`). Rendered once from `app/(site)/layout.tsx`, above every page's `{children}`. Single sticky bar (`.bp-nav`, `position: sticky; top: 0`, translucent paper background + `backdrop-filter: blur(12px)`, bottom hairline).

- **Brand**: a `next/link` to `/` — `<BpMark id="nav" size={34} animated />` plus `.bp-brand-name` "Riley Beenders" (uppercased, letter-spaced, greys→ink on hover).
- **Nav**: a hardcoded array, rendered as `next/link`s:

  ```ts
  const NAV = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "/contact" },
    { label: "More Info", href: "/more-info" }
  ];
  ```

  Active state is `pathname === item.href` (exact match) → adds `is-active` and `aria-current="page"`. The `.bp-nav-link::after` underline scales in on hover and stays scaled for the active link.
- Under `max-width: 860px` the inner flex stacks and `.bp-nav-links` becomes horizontally scrollable.

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

## Related
- [[Routes Overview]]
- [[Blueprint UI Components]]
- [[Design System (Blueprint Press)]]
- [[Home]]
