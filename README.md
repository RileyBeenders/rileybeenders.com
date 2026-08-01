# RileyBeenders.com

***

'RileyBeenders.com' is a resume-shaped portfolio website designed to complement a traditional ATS-friendly resume PDF. The PDF remains the official application document, while the website serves as an interactive evidence layer that demonstrates the work behind the claims on the resume.

The site stays readable as a conventional resume at rest, then reveals additional proof of work through hover states, subtle mouse-driven 3D motion, persistent project links, and expandable information drawers. Its goal is to preserve the clarity and familiarity of a standard resume while giving visitors a more engaging way to explore projects, supporting visuals, and professional impact.

# Job Applications Submitted



| PDF ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Updates |
|:----:|:----|:----|:----:|:----:|:----:|:----| 
|001|[Principal Ride Control Software Engineer (Controls Automation)](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/001_Principal%20Ride%20Control%20Software%20Engineer%20(Controls%20Automation)%20at%20DISNEY%20-%20073126.pdf)| Walt Disney Imagineering | Glendale, CA, USA | July 31, 2026 | [Tailored Resume](https://github.com/RileyBeenders/rileybeenders.com/blob/main/output/ApplicationsUsed/001_Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume.pdf) | 🟢 Application Received |
|002|[General Application | Fluidstack.io | Unknown ATM](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/002_General%20Application%20at%20Fluidstack.pdf) | August 01, 2026 | [Website Generated](https://github.com/RileyBeenders/rileybeenders.com/blob/main/output/ApplicationsUsed/Riley-Beenders-Resume_080126.pdf) |🟢 Application Received |
|003|[Principal Electro-Mechanical Manufacturing Engineer](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/003_Principal%20Electro-Mechanical%20Manufacturing%20Engineer%20at%20K2%20Space.pdf) | K2 Space | Los Angeles, CA | August 01, 2026 | [Website Generated](https://github.com/RileyBeenders/rileybeenders.com/blob/main/output/ApplicationsUsed/Riley-Beenders-Resume_080126.pdf) | 🟢 Application Received |
|004|[Lead, Manufacturing Engineer, Integration & Test](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/004_Lead%2C%20Manufacturing%20Engineer%2C%20Integration%20%26%20Test%20at%20Relativity%20Space.pdf) | Relativity Space | Long Beach, California | August 01, 2026 | [Website Generated](https://github.com/RileyBeenders/rileybeenders.com/blob/main/output/ApplicationsUsed/Riley-Beenders-Resume_080126.pdf) | 🟢 Application Received |
|005|[Sr. Network Security Engineer](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/005_Sr.%20Network%20Security%20Engineer%20at%20SpaceX.pdf) | SpaceX | Hawthorne, CA | August 01, 2026 | [Tailored Resume](https://github.com/RileyBeenders/rileybeenders.com/blob/main/output/ApplicationsUsed/005_RileyBeenders_SpaceX_Sr_Network_Security_Engineer.pdf) | 🟢 Application Received |
|006|[Principal Software Engineer](https://github.com/RileyBeenders/rileybeenders.com/blob/main/JobsAppliedTo/006_Principal%20Software%20Engineer%20at%20Disney.pdf) | Walt Disney Imagineering | Glendale, CA, USA | August 01, 2026 | Tailored Resume | 🟢 Application Received |

***

# Running the Local Environment

```bash
npm install
npm run dev
```

If you are running these commands in Windows PowerShell and see `running scripts is disabled on this system`, use the command shim instead:

```bash
npm.cmd install
npm.cmd run dev
```

If you want to keep using `npm` directly in PowerShell, run this once in an elevated terminal:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Then open:

```txt
http://localhost:3000
```
***

# Project Structure

```txt
app/
  api/
    resume-pdf/
      route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  InteractiveResume.tsx
ResumeBuilder/
  downloadPublishedResume.ts
  generateResumePdf.ts
data/
  header.json
  education.json
  experience.json
  proofs.json
  projects.json
  skills.json
  summary.json
  resumeData.ts
types/
  resume.ts
public/
  project-artifacts/
```
***

## Tailored Resume Builder Prompt

```
I am applying to some jobs. I needs 1-page resumes generated based off of my current 'live' website "www.rileybeenders.com" matching the same format that we generated [reference Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf] yesterday.

Please make sure to follow the same theme, underline the hyperlinks and make them blue. When finished, use the following name format: "RileyBeenders_<company>_<job title>.pdf"

Use the "/JobsAplliedTo/<PDF Name Here>.pdf" to reference the current job I am applying to.
```