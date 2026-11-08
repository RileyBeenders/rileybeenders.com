---
tags: [history, design, styling, architecture, redesign]
---

# Blue Sheet (2026-11 redesign)

**Blue Sheet** is the site's current design. On **2026-11-07** Riley asked for a complete fresh UI makeover that kept the same data, the same wording and the same site function. It was built overnight on **2026-11-08** on the branch `design/UI_Refresh` and replaced [[Blueprint Press (2026-08 to 2026-11)|Blueprint Press]], which had been the design since 2026-08-27.

It is meant for the coming application season, from the end of 2026 into 2027. It runs first as **beta.rileybeenders.com** off this branch, and merges to `main` (the live rileybeenders.com) after that. The full token specification is the repo-root `DESIGN.md` (name: Blue Sheet). The working reference for the stylesheet and tokens is [[Design System (Blue Sheet)]].

## Why: the brief and the reference sites

Riley named reference portfolios to take cues from. The handoff for this redesign described four, but names only three sites; the fourth is not on record. Each named site contributed something specific:

| Site | What Blue Sheet took from it | Where it lives now |
|---|---|---|
| palakonweb.in | A light/dark theme whose dark mode deepens the accent instead of brightening it | `deriveSheetTokens()` in `lib/palette.ts` (`--accent-fill`) |
| palakonweb.in | A profile-card hero | `.hero-card` in `app/(site)/page.tsx` |
| palakonweb.in | A GitHub contribution calendar | `components/sheet/GithubGraph.tsx` + `lib/github.ts` |
| palakonweb.in | Tech-stack cards | `components/sheet/Stack.tsx` |
| palakonweb.in | A message form | `components/sheet/ContactForm.tsx` + `app/api/contact/route.ts` |
| liumichelle.com | Project tiles that open into a dialog, with a full page behind each one | `ProjectGrid` / `ProjectCard` / `ProjectDialog` and `app/(site)/projects/[id]/page.tsx` |
| imdaryl.com | The blueprint intro: a drawn cover across the hero | `components/sheet/HeroCover.tsx` |
| imdaryl.com | Smooth motion | `components/sheet/SmoothScroll.tsx`, `CursorMark.tsx`, the nav's sliding active tint |

The constraints from `PRODUCT.md` held throughout. The page reads as the resume at rest. Every claim traces to `data/`. Content edits never touch code. Motion stays subtle. The Studio stays local-only. The monogram, the Studio's palette and font switching, the resume section order and the fluid motion carried over.

## What changed

### The look

A cool blue-white drafting sheet (`#f4f7fd`) with a faint blueprint grid at the top that dissolves as the page scrolls. On screens 1000px and wider the content sits inside a dashed cut line with `+` registration marks (`.sheet-frame`). Everything sits in rounded cards (radii 10 / 16 / 24 / 30px) with quiet ink-tinted shadows. One blue does five jobs: `tint`, `accent-soft`, `accent`, `accent-fill` and `glow`. Headings are Instrument Serif, body text is **Inter** (it was Spectral), and dates, counts and tags are IBM Plex Mono. In dark mode the sheet goes near-black navy (`#070b15`) and the ink lifts to pale blue-white. The accent lightens for text (`#6a93ff`), but every fill cuts deeper (`--accent-fill`, the accent mixed 30% toward black: `#4a67b3`). Detail in [[Design System (Blue Sheet)]].

- `app/(site)/sheet.css` (1,120 lines) replaces `app/(site)/blueprint.css` (deleted). The token names are unchanged (`--paper --white --ink --ink-soft --muted --faint --rule --accent --blue --prose --pill-text --on-accent`), so `bullet-link.css`, `skill-pills.css` and `projects/*.css` follow the palette untouched. Four tokens are new: `--tint`, `--accent-soft`, `--accent-fill` and `--glow`.
- `lib/palette.ts` gained `isDarkPalette()` and `deriveSheetTokens()`, and `derivePaletteTokens()` spreads the latter, so every preset and the custom palette carry the four new tokens. `lib/palettes.ts` gained the `blue-sheet` preset. Light seeds: paper `#f4f7fd`, white `#ffffff`, ink `#0d182c`, accent `#2457e6`, blue `#173ea8`. Dark seeds: `#070b15`, `#0e1627`, `#e8eefb`, `#6a93ff`, `#9db9ff`. The hand-tuned Default preset now runs its base through `deriveSheetTokens()` too. There are eleven presets: default, blue-sheet, electric, forest, twilight, terracotta, ocean, graphite, amber, rose and slate.
- `data/header.json`: `theme.paletteId` `"electric"` → `"blue-sheet"`, `fonts.body` `"spectral"` → `"inter"`, and `motion` gained `smoothScroll: true` and `cursorMark: true`.

### Navigation and routes

- The nav is **Home · Projects · Contact**: a floating pill, `components/sheet/SiteNav.tsx`, described in [[Site Nav and Mark]]. It replaces the five-link `BpNav`.
- `/about-this-site` and `/more-info` are **deleted**. The site itself is now an entry in the project catalog, at **`/projects/rileybeenders-com`**, and the application tracker is a section at the foot of that page (`#tracker`).
- New route **`/projects/[id]`** (`app/(site)/projects/[id]/page.tsx`): every catalog entry has its own static page (`generateStaticParams()`, `dynamicParams = false`), with previous/next links.
- New API route **`/api/contact`**, which receives the message form.

#### Redirects (`next.config.mjs`)

| From | To | Kind |
|---|---|---|
| `/about-this-site` | `/projects/rileybeenders-com` | temporary (307) |
| `/more-info` | `/projects/rileybeenders-com#tracker` | temporary (307) |
| `/AutoWinUpdater` | the RB's Auto App Updater `install.ps1` on GitHub | temporary (307), unchanged |

### The home page (`app/(site)/page.tsx`, now `async`)

In order, top to bottom:

1. **Hero card**: `HeroCover` (a drawn SVG blueprint band), a monogram avatar, the "Open to relocation" chip, the name, the title with a blinking caret, a meta line (location, current role), `HeroActions`, and `CursorMark`.
2. **GitHub activity**: `GithubGraph`, fed by `lib/github.ts`, which reads GitHub's public contributions fragment on the server with `next: { revalidate: 3600 }`. That makes `/` ISR with a one-hour refresh. No token or third-party service is involved.
3. **Who is Riley?**: the summary beside four fact cards.
4. **Experience**: a timeline rail. It keeps the reactive emphasis and the Read more links. A role with more than seven bullets shows six and a "Show N more" button.
5. **Projects**: a `ProjectGrid` of the whole catalog, with "View all projects".
6. **Tech & hardware stack**: four skill-group cards of pills. `LinkedSkill` is kept.
7. **Education**, then the contact block (the ways in, plus `ContactForm`), the `SiteFooter` title block, and `BackToTop`.

The relocation badge, the hero ribbon and the page spine are gone. Components in [[Sheet Components (Home Page)]].

### Projects

- `/projects` is a grid of cards with type filter chips.
- A card opens its project in `ProjectDialog`. The URL hash is the state: `#project-<id>` opens the dialog, and `#project-<id>-case-study` also opens the case study. That means the resume's Read more links, linked skills, shared links and the back button all work as before.
- The dialog's "Open full page" goes to `/projects/<id>`. The dialog and the page render the same `ProjectBody`: gallery, summary, status, bullets, links, the case study behind a toggle, `PanelWalkthrough`, `ProjectFeature` (the site entry's deep dive), and the tracker (the site entry only).
- The dialog portals into `[data-sheet-portal]` inside `.bp`, so the palette tokens resolve there. It traps focus, closes on Escape and locks page scroll with `data-lock` on `<html>`.
- Photo Mode is gone. `ProjectEntry`, its parallax and both spines are gone.

Detail in [[Project Catalog and Dialog]] and [[Site Project (About this site)]].

### The catalog (`lib/catalog.ts`)

`getCatalog()` returns every card in order: the published projects (`buildProjectViews()`, sorted by `order`), then the site itself. The site entry is built from `data/site/about-site.json` with `SITE_PROJECT_ID = "rileybeenders-com"`: `caseStudy.title` as the name, `hero.title` ("About this site") as the type, `hero.tagline` as the card line, `feature` as the deep dive, and a GitHub link.

The site entry also carries the **tracker**: `data/more-info/gantt.md` parsed by `parseGanttFile()`, rows merged with `data/more-info/past-applications.json` by `buildApplicationRows()`, and the `more-info.json` `ganttSection` switches and copy. With the Projects switch off (`visibility.projectsSection: false`) the catalog is the site entry alone.

### Contact and the message form

- `/contact` is now the headline plus the same `ContactBlock` the home page ends with: the ways in (email, LinkedIn, GitHub, location) beside "Send me a message".
- `ContactForm` posts `{ name, email, message, company }` to `/api/contact`. `company` is a hidden honeypot.
- `app/api/contact/route.ts` validates the fields (length caps, an email shape check), quietly answers `ok` to a filled honeypot, and throttles five posts per IP per 10 minutes (in memory, per instance). It then sends through **Resend's REST API** with one `fetch`, no SDK, with `reply_to` set to the visitor.
- Without the key, the route answers **503**, and the form opens the visitor's own mail app with the message filled in, so a message is never lost.

### Motion

The existing motion system is kept: one easing curve, `Reveal`, `AnimationSync`, the monogram draw, the Read more and linked-skill animations. Added:

- `SmoothScroll`: inertial wheel scrolling (lerp 0.11). It steps aside for touch, pen, pinch zoom, reduced motion, inner scrollers and `data-native-scroll`, and while `data-lock` is set. If its frame loop has not ticked for 160ms (a background tab, a stalled loop), the next wheel event jumps straight to where the page was headed instead of being swallowed.
- `CursorMark`: a monogram chip that trails the pointer on a spring across the hero card. Pointer devices only.
- The nav's active tint slides between links with a shared `layoutId`, and the nav condenses after 28px of scroll.
- The hero cover draws its strokes on, the calendar cells pop in column by column, and the dialog scales in from 97%.

Both new behaviours are Studio switches.

## File map

**Added**

| Path | What it is |
|---|---|
| `app/(site)/sheet.css` | The Blue Sheet stylesheet, scoped under `.bp`, in banner-commented sections (layout, nav, theme toggle, buttons, card, hero, activity, summary, experience, projects, dialog, project body, stack, education, contact, footer, tables, marks, floating controls, responsive) |
| `app/(site)/projects/[id]/page.tsx` | A catalog entry on its own page |
| `app/api/contact/route.ts` | The message form's endpoint (Resend) |
| `components/sheet/SiteNav.tsx` | The floating pill nav |
| `components/sheet/HeroCover.tsx`, `HeroActions.tsx`, `CursorMark.tsx` | The hero card's band, button row and pointer chip |
| `components/sheet/GithubGraph.tsx` | The contribution calendar |
| `components/sheet/Experience.tsx`, `Stack.tsx`, `Education.tsx` | The resume sections |
| `components/sheet/ProjectGrid.tsx`, `ProjectCard.tsx`, `ProjectDialog.tsx`, `ProjectBody.tsx` | Cards, hash routing, dialog, the shared project body |
| `components/sheet/ContactBlock.tsx`, `ContactForm.tsx` | The ways in and the message form |
| `components/sheet/SiteFooter.tsx` | The footer title block, on every page |
| `components/sheet/SmoothScroll.tsx` | Inertial wheel scrolling |
| `components/sheet/BrandIcons.tsx` | GitHub and LinkedIn marks (lucide dropped its brand icons) |
| `lib/catalog.ts` | `getCatalog()`, `getEntry()`, `getFeatured()`, `getCatalogTypes()`, `SITE_PROJECT_ID`, `TrackerSection`, `CatalogEntry` |
| `lib/github.ts` | `githubUsername()`, `parseContributions()`, `getContributions()` |
| `.env.example` | The three contact-form variables |

**Deleted:** `app/(site)/blueprint.css`, `app/(site)/about-this-site/page.tsx` + `about-site.css`, `app/(site)/more-info/page.tsx`, `components/about-site/AboutSiteStory.tsx`, `components/blueprint/{BpNav,BpActions,HeroRibbon,PageSpine,BpComingSoon,BpRelocationBadge,WordReveal}.tsx`, and `components/projects/{ProjectEntry,ProjectListSpine,InlinePhoto,PhotoMode}.tsx`.

**Kept:** `components/blueprint/{BpMark,BpThemeToggle,ThemeProvider,Reveal,BulletLink,LinkedSkill,BackToTop,CountUp,ScrollWords,AnimationSync,StudioLink}.tsx`, every other file in `components/projects/` (gallery, lightbox, PDF pages, post card, compare, date box, status, case study, diagrams, walkthrough, `ProjectFeature` and `feature/*`), `components/content/*`, `components/GanttChart.tsx`, `components/JobsTable.tsx`, `lib/photo-place.ts` (`ProjectGallery` imports its types), and the stylesheets `bullet-link.css`, `skill-pills.css`, `projects/projects.css`, `projects/feature.css` and `projects/walkthrough.css`. The site layout now imports all five after `sheet.css`.

**Changed:** `app/(site)/layout.tsx` (sheet chrome, motion switches, the portal host), the three page files, `components/blueprint/StudioLink.tsx`, `lib/palette.ts`, `lib/palettes.ts`, `next.config.mjs`, `studio/ui/schema.js`, `types/{pages,contact,resume}.ts`, the data files below, `scripts/capture-site-screenshots.mjs`, `scripts/check-anchor-hydration.mjs`, `PRODUCT.md`, `DESIGN.md`, `.impeccable/design.json`, and `CLAUDE.md`.

## Data and Studio field additions

| File | Change | Type |
|---|---|---|
| `data/header.json` | `paletteId: "blue-sheet"`, `fonts.body: "inter"`, `motion.smoothScroll`, `motion.cursorMark` | `MotionSettings` in `types/resume.ts` |
| `data/site/interface.json` | `nav` lost `moreInfo` / `aboutSite`. New `projects` group: `openFull`, `close`, `viewAll`, `all`, `siteBadge`, `position`, `photos`, `onePhoto`. New `activity` group: `total`, `less`, `more`, `unavailable`, `profile` | `InterfaceData` in `types/pages.ts` |
| `data/home/page.json` | `headings.summary` "Who is Riley?", `headings.skills` "Tech & hardware stack", new `headings.activity` "GitHub activity", new `headings.projects` "Projects" | `HomePageData` |
| `data/contact/contact.json` | New `form` group: `title`, `nameLabel`, `emailLabel`, `messageLabel`, `send`, `sending`, `sent`, `failed`, `fallback` | `ContactForm` / `ContactData` in `types/contact.ts` |
| `data/site/about-site.json` | Stats refreshed (Commits 195). Timeline brought forward to 26 entries (24 past, 1 present, 1 planned): "ExtrusionStudio and the network publish" (2026-10-17), "Interactive HTML resumes" (2026-11-07), present "Blue Sheet: the redesign" (2026-11-08), and planned "contact@ inbox and the beta cut-over" (2026-12-01). The design pillar gained a Blue Sheet paragraph. The hero captions say "Blue Sheet" | `AboutSiteData` (unchanged) |

**Studio** (`studio/ui/schema.js`):

- New `blue-sheet` palette swatch.
- Site Settings → Motion gained **Smooth scrolling** and **Cursor mark** (both `omitWhenDefault`).
- Navigation & labels gained **Project cards & dialog** and **GitHub activity**.
- Home page headings gained **GitHub activity** and **Projects**.
- Contact gained **Message form**.
- The More Info file is relabelled **Application tracker**, with its About copy marked as kept but not shown.

The **RAIL** is now Home (`/`) · Projects (`/projects`) · About this site (`/projects/rileybeenders-com`, keys `aboutSite` + `moreInfo`) · Contact (`/contact`) · Site settings. `StudioLink` maps `/projects/<id>` to `#projects/<id>`, the site's own entry (by page or by `#project-rileybeenders-com`) to `#aboutSite`, and drops `-case-study` from a hash.

## Environment variables

From `.env.example`. Copy it to `.env.local`, which is git-ignored. Only the form needs these, and the site builds and runs without them.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | The Resend key for the verified sending domain. Never public. Without it, `/api/contact` answers 503 and the form falls back to `mailto:` |
| `CONTACT_TO` | The one inbox every message lands in. Intended: `contact@rileybeenders.com` (not yet created). Also required for sending |
| `CONTACT_FROM` | The verified sender, e.g. `"RileyBeenders.com <contact@rileybeenders.com>"`. Optional. Defaults to `<person.name> <contact@rileybeenders.com>` |

On Vercel these go in the project's environment variables for the beta deployment. `NEXT_PUBLIC_STUDIO_URL` is unrelated: `npm run site` sets it in development only.

## Scripts and screenshots

- `scripts/capture-site-screenshots.mjs` now shoots `.project-grid` on `/projects` and the timeline (`.pbody .tl`) on `/projects/rileybeenders-com`, instead of `.pj-entry` and `/about-this-site`.
- `scripts/check-anchor-hydration.mjs` defaults to `/`, `/projects`, `/projects/rileybeenders-com`, `/projects/icarus-lite` and `/contact`.
- `scripts/site-stats.mjs --write` refreshed the stats (195 commits).
- New captures were taken in both themes into `public/project-images/rileybeenders-com/`: `home-hero`, `home-full`, `projects` and `feature-timeline`. The `studio-*.png` pair was **not** recaptured, because the Studio was not running.

## The resume files (HTML beside PDF)

The redesign does not change the resume chain, but the resume files changed shape the day before, and the site's Download PDF depends on them:

- **Tailored applications.** Since 2026-11-07, each tailored application has an interactive HTML resume beside its PDF: `1.ApplicationsUsed/<ID>-RileyBeenders-<Job_Title>.html`. Five exist so far (022, 024, 025, 026, 027). They are built by the `create-custom-resume-html` skill (`scripts/build-web-resume.mjs`) from the same verified source as the PDF. `scripts/verify-web-resume.mjs` proves the printed HTML matches the PDF page for page. The PDF stays the primary upload, and the HTML goes alongside it where an employer accepts HTML.
- **The main resume.** The untailored pair is `public/resume/RileyBeenders_Resume_26311.html` + `.pdf`, also kept in `.DefaultResume/`. It is published by `update-main-resume` (`RileyBeenders_Resume_<YY><DDD>`, here 2026 day 311). `data/header.json` points at it through `resumeHtmlPath` and `resumePdfPath`.
- **On the site.** The home page's **Download PDF** (`HeroActions`) opens the HTML in a new tab, and that page's own **Print / PDF** button saves the file. With no `resumeHtmlPath` set, the button downloads the PDF directly. `/api/resume-pdf` still redirects to the PDF for older links.
- **What did not change.** The chain `create-custom-resume-pdf` → `grill-my-resume` → `fix-my-resume` and its skills are untouched. The HTML resume template (`.claude/skills/create-custom-resume-html/assets/web-resume-template.html`) still styles the screen layer in the Blueprint Press look (Instrument Serif + Spectral, the Electric palette), so it no longer matches the site exactly. Restyling it is a separate decision.

Pipeline detail in [[Resume PDF Pipeline]].

## Follow-ups

- **The contact inbox is not set up.** `contact@rileybeenders.com` does not exist yet, and there is no Resend account or key, so the live form opens the visitor's mail app. Once they exist: verify the domain in Resend, then set the three variables on the beta and production deployments.
- **The Studio screenshots are stale.** `public/project-images/rileybeenders-com/studio-light.png` / `studio-dark.png` still show the Studio as it was before. To refresh them, run `npm run site` and then `node scripts/capture-site-screenshots.mjs`.
- **The beta subdomain is not live.** beta.rileybeenders.com is not yet pointed at `design/UI_Refresh`.
- **The Hard-Copy files still carry Electric.** `components/GanttChart.tsx` (mermaid `themeVariables`), `app/icon.svg`, `app/apple-icon.tsx` and `app/opengraph-image.tsx` still hold Electric's `#3e6ae1` / `#171a20` / `#ffffff`. The redesign did not touch them, and `DESIGN.md`'s Hard-Copy Rule says a palette change must reach them by hand.
- **Copy that no longer renders.** `about-site.json` `meta`, `storyHeading` and `outro`, and `more-info.json` `aboutHeader`, `aboutMe` and `aboutSite` (the Studio's Application tracker file marks the last three as kept but not shown). `interface.json` `projects.position` ("Project {index} of {count}") is a Studio field that no component reads yet.
- **A Studio endpoint with no caller.** `POST /api/photo-place` in `studio/server.mjs` lost its only caller with Photo Mode. `ProjectGallery` still accepts an `editing` prop that nothing passes, and no project carries a `place`.

## Related
- [[Blueprint Press (2026-08 to 2026-11)]]
- [[Design System (Blue Sheet)]]
- [[Routes Overview]]
- [[Project Catalog and Dialog]]
- [[Site Project (About this site)]]
- [[Sheet Components (Home Page)]]
- [[Resume PDF Pipeline]]
- [[Impeccable Design Workflow]]
- [[Home]]
