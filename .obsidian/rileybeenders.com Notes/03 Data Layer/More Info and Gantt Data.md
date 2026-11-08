---
tags: [data, content]
---

# More Info and Gantt Data

These are the content sources for the **application tracker**. The `/more-info` page that used to render them was retired in the Blue Sheet redesign (2026-11-08) and now redirects to `/projects/rileybeenders-com#tracker`. The tracker is a section at the foot of the site's own catalog entry (see [[Site Project (About this site)]]). The files kept their paths and names. They are not part of the `resumeData.ts` merge; `lib/catalog.ts` reads them.

## `data/more-info/more-info.json`

Typed by `MoreInfoData` (see [[Data Layer and Types]]). In the Studio it is now labelled **Application tracker**, under the "About this site" rail group.

- `ganttSection`: the part that still renders, read by `tracker()` in `lib/catalog.ts`.
  - `title`: the tracker's `h3`.
  - `intro?`: absent in the data, rendered only if present.
  - `tableNote`: the "Gray rows were applied to before this site…" line above the table.
  - `statusKey { received, interviewing, closed }`: the words beside the 🟢/🟠/🔴 key. The circles stay in code, matching `gantt.md`.
  - `chartVisible` / `tableVisible`: one switch per view, shown in the Studio as **Show Gantt chart on live site** and **Show tracker table on live site**. `chartVisible: false` drops the Mermaid timeline, and `tableVisible: false` drops the applications table. With both off, the site entry has no tracker section and `gantt.md` is not read. **Right now the table is on and the chart is off.**
- `meta`, `aboutHeader`, `aboutMe`, `aboutSite` (with its `readMore` link): the retired page's tab title, hero, and About Me / About the Site copy. They are **kept but not shown**. The Studio schema says so in its description, and nothing in the site reads them.

The chart and table themselves come from `gantt.md`, not this file.

## `data/more-info/past-applications.json`: applications from before the site

`{ _source, applications: PastApplication[] }`, each entry `{ jobTitle, company, location, dateSubmitted (YYYY-MM-DD), resumeUsed, status, jobId }`. It holds the 30 Disney applications made before this site and its tailored resumes:

- 26 copied from the Workday portal's Inactive list on 2026-09-24. Workday doesn't record company or location, so these read `The Walt Disney Company` with a blank location (shown as `—`).
- 4 internship applications from 2021–2022 (Brassring requisitions ending in `BR`), added on 2026-11-07 from Gmail (see [[Past Disney Applications]]). These carry their real business unit and city.

Every entry is `Handmade Resume` and 🔴. Only the tracker table reads it, merged with the `gantt.md` rows by `lib/applications.ts` (see [[GanttChart JobsTable and gantt.ts]]). `README.md` and `gantt.md` are unaffected. It is not in the Studio, so edit it by hand.

## `data/more-info/gantt.md`: hand-authored, not JSON

A markdown file combining three things in one document:

1. A **Status Key**: a bold label and a bullet list (🟢 Application Received, 🟠 Currently in the interview process, 🔴 No longer in consideration). It sits above the chart as plain text, so `parseGanttFile()` ignores it.
2. A fenced ` ```mermaid ` **gantt** block (`dateFormat YYYY-MM-DD`, `tickInterval 1week`, `axisFormat %d %b %Y`, one `section` per job application, tasks tagged `milestone` / `active` / `done` / `crit`).
3. A markdown **table** immediately after it, with columns `ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Status | Job ID`: one row per application, with GitHub-hosted links to the job posting PDF and the resume PDF used.
   - `ID` is the three-digit application number.
   - `Status` holds only the coloured circle from the key.
   - `Job ID` is the employer's own job/requisition number as printed on the posting PDF, or `N/A` when the posting shows none.

`lib/catalog.ts` reads it with `readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf8")` (not as a module import), only while a tracker switch is on, and splits it with `lib/gantt.ts`'s `parseGanttFile()` into `{ chart, columns, rows }`. The result is handed through the site entry's `tracker` to [[GanttChart JobsTable and gantt.ts|GanttChart and JobsTable]] inside `ProjectBody`. Because `/projects/[id]` is statically generated, the file is read at build time.

### Duplicated in `README.md`

`README.md` contains **its own copy** of the same Gantt chart and tracker table (see [[Job Application Tracker]]). They are two independently hand-maintained documents describing the same job-search state, with no code-level link, so they drift if only one is edited. As of Nov 7, 2026 the two copies (key, chart and table) are identical.

That day:

- 004, 007 and 015–021 were closed from rejection emails, and 023 from its Workday "Declined" status.
- 022 was added and has since been marked submitted.
- 025, 026 and 027 were added and submitted, with their own chart sections.

The **Sync Charts** procedure in [[Repository Agent Skills]] reconciles the two copies when they drift.

### Current tracked applications (as of `gantt.md`)

There are 27 applications, IDs 001–027: Disney (×17), Fluidstack, K2 Space, Relativity Space, SpaceX, Boston Dynamics (×2), Figure Robotics (×3) and Google. As of Nov 7, 2026, 12 are waiting for a reply (001, 002, 005, 009–012, 022, 024–027) and 15 are no longer in consideration (003, 004, 006–008, 013–021, 023). The full per-application file references live in [[Job Application Tracker]].

## Related
- [[Job Application Tracker]]
- [[GanttChart JobsTable and gantt.ts]]
- [[Site Project (About this site)]]
- [[Routes Overview]]
- [[Home]]
