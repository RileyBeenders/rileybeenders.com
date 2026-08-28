---
tags: [component, client]
---

# ProjectsExplorer and ProjectDetails

Two files that work together to power the `/projects` route and the "Additional Info" drawer shared with the homepage.

## `components/ProjectsExplorer.tsx`

`"use client"`. Renders the `.project-grid` of case-study cards on `/projects`.

- **Ordering**: projects are sorted by their optional `order` field (ascending; `undefined` sorts last via `Number.MAX_SAFE_INTEGER`), with original array index as a stable tiebreaker. See current `order` values in [[Career Content]].
- Each card (`id="project-{project.id}"`, matches the scroll target used by `InteractiveResume`'s `openProject()`) shows: an `order` badge, `type`, `name`, `summary`, an optional `ProjectImageGallery`, an optional compact `BulletList`, and a "Read more" button if `additionalInfo` exists.
- Clicking "Read more" or a bullet's project/proof chip opens the shared `AdditionalInfoDrawer`.
- Clicking a gallery image opens a full-screen `ProjectImageLightbox`; the lightbox owns its own keyboard handling (`Escape` closes, `ArrowLeft`/`ArrowRight` navigate, wrapping around) via a `window` `keydown` listener added only while the lightbox is open, and locks `document.body.style.overflow = "hidden"` for the duration.

## `components/ProjectDetails.tsx`

`"use client"`. Exports three independent pieces, all `framer-motion`-animated:

### `ProjectImageGallery`

A single-image carousel (`aspect-ratio: 4/3`) that auto-advances every **10 seconds** (`PROJECT_IMAGE_ROTATION_MS = 10_000`) via `window.setTimeout`, re-armed each time `activeIndex` changes. Shows:
- The current image with a caption overlay.
- An expand icon (opens the lightbox at the current index).
- A circular SVG progress ring (`project-gallery-progress`) whose `stroke-dashoffset` animation duration is tied to the same 10s constant, plus a numeric `n/total` label.

### `ProjectImageLightbox`

Full-screen modal (`role="dialog"`, `aria-modal`). Header shows project name + `index/total`; body shows the current image (prev/next arrow buttons appear only when `images.length > 1`); footer is a horizontal thumbnail strip where the active thumbnail gets `.is-active`. All navigation is controlled by the parent (`ProjectsExplorer` or `InteractiveResume`, via `onClose`/`onPrevious`/`onNext`/`onSelect` callbacks) — the component itself holds no index state.

### `AdditionalInfoDrawer`

A right-side slide-in panel (`initial={{x:"100%"}}`) rendering a `ProjectAdditionalInfo` object:
- Hero: `title` + `subtitle`.
- `asset-strip`: grid of the project's supporting SVG/image assets (see `public/project-artifacts/*.svg`).
- Four `AdditionalInfoSection`s in fixed order: **Problem** (paragraph), **Constraints** (unordered `Checklist`), **Approach** (ordered `Checklist`), **Impact** (unordered `Checklist`).
- **Tools**: a `skill-pills`-styled tag list.

This exact drawer is reused by both `ProjectsExplorer` (`/projects`) and `InteractiveResume` (`/`, via proof/project chips) — there is only one implementation of "project deep dive" in the whole app.

## Related
- [[BulletList GanttChart and JobsTable]]
- [[InteractiveResume]]
- [[Career Content]]
- [[Home]]
