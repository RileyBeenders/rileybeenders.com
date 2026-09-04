---
name: sync-charts
description: Keep the Job Application Tracker mermaid gantt block and JobID table identical between README.md and data/more-info/gantt.md. Use whenever either file is edited, or when asked to sync, check, or verify the gantt charts.
---

# Sync Charts

One of three repository agent procedures — see `.agents/README.md` for the set.

Keep the Job Application Tracker gantt chart in `README.md` and `data/more-info/gantt.md` identical. Both files carry the same mermaid `gantt` block and JobID table — `README.md` wraps it under the `## Job Application Tracker` heading (between that heading and the next `***` divider), while `data/more-info/gantt.md` holds it as a standalone block with nothing else in the file.

Run this check whenever either file is edited, or whenever asked to sync, check, or verify the gantt charts.

## How to sync

1. **Refresh every `:active` bar to the run date, in both files, before doing anything else** (see below). This always runs, even if the two files otherwise already match.
2. Extract the mermaid `gantt` block and JobID table from both files — the full content of `data/more-info/gantt.md`, and the equivalent section of `README.md`.
3. Compare the two blocks exactly (post-refresh). If they match, report that the charts are in sync and stop — don't edit anything beyond the active-bar refresh from step 1.
4. If they differ, determine which file was updated more recently:
   - `git log -1 --format=%ai -- data/more-info/gantt.md` for the gantt.md side.
   - For README.md, `git log -p -- README.md` and find the most recent commit whose diff actually touches the Job Application Tracker section — a commit that only changed unrelated content (styling, prose elsewhere in the file) doesn't count.
   - Uncommitted local edits to a chart section always count as the most recent version, ahead of any commit.
5. Copy the mermaid block + table from the more-recently-updated file into the other, replacing only that section:
   - In `README.md`, preserve the `## Job Application Tracker` heading and surrounding `***` dividers — only the block between them changes.
   - In `data/more-info/gantt.md`, keep it as just the raw block — don't add a heading.
6. Before editing the losing file, diff its old chart block against the winning block line-by-line so the exact changes are known.

### Refreshing `:active` bars to the current date

Every run, independent of whether the two files already match, brings each `:active` task bar up to the date the sync is run — a bar shouldn't still read as ending weeks ago just because no one edited the file since:

1. For every line matching `<task name> :active, <start-date>, <N>d`, recompute `N` as the whole number of days from `<start-date>` to today's date (`today − start-date`, in days) — compute it exactly, don't estimate.
2. Floor the result at `1d`. Never write `0d` for an active bar (that's reserved for milestones), and never let an already-future or same-day start date produce `0` or a negative number.
3. Do this refresh independently in *both* files before comparing them (step 3 above) — both should always land on the same duration for the same start date, so a mismatch caused only by one file having a stale duration isn't a "which file is newer" situation, it's just staleness in both.
4. Only `:active` bars move. A task already marked `:done`, `:crit`, or `:milestone` is frozen — never recompute its duration once it's left the active state.
5. Report every refreshed bar in the revision report (see below), e.g. "Extended JobID 001's active bar from 20d to 35d (as of 2026-09-04)." If refreshing is the *only* change in a run — the two files matched otherwise — still report it; don't fold it into the "no mismatch" case.

## Revision report

Every run ends with a report to the user, even when nothing needed to change:

- **No mismatch (beyond active-bar refresh):** state plainly that `README.md` and `data/more-info/gantt.md` already match, then list any `:active` bars that were refreshed to the run date (or say none needed it).
- **Mismatch fixed:** state the sync direction (README → gantt.md, or gantt.md → README), then itemize every change carried over, e.g.:
  - Active bars refreshed to the run date (JobID, old duration → new duration).
  - JobID sections added or removed (by number).
  - Per-JobID task line changes: task name, status keyword (`milestone`/`active`/`done`/`crit`), start date, or duration.
  - Table row changes: added/removed JobIDs, or edited cells (Job Title, Company, Location, Date Submitted, Resume Used, Updates/status).
  - If a change is a status update (e.g. 🟢 → 🟡, or a new "No longer in consideration" date), call that out explicitly since it's usually the most relevant part of the revision.

Keep the report itemized (a short bulleted list per change), not a single vague sentence like "the tables were updated."

## Related procedure

This is a narrower, chart-only counterpart to `vault-sync` (`.agents/vault-sync/SKILL.md`). If the winning content also needs to reach the Obsidian vault notes, the normal `vault-sync` rules still apply after the mismatch is fixed.
