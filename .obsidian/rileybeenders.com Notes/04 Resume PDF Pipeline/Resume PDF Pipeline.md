---
tags: [pdf, pipeline]
---

# Resume PDF Pipeline

Two **separate, unrelated** PDF systems live in this repo. Don't confuse them.

## 1. The main resume — what the "Download PDF" button produces

Since 2026-11-07 the button serves a **static, curated PDF** rather than one generated per request. It started as a copy of the tailored Disney Imagineering Ride Controls resume (`output/resume-html/RileyBeenders_Disney_Imagineering_Ride_Controls.html`) with the posting's relocation cities removed: three Letter pages, navy headings, Arial, Selected Projects on page 3.

**Chain (today):** the hero tile's Download PDF (`components/bench/HeroActions.tsx`, which replaced Blueprint Press's `BpActions` on 2026-11-08 and moved to `components/bench/` on 2026-11-09; see [[Bench Components (Home Page)]]) is a link to `data/header.json` `resumeHtmlPath` (`/resume/RileyBeenders_Resume_26311.html`) that opens in a new tab. That page is the interactive HTML resume built by `create-custom-resume-html`; the visitor saves the PDF with its own **Print / PDF · 3 pages** button. The files in `public/resume/` are copies of Riley's working pair in `.DefaultResume/` (renamed from `.DisneyDefaultResume/` on 2026-11-07); the `_26311` suffix is the last-updated date Riley tracks, so a newer copy means new files in both folders and both `header.json` paths updated.

**Chain (fallback, no `resumeHtmlPath`):** the button runs `ResumeBuilder/downloadPublishedResume.ts` (client) → `GET <resumePdfPath>` (today `/resume/RileyBeenders_Resume_26311.pdf`) → the browser saves the static PDF.

| Piece | Path |
| --- | --- |
| Working copies | `.DefaultResume/RileyBeenders_Resume_<date>.html` and `.pdf` |
| Published files | `public/resume/RileyBeenders_Resume_<date>.html` and `.pdf` |
| Pointers | `data/header.json` `resumeHtmlPath` (what the button opens) and `resumePdfPath` (what `/api/resume-pdf` serves) |
| `update-main-resume` source | `ResumeBuilder/main-resume/main-resume.html` (same `:root { --m }` spacing contract as the tailored resumes) |
| Build record | `ResumeBuilder/main-resume/manifest.json`: `name` (the pair's base name), `pages` (3), `spacingMultiplier`, `reviewedThrough` (the commit whose `data/` the page was last reconciled against), `updated` |

It is maintained by the `update-main-resume` skill (see [[Repository Agent Skills]]): its `collect-changes.mjs` diffs resume data since `reviewedThrough`, Riley picks which findings to apply, the source is reprinted and validated with the `create-custom-resume-pdf` scripts, the interactive HTML is rebuilt and verified with the `create-custom-resume-html` scripts, and `publish-main-resume.mjs` names the pair `RileyBeenders_Resume_<YY><DDD>` for the build date, writes it to `.DefaultResume/` and `public/resume/`, deletes the older pair, and updates both `header.json` paths and the manifest. Because it is static, the pair only changes when that skill runs; editing `data/` alone no longer changes the download.

The pair published on 2026-11-07 (`_26311`) was swapped in by hand from the Disney Imagineering Ride Controls build, not printed from `main-resume.html`; it still reads "Open to relocation (Glendale, Anaheim, or Orlando)". The next `update-main-resume` run reports that difference.

### `ResumeBuilder/downloadPublishedResume.ts`

`downloadPublishedResumePdf(endpoint)`:
1. Builds the request URL with a cache-busting `?published=<timestamp>` query param.
2. Fetches with `cache: "no-store"` and a 30s `AbortController` timeout.
3. Validates the response: status ok, `content-type` includes `application/pdf`, blob size `>= 5` bytes, and the **first 5 bytes literally spell `%PDF-`** (a real magic-number check, not just content-type trust).
4. On success, creates an object URL, synthesizes a hidden `<a download>` click to trigger the browser's save dialog, removes the anchor, and revokes the object URL after 60s. The saved name is the basename of the final response URL when it ends in `.pdf` (so renaming the file renames every download), else `Riley_Beenders_Resume.pdf`.
5. Throws descriptive errors for timeout, bad status, wrong content-type, empty body, or invalid signature — all surfaced by `HeroActions` as the inline `.hero-error` alert.

### `app/api/resume-pdf/route.ts`

Kept only so older links keep working: `GET` answers `307` with a **relative** `Location: <resumePdfPath>` and `Cache-Control: no-store` (relative so the local gate, which proxies `next dev` on another port, doesn't redirect visitors to the internal port). See [[Routes Overview]].

### `ResumeBuilder/generateResumePdf.ts` — the former layout engine (unused)

No route imports it since the switch to the static main resume; the file is kept in place. It was the per-request generator. Pure function `generateResumePdf(data: ResumeData): ArrayBuffer` built on **jsPDF**, no HTML/CSS — every line, rule, and bullet is drawn with explicit `doc.text()` / `doc.line()` calls at computed coordinates. US Letter, points (`612 × 792`), margins `44pt` left/right, `40pt` top, content bottom cutoff `742pt`. Uses only the built-in Helvetica; the site's Blueprint Press fonts and colors are **not** involved (PDF body text is near-black `[20,20,20]`, links blue `[0,0,238]`).

Key internal mechanics:
- **`normalizeText()`** — first folds every line break (and the whitespace around it) into one space, so a summary or job context the site shows as several paragraphs (an empty line in the Studio) stays one compact block in the PDF; then strips/replaces smart quotes, en/em dashes, ellipsis, superscript ³ (→ `^3`), non-breaking spaces, and any remaining non-ASCII, because built-in Helvetica can't render arbitrary Unicode. This is why `data.summary`'s curly apostrophes come out clean.
- **`safeLink()`** — only lets `https:` / `http:` / `mailto:` / `tel:` URLs through as clickable links (parses with `new URL()`); anything else is dropped.
- **Dynamic pagination** — no fixed page count. `ensureSpace(height, continuationLabel?)` checks whether the next block fits above `CONTENT_BOTTOM`; if not, `addPage()` starts a new page (writing an italic label like `"Experience (continued)"` when provided) and resets `y`.
- **Measure-then-draw** — `measureExperienceOpening()`, `measureEducationDegree()`, `measureCertificate()` compute exact wrapped-line counts/heights *before* drawing so pagination decisions are correct.
- **Smart inline layout** — a role/degree title and its date sit on one line if there's ≥ `260pt` / `250pt` of room after reserving the date's width; otherwise the date drops below.
- **Section order:** header (name / title / two contact rows / rule) → **Profile** (summary) → **Experience** → [page-break heuristic: if Education + Skills would fit together in a full page's height but don't fit in what's left, force a page break first] → **Education** (+ CERTIFICATIONS) → **Skills** (categories with comma-joined items).
- `doc.setProperties(...)` sets PDF title/author/subject/keywords. Every page gets a footer rule, the site's display URL bottom-left, and `Page X of Y` bottom-right.

## 2. Static template mockups — `ResumeBuilder/generateResumeTemplates.mjs`

A **standalone Node script**, not part of the Next.js app or any route — run manually (`node ResumeBuilder/generateResumeTemplates.mjs`). Also jsPDF, but draws **abstract greeked-out placeholder content** (solid color boxes of specific widths standing in for text) to produce visual layout references in `output/resumeTemplates/`. Uses a distinct navy/slate palette purely for the mockup — unrelated to the site or to `generateResumePdf.ts`. It exists so a human (or the `create-custom-resume-pdf` procedure) can see target page geometry before laying out a real tailored resume. **Not** in the website's request path. (This note has not been re-verified against the current `.mjs` line-by-line since the reskin; the script wasn't touched by it.)

## Where per-job tailored resumes come from

Neither of the above produces the files in `1.ApplicationsUsed/` (the main resume shares their layout and print/validate scripts, but is general, not tailored). Those come from manually invoking the `create-custom-resume-pdf` agent procedure against a specific `2.JobsApplliedTo/*.pdf` posting — see [[Repository Agent Skills]] and [[Job Application Tracker]].

Since 2026-11-07 each tailored application can also carry an **interactive HTML resume beside its PDF**, `1.ApplicationsUsed/<ID>-RileyBeenders-<Job_Title>.html` (022, 024, 025, 026 and 027 so far), built by `create-custom-resume-html` (`scripts/build-web-resume.mjs`) from the same verified source and checked by `scripts/verify-web-resume.mjs`, which fails on any page-count or per-page text difference between the printed HTML and the PDF. The PDF stays the primary upload. The HTML template (`.claude/skills/create-custom-resume-html/assets/web-resume-template.html`) still dresses the screen layer in the Blueprint Press look (Instrument Serif + Spectral, the Electric palette), so since the redesigns of November 2026 (Blue Sheet, then Clean Bench) the resumes no longer match the site's look; the chain and its skills were not changed by either. Restyling the template for Clean Bench is a follow-up. See [[Clean Bench (2026-11 redesign)]].

## Related
- [[Bench Components (Home Page)]]
- [[Routes Overview]]
- [[Data Layer and Types]]
- [[Home]]
