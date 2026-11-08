---
tags: [history, design, styling, architecture]
---

# Blueprint Press (2026-08 to 2026-11)

**Blueprint Press** was the site's design and page architecture from **2026-08-27** to **2026-11-08**. It was replaced by [[Blue Sheet (2026-11 redesign)|Blue Sheet]] on the same data and wording. This note records what the site was, as the vault described it on `main` at the last Blueprint Press commit. Every file it names is gone from the working tree unless the note says it was kept; read the originals from git rather than looking for them on disk.

## Where it lives in git

| Moment | Commit | What happened |
|---|---|---|
| 2026-08-27 | `2dcaf9e` | "Add the Blueprint Press design direction as a /v3 preview" |
| 2026-08-27 | `0389a99` | "Promote Blueprint Press to the live site; keep the old design at /classic" |
| 2026-08-27 | `d26539b` | "Remove the classic design so the site has one canonical set of URLs" |
| 2026-09-12 | `62f0dce` | Dark mode |
| 2026-09-13 | `0cc0035` | The **Electric** palette (Tesla-derived light, Bugatti-derived dark, one blue accent) |
| 2026-09-13 | `f2e09b5` | The projects page's scroll motion: stagger, parallax, spine, wipe |
| 2026-09-17 | `0da28c8` | `/about-this-site` created |
| 2026-09-27 | `7125339` | Projects page additions and Photo Mode |
| 2026-11-07 | `d1360bb` | The last `main` commit before the redesign: the final Blueprint Press tree |

To read any retired file as it last shipped:

```bash
git show d1360bb:"app/(site)/blueprint.css"
git show d1360bb:components/blueprint/BpNav.tsx
git log main --oneline -- "app/(site)/blueprint.css"     # every change to the stylesheet
```

On GitHub: `https://github.com/RileyBeenders/rileybeenders.com/tree/d1360bbb1d26fa7e0ec8752c10a1ed3cc45e0852`. The vault notes at that commit are the full-detail record (for example `git show d1360bb:".obsidian/rileybeenders.com Notes/05 Styling and Design/Design System (Blueprint Press).md"`). This page is the summary.

## The look

A calm editorial print on a blueprint grid. Paper and ink, one accent, hairline rules, and a fixed blueprint ruling showing through the page: four stacked `linear-gradient`s on `.bp`, a 16px fine ruling inside a 96px coarse one, `background-attachment: fixed`. Rest states had no shadow. Separation came from a hairline or a whiter sheet (the Drawn Depth Rule). Corners were square.

- **Type.** Instrument Serif (weight 400 only, the Regular Serif Rule) for headings and the two-line hero name, and **Spectral** for body text and every tracked uppercase label (the Tracked Label Rule: Spectral at 11 to 16px with 0.1 to 0.3em tracking, the serif never uppercased). Eight Google faces were preloaded so the Studio could reassign the three roles.
- **Palette.** The Studio picked a preset (`data/header.json` `theme.paletteId`). The live one was **Electric** (`0cc0035`): a white canvas, Carbon Dark `#171a20` ink and Electric Blue `#3e6ae1` in light mode (from the Tesla reference in `design-guidelines`), and a true-black `#000000` canvas with white ink and the *same* `#3e6ae1` accent in dark mode (from the Bugatti reference). The fallback in the stylesheet was the **Default** preset: navy `#0b1a2b` ink, red `#e3342f` accent and blue `#2f86c4` on paper `#fbfbf9`. Default and Electric both survive as presets in `lib/palettes.ts`.
- **Tokens.** `app/(site)/blueprint.css` (about 1,030 lines at the end, everything scoped under `.bp`) declared `--paper --white --ink --ink-soft --muted --faint --rule --accent --blue --on-accent`, `--ease: cubic-bezier(0.22, 0.9, 0.28, 1)`, `--shell: 1240px` and `--pad: clamp(20px, 5vw, 64px)`. The layout overwrote the colour tokens at render with the chosen preset. Blue Sheet kept every one of these token names, which is why the component stylesheets carried over untouched.
- **The mark.** The one-stroke RB monogram (`BpMark`), drawn on load with a gradient along its travel. It is the one visual element that carried over unchanged.
- **One breakpoint**, `max-width: 860px`, and fluid `clamp()` sizes everywhere else.

### Named rules (from the Blueprint Press `DESIGN.md`)

The One Accent Rule (colour in the accent alone; `--blue` only in drawn geometry and data), the Ramp Rule (no hand-picked grays), the Hard-Copy Rule (four files carry literal palette copies), the Regular Serif Rule, the Tracked Label Rule, the Drawn Depth Rule, the No-Eyebrow Rule (2026-09-18: nothing above a heading), and the Measure Rule (prose at most 70 characters a line, tabular numerals). The Ramp, Hard-Copy and Regular Serif rules carried over into Blue Sheet. The Drawn Depth, Tracked Label and One Accent rules did not.

## The page architecture

### Navigation: five links

`components/blueprint/BpNav.tsx` was a full-width sticky bar (`.bp-nav`, translucent paper with `blur(12px)` and a bottom hairline) holding the brand mark and name, then **Home · Projects · Contact · More Info · About this site** and the theme toggle. The About tab was drawn in a slow gradient-text sweep (`gradient: true`, `.bp-nav-link--gradient`). The 2026-09-18 impeccable critique decided to flatten it, but that change never shipped, so the sweep stayed live until the redesign removed the tab. Under 860px the bar became two rows with a horizontally scrolling link row.

### `/`, the editorial resume

A server component reading `resumeData`:

1. **Hero** (`.bp-hero`): `HeroRibbon` (a faint B-bowl flourish behind the name, its stroke-draw replayed by remounting whenever the hero re-entered view), the `h1` "Riley / Beenders" at `clamp(58px, 12vw, 152px)`, a rule, the title in italic beside the location and an italic current-role fact line, then `BpActions` (Download PDF, Email, LinkedIn, GitHub).
2. **The relocation badge** (`BpRelocationBadge.tsx`). On `/` the "Open to relocation" pill rested beside the hero rule, then hopped on a spring with a small roll to the bottom-right corner once the page scrolled 48px. On other pages it docked there from the start. Its label retyped itself in a loop (typewriter, blinking caret).
3. **`PageSpine`** wrapped four numbered sections, **01 Summary, 02 Experience, 03 Skills, 04 Education**: a hairline down the left whose accent fill sprang with scroll (`stiffness 220, damping 34, mass 0.4`). Each section was a `190px | 1fr` grid (`.bp-section-grid`) with the tracked index in the narrow column.
4. A footer with the floating animated monogram and the drawing title block (Sheet · Rev. · Drawn in), then `BackToTop`.

### `/projects`, one full-height entry per project

`app/(site)/projects/page.tsx` rendered a hero, then one `ProjectEntry` per published project inside `ProjectListSpine`, then an outro.

- **`ProjectEntry.tsx`**: an opening hairline rule carrying an optional date box, then a two-column grid (text and media) that swapped sides on odd entries and collapsed under 860px. Index `01 / 0N`, title, type, summary, bullets (staggered), links, an optional panel walkthrough, and a "View the full case study" toggle that opened the case study under the entry with an `AnimatePresence` height animation. The **media column drifted ±56px against scroll** (`useScroll` on a spring), the projects page's main source of depth. The layout deliberately had no pinning or scroll-jacking ("nothing ever needs its own scrollbar").
- **`ProjectListSpine.tsx`**: one SVG path drawn twice (track and accent fill, `pathLength` as the fill) that S-curved in around every open case-study panel and back out.
- **Photo Mode** (`PhotoMode.tsx` + `InlinePhoto.tsx`, 2026-09-27, dev only): with the Studio running and the page on a loopback host, a "Photo mode" pill let Riley drag gallery photos into the body text, float them left or right at a share of the body width, resize them, and save the placement straight into `projects.json` through the Studio's `POST /api/photo-place` (an `ImagePlace` `{ at, side, width }` on the image). No published project carried a placement when the redesign removed it.
- **`BpComingSoon.tsx`**: an animated "case studies in progress" placeholder, shown only when nothing was published.

### `/more-info`

About Me and About the Site copy from `data/more-info/more-info.json`, a "Read the full story" link to `/about-this-site`, and **section 03, the job-application tracker**: `GanttChart` (mermaid) and `JobsTable`, each behind its own switch (`ganttSection.chartVisible` / `tableVisible`). In practice only the table was on. The page read `data/more-info/gantt.md` off disk with `fs` at request time.

### `/about-this-site`

The site as its own case study (`app/(site)/about-this-site/page.tsx` + `about-site.css`, `.as-*`): a hero with the running date bar, `AboutSiteStory` (summary, bullets, a parallax gallery, the case-study toggle), then `ProjectFeature`'s deep dive (count-up stats, the time-scaled commit timeline with its self-playing tour, three pillars, and the "Behind the site" live demos of the resume builder, the Studio and the skill router), an outro ("Still moving."), and `BackToTop`. Its data was `data/site/about-site.json`, kept current by `site-timeline-sync`.

### `/contact`

The hero from `data/contact/contact.json`, the `BpActions` row, and a Details paragraph with the email spelled out once. There was no form.

## The component set

Under `components/blueprint/`: `BpNav`, `BpMark`, `BpThemeToggle`, `ThemeProvider`, `BpActions`, `BpRelocationBadge`, `HeroRibbon`, `PageSpine`, `BackToTop`, `BpComingSoon`, `Reveal`, `CountUp`, `WordReveal` (unused after 2026-09-18), `ScrollWords`, `BulletLink`, `LinkedSkill`, `AnimationSync`, `StudioLink`. Under `components/projects/`: `ProjectEntry`, `ProjectListSpine`, `PhotoMode`, `InlinePhoto`, plus the media pieces that carried over (gallery, lightbox, PDF pages, post card, compare, date box, status, case study, diagrams, walkthrough, the feature deep dive). `components/about-site/AboutSiteStory.tsx` served the About page alone.

**Deleted by the redesign:** `BpNav`, `BpActions`, `HeroRibbon`, `PageSpine`, `BpComingSoon`, `BpRelocationBadge`, `WordReveal`, `ProjectEntry`, `ProjectListSpine`, `InlinePhoto`, `PhotoMode`, `AboutSiteStory`, `app/(site)/blueprint.css`, `app/(site)/about-this-site/page.tsx` + `about-site.css`, and `app/(site)/more-info/page.tsx`.

**Kept:** `BpMark`, `BpThemeToggle`, `ThemeProvider`, `Reveal`, `BulletLink`, `LinkedSkill`, `BackToTop`, `CountUp`, `ScrollWords`, `AnimationSync`, `StudioLink`, every other `components/projects/*` file, `components/content/*`, `GanttChart`, `JobsTable`, and the stylesheets `bullet-link.css`, `skill-pills.css`, `projects/projects.css`, `projects/feature.css` and `projects/walkthrough.css`. `lib/photo-place.ts` stays because `ProjectGallery` still imports its types.

## Motion, as it was

One easing curve everywhere. `Reveal` entrances (rise 22px, rule, fade, slide). The two scroll-spring spines. The ±56px media parallax. The hero ribbon's replayed stroke-draw. The relocation badge's hop and typewriter. Emphasis phrases taking the accent on hover. The gradient About tab. Count-ups and the self-playing timeline on the About page. All of it sat inside the `motion-design` thresholds, and a blanket reduced-motion rule froze it.

## Design work that happened inside it

- **2026-09-18, the first `$impeccable critique`** (site 22/32, Studio 23/40) and the polish pass that followed: the gray ramp re-weighted for WCAG AA (`muted` 0.36, `faint` 0.50), every eyebrow removed, the evidence link renamed, a two-row phone nav, the footer title block, and the Studio rebuilt as the site's own drafting room. Detail in [[Impeccable Design Workflow]].
- **The standing direction** from that interview was "refinement inside Blueprint Press, never a replacement world". On **2026-11-07** Riley asked for exactly that replacement: a complete fresh UI on the same data, wording and function. [[Blue Sheet (2026-11 redesign)]] is the answer to that request.

## What carried over

- The data model and every word of copy.
- The Studio and its palette and font switching. It gained a Blue Sheet preset, and Default and Electric are still offered.
- The token names, `Reveal`, and the one easing curve.
- The monogram, favicon, apple icon and social card.
- The resume's reactive emphasis, Read more links and linked skills.
- The gallery, lightbox, case study, walkthrough and deep dive.
- The tracker table and chart, and the footer title block.
- The interactive HTML resumes, whose template still uses the Blueprint Press look (see [[Resume PDF Pipeline]]).

## Related
- [[Blue Sheet (2026-11 redesign)]]
- [[Design System (Blue Sheet)]]
- [[Impeccable Design Workflow]]
- [[Repository Map]]
- [[Home]]
