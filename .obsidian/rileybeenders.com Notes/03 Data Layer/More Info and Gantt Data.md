---
tags: [data, content]
---

# More Info and Gantt Data

Content source for the `/more-info` route only — not part of the `resumeData.ts` merge pipeline.

## `data/more-info/more-info.json`

Typed by `MoreInfoData` (see [[Data Layer and Types]]). Rendered by `app/(site)/more-info/page.tsx`:

- `meta` — `{ title, description }` → the browser tab and search/share text (2026-09-26).
- `aboutHeader` — `{ title, description[] }` → the page hero (title + one intro line).
- `aboutMe` — `{ title, description[] }` → section `01`. Currently one playful placeholder line ("How did you read this before the rest of the site?? …") — genuinely unfinished copy, not a rendering bug.
- `aboutSite` — `{ title, description[], readMore? }` → section `02`. The real "about this site" copy (resume-plus-live-job-search framing), followed by a `.bp-link.bp-readmore` link when `readMore` is set. Since 2026-09-17 it is `{ "label": "Read the full story", "href": "/about-this-site" }`, pointing at the site's own [[About This Site Page]] (before that it opened the repo's agent-skills folder on GitHub). The page renders a leading-slash href as an in-tab `next/link` and any other href as an external new-tab `<a>`, so the Studio field accepts either.
- `ganttSection` — `{ chartVisible, tableVisible, title, intro? }` → the heading/intro above the tracker, plus one switch per view. Studio shows them side by side as **Show Gantt chart on live site** and **Show tracker table on live site**. `chartVisible: false` drops the Mermaid timeline, `tableVisible: false` drops the applications table, and with both off `/more-info` omits the whole section and does not read `gantt.md`. (These replaced a single `visible` flag that switched both together.) **Right now the table is on and the chart is off.** The About page's timeline carries "The tracker returns" as a planned entry. The chart + table themselves come from `gantt.md`, not this file. (`intro` is absent in the data; the page renders it only if present.) Since 2026-09-26 it also holds `tableNote` (the "Gray rows were applied to before this site…" line above the table) and `statusKey { received, interviewing, closed }`, the words beside the 🟢/🟠/🔴 key; the circles stay in code because they must match `gantt.md`.

## `data/more-info/past-applications.json` — applications from before the site

`{ _source, applications: PastApplication[] }`, each `{ jobTitle, company, location, dateSubmitted (YYYY-MM-DD), resumeUsed, status, jobId }`. Holds the 30 Disney applications made before this site and its tailored resumes: 26 copied from the Workday portal's Inactive list on 2026-09-24, and 4 internship applications from 2021–2022 (Brassring requisitions ending in `BR`) added on 2026-11-07 from Gmail (see [[Past Disney Applications]]). Workday doesn't record company or location, so those 26 read `The Walt Disney Company` with a blank location (shown as `—`); the 4 internships carry their real business unit and city. Every entry is `Handmade Resume` and 🔴. Only the live `/more-info` table reads it, merged with the `gantt.md` rows by `lib/applications.ts` (see [[GanttChart JobsTable and gantt.ts]]); `README.md` and `gantt.md` are unaffected. It is not in the Studio, so edit it by hand.

## `data/more-info/gantt.md` — hand-authored, not JSON

A markdown file combining three things in one document:

1. A **Status Key** (a bold label and a bullet list: 🟢 Application Received, 🟠 Currently in the interview process, 🔴 No longer in consideration). It sits above the chart as plain text, so `parseGanttFile()` ignores it.
2. A fenced ` ```mermaid ` **gantt** block (`dateFormat YYYY-MM-DD`, `tickInterval 1week`, `axisFormat %d %b %Y`, one `section` per job application, tasks tagged `milestone` / `active` / `done` / `crit`).
3. A markdown **table** immediately after it: columns `ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Status | Job ID`, one row per application, with GitHub-hosted links to the job posting PDF and the resume PDF used. `ID` is the three-digit application number; `Status` holds only the colored circle from the key; `Job ID` is the employer's own job/requisition number as printed on the posting PDF, or `N/A` when the posting shows none.

Read at request time by `app/(site)/more-info/page.tsx` via `fs.readFileSync` (not imported as a module) and split by `lib/gantt.ts`'s `parseGanttFile()` into `{ chart, columns, rows }`, handed to [[GanttChart JobsTable and gantt.ts|GanttChart and JobsTable]].

### Duplicated in `README.md`

`README.md` contains **its own copy** of the same Gantt chart and tracker table (see [[Job Application Tracker]]) — two independently hand-maintained documents describing the same job-search state, with no code-level link, so they drift if only one is edited. As of Nov 7, 2026 the two copies (key, chart, and table) are identical. That day 004, 007, and 015–021 were closed from rejection emails, 023 from its Workday "Declined" status, and 022 was added with `TBD` as its date and `—` as its status until Riley confirms whether it was submitted. The **Sync Charts** procedure in [[Repository Agent Skills]] reconciles them when they drift. The 012 row's filename was also corrected in both files on 2026-09-19 (the em dash in "… Engineering — Google Careers.pdf" became a hyphen to match the file on disk).

### Current tracked applications (as of `gantt.md`)

24 applications, IDs 001–024, spanning Disney (×14), Fluidstack, K2 Space, Relativity Space, SpaceX, Boston Dynamics (×2), Figure Robotics (×3), and Google. As of Nov 7, 2026, 8 are waiting for a reply (001, 002, 005, 009–012, 024), 15 are no longer in consideration (003, 004, 006–008, 013–021, 023), and 022 is not yet confirmed submitted. Full per-application file references live in [[Job Application Tracker]].

## Related
- [[Job Application Tracker]]
- [[GanttChart JobsTable and gantt.ts]]
- [[Routes Overview]]
- [[Home]]
