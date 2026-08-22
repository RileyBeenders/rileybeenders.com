---
tags: [component, client]
---

# InteractiveResume

`components/InteractiveResume.tsx` — `"use client"`. The homepage (`/`) component. Renders the entire resume-as-webpage experience from a single `ResumeData` prop.

## Structure

```text
<main class="site-shell" onPointerMove>
  <div class="ambient-grid" />
  <section class="resume-stage">
    <ResumeHeader />                    id="section-header"
    <section class="resume-paper">
      <div class="resume-column-main">
        <ResumeBlock "Summary">          id="section-summary"
        <ResumeBlock "Professional Experience">  id="section-experience"
      <aside class="resume-column-side">
        <ResumeBlock "Degrees">          id="section-education"
        <ResumeBlock "Skills">           id="section-skills"
        <ProofPanel />  (only if visibility.proofIndex)
  <AdditionalInfoDrawer />  (AnimatePresence, only when a project is selected)
```

These section `id`s are exactly what `SiteHeader`'s `SECTIONS_BY_ROUTE["/"]` targets — see [[SiteHeader]].

## 3D pointer-tilt effect

`handlePointerMove` runs on every `onPointerMove` over the whole `<main>`. It computes the pointer's fractional position within the element's bounding rect, then writes four CSS custom properties directly onto the element via `element.style.setProperty(...)`:

- `--pointer-x` / `--pointer-y` — drive the radial-gradient ambient background and the `.interactive-card::before` hover glow (see [[Design System (globals.css)]]).
- `--rotate-x` / `--rotate-y` — drive `.resume-stage`'s `perspective(1200px) rotateX(...) rotateY(...)` transform, giving the whole resume a subtle 3D tilt toward the cursor.

This is done with direct DOM style mutation (not React state) to avoid re-render cost on every mouse move.

## State

- `activeProofId: string | null` — set on bullet-chip hover/focus (via `BulletList`'s `onProofEnter`/`onProofLeave`), drives which proof the sidebar `ProofPanel` previews.
- `selectedAdditionalInfoProjectId: string | null` — set when a proof or project chip is clicked; opens the `AdditionalInfoDrawer` (imported from `ProjectDetails.tsx`) for that project's `additionalInfo`.

Two lookup maps are memoized from props: `proofById` (`Map<string, ProofPoint>`) and `projectById` (`Map<string, Project>`), both keyed by `.id`.

`portfolioLayersEnabled` is `true` if **any** of the four `visibility` flags is on — it gates whether the `AdditionalInfoDrawer` can ever render at all, independent of whether a specific project happens to have `additionalInfo`.

## `ResumeHeader` (internal subcomponent)

Renders `data.person.name/title/location`, a mailto/LinkedIn/GitHub contact row, and the **Download PDF** button.

PDF download is a 3-state machine (`idle | loading | error`):

1. Click → `setPdfDownloadState("loading")`.
2. Dynamically imports `@/ResumeBuilder/downloadPublishedResume` (kept out of the main bundle) and calls `downloadPublishedResumePdf(data.resumePdfPath)` (`resumePdfPath` = `"/api/resume-pdf"` from `header.json`).
3. Success → back to `"idle"`. Failure → `"error"`, and an inline `role="alert"` message appears.
4. While loading, the button is `disabled`, shows a spinning `LoaderCircle` icon (`.pdf-loading-icon` CSS animation), and reads "Preparing PDF...".

See [[Resume PDF Pipeline]] for what happens after the click.

## `ResumeBlock` (internal subcomponent)

Tiny layout wrapper: renders an `eyebrow` label + `h2` title inside a `.resume-block section` with the given `id`. Used for every homepage section except the header.

## `ProofPanel` (internal subcomponent)

Only rendered when `data.visibility.proofIndex` is true. Shows either:
- The single `activeProof` (when a bullet's proof chip is hovered/focused), or
- A fallback list of `data.proofs.slice(0, 4)` when nothing is active.

Each proof card is a button; clicking it calls `onOpenProof`, which (if the proof has a `projectId` whose project has `additionalInfo`) opens the drawer for that project.

## Related
- [[SiteHeader]]
- [[BulletList GanttChart and JobsTable]]
- [[ProjectsExplorer and ProjectDetails]]
- [[Data Layer and Types]]
- [[Home]]
