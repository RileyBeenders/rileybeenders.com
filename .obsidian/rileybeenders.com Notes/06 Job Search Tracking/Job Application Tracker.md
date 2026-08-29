---
tags: [job-search, content]
---

# Job Application Tracker

The repo doubles as the owner's personal job-search system of record. This note covers the non-code folders and files that track it; the on-site rendering of this data is covered in [[More Info and Gantt Data]] and [[GanttChart JobsTable and gantt.ts]].

## The folders

| Folder | Contents |
|---|---|
| `2.JobsApplliedTo/` | The **original job posting** PDF for each application, numbered `001`–`013`, named `<ID>_<Job Title> at <Company>[ - <date/slug>].pdf`. (Note the double-l `Applliedto` spelling — the `custom-resume` procedure resolves near-misses to it.) |
| `1.ApplicationsUsed/` | The **actual tailored resume/cover letter** submitted for each application — the deliverable of the `custom-resume` agent procedure. Includes a `000_` website-generated baseline and matching cover letters (`.docx` + `.pdf`) for applications 011, 012, 013. |
| `output/pdf/` | Additional generated resume PDF variants (Disney Principal Software Engineer, Disney Ride Control Controls Automation, SpaceX Sr. Network Security Engineer) plus the `v1`/`v2` Disney Ride Control **reference resumes** the procedure matches its layout to. |
| `references/` | Dated **snapshot resumes** (`RileyBeenders_Apr2022.pdf`, `_Sept2025.pdf`, `_Jan2026.pdf`) kept as historical evidence of how the resume has evolved, and as reference material the `custom-resume` procedure can draw layout/content cues from. |
| `output/resumeTemplates/` | Abstract layout mockups from `generateResumeTemplates.mjs` — see [[Resume PDF Pipeline]]. |

## Per-application deep-dive pages

Every tracked application also has its own note under `06 Job Search Tracking/Applications/`, walking through the actual job posting (ID, dates, salary, summary, responsibilities, requirements, education, benefits, about-the-company) and a **How I Match Up** section split into a frozen snapshot from application day and a living comparison against the current site data. These are linked from the ID column below. See [[Repository Agent Skills (.agents)]] for how new applications get a page and how the "Now" comparison stays current.

## The tracker table (duplicated in two places)

Both `README.md` and `data/more-info/gantt.md` contain a Gantt chart + a markdown table with columns `JobID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Updates`. **These are two independently hand-maintained copies of the same information** — see [[More Info and Gantt Data]] for why that matters, and the **Sync Charts** procedure in [[Repository Agent Skills (.agents)]] for reconciling them.

### Current applications (13, as of README.md)

| ID | Company | Role | Status |
|---|---|---|---|
| [[001 Disney - Principal Ride Control Software Engineer\|001]] | Walt Disney Imagineering | Principal Ride Control Software Engineer (Controls Automation) | 🟢 Application Received |
| [[002 Fluidstack - General Application\|002]] | Fluidstack.io | General Application | 🟢 Application Received |
| [[003 K2 Space - Principal Electro-Mechanical Manufacturing Engineer\|003]] | K2 Space | Principal Electro-Mechanical Manufacturing Engineer | 🟡 Interviewing |
| [[004 Relativity Space - Lead Manufacturing Engineer Integration and Test\|004]] | Relativity Space | Lead, Manufacturing Engineer, Integration & Test | 🟢 Application Received |
| [[005 SpaceX - Sr Network Security Engineer\|005]] | SpaceX | Sr. Network Security Engineer | 🟢 Application Received |
| [[006 Disney - Principal Software Engineer\|006]] | Walt Disney Imagineering | Principal Software Engineer | 🔴 No longer in consideration |
| [[007 Boston Dynamics - Senior Staff Manufacturing Engineer\|007]] | Boston Dynamics | Senior Staff Manufacturing Engineer | 🟢 Application Received |
| [[008 Boston Dynamics - Staff Manufacturing Engineering Atlas\|008]] | Boston Dynamics | Staff Manufacturing Engineering - Atlas | 🔴 No longer in consideration |
| [[009 Figure - Manufacturing Engineer\|009]] | Figure Robotics | Manufacturing Engineer | 🟢 Application Received |
| [[010 Figure - NPI Engineer\|010]] | Figure Robotics | NPI Engineer | 🟢 Application Received |
| [[011 Figure - Mechanical Engineer Integration and Test\|011]] | Figure Robotics | Mechanical Engineer - Integration & Test | 🟢 Application Received |
| [[012 Google - Product Engineer Global Manufacturing Engineering\|012]] | Google | Product Engineer, Global Manufacturing Engineering | 🟢 Application Received |
| [[013 Disney - Product Software Engineer I\|013]] | Walt Disney Entertainment | Product Software Engineer I | 🔴 No longer in consideration |

## The `custom-resume` generation workflow

Each entry in `1.ApplicationsUsed/` was produced by the `custom-resume` agent procedure (`.agents/custom-resume/SKILL.md`), not by the site's own `/api/resume-pdf` route. Workflow summary (full detail in [[Repository Agent Skills (.agents)]]):

1. Collect page count + which `2.JobsApplliedTo/*.pdf` to target.
2. Extract company/title/location/requirements/ATS keywords from the posting.
3. Build a fact-only evidence matrix from the live site + `data/**/*.json` — **never invents experience**.
4. Draft and lay out a resume matching the visual style of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf` (navy headings, Arial, blue underlined links, US Letter).
5. Save to `output/pdf/RileyBeenders_<Company>_<Job_Title>.pdf`, then validate page count, dimensions, rendering, and link functionality before delivery.

## Related
- [[More Info and Gantt Data]]
- [[Repository Agent Skills (.agents)]]
- [[Resume PDF Pipeline]]
- [[Home]]
