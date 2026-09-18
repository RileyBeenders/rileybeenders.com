---
tags: [component, routes, data, agents]
---

# About This Site Page

`/about-this-site` is the site as its own case study — the one page that documents itself. It has its own nav tab (the only link drawn in an animated gradient), its own data file, its own Studio entry, and an agent procedure (`site-timeline-sync`) that keeps its numbers and timeline current. Added 2026-09-17, built with the three `motion-*` skills as their first real use.

## Route — `app/(site)/about-this-site/page.tsx`

Server component. Imports `data/site/about-site.json` (typed `AboutSiteData`, `types/about-site.ts`), imports `../projects/projects.css`, `../projects/feature.css`, and `./about-site.css`, and reads `todayIso()` once so the timeline's "now" is identical on server and client. Renders, inside `<main class="pj as">` (the `.pj` class hides the fixed relocation badge, since `BackToTop` takes that corner):

1. **Hero** (`.bp-hero.as-hero`) — `hero.eyebrow`, `hero.title` as the `h1`, the running date bar (`<ProjectDateBox dates position="inline" size="large" />`), a rule, `hero.tagline`.
2. **`01 The site`** — `<AboutSiteStory>` (`components/about-site/AboutSiteStory.tsx`): summary, bullets with `EmphasizedText`, the gallery column (`ProjectGallery`, parallax like a project entry), and the case-study toggle opening `<CaseStudy>` built by `buildProofView()` from `caseStudy` (the page builds a minimal `Project` to call it).
3. **Deep-dive** — `<ProjectFeature feature today projectName>` in a `.bp-section.as-deep`.
4. Outro ("Still moving") and `<BackToTop />`.

## The deep-dive — `components/projects/ProjectFeature.tsx` + `feature/`

`ProjectFeature` owns the one `Lightbox` every screenshot trigger opens (timeline card thumbnails, pillar thumbnails, the screenshot figures), converting `feature.screenshots` into `ProjectImage[]`. It opens with a hairline rule, `feature.eyebrow` via `WordReveal`, `feature.intro` via `ScrollWords`, then four blocks, each rendered only if its data exists:

| Block | Component | What it does |
|---|---|---|
| Stats | `feature/FeatureStats.tsx` | Hairline tiles (`repeat(auto-fit, minmax(160px, 1fr))`) arriving 60ms apart via `useInViewOnce` + a CSS `--i` stagger; each number is a `CountUp`; tiles take the `.bp-spot` cursor wash. |
| Timeline | `feature/FeatureTimeline.tsx` | The centerpiece — see below. |
| Pillars | `feature/FeaturePillars.tsx` | Three hairline cards (`eyebrow`, `title`, first paragraph at rest, "Read more" opens the rest with `AnimatePresence` height-auto), a 16:9 screenshot thumbnail on top that opens the viewer, `.bp-spot` on hover, 70ms stagger. One column under 860px. |
| Screenshots | `feature/FeatureScreenshots.tsx` | Each screenshot in a hairline frame with numbered pins at percent coordinates. Hover/focus a pin (or its legend line) shows the callout; click keeps it open; `Escape` or clicking the frame closes it. Pins ring once (`ft-ping`, 140ms stagger) when the figure first scrolls in. Callouts flip left past 60% width and up past 65% height. An image taller than 1.25:1 (the full-page home capture) gets a scrolling frame (`is-tall`, `max-height: min(720px, 78vh)`), with pins anchored to an inner `.ft-shot-canvas` so they scroll with the image. |

### The timeline

`FeatureTimeline` lays entries on a **time axis**, not an index: `x = 4% + 92% × (date − first) / (last − first)`, where `last` is the later of the last entry and today. Dots alternate above and below the line; two on the same side within 2.6% get a longer stem (`--depth: 2`) so same-day commits never touch. Dot diameter is log-scaled from `insertions + deletions` (8–14px). The solid track (past) fills on view over 1.8s; a dashed track continues from the "now" marker (accent, breathing ring) through the future entries, which are hollow with dashed borders. Month ticks sit on the line with their labels at the bottom of the axis. Era labels — Past / Present / Future — run along the top.

Each dot is a `<button aria-pressed>`; clicking (or `← → Home End` within the group) selects it, and the card below swaps with `AnimatePresence mode="wait"` (opacity + 10px, 0.36s). The card shows the formatted date, an era badge (Shipped / In progress / Planned), the short hash linked to `REPO_URL/commit/<hash>` (`lib/site.ts`), title, summary, tags, `files / +ins / −del`, and a thumbnail if the entry names a `screenshotId`. It opens on the `present` entry, else the latest `past` one.

Under 860px the axis and card are hidden and `.tl-list` — a vertical list of every entry with a dot on a track — takes over; that list is also the reading order for assistive tech. All of this is CSS-only switching, no JS media queries.

## Supporting pieces

| File | Role |
|---|---|
| `components/blueprint/CountUp.tsx` | Number springs from 0 to `to` on view (`useSpring`, `stiffness 100/d`, `damping 20 + 40/d`, from svelte-bits' Count Up), `Intl.NumberFormat`, `tabular-nums`, `aria-live`. Reduced motion renders the final value. |
| `components/blueprint/WordReveal.tsx` | Word-by-word entrance (blur 6→2→0, y 14→2→0 with a 2px overshoot, 60ms stagger) for eyebrows and headings. Tag restricted to a string union so `motion[as]` types. |
| `components/blueprint/ScrollWords.tsx` | A passage whose words brighten 0.25→1 in sequence as it scrolls up the viewport (`useScroll` offset `["start 0.85", "start 0.4"]`, each word owning a slice of the progress), block straightening from 2°. Always a `<p>`. |
| `components/projects/ProjectDateBox.tsx` | The date box / running bar — documented in [[Projects Route (BpComingSoon)]]. |
| `lib/dates.ts` | `isIsoDate`, `parseIsoDate` (UTC), `formatDate` (`long` / `month` / `month-only`), `daysBetween`, `todayIso`. Non-ISO strings pass through untouched so Studio can hold free text. |
| `lib/useInViewOnce.ts` | Class-toggle sibling of `Reveal`'s `viewport.once`: `{ ref, inView }`, falls open without `IntersectionObserver`. |
| `lib/useSpotlight.ts` | `onPointerMove` handler writing `--sx/--sy` on the element for `.bp-spot` (see [[Design System (Blueprint Press)]]). No React state per move. |
| `lib/site.ts` | `REPO_URL` for commit links. |
| `scripts/capture-site-screenshots.mjs` | Recaptures the page's screenshots with `playwright-core` driving the machine's Chrome/Edge (no download) at 1440×900 @2x: home hero light/dark, full-page home, projects, the About hero, this page's own timeline, and the Studio with this page open. Hides the Next dev badge, waits for fonts and non-lazy images (bounded at 4s). Needs `npm run dev` (and `npm run studio` for the Studio shot). |
| `scripts/site-stats.mjs` | Computes the six stats from git and the repo, lists commits since the last hashed timeline entry with key-commit candidates and JSON skeletons; `--write` refreshes the stats in the data file by label; `--json` for machines. |

## Data — `data/site/about-site.json`

Shape (`types/about-site.ts` → `AboutSiteData`): `hero { eyebrow, title, tagline }`, `dates` (`ProjectDates`), `summary`, `bullets` (`ResumeBullet[]`), `images` (`ProjectImage[]`), optional `caseStudy` (`ProjectAdditionalInfo`), `feature` (`ProjectFeature`: `eyebrow`, `intro`, `stats[]`, `timeline[]`, `pillars[]`, `screenshots[]`). The feature types live in `types/resume.ts` next to `Project` (`ProjectStat`, `TimelineEntry` with `era: "past" | "present" | "future"`, `FeaturePillar`, `FeatureScreenshot` + `ScreenshotHotspot`). Screenshots are served from `public/project-images/rileybeenders-com/`.

Edited in the Studio under **About this site** (rail group after More Info; `aboutSite` in `server.mjs` `FILES` and `schema.js`), which round-trips the file byte-for-byte. Refreshed by the `site-timeline-sync` procedure — see [[Repository Agent Skills (.agents)]].

## Nav

`BpNav` gained `{ label: "About this site", href: "/about-this-site", gradient: true }`; the `gradient` flag adds `.bp-nav-link--gradient`, a `background-clip: text` sweep of `--ink → --accent → --blue → --ink` (9s linear, 4.5s on hover) in place of the flat color every other link uses. See [[Blueprint Nav and Mark]]. More Info's "Read more" link now points here (`/about-this-site`, rendered as a `next/link` since it's a site path).

## Related
- [[Projects Route (BpComingSoon)]]
- [[Blueprint UI Components]]
- [[Data Layer and Types]]
- [[Design System (Blueprint Press)]]
- [[Repository Agent Skills (.agents)]]
- [[Routes Overview]]
- [[Home]]
