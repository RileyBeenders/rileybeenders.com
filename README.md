# RileyBeenders.com

'RileyBeenders.com' is a resume-shaped portfolio website designed to complement a traditional ATS-friendly resume PDF. The PDF remains the official application document, while the website serves as an interactive evidence layer that demonstrates the work behind the claims on the resume.

The site stays readable as a conventional resume at rest, then reveals additional proof of work through hover states, subtle mouse-driven 3D motion, persistent project links, and expandable information drawers. Its goal is to preserve the clarity and familiarity of a standard resume while giving visitors a more engaging way to explore projects, supporting visuals, and professional impact.

## Getting Started

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

## Project Structure

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
  InteractiveResume.tsx
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
