---
tags: [moc, home]
---

# RileyBeenders.com — Documentation Vault

This vault is a complete, high-detail breakdown of the `rileybeenders.com` repository. The repository holds three things:

- A Next.js resume/portfolio site that pairs a traditional ATS resume PDF with an evidence layer. The resume is readable at rest, and project tiles open into a dialog with a full page behind each one. The site documents itself as one of those projects.
- The local Studio that edits the site's content.
- The agent procedures that keep the site, and this vault, current.

The documentation reflects the codebase on the **`design/UI_Refresh`** branch after the **Clean Bench** redesign of 2026-11-09 (`app/(site)/bench.css`, `components/bench/*`, `lib/catalog.ts`, routes `/`, `/projects`, `/projects/[id]` and `/contact`). Clean Bench replaced **Blue Sheet**, which was built on 2026-11-08 and lasted one day (see [[Blue Sheet (2026-11-08, one day)]]). The branch runs first as beta.rileybeenders.com and merges to `main` later, so `main` (the live site) is still on the previous design. That design, **Blueprint Press** (2026-08-27 to 2026-11-08: five nav links, `/about-this-site`, `/more-info`, `ProjectEntry`, `blueprint.css`), is recorded in [[Blueprint Press (2026-08 to 2026-11)]]. The design before that (`InteractiveResume`, `SiteHeader`, one `app/globals.css`, pointer-tilt 3D) lived on `Version-2.0`. See [[Repository Agent Skills]] for how this vault is kept current as the site changes.

## Quick facts

|                 |                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework       | Next.js `^16.4.5` (App Router, Turbopack dev), React `^19.2.7`, TypeScript `^6` `strict`. `package.json` is `rileybeenders.com` v`3.1.0`, with every range pinned since 2026-09-19 |
| Live site       | https://rileybeenders.com (`main`, Blueprint Press). The beta, beta.rileybeenders.com (this branch, Clean Bench), is planned but not yet pointed |
| Hosting signal  | Vercel (`@vercel/analytics`, `@vercel/speed-insights`, Vercel CDN cache headers) |
| Repo owner      | RileyBeenders (GitHub) |
| Current branch  | `design/UI_Refresh` (merges to `main`) |
| Package manager | npm |
| Design language | Clean Bench: everything is a tile. White rounded tiles on a pale grey-blue ground under a frosted glass nav, a soft blue bloom at the top, one cobalt from a pale wash to a deep fill, and project tiles that morph into their dialog. The palette is picked in the Studio (active: **Clean Bench**, accent `#2457e6` on paper `#f4f5f8`, and `#6a93ff` on `#0f1115` in dark mode, where fills cut deeper). Type is Instrument Sans with Azeret Mono for small labels, plus the one-stroke RB monogram. It is specified in the repo-root `DESIGN.md` and replaced Blue Sheet on 2026-11-09 |

## Map of Content

### Overview
- [[Project Overview]]: what the site is and why it exists
- [[Architecture and Data Flow]]: how data becomes pages
- [[Repository Map]]: the annotated full file tree

### Routes & Pages
- [[Routes Overview]]: the four page routes (`/`, `/projects`, `/projects/[id]`, `/contact`), the redirects from `/about-this-site` and `/more-info`, and the API routes (`/api/contact`, `/api/resume-pdf`, `/api/geo`)

### Components
- [[Site Nav and Mark]]: the floating `SiteNav` pill, the `BpMark` RB monogram, and the static favicon, apple icon and social card
- [[Bench Components (Home Page)]]: the bento of tiles (the hero tile with `HeroActions` and `CursorMark`, Now, Based in, Education, This site, Say hello), `GithubGraph`, `Experience`, `Stack`, `Education`, `ContactBlock` / `ContactForm`, `SiteFooter`, `SmoothScroll`, and the kept primitives (`Reveal`, `BackToTop`, `StudioLink`, the theme toggle, `EmphasizedText`, `BulletLink`, `LinkedSkill`, `CountUp`, `ScrollWords`, `AnimationSync`)
- [[Project Catalog and Dialog]]: `lib/catalog.ts`, `ProjectGrid` / `ProjectCard` / `ProjectDialog` / `ProjectBody`, the `/projects/[id]` page, and the kept project media (gallery, lightbox, PDF pages, post card, compare, date box, status, case study, diagrams)
- [[Site Project (About this site)]]: the site's own catalog entry at `/projects/rileybeenders-com`, with its deep dive (stats, the time-scaled commit timeline, pillars, the live demos), the application tracker at its foot, and the scripts and Studio entry behind them
- [[Panel Walkthrough]]: the interactive tour of a program's screens inside a project (ExtrusionStudio): the rail, captures with numbered callouts, extras, and the sample files
- [[GanttChart JobsTable and gantt.ts]]: the client mermaid Gantt chart, the tracker table, and the shared parser
- [[Site Analytics]]: the Vercel Web Analytics wrapper, with the owner opt-out (`?analytics=off`) and the per-visit state/city `Visit` event fed by `/api/geo`

### Data Layer
- [[Data Layer and Types]]: the types, the `resumeData.ts` merge pipeline, `header.json` (including the motion switches), the page/interface/contact copy files, and the dead "coming soon" schema
- [[Career Content]]: experience, projects, proofs, education, skills
- [[More Info and Gantt Data]]: the application tracker's sources (`more-info.json` `ganttSection`, the hand-authored `gantt.md`, `past-applications.json`), now read by the catalog for the site project's page
- [[Career Q&A Log]]: Riley's answers to resume-review questions, read by the resume procedures, not the site

### Resume PDF Pipeline
- [[Resume PDF Pipeline]]: the static main resume pair behind Download PDF, the per-application HTML + PDF resumes, and the template-mockup script

### Styling
- [[Design System (Clean Bench)]]: the `base.css` reset, `bench.css` tokens and sections (tiles, bento, bloom), the palette derivation (`deriveSheetTokens`), the kept component stylesheets, layout and motion patterns, and the OG image / icon renderers. The machine-readable spec is the repo-root `DESIGN.md` (see [[Impeccable Design Workflow]])

### Design History
- [[Blueprint Press (2026-08 to 2026-11)]]: what the site was. The five-link nav, the editorial home page with its spine and ribbon, `ProjectEntry` with media parallax, Photo Mode, `/about-this-site` and `/more-info`, the `blueprint.css` tokens, the Electric preset, Instrument Serif + Spectral, and where to read it all in git
- [[Blue Sheet (2026-11-08, one day)]]: the drafting-sheet redesign of 2026-11-08 that set today's structure (the catalog and dialog, `/projects/[id]`, the contact form, env vars, redirects) and why it was replaced the next day
- [[Clean Bench (2026-11 redesign)]]: the current design, for the end of 2026, 2027 and the applications ahead. Riley's direction choice, the inspirations, the tokens, fonts, tiles, morph and bloom, the files, what stayed, and the follow-ups

### Job Search Tracking
- [[Past Disney Applications]]: the 30 inactive Disney applications from the Workday portal and Brassring (26 from before this site, plus four internships), with the four-month 10119309 interview timeline
- [[Job Application Tracker]]: how applications, tailored resumes and references are tracked and stored. It links to a deep-dive page per application (`06 Job Search Tracking/Applications/`), each covering the posting itself and a skills-match comparison frozen at application time beside one kept current

### Build, Tooling & Config
- [[Build Tooling and Config]]: package.json, tsconfig, `next.config.mjs` (redirects, dev origins), `.env.example`, `.gitignore`, running the site and the Studio locally, the `scripts/` folder (screenshot capture, hydration check, stats)

### Agents & Automation
- [[Repository Agent Skills]]: the repo agent procedures (the resume chain, Vault Sync for this vault, Sync Charts, Design Guidelines, the three `motion-*` skills, `site-timeline-sync`, and the skill router), plus the GitHub Actions workflow that runs `site-timeline-sync` after every push to `main`
- [[Impeccable Design Workflow]]: the `impeccable` design skill. It covers `PRODUCT.md`, the repo-root `DESIGN.md` (now Clean Bench) + `.impeccable/design.json` + the direction contract in `.impeccable/surfaces/`, the detector, the standing decisions (refinement inside Clean Bench since 2026-11-09), and the critique history

## Known gaps / WIP notes worth remembering

- **Clean Bench follow-ups.** The contact@rileybeenders.com inbox and the Resend key are not set up, so the message form falls back to the visitor's mail app (`/api/contact` answers 503). beta.rileybeenders.com is not yet pointed at this branch. The HTML resume template still uses the Blueprint Press look, and the social card still draws the blueprint ruling. See [[Clean Bench (2026-11 redesign)]].
- **Dead types.** `types/resume.ts` still declares the full `ComingSoonContent` schema and `ResumeData.siteMode` / `comingSoon`, but **nothing reads any of it**. `header.json` has `siteMode: "resume"` and no `comingSoon`. It is dead code, not a dormant feature. See [[Data Layer and Types]].
- **Dormant proofs.** `data/projects/proofs.json` loads whenever the Projects switch is on (it is the case-study detail layer `buildProofView` reads), but every one of its 17 entries is `visible: false`, so `resumeData.proofs` is `[]` and each case study comes from the project's own `additionalInfo`. See [[Career Content]] and [[Project Catalog and Dialog]].
- **Published projects.** Six projects are published (ICARUS-Lite, ExtrusionStudio, BulkSSH, RB's Auto App Updater, Unified Ubiquiti Network, Filament Innovations Projects), and the site entry makes the catalog seven cards. The other six projects are `visible: false` drafts. BulkSSH's gallery card has an empty `src` until its demo GIF is added. See [[Career Content]].
- **The tracker.** It now sits at the foot of `/projects/rileybeenders-com` (`#tracker`), with separate switches for the chart and the table (`ganttSection.chartVisible` / `tableVisible`). Only the **table** is on. The Gantt chart + table exist in **two** hand-maintained places that can drift, `README.md` and `data/more-info/gantt.md`. See [[More Info and Gantt Data]] and the Sync Charts procedure in [[Repository Agent Skills]].
- **Copy kept but not shown.** `about-site.json` `meta` / `storyHeading` / `outro`, `more-info.json` `aboutHeader` / `aboutMe` / `aboutSite`, and `interface.json` `projects.position`. See [[Blue Sheet (2026-11-08, one day)]].
- **Open content tasks.** `README_TODO.md` lists them (a possible proofs/projects merge, the "Alter Line 136" link fix).
