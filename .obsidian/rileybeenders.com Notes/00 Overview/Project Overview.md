---
tags: [overview]
---

# Project Overview

## What it is

`RileyBeenders.com` is a resume-shaped portfolio website designed to complement, not replace, a traditional ATS-friendly resume PDF. The PDF is the official application document; the website presents the same career data in an editorial layout and, on `/more-info`, exposes the live job search behind the site.

Since the **Blueprint Press** reskin (now on `main`), the site is a calm, mostly-static editorial piece: a blueprint-grid background, a Swiss navy/red/blue palette on warm paper, Instrument Serif display type, and a single continuous-stroke RB monogram. The earlier "evidence layer" concept — pointer-driven 3D tilt, hover proof previews, slide-in project drawers, image lightboxes — was removed in the reskin. Scroll-triggered entrance animations (`Reveal`) are the only motion now.

## Owner / subject

Riley Beenders — R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation. Currently Lead R&D Engineer at Proteor (see [[Career Content]] for full history).

## Core features

1. **Home** (`/`) — a one-page editorial resume: hero (name, title, location, action buttons), then numbered sections `01 Summary`, `02 Experience`, `03 Toolchain`, `04 Education`, and a footer with the animated monogram. Server component, no client resume logic. See [[Routes Overview]].
2. **Projects** (`/projects`) — currently a placeholder: a hero plus `BpComingSoon`, an animated "case studies in progress" panel that lists the top project names as a "queued for publish" teaser. No project detail UI exists on `main`. See [[Projects Route (BpComingSoon)]].
3. **Contact** (`/contact`) — hero, the shared `BpActions` button row, and a contact card (email / LinkedIn / GitHub).
4. **More Info** (`/more-info`) — About Me / About the Site copy, a "Read more" link to the `.agents/` folder on GitHub, and a **live job-application Gantt chart + tracker table**, rendered client-side with `mermaid`. See [[More Info and Gantt Data]].
5. **On-demand resume PDF** (`/api/resume-pdf`) — a Node-runtime API route that builds a real, paginated, ATS-style PDF from the same `resumeData` that powers the website, so the downloadable resume is never stale. See [[Resume PDF Pipeline]].

## Dead / dormant code

`types/resume.ts` still declares `ResumeData.siteMode`, `ResumeData.comingSoon`, and the whole `ComingSoonContent` schema, and `header.json` still carries `visibility` flags. On `main`:

- **`siteMode` / `comingSoon` / `ComingSoonContent`** are never read anywhere. Dead code, not a prepared feature.
- **`visibility`** flags still drive `resumeData.ts`'s merge-time pruning, but every flag that would surface proof/project chips is `false` and no component renders those chips anyway. `projectsSection: true` keeps `resumeData.projects` populated, and only `name`/`type`/`order` of each project is used (the `/projects` teaser list).

See [[Data Layer and Types]].

## Where this sits in the repo's workflow

The repo also functions as the owner's personal job-search tracker: `2.JobsApplliedTo/` holds original job postings, `1.ApplicationsUsed/` and `output/pdf/` hold tailored resumes/cover letters actually submitted, and `README.md` / `data/more-info/gantt.md` track application status on a Gantt chart. A dedicated agent procedure (`custom-resume`, see [[Repository Agent Skills (.agents)]]) generates those tailored PDFs from live site data plus a job posting.

## Related
- [[Architecture and Data Flow]]
- [[Repository Map]]
- [[Home]]
