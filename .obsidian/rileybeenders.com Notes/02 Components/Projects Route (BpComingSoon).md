---
tags: [component, routes]
---

# Projects Route (BpComingSoon)

## What `/projects` is on `main`

A placeholder. `app/(site)/projects/page.tsx` renders a hero ("Selected Work" / "Projects" / a short intro paragraph) followed by `<BpComingSoon teasers={...} />`, where `teasers` is `resumeData.projects` sorted by `order`, sliced to the first 6, mapped to `{ name, type }`.

That is the **only** place `resumeData.projects` is consumed anywhere in the app. `bullets`, `additionalInfo`, `images`, and `proofId` on each project are carried through the data layer but rendered nowhere.

`BpComingSoon`'s behaviour is documented in [[Blueprint UI Components]].

## What it replaced

The pre-reskin `/projects` route (`Version-2.0`) rendered `components/ProjectsExplorer.tsx` and `components/ProjectDetails.tsx`:

- `ProjectsExplorer` — a `.project-grid` of case-study cards, order-sorted, each with an image gallery, a compact bullet list, and a "Read more" button.
- `ProjectDetails` — three `framer-motion` pieces: `ProjectImageGallery` (10s auto-advancing carousel with a progress ring), `ProjectImageLightbox` (full-screen modal, keyboard nav, body-scroll lock), and `AdditionalInfoDrawer` (right-side slide-in panel rendering `ProjectAdditionalInfo` — Problem / Constraints / Approach / Impact / Tools + an asset strip). The drawer was shared with the old homepage.

**All of those files were deleted in the reskin.** If project case studies are rebuilt, they will be a new implementation — there is no drawer/gallery/lightbox code to revive on `main`. The abstract SVGs in `public/project-artifacts/` are leftovers from that design and aren't referenced by any current route.

## Related
- [[Blueprint UI Components]]
- [[Career Content]]
- [[Routes Overview]]
- [[Home]]
