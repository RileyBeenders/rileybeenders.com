---
tags: [overview, reference]
---

# Repository Map

Full annotated tree of `rileybeenders.com` on the `Version-2.0` branch. Paths are relative to the repo root (`C:\Users\riley\Documents\GitHub Rebos\rileybeenders.com`).

```text
.agents/
  SKILL.md                    # custom-resume agent skill + (new) vault-sync skill — see Repository Skills note

.obsidian/                    # NOT the site's config — this Obsidian vault lives inside it
  rileybeenders.com Notes/    # ← you are here

app/
  api/resume-pdf/route.ts     # Node-runtime API route: generates the live resume PDF on demand
  contact/page.tsx            # /contact route
  more-info/page.tsx          # /more-info route (About + Gantt tracker)
  projects/page.tsx           # /projects route
  globals.css                 # entire site's CSS (design tokens + every component's classes)
  layout.tsx                  # root layout: <html>/<body>, SiteHeader, Analytics, SpeedInsights, metadata
  page.tsx                    # / route (home / interactive resume)

components/
  BulletList.tsx               # resume-bullet renderer with proof/project chip buttons
  GanttChart.tsx                # client-side mermaid Gantt renderer for the job tracker
  InteractiveResume.tsx         # home page: header, summary, experience, education, skills, proof panel
  JobsTable.tsx                  # renders the parsed job-tracker markdown table
  ProjectDetails.tsx             # ProjectImageGallery, ProjectImageLightbox, AdditionalInfoDrawer
  ProjectsExplorer.tsx           # /projects grid of project cards
  SiteHeader.tsx                 # sticky global nav + per-route scroll-spy section nav

data/
  header.json                  # site-wide metadata: person, visibility flags, siteMode, resumePdfPath
  resumeData.ts                 # merges all JSON below into one typed ResumeData object
  home/
    education.json              # degrees + certificates
    experience.json              # employment history with bullets (proofId/projectId links)
    skills.json                   # 4 skill categories
    summary.json                   # the one-paragraph professional summary
  images/IcarusLiteRender.png      # source image (also duplicated into public/project-images)
  more-info/
    gantt.md                      # hand-authored mermaid Gantt block + markdown tracker table
    more-info.json                  # About Me / About the Site copy
  projects/
    projects.json                  # case-study projects (id, order, type, bullets, additionalInfo)
    proofs.json                     # evidence entries referenced by bullets via proofId

lib/
  gantt.ts                      # parseGanttFile(): splits gantt.md into {chart, columns, rows}

types/
  more-info.ts                  # MoreInfoData shape (matches more-info.json)
  resume.ts                     # ResumeData and every nested type (Project, ProofPoint, Experience, etc.)

ResumeBuilder/
  downloadPublishedResume.ts     # client helper: fetch + validate + trigger-download the live PDF
  generateResumePdf.ts             # jsPDF layout engine that builds the live resume PDF from ResumeData
  generateResumeTemplates.mjs       # standalone Node script: draws abstract 1-page/2-page layout mockups

public/
  project-artifacts/*.svg          # abstract diagram assets used in project "Additional Info" drawers
  project-images/IcarusLiteRender.png
  README.md                          # one-line note: no static resume.pdf needed, /api/resume-pdf covers it

JobsAppliedTo/                     # original job-posting PDFs, one per application (001–013)
output/
  ApplicationsUsed/                  # tailored resumes/cover letters actually submitted per application
  pdf/                                 # additional generated resume PDF variants
  resumeTemplates/                      # output of generateResumeTemplates.mjs (visual mockups)
references/                        # dated snapshot resumes (Apr 2022, Sept 2025, Jan 2026) used as evidence

README.md                          # project description + duplicate Gantt/tracker table + local-dev instructions
README_TODO.md                     # open content tasks (proof/project merge question, new proofs, a link fix)
package.json / package-lock.json
next.config.mjs                    # reactStrictMode + allowedDevOrigins (LAN IPs for local network testing)
tsconfig.json                      # strict TS, @/* path alias, next plugin
next-env.d.ts
```

## Folders intentionally not documented as "site" content

- `tmp/` — scratch output from AI-assisted PDF generation sessions (Chrome/Edge automation profiles, intermediate screenshots/PDFs). Not part of the deployed site.
- `node_modules/`, `.next/` — standard build/dependency output, gitignored.

## Related
- [[Project Overview]]
- [[Architecture and Data Flow]]
- [[Home]]
