---
tags: [component, client]
---

# GanttChart, JobsTable and gantt.ts

The three pieces that render the job-application tracker. Since the Blue Sheet redesign (2026-11-08, kept by Clean Bench) the tracker is the `section#tracker` at the foot of the site's own catalog entry, `/projects/rileybeenders-com#tracker`, rendered by `ProjectBody` from the entry's `tracker` (built by `lib/catalog.ts`; see [[Site Project (About this site)]]). Before that it was section 03 of `/more-info`, which now redirects there.

## `components/GanttChart.tsx`

`"use client"`. Renders the job-application Gantt chart from the raw mermaid chart string produced by `parseGanttFile()` (see [[More Info and Gantt Data]]).

- **Dynamically imports `mermaid`** inside a `useEffect` (`await import("mermaid")`) so the library never ships in the initial page bundle.
- Initializes mermaid with `theme: "base"`, `securityLevel: "strict"`, `fontFamily: "var(--bp-font-body)"`, and a full `themeVariables` override per theme (`THEME_LIGHT` / `THEME_DARK`, chosen from `useTheme()`) instead of mermaid's defaults. They carry literal colours because mermaid bakes colours into the SVG and cannot read CSS variables. For Clean Bench the border (`#2457e6`) and the text (`#111318` in light, `#ffffff` in dark) were moved to the active preset by hand under the Hard-Copy Rule in `DESIGN.md`; the bar fills are still Electric's washes (`rgba(62, 106, 225, 0.14)` light, `0.28` dark) and its ink-gray secondaries. The `gantt` block also sets `barHeight`, `barGap`, paddings, and `numberSectionStyles: 4`.
- **Shows a 21-day window, opened on the newest dates.** Before rendering, `countTotalDays()` regex-scans the chart text for every `YYYY-MM-DD, Nd` span to find the overall date range. The component then passes mermaid a `gantt.useWidth` (with `useMaxWidth: false`) wide enough that `VISIBLE_DAYS = 21` days plus the right padding exactly fill the container. Mermaid lays the time axis out between `leftPadding` and `width - rightPadding`, so those two values live in one shared `GANTT_LAYOUT` constant (`96` / `75`) used by both the config and the width math. Because the chart is drawn wide rather than scaled afterwards, bars and labels keep their normal size; only the time axis stretches. A chart shorter than 21 days just fits the box.
- After `mermaid.render(chartId, chart)` returns an SVG string, it's injected via `innerHTML`, the container's `maxHeight` is set to the SVG's height, and the container is scrolled to its **bottom-right**: the latest dates sit at the right and the latest applications (and the date axis) at the bottom. Earlier history scrolls in from the left and top (`.bp-gantt { overflow: auto; scrollbar-gutter: stable }`, `height: 50vh`, `min-height: 220px`, inside a `.bp-gantt-wrap` tile; all in `bench.css`'s tables section). The section-label column is at the far left, so it's scrolled out of view on open.
- `chartId` is derived from `useId()`, sanitized to alphanumerics, so multiple instances never collide.
- On render failure: `role="alert"` message pointing back at `data/more-info/gantt.md` as the likely source — a deliberate signal for whoever edits that hand-authored file next.

## `components/JobsTable.tsx`

No `"use client"` directive — server-renderable; rendered by `ProjectBody` (a client component) for the site entry only. Renders **every** application as a real `.bp-table` `<table>` inside an `overflow-x: auto` wrapper. It takes `columns: string[]` and `rows: ApplicationRow[]` (`{ cells, beforeSite }`) built by `lib/applications.ts` (below), not the raw `gantt.md` table.

- Each `<tr>` gets `is-before-site` or `is-with-site`. `bench.css` colours before-site rows `var(--faint)` (gray) and with-site rows `var(--ink)` (full ink), so the switch from handmade resumes to the site's tailored ones is visible in both themes.
- `singleLine` (set by `ProjectBody`) adds `bp-table--single-line`: every `th`/`td` is `white-space: nowrap` with 12px side padding, so each application stays on one line. The table sits in a `data-native-scroll` wrapper inside the 1120px shell (or the 1040px dialog), so it scrolls sideways inside its card (`.bp-table-wrap`, `overflow-x: auto`) and the page itself never does; `SmoothScroll` leaves that wrapper alone. The Blueprint Press `.bp-breakout` that widened the table past the shell is gone. Header cells are mono uppercase on `--tint`.

- `WHOLE_CELL_LINK_PATTERN = /^\[([^\]]+)\]\((.+)\)$/` — matches a cell that is **entirely** a markdown link. Greedy/anchored on purpose so a URL containing literal parentheses (e.g. a PDF filename like `…(Controls Automation)…pdf`) isn't truncated at the first `)`.
- Matched cells render as an external link (`target="_blank" rel="noreferrer"`) with a trailing `ExternalLink` icon from `lucide-react`; everything else renders as plain text.
- Returns `null` if `columns` or `rows` is empty.

## `lib/applications.ts` — `buildApplicationRows()`

Merges the two sources of the live table, oldest first:

- the `gantt.md` tracker rows (applications made with the site), remapped by header name onto `APPLICATION_COLUMNS` = `Status | Job Title | Company | Location | Date Submitted | Resume Used | Job ID` (both sources are mapped by column name, so reordering that array is the only change needed to move a column). The three-digit `ID` column is dropped (it stays on GitHub only), and `Location (Goal)` becomes `Location`;
- `data/more-info/past-applications.json` (applications from before the site), whose ISO `dateSubmitted` is formatted `Month DD, YYYY` to match, with `—` for a blank location.

Rows sort by date; same-day rows keep their source order. In `ProjectBody` the tracker section is the `h3` title, the optional intro, the chart (while `chartVisible`), then — while `tableVisible` — the `tableNote` line (`.pbody-tracker-note`, "Gray rows were applied to before this site and its tailored resumes."), a `.bp-table-key` pill (a `fit-content` row of 🟢 / 🟠 / 🔴 with the `statusKey` words), and the table. The key is rendered in code because the `gantt.md` Status Key is plain text that `parseGanttFile()` skips.

## `lib/gantt.ts` — `parseGanttFile()`

The shared parser both components depend on (called by `tracker()` in `lib/catalog.ts`). Deliberately simple, per its own comment, because it only ever parses the repo's own hand-authored `gantt.md`:

1. Regex-extracts the contents of the first ` ```mermaid … ``` ` fence as `chart` (`/```mermaid\r?\n([\s\S]*?)```/`, trimmed).
2. Filters all lines starting with `|`, treats line 0 as the header row (`columns`), skips line 1 (the `---` separator), and treats lines from index 2 on as data `rows`. Each row is split on `|` with the leading/trailing pipe and cell whitespace stripped.

Returns `{ chart, columns, rows }`.

## Related
- [[Site Project (About this site)]]
- [[More Info and Gantt Data]]
- [[Job Application Tracker]]
- [[Routes Overview]]
- [[Home]]
