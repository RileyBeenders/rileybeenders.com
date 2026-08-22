---
tags: [data, content]
---

# More Info and Gantt Data

Content source for the `/more-info` route only — not part of the `resumeData.ts` merge pipeline.

## `data/more-info/more-info.json`

Typed by `MoreInfoData` (see [[Data Layer and Types]]). Four blocks, each rendered verbatim by `app/more-info/page.tsx`:

- `aboutHeader` — page title + intro line.
- `aboutMe` — currently placeholder copy ("How did you read this before the rest of the site?? / This box uses the same format as \"About the Site\" below.") — genuinely unfinished content, not a rendering bug.
- `aboutSite` — the real "about this site" copy, explaining the resume-plus-evidence-layer concept (mirrors [[Project Overview]]).
- `ganttSection` — just a `{ title, intro }` used as the heading/intro text above the tracker; the actual chart+table come from `gantt.md`, not this file.

## `data/more-info/gantt.md` — hand-authored, not JSON

A markdown file combining two things in one document:

1. A fenced ` ```mermaid ` **gantt** block (dateFormat `YYYY-MM-DD`, `tickInterval 1week`, one `section` per job application, tasks tagged `milestone`/`active`/`done`/`crit`).
2. A markdown **table** immediately after it: columns `GitID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Updates`, one row per application, with GitHub-hosted links to the job posting PDF and the resume PDF used.

This file is read at request time by `app/more-info/page.tsx` via `fs.readFileSync` (not imported as a module) and split apart by `lib/gantt.ts`'s `parseGanttFile()` into `{ chart, columns, rows }`, which are handed to [[BulletList GanttChart and JobsTable|GanttChart and JobsTable]] respectively.

### Duplicated in `README.md`

`README.md` contains **its own copy** of essentially the same Gantt chart and tracker table (see [[Job Application Tracker]]) — they are two independently hand-maintained documents describing the same underlying job-search state, and they can and do drift (the `gantt.md` version currently has slightly different day-counts and a resolved status for entry 008/013 that the README version doesn't yet reflect). There is no code-level link between them. Anyone (human or agent) updating one should update the other, and this is exactly the kind of drift the vault-sync skill in [[Repository Skills (.agents SKILL.md)]] should watch for.

### Current tracked applications (as of `gantt.md`)

13 applications, IDs 001–013, spanning Disney, Fluidstack, K2 Space, Relativity Space, SpaceX, Boston Dynamics (x2), Figure Robotics (x3), Google, and Disney again. Statuses range from "Waiting for Reply" to "Interview Process" to "No Longer in Consideration." Full per-application file references live in [[Job Application Tracker]].

## Related
- [[Job Application Tracker]]
- [[BulletList GanttChart and JobsTable]]
- [[Routes Overview]]
- [[Home]]
