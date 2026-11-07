---
name: update-main-resume
description: Refresh Riley Beenders' main resume, the HTML + PDF pair in .DefaultResume/ that the home page's Download PDF button opens. Finds what changed in data/**/*.json (and in reviewed tailored resumes) since the main resume was last built, picks the resume-worthy findings, asks Riley which to apply, rebuilds the PDF with create-custom-resume-pdf's scripts and the interactive HTML with create-custom-resume-html's, verifies both, and publishes them as RileyBeenders_Resume_<YY><DDD> (year + day of year) to .DefaultResume/ and public/resume/. Use on /update-main-resume, "update / refresh / rebuild the main resume", "update the default PDF", "update the Download PDF resume", or after new experience, projects, certifications, or career Q&A answers land in data/.
argument-hint: "[--since <commit>]"
---

# Update Main Resume

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set.

The main resume is the general, untailored resume anyone gets from the home page. Download PDF opens its interactive HTML in a new tab, and the visitor saves the PDF with that page's **Print / PDF** button. It is **not** part of the job-targeted chain (`create-custom-resume-pdf` → `grill-my-resume` → `fix-my-resume`), but it runs the same two builders (`create-custom-resume-pdf` for the PDF, `create-custom-resume-html` for the interactive page) with the same layout, copy rules, and scripts.

| Piece | Where |
| --- | --- |
| Print source (edit this) | `ResumeBuilder/main-resume/main-resume.html` |
| Build record | `ResumeBuilder/main-resume/manifest.json` (`name`, `pages`, `spacingMultiplier`, `reviewedThrough` commit, `updated` date) |
| Riley's working pair | `.DefaultResume/<name>.pdf` and `.DefaultResume/<name>.html`, the only files there |
| Published pair | `public/resume/<name>.pdf` and `.html`, identical copies |
| What the button opens | `data/header.json` → `resumeHtmlPath`, in a new tab |
| Old link | `/api/resume-pdf` redirects to `resumePdfPath` (the PDF) |

**The name is never asked for.** It is always `RileyBeenders_Resume_<YY><DDD>`: the last two digits of the year, then the day of the year zero-padded to three digits, from the build date. 2026-11-07 is day 311, so `RileyBeenders_Resume_26311`; 2027-01-05 is `RileyBeenders_Resume_27005`. Riley reads the suffix as "last updated". Get it with `node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs --name-only`; a rebuild on the same day overwrites that day's pair.

The layout came from `output/resume-html/RileyBeenders_Disney_Imagineering_Ride_Controls.html` on 2026-11-07. Never edit `output/pdf/` or `output/resume-html/` from this skill; they are tailored application records.

## 1. Find what is new

Run from the repo root:

```bash
node .claude/skills/update-main-resume/scripts/collect-changes.mjs
```

It diffs the resume-relevant data files (`data/header.json`, `data/home/{summary,experience,skills,education}.json`, `data/projects/projects.json`, `data/career-qa/qa-log.json`) from `manifest.reviewedThrough` to HEAD, adds uncommitted and untracked changes, lists tailored resumes in `output/resume-html/` changed since the last build, and lists career Q&A entries answered since the baseline. Pass `--since <commit>` to look further back.

Then read `main-resume.html` in full, and also check for drift the diff cannot show:

- The published pair against the source: the text of `.DefaultResume/<manifest.name>.pdf` should match a fresh print of `main-resume.html`. If Riley replaced the pair by hand (for example with a tailored resume's files), list every line that differs as an Update or Remove finding, and flag posting-specific text such as a relocation city list first.

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

If there are no findings, say so in one line and ask whether to rebuild anyway (for example only to refresh the date in the name); stop if not.

Otherwise present every finding as a numbered list, each with: the kind (Add / Replace / Update / Remove), the section it lands in, the exact proposed text (or old → new), its source (file and commit, or Q&A id), and what it displaces. Then ask which to apply:

- Four or fewer findings: one `AskUserQuestion` with `multiSelect: true`, one option per finding (label = short name, description = the proposed text).
- More than four: the numbered list in chat and the question "Which should I apply? (e.g. all, 1 3 5, or none)", then wait.

Apply only what Riley picks; reword on request. Do not start editing before the answer.

## 4. Build

Work in a scratch folder; nothing reaches `.DefaultResume/` or `public/` until step 5.

1. Edit `ResumeBuilder/main-resume/main-resume.html`. Change content only; leave the stylesheet alone unless Riley asks. Screen-only extras (`<details class="web-only more">` bullet details, case-study links) follow the `create-custom-resume-html` rules for them and must trace to data like any bullet.
2. **PDF** (the `create-custom-resume-pdf` scripts). Print and validate with the manifest's page count, then look at every render:

   ```bash
   node .claude/skills/create-custom-resume-pdf/scripts/print-resume.mjs ResumeBuilder/main-resume/main-resume.html <scratch>/main-resume.pdf <manifest.spacingMultiplier>
   python .claude/skills/create-custom-resume-pdf/scripts/validate-resume.py <scratch>/main-resume.pdf <manifest.pages> --png <scratch>
   ```

   It must print `RESULT: OK` (page count and size, styled links, no blue non-links, no letter-spaced headings, no repeated 8-word fragment). Inspect the PNGs for clipping, overlap, an orphaned heading, or a bullet split across pages; apply the craft floor the `create-custom-resume-pdf` skill describes in its step 8.
3. If the content no longer fits `manifest.pages`, first tune the spacing multiplier (0.8x to 1.7x, every gap together, never a smaller body font). If that fails, ask Riley whether to cut the weakest line or change the page count; never pad a page with filler. Page 3 (Selected Projects) is a forced break and may end short.
4. **HTML** (the `create-custom-resume-html` scripts). Build the interactive page from the same source and verify that its print matches the PDF page for page:

   ```bash
   node .claude/skills/create-custom-resume-html/scripts/build-web-resume.mjs ResumeBuilder/main-resume/main-resume.html --pages <N> --out <scratch>/main-resume.html
   node .claude/skills/create-custom-resume-html/scripts/verify-web-resume.mjs <scratch>/main-resume.html <scratch>/main-resume.pdf --shots <scratch>/shots
   ```

   The source's `<title>` is "Riley Beenders - Resume", so the sticky bar reads "Resume"; no `--role`. Verification must pass (no script errors, website button present, section links land, no sideways scroll at 390px, highlight works, lines visible with JavaScript off, same page count and per-page text as the PDF). Look at the screenshots.

## 5. Publish

```bash
node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs <scratch>/main-resume.pdf <scratch>/main-resume.html --pages <N> --m <multiplier>
```

It names the pair `RileyBeenders_Resume_<YY><DDD>` for today, copies it into `.DefaultResume/` and `public/resume/`, deletes every older `RileyBeenders_Resume_*` pair from both folders (git keeps the history), points `data/header.json` `resumeHtmlPath` and `resumePdfPath` at the new public files, and updates `manifest.json` (`name`, `reviewedThrough` = HEAD, `updated` = today). Pass `--date YYYY-MM-DD` only to reproduce a past build's name. A running Studio caches data files until it restarts, so tell Riley to restart it if it is open.

## 6. Verify on the site

In the browser preview (`preview_start` with name `site`, or the already-running server on :3000): confirm the home page's Download PDF is a link to `resumeHtmlPath` with `target="_blank"`, that `resumeHtmlPath` loads with its **Print / PDF · N pages** button and no console errors, and that `/api/resume-pdf` ends at `resumePdfPath` with `application/pdf` and a `%PDF-` body.

## 7. Hand off

- Run `vault-sync` (the main resume maps to `04 Resume PDF Pipeline/Resume PDF Pipeline.md`).
- Report: the findings applied and skipped, the validator and web-verify results, the page count and multiplier, and the published name with both folders.
- Offer `write-commit`; never commit or push on your own.
