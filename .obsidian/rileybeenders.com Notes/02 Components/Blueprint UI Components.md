---
tags: [component, client]
---

# Blueprint UI Components

The three small `components/blueprint/*` pieces that aren't the nav/mark. All the pre-reskin interactive components (`InteractiveResume`, `ProjectsExplorer`, `ProjectDetails`, `BulletList`, `ProofPanel`, `AdditionalInfoDrawer`, image galleries/lightbox) were deleted — none of them exist on `main`.

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
- `whileInView` with `viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}` — fires once, slightly before the element is fully in view.
- One shared easing curve (`[0.22, 0.9, 0.28, 1]`) so all page motion reads as a single hand — the same curve is `--ease` in `blueprint.css`.

## `components/blueprint/BpComingSoon.tsx`

`"use client"`. The entire content of `/projects` today. Props: `{ teasers?: { name: string; type: string }[] }` (the projects page passes the top 6 projects by `order`).

- A CSS-only triple-ring loader + pulsing core (`.bp-soon-loader`).
- A cycling status line (`.bp-soon-status`) that rotates through `PHASES` ("Compiling case studies", "Rendering system diagrams", …) every 2600 ms — skipped entirely if `prefers-reduced-motion: reduce`.
- A sweeping progress bar, a fixed "Case studies in progress" copy block, and — if `teasers` is non-empty — a "Queued for publish" list showing each `name` (and `type`, hidden under 860px).
- An `sr-only` `role="status"` line for assistive tech.

It does **not** use the `ComingSoonContent` type from `types/resume.ts` — that schema is unrelated dead code. This component's shape is just `{ name, type }[]`.

## Related
- [[Routes Overview]]
- [[Blueprint Nav and Mark]]
- [[Resume PDF Pipeline]]
- [[Home]]
