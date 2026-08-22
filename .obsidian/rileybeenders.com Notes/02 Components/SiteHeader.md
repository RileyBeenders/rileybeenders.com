---
tags: [component, client, navigation]
---

# SiteHeader

`components/SiteHeader.tsx` — `"use client"`. Rendered once, globally, from `app/layout.tsx`, above every page's `{children}`. Sticky (`position: sticky; top: 0`) two-tier header.

## Tier 1 — primary nav

Always visible. Brand link (`RileyBeenders.com`, styled as a faint watermark) plus a 4-item nav driven by a hardcoded array:

```ts
const PRIMARY_NAV = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/contact" },
  { label: "More Info", href: "/more-info" }
];
```

Active link is styled via `pathname === item.href` (exact match, from `usePathname()`).

## Tier 2 — per-route section nav (scroll-spy)

A second row of buttons only renders when the current route has entries in `SECTIONS_BY_ROUTE`:

| Route | Section ids (in order) |
|---|---|
| `/` | `section-header`, `section-summary`, `section-experience`, `section-education`, `section-skills` |
| `/projects` | `section-projects-header`, `section-projects-work` |
| `/contact` | `section-contact-header`, `section-contact-details` |
| `/more-info` | `section-moreinfo-header`, `section-moreinfo-aboutme`, `section-moreinfo-aboutsite`, `section-moreinfo-tracker` |

**This map is the single source of truth for in-page section navigation and must be kept in sync by hand with the `id` attributes actually present on each page's sections** (see [[Routes Overview]], [[InteractiveResume]], [[ProjectsExplorer and ProjectDetails]]). Adding/renaming a section `id` on a page without updating this map silently breaks that section's scroll-spy entry.

### How the scroll-spy works

On mount (and on `pathname`/section-count change), an effect:

1. `measure()` — for each section id, finds the element, computes its scroll-trigger offset (`elementTop + scrollY - headerHeight`), clamped between `0` and the page's actual max scroll (`document.documentElement.scrollHeight - window.innerHeight`). The clamp exists specifically so a short trailing section (e.g. Skills) whose natural trigger point is below the page's real bottom still becomes active once the user hits the bottom of the page.
2. `currentIndex()` — linear scan for the last section whose start offset is `<= window.scrollY`.
3. `update()` — on scroll (via `requestAnimationFrame`-throttled `onScroll`), recomputes the active index and, if changed, calls `setActiveIndex` and repositions an animated underline (`positionUnderline`) under the active button using `offsetLeft`/`offsetWidth`.
4. `onResize` re-measures and re-syncs immediately (no animation-frame throttle needed since resize is already infrequent).
5. Cleans up both listeners and pending animation frames on unmount / dependency change.

Clicking a section button calls `scrollToSection(id)` → `element.scrollIntoView({ behavior: "smooth", block: "start" })`.

The underline (`.site-header-underline`) starts at `opacity: 0` and only becomes visible (`underlineReady`) after its first successful position calculation, avoiding a flash at `(0,0)` before layout is known.

## Related
- [[Routes Overview]]
- [[InteractiveResume]]
- [[Design System (globals.css)]]
- [[Home]]
