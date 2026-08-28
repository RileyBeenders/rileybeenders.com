---
tags: [data, types]
---

# Data Layer and Types

## `types/resume.ts` — the full content schema

| Type | Shape / purpose |
|---|---|
| `ProofAsset` | `{ label, src, alt }` — one image tied to a proof or a project's `additionalInfo`. |
| `ProofPoint` | `{ id, title, summary, tags[], assets[], projectId? }` — an evidence entry. |
| `ResumeBullet` | `{ text, proofId?, projectId? }` — one line of experience/project copy, optionally linked to evidence. |
| `ProjectImage` | `{ src, alt, caption?, fit?: "cover" \| "contain" }` — gallery image. |
| `Experience` | `{ company, role, location, start, end, context?, bullets[] }` — one job. |
| `EducationDegree` | `{ school, degree, graduation }` |
| `EducationCertificate` | `{ certificateName, issuer, date, credentialUrl?, credentialLabel? }` |
| `Education` | `{ degrees[], certificates[] }` |
| `Project` | `{ id, name, type, summary, bullets[], order?, proofId?, images?, additionalInfo? }` |
| `ProjectAdditionalInfo` | `{ title, subtitle, problem, constraints[], approach[], impact[], tools[], assets[] }` — the drawer content. |
| `ComingSoonAction` / `ComingSoonStatus` / `ComingSoonTeaser` / `ComingSoonChecklistItem` / `ComingSoonLaunchSignal` / `ComingSoonContent` | The full dormant "coming soon" landing-page schema — see note below. |
| `ResumeVisibility` | `{ experienceProjectButtons, experienceProofButtons, projectsSection, proofIndex }` — 4 booleans. |
| `ResumeData` | The top-level object every page consumes. `siteMode?: "resume" \| "coming-soon"`, `person`, `summary`, `visibility`, `resumePdfPath`, `comingSoon?`, `skills[]`, `experience[]`, `projects[]`, `education`, `proofs[]`. |

### The dormant "coming soon" system

`ComingSoonContent` is fully typed (badge, headline, subheadline, summary, availability, a `launchSignal` with `{ charge, currentTask, targetLaunchDate }`, primary/secondary actions, a `statusBoard[]`, `teasers[]`, a `checklist[]`, and free-form `signals[]`) and `globals.css` has a complete matching visual system (`.coming-stage`, `.coming-hero`, `.signal-card` with a charge meter, `.kanban-board`/`.kanban-card` with 4 tone variants, `.preview-panel`, `.debug-panel`/`.log-dock`). **None of it is currently wired to render** — see [[Project Overview]] for why. If this ever gets activated, it will need a component (there isn't one yet) and `header.json` will need a populated `comingSoon` object plus `siteMode: "coming-soon"` to actually take effect in `app/layout.tsx`'s metadata branch.

## `types/more-info.ts`

Matches `data/more-info/more-info.json` exactly: `MoreInfoAboutHeader`, `MoreInfoAboutMe`, `MoreInfoAboutSite` (each `{ title, description: string[] }`), `MoreInfoGanttSection` (`{ title, intro }`), composed into `MoreInfoData`.

## `data/header.json`

```json
{
  "siteMode": "coming-soon",
  "person": { "name", "title", "location", "email", "phone", "website", "linkedin", "github" },
  "visibility": {
    "experienceProjectButtons": false,
    "experienceProofButtons": false,
    "projectsSection": true,
    "proofIndex": false
  },
  "resumePdfPath": "/api/resume-pdf"
}
```

Current visibility state: experience bullets show **neither** proof nor project chips; the projects section/data is included; the standalone proof index panel is hidden. Because `includeProofData = visibility.proofIndex || visibility.experienceProofButtons` is currently `false`, `resumeData.proofs` is an **empty array** at runtime even though `data/projects/proofs.json` has ~17 entries — the file exists but nothing currently surfaces it directly (proofs are still reachable indirectly wherever a project's own data references them internally, but the dedicated proof UI is off).

Note: `person.name` is literally `"Riley Beenders - BETA Site"` in the current data — that suffix flows straight into the `<h1>` on the homepage and the PDF's name line. Worth knowing before assuming a typo is a bug versus intentional beta labeling.

## `data/resumeData.ts` — the merge module

```ts
import header from "@/data/header.json";
import education from "@/data/home/education.json";
import experience from "@/data/home/experience.json";
import proofs from "@/data/projects/proofs.json";
import projects from "@/data/projects/projects.json";
import skills from "@/data/home/skills.json";
import summary from "@/data/home/summary.json";
```

Logic:
1. `visibility = header.visibility`.
2. `visibleExperience` = every job's bullets, stripped of `proofId` unless `visibility.experienceProofButtons`, stripped of `projectId` unless `visibility.experienceProjectButtons`.
3. `includeProofData = visibility.proofIndex || visibility.experienceProofButtons`.
4. `includeProjectData = visibility.projectsSection || visibility.experienceProjectButtons || includeProofData`.
5. Final `resumeData` spreads `header`, then overrides `education`, `experience` (the pruned version), `proofs` (full array or `[]`), `projects` (full array or `[]`), `skills`, and `summary` (unwrapped from `summary.summary`).

This is a **module-level constant**, evaluated once at import time (build time for static pages, per-request for the dynamic `/api/resume-pdf` route since it's `force-dynamic`) — not a React hook, not re-derived per request in the page components.

## Related
- [[Career Content]]
- [[Architecture and Data Flow]]
- [[Resume PDF Pipeline]]
- [[Home]]
