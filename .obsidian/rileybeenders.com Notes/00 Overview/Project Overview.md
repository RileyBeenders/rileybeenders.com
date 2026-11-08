---
tags: [overview]
---

# Project Overview

## What it is

`RileyBeenders.com` is a resume-shaped portfolio website designed to complement, not replace, a traditional ATS-friendly resume PDF. The PDF is the official application document. The website presents the same career data as an evidence layer. At rest it reads like the resume. One layer down are the project dialogs, case studies, walkthroughs, and the site's own deep dive, which includes the live job-search tracker behind the site.

Since the **Blue Sheet** redesign (2026-11-08, branch `design/UI_Refresh`, see [[Blue Sheet (2026-11 redesign)]]), the site is a cool blue-white drafting sheet. The content sits inside a dashed cut line on wide screens and in rounded cards with quiet shadows. One blue runs from pale washes to a deep fill. Headings are Instrument Serif over an Inter body, with IBM Plex Mono for dates and labels. The one-stroke RB monogram carries over from before. The palette is a Studio choice (the **Blue Sheet** preset today). In dark mode the sheet goes near-black navy, and every blue fill cuts deeper rather than brighter.

Motion is a small, one-hand system on a single easing curve:

- `Reveal` entrances.
- A floating nav whose active tint slides between links.
- The hero cover's stroke-draw and a monogram chip that trails the pointer across the hero.
- The contribution calendar's column pop-in, and project cards that lift and open into a dialog.
- Emphasis phrases that take the accent on hover.
- Inertial wheel scrolling that steps aside for touch, keys and reduced motion.
- Count-ups and a time-scaled timeline in the site's own entry.

All of it stays inside the `motion-design` skill's thresholds (see [[Design System (Blue Sheet)]]). The previous design, Blueprint Press (2026-08-27 to 2026-11-08), is recorded in [[Blueprint Press (2026-08 to 2026-11)]].

## Owner / subject

Riley Beenders is an R&D and electromechanical engineer focused on product development, manufacturing, automation and practical innovation. He is currently Lead R&D Engineer at Proteor (see [[Career Content]] for the full history).

## Core features

1. **Home** (`/`): a one-page resume in cards.
   - **The hero card:** a drawn blueprint cover band, the monogram avatar, the "Open to relocation" chip, the name, the title, a location and current-role line, and the Download PDF / Email / LinkedIn / GitHub row.
   - **The sections, in order:** GitHub activity (the contribution calendar), "Who is Riley?" (the summary and fact cards), Experience (a timeline rail), Projects (the catalog grid), Tech & hardware stack (four cards of pills), Education, and Contact (the ways in plus a message form).
   - **The footer** is a drawing title block.
   - **Bullets** keep their accent-on-hover emphasis phrases. A bullet that backs a published project keeps its Read more link, which opens that project's dialog.

   See [[Routes Overview]] and [[Sheet Components (Home Page)]].
2. **Projects** (`/projects`): the catalog, with type filters. It holds every published project (six today) and the site itself as cards. A card opens its project in a dialog (the URL hash names it). The dialog's "Open full page" goes to **`/projects/<id>`**, which shows the same body (gallery, summary, bullets, links, case study, walkthrough) with previous/next links. See [[Project Catalog and Dialog]].
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
- [[Blue Sheet (2026-11 redesign)]]
- [[Home]]
