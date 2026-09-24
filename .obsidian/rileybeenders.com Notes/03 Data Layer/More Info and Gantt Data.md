---
tags: [data, content]
---

# More Info and Gantt Data

Content source for the `/more-info` route only — not part of the `resumeData.ts` merge pipeline.

## `data/more-info/more-info.json`

Typed by `MoreInfoData` (see [[Data Layer and Types]]). Rendered by `app/(site)/more-info/page.tsx`:

- `aboutHeader` — `{ title, description[] }` → the page hero (title + one intro line).
- `aboutMe` — `{ title, description[] }` → section `01`. Currently one playful placeholder line ("How did you read this before the rest of the site?? …") — genuinely unfinished copy, not a rendering bug.
- `aboutSite` — `{ title, description[], readMore? }` → section `02`. The real "about this site" copy (resume-plus-live-job-search framing), followed by a `.bp-link.bp-readmore` link when `readMore` is set. Since 2026-09-17 it is `{ "label": "Read the full story", "href": "/about-this-site" }`, pointing at the site's own [[About This Site Page]] (before that it opened the repo's `.agents/` folder on GitHub). The page renders a leading-slash href as an in-tab `next/link` and any other href as an external new-tab `<a>`, so the Studio field accepts either.
- `ganttSection` — `{ visible, title, intro? }` → the heading/intro above the tracker. Studio exposes `visible` as a **Show on live site** switch; when it is `false`, `/more-info` omits the full tracker section, including both the Mermaid timeline and applications table, and does not read `gantt.md`. **It is `false` right now** (set 2026-09-16 with the first published project) — the live More Info page has no tracker, and the About page's timeline carries "The tracker returns" as a planned entry. The chart + table themselves come from `gantt.md`, not this file. (`intro` is absent in the data; the page renders it only if present.)

## `data/more-info/gantt.md` — hand-authored, not JSON

A markdown file combining three things in one document:

1. A **Status Key** (a bold label and a bullet list: 🟢 Application Received, 🟠 Currently in the interview process, 🔴 No longer in consideration). It sits above the chart as plain text, so `parseGanttFile()` ignores it.
2. A fenced ` ```mermaid ` **gantt** block (`dateFormat YYYY-MM-DD`, `tickInterval 1week`, `axisFormat %d %b %Y`, one `section` per job application, tasks tagged `milestone` / `active` / `done` / `crit`).
3. A markdown **table** immediately after it: columns `ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Status | Job ID`, one row per application, with GitHub-hosted links to the job posting PDF and the resume PDF used. `ID` is the three-digit application number; `Status` holds only the colored circle from the key; `Job ID` is the employer's own job/requisition number as printed on the posting PDF, or `N/A` when the posting shows none.

Read at request time by `app/(site)/more-info/page.tsx` via `fs.readFileSync` (not imported as a module) and split by `lib/gantt.ts`'s `parseGanttFile()` into `{ chart, columns, rows }`, handed to [[GanttChart JobsTable and gantt.ts|GanttChart and JobsTable]].

### Duplicated in `README.md`

`README.md` contains **its own copy** of the same Gantt chart and tracker table (see [[Job Application Tracker]]) — two independently hand-maintained documents describing the same job-search state, with no code-level link, so they drift if only one is edited. As of Sep 24, 2026 the two copies (key, chart, and table) are identical, with active bars refreshed through Sep 24 when 017–021 were added. The **Sync Charts** procedure in [[Repository Agent Skills (.agents)]] reconciles them when they drift. The 012 row's filename was also corrected in both files on 2026-09-19 (the em dash in "… Engineering — Google Careers.pdf" became a hyphen to match the file on disk).

### Current tracked applications (as of `gantt.md`)

16 applications, IDs 001–016, spanning Disney (×6), Fluidstack, K2 Space, Relativity Space, SpaceX, Boston Dynamics (×2), Figure Robotics (×3), and Google. Statuses range from "Waiting for Reply" to "Interview Process" to "No Longer in Consideration." Full per-application file references live in [[Job Application Tracker]].

## Related
- [[Job Application Tracker]]
- [[GanttChart JobsTable and gantt.ts]]
- [[Routes Overview]]
- [[Home]]
