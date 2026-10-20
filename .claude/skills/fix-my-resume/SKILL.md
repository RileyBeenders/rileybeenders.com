---
name: fix-my-resume
description: Apply a resume review to an existing generated resume for Riley Beenders and re-deliver the verified PDF. Use after grill-my-resume, or when the user supplies review results (grill output, roast-my-resume reports, recruiter feedback) and asks to fix, apply, revise, or clean up a resume already in output/pdf/. Third step of the chain custom-resume -> grill-my-resume -> fix-my-resume.
argument-hint: "[resume PDF] [review: grill output, roast report PDFs, or notes]"
---

# Fix My Resume

One of several repository agent procedures — see the repo-root `CLAUDE.md` for the set.

The resume chain is: `custom-resume` builds, `grill-my-resume` reviews, `fix-my-resume` applies the review and re-verifies. This procedure never rebuilds from scratch and never redoes the review; it edits the HTML source the build left behind, prints it again, and runs the same validation the build did.

## Inputs

1. The resume to fix: a PDF in `output/pdf/` and its HTML source in `output/resume-html/<same name>.html`. If the HTML is missing, reconstruct it from the PDF text in the reference layout before editing, and say so.
2. The review: the `grill-my-resume` output from this conversation, external reports the user attached (roast-my-resume result PDFs, recruiter notes, a hiring manager's email), or both. Read every report in full; extract the text of a PDF report before judging it.
3. The job posting the resume targets, from `2.JobsApplliedTo/`, and the evidence sources `custom-resume` uses (`data/**/*.json` and the live site).

If the review is missing, run `grill-my-resume` first rather than guessing at problems.

## Triage every finding before editing

Sort each item from the review into one of four bins and tell the user the sort in the final summary:

- **Apply:** the fix is supported by `data/**/*.json` or the live site. Make it.
- **Placeholder:** the fix needs a fact only Riley has (a team size, a baseline for a percentage, which PLC software, a standard's number). Do not invent it. Leave the line as it was, list the question, and never write a bracketed placeholder into the delivered PDF.
- **Decline:** the finding conflicts with a standing rule below or with the evidence. Say why in one line.
- **Already true:** the reviewer misread the PDF (an automated roast often works from extracted text and misses bold labels or layout). Note it and move on.

Automated reviewers are evidence of how an ATS reads the file, so take their parsing complaints seriously even when their content advice is generic.

## Standing rules (from Riley, 2026-10-20)

These override any reviewer, including this file's own chain:

- **Never repeat a claim to fill a page.** Each fact, metric, machine, or project appears once in the resume. A Selected Projects entry that restates an experience bullet is a repeat; keep whichever placement is stronger and delete the other. If removing repeats leaves the last page short, deliver it short and report the fill. Page fill is never a reason to add, re-add, or pad.
- **Ignore "recent graduate" advice.** Riley worked through college and the Filament Innovations and Proteor record is the proof. Education stays last, keeps its real date, and never gains "recent graduate", "new grad", a GPA, coursework, or a move up the page on a reviewer's say-so. A B.S. from December 2024 next to a work history from May 2020 is the point, not a problem to hide.
- **Never invent a metric, baseline, standard, tool, or team size** because a reviewer asked for one. "Quantify everything" means surface the numbers the data holds, not create new ones.
- **The summary is a value statement, not a hat list.** One or two sentences on what Riley delivers and to what standard; no "leads X's R&D", no title recital, no buzzword chain. Metrics belong in the bullets, so the summary does not restate them.
- **Skills follow the bullets.** A tool or platform leads a Core Expertise line only when a bullet shows it in use; otherwise it moves later in the line or out. Group skills under the four bold labels and keep each tool name once in that section.
- **Titles reflect the primary function and the timeline is explicit.** An acquisition or title change is explained once, where the reader first meets it, in one plain sentence.
- **Lead each bullet with the outcome or the problem,** then the method, and keep the numbers that already exist (with their baseline when the data has one).
- **Copy rules** from `custom-resume` still hold: one to three sentences per bullet, no mid-sentence em dashes, no "3D printing" or "additive manufacturing" unless the point depends on it, the posting's wording for keywords.
- **Relocation:** when the job is on-site somewhere other than Bethlehem, PA and `data/header.json` has `openToRelocation: true`, the contact row carries "Open to relocation (<city>)".

## Edit, print, verify

1. Edit `output/resume-html/<name>.html` only. Keep the reference layout (navy headings, Arial, single column, blue underlined links, `@page` margins) and the `--m` spacing variable.
2. Print with `node .claude/skills/custom-resume/scripts/print-resume.mjs <html> <pdf> [multiplier]`. Start from the multiplier the build used; after cuts, do not raise it above 1.3 to chase the old page count, and prefer the reference 1.0 when the content no longer fills the pages.
3. Validate with `python .claude/skills/custom-resume/scripts/validate-resume.py <pdf> <pages> --png <dir>` and look at every rendered page. It fails on a wrong page count, unstyled links, blue text that is not a link, letter-spaced headings, and any eight-word fragment that appears twice. A repeat is a bug in the content, never a reason to tune spacing.
4. Re-run the keyword presence and unsupported-claim scans from `custom-resume` step 8 so a fix did not drop a supported keyword or let an unsupported one in.
5. Overwrite the PDF in `output/pdf/` under the same name, so the tracker and vault links stay valid, and keep the HTML beside it in `output/resume-html/`.

## Report

Deliver a clickable link to the PDF and, in this order: what was applied, what needs a fact from Riley (as questions), what was declined and why, what the reviewer had wrong, and the measured page fill. If the resume now ends short of a requested page count because repeats were removed, say so plainly; that is the correct outcome.

## Where the output is tracked

Same as `custom-resume`: when the fixed file is the one submitted, `vault-sync` copies it into `1.ApplicationsUsed/`, updates both tracker tables, and writes or refreshes the application note.
