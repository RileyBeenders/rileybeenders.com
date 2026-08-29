---
tags: [overview, reference]
---

# Repository Map

Full annotated tree of `rileybeenders.com` on the **`main`** branch (post Blueprint Press reskin). Paths are relative to the repo root (`C:\Users\riley\Documents\GitHub Rebos\rileybeenders.com`).

```text
.agents/                       # repo agent procedures — see the Repository Agent Skills note
  README.md                    # index + the "Repository AI Commands" table
  custom-resume/SKILL.md       # name: custom-resume — tailored resume generation
  vault-sync/SKILL.md          # name: vault-sync — keep this Obsidian vault current
  sync-charts/SKILL.md         # name: sync-charts — README ↔ gantt.md tracker sync

.obsidian/                     # NOT the site's config — this Obsidian vault lives inside it
  rileybeenders.com Notes/     # ← you are here

app/
  layout.tsx                   # ROOT layout: <html>/<body>, base.css, Analytics, SpeedInsights, static metadata + OpenGraph/Twitter
  base.css                     # shared shell reset only (box-sizing, body, img, .sr-only)
  icon.svg                     # static favicon — hand-drawn static form of the BpMark monogram
  apple-icon.tsx               # iOS home-screen icon, rendered via next/og ImageResponse
  opengraph-image.tsx          # 1200x630 OG/Twitter card, rendered via next/og + Satori (reads assets/fonts/InstrumentSerif)
  (site)/                      # route group: everything with the Blueprint Press chrome
    layout.tsx                 # loads Instrument Serif + Spectral (next/font/google), blueprint.css, renders <BpNav> + "Open to relocation" badge
    blueprint.css              # the entire site design system, all scoped under .bp
    page.tsx                   # / — home (server component): hero + Summary/Experience/Toolchain/Education + footer
    projects/page.tsx          # /projects — hero + <BpComingSoon> (case studies not published yet)
    contact/page.tsx           # /contact — hero + <BpActions> + a contact card row
    more-info/page.tsx         # /more-info — About copy + "Read more" link + <GanttChart> + <JobsTable>
  api/resume-pdf/route.ts      # Node-runtime API route: generates the live resume PDF on demand

components/
  GanttChart.tsx               # client-side mermaid Gantt renderer for the job tracker
  JobsTable.tsx                # renders the parsed job-tracker markdown table
  blueprint/
    BpNav.tsx                  # sticky top nav (client, usePathname for active link) + brand mark
    BpMark.tsx                 # the RB monogram SVG — one continuous stroke, gradient along travel
    BpActions.tsx              # Download PDF (3-state) / Email / LinkedIn / GitHub button row (client)
    BpComingSoon.tsx           # animated "case studies in progress" placeholder + optional teaser queue (client)
    Reveal.tsx                 # framer-motion scroll-entrance wrapper (rise or rule variant), respects reduced motion

data/
  header.json                  # site-wide metadata: person, visibility flags, siteMode ("resume"), resumePdfPath
  resumeData.ts                # merges all JSON below into one typed ResumeData object (visibility pruning)
  home/
    education.json             # degrees + certificates
    experience.json            # employment history with bullets (proofId/projectId links, stripped at merge)
    skills.json                # 4 skill categories
    summary.json               # the one-paragraph professional summary
  images/IcarusLiteRender.png  # source image (also duplicated into public/project-images)
  more-info/
    gantt.md                   # hand-authored mermaid Gantt block + markdown tracker table
    more-info.json             # About Me / About the Site copy + the aboutSite.readMore link
  projects/
    projects.json              # case-study projects — only name/type/order consumed today
    proofs.json                # evidence entries — imported then pruned to [] at runtime

lib/
  gantt.ts                     # parseGanttFile(): splits gantt.md into {chart, columns, rows}

types/
  more-info.ts                 # MoreInfoData shape (matches more-info.json), incl. MoreInfoReadMore
  resume.ts                    # ResumeData + nested types; still holds the unused ComingSoon* schema

ResumeBuilder/
  downloadPublishedResume.ts   # client helper: fetch + validate (%PDF- magic bytes) + trigger-download the live PDF
  generateResumePdf.ts         # jsPDF layout engine that builds the live resume PDF from ResumeData
  generateResumeTemplates.mjs  # standalone Node script: draws abstract 1-page/2-page layout mockups

assets/
  fonts/InstrumentSerif-Regular.ttf   # build-time only, for the Satori-rendered OG image (see assets/fonts/README.md)

design/                        # Blueprint Press design source — a Claude Design canvas
  *.dc.html, canvas.json       # per-artboard design sources + canvas layout
  rileybeenders-directions.html       # the published design-canvas artifact (self-contained editor + content)

public/
  project-artifacts/*.svg      # abstract diagram assets (from the old drawer design; not currently referenced by any route)
  project-images/IcarusLiteRender.png
  README.md                    # one-line note: no static resume.pdf needed, /api/resume-pdf covers it

2.JobsApplliedTo/              # original job-posting PDFs, one per application (001–013). Note the double-l spelling.
1.ApplicationsUsed/            # tailored resumes / cover letters actually submitted per application (+ a 000_ baseline)
output/
  pdf/                         # additional generated resume PDF variants + the v1/v2 Disney reference resumes
  resumeTemplates/             # output of generateResumeTemplates.mjs (visual mockups)
references/                    # dated snapshot resumes (Apr 2022, Sept 2025, Jan 2026) used as evidence

README.md                      # project description + duplicate Gantt/tracker table + local-dev instructions (prose is pre-reskin)
README_TODO.md                 # open content tasks
package.json / package-lock.json
next.config.mjs                # reactStrictMode + allowedDevOrigins (LAN IPs for local network testing)
tsconfig.json                  # strict TS, @/* path alias, next plugin, includes .next/dev/types
next-env.d.ts                  # Next-generated; flips between .next/types and .next/dev/types depending on last command
```

## Folders intentionally not documented as "site" content

- `tmp/` — scratch output from AI-assisted PDF generation sessions. Not part of the deployed site.
- `.claude/` — Claude Code config and worktrees.
- `.vscode/` — editor config.
- `node_modules/`, `.next/` — standard build/dependency output, gitignored.

## Related
- [[Project Overview]]
- [[Architecture and Data Flow]]
- [[Home]]
