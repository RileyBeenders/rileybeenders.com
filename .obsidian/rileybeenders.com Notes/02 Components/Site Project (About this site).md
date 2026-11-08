---
tags: [component, routes, data, agents]
---

# Site Project (About this site)

The site documents itself as one entry in its own project catalog. The entry is named **RileyBeenders.com**, has the type **About this site**, and lives at **`/projects/rileybeenders-com`** (and in a dialog from any project grid via `#project-rileybeenders-com`).

- Its data file is `data/site/about-site.json`, edited in the Studio as **About this site**.
- An agent procedure, `site-timeline-sync`, keeps its numbers and timeline current, automatically after every push to `main` through a GitHub Actions workflow (see [[Build Tooling and Config]]).
- At its foot sits the **job-application tracker** (`#tracker`).

Until the Blue Sheet redesign of 2026-11-08 this was the `/about-this-site` page (added 2026-09-17), with its own nav tab, layout and `AboutSiteStory` component, and the tracker was section 03 of `/more-info`. Both routes now redirect here (see [[Routes Overview]]). The old page is described in [[Blueprint Press (2026-08 to 2026-11)]]. This note was **About This Site Page** before the redesign.

## How the entry is built: `lib/catalog.ts`

`siteProject()` reshapes `about-site.json` into the same `Project` the other entries use:

| `Project` field | From `about-site.json` |
|---|---|
| `id` | `SITE_PROJECT_ID`, `"rileybeenders-com"` |
| `name` | `caseStudy.title` ("RileyBeenders.com"), else `hero.title` |
| `type` | `hero.title` ("About this site"), which is the card's type tag and the filter chip |
| `summary`, `bullets`, `images`, `dates` | The same keys (`dates`: `2026-06-28`, `ongoing`, so the date box runs its progress bar) |
| `additionalInfo` | `caseStudy`, which `buildProofView(site, [])` turns into the case study |
| `links` | One button, `feature.repoLabel` ("GitHub") → `REPO_URL` (`lib/site.ts`) |

The `CatalogEntry` adds:

- `tagline: hero.tagline`;
- `isSite: true` (the "This site" badge and the accent border on its card);
- `feature: aboutSite.feature` (the deep dive below);
- `tracker`, read by `tracker()` (below).

It is always the **last** entry. With Site Settings → Visibility → Projects off, it is the only one.

`about-site.json` keys that no longer render: `meta` (the page's own title and description; the project page now titles itself "`<name>` | Riley Beenders" and describes itself with the tagline), `storyHeading`, and `outro` ("Still moving.").

## Where it renders

`ProjectBody` renders the entry like any other (see [[Project Catalog and Dialog]]): the head (type eyebrow, name, tagline, the running date box, photo count), the light/dark hero gallery, the summary and bullets, the GitHub link, and the case-study toggle. Two blocks only this entry carries come after that:

1. **The deep dive**: `<ProjectFeature feature projectName today paletteId>`. `today` comes from the server, so the timeline's "now" is the same on server and client. `paletteId` comes from Site Settings, so the Studio replica starts on the real palette.
2. **The tracker**: `section#tracker` with `GanttChart` and/or `JobsTable`.

In the dialog both sit inside the scrolling `.dlg-body`. On `/projects/rileybeenders-com` they run full width in the shell.

## The deep dive: `components/projects/ProjectFeature.tsx` + `feature/`

`ProjectFeature` owns the one `Lightbox` every screenshot trigger opens (the timeline card thumbnails and the pillar thumbnails). It converts `feature.screenshots` into `ProjectImage[]`, picking, like the thumbnails, the capture from the *other* theme (`useTheme()`: on a light site it uses `srcDark`). It opens with a hairline rule and `feature.intro` via `ScrollWords`, then four blocks, each rendered only if its data exists. The block titles ("Timeline", "What it's made of", "Behind the site") are `h2`s and the cards inside them `h3`s. The headings come from `feature.timelineTitle`, `timelineNote`, `pillarsTitle` and `backend.eyebrow`; a blank heading hides it. The shared labels (timeline badges and axis, tour state, Read more / Less) are in `data/site/interface.json`.

| Block | Component | What it does |
|---|---|---|
| Stats | `feature/FeatureStats.tsx` | Hairline tiles (`repeat(auto-fit, minmax(160px, 1fr))`) arriving 60ms apart via `useInViewOnce` + a CSS `--i` stagger. Each number is a `CountUp`. The tiles take the `.bp-spot` cursor wash. |
| Timeline | `feature/FeatureTimeline.tsx` | The centerpiece, described below. |
| Pillars | `feature/FeaturePillars.tsx` | Three hairline cards (`title` as an `h3`, the first paragraph at rest, "Read more" opening the rest with an `AnimatePresence` height-auto). A 16:9 screenshot thumbnail on top opens the viewer. `.bp-spot` on hover, a 70ms stagger, one column under 860px. |
| Behind the site | `feature/FeatureBackend.tsx` | One row per backend tool (`feature.backend.items`): a live replica on one side, the notes (an `h3`, paragraphs, a hairline list) on the other, sides alternating. Stacked under 860px. |

`feature.css` keeps its own 860px breakpoint for these blocks; the Blue Sheet shell breaks at 1000/980/760.

### The demos: `feature/demos/`

Real, scoped-down versions of the tools they stand for (`.dm-*` in `feature.css`):

- **`ResumeDemo.tsx`** (`demo: "resume"`): a posting card of keyword chips beside a miniature resume whose lines are real bullets from `experience.json`. Hovering or focusing a chip lights its line, and a connector labelled `create-custom-resume-pdf` joins the two. "Generate PDF" walks the lines 240ms apart, then shows the skill's three checks (page size, every keyword backed, links verified).
- **`StudioDemo.tsx`** (`demo: "studio"`): a miniature Studio window (status, a Save button, a Site Settings rail, a Palette radio group of every preset in `lib/palettes.ts`, an "Open to relocation" switch) beside a miniature home hero recoloured live from the chosen preset's tokens. It starts on the site's real palette (`paletteId`, today `blue-sheet`).
- **`SkillsDemo.tsx`** (`demo: "skills"`): the repo's skill router. A rail of procedures, an accent indicator that springs between them (`layoutId`), and a card with what triggers each skill and what it does. It advances every 4.2s until the visitor takes over.

Each one turns its motion off under reduced motion.

### Themed captures: `feature/ThemedShot.tsx`

Every screenshot has a light capture (`src`) and a dark one (`srcDark`). `ThemedShot` renders both `<img>`s, and `.ft-themed` shows the one for the theme the visitor is *not* in (`html[data-theme]`, stamped before hydration). A shot with no `srcDark` renders its one image untagged, so neither theme hides it. It is used by the timeline card, the pillars and the [[Panel Walkthrough]]. The lightbox makes the same choice in JS. The entry's own gallery (the two hero shots) is exempt; it is the light/dark comparison.

### The timeline

`FeatureTimeline` lays entries on a **time axis**, not an index: `x = 4% + 92% × (date − first) / (last − first)`, where `last` is the later of the last entry and today.

- **Dots.** They alternate above and below the line, and two on the same side within 2.6% get a longer stem. The dot diameter is log-scaled from `insertions + deletions` (8–14px).
- **Track.** The solid past track fills on view over 1.8s. A dashed track continues from the "now" marker (accent, a breathing ring) through the future entries, which are hollow.
- **The card.** Each dot is a `<button aria-pressed>`. Clicking it (or `← → Home End`) swaps the card below: date, era badge, the short hash linked to `REPO_URL/commit/<hash>`, title, summary, tags, `files / +ins / −del`, and a thumbnail when the entry names a `screenshotId`.
- **Stars and connectors.** `mark: "star"` and `linkFrom: "<id>"` draw a captioned connector between two moments (today: the K2 Space resume → "K2 Space reached out", 7 days).
- **The tour.** Left alone, it plays through the entries, resting 6s on each, with a ring-shaped pause/play control. Choosing a dot ends the tour, and keyboard focus inside the timeline pauses it. Under reduced motion it lands on the `present` entry and leaves the tour opt-in.
- **Narrow screens.** Under 860px `.tl-list`, a vertical list of every entry, replaces the axis. That list is also the reading order for assistive tech.

## The tracker at the foot (`#tracker`)

`tracker()` in `lib/catalog.ts` (cached) reads `data/more-info/more-info.json` → `ganttSection`. With both `tableVisible` and `chartVisible` off it returns `null`, and the section is not rendered. Otherwise it reads `data/more-info/gantt.md` with `readFileSync(path.join(process.cwd(), …))` and parses it with `parseGanttFile()`. It returns `{ title, intro, tableNote, statusKey, columns: APPLICATION_COLUMNS, rows: buildApplicationRows(parsed, past-applications.json), chart (only when chartVisible), table: tableVisible }`. A read error also yields `null`.

`ProjectBody` renders it as `section#tracker`: the `h3` title, the intro, `<GanttChart>` when the chart is on, and when the table is on, the `tableNote`, the 🟢 / 🟠 / 🔴 `.bp-table-key`, and `<JobsTable singleLine>` in a sideways-scrolling `data-native-scroll` wrapper. **Today the table is on and the chart is off.** Gray rows are the applications from before the site. Detail in [[GanttChart JobsTable and gantt.ts]] and [[More Info and Gantt Data]].

## Supporting pieces

| File | Role |
|---|---|
| `components/blueprint/CountUp.tsx` | A number that springs from 0 to `to` on view (`useSpring`), with `Intl.NumberFormat`, `tabular-nums` and `aria-live`. Under reduced motion it renders the final value. |
| `components/blueprint/ScrollWords.tsx` | A passage whose words brighten 0.25 → 1 in sequence as it scrolls up the viewport (`useScroll` offset `["start 0.85", "start 0.4"]`). |
| `components/projects/ProjectDateBox.tsx` | The running date box, documented in [[Project Catalog and Dialog]]. |
| `lib/dates.ts` | `isIsoDate`, `parseIsoDate` (UTC), `formatDate`, `daysBetween`, `todayIso`. |
| `lib/useInViewOnce.ts` / `lib/useSpotlight.ts` | The once-only in-view hook and the `--sx/--sy` cursor wash. |
| `lib/site.ts` | `REPO_URL`, for commit links and the entry's GitHub button. |
| `scripts/capture-site-screenshots.mjs` | Recaptures the entry's screenshots with `playwright-core` (the machine's Chrome/Edge) at 1440×900 @2x, each in **both** themes via the real toggles. The shots are the home hero, the full home page, `/projects` (scrolled to `.project-grid`), the timeline on `/projects/rileybeenders-com` (`.pbody .tl`), and the Studio with this entry open, written as `<name>-light.png` / `<name>-dark.png` into `public/project-images/rileybeenders-com/`. It needs `npm run site` (the Studio shots are skipped if :3001 is down), and it hides the dev badge and the Edit in Studio control. The 2026-11-08 run retook all but the `studio-*` pair. |
| `scripts/site-stats.mjs` | Computes the six stats from git and the repo, and lists commits since the last hashed timeline entry with key-commit candidates. `--write` refreshes the stats in the data file. |
| `scripts/check-about-site.mjs` | Validates the data file (dates in order, known eras, at most one `present`, real hashes, resolvable connectors and `screenshotId`s, the six stats). It exits 1 with a list on failure. It runs before committing, and in the workflow. |

## Data: `data/site/about-site.json`

The shape is `types/about-site.ts` → `AboutSiteData`: `meta`, `hero { title, tagline }`, `storyHeading`, `outro { lead, body }`, `dates`, `summary`, `bullets`, `images`, optional `caseStudy` (`ProjectAdditionalInfo`), and `feature` (`ProjectFeature`: `intro`, `stats[]`, `timeline[]`, `pillars[]`, `screenshots[]`, `backend`, and the heading fields). The feature types live in `types/resume.ts`. The screenshots are served from `public/project-images/rileybeenders-com/`.

As of 2026-11-08:

- **The timeline** holds 26 entries: 24 past, 1 present ("Blue Sheet: the redesign", 2026-11-08), and 1 planned ("contact@ inbox and the beta cut-over", 2026-12-01).
- **The six stats** read Commits 195 · Days in motion 133 · Agent skills 48 · Vault notes 50 · Applications tracked 27 · Projects queued 6.
- **The design pillar** gained a paragraph on Blue Sheet, and the hero captions say "Blue Sheet".

It is edited in the Studio under **About this site**. The rail group is "About this site" → `/projects/rileybeenders-com`, holding the `aboutSite` and `moreInfo` keys, the latter relabelled **Application tracker**. `StudioLink` on this page opens `#aboutSite`. It is refreshed by the `site-timeline-sync` procedure, locally on request and unattended after every push to `main` by `.github/workflows/site-timeline-sync.yml` (see [[Repository Agent Skills]]).

## Related
- [[Project Catalog and Dialog]]
- [[Sheet Components (Home Page)]]
- [[More Info and Gantt Data]]
- [[Data Layer and Types]]
- [[Design System (Blue Sheet)]]
- [[Repository Agent Skills]]
- [[Routes Overview]]
- [[Blue Sheet (2026-11 redesign)]]
- [[Home]]
