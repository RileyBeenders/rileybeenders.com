---
name: create-custom-resume-html
description: Generate and verify a job-targeted interactive HTML resume for Riley Beenders that looks like RileyBeenders.com on screen and prints to the user's chosen page count. Runs the same process as create-custom-resume-pdf, then wraps the verified source in the site's Blueprint Press styling with subtle motion, bullet hovers, skill highlighting, and optional screen-only bullet details. Use when an employer accepts HTML applications, or when asked to create, tailor, or regenerate an HTML, interactive, or web resume for a job PDF in 2.JobsApplliedTo.
---

# Create Custom Resume (HTML)

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set.

The HTML counterpart of [`create-custom-resume-pdf`](../create-custom-resume-pdf/SKILL.md). Both run **the same process** on the same evidence and produce the same verified print layout. This one adds a reader-focused screen version on top: it reads like rileybeenders.com, can carry more than the page holds, and its **Print / PDF** button prints exactly the page count the user chose. It sits in the same chain: `grill-my-resume` reviews the PDF, `fix-my-resume` applies the review to the shared source, and the HTML is rebuilt from it.

## Collect required inputs

Same two inputs, same exact questions as `create-custom-resume-pdf`, asked together in one message for whichever are missing:

1. `How many pages should the final resume be? (Recommended: 1)`. For this skill it is the **printed** length: the Print / PDF button and the PDF attachment both come out at this count. The screen version is not limited by it.
2. `Which job-posting PDF should I use to tailor the resume?`

If a verified source for this posting already exists in `output/resume-html/` (from an earlier PDF build), confirm with the user whether to reuse it at its delivered page count or rebuild. Then confirm the page count and PDF path in one sentence and proceed.

## Task

1. **Build and validate the print layout.** Run `create-custom-resume-pdf`'s Task steps 1–8 exactly as written: job analysis, evidence audit against the live site and `data/**/*.json`, writing rules, the Disney reference layout, `scripts/print-resume.mjs` at the chosen page count, and `scripts/validate-resume.py`. Name everything as that skill's step 7 does, `<ID>-RileyBeenders-<Job_Title>` (for example `022-RileyBeenders-Sr_Controls_Engineer`, written `<name>` below). The result is the source `output/resume-html/<name>.html` and the verified `1.ApplicationsUsed/<name>.pdf`. Every standing rule in `fix-my-resume` (no repeated claims, no filler, ignore "recent graduate" advice, never invent a number) binds both.

2. **Add the screen-only layer (optional, user-focused).** The page can hold what the printed length could not, so a reader who wants depth can get it without lengthening the PDF:
   - **Bullet details:** inside an `<li>`, `<details class="web-only more"><summary>Details</summary><p>…</p></details>`. Use it for the how and why behind a bullet: the constraint, the approach, the result. Each detail adds facts that are not already on the page; never restate the bullet or another bullet.
   - **Case-study links:** a `web-only` link to the matching `https://rileybeenders.com/projects` entry when one exists.
   - **A web-only section or project** cut from the print for length, marked `class="web-only"` on the `<section>` or `<article>`.
   - Every extra follows the same evidence standard as the page: supported by `data/**/*.json` or the live site, nothing from `private/career-evidence.md` (the file goes to an employer and the repo is public), no open Q&A entries, and Riley's copy rules (one to three sentences, no mid-sentence em dashes, no "3D printing" or "additive manufacturing").
   - Add `.web-only { display: none; }` to the source stylesheet so `print-resume.mjs` leaves them out of the PDF (the build script refuses a source that uses `web-only` without it). Reprint and re-run `validate-resume.py`; the PDF must be unchanged in page count and fill.
   - Keep extras in proportion: a handful of details on the bullets a hiring manager would ask about, not one on every line.

3. **Build the HTML.**
   `node .claude/skills/create-custom-resume-html/scripts/build-web-resume.mjs output/resume-html/<name>.html --pages <N>` → `1.ApplicationsUsed/<name>.html`, beside its PDF. The script picks that folder from the `<ID>-RileyBeenders-` name; a source with an older name goes to `output/resume-web/` unless `--out` says otherwise. If the HTML already exists there, it is the earlier version of this application's resume: confirm with Riley before overwriting it.
   - The source's `<body>` is copied unchanged and its `<style>` becomes the print stylesheet, so the claims match the PDF and the print matches it too. Edit the source and rebuild; never hand-edit the output.
   - The screen layer comes from `assets/web-resume-template.html`: the Blueprint Press grid and type (Instrument Serif, Spectral), the Electric palette with dark mode and a theme toggle drawn as the inverse of the page (a dark button reading DARK on the light page, a white one reading LIGHT on the dark page); a sticky top bar with the RB mark beside the job being applied for (from the source `<title>`; pass `--role "<label>"` when the title names no job, as with the baseline `RileyBeenders_Disney_Imagineering_Ride_Controls` resume, built with `--role "Disney Imagineering & Ride Controls"` into `output/resume-web/` because it has no application ID), jump links to Summary, Skills, Experience, Education, and Projects (whichever sections exist, matched from their headings, with the one in view underlined), and the print button, styled as the page's one call to action (solid accent fill and a slow sheen sweep, two soft accent rings about a second after load that then stop for good, and on hover one fast bright sheen pass followed by the top-right corner folding down like paper; the hover runs only where `(hover: hover)` matches, so a tap never leaves it stuck, and its CSS avoids `color-mix()` so it behaves the same in Chrome, Edge, Firefox, and Safari); the contact row's rileybeenders.com link (in whichever contact row holds it) turned into a solid accent button under the header and again at the end of the page, so an interviewer is invited to the site (the plain link stays in print); the site's role and bullet hovers, a once-only rise on scroll, a reading-progress spine, figures that pick up the accent on hover, and Core Expertise terms as pills. A pill is clickable only when its exact term appears in a bullet; clicking it dims every line that does not mention it. Motion stays inside `motion-design`'s thresholds and stops under reduced motion; without JavaScript the page is complete and static.
   - Change the look in the template, never per resume, and keep it inside Blueprint Press (`PRODUCT.md`, `DESIGN.md`; run `motion-design` before changing motion).

4. **Verify.**
   `node .claude/skills/create-custom-resume-html/scripts/verify-web-resume.mjs 1.ApplicationsUsed/<name>.html 1.ApplicationsUsed/<name>.pdf --shots <dir>`
   It fails unless the page loads without script errors in light, dark, and at phone width, rileybeenders.com is a button, every section link lands its section under the bar and marks itself current, nothing scrolls sideways at 390px, the skill highlight works, every line is visible with JavaScript off, details open, and printing the HTML gives the same page count and the same text on every page as the delivered PDF. Then look at the screenshots yourself: hierarchy, spacing, and contrast the way the craft floor reads a web page (`.claude/skills/impeccable/reference/craft-floor.md`).

5. **Deliver.** Return clickable links to the HTML and the PDF, the verification summary, the clickable pill count, and any screen-only extras added. Advise uploading the PDF as the resume (ATS parsing and most recruiter previews read it) and the HTML as an additional attachment; if only one file is allowed, the PDF. Then offer `grill-my-resume`.

## After a review

`fix-my-resume` edits `output/resume-html/<name>.html` and reprints the PDF. When `1.ApplicationsUsed/<name>.html` exists, rebuild it with step 3 and re-run step 4 in the same pass, so the two never drift.

## Where the output is tracked

- Source: `output/resume-html/<name>.html` (shared with the PDF).
- Interactive resume and PDF: `1.ApplicationsUsed/<name>.html` and `1.ApplicationsUsed/<name>.pdf`, written there directly, so there is nothing to copy. `vault-sync` records both in the application's vault note and the tracker tables.
