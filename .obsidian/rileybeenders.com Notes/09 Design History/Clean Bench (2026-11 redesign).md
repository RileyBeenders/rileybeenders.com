---
tags: [history, design, styling, architecture, redesign]
---

# Clean Bench (2026-11 redesign)

**Clean Bench** is the site's current design, chosen by Riley on **2026-11-09**. Its thesis is one line: everything is a tile. It replaced [[Blue Sheet (2026-11-08, one day)|Blue Sheet]] a day after Blue Sheet was built, on the same branch (`design/UI_Refresh`), the same data and the same wording.

It is the design for the end of 2026, all of 2027 and the applications that come with them. It runs first at **beta.rileybeenders.com** and then merges to `main`. The token specification is the repo-root `DESIGN.md` (name: Clean Bench); the working reference for the stylesheet is [[Design System (Clean Bench)]]; the direction contract is `.impeccable/surfaces/app-site-page-tsx.md`.

## Why

On 2026-11-09 Riley reviewed Blue Sheet and asked to drop the blueprint feel entirely, for something new and refreshing. Two designs in a row had been drawn as blueprints (Blueprint Press, then Blue Sheet). The work on the site is engineering, but the site itself did not need to look like a drawing to say so.

A direction board of six directions was built from the same content. Riley chose:

- **Clean Bench**: an Apple-style bento in the spirit of Michelle Liu's portfolio, where every piece of content is a rounded tile.
- With a hint of **Soft Bloom**: a soft blue bloom behind the top of the page, and a frosted glass nav.
- With the **Signal Bench** monospace: Azeret Mono for small labels, dates and captions.

The inspirations are the three portfolios Riley named for the redesign:

| Portfolio | What Clean Bench takes from it |
|---|---|
| Palak Sharma (palakonweb.in) | The profile hero, the GitHub calendar, the stack cards, the message form, and a dark mode that deepens its colour |
| Michelle Liu (liumichelle.com) | The bento of tiles, and project tiles that open in place with a full page behind each one |
| Daryl Patigas (imdaryl.com) | Smooth, quiet motion: the wheel glide, the cursor chip, the sliding nav tint |

The contract names its own risk: the bento is the most familiar portfolio layout of 2025 and 2026, so it wins on photography, density and polish, or not at all. The rule that follows is to keep the bloom blue and the mono small.

## The system

### Look

White tiles (22px radius, an ink hairline, a quiet shadow) sit on a pale grey-blue ground, `#f4f5f8`. One cobalt accent, `#2457e6`, carries every link, fill and active state, with a deeper blue, `#173ea8`, for drawn geometry and data. Dark mode is the same bench with the lights down: graphite tiles (`#181b22`) on near-black (`#0f1115`), a lighter blue for text (`#6a93ff`), and fills cut deeper (`--accent-fill` `#4a67b3`, the accent mixed 30% toward black).

The palette is the `clean-bench` preset in `lib/palettes.ts`, and `data/header.json` points `theme.paletteId` at it. Its derived tokens are the fallbacks in `app/(site)/bench.css`.

### Type

- **Instrument Sans** for headings and body, loaded at 400 to 700 and set at 600 with negative tracking for headings.
- **Azeret Mono** for small labels: tile labels, dates, counts, tags, captions, the footer meta line.
- The Studio gained a fourth font role, **Small labels** (`mono` in `types/resume.ts` `FontRole`), written as `--bp-font-mono`; `bench.css` sets `--mono` from it. `lib/fonts.ts` gained both faces, so ten are preloaded.

### Tiles and the bento

The home page opens on a six-column `.bento`:

| Tile | Span | What it holds |
|---|---|---|
| `.tile-hero` | 4 columns × 3 rows | Monogram avatar, Open to relocation chip, name, title, location and current role, `HeroActions` |
| `.tile-now` | 2 | The current role, linking to `#experience` |
| `.tile-where` | 2 | Where Riley is based |
| `.tile-edu` | 2 | The degree, linking to `#education` |
| `.tile-activity` | full width | The GitHub calendar |
| `.tile-site` | 3 | About this site, opening the dialog via `#project-rileybeenders-com` |
| `.tile-contact` | 3 | Say hello, linking to `#contact` |

At 980px the bento becomes two columns with the hero full width; at 640px, one column. Below it the resume reads at rest: Who is Riley, Experience (every role in one tile on a dated rail), Projects, the Tech & hardware stack, Education, Contact, the footer.

### Morph, bloom and motion

- **The morph** is the signature interaction. A project tile and its dialog share a framer-motion `layoutId` (`tileLayoutId(id)` in `components/bench/ProjectCard.tsx`), so the tile grows into the dialog on one spring (`MORPH`: stiffness 380, damping 36, mass 0.8). The bar and body fade in after 0.18s. Escape or the back button collapses it home; reduced motion gets a plain fade.
- **The bloom** is `.bp::before`: three radial washes of `--accent-soft`, `--glow` and `--tint` that drift over 22s (`bloom-drift`).
- **Entrances**: bento tiles rise with `tile-in` (0.8s, 70ms apart by `--i`). Project pages use `.page-in`, a one-shot entrance; the old `Reveal` wrapper never fired on a page taller than the viewport, so the body of a tall project page stayed hidden. That bug is fixed.
- **Kept**: `SmoothScroll`, `CursorMark` (now across the bento), the nav's sliding tint, the monogram's draw loop, the calendar's cell pop-in. The Read more pill became a tinted mono chip.

## Files

- `app/(site)/sheet.css` → **`app/(site)/bench.css`** (renamed, fully rewritten).
- `components/sheet/` → **`components/bench/`** (renamed); `HeroCover.tsx` deleted.
- The page wrapper is `.page` (the `.sheet-frame` dashed frame is gone); the portal host is `[data-bench-portal]` (was `[data-sheet-portal]`).
- `lib/palettes.ts` (the `clean-bench` preset), `lib/fonts.ts` (two faces), `types/resume.ts` (`mono` role), `app/(site)/layout.tsx` (loads the faces, writes `--bp-font-mono`).
- `data/home/page.json` gained `bento: { now, location }` ("Now", "Based in"); its footer keys became `siteLabel` / `siteLink` / `updatedLabel` ("Site", "Updated"), matched in `types/pages.ts` and rendered by `SiteFooter` as a `.footer-meta` line.
- `studio/ui/schema.js`: the `clean-bench` swatch, the two font options, the Small labels field, the renamed footer fields, and a **Bench tiles** group for the bento labels.
- The Hard-Copy files (`components/GanttChart.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`) carry ink `#111318` and accent `#2457e6`.
- `data/site/about-site.json`: Blue Sheet moved to the past ("Blue Sheet: one day as a drafting sheet"), a new present entry "Clean Bench: everything is a tile" (2026-11-09), the first pillar retitled "Three designs on one data set", and the captions say Clean Bench. The screenshots in `public/project-images/rileybeenders-com/` were recaptured, including the Studio pair.
- Documentation: `DESIGN.md`, `.impeccable/design.json`, `PRODUCT.md`, `CLAUDE.md`, `README.md`, the motion and design skills, and this vault.

## What stayed

The data and its wording; light and dark; the project catalog, its dialog, the `/projects/[id]` pages and the `#project-<id>` hash links; the GitHub calendar; the contact form through Resend with its mailto fallback; the HTML and PDF resumes; reactive emphasis on resume bullets; About this site inside Projects with the tracker at its foot; the Studio and every palette preset; `.bp` as the root scope class and every token name, so the kept stylesheets (`bullet-link.css`, `skill-pills.css`, `projects/*.css`) follow the palette untouched.

## The resume files

- The main resume pair is `public/resume/RileyBeenders_Resume_26311.html` and `.pdf` (also in `.DefaultResume/`). `data/header.json` points `resumeHtmlPath` and `resumePdfPath` at them, and the hero's Download PDF opens the HTML.
- The `create-custom-resume-html` skill still styles its screen layer with the Blueprint Press template (`assets/web-resume-template.html`), so tailored HTML resumes and the main HTML resume do not match the site yet. Restyling the template for Clean Bench is a follow-up.

Pipeline detail in [[Resume PDF Pipeline]].

## Follow-ups

- **The contact inbox and Resend key.** `contact@rileybeenders.com` and the Resend key are not set up, so the form opens the visitor's mail app. The timeline's planned entry for 2026-12-01 covers this and the beta cut-over.
- **The beta subdomain cut-over.** beta.rileybeenders.com is not yet pointed at `design/UI_Refresh`, and the merge to `main` follows it.
- **The HTML resume template.** Restyle `create-custom-resume-html`'s template from Blueprint Press to Clean Bench, then rebuild the main pair with `update-main-resume`.
- **The social card.** `app/opengraph-image.tsx` carries the Clean Bench colours but still draws the blueprint ruling and sets its title in Instrument Serif, the last place the drafting look survives on the site. The GanttChart's bar fills are also still Electric's washes.
- **Motion references.** The `motion-design` catalog and the `motion-layout` layout reference were written for Blueprint Press; their skills now say how to read them on the bench, but the rows themselves have not been re-rated.

## Status

Built on `design/UI_Refresh` on top of `8d75e07` (the Blue Sheet commit) and awaiting Riley's review before it is committed.

## Related
- [[Blue Sheet (2026-11-08, one day)]]
- [[Blueprint Press (2026-08 to 2026-11)]]
- [[Design System (Clean Bench)]]
- [[Bench Components (Home Page)]]
- [[Project Catalog and Dialog]]
- [[Site Nav and Mark]]
- [[Site Project (About this site)]]
- [[Resume PDF Pipeline]]
- [[Impeccable Design Workflow]]
- [[Home]]
