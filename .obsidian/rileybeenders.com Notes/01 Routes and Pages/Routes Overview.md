---
tags: [routes, pages]
---

# Routes Overview

All routes are Next.js App Router server components. None use dynamic segments — the whole route table is static. Every page route lives in the `app/(site)/` route group, which supplies the Blueprint Press chrome.

| Route | File | Renders | Metadata title |
|---|---|---|---|
| `/` | `app/(site)/page.tsx` | Editorial one-page resume (hero + 4 numbered sections + footer) | "Riley Beenders \| R&D, Electromechanical and Automation Engineer" (root layout) |
| `/projects` | `app/(site)/projects/page.tsx` | Hero + one [[Projects Route (BpComingSoon)\|ProjectEntry]] per published project inside `ProjectListSpine` (falls back to `BpComingSoon` when none) | "Projects \| Riley Beenders" |
| `/contact` | `app/(site)/contact/page.tsx` | Hero + `BpActions` + a Details paragraph with the email address spelled out — copy from `data/contact/contact.json` | "Contact \| Riley Beenders" |
| `/more-info` | `app/(site)/more-info/page.tsx` | About copy + "Read the full story" link to `/about-this-site` + [[GanttChart JobsTable and gantt.ts\|GanttChart + JobsTable]] (the tracker section shows when `ganttSection.chartVisible` or `tableVisible` is on — currently table only) | "More Info \| Riley Beenders" |
| `/about-this-site` | `app/(site)/about-this-site/page.tsx` | The site as its own case study: hero + running date bar, summary/bullets/gallery, case study, then stats, the commit timeline, pillars, annotated screenshots — see [[About This Site Page]] | "About this site \| Riley Beenders" |
| `/api/resume-pdf` | `app/api/resume-pdf/route.ts` | `GET` → PDF binary, no HTML | n/a |

Also under `app/` (not routes): `icon.svg` (favicon), `apple-icon.tsx` and `opengraph-image.tsx` (next/og image routes Next wires up automatically). See [[Design System (Blueprint Press)]].

## Root layout — `app/layout.tsx`

- Shell only: `<html lang="en" data-scroll-behavior="smooth">`, `<body suppressHydrationWarning>`, `{children}`, then `<Analytics />` and `<SpeedInsights />`. Imports `app/base.css` (a bare reset — box-sizing, body margin, `img`, `a`, `.sr-only`).
- `metadata` is a static object: `metadataBase: new URL("https://rileybeenders.com")` (needed so the generated `opengraph-image` resolves to an absolute URL), a fixed `title`/`description`, plus `openGraph` and `twitter` blocks that both use the title "Riley's Professional Portfolio".
- No `siteMode` / `comingSoon` branching — that logic was removed with the reskin.

## Site layout — `app/(site)/layout.tsx`

- Preloads **eight** Google faces via `next/font/google`, each as a CSS variable (`--font-instrument-serif`, `--font-spectral`, `--font-playfair-display`, `--font-fraunces`, `--font-source-serif-4`, `--font-inter`, `--font-space-grotesk`, `--font-ibm-plex-mono`). Instrument Serif is weight 400 (normal + italic); Spectral 300–600. Which face fills each role is data: `header.json.fonts` (`header` / `subheader` / `body`, ids from `lib/fonts.ts`) becomes `--bp-font-header` / `--bp-font-subheader` / `--bp-font-body` via `fontVarExpression()`.
- Resolves the palette the same way: `resolveThemeTokens(resumeData.theme)` (`lib/theme.ts`) returns light and dark `PaletteTokens` for the chosen preset (or the `custom` seeds), and the layout writes them as an inline `<style>` — `.bp[data-theme-id] { … }` for light, `html[data-theme="dark"] .bp[data-theme-id] { … }` for dark, plus `html[lang]` backgrounds so the overscroll gutter matches. `blueprint.css`'s own `.bp` block is only the no-override fallback.
- Imports `app/(site)/blueprint.css`.
- Wraps everything in `<ThemeProvider>` (owns `data-theme` on `<html>` and the `localStorage` preference; `useTheme()` for components that need the mode) and `<div class="bp {font vars}" data-theme-id={paletteId}>`, rendering `<BpNav />` (see [[Blueprint Nav and Mark]]; five links — Home, Projects, Contact, More Info, About this site — and the theme toggle) above `{children}` and `<BpFixedRelocationBadge />` below — the docked bottom-right "Open to relocation" pill on every page except `/`, where the hero renders its own two-state badge (see [[Blueprint UI Components]]). Both render nothing when `visibility.openToRelocation` is off.
- Sets its own `metadata` (`title` / `description`) — the More Info / Projects / Contact / About pages override `title` per-route from their own `export const metadata`.

## `/` — `app/(site)/page.tsx`

Server component, `data = resumeData`, `<main class="hp">`. Renders:

1. **Hero** (`.bp-hero`) — `<BpHeroRelocationBadge />` (rests beside the rule under the name, hops to the bottom-right corner once the page scrolls; see [[Blueprint UI Components]]), then inside the shell `<HeroRibbon />` (the faint B-bowl flourish whose CSS stroke-draw replays whenever the hero scrolls back into view), `h1` "Riley / Beenders", a rule, then a meta row: `data.person.title` in italic on the left and, on the right, the uppercase location over an italic fact line built from `experience[0]` ("Lead, Research & Development Engineer / Proteor, since January 2025", `.bp-hero-now`). No eyebrow above the name since 2026-09-18 (see the No-Eyebrow Rule in [[Design System (Blueprint Press)]]). Then `<BpActions data={data} />`.
2. **`<PageSpine>`** wraps the four sections — a hairline down the left whose accent fill springs with scroll from "01 Summary" to the footer.
3. **`01 Summary`** — `data.summary` with a `.bp-dropcap` on the first character (only when the summary opens with a whole word), and the literal text "RileyBeenders.com" inside it turned into an external link to the site.
4. **`02 Experience`** — `data.experience.map(...)` → `.bp-role` articles (role, `start — end`, `company · location`, optional `context`, `bullets`). Each bullet is `<EmphasizedText text phrases={bullet.emphasis} />` so its `emphasis` phrases take the accent on hover, and a bullet whose `projectId` names a *published* project ends with an inline `.bp-bullet-link` evidence link — "see ICARUS-Lite ↗" → `/projects#project-icarus-lite`. Today one bullet links out; the other three `projectId`s point at drafts and render plain.
5. **`03 Skills`** (labelled "Toolchain" until 2026-09-18) — `data.skills.map(...)` → `.bp-skill-group` with `.bp-pill` tags per `group.items`.
6. **`04 Education`** — `data.education.degrees` then, if any, `data.education.certificates` as `.bp-cert` cards (each with an optional `.bp-link` "Show credential" external link + diagonal arrow).
7. **Footer** — `<BpMark id="footer" size={58} animated float />` beside a one-line note ("A website built to house my experience, compiled into one place for the next challenge."), and the `.bp-footer-block` title block — a `<dl>` of **Sheet** (`rileybeenders.com`), **Rev.** (short commit · build date from `lib/build-stamp.ts`, omitted when no commit is known) and **Drawn in** (`person.location`).
8. `<BackToTop />` (bottom-left, appears after 80% of a viewport of scroll).

Section indexes are `h2`s and every section has an id (`#summary`, `#experience`, `#skills`, `#education`). Every block is wrapped in `<Reveal>` for a staggered scroll entrance. There is no scroll-spy / in-page section nav on `main`.

## `/projects` — `app/(site)/projects/page.tsx`

Builds `buildProjectViews(resumeData.projects, resumeData.proofs)` and renders a hero, then `<ProjectListSpine>` wrapping one `<ProjectEntry view index total />` per published project (summary, bullets, gallery, an optional date box, and the case study behind a toggle), a `.pj-outro` footer, and `<BackToTop />`. The intro line pluralizes ("One project — …" / "N projects — …"). With nothing published it falls back to the hero + `<BpComingSoon />`. Imports `projects.css` and `feature.css`. See [[Projects Route (BpComingSoon)]].

## `/about-this-site` — `app/(site)/about-this-site/page.tsx`

Server component reading `data/site/about-site.json` and `todayIso()`; renders the hero with the running date bar, `<AboutSiteStory>`, `<ProjectFeature>` (stats · timeline · pillars · screenshots), an outro, and `<BackToTop />`. Imports the projects stylesheets plus `about-site.css`. Fully documented in [[About This Site Page]].

## `/contact` — `app/(site)/contact/page.tsx`

Copy comes from `data/contact/contact.json` (typed `ContactData`, `types/contact.ts` — `hero { title, tagline }`, `details { title, description[] }`; Studio: **Contact**), the rest from `resumeData`. Hero (`hero.title` "Get in touch", no eyebrow; `hero.tagline` as the italic line; the location, and — when `visibility.openToRelocation` is on — an accent "Open to relocation" beside it), `<BpActions data={resumeData} />`, then a `01 Details` section with the `details.description` paragraph(s) and `person.email` printed once as a `mailto:` link in prose. The three Email / LinkedIn / GitHub cards that duplicated the button row were removed on 2026-09-18 (the impeccable critique's "same three links twice on one screen"), and with them `ContactDetails.linkedinLabel` / `githubLabel` and `ContactHero.eyebrow` left `types/contact.ts`, `data/contact/contact.json`, and the Studio schema.

## `/more-info` — `app/(site)/more-info/page.tsx`

The only involved server component:

1. Imports `data/more-info/more-info.json` (typed `MoreInfoData`) for the About copy.
2. When `ganttSection.chartVisible` or `ganttSection.tableVisible` is not `false`, reads `data/more-info/gantt.md` off disk with `fs.readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf-8")` — **not** imported as a module — and parses the raw text via `parseGanttFile()` from `lib/gantt.ts`. It skips the file read when both are off.
3. Renders: a hero from `aboutHeader`, section `01` from `aboutMe`, section `02` from `aboutSite` — whose paragraphs are followed by a `.bp-link.bp-readmore` link (`aboutSite.readMore`, currently "Read the full story" → `/about-this-site`; a path starting with `/` renders as a `next/link` in the same tab, anything else as an external `<a target="_blank">`) — and, when either flag is on, section `03` from `ganttSection` containing `<GanttChart chart={chart} />` (only if `chartVisible` is not `false`) and `<JobsTable columns={columns} rows={rows} />` (only if `tableVisible` is not `false`). Studio shows these as two switches, **Show Gantt chart on live site** and **Show tracker table on live site**; with both off, the page omits section 03 and skips reading/parsing `gantt.md`.

Because it uses `fs`, this page can't be statically exported without the file present at build time (fine on Vercel). **Today `tableVisible` is on and `chartVisible` is off**, so section 03 shows only the tracker table. See [[More Info and Gantt Data]].

## `/api/resume-pdf` — `app/api/resume-pdf/route.ts`

- `export const runtime = "nodejs"` (jsPDF needs Node), `dynamic = "force-dynamic"`, `revalidate = 0`.
- Aggressive no-cache headers (`Cache-Control`, `CDN-Cache-Control`, `Vercel-CDN-Cache-Control`, `Expires`, `Pragma`) on both success and error, so Vercel's CDN never serves a stale resume. Also sets `X-Content-Type-Options: nosniff` and an explicit `Content-Length`.
- `GET()` calls `generateResumePdf(resumeData)`, returns it as `application/pdf` with `Content-Disposition: attachment; filename="Riley-Beenders-Resume.pdf"`.
- On error, logs and returns JSON `{ error }` with status 500 (still no-cache).

Full generator detail in [[Resume PDF Pipeline]].

## Related
- [[Architecture and Data Flow]]
- [[About This Site Page]]
- [[Blueprint Nav and Mark]]
- [[Blueprint UI Components]]
- [[Projects Route (BpComingSoon)]]
- [[Home]]
