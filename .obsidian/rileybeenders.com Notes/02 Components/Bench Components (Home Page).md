---
tags: [component, client]
---

# Bench Components (Home Page)

This note covers the `components/bench/*` pieces the home page is built from, and the bento of tiles that opens it (everything except the nav, which is in [[Site Nav and Mark]], and the project grid and dialog, which are in [[Project Catalog and Dialog]]). It also covers the primitives kept from Blueprint Press in `components/blueprint/` and `components/content/`. The folder arrived as `components/sheet/` with the Blue Sheet redesign on 2026-11-08 (see [[Blue Sheet (2026-11-08, one day)]]) and was renamed `components/bench/` with Clean Bench on 2026-11-09 (see [[Clean Bench (2026-11 redesign)]]), when `HeroCover.tsx` was deleted. The Blueprint Press pieces it replaced (`BpActions`, `HeroRibbon`, `PageSpine`, `BpRelocationBadge`, `BpComingSoon`, `WordReveal`) are described in [[Blueprint Press (2026-08 to 2026-11)]].

The home page itself (`app/(site)/page.tsx`) is an async server component; [[Routes Overview]] lists its sections in order. It opens with the bento, then each section is a `section.shell.sec` with a `.sec-head` (an `h2.sec-title`, plus an optional `.sec-sub`) inside a `Reveal`. Since 2026-11-14 every heading is boxed: the Experience, Projects, Stack and Education heads are `.card.sec-head` tiles, and the summary is one `.card.panel`.

## The bento (in `page.tsx`)

`section.shell.hero` → `.bento`: a six-column grid of tiles at `--gap`. Every tile is a `.card` (`.card--hover` when it links somewhere), a frosted glass surface (`--white` at `--tile-fill`, 72% by default, over a 1.5px `backdrop-filter` blur) that lets the graph paper and the pen's glow show through softly, and enters once with the CSS `tile-in` (16px rise, 0.8s), staggered 70ms by `--i`. `page.tsx` numbers the tiles in order with a small counter (`order()`), so a new tile takes the next number. The bento has no observer: it is above the fold.

| Tile | Span | Content | Links to |
|---|---|---|---|
| `.tile-hero` (`article`) | 4 columns × 3 rows | The identity row, name, title, meta line and `HeroActions` | (none) |
| `.tile-now` | 2 | `page.bento.now` ("Now"), the current role, "company · start – end" | `#experience` |
| `.tile-where` | 2 | `page.bento.location` ("Based in"), the location, and "Open to relocation" when on | (none) |
| `.tile-edu` | 2 | `page.headings.education`, the first degree (`.tile-value--sm`), "school · graduation" | `#education` |
| `.tile-activity` | full width | `GithubGraph` | (none) |
| `.tile-site` | 3 | `ui.projects.siteBadge` ("This site"), the site entry's name and tagline | `#project-rileybeenders-com` (opens the dialog) |
| `.tile-contact` | 3 | `contact.hero.title`, `contact.form.title`, the contact tagline | `#contact` |

Each small tile has a mono `.tile-label` with a 13px lucide icon (`Briefcase`, `MapPin`, `GraduationCap`, `Monitor`, `MessageSquare`), a `.tile-value`, a `.tile-sub`, and, when it links, a `.tile-arrow` (`ArrowUpRight` in a 30px circle) that nudges on hover. At 980px the bento is two columns (the hero and education full width); at 640px, one. The bento labels are Studio copy (Home page → Bench tiles).

### The hero tile

- `.tile-hero` carries its own accent-soft glow top right (`::before`) so it reads as the brightest thing on the bench.
- `.tile-hero` is a flex column (2026-11-14): the name and the title sit at the top, the title on one line where it fits (`.hero-role` lost its `30ch` cap, so it runs at least as wide as the name and wraps only on a narrow tile), and `.hero-meta { margin-top: auto }` pins the meta line and `HeroActions` to the bottom. The tile is as tall as the three tiles beside it, so this balances it against them instead of leaving the spare height under the buttons. The two sides are scaled toward each other: the name is `clamp(40px, 6vw, 72px)` and the title `clamp(17px, 1.9vw, 24px)`, while the three tiles beside the hero (`.tile-now`, `.tile-where`, `.tile-edu`) take 16px of block padding instead of a tile's usual 18 to 24px, since their stack sets the hero's height.
- `.hero-flag`: rendered only when `visibility.openToRelocation` is on. A corner tab holding a pinging `.chip-dot` and `ui.openToRelocation`, absolutely positioned at the tile's top right (`top: 0; right: 0`, only its bottom-left corner rounded at 18px; the tile's `overflow: hidden` clips the outer corner). It is the one element outside the palette: it carries its own `--flag-bg` / `--flag-ink` pair per tone so it reads as the first thing on the page. The tone comes from Site Settings → Layout → **Relocation tab colour** (`layout.relocationColor`, written as `data-tone`): `amber` (the default when left out; amber `#f5a524` in light and `#fbbf24` in dark, both with `#231500` text), `green`, `coral`, `violet` or `ink` (which uses `--ink` on `--paper`). The label is the mono font at 11.5px, weight 400. When it is present the name below takes a 30px top margin (`.hero-flag + .hero-name`) to clear it at phone width. The tile carries no monogram.
- `h1.hero-name`: `page.hero.lines` joined, `clamp(38px, 5.4vw, 62px)` at 600.
- `p.hero-role`: `person.title` in the accent. (The Blue Sheet caret is gone.)
- `.hero-meta`: lucide `MapPin` + the location, and `Briefcase` + `.hero-now-role` (the current role) "· `<company>`, since `<start>`" from `page.hero.currentRole`.
- `HeroActions` at the foot.

### `HeroActions.tsx`

`"use client"`. This is the button row at the foot of the hero tile (it replaced `BpActions` in Blue Sheet and is unchanged by Clean Bench).

- **Download PDF.** When `resumeHtmlPath` is set (today `"/resume/RileyBeenders_Resume_26311.html"`), it is a `.btn.btn--solid` anchor with `target="_blank" rel="noopener"` that opens the interactive HTML resume in a new tab, where its Print / PDF button saves the file. Without it, the button runs a three-state machine (`idle | loading | error`): it dynamically imports `ResumeBuilder/downloadPublishedResume` and calls `downloadPublishedResumePdf(resumePdfPath)`. A failure renders `.hero-error` with `role="alert"`. The solid button carries the looping `.bp-sheen` while idle.
- **Email / LinkedIn / GitHub.** Plain `.btn` anchors (`mailto:`, `person.linkedin`, `person.github`; the last two open with `target="_blank" rel="noreferrer"`). The icons are lucide `Mail` and the `BrandIcons` marks.

See [[Resume PDF Pipeline]].

## `GithubGraph.tsx` + `lib/github.ts`

**`lib/github.ts`** (server). `githubUsername(person.github)` takes the login from a github.com profile URL (`RileyBeenders`). `getContributions(username)` fetches `https://github.com/users/<name>/contributions` (GitHub's own public fragment, the markup the profile page embeds) with `next: { revalidate: 3600 }`, an `Accept: text/html` header and a site User-Agent. No token and no third-party service are involved. `parseContributions()` reads every `<td data-date data-level id>` cell and its `<tool-tip for>` count ("No contributions" → 0) into `{ username, total, days: { date, level 0–4, count }[] }`, oldest first. A failed fetch or an empty parse returns `null`. Because the fetch is cached for an hour, `/` is ISR, and a visitor never talks to GitHub.

**`GithubGraph.tsx`** (`"use client"`) draws the calendar as one SVG:

- **Layout.** One column per week, Sunday at the top. The cells are 12px with 3px gaps (`rx 2.5`). Month labels sit over the first week of each month (skipping a label that would collide). Mon / Wed / Fri labels run down the left.
- **Colour.** The fill is GitHub's own five levels mapped to `--lv0…--lv4` in `bench.css`'s activity section. In light mode they come from `--ink` / `--white` / `--accent-soft` / `--accent-fill`. In dark mode `--lv1`, `--lv2` and `--lv4` are literal hexes (`#1d2a4d`, `#27408f`, `#6a93ff`).
- **Text.** Each cell has a `<title>` ("3 contributions on November 7, 2026"). The header shows `ui.activity.total` ("{count} contributions in the last year"), and the foot has a "View on GitHub" `.bp-link` and the Less → More legend.
- **Motion.** The first time 25% of the tile is in view (`useInViewOnce`), the cells pop in column by column: `activity-in`, 0.5s, `--i` × 11ms per week.
- **Overflow.** The SVG has a `min-width` of 720px, so on a phone the calendar scrolls sideways inside `.activity-scroll` (marked `data-native-scroll`).
- **Fallback.** With `data === null` the tile shows `ui.activity.unavailable`. Print hides it.

Labels come from Studio: Navigation & labels → GitHub activity, and the heading from Home page → headings → GitHub activity.

## The summary and fact tiles (in `page.tsx`)

`#summary`, headed "Who is Riley?" (`page.headings.summary`). It is a `.summary-grid`: the summary paragraphs (`splitParagraphs`, with the `page.summaryLink.text` phrase turned into an external link) beside a 300px `<dl class="facts">`. The fact tiles are labelled in mono from Studio copy: Experience (the current role · company), Education (the first degree · school), Based in (`bento.location` since 2026-11-14; the location, with "· Open to relocation" when on), and Site (`footer.siteLabel` → `footer.siteLink`). Under 980px the grid is one column. The heading and the grid share one `.card.panel` tile under a single `Reveal`; the fact tiles inside it use `--paper`.

## `Experience.tsx`

`"use client"` (for the per-role fold). It renders the roles, newest first, as a timeline inside one tile (`div.card.roles`).

- **Layout.** Each `article.role` is a `150px | 1fr` grid. The left column holds the mono dates (start in bold ink, then the end) on a `.role-rail` with a `.role-dot`, which fills with the accent and scales 1.2× on hover. The right column has the `h3` role, `.role-org` (the company in the accent, then "· location" muted), the optional italic `context` (`Paragraphs`), and the bullets.
- **Bullets.** Each bullet is `<EmphasizedText className="bp-bullet-emphasis">`, so the Studio's accent phrases take the accent (plus a hairline text stroke) when the `li` is hovered or focused, and the `li` nudges 3px. A bullet whose `projectId` names a published catalog entry ends with a `<BulletLink>` to `/projects#project-<id>`, which opens that project's dialog. Its label is `ui.bulletReadMore`, its motion is `page.readMore.animation` (today `glint`), and `index` counts links across all roles, so each glint gets its own beat.
- **Folding.** A role with **more than seven** bullets (`AT_REST = 6`; it folds when `bullets.length > 7`) shows six, then a `.role-more` pill button, "Show N more" / "Show fewer" (`aria-expanded`). Every bullet is still in the page for printing and search.
- **Older roles (2026-11-14).** Only roles from the last few years show at rest: `layout.experienceYears` (Site Settings → Layout → **Experience shown (years)**, 5 when left out, 0 shows all). `app/(site)/page.tsx` flags each role with `lib/dates.ts` → `endedWithinYears(role.end, years, today)` (a role still running, or an end it cannot read, counts as recent; a bare year counts as that December) and passes the flags as `older`; a role's own `homeDisplay` (Studio: Experience → each role → **Home page**: By date / Always shown / Behind See more) wins over the dates, so a current side role such as RJB.Engineering can be set to `"more"` and only appear when the history is opened; if every role would be hidden it hides none. The flagged roles render inside `.roles-rest` with the `hidden` attribute, so they stay in the page and print shows every role; the recent ones keep their order, so a long-running side role stays visible wherever it sits. Under the roles tile, inside the section box, `.roles-more` is one full-width accent-tinted button, larger than the `.role-more` pills: "See more of my past" plus a mono count ("3 earlier roles"), then "Show less" (`page.json` `experience.moreLabel` / `lessLabel`). Closing scrolls the button back to the middle of the window. Its rules are written `.bp .roles-more` because `.bp button { font: inherit; color: inherit }` outranks a single class.
- **Entrance.** Each role is wrapped in a `Reveal` with `Math.min(index, 3) * 0.05`s of stagger.
- **Phone.** Under 760px the grid is one column, the rail and dot hide, and the dates run inline ("start · end").

## `Stack.tsx`

Server-safe. Since 2026-11-15 it builds the Skills and Tools picker: one entry per non-empty group in `skills.json`, each with a colour `var(--grp-n)` by position (seven hues in `bench.css`, light and dark, repeating past seven), plus an **All** entry (`page.skillPicker.allLabel`) that lists every item once in group order, each item wearing its first group's colour. `allSkillTargets(data)` (`lib/skill-links.ts`) merges every group's `links` by item, so a link set in one group follows the item into all of them. It hands everything to `SkillPicker.tsx` (client).

## `SkillPicker.tsx`

One `.card.skills-box`: a solid header bar (`.skills-tabs`, a solid `color-mix(var(--ink) 7%, var(--white))` fill: a step darker than the tile in light mode, a step lighter in dark) of mono tabs, each a colour dot and the group name, centred, wrapping rather than scrolling so every group stays in sight; then the panel. Nothing is open on load: the panel shows `page.skillPicker.hint`, centred with about two and a half lines of space above and below, under a double chevron. While nothing is picked and the tile is in view (`useInView`, 35%), `.skills-box[data-cue]` runs the "pick one" cue: the chevrons climb toward the bar (lower then upper, 2.2s loop) and a wave runs along the tab dots, each swelling 1.6× with a ring in its own colour (4.4s loop, 0.11s per tab). Picking a tab stops it; reduced motion shows a still arrow. Picking a tab (`aria-pressed`, `aria-controls` the panel) sets its name in full ink, bold, over a 2px line in its colour that slides between tabs (`layoutId`; the other tabs are `--ink-soft`), the panel's height follows its content (ResizeObserver, 0.5s on `--ease`, clipped only while moving so a linked skill's hover card can spill out), and the rows rise in (8px, stagger `min(i,6) × 0.05`); picking the open tab closes it. Since 2026-11-15 the group is a plain list, not pills: `ul.skills-list`, a grid flowing by column (three columns, two under 860px, one under 560px; rows from `--rows-3` / `--rows-2`, set by `rowsFor`), each row left-aligned on a hairline with a 3px bar in the group colour (`.skills-mark`) before the name (`.skills-item`). Linked ones still render as `<LinkedSkill>` with `page.linkedSkills` (link icon, Read more, hover card) but lose the pill chrome (border, fill, lift, corner marks) and read in ink. Print hides the box and shows `.skills-print`, every item once in the same column list. Pill styles stay in `app/(site)/skill-pills.css`; the bar and colours are in `bench.css` under `stack`.

## `Education.tsx`

Server-safe. An `.edu-grid` (1.1fr : 2fr, one column under 980px):

- **Degree.** The first `article.card.degree` has a lucide `GraduationCap` in the accent, the school, the degree and the graduation date.
- **Certificates.** A `.certs` grid of `article.card.card--hover.cert` (name, issuer, date, and an optional `.bp-link` "Show credential" to `credentialUrl`), each in a `Reveal` staggered 0.05s, capped at five steps.

## `ContactBlock.tsx` + `ContactForm.tsx`

**`ContactBlock`** (server-safe) ends the home page (`#contact`) and is the body of `/contact` (`heading={false}`, because that page draws its own `h1`). It is one `.card.contact-card` tile split 1 : 1.15. The left half, on `--tint`, holds:

- the `hero.title` as an `h2` (home only);
- the italic `hero.tagline` and the `details.description` paragraphs;
- the `.contact-ways` rows: email (`mailto:`), LinkedIn and GitHub (their hostnames shown), and the location with "Open to relocation". Each row has a small label, and the rows nudge right on hover.

The right half, on `--white`, is `<ContactForm copy={contact.form} fallbackEmail={person.email} />`. Under 760px the halves stack.

**`ContactForm`** (`"use client"`) is the message form:

- **Fields.** Name and email side by side, then the message, labelled from `contact.json` `form` (Studio: Contact → Message form). A visually hidden `company` field is the honeypot.
- **Submit.** It posts JSON to `/api/contact`. A status line moves through `sending` → `sent` (the form resets) or `failed`.
- **The 503 fallback.** If the route answers **503** (no `RESEND_API_KEY` / `CONTACT_TO` yet), the form shows `fallback` and sets `window.location.href` to `mailto:<person.email>?subject=Message from <name> via rileybeenders.com&body=<message> — <name> <email>`, so the message reaches Riley through the visitor's own mail app.
- **Coming soon.** While `form.comingSoon` has text (currently `"Coming soon"`, 2026-11-15), the form is wrapped in `.form-soon`: it renders at 30% opacity and `inert` (no focus, no clicks, no submit), with the label centred over it as `.soon`: the text in uppercase mono between two hairlines (`.soon-line`). A 72px accent segment (`--seg`) sweeps the whole label width left to right as one indeterminate-progress loop, passing behind the text at constant speed: `.soon` is an inline-size container, and the left line's segment (`soon-sweep-l`, anchored left) and the right line's (`soon-sweep-r`, anchored right) translate in `cqw` of the label with identical timing, so their positions always coincide (2.4s cycle, the last 18% a rest; paused while the form is hovered; under reduced motion the segment is hidden and the lines stay still). Clearing the field in the Studio turns the working form back on; no code change needed.

The server side is in [[Routes Overview]].

## `SiteFooter.tsx`

Server-safe, and on every page (home, projects, a project page, contact). `<footer class="footer">` holds `<BpMark id="footer" size={44} animated float />` beside `page.footer.note`, then a quiet mono line, `<dl class="footer-meta" aria-label="About this page">`:

- **Site** (`footer.siteLabel`): `footer.siteLink`;
- **Updated** (`footer.updatedLabel`): the build date · short commit from `lib/build-stamp.ts`, omitted when no commit is known;
- **Actively loading in** (`footer.locationLabel`; "Based in" until 2026-11-14): the location. Footer only: the summary's location fact now reads its label from `bento.location`, like the location tile, so both still say "Based in".

All of it is Studio copy (Home page → Footer). Until 2026-11-09 the keys were `sheetLabel` / `sheetLink` / `revisionLabel` and the line was Blue Sheet's drawing title block.

## Section boxes (`.sec-group`)

`app/(site)/page.tsx` wraps the contents of the Experience, Projects, Skills and Education sections in `<div class="sec-group">`, a fainter box (50% fill, `layout.groupOpacity`) that holds the heading and the tiles under it together; the heading is a `.sec-head` band across the top of the box at 95%, not a tile. The hero bento, the summary and Contact are not wrapped. See [[Design System (Clean Bench)]] for the fill maths.

## `PlotGrid.tsx`

`"use client"`, mounted by the site layout on every page unless Site Settings → Motion → **Animated grid** is off (`motion.grid`, on when left out). It is the animated graph paper behind the tiles: one `<canvas class="plot-grid">` fixed to the window, above the bloom and under every tile, so it shows in the gutters and on the open page. Since 2026-11-14 the tiles are frosted glass (`.card`: `--white` at `--tile-fill`, `backdrop-filter: blur(var(--tile-blur, 1.5px)) saturate(1.2)`), so the grid and the pen's etch glow also show faintly through every tile, softened. Site Settings → Layout → **Tile opacity (%)** (`layout.tileOpacity`, 72 when left out, clamped 40 to 100) sets how much; 100 is a solid tile.

- Every grid node (32px apart, 24px under 700px wide) rests as a small plus. Its arms extend until they meet their neighbours and close the squares.
- What moves them is ripples: every so often one to three random points on or just off the window start a ring with its own speed, width and strength. A ring is a crest with a trough behind it, and a node's arm length is the sum of every ring over it, so crossing crests close the squares fully and a crest meeting a trough cancels back to a plus.
- `loopSeconds` (**Grid loop (seconds)**, `motion.gridLoopSeconds`, 8, clamped 2 to 30) is how long a typical ring takes to cross the window; new rings start in proportion. At most six rings are live.
- `pointer` (**Pen (mouse draws on the grid)**, `motion.gridPointer`, on when left out) is the pen, chosen by Riley on 2026-11-14 from five prototypes: the mouse snaps to the nearest grid node and etches one continuous line along the grid lines as it moves, a step at a time along whichever axis has further to go. Each step is stroked twice with a canvas shadow in `--accent` (a 4px soft pass under a 1.5px crisp one), which gives it a Tron-like glow, and a small dot marks the tip for a second after the last move. Mouse only; the line passes under the tiles like the rest of the grid, its glow showing softly through the glass.
- `trailSeconds` (**Pen trail (seconds)**, `motion.gridTrailSeconds`, 4, clamped 0.5 to 30) is how long a step lasts before it has faded, so the line shortens from its tail. At most 600 steps are kept; a resize clears the line.
- The line colour is `--accent` read from `.bp` (re-read when `data-theme` changes), at 0.15 alpha in light and 0.2 in dark.
- One path and one stroke per frame. Under `prefers-reduced-motion` it draws still graph paper once; print hides it.

## `SmoothScroll.tsx`

`"use client"`, mounted by the site layout when Site Settings → Motion → **Smooth scrolling** is on (`motion.smoothScroll`, on). It provides inertial wheel scrolling with no library and no transform on the page, so the native scrollbar, anchors and scroll-driven animations all keep working.

- **The glide.** Each wheel event moves a target. The page lerps toward it at 0.11 per frame and settles within 0.4px. A single event is clamped to 1.4 viewports, and line- or page-mode deltas are scaled to pixels.
- **When it steps aside:**
  - always, for touch and pen devices (it runs only for `(hover: hover) and (pointer: fine)`) and under reduced motion;
  - for Ctrl/⌘ + wheel (pinch zoom);
  - while `<html>` has `data-lock` (the project dialog);
  - over any element that can still scroll in that direction, or that carries `data-native-scroll` (the dialog body, the calendar, the tracker table, the lightbox).
- **Interruptions.** `keydown`, `touchstart` and `hashchange` stop a glide and re-sync, and a scroll it did not cause (the scrollbar, a key) moves the target too.
- **Stalls.** If the frame loop has not ticked for 160ms (a background tab), the next wheel event jumps straight to its destination instead of being swallowed.

## Primitives kept from Blueprint Press

### `components/blueprint/Reveal.tsx`

`"use client"`. The `framer-motion` scroll-entrance wrapper used around nearly every block. Props: `children`, `delay`, `as` (`"rise"`, the default, `"rule"`, `"fade"` with an optional `blur` capped at 6px, or `"slide"` with `from="left" | "right"`), `className`.

- Under `useReducedMotion()` it renders a plain `<div>`.
- `rise` is opacity 0 → 1 with y 22 → 0.
- It uses `whileInView` with `viewport={{ once: true, amount: 0.12, margin: "0px 0px -60px 0px" }}`. An element taller than the viewport can never reach that, so a whole project page uses the CSS `.page-in` entrance instead.
- The curve is `[0.22, 0.9, 0.28, 1]`, the same as `--ease` in `bench.css`. Durations: rise 0.82s, rule 0.9s, fade 0.7s, slide 0.72s.

### `components/blueprint/BackToTop.tsx`

`"use client"`. The bottom-left "Back to Top" pill (`.bp-top`, styled in `bench.css`'s floating-controls section: frosted white, `blur(10px)`, `--shadow`, mono 10.5px uppercase). It shows (`is-shown`) once `scrollY` passes 80% of the viewport and smooth-scrolls to the top. It is on `/`, `/projects` and every project page. `next.config.mjs` moves the Next dev overlay to the bottom-right so it doesn't cover the button.

### `components/blueprint/StudioLink.tsx`

`"use client"`, development only. The bottom-right "Edit in Studio" pill (`.bp-studio-link`) that opens the Studio on the file behind the current page:

| Page | Opens |
|---|---|
| `/` | `#summary` |
| `/projects` | `#projects` |
| `/contact` | `#contact` |
| `/projects/<id>` | `#projects/<id>`, or `#aboutSite` when the id is `rileybeenders-com` |
| `/projects#project-<id>[-case-study]` | the same entry, with the case-study suffix dropped |

It reads `process.env.NEXT_PUBLIC_STUDIO_URL` (set only by `npm run site`), and renders nothing without it, on a non-loopback host, or on a route it doesn't know. The site layout loads it through a `next/dynamic` import that exists only in development, so production builds contain none of it. `target="rileybeenders-studio"` reuses one Studio window. `scripts/capture-site-screenshots.mjs` and print both hide it.

### `components/blueprint/AnimationSync.tsx`

Mounted when Site Settings → Motion → Sync animations is on. It moves every infinite CSS animation's `startTime` back to the last whole cycle, so every Read more glint and linked-pill border runs on one beat. See [[Data Layer and Types]] (`MotionSettings`).

### `components/content/EmphasizedText.tsx` and `Paragraphs.tsx`

**`EmphasizedText`** is server-safe. It takes `text`, `phrases` (a bullet's `emphasis: string[]`, picked in the Studio) and `className`, and wraps each exact phrase in a `<span className>`. When phrases overlap the longest wins, and a phrase that doesn't occur verbatim is ignored. The class is `.bp-bullet-emphasis` on the resume and `.pj-bullet-emphasis` in `ProjectBody`.

**`Paragraphs`** / `splitParagraphs()` split Studio body text on empty lines into `p[data-para]`.

### `components/blueprint/BulletLink.tsx`

Server-safe. The Read more button at the end of a resume bullet: a `next/link` `.bp-bullet-link` with `data-motion` (`sweep | roll | launch | offset | trace | glint | still`; Studio: Home page → Read more button), `aria-label="See the <project> project"` and `suppressHydrationWarning`. `roll` splits the label per character, and `glint` adds an `aria-hidden` band carrying `--i`. Nothing variable goes in the anchor's own `style`, because the browser extension that stamps anchors rewrites it (see `check-anchor-hydration.mjs` in [[Build Tooling and Config]]). The styles are in `app/(site)/bullet-link.css`, and the Studio's picker builds the same markup.

### `components/blueprint/LinkedSkill.tsx`

`"use client"`. A skill linked to a published project or proof: a `.bp-pill.bp-pill--linked` with `data-border` / `data-reveal` and `--k`, holding the name, a `next/link` `.bp-pill-more` (the lucide link-2 icon, plus a label that opens into a small accent button on hover or focus) and an `aria-hidden` `.bp-skill-card` with the target's name and kind. `place()` measures on pointer-enter and focus to keep the card inside the window. The styles are in `app/(site)/skill-pills.css`, and the Studio builds the same markup for its previews.

### `CountUp`, `ScrollWords`

Both live in `components/blueprint/` and are used by the site entry's deep dive (see [[Site Project (About this site)]]).

- **`CountUp`**: a number that springs to its value on view.
- **`ScrollWords`**: a passage whose words brighten as it scrolls up the viewport.

Both render static markup under reduced motion. `WordReveal` was deleted in the redesign (it had no call site since 2026-09-18).

## Related
- [[Clean Bench (2026-11 redesign)]]
- [[Routes Overview]]
- [[Site Nav and Mark]]
- [[Project Catalog and Dialog]]
- [[Resume PDF Pipeline]]
- [[Design System (Clean Bench)]]
- [[Home]]
