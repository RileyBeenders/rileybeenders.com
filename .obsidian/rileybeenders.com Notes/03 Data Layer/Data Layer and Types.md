---
tags: [data, types]
---

# Data Layer and Types

## `types/resume.ts` — the content schema

| Type | Shape / purpose |
|---|---|
| `ProofAsset` | `{ label, src, alt }` — one image tied to a proof or a project's `additionalInfo`. |
| `ProofPoint` | `{ id, title, summary, tags[], assets[], projectId? }` — an evidence entry. |
| `ResumeBullet` | `{ text, proofId?, projectId? }` — one line of experience/project copy. On `main` the ids are stripped at merge time and never rendered. |
| `ProjectImage` | `{ src, alt, caption?, fit?: "cover" \| "contain" }` |
| `Experience` | `{ company, role, location, start, end, context?, bullets[] }` — one job. |
| `EducationDegree` | `{ school, degree, graduation }` |
| `EducationCertificate` | `{ certificateName, issuer, date, credentialUrl?, credentialLabel? }` |
| `Education` | `{ degrees[], certificates[] }` |
| `Project` | `{ id, name, type, summary, bullets[], order?, proofId?, images?, additionalInfo? }` — only `name`/`type`/`order` are consumed on `main`. |
| `ProjectAdditionalInfo` | `{ title, subtitle, problem, constraints[], approach[], impact[], tools[], assets[] }` — drawer content for a UI that no longer exists. |
| `ComingSoon*` (`ComingSoonAction` / `Status` / `Teaser` / `ChecklistItem` / `LaunchSignal` / `ComingSoonContent`) | **Dead code.** Fully typed, referenced by nothing. See below. |
| `ResumeVisibility` | `{ experienceProjectButtons, experienceProofButtons, projectsSection, proofIndex }` — 4 booleans, still consumed by `resumeData.ts`. |
| `ResumeData` | The top-level object. `siteMode?: "resume" \| "coming-soon"`, `person`, `summary`, `visibility`, `resumePdfPath`, `comingSoon?`, `skills[]`, `experience[]`, `projects[]`, `education`, `proofs[]`. `siteMode` and `comingSoon` are declared but read nowhere. |

### The dead "coming soon" schema

`ComingSoonContent` and its sub-types are still declared in `types/resume.ts`, but on `main` **nothing imports or reads any of them**. The pre-reskin root layout branched on `siteMode === "coming-soon"` for its metadata; that branch was removed and replaced with a static title/description. `header.json` has `siteMode: "resume"` and no `comingSoon` object. There is also no coming-soon CSS anymore (the old `globals.css` `.kanban-*` / `.signal-*` / `.coming-*` system went with it). Treat this as leftover types to eventually delete, not a feature to activate. The `/projects` placeholder (`BpComingSoon`) is unrelated and uses its own `{ name, type }[]` prop shape.

## `types/more-info.ts`

Matches `data/more-info/more-info.json`:

- `MoreInfoAboutHeader`, `MoreInfoAboutMe` — `{ title, description: string[] }`.
- `MoreInfoReadMore` — `{ label: string; href: string }`.
- `MoreInfoAboutSite` — `{ title, description: string[], readMore?: MoreInfoReadMore }`. The optional `readMore` renders a "Read more" link after the About-the-Site paragraphs on `/more-info`.
- `MoreInfoGanttSection` — `{ title, intro }`.
- `MoreInfoData` — the four blocks composed.

## `data/header.json`

```json
{
  "siteMode": "resume",
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

`person.name` is `"Riley Beenders"` (the old `"- BETA Site"` suffix is gone — the site launched out of beta). `person.title` is `"R&D, Electromechanical and Automation Engineer"`.

Visibility state: experience bullets show **no** chips (there's no chip UI anyway); `projectsSection: true` keeps `resumeData.projects` populated for the `/projects` teaser list; `proofIndex` is `false`, so `resumeData.proofs` is `[]` at runtime even though `proofs.json` has 17 entries.

`spread of header` into `ResumeData` also carries `siteMode` through — but again, nothing downstream reads it.

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
2. `visibleExperience` = every job's bullets, stripped of `proofId` unless `visibility.experienceProofButtons`, stripped of `projectId` unless `visibility.experienceProjectButtons`. With current flags, **both ids are always stripped**.
3. `includeProofData = visibility.proofIndex || visibility.experienceProofButtons` → currently `false`.
4. `includeProjectData = visibility.projectsSection || visibility.experienceProjectButtons || includeProofData` → currently `true`.
5. Final `resumeData` spreads `header`, then overrides `education`, `experience` (pruned), `proofs` (`[]` here), `projects` (full array here), `skills`, and `summary` (unwrapped from `summary.summary`).

A **module-level constant**, evaluated once at import time (build time for static pages, per-request for the `force-dynamic` `/api/resume-pdf` route) — not a hook, not re-derived per request in page components.

## Related
- [[Career Content]]
- [[Architecture and Data Flow]]
- [[Resume PDF Pipeline]]
- [[Home]]
