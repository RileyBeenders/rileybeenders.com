---
tags: [data, types]
---

# Data Layer and Types

## `types/resume.ts` — the content schema

| Type | Shape / purpose |
|---|---|
| `ProofAsset` | `{ label, src, alt }` — one image tied to a proof or a project's `additionalInfo`. |
| `ProofPoint` | `{ id, title, summary, tags[], assets[], projectId?, visible? }` — an evidence entry. `visible: false` (every entry today) keeps it out of `resumeData.proofs`. |
| `ResumeBullet` | `{ text, emphasis?, proofId?, projectId? }` — one line of experience/project copy. `emphasis` is the exact phrases `EmphasizedText` accents on hover (always passed through the merge); `proofId` is stripped at merge time on `main`, `projectId` is kept (`experienceProjectButtons: true`) and becomes the resume's inline evidence link when it names a published project. |
| `ProjectImage` | `{ src, alt, caption?, fit?: "cover" \| "contain" }` |
| `Experience` | `{ company, role, location, start, end, context?, bullets[] }` — one job. |
| `EducationDegree` | `{ school, degree, graduation }` |
| `EducationCertificate` | `{ certificateName, issuer, date, credentialUrl?, credentialLabel? }` |
| `Education` | `{ degrees[], certificates[] }` |
| `Project` | `{ id, name, type, summary, bullets[], order?, proofId?, images?, additionalInfo?, dates?, status?, visible? }` — the full shape is rendered by `/projects` (`ProjectEntry` + `CaseStudy`); `visible: false` (eight of nine today) makes it a Studio draft that never reaches `resumeData.projects`; `status` is a short italic note under the summary; `dates` is documented in [[Projects Route (BpComingSoon)]]. |
| `ProjectAdditionalInfo` | `{ title, subtitle, problem, constraints[], approach[], impact[], tools[], assets?, designDecisions?, rootCause? }` — the case study `lib/projects.ts` → `buildProofView()` turns into sections (Problem, Root cause, Constraints, Approach, Design decisions, Impact) and tags; `assets` doubles as the gallery fallback for projects without photos. |
| `ComingSoon*` (`ComingSoonAction` / `Status` / `Teaser` / `ChecklistItem` / `LaunchSignal` / `ComingSoonContent`) | **Dead code.** Fully typed, referenced by nothing. See below. |
| `ResumeVisibility` | `{ experienceProjectButtons, experienceProofButtons, projectsSection, proofIndex, openToRelocation }` — 5 booleans; the first four drive `resumeData.ts`, `openToRelocation` (2026-09-15) gates the relocation badge and the contact hero's "Open to relocation" line. |
| `PaletteSeeds` / `ThemeSetting` | Five seed colors (`paper`, `white`, `ink`, `accent`, `blue`) and `{ paletteId, custom: { light, dark } }` — the Studio's palette choice; `lib/palette.ts` derives the full `PaletteTokens` (ramp, `onAccent`, …) from the seeds. |
| `FontRole` / `FontSettings` | `"header" \| "subheader" \| "body"` → a font id from `lib/fonts.ts`. |
| `ResumeData` | The top-level object. `siteMode?: "resume" \| "coming-soon"`, `person`, `summary`, `visibility`, `theme`, `fonts`, `resumePdfPath`, `comingSoon?`, `skills[]`, `experience[]`, `projects[]`, `education`, `proofs[]`. `siteMode` and `comingSoon` are declared but read nowhere. |

### The dead "coming soon" schema

`ComingSoonContent` and its sub-types are still declared in `types/resume.ts`, but on `main` **nothing imports or reads any of them**. The pre-reskin root layout branched on `siteMode === "coming-soon"` for its metadata; that branch was removed and replaced with a static title/description. `header.json` has `siteMode: "resume"` and no `comingSoon` object. There is also no coming-soon CSS anymore (the old `globals.css` `.kanban-*` / `.signal-*` / `.coming-*` system went with it). Treat this as leftover types to eventually delete, not a feature to activate. The `/projects` placeholder (`BpComingSoon`) is unrelated and uses its own `{ name, type }[]` prop shape.

## `types/more-info.ts`

Matches `data/more-info/more-info.json`:

- `MoreInfoAboutHeader`, `MoreInfoAboutMe` — `{ title, description: string[] }`.
- `MoreInfoReadMore` — `{ label: string; href: string }`.
- `MoreInfoAboutSite` — `{ title, description: string[], readMore?: MoreInfoReadMore }`. The optional `readMore` renders a "Read more" link after the About-the-Site paragraphs on `/more-info`.
- `MoreInfoGanttSection` — `{ visible, title, intro }`; `visible` controls the complete live tracker section (timeline and table together).
- `MoreInfoData` — the four blocks composed.

## `types/contact.ts`

Matches `data/contact/contact.json` (added 2026-09-15, Studio: **Contact**): `ContactHero { title, tagline }`, `ContactDetails { title, description[] }`, `ContactData { hero, details }`. The email address is not in this file — `/contact` prints `person.email` from `header.json` after the paragraphs. `eyebrow`, `linkedinLabel` and `githubLabel` left the schema with the contact cards on 2026-09-18.

## `data/header.json`

```json
{
  "siteMode": "resume",
  "person": { "name", "title", "location", "email", "phone", "website", "linkedin", "github" },
  "visibility": {
    "experienceProjectButtons": true,
    "experienceProofButtons": false,
    "projectsSection": true,
    "proofIndex": false,
    "openToRelocation": true
  },
  "theme": { "paletteId": "electric", "custom": { "light": { …5 seeds }, "dark": { …5 seeds } } },
  "fonts": { "header": "instrument-serif", "subheader": "instrument-serif", "body": "spectral" },
  "resumePdfPath": "/api/resume-pdf"
}
```

`person.name` is `"Riley Beenders"` (the old `"- BETA Site"` suffix is gone — the site launched out of beta). `person.title` is `"R&D, Electromechanical and Automation Engineer"`. `theme` and `fonts` are the Studio's Site Settings tab (see [[Design System (Blueprint Press)]]); `custom` holds the Electric seeds and is only read when `paletteId` is `"custom"`.

Visibility state (`experienceProjectButtons` flipped to `true` and `openToRelocation` arrived on 2026-09-15): experience bullets keep their `projectId` and the resume renders an inline evidence link for the one that names a published project; `projectsSection: true` publishes `/projects` and loads proofs for its case studies; `proofIndex` and `experienceProofButtons` are `false`, so `proofId`s are stripped and no standalone proof view exists. `resumeData.proofs` is `[]` at runtime all the same, because every entry in `proofs.json` is `visible: false` (see [[Career Content]]).

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
2. `publishedProjects` = `projects.json` minus every entry with `visible: false`, sorted by `order` (missing `order` sorts last, in file order); `publishedProofs` = `proofs.json` minus `visible: false`. "Draft" is additive — the JSON (and the Studio) keep the history.
3. `visibleExperience` = every job's bullets rebuilt as `{ text, emphasis? (when non-empty), proofId? (only if experienceProofButtons), projectId? (only if experienceProjectButtons) }`. With current flags `proofId` is stripped and `projectId` kept.
4. `includeProofData = visibility.proofIndex || visibility.experienceProofButtons || visibility.projectsSection` → currently `true` (the projects page uses proofs as its detail layer, so the switch that publishes it also loads them).
5. `includeProjectData = visibility.projectsSection || visibility.experienceProjectButtons || includeProofData` → currently `true`.
6. Final `resumeData` spreads `header` (`person`, `visibility`, `theme`, `fonts`, `resumePdfPath`, `siteMode`), then overrides `education`, `experience` (rebuilt), `proofs` (`publishedProofs` — empty today), `projects` (`publishedProjects` — ICARUS-Lite only today), `skills`, and `summary` (unwrapped from `summary.summary`).

A **module-level constant**, evaluated once at import time (build time for static pages, per-request for the `force-dynamic` `/api/resume-pdf` route) — not a hook, not re-derived per request in page components.

## Project dates, the About page, and its feature types (2026-09-17)

`types/resume.ts` gained: `ProjectDates` (`start`, `end?`, `ongoing?`, `position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "inline"`) on `Project.dates?`; and the About page's deep-dive types — `ProjectStat`, `TimelineEntry` (`date`, `era: "past" | "present" | "future"`, `title`, `summary`, `hash?`, `tags?`, `files?`, `insertions?`, `deletions?`, `screenshotId?`, and since 2026-09-18 `id?`, `mark?: "dot" | "star"` (`TimelineMark`), `linkFrom?`, `linkLabel?` for the star-and-connector pairs), `FeaturePillar`, `FeatureScreenshot` (`src` light capture + `srcDark`; the 2026-09-17 `ScreenshotHotspot` pins were removed on 2026-09-18), `FeatureBackend` → `BackendItem` (`demo: "resume" | "studio" | "skills"`, `title`, `body[]`, `notes[]`, `matches[]` of `BackendMatch`, `skills[]` of `BackendSkill`), and `ProjectFeature` grouping them. On 2026-09-18 the optional `eyebrow` fields left `ProjectFeature`, `FeaturePillar`, `BackendItem`, `AboutSiteHero`, and `ContactHero` (nothing renders a label above a heading any more; `FeatureBackend.eyebrow` stays — it is the block's heading text), `ContactDetails` lost `linkedinLabel` / `githubLabel` with the contact cards, and `Project` gained `status?: string`, a short note on the state of a write-up shown in small italic under the summary ("Project page under development. More details to come soon." on ICARUS-Lite, moved out of its summary text). `ResumeBullet.emphasis` and the `visible` switches on `Project` / `ProofPoint` arrived with the first published project on 2026-09-16; `ResumeVisibility.openToRelocation` on 2026-09-15. `PaletteTokens` (in `lib/palette.ts`, not this file) gained `onAccent` (see [[Design System (Blueprint Press)]]). `ProjectAdditionalInfo.assets` is now optional, matching what the Studio actually writes (it drops an empty list).

`types/about-site.ts` defines `AboutSiteData` (`hero`, `dates`, `summary`, `bullets`, `images`, `caseStudy?`, `feature`) for `data/site/about-site.json`, which `app/(site)/about-this-site/page.tsx` imports directly — it is page content like `more-info.json`, not part of the `resumeData.ts` merge. `lib/dates.ts` formats ISO dates and computes day counts for both. See [[About This Site Page]].

## Related
- [[Career Content]]
- [[Architecture and Data Flow]]
- [[Resume PDF Pipeline]]
- [[Home]]
