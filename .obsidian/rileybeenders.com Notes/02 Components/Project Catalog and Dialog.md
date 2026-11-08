---
tags: [component, routes]
---

# Project Catalog and Dialog

How projects reach the visitor since the Blue Sheet redesign (2026-11-08):

- `lib/catalog.ts` builds one list of entries: the published projects, then the site itself.
- `ProjectGrid` shows them as cards, on `/projects` with type filters and on the home page with "View all projects".
- A card opens its project in `ProjectDialog`, over the page.
- Every entry also has its own page at `/projects/<id>`.
- The dialog and the page render the same `ProjectBody`.

This note was **Projects Route (BpComingSoon)** before the redesign. The Blueprint Press projects page it described (one full-height `ProjectEntry` per project with media parallax, `ProjectListSpine`, Photo Mode, the `BpComingSoon` fallback) is recorded in [[Blueprint Press (2026-08 to 2026-11)]]. The site's own entry and its deep dive are in [[Site Project (About this site)]].

## `lib/catalog.ts`

| Export | What it does |
|---|---|
| `SITE_PROJECT_ID` | `"rileybeenders-com"`, the site entry's id and URL segment |
| `CatalogEntry` | `ProjectView` (from `lib/projects.ts`: `project`, `images`, `ownImages`, `proof`) plus `cover` (`{ src, alt, unoptimized? }` or `null`), `tagline?`, `isSite`, `feature?` (`ProjectFeature`) and `tracker?` (`TrackerSection`) |
| `TrackerSection` | `{ title, intro?, tableNote, statusKey, columns, rows, chart?, table }`, the application tracker carried by the site entry |
| `getCatalog()` | Module-cached. `buildProjectViews(resumeData.projects, resumeData.proofs)` (published projects, by `order`), each given a `cover` (`coverFor()`: the first image with a `src` that isn't a captured post. A PDF gives its `<src>.png` first-page preview, an MP4 its `<src>.jpg` poster, and a GIF is `unoptimized`) and `tagline` (`additionalInfo.subtitle`). Then the site entry. With `visibility.projectsSection` off, the catalog is the site entry alone |
| `getEntry(id)` | One entry, for `/projects/[id]` |
| `getFeatured()` | Every entry (the home grid shows all of them) |
| `getCatalogTypes()` | The distinct `type`s in catalog order |

Today the catalog holds seven entries: ICARUS-Lite, ExtrusionStudio, BulkSSH, RB's Auto App Updater, Unified Ubiquiti Network, Filament Innovations Projects, and the site entry, **RileyBeenders.com** (type "About this site").

## `components/sheet/ProjectGrid.tsx`

`"use client"`. Props: `entries`, `today` (ISO, from the server), `paletteId`, `filters?` (the `/projects` chips), `viewAllHref?` (the home page's "View all projects" `.btn`).

- **Filters.** "All" (`ui.projects.all`) plus one `.filter` chip per distinct `type`, shown only when there are two or more types. The active chip is filled with `--accent-fill`. Choosing the active chip again clears it.
- **Grid.** `.project-grid` has three columns, two under 980px and one under 760px. It renders one `ProjectCard` per shown entry.
- **Hash routing.** Which project is open lives in the URL hash: `#project-<id>`, plus `-case-study` to open the case study too (`/^#project-([a-z0-9-]+?)(-case-study)?$/i`).
  - It reads the hash on mount and on `hashchange` and `popstate`, so the resume's Read more links (`/projects#project-<id>`), linked skills (`#project-<id>-case-study` for a proof), a shared link, and the browser's back button all work.
  - Opening `pushState`s the hash. Closing `pushState`s the bare path.
  - An unknown id leaves the dialog closed.
- **The dialog.** It renders `<ProjectDialog open={{ id, name, type }} onClose>` with `<ProjectBody key={id} … caseStudyOpen mode="dialog" />` inside.

The same component runs on `/` and `/projects`, so `/#project-icarus-lite` opens the dialog over the home page.

## `components/sheet/ProjectCard.tsx`

`"use client"`. One tile, `motion.article#project-<id>.card.card--hover.project-card.bp-spot` (the id is the anchor the resume's links point at). The whole tile is one `<button>` that calls `onOpen(id)`, aria-labelled "`<name>`: open".

- **Cover** (16:10). The entry's `cover` as a `next/image` (`fill`, `sizes` tracking the grid, eager for the first three). It scales 1.04× on hover. A PDF whose first image is `fit: "contain"` is shown contained with padding. With no cover, `.project-card-typo` draws the animated monogram over a grid.
- **Tags** over the cover: the `type`, plus "This site" (`ui.projects.siteBadge`, filled with `--accent-fill`) on the site entry. The site's card also gets an accent-tinted border (`.project-card--site`).
- **Body.** The `h3` name, the summary's first paragraph clamped to two lines, and a mono meta line: "Jun 2026 → Present" from `dates`, "· N photos" (photos only; PDFs and posts don't count), and an `ArrowUpRight` that nudges 3px on hover.
- **Motion.** It enters on view (opacity, y 18 → 0, 0.6s on the site curve, a stagger of `min(index, 5) × 0.06`s) and keeps `layout` on, so filtering animates the reflow. The `.bp-spot` cursor wash follows the pointer via `useSpotlight`. Under reduced motion it does neither.

## `components/sheet/ProjectDialog.tsx`

`"use client"`. The box a card opens into.

- **Portal.** It renders through `createPortal` into **`[data-sheet-portal]`**, the empty div the site layout puts *inside* `.bp`, so every palette token resolves in the dialog. Portalling to `<body>` would leave `var(--ink)` undefined (the Portal Rule in `DESIGN.md`). It falls back to `document.body` only if the host is missing. The component's own doc comment still says "into `<body>`"; the code uses the portal host.
- **Markup.**
  - A `.dlg-scrim` (blurred, fades 0.3s, a click closes).
  - A `.dlg-wrap` holding `motion.div.dlg[role=dialog][aria-modal][aria-labelledby]`, `min(1040px, 100%)` wide and centred. It enters at opacity 0, y 24, scale 0.97 over 0.45s on the site curve, and under reduced motion fades only.
  - A sticky translucent `.dlg-bar`: the name (serif) and type (mono), an **Open full page** `.btn.btn--sm` (`ui.projects.openFull`, a `next/link` to `/projects/<id>`), and a close `X` button (`ui.projects.close`).
  - The `.dlg-body`, which scrolls on its own (`overscroll-behavior: contain`) and is marked `data-native-scroll` so `SmoothScroll` leaves it alone.
- **Behaviour while open:**
  - sets `data-lock` on `<html>` (`html[data-lock] { overflow: hidden }`, which also pauses `SmoothScroll`);
  - focuses the panel after 30ms;
  - traps Tab and Shift+Tab within the visible focusables;
  - closes on **Escape**, unless the Lightbox (`.pj-lightbox`) is up, since it handles its own Escape;
  - on close, removes the lock and puts focus back where it was.
- **Phone.** Under 760px the dialog rises from the bottom edge (`max-height: 96vh`, only the top corners rounded).

`ui.projects.position` ("Project {index} of {count}") is a Studio field that the dialog does not render yet.

## `components/sheet/ProjectBody.tsx`

`"use client"`. Everything an entry has, top to bottom. It is the same in the dialog (`mode="dialog"`, `h2` title) and on the page (`mode="page"`, `h1` title):

1. **Head** (`.pbody-head`): the `type` as an `.eyebrow` (the one place eyebrows remain, naming a category), the title, the `tagline`, and a meta row with `<ProjectDateBox position="inline">` when `dates.start` is set, plus the photo count.
2. **`<ProjectGallery images projectName />`** when there are images. Every image goes in the gallery; a stored `place` is ignored now that Photo Mode is gone.
3. **Text** (`.pbody-text`, max 76ch): `<Paragraphs className="pbody-summary">`, `<ProjectStatus>` when `status` is set, the bullets (`EmphasizedText` with `.pj-bullet-emphasis`, accented on hover like the resume's), and `project.links` as `.btn.btn--sm` buttons (with an optional mono `note`; an external `href` opens in a new tab with an `ExternalLink` icon).
4. **Case study**, when `proof` exists: a `.pj-toggle` button (`id="project-<id>-case-study"`, "View the full case study" / "Hide the case study" from `ui.caseStudy`, a rotating chevron, `aria-expanded`/`aria-controls`) that opens `<CaseStudy proof>` with `AnimatePresence` height `0 → auto` over 0.5s. `caseStudyOpen` (from the hash) opens it on first render. Under reduced motion it shows and hides without animation.
5. **`<PanelWalkthrough>`** when `project.walkthrough` is set (ExtrusionStudio). See [[Panel Walkthrough]].
6. **`<ProjectFeature feature projectName today paletteId>`** when the entry has a `feature` (the site entry only). See [[Site Project (About this site)]].
7. **The tracker**, `section#tracker.pbody-tracker`, when the entry has a `tracker` (the site entry only):
   - the `h3` title and optional intro;
   - `<GanttChart chart>`, when the chart switch is on;
   - when the table switch is on: the `tableNote`, a `.bp-table-key` (🟢 / 🟠 / 🔴 with the `statusKey` words), and `<JobsTable columns rows singleLine>` in a `data-native-scroll` wrapper.

   `/more-info` redirects to this anchor. See [[GanttChart JobsTable and gantt.ts]].

## `/projects/[id]`, the entry's own page

`app/(site)/projects/[id]/page.tsx` is a statically generated page for every catalog id (`generateStaticParams`, `dynamicParams = false`). It renders a `.page-back` link to `/projects`, `<ProjectBody mode="page">`, and a `.page-nav` of the previous and next entries (their type and name), then the footer and `BackToTop`. The metadata title is "`<name>` | Riley Beenders". See [[Routes Overview]].

## Kept project media: `components/projects/`

Unchanged by the redesign. `ProjectBody` composes them.

| File | Role |
|---|---|
| `ProjectGallery.tsx` | Client. A responsive photo grid (`align-items: start`). Each cell is a fixed-aspect `next/image` frame: 4:3 unless the image's `aspect` picks another ratio, or "original" (uncropped). It uncovers with a `clip-path` wipe (`staggerChildren 0.1`) and opens the `Lightbox`. A `.gif` is `unoptimized`, so it plays at the speed baked into the file. Diagrams from `additionalInfo.assets` stand in when a project has no photos (except `THEMED_SVGS` drawings, which stay in the case study). `display: "compare"` renders a `CompareImage`. A `post` renders a `PostButton`. An MP4 shows its poster with a play mark. An empty `src` is filtered out before render. It still accepts the Photo Mode-era `items` / `onOpen` / `editing` props and imports `ShownImage` / `canFloat` from `lib/photo-place.ts`; nothing passes `editing` any more. |
| `Lightbox.tsx` | Client. The full-screen viewer for the untouched original, with keyboard navigation and a loading state. A PDF opens as `PdfPages` (with a "Page N of M" caption and an optional download), a post as a `PostCard`, a comparison as a large `CompareImage`, an MP4 as `<video controls>`. It portals to **`<body>`**, outside `.bp`, so all of its CSS (and `PostCard`'s) uses literal colours. Its Escape closes it before the dialog's does. |
| `PdfPages.tsx` | Client. Every page of a PDF in one scrolling column, drawn by pdf.js behind a dynamic `import("pdfjs-dist")`, so only a visitor who opens a PDF fetches it. Pages rasterise as they come near; the column is drawn on white whatever the theme. |
| `PostCard.tsx` | Server. `PostButton` (the grid card for a captured LinkedIn post) and `PostCard` (the record in the viewer: the words, the hashtags set apart, "Redirect to LinkedIn", the capture date). |
| `CompareImage.tsx` | Client. A before/after slider in the image's frame: drag the bar, or use the transparent range input that carries the keyboard and screen-reader path. Each photo is placed by its Studio-set `ImageFrame`. |
| `ProjectDateBox.tsx` | Client. The date range from `project.dates`. With `ongoing` the end reads "→ Present" and its underline runs a progress bar (fill to 92% on view, then a chase sweep). `ProjectBody` always uses `position="inline"`; the corner positions belonged to `ProjectEntry`'s rule. |
| `ProjectStatus.tsx` | Client. A project's `status` line. A ` ``` `-fenced part renders as a code block with a copy button (the Auto App Updater's install command). |
| `CaseStudy.tsx` | Server-safe. The expanded case study (`ProofView`: title, subtitle, summary, sections, tags, diagrams). A diagram in `FLOW_DIAGRAMS` renders as `<FlowDiagram>`, and one in `THEMED_SVGS` as `<ThemedSvg>`. |
| `diagrams/flows.ts` + `FlowDiagram.tsx` | Flowcharts drawn inline in the palette, with boxes rising in turn and a dot running every arrow (the Auto App Updater's install and run flows). |
| `diagrams/themed.ts` + `ThemedSvg.tsx` | Hand-drawn SVGs whose colours are `var(--token, fallback)`, fetched and inlined so they follow the palette and `data-theme` (the two UniFi topologies). |
| `walkthrough/PanelWalkthrough.tsx` | The guided tour of a program's screens. See [[Panel Walkthrough]]. |
| `ProjectFeature.tsx` + `feature/*` | The deep dive, carried only by the site entry. See [[Site Project (About this site)]]. |

The styles are in `app/(site)/projects/projects.css` (`.pj-*`, `.cmp-*`, `.pj-flow-*`, the lightbox), `projects/walkthrough.css` (`.wt-*`, `.pj-links`) and `projects/feature.css`. The site layout imports all three after `sheet.css`, and the card, dialog and body classes (`.project-*`, `.dlg-*`, `.pbody-*`) live in `sheet.css`'s projects, dialog and project-body sections.

`lib/projects.ts` (`buildProofView`, `buildProjectViews`) assembles the `ProjectView` each entry starts from. `ownImages` is true when `images` is the project's own list rather than diagrams standing in.

## What is published

Six projects, in `order`:

- **ICARUS-Lite**: six photographs, a `status` line, and a case study.
- **ExtrusionStudio**: panel captures, a link to BulkSSH, the `walkthrough`, and the themed `deployment.svg`.
- **BulkSSH**: text-only until its demo GIF lands. It has three `links` (the repository, the v1.0.0 release, and `#project-extrusionstudio`).
- **RB's Auto App Updater**.
- **Unified Ubiquiti Network**.
- **Filament Innovations Projects**.

The other six projects are `visible: false` drafts. All 17 proofs are also `visible: false`, so every case study is the project's own write-up. See [[Career Content]].

## Related
- [[Site Project (About this site)]]
- [[Panel Walkthrough]]
- [[Sheet Components (Home Page)]]
- [[Career Content]]
- [[Routes Overview]]
- [[Design System (Blue Sheet)]]
- [[Home]]
