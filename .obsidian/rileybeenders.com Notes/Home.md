---
tags: [moc, home]
---

# RileyBeenders.com — Documentation Vault

This vault is a complete, high-detail breakdown of the `rileybeenders.com` repository: a Next.js resume/portfolio site that pairs a traditional ATS resume PDF with an editorial website — the resume at rest, published case studies and an About page one layer down — plus the local Studio that edits its content and the agent procedures that keep it (and this vault) current.

Documentation reflects the codebase as of the **`main`** branch after the **Blueprint Press** reskin (the `app/(site)/` route group, `components/blueprint/*`, `app/base.css` + `app/(site)/blueprint.css`). The pre-reskin design (`InteractiveResume`, `SiteHeader`, `ProjectsExplorer`, one `app/globals.css`, pointer-tilt 3D, proof/project drawers) lived on `Version-2.0` and is gone from `main`. See [[Repository Agent Skills (.agents)]] for how this vault is kept current as the site changes.

## Quick facts

| | |
|---|---|
| Framework | Next.js `^16.2.12` (App Router, Turbopack dev), React `^19.2.7`, TypeScript `^6` `strict` — `package.json` is `rileybeenders.com` v`3.1.0`, every range pinned since 2026-09-19 |
| Live site | https://rileybeenders.com |
| Hosting signal | Vercel (`@vercel/analytics`, `@vercel/speed-insights`, Vercel CDN cache headers) |
| Repo owner | RileyBeenders (GitHub) |
| Current branch | `main` |
| Package manager | npm |
| Design language | Blueprint Press — blueprint-grid texture, a Studio-picked palette (active: **Electric**, `#3e6ae1` accent on white / on black in dark mode; fallback: the Swiss navy `#0b1a2b` / red `#e3342f` / blue `#2f86c4` on paper `#fbfbf9`), Instrument Serif + Spectral type, one continuous-stroke RB monogram; specified in the repo-root `DESIGN.md` |

## Map of Content

### Overview
- [[Project Overview]] — what the site is and why it exists
- [[Architecture and Data Flow]] — how data becomes pages
- [[Repository Map]] — annotated full file tree

### Routes & Pages
- [[Routes Overview]] — every route, its file, and what it renders (now including `/about-this-site`)

### Components
- [[Blueprint Nav and Mark]] — the sticky `BpNav` header, the `BpMark` RB monogram, and the static favicon/apple-icon
- [[Blueprint UI Components]] — `BpActions` (Download/Email/LinkedIn/GitHub), `Reveal` (four entrance variants), `PageSpine`, `HeroRibbon`, the two-state relocation badge, `BackToTop`, the theme toggle, `CountUp` / `WordReveal` / `ScrollWords`, `EmphasizedText`, and `BpComingSoon` (the projects fallback)
- [[GanttChart JobsTable and gantt.ts]] — the client mermaid Gantt chart, the tracker table, and the shared parser
- [[Projects Route (BpComingSoon)]] — the projects page: `ProjectEntry`, spine, gallery, lightbox, the optional per-project date box
- [[About This Site Page]] — `/about-this-site`: the running date bar, `CountUp` stats, the time-scaled commit timeline, pillars, pinned screenshots, and the scripts and Studio entry behind them

### Data Layer
- [[Data Layer and Types]] — types, the `resumeData.ts` merge pipeline, `header.json`, the dead "coming soon" schema
- [[Career Content]] — experience, projects, proofs, education, skills
- [[More Info and Gantt Data]] — the More Info page's content source and the hand-authored Gantt file

### Resume PDF Pipeline
- [[Resume PDF Pipeline]] — the live `/api/resume-pdf` generator and the static template-mockup script

### Styling
- [[Design System (Blueprint Press)]] — `base.css` reset, `blueprint.css` tokens, layout and motion patterns, the OG image / icon renderers; the machine-readable spec is the repo-root `DESIGN.md` (see [[Impeccable Design Workflow]])

### Job Search Tracking
- [[Job Application Tracker]] — how applications, tailored resumes, and references are tracked and stored, with links to a deep-dive page per application (`06 Job Search Tracking/Applications/`) covering the posting itself and a skills-match comparison that's frozen at application time versus kept current now

### Build, Tooling & Config
- [[Build Tooling and Config]] — package.json, tsconfig, next.config, `.gitignore`, running the site and the Studio locally, the `scripts/` folder

### Agents & Automation
- [[Repository Agent Skills (.agents)]] — the eight repo agent procedures: `custom-resume`, Vault Sync (this vault's self-updating skill), Sync Charts, Design Guidelines, the three `motion-*` skills, and `site-timeline-sync` (which also runs by itself after every push to `main`, via the repo's one GitHub Actions workflow)
- [[Impeccable Design Workflow]] — the `impeccable` design skill: `PRODUCT.md`, the repo-root `DESIGN.md` + `.impeccable/design.json`, the detector, the standing interview decisions (refinement inside Blueprint Press, not a redesign), and the critique history

## Known gaps / WIP notes worth remembering

- `types/resume.ts` still declares the full `ComingSoonContent` schema and `ResumeData.siteMode` / `comingSoon`, but **nothing reads any of it** on `main` — `header.json` has `siteMode: "resume"` and no `comingSoon`, and the root `app/layout.tsx` uses a static title/description. It is dead code, not a dormant feature. See [[Data Layer and Types]].
- `data/projects/proofs.json` is loaded whenever the Projects page is on (it is the case-study detail layer `buildProofView` reads), but since 2026-09-16 every one of its 17 entries is `visible: false`, so `resumeData.proofs` is `[]` and each case study comes from the project's own `additionalInfo`. The standalone proof index and the resume's proof buttons stay off too (`visibility.proofIndex` / `experienceProofButtons` are `false`). See [[Career Content]] and [[Projects Route (BpComingSoon)]].
- Only **ICARUS-Lite** is published on `/projects`; the other eight projects are `visible: false` drafts. `unifi-network` is still a placeholder (empty bullets, literal `"title": "title"` / `"constraint01"` strings) — flag it if asked to "finish" project content.
- The live tracker on `/more-info` is **hidden** (`ganttSection.visible: false` since 2026-09-16; the About page's timeline lists "The tracker returns" as a planned entry). The Gantt chart + table still exist in **two** hand-maintained places that can drift: `README.md` and `data/more-info/gantt.md` — and they drift today: `gantt.md`'s 015/016 rows link the posting PDFs on the deleted `Version-3.1` branch while `README.md` links `main`. See [[More Info and Gantt Data]] and the Sync Charts procedure in [[Repository Agent Skills (.agents)]].
- The About-this-site nav tab still carries the gradient-text sweep (`gradient: true` in `BpNav`, `.bp-nav-link--gradient` in `blueprint.css`). The 2026-09-18 impeccable critique flagged it and the decision was to flatten it, but that change never reached `main`. See [[Blueprint Nav and Mark]].
- `README.md`'s version line and folder tree were refreshed on 2026-09-19 (Version 3.1), but its opening prose still describes the old "mouse-driven 3D motion / expandable information drawers" design.
- `README_TODO.md` lists open content tasks (possible proofs/projects merge, "Alter Line 136" link fix); the resume-PDF data rules it used to draft moved into `custom-resume` step 3 on 2026-09-19. The two ExtrusionLine proofs it lists as "to create" already exist in `proofs.json`.
