---
tags: [data, content]
---

# More Info and Gantt Data

Content source for the `/more-info` route only — not part of the `resumeData.ts` merge pipeline.

## `data/more-info/more-info.json`

Typed by `MoreInfoData` (see [[Data Layer and Types]]). Rendered by `app/(site)/more-info/page.tsx`:

- `aboutHeader` — `{ title, description[] }` → the page hero (title + one intro line).
- `aboutMe` — `{ title, description[] }` → section `01`. Currently one playful placeholder line ("How did you read this before the rest of the site?? …") — genuinely unfinished copy, not a rendering bug.
- `aboutSite` — `{ title, description[], readMore? }` → section `02`. The real "about this site" copy (resume-plus-live-job-search framing), followed by a `.bp-link.bp-readmore` **"Read more"** link when `readMore` is set. `readMore` is currently `{ label: "Read more", href: "https://github.com/RileyBeenders/rileybeenders.com/tree/main/.agents" }` — it opens the repo's `.agents/` folder on GitHub (which renders `.agents/README.md` and lists the three skill folders) in a new tab. If the branch in that URL ever needs to change, it's a plain string in this JSON file (no code change).
- `ganttSection` — `{ title, intro }` → the heading/intro above the tracker. The chart + table themselves come from `gantt.md`, not this file. (`intro` may be absent in the data; the page renders it only if present.)

## `data/more-info/gantt.md` — hand-authored, not JSON

A markdown file combining two things in one document:

1. A fenced ` ```mermaid ` **gantt** block (`dateFormat YYYY-MM-DD`, `tickInterval 1week`, `axisFormat %d %b %Y`, one `section` per job application, tasks tagged `milestone` / `active` / `done` / `crit`).
2. A markdown **table** immediately after it: columns `JobID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Updates`, one row per application, with GitHub-hosted links to the job posting PDF and the resume PDF used.

Read at request time by `app/(site)/more-info/page.tsx` via `fs.readFileSync` (not imported as a module) and split by `lib/gantt.ts`'s `parseGanttFile()` into `{ chart, columns, rows }`, handed to [[GanttChart JobsTable and gantt.ts|GanttChart and JobsTable]].

### Duplicated in `README.md`

`README.md` contains **its own copy** of the same Gantt chart and tracker table (see [[Job Application Tracker]]) — two independently hand-maintained documents describing the same job-search state, with no code-level link, so they drift if only one is edited. The mermaid blocks and tracker tables were verified identical on Aug 22, 2026 (a prior drift — different day-counts through Aug 20, plus a wrong rejection date/duration for application 013 in `README.md`, and entry 008's milestone date corrected 2026-08-13 → 2026-08-14 in both — was fixed then). Keeping the two in sync is exactly what the **Sync Charts** procedure in [[Repository Agent Skills (.agents)]] is for.

### Current tracked applications (as of `gantt.md`)

13 applications, IDs 001–013, spanning Disney (×3), Fluidstack, K2 Space, Relativity Space, SpaceX, Boston Dynamics (×2), Figure Robotics (×3), and Google. Statuses range from "Waiting for Reply" to "Interview Process" to "No Longer in Consideration." Full per-application file references live in [[Job Application Tracker]].

## Related
- [[Job Application Tracker]]
- [[GanttChart JobsTable and gantt.ts]]
- [[Routes Overview]]
- [[Home]]
