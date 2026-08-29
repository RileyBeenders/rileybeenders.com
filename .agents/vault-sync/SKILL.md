---
name: vault-sync
description: Keep the Obsidian documentation vault at .obsidian/rileybeenders.com Notes/ in sync with the site whenever repo code, data, or config changes, in the same session. Use after any change under app/, components/, data/, lib/, types/, ResumeBuilder/, assets/, public/, design/, README.md, config files, or .agents/, and whenever asked to "sync the vault".
---

# Vault Sync (Documentation)

One of three repository agent procedures — see `.agents/README.md` for the set.

Keep the Obsidian vault at `.obsidian/rileybeenders.com Notes/` in sync with the live site. This applies to **every** agent working in this repo — Claude Code, ChatGPT, or anything else — not just Claude. Whenever you change site code, data, or config in this repo, update the matching vault note(s) in the same session, before finishing the task.

The vault is git-tracked so it travels with clones and branches. `.gitignore` excludes only `**/.obsidian/workspace.json` and `**/.obsidian/workspace-mobile.json` (per-device pane/tab layout) — everything else in the vault, including the note content and the rest of the vault's own `.obsidian/` config, is meant to be committed. When you edit vault notes, stage them normally; don't add new exclusions for vault files without a specific reason (e.g. actual machine-local state, not content).

## Vault state

The vault was fully re-synced to `main` after the "Blueprint Press" reskin (routes moved to the `app/(site)/` route group; styling moved from one `app/globals.css` to `app/base.css` + `app/(site)/blueprint.css`; the old page components — `InteractiveResume`, `SiteHeader`, `ProjectsExplorer`, `ProjectDetails`, `BulletList`, `ComingSoon`, `RelocationBadge` — were replaced by `components/blueprint/*`). As part of that re-sync the `02 Components/` notes and the styling note were renamed — the mapping table below points at the current filenames. All notes are current; there is no migration backlog.

## When this applies

Any change under: `app/`, `components/`, `data/`, `lib/`, `types/`, `ResumeBuilder/`, `assets/`, `public/`, `design/`, `README.md`, `README_TODO.md`, `package.json`, `next.config.mjs`, `tsconfig.json`, or `.agents/` itself. Changes confined to `2.JobsApplliedTo/`, `1.ApplicationsUsed/`, `output/`, `references/`, or `tmp/` only need a vault update if they add/remove a tracked job application (update `06 Job Search Tracking/Job Application Tracker.md` and see **Job application detail pages** below) — routine PDF file drops don't.

Also applies whenever `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, or `data/projects/projects.json` changes for any reason (not just from a site-code task) — every open job application's detail page has a **Now** comparison that must reflect current skills/experience, so a content-only edit to those files still triggers a vault update. See **Job application detail pages** below.

## What maps to what

Paths below are the current `main` tree.

| Changed | Update this note |
|---|---|
| `app/layout.tsx` (root shell), `app/(site)/layout.tsx` (site chrome), any `app/(site)/**/page.tsx`, `app/api/**`, `app/apple-icon.tsx`, `app/opengraph-image.tsx`, `app/icon.svg` | `01 Routes and Pages/Routes Overview.md` |
| `components/blueprint/BpNav.tsx`, `components/blueprint/BpMark.tsx`, `app/icon.svg`, `app/apple-icon.tsx`, `app/opengraph-image.tsx` | `02 Components/Blueprint Nav and Mark.md` |
| `components/blueprint/BpActions.tsx`, `components/blueprint/BpComingSoon.tsx`, `components/blueprint/Reveal.tsx` | `02 Components/Blueprint UI Components.md` |
| `components/GanttChart.tsx`, `components/JobsTable.tsx`, `lib/gantt.ts` | `02 Components/GanttChart JobsTable and gantt.ts.md` |
| `app/(site)/projects/page.tsx` (as the route's behaviour, not just its metadata) | `02 Components/Projects Route (BpComingSoon).md` and `01 Routes and Pages/Routes Overview.md` |
| `types/resume.ts`, `types/more-info.ts`, `data/resumeData.ts`, `data/header.json` | `03 Data Layer/Data Layer and Types.md` |
| `data/home/*.json`, `data/projects/*.json` | `03 Data Layer/Career Content.md` |
| `data/more-info/*.json`, `data/more-info/gantt.md` | `03 Data Layer/More Info and Gantt Data.md` |
| `ResumeBuilder/**`, `app/api/resume-pdf/route.ts` | `04 Resume PDF Pipeline/Resume PDF Pipeline.md` |
| `app/base.css`, `app/(site)/blueprint.css`, `design/**` | `05 Styling and Design/Design System (Blueprint Press).md` |
| `2.JobsApplliedTo/`, `1.ApplicationsUsed/`, `output/pdf/`, `references/`, README tracker table, `data/more-info/gantt.md` tracker table | `06 Job Search Tracking/Job Application Tracker.md`, plus a new page under `06 Job Search Tracking/Applications/` for any new application ID — see **Job application detail pages** below |
| `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, `data/projects/projects.json` | Every existing note in `06 Job Search Tracking/Applications/` — refresh each one's **Now** section — see **Job application detail pages** below |
| `package.json`, `next.config.mjs`, `tsconfig.json`, `.gitignore` | `07 Build Tooling and Config/Build Tooling and Config.md` |
| `assets/fonts/**` | Build-time font source for the Satori-rendered OG image / apple icon. Covered by `02 Components/Blueprint Nav and Mark.md` and the styling note; the site's own web fonts load via `next/font` in `app/(site)/layout.tsx`. |
| `.agents/**` (any of the three `SKILL.md` files or `.agents/README.md`) | `08 Agents and Automation/Repository Agent Skills (.agents).md` |
| New route, component, data file, or top-level folder with no existing note | Create a new note in the matching numbered folder above, following the existing notes' structure (frontmatter tags, a short prose description, a `## Related` section with wikilinks), then add it to the Map of Content and any relevant cross-links in `Home.md` |

## How to update

1. Identify exactly what changed (new/removed field, renamed function, new component prop, new route, new data entry, etc.) — don't guess from the filename alone, read the actual diff.
2. Open the matching note(s) from the table above and edit only the parts describing what changed. These notes are meant to be precise and current, not historical — don't leave stale facts alongside corrected ones, and don't add a changelog section.
3. If the change removes a documented feature (e.g. a component, route, or data field this vault currently describes), remove or correct the corresponding claim rather than leaving it to describe something that no longer exists.
4. If the change affects a cross-reference called out in another note (e.g. `resumeData.ts`'s merge/visibility-flag behavior, or a nav/section map), check that note too — several notes intentionally reference the same underlying mechanism from different angles.
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
- Source posting: `2.JobsApplliedTo/<file>.pdf`
- Resume used: `1.ApplicationsUsed/<file>.pdf`
```

Frontmatter property keys are always capitalized: `Tags: [job-application]`, `Company`, `Role`, `JobID`, `Date Applied`, `Status` (mirror the emoji-coded status from the README/gantt tracker table as plain text, e.g. `"Application Received"`, `"Interviewing"`, `"No longer in consideration (Aug 4, 2026)"`), and `PDF Referenced` — a GitHub `blob` URL to the source posting PDF in `2.JobsApplliedTo/`. `JobID` is the value used everywhere in the vault and in repo tables (see **Renaming GitID to JobID** below) — it is the same three-digit application ID, not a GitHub or job-board internal ID.

### Renaming GitID to JobID

The tracker table's first column is named `JobID`, not `GitID`, in both `README.md` and `data/more-info/gantt.md` — this was renamed for clarity since the column has nothing to do with git. If you ever see `GitID` reappear in either table (e.g. from a stale edit or a merge), correct it back to `JobID`, and update any vault note quoting that column list (currently `03 Data Layer/More Info and Gantt Data.md` and `06 Job Search Tracking/Job Application Tracker.md`) to match. `JobsTable.tsx` renders whatever header text is in the table, so this column name change alone requires no code change — it flows straight through to the live site.

### Linking the PDF Referenced property

The `PDF Referenced` value is a GitHub `blob` URL to the application's source PDF:

`https://github.com/RileyBeenders/rileybeenders.com/blob/<branch>/2.JobsApplliedTo/<url-encoded-filename>.pdf`

- **Always check the current branch before writing or updating this link.** Run `git branch --show-current` (or equivalent) at the moment you write the property, and use that exact branch name as `<branch>`. Never hardcode a branch name left over from a previous session. If the branch you're on is `main`, the link correctly reads `.../blob/main/...` — `main` is not a special case to avoid, it's just whatever the current branch happens to be.
- URL-encode the filename the way GitHub does: spaces → `%20`, commas → `%2C`, ampersands → `%26`, and any non-ASCII character (e.g. an em dash) as its percent-encoded UTF-8 bytes (e.g. `—` → `%E2%80%94`). Parentheses can stay literal. When in doubt, reuse the exact encoded filename already present for that ID in the README/`gantt.md` tracker table rather than re-encoding by hand.
- If the repo later merges so a file only exists on `main`, re-check the branch and update every `PDF Referenced` link that still points at a deleted branch — a stale branch segment 404s.

### Creating a new application page

When a new ID appears in `2.JobsApplliedTo/` and the README/`gantt.md` tracker table:

1. Read the job-posting PDF in full and extract Job ID (if the posting states one internally — job-board URL IDs don't count), date posted, salary/comp range, job summary, responsibilities, required/preferred qualifications, education requirement, and benefits, exactly as the posting states them. Don't paraphrase requirements into something stronger or weaker than what's written.
2. Pull "Date Applied" from the README/gantt tracker row for that ID.
3. Build the `PDF Referenced` frontmatter link per the rule above.
4. Write the **At Application** match: compare the posting's requirements against `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, and `data/projects/projects.json` **as they existed on or before the application date** (check with `git log`/`git show` against that date if the current files may have changed since — see the next section). State concrete overlaps and concrete gaps; never invent supporting experience that doesn't exist in the data, matching the fact-only evidence standard used by the `custom-resume` procedure (`.agents/custom-resume/SKILL.md`).
5. Write the **Now** section using current data. If nothing relevant has changed since application, say so plainly rather than padding out an artificial difference.
6. Add the new row to the tracker table in `06 Job Search Tracking/Job Application Tracker.md`, linking the JobID cell to the new page.
7. Link the new page from `Home.md` only if it changes the vault's structure (it normally won't — the Job Application Tracker note is the index into these pages, so Home.md doesn't need a per-application link).

### Keeping the "Now" section current

Whenever `data/home/skills.json`, `data/home/experience.json`, `data/home/education.json`, or `data/projects/projects.json` changes for any reason:

1. For every **existing** page in `06 Job Search Tracking/Applications/`, re-run the match against the new data.
2. If the comparison changed, update only the **Now** section — leave **At Application** untouched, since it's a frozen historical snapshot of what the site claimed on that date. Never rewrite **At Application** to reflect current data.
3. If nothing material changed for a given application, leave that page alone — don't touch a page just to bump a date with no substantive difference.
4. If the underlying data change closes a gap noted in **At Application** (e.g. a skill gets added that a posting specifically asked for), call that out explicitly in **Now** rather than silently updating the bullet list — the point of this split is to make skill growth over time visible, not to erase the historical gap.

## Related procedure

`sync-charts` (`.agents/sync-charts/SKILL.md`) is a narrower, chart-only counterpart: it keeps the Job Application Tracker gantt block + table identical between `README.md` and `data/more-info/gantt.md`. If a chart edit also needs to reach the vault notes, run that first, then apply the rules above.
