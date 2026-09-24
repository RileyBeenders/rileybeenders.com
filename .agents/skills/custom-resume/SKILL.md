---
name: custom-resume
description: Generate and verify a job-targeted resume for Riley Beenders using a requested page count, a job-posting PDF, current RileyBeenders.com facts, and the established Disney reference resume. Use when asked to create, tailor, revise, or regenerate a resume for a job PDF in 2.JobsApplliedTo.
---

# Custom Resume

One of several repository agent procedures — see `.agents/README.md` for the set.

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
   - The job-posting directory is spelled `2.JobsApplliedTo`. Resolve near-miss
     spellings (`JobsAppliedTo`, `JobsAplliedTo`, `2.JobsAppliedTo`) to that directory.
   - Ask for clarification if the PDF path matches no file or multiple files.
2. Extract the company, job title, location, responsibilities, qualifications, and important ATS terms from the job PDF.
   - Look for the most important requirements and responsibilities, and any specific keywords that are repeated or emphasized.
   - Keywords are the most important. The wording between `data/home/skills.json` and the job posting may slightly difer in spelling, punctuation, or capitalization. Use the job posting's wording when possible.
3. Build a fact-only evidence matrix from:
   - `https://www.rileybeenders.com`
   - `data/**/*.json` — the resume's own sections are `data/header.json` and `data/home/{summary,experience,skills,education}.json`. From each `experience.json` entry use `company`, `role`, `location`, `start`, `end`, `context`, and each bullet's `text` (a bullet's `projectId` tells you which project backs it); a bullet's `proofId` is a site-only cross-link and never resume content.
   - Relevant current project source files when they directly prove a technical claim.
4. Never invent experience to match the posting. You can modify the wording to more closely match the posting, but only if the claim is supported by evidence. If a claim is unsupported, judge if it should be used in the resume.
   - Separate supported evidence from gaps.
   - Exclude unsupported tools, platforms, credentials, industries, dates, and performance metrics.
   - Prefer the current live-site wording when older resumes conflict with current data.
5. Draft a resume that fills the selected page count and prioritizes the strongest supported evidence for the target role.
   - Fill every requested page. The text on the last page should end near the bottom margin, not partway down the page. A 2-page resume whose second page stops halfway reads as unfinished.
   - Fill with supported content first, strongest evidence first:
     1. More `experience.json` bullets that fit the role.
     2. A multi-role employer (Filament Innovations) split into per-role entries, each with its own dates.
     3. A **Selected Projects** section drawn from `data/projects/projects.json` (including each project's `additionalInfo` problem, approach, and impact).
     4. More additional relevant experience.
     5. The full certification list from `education.json`.
     6. An extra Core Expertise line.
   - Then tune vertical spacing (gaps between sections, entries, and bullets) until the content reaches the bottom margin. Scale every gap together rather than one at a time. Stay between roughly 0.8x and 1.7x the reference gaps. Never shrink body text below the reference size to make content fit; cut the weakest evidence instead. A binary search on a single spacing multiplier works: print, count pages, and keep the largest value that still yields exactly the requested page count.
   - Never pad with filler, repeated claims, or unsupported evidence. If supported evidence runs out before the pages are full, stop and report the remaining gap instead of padding.
   - For more than one page, move the page margins into `@page` so later pages get the same top margin. Let sections break across pages, but keep a heading or role heading with its first bullet, and never split a bullet across pages.
6. Match the layout and theme of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf`.
   - Use US Letter portrait format.
   - Preserve the navy headings, Arial typography, spacing, rules, and single-column structure.
   - Make every contact hyperlink blue, visibly underlined, and clickable.
7. Save the final PDF to `output/pdf/` using:

   `RileyBeenders_<Company>_<Job_Title>.pdf`

   Replace spaces and invalid filename characters with underscores.
8. Validate before delivery.
   - Require exactly the selected number of pages, each at 612 x 792 points.
   - Measure page fill. With the reference 0.42in bottom margin the content area ends at about y = 762pt. The lowest text line on the last page should end within about 36pt of that (y >= 726pt), and every earlier page should run to its bottom margin. Report the measured value; if it falls short, return to step 5.
   - Render the page and inspect it for clipping, overlap, malformed glyphs, and inconsistent spacing.
   - Apply the design craft floor to that render (`.agents/skills/impeccable/reference/craft-floor.md`, its **Verify** list, read as a printed document rather than a web page). The PDF keeps its own ATS-safe identity (navy headings, Arial, single column) and does not follow the site's `DESIGN.md`, but the same floor holds: one consistent scale of heading, body, and label sizes; more space above a heading than below it; a body measure that does not run edge to edge in a single column of 12pt Arial; dates and numerals aligned so a scanner and a human read the same column; hyperlinks visibly styled (blue, underlined) and nothing else styled like a link; no orphaned heading at a page bottom; no widowed single line of a bullet on the next page. Do not run impeccable's HTML detector on the PDF; it only reads markup.
   - Confirm the phone, email, website, and LinkedIn URI annotations work.
   - Confirm all linked text is blue and underlined.
   - Confirm the final text contains the supported target keywords and none of the unsupported claims identified during the evidence audit.
9. Return a clickable link to the final PDF and a short verification summary, including the measured page fill.

When subagents are available, parallelize job analysis, evidence auditing, and content strategy. Keep final writing, PDF generation, and quality approval with the primary agent.

## Example task

User request:

`$custom-resume`

Assistant intake request:

1. `How many pages should the final resume be? (Recommended: 1)`
2. `Which job-posting PDF should I use to tailor the resume?`

User response:

`Use 1 page and 2.JobsApplliedTo/006_Principal Software Engineer at Disney.pdf.`

Expected result:

- Read the Disney job posting and current RileyBeenders.com evidence.
- Emphasize only supported software, infrastructure, automation, and leadership experience.
- Record important Disney requirements that are not supported and keep them out of the resume.
- Generate and verify `output/pdf/RileyBeenders_Disney_Principal_Software_Engineer.pdf`.

## Where the output is tracked

The delivered file for a real application is copied into `1.ApplicationsUsed/` and the row in the `README.md` / `data/more-info/gantt.md` tracker table plus the matching vault page in `.obsidian/rileybeenders.com Notes/06 Job Search Tracking/Applications/` are updated — that bookkeeping is the `vault-sync` procedure's job (`.agents/skills/vault-sync/SKILL.md`).
