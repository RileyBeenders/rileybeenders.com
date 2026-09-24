---
tags: [overview]
---

# Project Overview

## What it is

`RileyBeenders.com` is a resume-shaped portfolio website designed to complement, not replace, a traditional ATS-friendly resume PDF. The PDF is the official application document; the website presents the same career data in an editorial layout and, on `/more-info`, exposes the live job search behind the site.

Since the **Blueprint Press** reskin (now on `main`), the site is a calm editorial piece: a blueprint-grid background, a light/dark palette picked in the Studio (the **Electric** preset today — Tesla-derived white with a `#3e6ae1` accent, Bugatti-derived black in dark mode; the Swiss navy/red/blue "Default" is the fallback), Instrument Serif display type, and a single continuous-stroke RB monogram. The earlier "evidence layer" concept — pointer-driven 3D tilt, hover proof previews, slide-in project drawers — was removed in the reskin. Motion is a small, one-hand system on a single easing curve: `Reveal` entrances, a spine that fills as you scroll, the hero ribbon's stroke draw, the relocation badge's hop and typewriter label, emphasis phrases that take the accent on hover, count-ups and a time-scaled timeline on the About page — all inside the `motion-design` skill's thresholds (see [[Design System (Blueprint Press)]]).

## Owner / subject

Riley Beenders — R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation. Currently Lead R&D Engineer at Proteor (see [[Career Content]] for full history).

## Core features

1. **Home** (`/`) — a one-page editorial resume: hero (name, title, location, the current role as a fact line, the "Open to relocation" badge resting beside the rule, action buttons), then numbered sections `01 Summary`, `02 Experience`, `03 Skills`, `04 Education` down a scroll-filled spine, and a footer with the animated monogram and a drawing-style title block (Sheet · Rev. · Drawn in). Experience bullets carry accent-on-hover emphasis phrases and, where a bullet backs a published project, an inline "see ICARUS-Lite ↗" evidence link. Server component, no client resume logic. See [[Routes Overview]].
2. **Projects** (`/projects`) — the published case studies, one full-height entry each: summary, bullets, a photo gallery with a lightbox, an optional date box, and the full case study behind a toggle. One project is published so far (**ICARUS-Lite**, since 2026-09-16); the other eight are `visible: false` drafts, and `BpComingSoon` is only the fallback when nothing is published. See [[Projects Route (BpComingSoon)]].
3. **Contact** (`/contact`) — hero and copy from `data/contact/contact.json`, the shared `BpActions` button row, and the email address spelled out once in prose (the three link cards went on 2026-09-18).
4. **More Info** (`/more-info`) — About Me / About the Site copy, a "Read the full story" link to `/about-this-site`, and the **job-application Gantt chart + tracker table** (client-side `mermaid`) — each switched separately (`ganttSection.chartVisible` / `tableVisible`). Right now the table is on and the chart is off, so section 03 shows only the table. See [[More Info and Gantt Data]].
5. **About this site** (`/about-this-site`) — the site as its own case study: a running date bar, the story with a light/dark gallery, then stats, a time-scaled commit timeline with a self-playing tour, pillars, and live "Behind the site" demos of the resume builder, the Studio, and the skill router. Fed by `data/site/about-site.json` and kept current by the `site-timeline-sync` procedure. See [[About This Site Page]].
6. **On-demand resume PDF** (`/api/resume-pdf`) — a Node-runtime API route that builds a real, paginated, ATS-style PDF from the same `resumeData` that powers the website, so the downloadable resume is never stale. See [[Resume PDF Pipeline]].

## Dead / dormant code

`types/resume.ts` still declares `ResumeData.siteMode`, `ResumeData.comingSoon`, and the whole `ComingSoonContent` schema. On `main`:

- **`siteMode` / `comingSoon` / `ComingSoonContent`** are never read anywhere. Dead code, not a prepared feature.
- **`visibility`** flags are live switches, not leftovers: `experienceProjectButtons: true` keeps bullet `projectId`s and renders the inline evidence link on the resume; `projectsSection: true` publishes `/projects` (and loads proofs for it); `openToRelocation: true` shows the badge. `experienceProofButtons` and `proofIndex` stay `false`, and every entry in `proofs.json` is additionally `visible: false`, so the proof layer is dormant data rather than dead code — `lib/projects.ts` would fold a visible proof into a project's case study.

See [[Data Layer and Types]].

## Where this sits in the repo's workflow

The repo also functions as the owner's personal job-search tracker: `2.JobsApplliedTo/` holds original job postings, `1.ApplicationsUsed/` and `output/pdf/` hold tailored resumes/cover letters actually submitted, and `README.md` / `data/more-info/gantt.md` track application status on a Gantt chart. A dedicated agent procedure (`custom-resume`, see [[Repository Agent Skills (.agents)]]) generates those tailored PDFs from live site data plus a job posting.

## Related
- [[Architecture and Data Flow]]
- [[Repository Map]]
- [[Home]]
