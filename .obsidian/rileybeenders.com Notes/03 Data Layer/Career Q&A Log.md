---
tags: [data, content, resume]
---

# Career Q&A Log

`data/career-qa/qa-log.json` is the running history of career questions put to Riley (by a resume review, a recruiter, or an agent) and Riley's answers. Added 2026-10-20 after the `grill-my-resume` run on the Disney Program Engineer resume (application 023).

The site does not import it, and it is not in the Studio's `FILES` map, so edit it by hand. Its readers are the resume procedures: `custom-resume` treats every `answered` or `partial` entry as evidence like any other `data/**/*.json` file, and `fix-my-resume` checks it before asking Riley for a fact, appends new questions as `open`, and records answers (see [[Repository Agent Skills]]).

## Shape

`{ about, statusValues, entries[] }`. Each entry:

- `id`: `YYYY-MM-DD-NN`, the date asked plus a sequence number.
- `asked` / `answered`: ISO dates; `answered` is `null` while open.
- `status`: `open` (asked, no answer yet), `partial` (answered in part; the gap is in `notes` and the follow-up is its own `open` entry), or `answered`.
- `source`: what asked it, e.g. `grill-my-resume, application 023 (Disney Program Engineer)` or `follow-up to 2026-10-20-04`.
- `topics[]`: short tags (budgets, ERP, proposals, ...).
- `question`, optional `clarification` (added when Riley asked what a question meant), `answer` (`null` while open), `notes`, and `usedIn[]` (the resume HTML sources the answer was used in).

## Writing rules

Answers are Riley's facts, rewritten in correct, professional first-person prose: spelling and grammar fixed, never copied verbatim, and never extended beyond what Riley said. Unanswered questions stay in the log so they are not asked twice and show up as known gaps.

## Current state (2026-10-20)

Five answered or partial entries: project budgets and unit-cost tracking in Business Central; customer proposals, scopes, and estimates at Filament Innovations plus the monthly USA review at Proteor; the Business Central implementation (2,000+ items, 150+ products, five weeks); ICARUS-Lite unit goals (60 for 2025, 100 for 2026, so `partial`, since they are goals rather than results); CTO updates to the CEO and company. Five open follow-ups: units delivered against each year's goal, which Filament role the proposal work belongs to, typical budget size and project count, and the Business Central go-live date and team.

The answered facts reached the 023 resume and, on 2026-10-20, `data/home/experience.json` (see [[Career Content]]); the Filament-era proposal work waits on open question 2026-10-20-08 before it goes on the site.

## Related

- [[Career Content]]
- [[Data Layer and Types]]
- [[Repository Agent Skills]]
- [[Job Application Tracker]]
