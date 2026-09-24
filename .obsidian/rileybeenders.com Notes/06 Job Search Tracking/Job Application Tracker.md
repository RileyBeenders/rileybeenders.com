---
tags: [job-search, content]
---

# Job Application Tracker

The repo doubles as the owner's personal job-search system of record. This note covers the non-code folders and files that track it; the on-site rendering of this data is covered in [[More Info and Gantt Data]] and [[GanttChart JobsTable and gantt.ts]].

## The folders

| Folder | Contents |
|---|---|
| `2.JobsApplliedTo/` | The **original job posting** PDF for each application, numbered `001`–`021`, named `<ID>_<Job Title> at <Company>[ - <date/slug>].pdf`. (Note the double-l `Applliedto` spelling — the `custom-resume` procedure resolves near-misses to it.) |
| `1.ApplicationsUsed/` | The **actual tailored resume/cover letter** submitted for each application — the deliverable of the `custom-resume` agent procedure. Includes a `000_` website-generated baseline, matching cover letters (`.docx` + `.pdf`) for applications 011, 012, 013, the role-specific Disney Applied AI resumes for 015 and 016, and the 2-page Disney resumes for 017–021. |
| `output/pdf/` | Generated resume PDF variants, including the Disney Forward Deployed Engineer and Forward Deployed Product Engineer resumes, the full-length and `_2-Page` variants for applications 017–021, plus the `v1`/`v2` Disney Ride Control **reference resumes** the procedure matches its layout to. |
| `references/` | Dated **snapshot resumes** (`RileyBeenders_Apr2022.pdf`, `_Sept2025.pdf`, `_Jan2026.pdf`) kept as historical evidence of how the resume has evolved, and as reference material the `custom-resume` procedure can draw layout/content cues from. |
| `output/resumeTemplates/` | Abstract layout mockups from `generateResumeTemplates.mjs` — see [[Resume PDF Pipeline]]. |

## Per-application deep-dive pages

Every tracked application also has its own note under `06 Job Search Tracking/Applications/`, walking through the actual job posting (ID, dates, salary, summary, responsibilities, requirements, education, benefits, about-the-company) and a **How I Match Up** section split into a frozen snapshot from application day and a living comparison against the current site data. These are linked from the ID column below. See [[Repository Agent Skills (.agents)]] for how new applications get a page and how the "Now" comparison stays current.

## The tracker table (duplicated in two places)

Both `README.md` and `data/more-info/gantt.md` contain a Status Key, a Gantt chart, and a markdown table with columns `ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Status | Job ID` (`Status` is just the 🟢/🟠/🔴 circle; `Job ID` is the posting's own number or `N/A`). **These are two independently hand-maintained copies of the same information** — see [[More Info and Gantt Data]] for why that matters, and the **Sync Charts** procedure in [[Repository Agent Skills (.agents)]] for reconciling them.

### Current applications (21, as of README.md)

| ID                                                                               | Company                             | Role                                                           | Status                                                      |
| -------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------- |
| [[001 Disney - Principal Ride Control Software Engineer\|001]]                   | Walt Disney Imagineering            | Principal Ride Control Software Engineer (Controls Automation) | 🟢 Application Received                                     |
| [[002 Fluidstack - General Application\|002]]                                    | Fluidstack.io                       | General Application                                            | 🟢 Application Received                                     |
| [[003 K2 Space - Principal Electro-Mechanical Manufacturing Engineer\|003]]      | K2 Space                            | Principal Electro-Mechanical Manufacturing Engineer            | 🔴 No longer in consideration                               |
| [[004 Relativity Space - Lead Manufacturing Engineer Integration and Test\|004]] | Relativity Space                    | Lead, Manufacturing Engineer, Integration & Test               | 🟢 Application Received                                     |
| [[005 SpaceX - Sr Network Security Engineer\|005]]                               | SpaceX                              | Sr. Network Security Engineer                                  | 🟢 Application Received                                     |
| [[006 Disney - Principal Software Engineer\|006]]                                | Walt Disney Imagineering            | Principal Software Engineer                                    | 🔴 No longer in consideration                               |
| [[007 Boston Dynamics - Senior Staff Manufacturing Engineer\|007]]               | Boston Dynamics                     | Senior Staff Manufacturing Engineer                            | 🟢 Application Received                                     |
| [[008 Boston Dynamics - Staff Manufacturing Engineering Atlas\|008]]             | Boston Dynamics                     | Staff Manufacturing Engineering - Atlas                        | 🔴 No longer in consideration                               |
| [[009 Figure - Manufacturing Engineer\|009]]                                     | Figure Robotics                     | Manufacturing Engineer                                         | 🟢 Application Received                                     |
| [[010 Figure - NPI Engineer\|010]]                                               | Figure Robotics                     | NPI Engineer                                                   | 🟢 Application Received                                     |
| [[011 Figure - Mechanical Engineer Integration and Test\|011]]                   | Figure Robotics                     | Mechanical Engineer - Integration & Test                       | 🟢 Application Received                                     |
| [[012 Google - Product Engineer Global Manufacturing Engineering\|012]]          | Google                              | Product Engineer, Global Manufacturing Engineering             | 🟢 Application Received                                     |
| [[013 Disney - Product Software Engineer I\|013]]                                | Walt Disney Entertainment           | Product Software Engineer I                                    | 🔴 No longer in consideration                               |
| [[014 Disney - WDI Figure Programming Intern\|014]]                              | Walt Disney Imagineering            | WDI Figure Programming Intern, Spring 2027                     | 🔴 Not in consideration (not currently enrolled in college) |
| [[015 Disney - Forward Deployed Engineer\|015]]                                  | The Walt Disney Company (Corporate) | Forward Deployed Engineer                                      | 🟢 Application Received                                     |
| [[016 Disney - Forward Deployed Product Engineer\|016]]                          | The Walt Disney Company (Corporate) | Forward Deployed Product Engineer                              | 🟢 Application Received                                     |
| [[017 Disney - Sr Cybersecurity Engineer\|017]] | Disneyland Resort | Sr Cybersecurity Engineer | 🟢 Application Received |
| [[018 Disney - Sr Mechanical Engineer\|018]] | Disneyland Resort | Sr Mechanical Engineer | 🟢 Application Received |
| [[019 Disney - Sr Site Reliability Engineer\|019]] | Disney Signature Experiences | Sr Site Reliability Engineer | 🟢 Application Received |
| [[020 Disney - Manager Software Engineering\|020]] | Disney Experiences | Manager, Software Engineering | 🟢 Application Received |
| [[021 Disney - Manager Systems Engineering DCL New Build\|021]] | Disney Signature Experiences (Disney Cruise Line) | Manager, Systems Engineering (DCL New Build) | 🟢 Application Received |

### Before the tracker

The 29 inactive applications in Disney's Workday portal, 26 of them from before this site, are listed separately in [[Past Disney Applications]] (and in `README.md` under `## Past Disney Applications`). That note also covers the Ride Control System Security Engineer - OT role (10119309), which reached the final round.

## The `custom-resume` generation workflow

Each entry in `1.ApplicationsUsed/` was produced by the `custom-resume` agent procedure (`.agents/skills/custom-resume/SKILL.md`), not by the site's own `/api/resume-pdf` route. Workflow summary (full detail in [[Repository Agent Skills (.agents)]]):

1. Collect page count + which `2.JobsApplliedTo/*.pdf` to target.
2. Extract company/title/location/requirements/ATS keywords from the posting.
3. Build a fact-only evidence matrix from the live site + `data/**/*.json` — **never invents experience**.
4. Draft and lay out a resume matching the visual style of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf` (navy headings, Arial, blue underlined links, US Letter).
5. Save to `output/pdf/RileyBeenders_<Company>_<Job_Title>.pdf`, then validate page count, page fill, dimensions, rendering, and link functionality before delivery.

## Related
- [[More Info and Gantt Data]]
- [[Repository Agent Skills (.agents)]]
- [[Resume PDF Pipeline]]
- [[Home]]
