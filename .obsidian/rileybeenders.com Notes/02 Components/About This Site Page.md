---
tags: [component, routes, data, agents]
---

# About This Site Page

`/about-this-site` is the site as its own case study — the one page that documents itself. It has its own nav tab (the only link drawn in an animated gradient), its own data file, its own Studio entry, and an agent procedure (`site-timeline-sync`) that keeps its numbers and timeline current. Added 2026-09-17, built with the three `motion-*` skills as their first real use; revised 2026-09-18 to replace the pinned-screenshot section with live "Behind the site" demos and to show every capture in the theme the visitor is *not* using.

## Route — `app/(site)/about-this-site/page.tsx`

Server component. Imports `data/site/about-site.json` (typed `AboutSiteData`, `types/about-site.ts`), imports `../projects/projects.css`, `../projects/feature.css`, and `./about-site.css`, and reads `todayIso()` once so the timeline's "now" is identical on server and client. Renders, inside `<main class="pj as">` (the `.pj` class hides the fixed relocation badge, since `BackToTop` takes that corner):

1. **Hero** (`.bp-hero.as-hero`) — `hero.eyebrow`, `hero.title` as the `h1`, the running date bar (`<ProjectDateBox dates position="inline" size="large" />`), a rule, `hero.tagline`.
2. **`01 The site`** — `<AboutSiteStory>` (`components/about-site/AboutSiteStory.tsx`): summary, bullets with `EmphasizedText`, the gallery column (`ProjectGallery`, parallax like a project entry), and the case-study toggle opening `<CaseStudy>` built by `buildProofView()` from `caseStudy` (the page builds a minimal `Project` to call it).
3. **Deep-dive** — `<ProjectFeature feature today projectName>` in a `.bp-section.as-deep`.
4. Outro ("Still moving") and `<BackToTop />`.

## The deep-dive — `components/projects/ProjectFeature.tsx` + `feature/`

`ProjectFeature` owns the one `Lightbox` every screenshot trigger opens (timeline card thumbnails, pillar thumbnails), converting `feature.screenshots` into `ProjectImage[]` — picking, like the thumbnails, the capture from the *other* theme (`useTheme()`; light site → `srcDark`). It takes `paletteId` (Site Settings) so the Studio replica starts on the site's real palette. It opens with a hairline rule, `feature.eyebrow` via `WordReveal`, `feature.intro` via `ScrollWords`, then four blocks, each rendered only if its data exists:

| Block | Component | What it does |
|---|---|---|
| Stats | `feature/FeatureStats.tsx` | Hairline tiles (`repeat(auto-fit, minmax(160px, 1fr))`) arriving 60ms apart via `useInViewOnce` + a CSS `--i` stagger; each number is a `CountUp`; tiles take the `.bp-spot` cursor wash. |
| Timeline | `feature/FeatureTimeline.tsx` | The centerpiece — see below. |
| Pillars | `feature/FeaturePillars.tsx` | Three hairline cards (`eyebrow`, `title`, first paragraph at rest, "Read more" opens the rest with `AnimatePresence` height-auto), a 16:9 screenshot thumbnail on top that opens the viewer, `.bp-spot` on hover, 70ms stagger. One column under 860px. |
| Behind the site | `feature/FeatureBackend.tsx` | One row per backend tool (`feature.backend.items`): a live replica on one side, the notes (eyebrow, title, paragraphs, a hairline list of one-liners) on the other, sides alternating (`ft-back-row--reverse`); notes-then-demo stacked under 860px. The replicas are in `feature/demos/` — see below. Replaced the pinned-screenshot "On screen" section on 2026-09-18, which took the page from ~7400px to ~4800px tall. |

### The demos — `feature/demos/`

Real, scoped-down versions of the tools they stand for, in paper and hairlines (`.dm-*` in `feature.css`):

- **`ResumeDemo.tsx`** (`demo: "resume"`) — a posting card of keyword chips beside a miniature one-page resume whose lines are real bullets from `experience.json` (`matches[]`: `keyword` → `line`). Hovering or focusing a chip lights its line (accent dot, ink text); a hairline connector labelled `custom-resume` joins the two. "Generate PDF" is the site's own `.bp-btn--solid` (sheen included): it disables, walks the lines 240ms apart the way the skill matches evidence, then shows the three checks the skill runs before delivery (page size, every keyword backed, links verified) 140ms apart; "Run it again" resets. Reduced motion skips straight to the checks.
- **`StudioDemo.tsx`** (`demo: "studio"`) — a miniature Studio window (brand, file name, Saved / Unsaved changes / Saving… status, a Save button that enables when dirty; a rail with Site Settings active; a Palette radio group of every preset in `lib/palettes.ts` drawn as paper/ink/accent swatches; an "Open to relocation" switch) beside a miniature of the home hero recolored live from the chosen preset's tokens for the visitor's current light/dark mode (`--p-*` custom properties, 0.4s transitions like the real theme swap). The switch shows/hides the preview's badge. Starts on the site's real palette (`paletteId` from `resumeData.theme`).
- **`SkillsDemo.tsx`** (`demo: "skills"`) — the repo's skill router: procedures down the left as a mono rail (`skills[]`: `name`, `trigger`, `does`), an accent indicator that springs between them (`layoutId`), and a card that swaps in place (`AnimatePresence mode="wait"`) with what triggers the skill and what it does. It advances every 4.2s with a hairline progress cue until the visitor hovers, clicks, or arrows through it, then it's theirs. Reduced motion: no auto-advance, no cue, instant swap.

### Themed captures — `feature/ThemedShot.tsx`

Every screenshot has a light capture (`src`) and a dark one (`srcDark`). `ThemedShot` renders both `<img>`s and `.ft-themed` in `feature.css` shows the one for the theme the visitor is *not* in (`html[data-theme]`, stamped before hydration, so the swap is hydration-safe and flips instantly with the nav toggle). Used by the timeline card thumbnail and the pillar thumbnails; the lightbox makes the same choice in JS. The two hero images in the page's own gallery are exempt — they are the light/dark comparison.

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
| `scripts/capture-site-screenshots.mjs` | Recaptures the page's screenshots with `playwright-core` driving the machine's Chrome/Edge (no download) at 1440×900 @2x, each in **both** themes via the real toggles (the nav switch; `#theme-toggle` in the Studio): home hero, full-page home, projects, this page's own timeline, and the Studio with this page open — ten files, `<name>-light.png` / `<name>-dark.png`. Hides the Next dev badge, waits for fonts and non-lazy images (bounded at 4s), removes the earlier single-theme files. Needs `npm run dev` (and `npm run studio` for the Studio shots). |
| `scripts/site-stats.mjs` | Computes the six stats from git and the repo, lists commits since the last hashed timeline entry with key-commit candidates and JSON skeletons; `--write` refreshes the stats in the data file by label; `--json` for machines. |

## Data — `data/site/about-site.json`

Shape (`types/about-site.ts` → `AboutSiteData`): `hero { eyebrow, title, tagline }`, `dates` (`ProjectDates`), `summary`, `bullets` (`ResumeBullet[]`), `images` (`ProjectImage[]`), optional `caseStudy` (`ProjectAdditionalInfo`), `feature` (`ProjectFeature`: `eyebrow`, `intro`, `stats[]`, `timeline[]`, `pillars[]`, `screenshots[]`, `backend { eyebrow, intro, items[] }`). The feature types live in `types/resume.ts` next to `Project` (`ProjectStat`, `TimelineEntry` with `era: "past" | "present" | "future"`, `FeaturePillar`, `FeatureScreenshot` with `src` + `srcDark`, `FeatureBackend` / `BackendItem` with `demo: "resume" | "studio" | "skills"`, `BackendMatch`, `BackendSkill`). Screenshots are served from `public/project-images/rileybeenders-com/` as `<name>-light.png` / `<name>-dark.png`.

Edited in the Studio under **About this site** (rail group after More Info; `aboutSite` in `server.mjs` `FILES` and `schema.js`), which round-trips the file byte-for-byte. Refreshed by the `site-timeline-sync` procedure — see [[Repository Agent Skills (.agents)]].

## Nav

`BpNav` gained `{ label: "About this site", href: "/about-this-site", gradient: true }`; the `gradient` flag adds `.bp-nav-link--gradient`, a `background-clip: text` sweep of `--ink → --accent → --blue → --ink` (9s linear, 4.5s on hover) in place of the flat color every other link uses. Five links no longer fit one phone-width row, so under 860px the links wrap onto a second line (`flex-wrap`, labels `nowrap`) instead of scrolling the last tab off-screen. See [[Blueprint Nav and Mark]]. More Info's "Read more" link now points here (`/about-this-site`, rendered as a `next/link` since it's a site path).

## Related
- [[Projects Route (BpComingSoon)]]
- [[Blueprint UI Components]]
- [[Data Layer and Types]]
- [[Design System (Blueprint Press)]]
- [[Repository Agent Skills (.agents)]]
- [[Routes Overview]]
- [[Home]]
