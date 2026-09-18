---
tags: [routes, pages]
---

# Routes Overview

All routes are Next.js App Router server components. None use dynamic segments — the whole route table is static. Every page route lives in the `app/(site)/` route group, which supplies the Blueprint Press chrome.

| Route | File | Renders | Metadata title |
|---|---|---|---|
| `/` | `app/(site)/page.tsx` | Editorial one-page resume (hero + 4 numbered sections + footer) | "Riley Beenders \| R&D, Electromechanical and Automation Engineer" (root layout) |
| `/projects` | `app/(site)/projects/page.tsx` | Hero + one [[Projects Route (BpComingSoon)\|ProjectEntry]] per published project inside `ProjectListSpine` (falls back to `BpComingSoon` when none) | "Projects \| Riley Beenders" |
| `/contact` | `app/(site)/contact/page.tsx` | Hero + `BpActions` + contact card row | "Contact \| Riley Beenders" |
| `/more-info` | `app/(site)/more-info/page.tsx` | About copy + "Read the full story" link to `/about-this-site` + [[GanttChart JobsTable and gantt.ts\|GanttChart + JobsTable]] | "More Info \| Riley Beenders" |
| `/about-this-site` | `app/(site)/about-this-site/page.tsx` | The site as its own case study: hero + running date bar, summary/bullets/gallery, case study, then stats, the commit timeline, pillars, annotated screenshots — see [[About This Site Page]] | "About this site \| Riley Beenders" |
| `/api/resume-pdf` | `app/api/resume-pdf/route.ts` | `GET` → PDF binary, no HTML | n/a |

Also under `app/` (not routes): `icon.svg` (favicon), `apple-icon.tsx` and `opengraph-image.tsx` (next/og image routes Next wires up automatically). See [[Design System (Blueprint Press)]].

## Root layout — `app/layout.tsx`

- Shell only: `<html lang="en" data-scroll-behavior="smooth">`, `<body suppressHydrationWarning>`, `{children}`, then `<Analytics />` and `<SpeedInsights />`. Imports `app/base.css` (a bare reset — box-sizing, body margin, `img`, `a`, `.sr-only`).
- `metadata` is a static object: `metadataBase: new URL("https://rileybeenders.com")` (needed so the generated `opengraph-image` resolves to an absolute URL), a fixed `title`/`description`, plus `openGraph` and `twitter` blocks that both use the title "Riley's Professional Portfolio".
- No `siteMode` / `comingSoon` branching — that logic was removed with the reskin.

## Site layout — `app/(site)/layout.tsx`

- Loads **Instrument Serif** (display, incl. italic) and **Spectral** (body, weights 300–600) via `next/font/google`, exposed as `--bp-font-display` / `--bp-font-body`.
- Imports `app/(site)/blueprint.css`.
- Wraps children in `<div class="bp {font vars}">`, rendering `<BpNav />` (see [[Blueprint Nav and Mark]]; five links — Home, Projects, Contact, More Info, About this site) above `{children}` and a fixed `.bp-badge` "Open to relocation" pill below.
- Sets its own `metadata` (`title` / `description`) — the More Info / Projects / Contact pages override `title` per-route from their own `export const metadata`.

## `/` — `app/(site)/page.tsx`

Server component, `data = resumeData`. Renders:

1. **Hero** (`.bp-hero`) — a decorative one-continuous-stroke ribbon SVG, eyebrow "R&D · Electromechanical · Automation", `h1` "Riley / Beenders", a rule, `data.person.title` + location + red "Open to relocation", and `<BpActions data={data} />`.
2. **`01 Summary`** — `data.summary` with a `.bp-dropcap` on the first character.
3. **`02 Experience`** — `data.experience.map(...)` → `.bp-role` articles (role, `start — end`, `company · location`, optional `context`, `bullets`). No proof/project chips.
4. **`03 Toolchain`** — `data.skills.map(...)` → `.bp-skill-group` with `.bp-pill` tags per `group.items`.
5. **`04 Education`** — `data.education.degrees` then, if any, `data.education.certificates` as `.bp-cert` cards (each with an optional `.bp-link` "Show credential" external link + diagonal arrow).
6. **Footer** — `<BpMark id="footer" animated float />` and a note about the monogram's single-stroke construction.

Every block is wrapped in `<Reveal>` for a staggered scroll entrance. There is no scroll-spy / in-page section nav on `main`.

## `/projects` — `app/(site)/projects/page.tsx`

Builds `buildProjectViews(resumeData.projects, resumeData.proofs)` and renders a hero, then `<ProjectListSpine>` wrapping one `<ProjectEntry view index total />` per published project (summary, bullets, gallery, an optional date box, and the case study behind a toggle), a `.pj-outro` footer, and `<BackToTop />`. The intro line pluralizes ("One project — …" / "N projects — …"). With nothing published it falls back to the hero + `<BpComingSoon />`. Imports `projects.css` and `feature.css`. See [[Projects Route (BpComingSoon)]].

## `/about-this-site` — `app/(site)/about-this-site/page.tsx`

Server component reading `data/site/about-site.json` and `todayIso()`; renders the hero with the running date bar, `<AboutSiteStory>`, `<ProjectFeature>` (stats · timeline · pillars · screenshots), an outro, and `<BackToTop />`. Imports the projects stylesheets plus `about-site.css`. Fully documented in [[About This Site Page]].

## `/contact` — `app/(site)/contact/page.tsx`

Fully static aside from `person` off `resumeData`. Hero ("Get in touch"), `<BpActions data={resumeData} />`, then a `01 Details` section with a paragraph and a `.bp-certs` grid of three `.bp-cert` cards: Email (`mailto:`), LinkedIn, GitHub — each a `.bp-link`.

## `/more-info` — `app/(site)/more-info/page.tsx`

The only involved server component:

1. Imports `data/more-info/more-info.json` (typed `MoreInfoData`) for the About copy.
2. When `ganttSection.visible` is not `false`, reads `data/more-info/gantt.md` off disk with `fs.readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf-8")` — **not** imported as a module — and parses the raw text via `parseGanttFile()` from `lib/gantt.ts`. It skips the file read when the tracker is hidden.
3. Renders: a hero from `aboutHeader`, section `01` from `aboutMe`, section `02` from `aboutSite` — whose paragraphs are followed by a `.bp-link.bp-readmore` link (`aboutSite.readMore`, currently "Read the full story" → `/about-this-site`; a path starting with `/` renders as a `next/link` in the same tab, anything else as an external `<a target="_blank">`) — and, when `ganttSection.visible` is not `false`, section `03` from `ganttSection` containing `<GanttChart chart={chart} />` and `<JobsTable columns={columns} rows={rows} />`. Studio's **Show on live site** switch writes that visibility field and controls both tracker views together; when off, the page also skips reading/parsing `gantt.md`.

Because it uses `fs`, this page can't be statically exported without the file present at build time (fine on Vercel). See [[More Info and Gantt Data]].

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
