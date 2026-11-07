---
name: update-main-resume
description: Refresh Riley Beenders' main resume, the PDF the home page's Download PDF button serves. Finds what changed in data/**/*.json (and in reviewed tailored resumes) since the main resume was last built, picks the resume-worthy findings, asks Riley which to apply, rebuilds and validates the PDF, then asks what the downloaded file should be named before publishing it. Use on /update-main-resume, "update / refresh / rebuild the main resume", "update the default PDF", "update the Download PDF resume", or after new experience, projects, certifications, or career Q&A answers land in data/.
argument-hint: "[--since <commit>]"
---

# Update Main Resume

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set.

The main resume is the general, untailored resume anyone downloads from the home page. It is **not** part of the job-targeted chain (`create-custom-resume-pdf` → `grill-my-resume` → `fix-my-resume`), but it follows the same layout and copy rules and the same scripts.

| Piece | Where |
| --- | --- |
| HTML source (edit this) | `ResumeBuilder/main-resume/main-resume.html` |
| Build record | `ResumeBuilder/main-resume/manifest.json` (`publicPath`, `pages`, `spacingMultiplier`, `reviewedThrough` commit, `updated` date) |
| Published PDF | `public/<manifest.publicPath>`, e.g. `public/resume/Riley_Beenders_Resume.pdf` |
| What the button downloads | `data/header.json` → `resumePdfPath`; the browser saves it under that file's basename |
| Old link | `/api/resume-pdf` redirects to `resumePdfPath` |

The layout came from `output/resume-html/RileyBeenders_Disney_Imagineering_Ride_Controls.html` on 2026-11-07. Never edit `output/pdf/` or `output/resume-html/` from this skill; they are tailored application records.

## 1. Find what is new

Run from the repo root:

```bash
node .claude/skills/update-main-resume/scripts/collect-changes.mjs
```

It diffs the resume-relevant data files (`data/header.json`, `data/home/{summary,experience,skills,education}.json`, `data/projects/projects.json`, `data/career-qa/qa-log.json`) from `manifest.reviewedThrough` to HEAD, adds uncommitted and untracked changes, lists tailored resumes in `output/resume-html/` changed since the last build, and lists career Q&A entries answered since the baseline. Pass `--since <commit>` to look further back.

Then read `main-resume.html` in full, and also check for drift the diff cannot show:

- Counts quoted on the page against the repo today (`node scripts/site-stats.mjs` for skills, notes, commits).
- "Present" roles and projects that have since ended, and `openToRelocation` in `data/header.json` (the contact row says "Open to relocation" only while it is `true`, with no city list).
- Every claim on the page still traces to `data/**/*.json`; a claim the data no longer supports is a finding too (a removal).

## 2. Pick the key information

Keep only what changes what a reader learns about Riley. A finding is one of:

- **Add**: a new role, bullet, metric, certification, project, or answered Q&A fact that the page lacks.
- **Replace**: better-supported or reviewed wording for a line already on the page (a tailored resume's bullet that passed `fix-my-resume` counts, as long as it is not posting-specific).
- **Update**: a date, title, count, or status that is now wrong.
- **Remove**: a claim the data no longer backs, or a line a stronger addition should displace.

Drop, without asking: media and artifact paths, captions, alt text, theme, fonts, motion, visibility flags other than `openToRelocation`, `proofId` cross-links, site-only page copy, and wording changes that do not change meaning.

Rules every proposal must already satisfy (from `create-custom-resume-pdf` and `fix-my-resume`):

- Never invent a number, tool, date, or credential; every word traces to data. Keep a metric's baseline when the data records one.
- Never repeat a claim. Each fact, metric, machine, or project appears once; a Selected Projects entry only carries a project no bullet describes. Say what an addition displaces.
- One to three sentences per bullet, outcome or problem first, no mid-sentence em dashes, and no "3D printing" or "additive manufacturing" in new copy.
- General, not tailored: no company names from a posting, no relocation city lists, no posting keywords the data does not support.
- The PDF is public. Nothing from `private/career-evidence.md`, no direct-report headcount, and no open (unanswered) `qa-log.json` entry.

## 3. Ask Riley what to apply

If there are no findings, say so in one line and ask whether to rebuild anyway (for example only to rename the file); stop if not.

Otherwise present every finding as a numbered list, each with: the kind (Add / Replace / Update / Remove), the section it lands in, the exact proposed text (or old → new), its source (file and commit, or Q&A id), and what it displaces. Then ask which to apply:

- Four or fewer findings: one `AskUserQuestion` with `multiSelect: true`, one option per finding (label = short name, description = the proposed text).
- More than four: the numbered list in chat and the question "Which should I apply? (e.g. all, 1 3 5, or none)", then wait.

Apply only what Riley picks; reword on request. Do not start editing before the answer.

## 4. Build

1. Edit `ResumeBuilder/main-resume/main-resume.html`. Change content only; leave the stylesheet alone unless Riley asks.
2. Print to a scratch file, not to `public/`:

   ```bash
   node .claude/skills/create-custom-resume-pdf/scripts/print-resume.mjs ResumeBuilder/main-resume/main-resume.html <scratch>/main-resume.pdf <manifest.spacingMultiplier>
   ```

3. Validate with the manifest's page count and look at every render:

   ```bash
   python .claude/skills/create-custom-resume-pdf/scripts/validate-resume.py <scratch>/main-resume.pdf <manifest.pages> --png <scratch>
   ```

   It must print `RESULT: OK` (page count and size, styled links, no blue non-links, no letter-spaced headings, no repeated 8-word fragment). Inspect the PNGs for clipping, overlap, an orphaned heading, or a bullet split across pages; apply the craft floor the `create-custom-resume-pdf` skill describes in its step 8.
4. If the content no longer fits `manifest.pages`, first tune the spacing multiplier (0.8x to 1.7x, every gap together, never a smaller body font). If that fails, ask Riley whether to cut the weakest line or change the page count; never pad a page with filler. Page 3 (Selected Projects) is a forced break and may end short.

## 5. Ask for the file name

The file lands on other people's computers under this name, so ask before publishing. Use `AskUserQuestion` with:

- The current name (from `manifest.publicPath`) first, labeled as keeping it.
- Two or three suggestions, e.g. `Riley_Beenders_Resume.pdf`, `Riley_Beenders_Resume_<Month>_<YYYY>.pdf`, `Riley_Beenders_RnD_Engineer_Resume.pdf`.

Rules for any name, including one Riley types: starts with `Riley_Beenders`, ASCII letters, digits, `_` or `-` only, no spaces, ends in `.pdf`, and no internal words like `main`, `default`, `final`, `v2`, or `copy`. If Riley's name breaks a rule, propose the nearest valid one and confirm it.

## 6. Publish

```bash
node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs <scratch>/main-resume.pdf <Chosen_Name.pdf> --pages <N> --m <multiplier>
```

It copies the PDF to `public/resume/<name>`, deletes the previous public file if the name changed, sets `data/header.json` `resumePdfPath`, and updates `manifest.json` (`reviewedThrough` = HEAD, `updated` = today). A running Studio caches data files until it restarts, so tell Riley to restart it if it is open.

Verify in the browser preview (`preview_start` with name `site`): fetch `resumePdfPath` and `/api/resume-pdf` and confirm both return `application/pdf` with a `%PDF-` body, and that the home page's Download PDF button still downloads without an error.

## 7. Hand off

- Run `vault-sync` (the main resume maps to `04 Resume PDF Pipeline/Resume PDF Pipeline.md`).
- Report: the findings applied and skipped, the validator result, the page count and multiplier, and the published file name and path.
- Offer `write-commit`; never commit or push on your own.
