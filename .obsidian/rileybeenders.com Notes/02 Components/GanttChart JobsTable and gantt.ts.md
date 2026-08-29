---
tags: [component, client]
---

# GanttChart, JobsTable and gantt.ts

The three pieces that render the job-application tracker on `/more-info`. (`BulletList` was deleted in the reskin — experience bullets on `main` are plain `<li>`s in `app/(site)/page.tsx`, no chips.)

## `components/GanttChart.tsx`

`"use client"`. Renders the job-application Gantt chart from the raw mermaid chart string produced by `parseGanttFile()` (see [[More Info and Gantt Data]]).

- **Dynamically imports `mermaid`** inside a `useEffect` (`await import("mermaid")`) so the library never ships in the initial page bundle.
- Initializes mermaid with `theme: "base"`, `securityLevel: "strict"`, `fontFamily: "var(--bp-font-body)"`, and a full `themeVariables` override so the chart matches the **Blueprint Press** tokens — red primary (`rgba(227,52,47,0.14)` / border `#e3342f`), blue secondary (`#2f86c4`), navy tertiary/text (`#0b1a2b`), `#b9c2cb` grid lines — instead of mermaid's defaults. The `gantt` block also sets `barHeight`, `barGap`, paddings, and `numberSectionStyles: 4`.
- After `mermaid.render(chartId, chart)` returns an SVG string, it's injected via `innerHTML` then **manually rescaled**: `countTotalDays()` regex-scans the chart text for every `YYYY-MM-DD, Nd` span to find the overall date range, then computes a scale factor so exactly `VISIBLE_DAYS = 20` days fill the container width — the rest scrolls horizontally (`.bp-gantt { overflow: auto }`, `height: 50vh`). The container's `maxHeight` is set to the scaled SVG height.
- `chartId` is derived from `useId()`, sanitized to alphanumerics, so multiple instances never collide.
- On render failure: `role="alert"` message pointing back at `data/more-info/gantt.md` as the likely source — a deliberate signal for whoever edits that hand-authored file next.

## `components/JobsTable.tsx`

No `"use client"` directive — server-renderable, but only ever rendered inside `more-info/page.tsx`. Renders the parsed markdown table (`columns` / `rows` from `parseGanttFile()`) as a real `.bp-table` `<table>` inside an `overflow-x: auto` wrapper.

- `WHOLE_CELL_LINK_PATTERN = /^\[([^\]]+)\]\((.+)\)$/` — matches a cell that is **entirely** a markdown link. Greedy/anchored on purpose so a URL containing literal parentheses (e.g. a PDF filename like `…(Controls Automation)…pdf`) isn't truncated at the first `)`.
- Matched cells render as an external link (`target="_blank" rel="noreferrer"`) with a trailing `ExternalLink` icon from `lucide-react` (the only lucide icon used anywhere on `main`); everything else renders as plain text.
- Returns `null` if `columns` or `rows` is empty.

## `lib/gantt.ts` — `parseGanttFile()`

The shared parser both components depend on (via `more-info/page.tsx`). Deliberately simple, per its own comment, because it only ever parses the repo's own hand-authored `gantt.md`:

1. Regex-extracts the contents of the first ` ```mermaid … ``` ` fence as `chart` (`/```mermaid\r?\n([\s\S]*?)```/`, trimmed).
2. Filters all lines starting with `|`, treats line 0 as the header row (`columns`), skips line 1 (the `---` separator), and treats lines from index 2 on as data `rows`. Each row is split on `|` with the leading/trailing pipe and cell whitespace stripped.

Returns `{ chart, columns, rows }`.

## Related
- [[More Info and Gantt Data]]
- [[Job Application Tracker]]
- [[Routes Overview]]
- [[Home]]
