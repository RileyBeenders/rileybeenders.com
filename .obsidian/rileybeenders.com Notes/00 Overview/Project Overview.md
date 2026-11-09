---
tags: [overview]
---

# Project Overview

## What it is

`RileyBeenders.com` is a resume-shaped portfolio website designed to complement, not replace, a traditional ATS-friendly resume PDF. The PDF is the official application document. The website presents the same career data as an evidence layer. At rest it reads like the resume. One layer down are the project dialogs, case studies, walkthroughs, and the site's own deep dive, which includes the live job-search tracker behind the site.

Since the **Clean Bench** redesign (2026-11-09, branch `design/UI_Refresh`, see [[Clean Bench (2026-11 redesign)]]), everything on the site is a tile. White rounded tiles sit on a pale grey-blue ground under a frosted glass nav, with a soft blue bloom behind the top of the page. One cobalt runs from pale washes to a deep fill. Headings and body are Instrument Sans, with Azeret Mono for dates and small labels. The one-stroke RB monogram carries over from before. The palette is a Studio choice (the **Clean Bench** preset today). In dark mode the tiles go graphite on near-black, and every blue fill cuts deeper rather than brighter. Clean Bench replaced Blue Sheet, a drafting-sheet design that lasted one day (see [[Blue Sheet (2026-11-08, one day)]]).

Motion is a small, one-hand system on a single easing curve:

- Bento tiles that rise in once, 70ms apart, and `Reveal` entrances below them.
- A floating nav whose active tint slides between links.
- A slowly drifting bloom and a monogram chip that trails the pointer across the bento.
- The contribution calendar's column pop-in, and project tiles that lift and morph into their dialog.
- Emphasis phrases that take the accent on hover.
- Inertial wheel scrolling that steps aside for touch, keys and reduced motion.
- Count-ups and a time-scaled timeline in the site's own entry.

All of it stays inside the `motion-design` skill's thresholds (see [[Design System (Clean Bench)]]). The previous design, Blueprint Press (2026-08-27 to 2026-11-08), is recorded in [[Blueprint Press (2026-08 to 2026-11)]].

## Owner / subject

Riley Beenders is an R&D and electromechanical engineer focused on product development, manufacturing, automation and practical innovation. He is currently Lead R&D Engineer at Proteor (see [[Career Content]] for the full history).

## Core features

1. **Home** (`/`): a one-page resume in tiles.
   - **The bento:** the hero tile (the monogram avatar, the "Open to relocation" chip, the name, the title, a location and current-role line, and the Download PDF / Email / LinkedIn / GitHub row), then tiles for Now, Based in and Education, the GitHub calendar, This site and Say hello.
   - **The sections, in order:** "Who is Riley?" (the summary and fact tiles), Experience (one tile with a timeline rail), Projects (the catalog grid), Tech & hardware stack (four tiles of pills), Education, and Contact (the ways in plus a message form).
   - **The footer** is a quiet mono line: Site, Updated, Based in.
   - **Bullets** keep their accent-on-hover emphasis phrases. A bullet that backs a published project keeps its Read more link, which opens that project's dialog.

   See [[Routes Overview]] and [[Bench Components (Home Page)]].
2. **Projects** (`/projects`): the catalog, with type filters. It holds every published project (six today) and the site itself as tiles. A tile morphs into its project's dialog (the URL hash names it). The dialog's "Open full page" goes to **`/projects/<id>`**, which shows the same body (gallery, summary, bullets, links, case study, walkthrough) with previous/next links. See [[Project Catalog and Dialog]].
3. **The site's own entry** (`/projects/rileybeenders-com`): the site as its own case study. It has a summary, a light/dark gallery and the case study, then stats, a time-scaled commit timeline with a self-playing tour, pillars, and live "Behind the site" demos of the resume builder, the Studio and the skill router. At its foot is the **job-application tracker** (the table today; the Gantt chart has its own switch). It is fed by `data/site/about-site.json` and the tracker files, and kept current by `site-timeline-sync`. `/about-this-site` and `/more-info` redirect here. See [[Site Project (About this site)]].
4. **Contact** (`/contact`): the headline, then the block the home page ends with. Email, LinkedIn, GitHub and location sit beside "Send me a message". The form posts to `/api/contact` (Resend). Until that inbox is configured, it opens the visitor's own mail app with the message filled in.
5. **Main resume**: the Download PDF button opens a curated interactive HTML resume from `public/resume/` (`header.json`'s `resumeHtmlPath`) in a new tab, where its Print / PDF button saves the matching PDF. The pair (`RileyBeenders_Resume_<YY><DDD>`, also kept in `.DefaultResume/`) is built from `ResumeBuilder/main-resume/main-resume.html` and kept current by the `update-main-resume` skill. `/api/resume-pdf` redirects to the PDF. Each tailored application also has its own HTML resume beside its PDF in `1.ApplicationsUsed/`. See [[Resume PDF Pipeline]].

## Dead / dormant code

`types/resume.ts` still declares `ResumeData.siteMode`, `ResumeData.comingSoon` and the whole `ComingSoonContent` schema. In the current tree:

- **`siteMode` / `comingSoon` / `ComingSoonContent`** are never read anywhere. They are dead code, not a prepared feature.
- **`visibility`** flags are live switches, not leftovers:
  - `experienceProjectButtons: true` keeps bullet `projectId`s and renders the Read more link on the resume.
  - `projectsSection: true` publishes the projects in the catalog and loads proofs for them. When it is off, the catalog is the site entry alone.
  - `openToRelocation: true` shows the hero chip and the relocation lines.
  - `experienceProofButtons` and `proofIndex` stay `false`, and every entry in `proofs.json` is additionally `visible: false`. So the proof layer is dormant data rather than dead code: `lib/projects.ts` would fold a visible proof into a project's case study.
- **The Studio's `POST /api/photo-place`** endpoint has had no caller since Photo Mode was removed in the redesign.

See [[Data Layer and Types]].

## Where this sits in the repo's workflow

The repo also functions as the owner's personal job-search tracker:

- `2.JobsApplliedTo/` holds the original job postings.
- `1.ApplicationsUsed/` and `output/pdf/` hold the tailored resumes and cover letters actually submitted (since 2026-11-07, an interactive HTML resume beside each PDF).
- `README.md` and `data/more-info/gantt.md` track application status on a Gantt chart and table.

Dedicated agent procedures (`create-custom-resume-pdf` / `create-custom-resume-html`, see [[Repository Agent Skills]]) generate those tailored files from live site data plus a job posting.

## Related
- [[Architecture and Data Flow]]
- [[Repository Map]]
- [[Clean Bench (2026-11 redesign)]]
- [[Blue Sheet (2026-11-08, one day)]]
- [[Home]]
