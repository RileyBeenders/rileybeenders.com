---
tags: [component, routes]
---

# Projects Route

*(File kept under its original name, `Projects Route (BpComingSoon)`, so existing links resolve; `BpComingSoon` is now only the fallback this route shows when no project is published.)*

## What `/projects` is on `main`

`app/(site)/projects/page.tsx` builds `views = buildProjectViews(resumeData.projects, resumeData.proofs)` (see [[Career Content]]) and renders a hero ("Selected Work" / "Projects" / "One project — …" or "N projects — …"), then one `<ProjectEntry>` per published project inside `<ProjectListSpine>`, then a `.pj-outro` footer and `<BackToTop />`. Styles come from `app/(site)/projects/projects.css` (`.pj-*`) plus `feature.css` (shared with the About page — see [[About This Site Page]]). When `views` is empty (the Projects switch off in Site Settings, or every project hidden) it falls back to the hero + `<BpComingSoon />` placeholder documented in [[Blueprint UI Components]].

## `components/projects/`

| File | Role |
|---|---|
| `ProjectListSpine.tsx` | Client. Wraps the list; a hairline track down the left with an accent fill driven by `useScroll` + `useSpring` (`stiffness 220, damping 34, mass 0.4`). Reduced motion shows it fully drawn. |
| `ProjectEntry.tsx` | Client. One full-height entry, no pinning: opening hairline rule, a two-column grid (`.pj-entry-text` / `.pj-entry-media`) that alternates sides on odd indexes (`pj-entry--reverse`) and collapses to one column at 860px. Index `01 / 0N`, title, `type`, head rule, summary, bullets (framer variants: `staggerChildren 0.09`, `delayChildren 0.3`), then a "View the full case study" toggle. The media column drifts ±56px against scroll (`useTransform` on a spring). The case study opens via `AnimatePresence` height `0 → auto` (0.55s, the site's `EASE`). |
| `ProjectDateBox.tsx` | Client. The optional date box from `project.dates` — see **Dates** below. |
| `CaseStudy.tsx` | Server-safe markup for the expanded case study (`ProofView`: eyebrow "Case study", title, subtitle, summary, sections, tags, diagrams). Extracted from `ProjectEntry` so the About page can reuse it. |
| `ProjectGallery.tsx` | Client. Responsive photo grid; each cell is a fixed 4:3 `next/image` frame (`fill`, `sizes` tracking the grid) that uncovers with a `clip-path` wipe (`staggerChildren 0.1`) and opens the `Lightbox`. Diagrams from `additionalInfo.assets` stand in when a project has no photos. |
| `Lightbox.tsx` | Client. Full-screen viewer (portal) for the untouched original image, keyboard navigation, loading state. |
| `ProjectFeature.tsx` + `feature/*` | The deep-dive used by the About page only — documented in [[About This Site Page]]. |

`lib/projects.ts` (`buildProofView`, `buildProjectViews`) assembles the `ProjectView` each entry consumes; `EmphasizedText` (`components/content/`) renders the bullets' `emphasis` phrases, which take the accent on hover.

## Dates

Every project can carry a `dates` object (`types/resume.ts` → `ProjectDates`; Studio → Projects → **Dates**): `start`, optional `end`, `ongoing`, `position`. ISO dates (`2026-06-28`) are formatted by `lib/dates.ts` (`Jun 28, 2026`); anything else shows as written. When `start` is set, `ProjectEntry` renders `<ProjectDateBox>`:

- **Position** `top-right` (default) / `top-left` — the box sits *on* the entry's opening hairline rule (`.pj-entry-rule { position: relative }`, box absolutely centered on the line with paper behind it, so the rule reads as passing through a tag). `bottom-right` / `bottom-left` — the same on a closing rule rendered after the grid. `inline` — in the text column under the head rule. Under 860px the corner positions drop into the flow above the grid.
- **Ongoing** — the end reads "→ Present" (accent) and the box's 2px underline becomes an indeterminate progress bar: `pj-dates-fill` scales to 92% over 1.6s on view (`useInViewOnce`), then `pj-dates-chase` sweeps a lighter band across it every 2.8s. Static projects show a hairline underline. Reduced motion snaps the fill and runs the sweep once, off-track.

No published project sets `dates` yet; the About page's hero uses the same component at `size="large"`.

## History

The pre-reskin `/projects` route (`Version-2.0`) rendered `ProjectsExplorer` / `ProjectDetails` (a carousel, a lightbox, and a right-side `AdditionalInfoDrawer`); the reskin replaced it with the `BpComingSoon` placeholder, and the Sep 12–13 rebuild (`72823d7`, `c5f1f19`, `32a51c7`) produced the current editorial flow — deliberately with no pinning or scroll-jacking. The abstract SVGs in `public/project-artifacts/` are the diagram fallbacks `ProjectGallery` shows for projects without photos.

## Related
- [[About This Site Page]]
- [[Blueprint UI Components]]
- [[Career Content]]
- [[Routes Overview]]
- [[Design System (Blueprint Press)]]
- [[Home]]
