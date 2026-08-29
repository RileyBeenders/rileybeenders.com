---
tags: [pdf, pipeline]
---

# Resume PDF Pipeline

Two **separate, unrelated** PDF systems live in this repo. Don't confuse them.

## 1. Live, data-driven PDF — what the "Download PDF" button produces

**Chain:** `BpActions`'s Download button (see [[Blueprint UI Components]]) → `ResumeBuilder/downloadPublishedResume.ts` (client) → `GET /api/resume-pdf` (`app/api/resume-pdf/route.ts`) → `ResumeBuilder/generateResumePdf.ts` → binary PDF response.

### `ResumeBuilder/downloadPublishedResume.ts`

`downloadPublishedResumePdf(endpoint)`:
1. Builds the request URL with a cache-busting `?published=<timestamp>` query param.
2. Fetches with `cache: "no-store"` and a 30s `AbortController` timeout.
3. Validates the response: status ok, `content-type` includes `application/pdf`, blob size `>= 5` bytes, and the **first 5 bytes literally spell `%PDF-`** (a real magic-number check, not just content-type trust).
4. On success, creates an object URL, synthesizes a hidden `<a download>` click to trigger the browser's save dialog, removes the anchor, and revokes the object URL after 60s.
5. Throws descriptive errors for timeout, bad status, wrong content-type, empty body, or invalid signature — all surfaced by `BpActions` as the inline `.bp-error` message.

### `app/api/resume-pdf/route.ts`

See full detail in [[Routes Overview]]. Key point: `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `revalidate = 0`, and explicit no-cache headers on both success and error paths — this route is intentionally never cached anywhere, so the PDF always reflects the current `resumeData`.

### `ResumeBuilder/generateResumePdf.ts` — the layout engine

Pure function `generateResumePdf(data: ResumeData): ArrayBuffer` built on **jsPDF**, no HTML/CSS — every line, rule, and bullet is drawn with explicit `doc.text()` / `doc.line()` calls at computed coordinates. US Letter, points (`612 × 792`), margins `44pt` left/right, `40pt` top, content bottom cutoff `742pt`. Uses only the built-in Helvetica; the site's Blueprint Press fonts and colors are **not** involved (PDF body text is near-black `[20,20,20]`, links blue `[0,0,238]`).

Key internal mechanics:
- **`normalizeText()`** — strips/replaces smart quotes, en/em dashes, ellipsis, superscript ³ (→ `^3`), non-breaking spaces, and any remaining non-ASCII, because built-in Helvetica can't render arbitrary Unicode. This is why `data.summary`'s curly apostrophes come out clean.
- **`safeLink()`** — only lets `https:` / `http:` / `mailto:` / `tel:` URLs through as clickable links (parses with `new URL()`); anything else is dropped.
- **Dynamic pagination** — no fixed page count. `ensureSpace(height, continuationLabel?)` checks whether the next block fits above `CONTENT_BOTTOM`; if not, `addPage()` starts a new page (writing an italic label like `"Experience (continued)"` when provided) and resets `y`.
- **Measure-then-draw** — `measureExperienceOpening()`, `measureEducationDegree()`, `measureCertificate()` compute exact wrapped-line counts/heights *before* drawing so pagination decisions are correct.
- **Smart inline layout** — a role/degree title and its date sit on one line if there's ≥ `260pt` / `250pt` of room after reserving the date's width; otherwise the date drops below.
- **Section order:** header (name / title / two contact rows / rule) → **Profile** (summary) → **Experience** → [page-break heuristic: if Education + Skills would fit together in a full page's height but don't fit in what's left, force a page break first] → **Education** (+ CERTIFICATIONS) → **Skills** (categories with comma-joined items).
- `doc.setProperties(...)` sets PDF title/author/subject/keywords. Every page gets a footer rule, the site's display URL bottom-left, and `Page X of Y` bottom-right.

## 2. Static template mockups — `ResumeBuilder/generateResumeTemplates.mjs`

A **standalone Node script**, not part of the Next.js app or any route — run manually (`node ResumeBuilder/generateResumeTemplates.mjs`). Also jsPDF, but draws **abstract greeked-out placeholder content** (solid color boxes of specific widths standing in for text) to produce visual layout references in `output/resumeTemplates/`. Uses a distinct navy/slate palette purely for the mockup — unrelated to the site or to `generateResumePdf.ts`. It exists so a human (or the `custom-resume` procedure) can see target page geometry before laying out a real tailored resume. **Not** in the website's request path. (This note has not been re-verified against the current `.mjs` line-by-line since the reskin; the script wasn't touched by it.)

## Where per-job tailored resumes come from

Neither of the above produces the files in `1.ApplicationsUsed/`. Those come from manually invoking the `custom-resume` agent procedure against a specific `2.JobsApplliedTo/*.pdf` posting — see [[Repository Agent Skills (.agents)]] and [[Job Application Tracker]].

## Related
- [[Blueprint UI Components]]
- [[Routes Overview]]
- [[Data Layer and Types]]
- [[Home]]
