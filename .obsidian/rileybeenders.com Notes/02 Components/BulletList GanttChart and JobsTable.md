---
tags: [component, client]
---

# BulletList, GanttChart and JobsTable

Three smaller, single-purpose components.

## `components/BulletList.tsx`

`"use client"`. Renders a `<ul>` (or `.compact` variant) of `ResumeBullet`s, used by both `InteractiveResume` (experience bullets) and `ProjectsExplorer` (project bullets).

For each bullet:
- Always renders `bullet.text`.
- If `showProofButtons` is true **and** `bullet.proofId` resolves in `proofById` → renders a `.proof-chip` button ("proof"), wired to `onProofEnter`/`onProofLeave` (hover/focus preview) and `onOpenProof` (click → drawer).
- **Else if** `showProjectButtons` is true and `bullet.projectId` resolves in `projectById` → renders a `.project-chip` button ("project") wired to `onOpenProject`.
- **A proof chip always wins over a project chip** if a bullet somehow has both — the project chip only appears when there's no visible proof. In practice, `resumeData.ts`'s visibility pruning (see [[Data Layer and Types]]) usually removes one or the other before this component ever sees the bullet.
- `showProofButtons`/`showProjectButtons` default to `true`; `InteractiveResume` passes them from `data.visibility.experienceProofButtons`/`experienceProjectButtons` explicitly, `ProjectsExplorer` doesn't pass them (so both stay at their `true` default for project cards).

## `components/GanttChart.tsx`

`"use client"`. Renders the job-application Gantt chart on `/more-info` from the raw mermaid chart string produced by `parseGanttFile()` (see [[More Info and Gantt Data]]).

- **Dynamically imports `mermaid`** inside a `useEffect` (`await import("mermaid")`) so the fairly large library never ships in the initial page bundle.
- Initializes mermaid once per render with `theme: "base"`, `securityLevel: "strict"`, and a full `themeVariables` override so the chart's colors match the site's design tokens (orange primary, teal secondary, warm-gold tertiary — see [[Design System (globals.css)]]) instead of mermaid's defaults.
- After `mermaid.render(chartId, chart)` produces an SVG string, it's injected via `innerHTML`, then **manually rescaled**: `countTotalDays()` regex-scans the chart text for every `YYYY-MM-DD, Nd` task span to find the overall date range, then computes a scale factor so exactly `VISIBLE_DAYS = 20` days fill the container's width — the rest scrolls horizontally (`.gantt-chart { overflow: auto }`). This is what makes the chart "scrollable" per the last commit (`0f69c10`).
- `chartId` is derived from React's `useId()`, sanitized to alphanumerics, so multiple instances never collide.
- On render failure, shows a `role="alert"` message pointing back at `data/more-info/gantt.md` as the likely source of the problem — a deliberate signal for whoever (human or agent) edits that hand-authored file next.

## `components/JobsTable.tsx`

No `"use client"` directive (server-renderable, but only ever used inside the client-rendered `/more-info` tree). Renders the parsed markdown table (`columns`/`rows` from `parseGanttFile()`) as a real `<table>`.

- `WHOLE_CELL_LINK_PATTERN = /^\[([^\]]+)\]\((.+)\)$/` — matches a cell that is **entirely** a markdown link. The regex is greedy/anchored specifically so a URL containing literal parentheses (e.g. a PDF filename like `...(Controls Automation)...pdf`) doesn't get truncated at the first `)`.
- Matched cells render as an external link (`target="_blank"`) with a trailing `ExternalLink` icon; everything else renders as plain text.

## `lib/gantt.ts` — `parseGanttFile()`

Not a component, but the shared parser both `GanttChart` and `JobsTable` depend on indirectly (via `app/more-info/page.tsx`). Deliberately simple, per its own comment, because it only ever parses the repo's own hand-authored `gantt.md`, not arbitrary markdown:

1. Regex-extracts the contents of the first ` ```mermaid ... ``` ` fence as `chart`.
2. Filters all lines starting with `|`, treats the first as the header row (`columns`), and every line from index 2 onward as data `rows` (index 1 is assumed to be the markdown table's `---` separator row and is skipped).

## Related
- [[More Info and Gantt Data]]
- [[Job Application Tracker]]
- [[InteractiveResume]]
- [[Home]]
