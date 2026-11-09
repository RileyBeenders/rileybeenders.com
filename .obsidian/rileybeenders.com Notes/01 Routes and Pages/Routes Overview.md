---
tags: [routes, pages]
---

# Routes Overview

There are four page routes, all App Router server components in the `app/(site)/` route group, which supplies the Clean Bench chrome (since 2026-11-09; see [[Clean Bench (2026-11 redesign)]]). Since the 2026-11-08 Blue Sheet redesign (see [[Blue Sheet (2026-11-08, one day)]]), one route has a dynamic segment, `/projects/[id]`, and it is statically generated for every catalog entry. `/about-this-site` and `/more-info` are gone as pages and redirect to the site's own project entry.

| Route | File | Renders | Metadata title |
|---|---|---|---|
| `/` | `app/(site)/page.tsx` (async) | The resume in tiles: the bento (hero, Now, Based in, Education, GitHub activity, This site, Say hello), Who is Riley?, Experience, Projects grid, Tech & hardware stack, Education, Contact, footer. ISR, hourly, because of the GitHub calendar | `page.json` `meta.title` (root and site layouts) |
| `/projects` | `app/(site)/projects/page.tsx` | The catalog: a `ProjectGrid` of every published project plus the site entry, with type filters. A tile morphs into its [[Project Catalog and Dialog\|dialog]]. An empty-state block shows when the catalog is empty | `data/projects/page.json` `meta.title`, "Projects \| Riley Beenders" |
| `/projects/[id]` | `app/(site)/projects/[id]/page.tsx` | One entry's `ProjectBody` on its own page, a back link to Projects, and previous/next links. Ids come from `generateStaticParams()` over `getCatalog()`. `dynamicParams = false`, so an unknown id is a 404 | "`<project name>` \| Riley Beenders" (`generateMetadata`; the description is the tagline or the summary's first paragraph) |
| `/projects/rileybeenders-com` | (the above) | The site's own entry: summary, gallery, case study, the deep dive (stats, timeline, pillars, demos), and the application tracker at `#tracker`. See [[Site Project (About this site)]] | "RileyBeenders.com \| Riley Beenders" (the entry's name is `caseStudy.title`; its type, "About this site", is `hero.title`) |
| `/contact` | `app/(site)/contact/page.tsx` | The headline (`hero.title`, with `details.title` as the sub-line) + `<ContactBlock heading={false}>` (the ways in + the message form) + footer | `contact.json` `meta.title`, "Contact \| Riley Beenders" |
| `/api/contact` | `app/api/contact/route.ts` | `POST` the message form → Resend. See below | n/a |
| `/api/resume-pdf` | `app/api/resume-pdf/route.ts` | `GET` → `307` to `header.json`'s `resumePdfPath` (the static main resume), kept for older links | n/a |
| `/api/geo` | `app/api/geo/route.ts` | `GET` → JSON `{ country, region, city }` from Vercel's IP headers, for the analytics Visit event. See [[Site Analytics]] | n/a |

Also under `app/`, but not routes: `icon.svg` (the favicon), and `apple-icon.tsx` and `opengraph-image.tsx` (next/og image routes that Next wires up automatically). See [[Site Nav and Mark]].

## Redirects (`next.config.mjs` `redirects()`)

All three are `permanent: false` (307), so a target can be repointed without fighting caches:

| Source | Destination | Why |
|---|---|---|
| `/about-this-site` | `/projects/rileybeenders-com` | The About page became the site's catalog entry in the redesign |
| `/more-info` | `/projects/rileybeenders-com#tracker` | The application tracker became a section of that entry |
| `/AutoWinUpdater` | `https://raw.githubusercontent.com/RileyBeenders/RB-s-Auto-App-Updater/main/install.ps1` | The short link for the install script (case-insensitive) |

## Root layout: `app/layout.tsx`

- Shell only: `<html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>`, `<body suppressHydrationWarning>`, a `beforeInteractive` theme-init script that stamps `data-theme` before first paint, `{children}`, then `<SiteAnalytics />` (Vercel `<Analytics />` with an owner opt-out and a per-visit state/city event; see [[Site Analytics]]) and `<SpeedInsights />`. It imports `app/base.css`, a bare reset.
- `metadata` comes from `data/home/page.json` `meta` (`title`, `description`, `shareTitle` for Open Graph/Twitter), with `metadataBase: new URL("https://rileybeenders.com")` so the generated `opengraph-image` resolves to an absolute URL.

## Site layout: `app/(site)/layout.tsx`

- **Fonts.** Preloads **ten** Google faces via `next/font/google`, each as a CSS variable (`--font-instrument-serif`, `--font-instrument-sans`, `--font-azeret-mono`, `--font-spectral`, `--font-playfair-display`, `--font-fraunces`, `--font-source-serif-4`, `--font-inter`, `--font-space-grotesk`, `--font-ibm-plex-mono`). `header.json.fonts` picks the faces for `--bp-font-header` / `--bp-font-subheader` / `--bp-font-body` / `--bp-font-mono` via `fontVarExpression()`. Today they are Instrument Sans for the first three and Azeret Mono for small labels; `bench.css` sets `--mono` from the last.
- **Palette.** `resolveThemeTokens(resumeData.theme)` (`lib/theme.ts`) returns light and dark `PaletteTokens` for the chosen preset (today `clean-bench`) or the `custom` seeds. The layout writes them as an inline `<style>`: `.bp[data-theme-id] { … }` for light, `html[data-theme="dark"] .bp[data-theme-id] { … }` for dark, plus `html[lang]` backgrounds so the overscroll gutter matches. `bench.css`'s own `.bp` block is only the no-override fallback.
- **Stylesheets.** Imports `./bench.css`, `./bullet-link.css`, `./skill-pills.css`, `./projects/projects.css`, `./projects/feature.css` and `./projects/walkthrough.css`, in that order.
- **Chrome.** Renders `<ThemeProvider>` → `<div class="bp {font vars}" data-theme-id={paletteId} data-motion-sync?>`. Inside that: the style override, `<SiteNav name={person.name} />` (see [[Site Nav and Mark]]), `<div class="page">{children}</div>`, the portal host `<div data-bench-portal />`, `<AnimationSync />` (when `motion.syncAnimations` is on), `<SmoothScroll />` (when `motion.smoothScroll` is on), and the dev-only `<StudioLink />` (a `next/dynamic` import that exists only when `NODE_ENV === "development"`).
- **Metadata.** Sets `title` / `description` from `page.json` `meta`. The projects, project and contact pages override them.

## `/`: `app/(site)/page.tsx`

An async server component. It reads `resumeData`, `data/home/page.json`, `getCatalog()`, `todayIso()`, and `await getContributions(githubUsername(person.github))`. Because that `fetch` carries `next: { revalidate: 3600 }`, the route is ISR. It renders, inside `<main>`:

1. **The bento** (`section.shell.hero` → `.bento[data-cursor-zone]`), each tile numbered `--i` in order for the `tile-in` stagger:
   - `.tile-hero`: the `.hero-avatar` (`BpMark` 46px, animated) and, when `openToRelocation` is on, a `.chip` "Open to relocation"; the `h1.hero-name` (`page.hero.lines` joined), the `p.hero-role` (the title), the `.hero-meta` line (location, and the current role "· `<company>`, since `<start>`" from `page.hero.currentRole`); `<HeroActions>`.
   - `.tile-now` (`page.bento.now`, the current role → `#experience`), `.tile-where` (`page.bento.location`, the location), `.tile-edu` (the first degree → `#education`).
   - `.tile-activity`: `<GithubGraph title={headings.activity} data profileUrl />`, with "unavailable" copy when GitHub could not be read.
   - `.tile-site` (the site entry → `#project-rileybeenders-com`, which opens its dialog) and `.tile-contact` (→ `#contact`).
   - `<CursorMark>` when `motion.cursorMark` is on.

   See [[Bench Components (Home Page)]].
2. **`#summary`, "Who is Riley?"**: the summary paragraphs (the `page.summaryLink` phrase turns into a link), beside a `<dl class="facts">` of four fact tiles: Experience (the current role), Education (the degree), Based in (the location, plus "Open to relocation"), and Site (the site link).
3. **`#experience`**: `<Experience roles projectNames readMoreLabel readMoreMotion />`. Read more links go to `/projects#project-<id>`, which opens that project's dialog.
4. **`#projects`** (when the catalog is non-empty): the title, a count ("7 entries"), and `<ProjectGrid entries={catalog} viewAllHref="/projects">`. A hash such as `/#project-icarus-lite` opens a dialog here too.
5. **`#skills`, "Tech & hardware stack"**: `<Stack data linkedSkills />`.
6. **`#education`**: `<Education />`.
7. **`#contact`**: `<ContactBlock person relocation />`.
8. `<SiteFooter location />` and `<BackToTop />`.

## `/projects`: `app/(site)/projects/page.tsx`

Reads `data/projects/page.json` (`ProjectsPageData`) and `getCatalog()`.

- **The head:** `h1` "Projects" with `counted(page.intro, projectCount)` as the sub-line. `projectCount` counts the catalog minus the site entry.
- **The grid:** `<ProjectGrid entries today paletteId filters />`. The filter chips are "All" plus each distinct `type`, and they show only when there are at least two types.
- **The close:** an outro (`page.outro.lead` as `.bp-outro-lead`, `counted(page.outro.body, n)`), then `<SiteFooter>` and `<BackToTop>`.
- **With an empty catalog**, it shows `page.comingSoon.heading` / `body` as a plain `.project-empty` block. `comingSoon.phases` and `queueLabel` are no longer rendered, because `BpComingSoon` is gone.

See [[Project Catalog and Dialog]].

## `/projects/[id]`: `app/(site)/projects/[id]/page.tsx`

- `generateStaticParams()` returns every `getCatalog()` id. `dynamicParams = false`.
- `generateMetadata()` titles the page "`<name>` | `<person.name>`".
- The page finds the entry's index and wraps its body in one `.page-in` entrance (a CSS `tile-in`, no observer; the old `Reveal` wrappers never fired on a page taller than the viewport). It renders a `.page-back` link to `/projects` (labelled `ui.nav.projects`), then `<ProjectBody entry today paletteId mode="page" />` (which gives an `h1` title), then a `.page-nav` with the previous and next catalog entries (their type and name), the footer and `BackToTop`.
- The site entry is the last in the catalog, so `/projects/rileybeenders-com` has a previous link only.

## `/contact`: `app/(site)/contact/page.tsx`

Copy comes from `data/contact/contact.json` (typed `ContactData`, `types/contact.ts`: `meta`, `hero { title, tagline }`, `details { title, description[] }`, and `form { … }`; Studio: **Contact**), and the person from `resumeData`. It renders a `.sec-head` with `hero.title` "Get in touch" as the `h1` and `details.title` as the sub-line, then `<ContactBlock person relocation heading={false} />`. That block shows `hero.tagline`, the details paragraphs, the email / LinkedIn / GitHub / location rows, and `ContactForm`. Then the footer. There is no `BpActions` row any more; the ways in are the rows.

## `/api/contact`: `app/api/contact/route.ts`

- `runtime = "nodejs"`, `dynamic = "force-dynamic"`. `POST` only.
- Body `{ name, email, message, company }`:
  - Bad JSON gets **400**.
  - A non-empty `company` (the honeypot) gets a quiet `{ ok: true }`.
  - Missing or over-long fields (name 120, email 200, message 5000) or a malformed email get **422**.
  - More than five posts from one `x-forwarded-for` address in 10 minutes gets **429** (in memory, per instance).
- Without `RESEND_API_KEY` or `CONTACT_TO` it answers **503** `{ reason: "unconfigured" }`, and `ContactForm` then opens `mailto:<person.email>` with the subject and message filled in.
- Otherwise it `POST`s `https://api.resend.com/emails` with `from` (`CONTACT_FROM`, defaulting to `<person.name> <contact@rileybeenders.com>`), `to: [CONTACT_TO]`, `reply_to` set to the visitor, the subject "Message from `<name>` via rileybeenders.com", and a plain-text body. A Resend error, or Resend being unreachable, gets **502**.
- The env vars are documented in `.env.example` and [[Build Tooling and Config]].

## `/api/resume-pdf`: `app/api/resume-pdf/route.ts`

- `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `revalidate = 0`.
- `GET()` returns `307` with a **relative** `Location: <header.json resumePdfPath>` (today `/resume/RileyBeenders_Resume_26311.pdf`) and `Cache-Control: no-store`. It is relative so that, behind the local gate that proxies `next dev` on another port, the redirect stays on the visitor's host.
- The Download PDF button does not call this route. It opens `resumeHtmlPath` in a new tab (or fetches `resumePdfPath` directly when that is unset). The route only keeps older `/api/resume-pdf` links working.

The main resume itself is described in [[Resume PDF Pipeline]].

## `/api/geo`: `app/api/geo/route.ts`

- `dynamic = "force-dynamic"`, `Cache-Control: no-store`.
- `GET(request)` returns `{ country, region, city }` from the `x-vercel-ip-country` / `x-vercel-ip-country-region` / `x-vercel-ip-city` request headers (the city URL-decoded). It stores nothing. Locally the headers don't exist, so every field is `null`.
- Its only caller is `SiteAnalytics`, once per tab session. Detail in [[Site Analytics]].

## Related
- [[Site Analytics]]
- [[Architecture and Data Flow]]
- [[Project Catalog and Dialog]]
- [[Site Project (About this site)]]
- [[Site Nav and Mark]]
- [[Bench Components (Home Page)]]
- [[Clean Bench (2026-11 redesign)]]
- [[Blue Sheet (2026-11-08, one day)]]
- [[Home]]
