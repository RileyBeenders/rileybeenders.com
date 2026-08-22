---
tags: [moc, home]
---

# RileyBeenders.com — Documentation Vault

This vault is a complete, high-detail breakdown of the `rileybeenders.com` repository: a Next.js resume/portfolio site that pairs a traditional ATS resume PDF with an interactive "evidence layer" website.

Documentation reflects the codebase as of the **Version-2.0** branch (commit `0f69c10`, "Made the Gantt chart scrollable"). See [[Repository Skills (.agents SKILL.md)]] for how this vault is kept current as the site changes.

## Quick facts

| | |
|---|---|
| Framework | Next.js `^16.2.12` (App Router), React `latest`, TypeScript `strict` |
| Live site | https://rileybeenders.com |
| Hosting signal | Vercel (`@vercel/analytics`, `@vercel/speed-insights`, Vercel CDN cache headers) |
| Repo owner | RileyBeenders (GitHub) |
| Current branch | `Version-2.0` |
| Package manager | npm |

## Map of Content

### Overview
- [[Project Overview]] — what the site is and why it exists
- [[Architecture and Data Flow]] — how data becomes pages
- [[Repository Map]] — annotated full file tree

### Routes & Pages
- [[Routes Overview]] — every route, its file, and what it renders

### Components
- [[InteractiveResume]] — the homepage resume experience
- [[SiteHeader]] — sticky nav + scroll-spy
- [[ProjectsExplorer and ProjectDetails]] — project grid, galleries, lightbox, drawer
- [[BulletList GanttChart and JobsTable]] — resume bullets, the mermaid Gantt chart, the tracker table

### Data Layer
- [[Data Layer and Types]] — types, the `resumeData.ts` merge pipeline, `header.json`
- [[Career Content]] — experience, projects, proofs, education, skills
- [[More Info and Gantt Data]] — the More Info page's content source and the hand-authored Gantt file

### Resume PDF Pipeline
- [[Resume PDF Pipeline]] — the live `/api/resume-pdf` generator and the static template-mockup script

### Styling
- [[Design System (globals.css)]] — CSS variables, layout patterns, responsive rules

### Job Search Tracking
- [[Job Application Tracker]] — how applications, tailored resumes, and references are tracked and stored, with links to a deep-dive page per application (`06 Job Search Tracking/Applications/`) covering the posting itself and a skills-match comparison that's frozen at application time versus kept current now

### Build, Tooling & Config
- [[Build Tooling and Config]] — package.json, tsconfig, next.config, running locally

### Agents & Automation
- [[Repository Skills (.agents SKILL.md)]] — the `custom-resume` skill and this vault's self-updating skill

## Known gaps / WIP notes worth remembering

- `header.json.siteMode` is `"coming-soon"` and a full `ComingSoonContent` type + matching CSS (`.kanban-board`, `.coming-*`) exist, but `app/page.tsx` always renders `InteractiveResume` regardless of `siteMode` — the coming-soon view isn't currently wired up. See [[Data Layer and Types]] and [[Design System (globals.css)]].
- The Job Application Tracker's Gantt chart + table exists in **two** hand-maintained places that can drift: `README.md` and `data/more-info/gantt.md`. See [[Job Application Tracker]].
- `README_TODO.md` lists open content tasks (possible proofs/projects merge, two new proofs to write, a link fix in experience data). See [[Career Content]].
