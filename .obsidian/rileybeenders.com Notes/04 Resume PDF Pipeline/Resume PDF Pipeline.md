---
tags: [pdf, pipeline]
---

# Resume PDF Pipeline

Two **separate, unrelated** PDF systems live in this repo. Don't confuse them.

## 1. Live, data-driven PDF — what the "Download PDF" button produces

**Chain:** [[InteractiveResume]]'s Download button → `ResumeBuilder/downloadPublishedResume.ts` (client) → `GET /api/resume-pdf` (`app/api/resume-pdf/route.ts`) → `ResumeBuilder/generateResumePdf.ts` → binary PDF response.

### `ResumeBuilder/downloadPublishedResume.ts`

`downloadPublishedResumePdf(endpoint)`:
1. Builds the request URL with a cache-busting `?published=<timestamp>` query param.
2. Fetches with `cache: "no-store"` and a 30s `AbortController` timeout.
3. Validates the response: status ok, `content-type` includes `application/pdf`, blob size `>= 5` bytes, and the **first 5 bytes literally spell `%PDF-`** (a real PDF magic-number check, not just a content-type trust).
4. On success, creates an object URL, synthesizes a hidden `<a download>` click to trigger the browser's save dialog, removes the anchor, and revokes the object URL after 60s.
5. Throws descriptive errors for timeout, bad status, wrong content-type, empty body, or invalid signature — all surfaced by `InteractiveResume` as the inline `.pdf-download-error` message.

### `app/api/resume-pdf/route.ts`

See full detail in [[Routes Overview]]. Key point: `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `revalidate = 0`, and explicit no-cache headers on both success and error paths — this route is intentionally never cached anywhere in the chain, so the PDF always reflects the current `resumeData`.

### `ResumeBuilder/generateResumePdf.ts` — the actual layout engine

Pure function `generateResumePdf(data: ResumeData): ArrayBuffer` built on **jsPDF**, no HTML/CSS rendering involved — every line, rule, and bullet is drawn with explicit `doc.text()`/`doc.line()` calls at computed coordinates. US Letter, points units (`612 × 792`), margins `44pt` left/right, `40pt` top, content bottom cutoff at `742pt`.

Key internal mechanics:
- **`normalizeText()`** — strips/replaces smart quotes, en/em dashes, ellipsis, superscript ³ (→ `^3`), non-breaking spaces, and any remaining non-ASCII character, because the built-in Helvetica font can't render arbitrary Unicode. This is why content like `data.summary`'s curly apostrophes render cleanly in the PDF.
- **`safeLink()`** — only allows `https:`, `http:`, `mailto:`, `tel:` URL protocols through as clickable links (parses with `new URL()` and validates `.protocol`); anything else is dropped rather than rendered as a broken/unsafe link.
- **Dynamic pagination** — there's no fixed page count. `ensureSpace(height, continuationLabel?)` checks whether the next block fits above `CONTENT_BOTTOM`; if not, `addPage()` starts a new page (writing an italic `continuationLabel` like `"Experience (continued)"` at the top when provided) and resets `y`.
- **Measure-then-draw pattern** — functions like `measureExperienceOpening()` and `measureEducationDegree()` compute exact wrapped-line counts and heights *before* drawing, so `ensureSpace()` can make correct pagination decisions without drawing test content.
- **Smart inline layout** — a job's role/degree title and its date/graduation are placed on the same line *if* there's at least `260pt`/`250pt` of room left after reserving space for the date text; otherwise the date drops to its own line below. This is computed per-entry, not globally.
- Section order: header (name/title/contact rows) → Profile (summary) → Experience → [page-break heuristic: if Education+Skills would fit together in one page's remaining space but don't currently fit, force a page break first, so they're not split across the boundary unnecessarily] → Education (+ Certifications) → Skills.
- Every page gets a footer rule, the site's display URL (bottom-left), and `Page X of Y` (bottom-right).

## 2. Static template mockups — `ResumeBuilder/generateResumeTemplates.mjs`

A **standalone Node script**, not part of the Next.js app or any route — run manually (`node ResumeBuilder/generateResumeTemplates.mjs`). Also uses jsPDF, but draws **abstract greeked-out placeholder content** (solid color boxes standing in for text lines, of specific pixel widths) rather than real resume data, to produce visual layout references:

- `drawOnePageTemplate()` and `drawTwoPageTemplate()` output to `output/resumeTemplates/1-page_Template.pdf` and `2-Template.pdf` (note: the code writes `"2-Template.pdf"`, while the committed file in the repo is named `2-page_Template.pdf` — the script's current output filename and the checked-in artifact's filename don't match; worth reconciling if this script is run again).
- Uses a distinct navy/slate color palette (`COLOR.navy`, `COLOR.slate`, etc.) purely for visual mockup purposes — unrelated to the site's CSS design tokens or to `generateResumePdf.ts`'s text colors.

This script exists to let a human (or the `custom-resume` agent skill) see the target page geometry/line-density before laying out a real tailored resume — it is **not** in the runtime request path of the website.

## Where per-job tailored resumes come from

Neither of the above two systems produces the files in `output/ApplicationsUsed/`. Those are generated by manually invoking the `custom-resume` agent skill against a specific `JobsAppliedTo/*.pdf` posting — see [[Repository Skills (.agents SKILL.md)]] and [[Job Application Tracker]].

## Related
- [[InteractiveResume]]
- [[Routes Overview]]
- [[Data Layer and Types]]
- [[Home]]
