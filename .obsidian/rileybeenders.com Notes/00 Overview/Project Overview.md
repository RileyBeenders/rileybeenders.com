---
tags: [overview]
---

# Project Overview

## What it is

`RileyBeenders.com` is a resume-shaped portfolio website designed to complement, not replace, a traditional ATS-friendly resume PDF. The PDF is the official application document; the website is an interactive "evidence layer" that proves the claims made on the resume through hover states, subtle mouse-driven 3D motion, persistent project links, and expandable information drawers.

> The site stays readable as a conventional resume at rest, then reveals additional proof of work through hover states, subtle mouse-driven 3D motion, persistent project links, and expandable information drawers.
> — [[Repository Map|README.md]]

## Owner / subject

Riley Beenders — R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation. Currently Lead R&D Engineer at Proteor (see [[Career Content]] for full history).

## Core features

1. **Interactive resume home page** (`/`) — summary, experience timeline, education, skills, and a "proof panel" that previews evidence on hover. See [[InteractiveResume]].
2. **Project explorer** (`/projects`) — a filterable/orderable grid of case-study projects with image carousels and an "Additional Info" drawer (Problem / Constraints / Approach / Impact / Tools). See [[ProjectsExplorer and ProjectDetails]].
3. **Contact page** (`/contact`) — minimal contact details.
4. **More Info page** (`/more-info`) — About Me / About the Site copy plus a **live job-application Gantt chart and tracker table**, rendered client-side with `mermaid`. See [[More Info and Gantt Data]].
5. **On-demand resume PDF** (`/api/resume-pdf`) — a Node-runtime API route that builds a real, paginated, ATS-style PDF from the same data that powers the website, so the downloadable resume is never stale. See [[Resume PDF Pipeline]].
6. **Evidence system ("proofs")** — bullets throughout the experience and projects sections can carry a `proofId` and/or `projectId` that renders a small chip button linking bullet claims to supporting detail. See [[Career Content]].

## Site modes

`data/header.json` declares a `siteMode` field (`"resume" | "coming-soon"`) and a full `ComingSoonContent` type exists in `types/resume.ts` with matching CSS (kanban board, launch-signal meter, teaser cards) in `globals.css`. **This is currently unused** — `app/page.tsx` always renders the full `InteractiveResume` regardless of `siteMode`, and `header.json` doesn't currently include a `comingSoon` object. Treat this as a prepared-but-dormant feature, not active behavior. See [[Data Layer and Types]] for the type shape.

## Where this sits in the repo's workflow

The repo also functions as the owner's personal job-search tracker: `JobsAppliedTo/` holds original job postings, `output/ApplicationsUsed/` and `output/pdf/` hold tailored resumes/cover letters actually submitted, and `README.md` / `data/more-info/gantt.md` track application status on a Gantt chart. A dedicated agent skill (`custom-resume`, see [[Repository Skills (.agents SKILL.md)]]) generates those tailored PDFs from live site data plus a job posting.

## Related
- [[Architecture and Data Flow]]
- [[Repository Map]]
- [[Home]]
