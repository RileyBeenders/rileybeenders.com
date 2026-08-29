---
tags: [moc, home]
---

# RileyBeenders.com — Documentation Vault

This vault is a complete, high-detail breakdown of the `rileybeenders.com` repository: a Next.js resume/portfolio site that pairs a traditional ATS resume PDF with an interactive "evidence layer" website.

Documentation reflects the codebase as of the **`main`** branch after the **Blueprint Press** reskin (the `app/(site)/` route group, `components/blueprint/*`, `app/base.css` + `app/(site)/blueprint.css`). The pre-reskin design (`InteractiveResume`, `SiteHeader`, `ProjectsExplorer`, one `app/globals.css`, pointer-tilt 3D, proof/project drawers) lived on `Version-2.0` and is gone from `main`. See [[Repository Agent Skills (.agents)]] for how this vault is kept current as the site changes.

## Quick facts

| | |
|---|---|
| Framework | Next.js `^16.2.12` (App Router, Turbopack dev), React `latest`, TypeScript `strict` |
| Live site | https://rileybeenders.com |
| Hosting signal | Vercel (`@vercel/analytics`, `@vercel/speed-insights`, Vercel CDN cache headers) |
| Repo owner | RileyBeenders (GitHub) |
| Current branch | `main` |
| Package manager | npm |
| Design language | Blueprint Press — blueprint-grid texture, Swiss palette (navy `#0b1a2b` / red `#e3342f` / blue `#2f86c4` on paper `#fbfbf9`), Instrument Serif + Spectral type, one continuous-stroke RB monogram |

## Map of Content

### Overview
- [[Project Overview]] — what the site is and why it exists
- [[Architecture and Data Flow]] — how data becomes pages
- [[Repository Map]] — annotated full file tree

### Routes & Pages
- [[Routes Overview]] — every route, its file, and what it renders

### Components
- [[Blueprint Nav and Mark]] — the sticky `BpNav` header, the `BpMark` RB monogram, and the static favicon/apple-icon
- [[Blueprint UI Components]] — `BpActions` (Download/Email/LinkedIn/GitHub), `Reveal` (scroll entrance), `BpComingSoon` (projects placeholder)
- [[GanttChart JobsTable and gantt.ts]] — the client mermaid Gantt chart, the tracker table, and the shared parser
- [[Projects Route (BpComingSoon)]] — what `/projects` renders today and what it replaced

### Data Layer
- [[Data Layer and Types]] — types, the `resumeData.ts` merge pipeline, `header.json`, the dead "coming soon" schema
- [[Career Content]] — experience, projects, proofs, education, skills
- [[More Info and Gantt Data]] — the More Info page's content source and the hand-authored Gantt file

### Resume PDF Pipeline
- [[Resume PDF Pipeline]] — the live `/api/resume-pdf` generator and the static template-mockup script

### Styling
- [[Design System (Blueprint Press)]] — `base.css` reset, `blueprint.css` tokens, layout and motion patterns, the OG image / icon renderers

### Job Search Tracking
- [[Job Application Tracker]] — how applications, tailored resumes, and references are tracked and stored, with links to a deep-dive page per application (`06 Job Search Tracking/Applications/`) covering the posting itself and a skills-match comparison that's frozen at application time versus kept current now

### Build, Tooling & Config
- [[Build Tooling and Config]] — package.json, tsconfig, next.config, running locally

### Agents & Automation
- [[Repository Agent Skills (.agents)]] — the three repo agent procedures: `custom-resume`, Vault Sync (this vault's self-updating skill), and Sync Charts

## Known gaps / WIP notes worth remembering

- `types/resume.ts` still declares the full `ComingSoonContent` schema and `ResumeData.siteMode` / `comingSoon`, but **nothing reads any of it** on `main` — `header.json` has `siteMode: "resume"` and no `comingSoon`, and the root `app/layout.tsx` uses a static title/description. It is dead code, not a dormant feature. See [[Data Layer and Types]].
- `data/projects/proofs.json` (17 entries) is imported by `resumeData.ts` and then pruned to `[]` at runtime (`visibility.proofIndex` and `experienceProofButtons` are both `false`), and no component renders proofs anyway. `data/projects/projects.json` is kept, but only each project's `name`/`type`/`order` is consumed — by the `/projects` teaser list. `bullets`, `additionalInfo`, `images`, `proofId` on projects are currently unrendered. See [[Career Content]].
- `data/projects/projects.json` entry `unifi-network` is a placeholder (empty bullets, literal `"title": "title"` / `"constraint01"` strings). Not currently rendered, but flag it if asked to "finish" project content.
- The Job Application Tracker's Gantt chart + table exists in **two** hand-maintained places that can drift: `README.md` and `data/more-info/gantt.md`. See [[Job Application Tracker]] and the Sync Charts procedure in [[Repository Agent Skills (.agents)]].
- `README.md`'s own prose still describes the old "mouse-driven 3D motion / expandable information drawers" design — that file was not updated for the reskin.
- `README_TODO.md` lists open content tasks (possible proofs/projects merge, "Alter Line 136" link fix). Note the two ExtrusionLine proofs it lists as "to create" now exist in `proofs.json`.
