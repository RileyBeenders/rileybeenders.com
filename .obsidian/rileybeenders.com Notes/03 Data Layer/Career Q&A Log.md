---
tags: [data, content, resume]
---

# Career Q&A Log

`data/career-qa/qa-log.json` is the running history of career questions put to Riley (by a resume review, a recruiter, or an agent) and Riley's answers. Added 2026-10-20 after the `grill-my-resume` run on the Disney Program Engineer resume (application 023).

The site does not import it, and it is not in the Studio's `FILES` map, so edit it by hand. Its readers are the resume procedures: `create-custom-resume-pdf` treats every `answered` or `partial` entry as evidence like any other `data/**/*.json` file, and `fix-my-resume` checks it before asking Riley for a fact, appends new questions as `open`, and records answers (see [[Repository Agent Skills]]).

## Shape

`{ about, statusValues, entries[] }`. Each entry:

- `id`: `YYYY-MM-DD-NN`, the date asked plus a sequence number.
- `asked` / `answered`: ISO dates; `answered` is `null` while open.
- `status`: `open` (asked, no answer yet), `partial` (answered in part; the gap is in `notes` and the follow-up is its own `open` entry), or `answered`.
- `source`: what asked it, e.g. `grill-my-resume, application 023 (Disney Program Engineer)` or `follow-up to 2026-10-20-04`.
- `topics[]`: short tags (budgets, ERP, proposals, ...).
- `question`, optional `clarification` (added when Riley asked what a question meant), `answer` (`null` while open), `notes`, and `usedIn[]` (the resume HTML sources and site data files the answer was used in).

## Writing rules

Answers are Riley's facts, rewritten in correct, professional first-person prose: spelling and grammar fixed, never copied verbatim, and never extended beyond what Riley said. Unanswered questions stay in the log so they are not asked twice and show up as known gaps.

## Public repo

The site does not import this file, but the repository is public, so everything in it can be read on GitHub. Facts Riley holds back (specific production figures, unreleased plans, anything marked private) go in the git-ignored `private/` folder, never here, in `output/`, or in this vault.

## Current state (2026-11-07)

41 entries: 19 answered, 10 partial, 12 open. The first set, from 2026-10-20, covers project budgets and unit-cost tracking in Business Central; customer proposals, scopes, and estimates at Filament Innovations plus the monthly USA review at Proteor; the Business Central implementation (2,000+ items, 150+ products, five weeks); ICARUS-Lite unit goals (60 for 2025, 100 for 2026, so `partial`, since they are goals rather than results); CTO updates to the CEO and company. Units delivered against each year's goal stay open with a note that Riley chose not to include them, so they are not asked again. Other open follow-ups include which Filament role the proposal work belongs to, typical budget size and project count, and the Business Central go-live date and team. The 2026-11-06 entries cover ExtrusionStudio (label waste and how it was estimated, the laser-to-spool offset, go-live, the server move, what the data supports), the subject-matter-expert role, the HOA treasurer role, the 2026 inventory count, the offline control screen, and a question asking for examples of off-hours work, now `partial` (vendor work regularly runs into nights and early mornings; no dated example yet). The 2026-11-07 entries, from the application 024 COTS review, record that Proteor's Business Central is the Microsoft-hosted online version on Azure (cloud SaaS support, not Azure administration) and that Riley also supports Siemens PLCs on the extrusion lines, Duet3D controllers, and Mean Well power supplies, which were added to `skills.json` the same day. The application 024 grill added seven more: the ExtrusionStudio packing-bench rollout fix (`partial` until Riley retests 1440p at 100% scaling on 2026-11-09; recorded as go-live troubleshooting, never an outage), no unplanned outage during production since go-live, incident reports written for leadership but not yet for customers, GitHub plus Kanban boards in Microsoft Teams (no JIRA, Scrum, or ServiceNow), the Business Central contact at Proteor headquarters in France (no Microsoft partner or SLA), and Business Central use by the 10 to 15 people at the facility plus 10 to 30 at other Proteor locations. The off-hours entry (2026-11-06-12) now also records Riley working past the 7 a.m. to 4 p.m. day, remotely or at the shop; it stays `partial` without a dated example. Storage and backup work (2026-11-07-07) is open, so resumes leave "storage" out.

The answered facts reached the 023 resume and, on 2026-10-20, `data/home/experience.json` (see [[Career Content]]); the 2026-11-06 answers reached `data/home/experience.json` and `data/projects/projects.json` the same day, and the 2026-11-07 ExtrusionStudio answers reached `data/projects/projects.json` and the 024 resume. The Filament-era proposal work waits on open question 2026-10-20-08 before it goes on the site.

## Related

- [[Career Content]]
- [[Data Layer and Types]]
- [[Repository Agent Skills]]
- [[Job Application Tracker]]
