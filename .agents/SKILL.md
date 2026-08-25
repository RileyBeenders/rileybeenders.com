---
name: custom-resume
description: Generate and verify a job-targeted resume for Riley Beenders using a requested page count, a job-posting PDF, current RileyBeenders.com facts, and the established Disney reference resume. Use when asked to create, tailor, revise, or regenerate a resume for a job PDF in JobsAppliedTo.
---

# Custom Resume

## Collect required inputs

Before starting resume work, determine whether the user's invocation supplies both required inputs:

1. Final resume page count.
2. Job-posting PDF to use for tailoring.

Ask for every missing input in one concise message, then wait for the user's answer. Use these exact questions:

1. `How many pages should the final resume be? (Recommended: 1)`
2. `Which job-posting PDF should I use to tailor the resume?`

Do not ask again for a value already supplied in the invocation. Do not begin research or resume generation until both values are known. After collecting them, confirm the page count and PDF path in one sentence and proceed.

## Task: Generate one tailored resume to a specific job posting.

1. Use the selected page count and job-posting PDF.
   - Ask for clarification if the PDF path matches no file or multiple files.
2. Extract the company, job title, location, responsibilities, qualifications, and important ATS terms from the job PDF.
   - Look for the most important requirements and responsibilities, and any specific keywords that are repeated or emphasized.
   - Keywords are the most important. The wording between `data/skills.json` and the job posting may slightly difer in spelling, punctuation, or capitalization. Use the job posting's wording when possible.
3. Build a fact-only evidence matrix from:
   - `https://www.rileybeenders.com`
   - `data/*.json`
   - Relevant current project source files when they directly prove a technical claim.
4. Never invent experience to match the posting. You can modify the wording to more closely match the posting, but only if the claim is supported by evidence. If a claim is unsupported, judge if it should be used in the resume.
   - Separate supported evidence from gaps.
   - Exclude unsupported tools, platforms, credentials, industries, dates, and performance metrics.
   - Prefer the current live-site wording when older resumes conflict with current data.
5. Draft a concise resume that fits the selected page count and prioritizes the strongest supported evidence for the target role.
6. Match the layout and theme of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf`.
   - Use US Letter portrait format.
   - Preserve the navy headings, Arial typography, spacing, rules, and single-column structure.
   - Make every contact hyperlink blue, visibly underlined, and clickable.
7. Save the final PDF to `output/pdf/` using:

   `RileyBeenders_<Company>_<Job_Title>.pdf`

   Replace spaces and invalid filename characters with underscores.
8. Validate before delivery.
   - Require exactly the selected number of pages, each at 612 x 792 points.
   - Render the page and inspect it for clipping, overlap, malformed glyphs, and inconsistent spacing.
   - Confirm the phone, email, website, and LinkedIn URI annotations work.
   - Confirm all linked text is blue and underlined.
   - Confirm the final text contains the supported target keywords and none of the unsupported claims identified during the evidence audit.
9. Return a clickable link to the final PDF and a short verification summary.

When subagents are available, parallelize job analysis, evidence auditing, and content strategy. Keep final writing, PDF generation, and quality approval with the primary agent.

## Example task

User request:

`$custom-resume`

Assistant intake request:

1. `How many pages should the final resume be? (Recommended: 1)`
2. `Which job-posting PDF should I use to tailor the resume?`

User response:

`Use 1 page and JobsAppliedTo/006_Principal Software Engineer at Disney.pdf.`

Expected result:

- Read the Disney job posting and current RileyBeenders.com evidence.
- Emphasize only supported software, infrastructure, automation, and leadership experience.
- Record important Disney requirements that are not supported and keep them out of the resume.
- Generate and verify `output/pdf/RileyBeenders_Disney_Principal_Software_Engineer.pdf`.

---

# Vault Sync (Documentation)

Keep the Obsidian vault at `.obsidian/rileybeenders.com Notes/` in sync with the live site. This applies to **every** agent working in this repo — Claude Code, ChatGPT, or anything else — not just Claude. Whenever you change site code, data, or config in this repo, update the matching vault note(s) in the same session, before finishing the task.

The vault is git-tracked so it travels with clones and branches. `.gitignore` excludes only `**/.obsidian/workspace.json` (per-device pane/tab layout) — everything else in the vault, including the note content and the rest of the vault's own `.obsidian/` config, is meant to be committed. When you edit vault notes, stage them normally; don't add new exclusions for vault files without a specific reason (e.g. actual machine-local state, not content).

## When this applies

Any change under: `app/`, `components/`, `data/`, `lib/`, `types/`, `ResumeBuilder/`, `public/`, `README.md`, `README_TODO.md`, `package.json`, `next.config.mjs`, `tsconfig.json`, or `.agents/SKILL.md` itself. Changes confined to `JobsAppliedTo/`, `output/`, `references/`, or `tmp/` only need a vault update if they add/remove a tracked job application (update [[Job Application Tracker]] and see **Job application detail pages** below) — routine PDF file drops don't.

Also applies whenever `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, or `data/projects/projects.json` changes for any reason (not just from a site-code task) — every open job application's detail page has a **Now** comparison that must reflect current skills/experience, so a content-only edit to those files still triggers a vault update. See **Job application detail pages** below.

## What maps to what

| Changed | Update this note |
|---|---|
| `app/layout.tsx`, any `app/*/page.tsx`, `app/api/**` | `01 Routes and Pages/Routes Overview.md` |
| `components/InteractiveResume.tsx` | `02 Components/InteractiveResume.md` |
| `components/SiteHeader.tsx` (incl. `SECTIONS_BY_ROUTE`/`PRIMARY_NAV`) | `02 Components/SiteHeader.md` |
| `components/ProjectsExplorer.tsx`, `components/ProjectDetails.tsx` | `02 Components/ProjectsExplorer and ProjectDetails.md` |
| `components/BulletList.tsx`, `components/GanttChart.tsx`, `components/JobsTable.tsx`, `lib/gantt.ts` | `02 Components/BulletList GanttChart and JobsTable.md` |
| `types/resume.ts`, `types/more-info.ts`, `data/resumeData.ts`, `data/header.json` | `03 Data Layer/Data Layer and Types.md` |
| `data/home/*.json`, `data/projects/*.json` | `03 Data Layer/Career Content.md` |
| `data/more-info/*.json`, `data/more-info/gantt.md` | `03 Data Layer/More Info and Gantt Data.md` |
| `ResumeBuilder/**`, `app/api/resume-pdf/route.ts` | `04 Resume PDF Pipeline/Resume PDF Pipeline.md` |
| `app/globals.css` | `05 Styling and Design/Design System (globals.css).md` |
| `JobsAppliedTo/`, `output/ApplicationsUsed/`, `output/pdf/`, `references/`, README tracker table, `data/more-info/gantt.md` tracker table | `06 Job Search Tracking/Job Application Tracker.md`, plus a new page under `06 Job Search Tracking/Applications/` for any new application ID — see **Job application detail pages** below |
| `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, `data/projects/projects.json` | Every existing note in `06 Job Search Tracking/Applications/` — refresh each one's **Now** section — see **Job application detail pages** below |
| `package.json`, `next.config.mjs`, `tsconfig.json`, `.gitignore` | `07 Build Tooling and Config/Build Tooling and Config.md` |
| `.agents/SKILL.md` itself (this file) | `08 Agents and Automation/Repository Skills (.agents SKILL.md).md` |
| New route, component, data file, or top-level folder with no existing note | Create a new note in the matching numbered folder above, following the existing notes' structure (frontmatter tags, a short prose description, a `## Related` section with wikilinks), then add it to the Map of Content and any relevant cross-links in `Home.md` |

## How to update

1. Identify exactly what changed (new/removed field, renamed function, new component prop, new route, new data entry, etc.) — don't guess from the filename alone, read the actual diff.
2. Open the matching note(s) from the table above and edit only the parts describing what changed. These notes are meant to be precise and current, not historical — don't leave stale facts alongside corrected ones, and don't add a changelog section.
3. If the change removes a documented feature (e.g. a component, route, or data field this vault currently describes), remove or correct the corresponding claim rather than leaving it to describe something that no longer exists.
4. If the change affects a cross-reference called out in another note (e.g. `SiteHeader`'s `SECTIONS_BY_ROUTE` map, or the `resumeData.ts` visibility-flag behavior), check that note too — several notes intentionally reference the same underlying mechanism from different angles.
5. Keep prose style, heading structure, and `[[wikilink]]` conventions consistent with the existing notes in that folder.
6. Don't rewrite unrelated notes "while you're in there" — touch only what the change actually affects.

## Job application detail pages

Every job application tracked in `README.md` / `data/more-info/gantt.md` (IDs `001`, `002`, ...) has its own note in `06 Job Search Tracking/Applications/`, named `<ID> <Company> - <Short Role>.md`. Each one follows this exact section order — don't reorder or drop sections, and don't add new ones beyond what's below plus the standard frontmatter and `## Related` footer:

```
# <Role> — <Company>

---
**Job ID:** ...
**Date Posted:** ...
**Date Applied:** ...
**Salary Range:** ...
---

## Job Summary
...

---

## What You'll Do
(role duties, then ### Required Qualifications, ### Education, ### Benefits as sub-sections)

---

## How I Match Up
### At Application — <date applied>
### Now — <today's date>

---

## About the Company
...

---

## Related
- [[Job Application Tracker]]
- Source posting: `JobsAppliedTo/<file>.pdf`
- Resume used: `output/ApplicationsUsed/<file>.pdf`
```

Frontmatter property keys are always capitalized: `Tags: [job-application]`, `Company`, `Role`, `JobID`, `Date Applied`, `Status` (mirror the emoji-coded status from the README/gantt tracker table as plain text, e.g. `"Application Received"`, `"Interviewing"`, `"No longer in consideration (Aug 4, 2026)"`), and `PDF Referenced` — a GitHub `blob` URL to the source posting PDF in `JobsAppliedTo/`. `JobID` is the value used everywhere in the vault and in repo tables (see **Renaming GitID to JobID** below) — it is the same three-digit application ID, not a GitHub or job-board internal ID.

### Renaming GitID to JobID

The tracker table's first column is named `JobID`, not `GitID`, in both `README.md` and `data/more-info/gantt.md` — this was renamed for clarity since the column has nothing to do with git. If you ever see `GitID` reappear in either table (e.g. from a stale edit or a merge), correct it back to `JobID`, and update any vault note quoting that column list (currently [[More Info and Gantt Data]] and [[Job Application Tracker]]) to match. `JobsTable.tsx` renders whatever header text is in the table, so this column name change alone requires no code change — it flows straight through to the live site.

### Linking the PDF Referenced property

The `PDF Referenced` value is a GitHub `blob` URL to the application's source PDF:

`https://github.com/RileyBeenders/rileybeenders.com/blob/<branch>/JobsAppliedTo/<url-encoded-filename>.pdf`

- **Always check the current branch before writing or updating this link.** Run `git branch --show-current` (or equivalent) at the moment you write the property, and use that exact branch name as `<branch>`. Never hardcode a branch name left over from a previous session. If the branch you're on is `main`, the link correctly reads `.../blob/main/...` — `main` is not a special case to avoid, it's just whatever the current branch happens to be.
- URL-encode the filename the way GitHub does: spaces → `%20`, commas → `%2C`, ampersands → `%26`, and any non-ASCII character (e.g. an em dash) as its percent-encoded UTF-8 bytes (e.g. `—` → `%E2%80%94`). Parentheses can stay literal. When in doubt, reuse the exact encoded filename already present for that ID in the README/`gantt.md` tracker table rather than re-encoding by hand.
- If the repo later merges so a file only exists on `main`, re-check the branch and update every `PDF Referenced` link that still points at a deleted branch — a stale branch segment 404s.

### Creating a new application page

When a new ID appears in `JobsAppliedTo/` and the README/`gantt.md` tracker table:

1. Read the job-posting PDF in full and extract Job ID (if the posting states one internally — job-board URL IDs don't count), date posted, salary/comp range, job summary, responsibilities, required/preferred qualifications, education requirement, and benefits, exactly as the posting states them. Don't paraphrase requirements into something stronger or weaker than what's written.
2. Pull "Date Applied" from the README/gantt tracker row for that ID.
3. Build the `PDF Referenced` frontmatter link per the rule above.
4. Write the **At Application** match: compare the posting's requirements against `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, and `data/projects/projects.json` **as they existed on or before the application date** (check with `git log`/`git show` against that date if the current files may have changed since — see the next section). State concrete overlaps and concrete gaps; never invent supporting experience that doesn't exist in the data, matching the fact-only evidence standard used by the `custom-resume` skill above.
5. Write the **Now** section using current data. If nothing relevant has changed since application, say so plainly rather than padding out an artificial difference.
6. Add the new row to the tracker table in [[Job Application Tracker]], linking the JobID cell to the new page.
7. Link the new page from `Home.md` only if it changes the vault's structure (it normally won't — the Job Application Tracker note is the index into these pages, so Home.md doesn't need a per-application link).

### Keeping the "Now" section current

Whenever `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, or `data/projects/projects.json` changes for any reason:

1. For every **existing** page in `06 Job Search Tracking/Applications/`, re-run the match against the new data.
2. If the comparison changed, update only the **Now** section — leave **At Application** untouched, since it's a frozen historical snapshot of what the site claimed on that date. Never rewrite **At Application** to reflect current data.
3. If nothing material changed for a given application, leave that page alone — don't touch a page just to bump a date with no substantive difference.
4. If the underlying data change closes a gap noted in **At Application** (e.g. a skill gets added that a posting specifically asked for), call that out explicitly in **Now** rather than silently updating the bullet list — the point of this split is to make skill growth over time visible, not to erase the historical gap.

---

# Sync Charts

Keep the Job Application Tracker gantt chart in `README.md` and `data/more-info/gantt.md` identical. Both files carry the same mermaid `gantt` block and JobID table — `README.md` wraps it under the `## Job Application Tracker` heading (between that heading and the next `***` divider), while `data/more-info/gantt.md` holds it as a standalone block with nothing else in the file.

Run this check whenever either file is edited, or whenever asked to sync, check, or verify the gantt charts.

## How to sync

1. Extract the mermaid `gantt` block and JobID table from both files — the full content of `data/more-info/gantt.md`, and the equivalent section of `README.md`.
2. Compare the two blocks exactly. If they match, report that the charts are in sync and stop — don't edit anything.
3. If they differ, determine which file was updated more recently:
   - `git log -1 --format=%ai -- data/more-info/gantt.md` for the gantt.md side.
   - For README.md, `git log -p -- README.md` and find the most recent commit whose diff actually touches the Job Application Tracker section — a commit that only changed unrelated content (styling, prose elsewhere in the file) doesn't count.
   - Uncommitted local edits to a chart section always count as the most recent version, ahead of any commit.
4. Copy the mermaid block + table from the more-recently-updated file into the other, replacing only that section:
   - In `README.md`, preserve the `## Job Application Tracker` heading and surrounding `***` dividers — only the block between them changes.
   - In `data/more-info/gantt.md`, keep it as just the raw block — don't add a heading.
5. Before editing the losing file, diff its old chart block against the winning block line-by-line so the exact changes are known.

## Revision report

Every run ends with a report to the user, even when nothing needed to change:

- **No mismatch:** state plainly that `README.md` and `data/more-info/gantt.md` already match — no revision needed.
- **Mismatch fixed:** state the sync direction (README → gantt.md, or gantt.md → README), then itemize every change carried over, e.g.:
  - JobID sections added or removed (by number).
  - Per-JobID task line changes: task name, status keyword (`milestone`/`active`/`done`/`crit`), start date, or duration.
  - Table row changes: added/removed JobIDs, or edited cells (Job Title, Company, Location, Date Submitted, Resume Used, Updates/status).
  - If a change is a status update (e.g. 🟢 → 🟡, or a new "No longer in consideration" date), call that out explicitly since it's usually the most relevant part of the revision.

Keep the report itemized (a short bulleted list per change), not a single vague sentence like "the tables were updated."

This is a narrower, chart-only counterpart to Vault Sync above — if the winning content also needs to reach the Obsidian vault notes, the normal Vault Sync rules still apply after the mismatch is fixed.
