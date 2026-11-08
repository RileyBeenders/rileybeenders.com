---
tags: [overview, reference]
---

# Repository Map

This is the full annotated tree of `rileybeenders.com` on the **`design/UI_Refresh`** branch, after the Blue Sheet redesign of 2026-11-08 (Version 3.1). Paths are relative to the repo root (`C:\Users\riley\Documents\GitHub_Repos\rileybeenders.com`). The files the redesign deleted are listed in [[Blue Sheet (2026-11 redesign)]], and the tree they belonged to is described in [[Blueprint Press (2026-08 to 2026-11)]].

```text
CLAUDE.md                      # routing index for the agent skills + the Next.js agent-rules block, kept current by hand

.claude/
  launch.json                  # Claude desktop app preview servers (site / dev / prod / studio)
  settings.local.json          # per-machine Claude Code settings
  worktrees/                   # Claude Code checkouts, git-ignored
  skills/                      # every agent skill, one folder each (48 folders: the repo procedures, the vendored library, the added planning/motion/polish/git set; see CLAUDE.md and the Repository Agent Skills note)
    create-custom-resume-pdf/  # tailored resume generation (step 1 of the resume chain), with scripts/print-resume.mjs + validate-resume.py
    create-custom-resume-html/ # same process, interactive HTML beside the PDF (build-web-resume.mjs, verify-web-resume.mjs)
    grill-my-resume/ fix-my-resume/ update-main-resume/   # steps 2 and 3, and the main resume pair
    vault-sync/SKILL.md        # keep this Obsidian vault current
    sync-charts/SKILL.md       # README ↔ gantt.md tracker sync
    design-guidelines/         # light/dark reference design-token systems (SKILL.md, DESIGN.md, design-light.md, design-dark.md)
    motion-design/ motion-fluidity/ motion-layout/   # what moves and how much; how to build it; how to compose it
    site-timeline-sync/SKILL.md# keeps the site's own entry (/projects/rileybeenders-com) current from git
    skill-router/              # registry.json + scripts/route.mjs (--check)
    impeccable/ + the rest     # vendored: the design entry point, the taste-skill set, web-design-guidelines, the added generic skills

.DefaultResume/                # Riley's working copy of the main resume pair, RileyBeenders_Resume_26311.html|.pdf (copied to public/resume/)
.github/
  workflows/site-timeline-sync.yml   # after every push to main: Claude Code runs site-timeline-sync, the workflow validates + commits the result

.obsidian/                     # NOT the site's config; this Obsidian vault lives inside it
  rileybeenders.com Notes/     # ← you are here

.env.example                   # the contact form's RESEND_API_KEY / CONTACT_TO / CONTACT_FROM (copy to the git-ignored .env.local)

app/
  layout.tsx                   # ROOT layout: <html>/<body>, base.css, SiteAnalytics, SpeedInsights, static metadata + OpenGraph/Twitter
  base.css                     # shared shell reset only (box-sizing, body, img, .sr-only)
  icon.svg                     # static favicon, the hand-drawn static form of the BpMark monogram
  apple-icon.tsx               # iOS home-screen icon, rendered via next/og ImageResponse
  opengraph-image.tsx          # 1200x630 OG/Twitter card, rendered via next/og + Satori (reads assets/fonts/InstrumentSerif)
  (site)/                      # route group: everything with the Blue Sheet chrome
    layout.tsx                 # 8 Google faces, the Studio palette + font roles as a <style> override, ThemeProvider, <SiteNav>, .sheet-frame, the [data-sheet-portal] host, AnimationSync / SmoothScroll switches, dev-only StudioLink
    sheet.css                  # the Blue Sheet design system (1,120 lines), all scoped under .bp, in banner-commented sections
    bullet-link.css            # the resume bullets' Read more button variants (data-motion); also served to the Studio
    skill-pills.css            # skill pills and linked skills (data-border / data-reveal); also served to the Studio
    page.tsx                   # / (async server): hero card, GitHub activity, Who is Riley?, Experience, Projects grid, Stack, Education, Contact, footer
    projects/page.tsx          # /projects: the catalog grid with type filters (projects + the site entry), outro
    projects/[id]/page.tsx     # /projects/<id>: one entry's ProjectBody on its own page, prev/next; generateStaticParams over the catalog
    projects/projects.css      # .pj-*: gallery, lightbox, case study, date box, status, compare, post card, flow diagrams
    projects/feature.css       # .ft-* / .tl-* / .dm-*: the site entry's stats, timeline, pillars, demos
    projects/walkthrough.css   # .wt-* and .pj-links: the panel walkthrough and project link buttons
    contact/page.tsx           # /contact: headline + <ContactBlock heading={false}> (the ways in + the message form)
  api/contact/route.ts         # POST: the message form → Resend REST (honeypot, per-IP throttle, 503 without RESEND_API_KEY)
  api/resume-pdf/route.ts      # 307 redirect to header.json resumePdfPath, for older links
  api/geo/route.ts             # the visitor's country/region/city from Vercel's IP headers, for the analytics Visit event

components/
  GanttChart.tsx               # client-side mermaid Gantt renderer for the job tracker
  JobsTable.tsx                # renders the merged job-tracker rows
  SiteAnalytics.tsx            # client wrapper for Vercel <Analytics>: va-disable opt-out, ?analytics=off/on, per-session "Visit" event
  sheet/                       # the Blue Sheet components (2026-11-08)
    SiteNav.tsx                # floating pill nav (Home · Projects · Contact), condenses at 28px, sliding active tint, theme toggle
    HeroCover.tsx              # the hero card's drawn SVG blueprint band (stroke-draw on load), with the sheet label
    HeroActions.tsx            # Download PDF (opens resumeHtmlPath in a new tab, else downloads the PDF) / Email / LinkedIn / GitHub
    CursorMark.tsx             # monogram chip trailing the pointer across the hero card (Site Settings → Motion → Cursor mark)
    GithubGraph.tsx            # the contribution calendar drawn from lib/github.ts, cells popping in column by column
    Experience.tsx             # roles on a timeline rail; emphasis phrases + Read more links; folds roles over 7 bullets after 6
    Stack.tsx                  # the four skill groups as cards of pills (LinkedSkill for linked ones)
    Education.tsx              # the degree card + a grid of certificate cards
    ProjectGrid.tsx            # the project cards + the dialog; #project-<id>[-case-study] hash routing; type filters
    ProjectCard.tsx            # one tile: cover (or monogram), type and "This site" tags, name, summary line, dates and photo count
    ProjectDialog.tsx          # the dialog: portal into [data-sheet-portal], focus trap, Escape, data-lock scroll lock, Open full page
    ProjectBody.tsx            # everything an entry has: head, gallery, summary, status, bullets, links, case study, walkthrough, deep dive, tracker
    ContactBlock.tsx           # the ways in beside ContactForm (home page foot and /contact)
    ContactForm.tsx            # "Send me a message": POST /api/contact, mailto: fallback on 503, honeypot field
    SiteFooter.tsx             # the monogram, footer note and the Sheet · Rev. · Drawn in title block, on every page
    SmoothScroll.tsx           # inertial wheel scrolling (Site Settings → Motion → Smooth scrolling)
    BrandIcons.tsx             # GitHub and LinkedIn marks drawn to lucide's 24-box
  blueprint/                   # primitives kept from Blueprint Press
    BpMark.tsx                 # the RB monogram SVG: one continuous stroke, gradient along travel
    BpThemeToggle.tsx          # the light/dark switch (in SiteNav)
    ThemeProvider.tsx          # data-theme on <html> + localStorage; useTheme()
    Reveal.tsx                 # framer-motion scroll-entrance wrapper (rise / rule / fade / slide), respects reduced motion
    BulletLink.tsx             # a resume bullet's Read more button (data-motion variants)
    LinkedSkill.tsx            # a skill pill linked to a project or proof, with its hover card
    BackToTop.tsx              # bottom-left "Back to Top"
    CountUp.tsx                # number springs to its value on view (the site entry's stats)
    ScrollWords.tsx            # scroll-scrubbed word brightening (the site entry's intro)
    AnimationSync.tsx          # puts every infinite CSS animation on one beat (Site Settings → Motion → Sync animations)
    StudioLink.tsx             # dev only: "Edit in Studio", mapping the page (and /projects/<id>) to its Studio entry
  content/
    EmphasizedText.tsx         # renders a bullet's `emphasis` phrases as accent-on-hover spans (server-safe)
    Paragraphs.tsx             # Studio body text: an empty line starts a new paragraph; splitParagraphs()
  projects/                    # the project media and deep-dive pieces ProjectBody composes
    ProjectGallery.tsx         # 4:3 (or per-image aspect) next/image grid with clip-path wipes; opens the Lightbox
    Lightbox.tsx               # full-screen original-image viewer (portal to <body>, literal colours, keyboard nav)
    PdfPages.tsx               # every page of a PDF, drawn by pdf.js loaded on demand
    PostCard.tsx               # a captured LinkedIn post: PostButton in the grid, PostCard in the viewer
    CompareImage.tsx           # before/after slider in the image's frame
    ProjectDateBox.tsx         # boxed date range; "ongoing" runs a progress bar
    ProjectStatus.tsx          # a project's status line; fenced code gets a copy button
    CaseStudy.tsx              # expanded case-study markup (sections, tags, diagrams)
    diagrams/                  # FlowDiagram.tsx + flows.ts (inline flowcharts), ThemedSvg.tsx + themed.ts (palette-following SVGs)
    walkthrough/PanelWalkthrough.tsx   # the guided tour of a program's screens
    ProjectFeature.tsx         # the deep-dive composer (owns its Lightbox), the site entry only
    feature/
      FeatureStats.tsx         # CountUp tiles with a CSS stagger and cursor spotlight
      FeatureTimeline.tsx      # time-scaled commit timeline: dots by date, past/present/future, card, tour, mobile list
      FeaturePillars.tsx       # three expandable cards with screenshot thumbnails
      FeatureBackend.tsx       # "Behind the site" rows: a live demo beside notes, sides alternating
      ThemedShot.tsx           # a capture shown in the theme the visitor is NOT using
      demos/ResumeDemo.tsx · StudioDemo.tsx · SkillsDemo.tsx   # the three live replicas

data/
  header.json                  # person, 5 visibility switches, theme (paletteId "blue-sheet" + custom seeds), fonts, layout, motion (syncAnimations, smoothScroll, cursorMark), siteMode, resumePdfPath, resumeHtmlPath
  resumeData.ts                # merges header + home + projects JSON into one typed ResumeData (visible:false filter, order sort, visibility pruning)
  contact/contact.json         # contact meta, hero, details, and the message form's words (Studio: Contact)
  home/
    page.json                  # home meta, hero lines, summary link, section headings (incl. activity, projects), Read more and linked-skill styles, footer
    education.json             # degrees + certificates
    experience.json            # employment history with bullets (`emphasis` phrases; `projectId` kept for Read more, `proofId` stripped at merge)
    skills.json                # 4 skill categories with optional links
    summary.json               # the professional summary
  images/IcarusLiteRender.png  # source image (also duplicated into public/project-images)
  more-info/
    gantt.md                   # hand-authored mermaid Gantt block + markdown tracker table
    more-info.json             # ganttSection (switches, title, tableNote, statusKey), read by lib/catalog.ts; the About copy is kept but not shown (Studio: Application tracker)
    past-applications.json     # the 30 applications from before the site, merged into the tracker table
  projects/
    page.json                  # /projects title, intro, outro, empty-state copy
    projects.json              # 12 projects (six published, six visible:false drafts)
    proofs.json                # 17 evidence entries, the case-study detail layer buildProofView reads; all visible:false today
  site/
    about-site.json            # the site's own catalog entry: hero, dates, summary, bullets, images, case study, feature (stats, timeline, pillars, screenshots, backend) (Studio: About this site)
    interface.json             # shared labels: nav, actions, projects (cards & dialog), activity, case study, gallery, timeline, walkthrough … (Studio: Navigation & labels)
  career-qa/qa-log.json        # Riley's answers to resume-review questions (not read by the site)

lib/
  catalog.ts                   # getCatalog() / getEntry() / getFeatured() / getCatalogTypes(), SITE_PROJECT_ID, CatalogEntry, TrackerSection
  github.ts                    # githubUsername(), parseContributions(), getContributions() (revalidate 3600, no token)
  projects.ts                  # buildProofView() / buildProjectViews(): the ProjectView shape
  applications.ts              # APPLICATION_COLUMNS, buildApplicationRows(): gantt.md rows + past applications, oldest first
  gantt.ts                     # parseGanttFile(): splits gantt.md into {chart, columns, rows}
  copy.ts                      # ui (typed interface.json), fill(), counted()
  skill-links.ts               # skillTargets(): a skill group's links → published targets
  media.ts                     # isPdf / isVideo / pdfPreviewSrc / videoPosterSrc
  aspect.ts                    # aspectRatio() for ImageAspect
  photo-place.ts               # ShownImage, canFloat(), the old Photo Mode placement rules (types still used by ProjectGallery)
  dates.ts                     # isIsoDate, parseIsoDate (UTC), formatDate, daysBetween, todayIso
  build-stamp.ts               # short commit + build date for the footer title block; server-only
  palette.ts                   # PaletteTokens: the ramp, onAccent and the Blue Sheet surfaces (deriveSheetTokens, isDarkPalette); tokensToCssVars()
  palettes.ts                  # the 11 presets (default, blue-sheet, electric, forest, twilight, terracotta, ocean, graphite, amber, rose, slate)
  theme.ts                     # resolveThemeTokens(header.theme) → light + dark token sets
  fonts.ts                     # the eight font options; fontVarExpression()
  useInViewOnce.ts             # once-only IntersectionObserver hook for CSS-stagger reveals (GithubGraph, stats)
  useSpotlight.ts              # writes --sx/--sy on pointer move for the .bp-spot cursor wash (project cards, stats)
  site.ts                      # REPO_URL for commit links and the site entry's GitHub button

types/
  resume.ts                    # ResumeData + nested types (Project, ProjectImage, ResumeVisibility, ThemeSetting, FontSettings, MotionSettings, the ProjectFeature/Timeline types…); still holds the unused ComingSoon* schema
  pages.ts                     # HomePageData, ProjectsPageData, InterfaceData (incl. projects + activity label groups), ReadMoreAnimation, linked-skill styles
  contact.ts                   # ContactData { meta, hero, details, form }
  more-info.ts                 # MoreInfoData (more-info.json)
  about-site.ts                # AboutSiteData (about-site.json)

scripts/
  capture-site-screenshots.mjs # playwright-core recapture of the site entry's screenshots in both themes: home hero, full home, /projects .project-grid, the timeline on /projects/rileybeenders-com, the Studio
  site-stats.mjs               # git-derived stats + key-commit candidates for the site entry; --write refreshes the data file
  check-anchor-hydration.mjs   # replays the anchor-stamping browser extension over /, /projects, /projects/rileybeenders-com, /projects/icarus-lite, /contact
  check-about-site.mjs         # validates data/site/about-site.json, run locally and by the workflow
  unifi-topology.mjs           # redraws a UniFi topology export as a token-driven SVG

studio/                        # the local environment: `npm run site` (site :3000 + Studio :3001) or `npm run studio` alone; none of it deployed
  site.mjs                     # the `npm run site` launcher: gate + Studio in one process, `next dev -H 127.0.0.1 -p 3010` behind the gate
  gate.mjs                     # the device gate on :3000 (reverse proxy; loopback always, LAN devices only while granted)
  access.mjs                   # AccessStore: temporary grants, knock list, address rules
  linkedin.mjs                 # captures a LinkedIn post through a signed-in browser profile
  gif.mjs · video.mjs          # GIF retiming; MP4 compression and poster frames (ffmpeg-static)
  server.mjs                   # JSON API over the FILES allow-list, image picker/uploads, backups, thumbnails, /api/access, /api/linkedin, /api/photo-place (no caller since Photo Mode went); exports startStudio()
  README.md                    # how to run it, add a field or a file, let a phone in
  ui/index.html · studio.css · studio.js · schema.js · fields.js · files.js · devices.js   # the editor shell, schemas per file + RAIL (Home / Projects / About this site / Contact / Site settings), field types, the file Explorer, the Devices panel

ResumeBuilder/
  downloadPublishedResume.ts   # client helper: fetch + validate (%PDF- magic bytes) + download the main resume PDF under its own name
  main-resume/main-resume.html # print source of the main resume pair, edited by update-main-resume
  main-resume/manifest.json    # build record: name, pages, spacingMultiplier, reviewedThrough commit, updated date
  generateResumePdf.ts         # former jsPDF per-request generator; imported by no route
  generateResumeTemplates.mjs  # standalone Node script: draws abstract 1-page/2-page layout mockups

assets/
  fonts/InstrumentSerif-Regular.ttf   # build-time only, for the Satori-rendered OG image (see assets/fonts/README.md)

design/                        # the Claude Design canvases the Blueprint Press direction was chosen from (Main, Mark, Interactions .dc.html + canvas.json); history, not the live system

public/
  project-artifacts/           # diagram SVGs: gallery fallbacks, flowcharts, the UniFi topologies
  project-images/<Project>/    # each published project's photos, picked via the Studio's image picker
  project-images/rileybeenders-com/   # the site entry's captures, <name>-light.png + <name>-dark.png (home-hero, home-full, projects, feature-timeline, studio)
  resume/RileyBeenders_Resume_26311.html|.pdf   # the main resume: Download PDF opens the .html (resumeHtmlPath); /api/resume-pdf serves the .pdf
  README.md                    # how the Download PDF file is published and named

2.JobsApplliedTo/              # original job-posting PDFs, one per application (001–027). Note the double-l spelling.
1.ApplicationsUsed/            # tailored resumes actually submitted per application, PDF + (since 2026-11-07) HTML, plus a 000_ baseline
output/
  pdf/                         # additional generated resume PDF variants + the v1/v2 Disney reference resumes
  resume-html/                 # HTML sources of the tailored resumes
  resumeTemplates/             # output of generateResumeTemplates.mjs (visual mockups)
references/                    # dated snapshot resumes (Apr 2022, Sept 2025, Jan 2026) used as evidence

README.md                      # project description + duplicate Gantt/tracker table + Past Disney Applications + local-dev and Studio instructions
README_TODO.md                 # open content tasks
PRODUCT.md                     # product truth for the impeccable skill (interviewed 2026-09-18, updated for Blue Sheet 2026-11-08)
DESIGN.md                      # the Blue Sheet token spec in Stitch DESIGN.md format
.impeccable/design.json        # DESIGN.md's sidecar (ramps, shadows, motion, component snippets); critique/ is git-ignored run output
skills-lock.json               # source repo + path + content hash for each vendored skill
.markdownlint.jsonc            # markdownlint exceptions
package.json / package-lock.json   # rileybeenders.com 3.1.0, pinned ranges; `site`, `dev`, `build`, `start`, `typecheck`, `studio` scripts
next.config.mjs                # phase-aware: reactStrictMode, dev overlay bottom-right, redirects (/about-this-site, /more-info, /AutoWinUpdater); in dev, allowedDevOrigins = private-network hostnames
tsconfig.json                  # strict TS, @/* path alias, next plugin
next-env.d.ts                  # Next-generated; git-ignored
```

## Folders intentionally not documented as "site" content

- `tmp/`: scratch space (browser profiles, PDF runtimes, one-off Playwright scripts). Git-ignored.
- `private/`: career notes held back from the public repo. Git-ignored.
- `.claude/worktrees/`: Claude Code checkouts. Git-ignored.
- `.studio-backups/`, `.studio-cache/`, `.studio-access.json`: the Studio's rolling backups, thumbnail and LinkedIn caches, and device grants. Git-ignored.
- `.vscode/`: `extensions.json` is tracked; `settings.json` is personal and git-ignored.
- `node_modules/`, `.next/`: standard build and dependency output. Git-ignored.

## Related
- [[Project Overview]]
- [[Architecture and Data Flow]]
- [[Blue Sheet (2026-11 redesign)]]
- [[Home]]
