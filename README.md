# RileyBeenders.com

***

'RileyBeenders.com' is a resume-shaped portfolio website designed to complement a traditional ATS-friendly resume PDF. The PDF remains the official application document, while the website serves as an interactive evidence layer that demonstrates the work behind the claims on the resume.

The site stays readable as a conventional resume at rest, then reveals additional proof of work through hover states, subtle mouse-driven 3D motion, persistent project links, and expandable information drawers. Its goal is to preserve the clarity and familiarity of a standard resume while giving visitors a more engaging way to explore projects, supporting visuals, and professional impact.

# Job Applications Submitted



| PDF ID | Job Title | Company | Location (Goal) | Date Submitted | Resume Used | Updates |
|:----:|:----|:----|:----:|:----:|:----:|
|001|Principal Ride Control Software Engineer (Controls Automation)| Walt Disney Imagineering | Glendale, CA, USA | July 31, 2026 | Tailored Resume | 🟢 Application Received |
|002|General Application | Fluidstack.io | Unknown ATM | August 01, 2026 | Website Generated |🟢 Application Received |
|003|Principal Electro-Mechanical Manufacturing Engineer | K2 Space | Los Angeles, CA | August 01, 2026 | Website Generated | 🟢 Application Received |
|004|Lead, Manufacturing Engineer, Integration & Test | Relativity Space | Long Beach, California | August 01, 2026 | Website Generated | 🟢 Application Received |
|005| Sr. Network Security Engineer | SpaceX | Hawthorne, CA | August 01, 2026 | Tailored Resume | 🟢 Application Received |
|006| Principal Software Engineer | Walt Disney Imagineering | Glendale, CA, USA | August 01, 2026 | Tailored Resume | 🟢 Application Received |

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