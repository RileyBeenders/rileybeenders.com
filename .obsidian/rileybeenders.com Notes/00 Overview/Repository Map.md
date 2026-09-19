---
tags: [overview, reference]
---

# Repository Map

Full annotated tree of `rileybeenders.com` on the **`main`** branch (post Blueprint Press reskin). Paths are relative to the repo root (`C:\Users\riley\Documents\GitHub Rebos\rileybeenders.com`).

```text
.agents/                       # every agent skill, one place — see the Repository Agent Skills note
  README.md                    # routing index — the "Repository AI Commands" tables + Layout, kept current by hand
  skills/                      # 23 folders: 8 repo-specific procedures + 15 vendored (see .agents/README.md)
    custom-resume/SKILL.md     # name: custom-resume — tailored resume generation
    vault-sync/SKILL.md        # name: vault-sync — keep this Obsidian vault current
    sync-charts/SKILL.md       # name: sync-charts — README ↔ gantt.md tracker sync
    design-guidelines/         # name: design-guidelines — light/dark reference design-token systems
      SKILL.md, DESIGN.md, design-light.md, design-dark.md
    motion-design/             # name: motion-design — what to animate and how much (svelte-bits catalog, thresholds)
      SKILL.md, references/component-catalog.md
    motion-fluidity/           # name: motion-fluidity — framer-motion + CSS grammar and copy-ready recipes
      SKILL.md, references/grammar-map.md, references/recipes.md
    motion-layout/             # name: motion-layout — nav / hero / grid / card composition patterns
      SKILL.md, references/svelte-bits-layouts.md
    site-timeline-sync/SKILL.md# name: site-timeline-sync — keeps /about-this-site current from git
    impeccable/ + 14 more      # vendored: the design entry point, the taste-skill set, web-design-guidelines

.claude/
  launch.json                  # Claude desktop app preview servers (dev / prod / studio)
  skills → ../.agents/skills   # directory junction, git-ignored; Claude Code only discovers .claude/skills

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
    page.tsx                   # / — home (server component): hero + Summary/Experience/Skills/Education + footer title block
    projects/page.tsx          # /projects — hero + one <ProjectEntry> per published project in <ProjectListSpine> (BpComingSoon fallback)
    projects/projects.css      # .pj-* — entry layout, gallery, lightbox, case study, the per-project date box
    projects/feature.css       # .ft-* / .tl-* — the About page's stats, timeline, pillars, pinned screenshots (loaded by both routes)
    about-this-site/page.tsx   # /about-this-site — the site as its own case study (hero + date bar, story, deep-dive)
    about-this-site/about-site.css  # .as-* page layout + the large date-bar variant
    contact/page.tsx           # /contact — hero + <BpActions> + a contact card row
    more-info/page.tsx         # /more-info — About copy + "Read the full story" link (→ /about-this-site) + <GanttChart> + <JobsTable>
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
    CountUp.tsx                # number springs to its value on view (About page stats)
    WordReveal.tsx             # word-by-word blur-in for eyebrows/headings
    ScrollWords.tsx            # scroll-scrubbed word brightening for one short passage
  about-site/
    AboutSiteStory.tsx         # the About page's "01 The site" section (summary, bullets, gallery, case-study toggle)
  projects/
    ProjectEntry.tsx           # one project: rule + date box, text column, media column, case-study toggle
    ProjectListSpine.tsx       # scroll-filled hairline spine behind the project list
    ProjectDateBox.tsx         # boxed date range; "ongoing" turns its underline into a running progress bar
    CaseStudy.tsx              # expanded case-study markup, shared with the About page
    ProjectGallery.tsx         # 4:3 next/image grid with clip-path wipes; opens the Lightbox
    Lightbox.tsx               # full-screen original-image viewer (portal, keyboard nav)
    ProjectFeature.tsx         # the deep-dive composer (owns the shared Lightbox) — About page only
    feature/
      FeatureStats.tsx         # CountUp tiles with a CSS stagger and cursor spotlight
      FeatureTimeline.tsx      # time-scaled commit timeline: dots by date, past/present/future, card, mobile list
      FeaturePillars.tsx       # three expandable cards with screenshot thumbnails
      FeatureBackend.tsx       # "Behind the site" rows: a live demo beside notes, sides alternating
      ThemedShot.tsx           # a capture shown in the theme the visitor is NOT using (light site → dark shot)
      demos/
        ResumeDemo.tsx         # posting keywords → real resume lines; Generate PDF walks them and shows the skill's checks
        StudioDemo.tsx         # mini Studio (real preset palettes, badge switch, save states) recoloring a mini site
        SkillsDemo.tsx         # the repo's skill router: rail of procedures, trigger + what-it-does, auto-advances until touched

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
    projects.json              # case-study projects (summary, bullets, images, additionalInfo, optional dates); hidden ones carry visible:false
    proofs.json                # evidence entries — the case-study detail layer buildProofView reads
  site/
    about-site.json            # /about-this-site content: hero, dates, story, case study, stats, timeline, pillars, light+dark screenshots, the Behind-the-site rows (Studio: About this site)

lib/
  gantt.ts                     # parseGanttFile(): splits gantt.md into {chart, columns, rows}
  projects.ts                  # buildProofView() / buildProjectViews(): the shapes ProjectEntry and the About page consume
  dates.ts                     # ISO date helpers: isIsoDate, parseIsoDate (UTC), formatDate, daysBetween, todayIso
  useInViewOnce.ts             # once-only IntersectionObserver hook for CSS-stagger reveals
  useSpotlight.ts              # writes --sx/--sy on pointer move for the .bp-spot cursor wash
  site.ts                      # REPO_URL for timeline commit links

types/
  more-info.ts                 # MoreInfoData shape (matches more-info.json), incl. MoreInfoReadMore
  resume.ts                    # ResumeData + nested types (Project, ProjectDates, the ProjectFeature/Timeline/Screenshot types); still holds the unused ComingSoon* schema
  about-site.ts                # AboutSiteData (matches data/site/about-site.json)

scripts/
  capture-site-screenshots.mjs # playwright-core (machine Chrome/Edge) recapture of the About page's screenshots in both themes; needs the dev server (+ Studio)
  site-stats.mjs               # git-derived stats + key-commit candidates for the About page; --write refreshes the data file

ResumeBuilder/
  downloadPublishedResume.ts   # client helper: fetch + validate (%PDF- magic bytes) + trigger-download the live PDF
  generateResumePdf.ts         # jsPDF layout engine that builds the live resume PDF from ResumeData
  generateResumeTemplates.mjs  # standalone Node script: draws abstract 1-page/2-page layout mockups

assets/
  fonts/InstrumentSerif-Regular.ttf   # build-time only, for the Satori-rendered OG image (see assets/fonts/README.md)

design/                        # Blueprint Press design source — a Claude Design canvas, chosen direction only
  Main.dc.html, Mark.dc.html, Interactions.dc.html, canvas.json   # the published export and the 5 rejected "earlier sketches" artboards were removed as stale clutter; regenerate the export by re-publishing if needed

public/
  project-artifacts/*.svg      # abstract diagram assets — ProjectGallery's fallback for projects without photos
  project-images/ICARUS-Lite/, ICARUS-Pro/   # project photos, edited via the Studio's image picker
  project-images/rileybeenders-com/           # the About page's captures of the site itself, <name>-light.png + <name>-dark.png (written by scripts/capture-site-screenshots.mjs)
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
next-env.d.ts                  # Next-generated on every dev/build run; git-ignored since 2026-09-19
```

## Folders intentionally not documented as "site" content

- `tmp/` — scratch space: browser profiles, PDF runtimes, one-off Playwright scripts. Git-ignored since 2026-09-19 (it had been committing ~2,800 files, including Chrome caches and a crash dump).
- `.claude/worktrees/` — Claude Code checkouts, git-ignored. `.claude/launch.json` and the `.claude/skills` junction are described in the `.agents/` block above.
- `.vscode/` — editor config.
- `node_modules/`, `.next/` — standard build/dependency output, gitignored.

## Related
- [[Project Overview]]
- [[Architecture and Data Flow]]
- [[Home]]
