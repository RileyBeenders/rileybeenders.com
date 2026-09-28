---
tags: [component, client]
---

# Blueprint UI Components

The `components/blueprint/*` pieces that aren't the nav/mark, plus `components/content/EmphasizedText.tsx`. All the pre-reskin interactive components (`InteractiveResume`, `ProjectsExplorer`, `ProjectDetails`, `BulletList`, `ProofPanel`, `AdditionalInfoDrawer`) were deleted — none of them exist on `main`; the project gallery and lightbox were rebuilt under `components/projects/` (see [[Projects Route (BpComingSoon)]]).

## `components/blueprint/BpActions.tsx`

`"use client"`. The action button row under the hero on `/` and `/contact`. Takes `{ data: ResumeData }`.

- **Download PDF** — a 3-state machine (`idle | loading | error`):
  1. Click → `state = "loading"`, button `disabled` + `aria-busy`, label "Preparing PDF…".
  2. Dynamically `import("@/ResumeBuilder/downloadPublishedResume")` (kept out of the main bundle) and calls `downloadPublishedResumePdf(data.resumePdfPath)` (`resumePdfPath` = `"/api/resume-pdf"` from `header.json`).
  3. Success → back to `idle`. Failure → `error`, logs, and renders an inline `.bp-error` `role="alert"` ("The PDF could not be created. Please try again.").
  - Styled `.bp-btn.bp-btn--solid` (red), with a looping `.bp-sheen` highlight while idle and a downward `ArrowDown` SVG.
- **Email / LinkedIn / GitHub** — plain `.bp-btn` anchors (`mailto:` / `data.person.linkedin` / `data.person.github`, the latter two `target="_blank" rel="noreferrer"`), each with a right-pointing `ArrowRight` SVG that nudges on hover.

See [[Resume PDF Pipeline]] for what happens after the click.

## `components/blueprint/Reveal.tsx`

`"use client"`. A `framer-motion` scroll-entrance wrapper used around nearly every block on every page. Props: `children`, `delay` (seconds of stagger), `as` (`"rise"` default, or `"rule"`), `className`.

- `useReducedMotion()` → if reduced, renders a plain `<div>` with no animation.
- `rise`: `hidden { opacity: 0, y: 22 }` → `shown { opacity: 1, y: 0 }`. `rule`: `hidden { scaleX: 0 }` → `shown { scaleX: 1 }` with `transformOrigin: left center` (for the `.bp-rule` dividers).
- `whileInView` with `viewport={{ once: true, amount: 0.12, margin: "0px 0px -60px 0px" }}` — fires once, as soon as 12% of the element is in view (lowered from 25% / −80px on 2026-09-19 so tall role entries appear sooner on phones).
- One shared easing curve (`[0.22, 0.9, 0.28, 1]`) so all page motion reads as a single hand — the same curve is `--ease` in `blueprint.css`. Durations per variant: rise 0.82s, rule 0.9s, fade 0.7s, slide 0.72s.

## `Reveal` variants (2026-09-18)

`Reveal` grew two more `as` values alongside `rise` and `rule`: `fade` (opacity only, optional `blur` prop capped at 6px, 0.7s) and `slide` (18px in from `from="left" | "right"`, 0.72s). Same curve, same `viewport` defaults, same plain-`div` reduced-motion branch. The About page uses `fade` for its behind-the-site demos so a live replica doesn't lurch into place.

## `components/blueprint/PageSpine.tsx` (2026-09-15)

`"use client"`. Wraps the home page's four content sections (`.hp-list`) and draws a hairline (`.hp-spine-track`) down their left edge with an accent fill (`.hp-spine-fill`) whose `scaleY` follows `useScroll({ target, offset: ["start 0.75", "end end"] })` through a `useSpring` (`stiffness 220, damping 34, mass 0.4`) — so it settles rather than tracking the scrollbar 1:1. The `"end end"` offset (not the project list's `"end 0.4"`) is deliberate: the wrapper's bottom sits at the footer, so the page runs out of scroll before its bottom could reach 40% of the viewport. Purely decorative; reduced motion shows it fully drawn. Sibling of `components/projects/ProjectListSpine.tsx`, which does the same for the project entries.

## `components/blueprint/HeroRibbon.tsx` (2026-09-15)

`"use client"`. The faint B-bowl flourish behind the home hero's `h1` (`.bp-hero-ribbon`, a 200×240 `viewBox` path stroked in `--ink`). The stroke-draw itself is CSS (`bp-draw` in `blueprint.css`), but CSS can't replay a finished animation, so the component remounts the `<path>` via a `key` whenever the `.bp-hero` section (not the ribbon's own mostly-empty box) re-enters the viewport at ≥60%, ignoring the observer's initial report and holding a 2.1s cooldown that matches the animation's delay + duration so a mid-replay crossing can't stack a second restart.

## `components/blueprint/BpRelocationBadge.tsx` (2026-09-15, revised 2026-09-19)

`"use client"`. The "Open to relocation" pill, in two exports, both gated on `resumeData.visibility.openToRelocation`:

- **`BpHeroRelocationBadge`** — rendered by the home page inside `.bp-hero`. It is a single always-`position: fixed` element anchored at the viewport's top-right and moved with an `x`/`y` transform, so its two homes are one tween: at rest it sits level with the rule under the heading, flush with the hero content's right edge (`useHeroRestingSpot()` measures `.bp-hero .bp-shell` and the `h1` from the real DOM, corrected for `scrollY`, re-measured on resize and once web fonts swap in); once `scrollY > 48px` — or on any viewport under 860px, where the name spans the whole hero — it hops to the same bottom-right corner the other pages dock it in (`HOP_SPRING`: stiffness 170, damping 18, mass 1) with a small roll (`0 → −14° → 10° → −5° → 0`, 0.6s). Reduced motion places it with a static transform.
- **`BpFixedRelocationBadge`** — rendered by the site layout: the plain docked `.bp-badge` on every page except `/` (`usePathname()`); `.bp:has(.pj) .bp-badge` hides it on the projects and About pages, where `BackToTop` and the page's own controls own the corners.
- **`BadgeLabel`** (shared) — the accent dot with its `bp-ring` ping, and a looping **typewriter**: the label types in at ~40ms + jitter per letter, holds 2.6s with a blinking caret, deletes two letters at a time every 160ms, pauses 1s empty, repeats. An invisible ghost copy reserves the full width so the pill never resizes, and an `sr-only` copy carries the text for assistive tech. Under reduced motion the label is static.

## `components/blueprint/BackToTop.tsx`

`"use client"`. The bottom-left "Back to Top" control (`.bp-top`), shown (`is-shown`, focusable) once `scrollY` passes 80% of the viewport height; `aria-hidden` and `tabIndex −1` otherwise; smooth-scrolls to the top. Used by `/`, `/projects` and `/about-this-site`. Moved here from `components/projects/` on 2026-09-15. (`next.config.mjs` moves the Next dev overlay to the bottom-right so it doesn't cover it.)

## `components/blueprint/StudioLink.tsx` (2026-09-19)

`"use client"`, development only. The bottom-right "Edit in Studio" pill (`.bp-studio-link`, the `.bp-top` vocabulary: 11px uppercase, tracked, hairline, blurred paper) that opens the Studio on the file behind the current page — `STUDIO_FILE_FOR_PAGE` pairs each route with a Studio key exactly as `RAIL` in `studio/ui/schema.js` does, and on `/projects#project-<id>` the link becomes `#projects/<id>` so the entry itself opens. It reads `process.env.NEXT_PUBLIC_STUDIO_URL` (set only by `npm run site`) and renders nothing without it, on a non-loopback host (a phone can't reach the Studio), or on a route it doesn't know; the site layout loads it through a `next/dynamic` import that exists only when `process.env.NODE_ENV === "development"` (a static import would keep the client module in the production bundle even with the JSX guarded), so production builds contain none of it — verified with a grep of `.next/static` after `next build`. `target="rileybeenders-studio"` reuses one Studio window, and because only the hash changes the Studio never reloads. `.bp:has(.bp-badge):not(:has(.pj)) .bp-studio-link` lifts it 54px above the docked relocation badge where that shows; `scripts/capture-site-screenshots.mjs` hides it; print hides it.

## `components/blueprint/BpThemeToggle.tsx` + `ThemeProvider.tsx`

`"use client"`, added with dark mode on 2026-09-12. `ThemeProvider` (mounted by the site layout) owns `data-theme` on `<html>` — a blocking init script in the root layout stamps it before hydration — and the `localStorage` preference; `useTheme()` returns `{ theme, toggleTheme }`. `BpThemeToggle` is the switch in the nav. Components that must know the mode in JS (the About page's themed captures, the Studio demo) read `useTheme()`; everything else is CSS on `html[data-theme="dark"]`.

## `components/content/EmphasizedText.tsx` (2026-09-16)

Server-safe (no directive). Takes `text`, `phrases` (a bullet's `emphasis: string[]`, picked in the Studio) and a required `className`, and returns the text with each exact phrase wrapped in a `<span className>` — on the resume that class is `.bp-bullet-emphasis`, whose CSS gives the phrase the accent on hover. When selections overlap the longest phrase wins, so "motion control" beside "motion" still yields one span; phrases that don't occur verbatim are ignored, so a Studio typo can't break a bullet. Used by the home page's experience bullets (30 of them carry phrases), `ProjectEntry`, and `AboutSiteStory`.

## `components/blueprint/BulletLink.tsx` (2026-09-26)

Server-safe (no directive). The "READ MORE ↗" button at the end of a home-page experience bullet whose project is published: a `next/link` `.bp-bullet-link` with `data-motion` (the Studio's Home page → Read more button, `ReadMoreAnimation`), `aria-label="See the <project> project"`, and `suppressHydrationWarning`. Its markup is the same for every variant except where one needs more: `roll` splits the label into one span per character (`data-ch` for the rolled-in copy, `--c` for the stagger), `glint` adds an `aria-hidden` `.bp-bullet-link-glint` band carrying `--i` (the link's place on the page, mod 5). Two arrows always sit stacked in `.bp-bullet-link-arrow`; only `launch` shows the second. Nothing variable goes in the anchor's own `style`, since the browser extension that stamps anchors before hydration rewrites it (see `check-anchor-hydration.mjs` in [[Build Tooling and Config]]). The Studio's picker builds the same markup (`readMorePreview` in `studio/ui/fields.js`), so the two change together. Styles: `app/(site)/bullet-link.css`, see [[Design System (Blueprint Press)]]. An optional `ariaLabel` replaces the bullet's "See the … project" where the link sits elsewhere (a linked skill's card).

## `components/blueprint/LinkedSkill.tsx` (2026-09-26)

`"use client"`. A home-page skill linked to a published project or proof (see [[Career Content]]): `.bp-pill.bp-pill--linked` with `data-border` / `data-reveal` from Home page → Linked skills and `--k` (its place among linked skills, mod 7) as the border loop's beat. Inside: the name; a `next/link` `.bp-pill-more` (aria-labelled "<skill>: see <target> (project)") holding the lucide link-2 chain icon and a `.bp-pill-more-label` with the site's Read more label; and an `aria-hidden` `.bp-skill-card` holding only the target's name and "Project · category" / "Proof · project". Since 2026-09-26 the icon is the link and the card has no button: on hover or focus the icon turns a half turn (−180°, 0.34s), then after 0.24s the label opens from 0 to `--more-w` and the link fills in as a small accent button (11px, the site's Read more in miniature); closing folds the label first, then turns the icon back. Opening would widen the pill by `--more-w` + 22px (button padding and gap) and reflow the pills after it, wrapping a line-end pill away from the pointer, so the hovered pill takes the same amount back as a negative `margin-right` on the same timing and grows over its neighbour instead (measured: 271 → 370px wide, next pill fixed at x 404). The `BulletLink` animation variants no longer apply to skills. Its only script is `place()` on pointer-enter and focus: it measures the label into `--more-w`, then the opened pill and card against the window (12px from its edges) and sets `data-align` (card: center unless that would overflow, then start or end; tab: start unless it would overflow the right; callout: to the right unless it would overflow, then mirrored) and `--caret-x` for the card's pointer, written straight to the element so nothing re-renders. The Studio builds the same markup for its previews (`linkedSkillPreview` in `studio/ui/fields.js`). Styles: `app/(site)/skill-pills.css`, see [[Design System (Blueprint Press)]].

## `CountUp`, `WordReveal`, `ScrollWords` (2026-09-17)

Three more `components/blueprint/` motion primitives, added with the About-this-site page and taken from the `motion-fluidity` skill's recipes: `CountUp` (a number that springs to its value on view), `WordReveal` (word-by-word blur-in for headings; its only call site, the About page's feature eyebrow, was removed on 2026-09-18, so it is currently an unused primitive kept for the recipes), and `ScrollWords` (a passage whose words brighten as it scrolls up the viewport). All three branch on `useReducedMotion()` to static markup. Details in [[About This Site Page]]. `lib/useInViewOnce.ts` and `lib/useSpotlight.ts` are their CSS-side companions.

## `components/blueprint/BpComingSoon.tsx`

`"use client"`. The fallback `/projects` renders when no project is published (every project `visible: false`, or the Projects switch off) — since 2026-09-16 ICARUS-Lite is published, so it is not on the live site. Props: `{ copy, teasers? }`. `copy` is `data/projects/page.json` → `comingSoon { heading, body, phases[], queueLabel }` (2026-09-26); `teasers?: { name: string; type: string }[]` isn't passed by the current fallback call.

- A CSS-only triple-ring loader + pulsing core (`.bp-soon-loader`).
- A cycling status line (`.bp-soon-status`) that rotates through `copy.phases` ("Compiling case studies", "Rendering system diagrams", …) every 2600 ms — skipped entirely if `prefers-reduced-motion: reduce`.
- A sweeping progress bar, the `copy.heading` / `copy.body` block ("Case studies in progress"), and — if `teasers` is non-empty — a `copy.queueLabel` ("Queued for publish") list showing each `name` (and `type`, hidden under 860px).
- An `sr-only` `role="status"` line for assistive tech.

It does **not** use the `ComingSoonContent` type from `types/resume.ts` — that schema is unrelated dead code. This component's shape is just `{ name, type }[]`.

## Related
- [[Routes Overview]]
- [[Blueprint Nav and Mark]]
- [[Resume PDF Pipeline]]
- [[Home]]
