---
tags: [routes, pages]
---

# Routes Overview

All routes are Next.js App Router server components. None use dynamic segments — the whole route table is static.

| Route | File | Renders | Metadata title |
|---|---|---|---|
| `/` | `app/page.tsx` | [[InteractiveResume]] | Computed in `layout.tsx` (see below) |
| `/projects` | `app/projects/page.tsx` | Hero + [[ProjectsExplorer and ProjectDetails\|ProjectsExplorer]] | "Projects \| Riley Beenders" |
| `/contact` | `app/contact/page.tsx` | Static hero + contact copy | "Contact \| Riley Beenders" |
| `/more-info` | `app/more-info/page.tsx` | About Me / About the Site + [[BulletList GanttChart and JobsTable\|GanttChart + JobsTable]] | "More Info \| Riley Beenders" |
| `/api/resume-pdf` | `app/api/resume-pdf/route.ts` | `GET` → PDF binary, no HTML | n/a |

## Root layout — `app/layout.tsx`

- Renders `<SiteHeader />` (see [[SiteHeader]]) **above** `{children}` on every page, plus `<Analytics />` and `<SpeedInsights />` (Vercel) after it.
- `<body suppressHydrationWarning>` — needed because several client components set inline styles / hydration-sensitive attributes (pointer tilt vars, `suppressHydrationWarning` on links, etc.).
- `<html lang="en" data-scroll-behavior="smooth">`.
- Builds `metadata` from `resumeData` at module load:
  - If `siteData.siteMode === "coming-soon" && siteData.comingSoon` is truthy → title/description come from `comingSoon.headline`/`comingSoon.summary`.
  - Otherwise → static title `"Riley Beenders | Exploring, Building, Improving"` and a fixed description.
  - **Currently always the "otherwise" branch** — `header.json` has `siteMode: "coming-soon"` but no `comingSoon` object, so the `isComingSoon` check is `false`. See [[Data Layer and Types]].

## `/` — `app/page.tsx`

Trivial pass-through: imports `resumeData` and renders `<InteractiveResume data={resumeData} />`. All the actual page logic lives in the component — see [[InteractiveResume]].

## `/projects` — `app/projects/page.tsx`

Renders a `hero-card` (`id="section-projects-header"`) then a `resume-block` (`id="section-projects-work"`) wrapping `<ProjectsExplorer data={resumeData} />`. These two `id`s are what `SiteHeader`'s scroll-spy nav targets for this route. See [[ProjectsExplorer and ProjectDetails]].

## `/contact` — `app/contact/page.tsx`

Fully static aside from pulling `person` off `resumeData`. Two sections, `id="section-contact-header"` and `id="section-contact-details"`, matching `SiteHeader`'s nav for this route. No form, no client interactivity — just a mailto/LinkedIn/GitHub contact row and a one-paragraph "best way to reach me" note.

## `/more-info` — `app/more-info/page.tsx`

The most involved server component:

1. Imports `data/more-info/more-info.json` (typed as `MoreInfoData`) for the About copy.
2. Reads `data/more-info/gantt.md` directly off disk with `fs.readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf-8")` — this file is **not** imported as a JSON/TS module, it's parsed as raw text at request time via `parseGanttFile()` from `lib/gantt.ts`.
3. Renders four sections in order: header (`section-moreinfo-header`), About Me (`section-moreinfo-aboutme`), About the Site (`section-moreinfo-aboutsite`), and the Application Tracker (`section-moreinfo-tracker`) containing `<GanttChart chart={chart} />` and `<JobsTable columns={columns} rows={rows} />`.

Because it uses `fs` directly, this page **cannot** be statically exported without the file being present at build time on the server (it's fine under normal Next.js server rendering / Vercel deployment, just worth knowing if the deploy target ever changes). See [[More Info and Gantt Data]].

## `/api/resume-pdf` — `app/api/resume-pdf/route.ts`

- `export const runtime = "nodejs"` (jsPDF needs Node, not the Edge runtime).
- `export const dynamic = "force-dynamic"` and `revalidate = 0` — never cached by Next.js.
- Sets aggressive no-cache headers (`Cache-Control`, `CDN-Cache-Control`, `Vercel-CDN-Cache-Control`, `Expires`, `Pragma`) so Vercel's CDN never serves a stale resume.
- `GET()` calls `generateResumePdf(resumeData)`, returns it as `application/pdf` with `Content-Disposition: attachment; filename="Riley-Beenders-Resume.pdf"`.
- On error, logs and returns a JSON `{ error }` with status 500 (still no-cache).

Full generator detail in [[Resume PDF Pipeline]].

## Related
- [[Architecture and Data Flow]]
- [[SiteHeader]]
- [[Home]]
