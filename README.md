# Interactive Resume Starter

A resume-shaped portfolio website that stays readable at rest and reveals proof-of-work through hover states, subtle 3D motion, and expandable additional-information drawers.

This is designed to sit next to a normal ATS resume PDF. The PDF remains the official application document. The website is the interactive evidence layer.

## What is included

- Next.js app router project
- TypeScript
- Resume content stored in `data/resume.json`
- Interactive resume layout that mirrors a conventional PDF resume
- Always-visible proof and project links
- Hover proof cards
- Expandable additional-information drawer
- Mouse-driven 3D page movement
- Placeholder SVG project artifacts
- Download button wired to `/resume.pdf`

## Project structure

```txt
app/
  globals.css
  layout.tsx
  page.tsx
components/
  InteractiveResume.tsx
data/
  resume.json
  education.json
  experience.json
  proofs.json
  projects.json
  skills.json
  resumeData.ts
types/
  resume.ts
public/
  project-artifacts/
```

## Getting started

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

## Where to edit resume content

The master resume file is:

```txt
data/resume.json
```

For easier editing, the main resume sections are split into focused files and merged into the site at build time:

```txt
data/education.json
data/experience.json
data/proofs.json
data/projects.json
data/skills.json
```

Update these files for:

- `education`
- `experience`
- `proofs`
- `projects`
- `skills`

Update `data/resume.json` for:

- `person`
- `summary`

`resume.json` intentionally does not duplicate those arrays. The site combines the master file and split sections through `data/resumeData.ts`, so `npm run dev` and `npm run build` use the same assembled resume data.

Each bullet can optionally include a `proofId`. That proof ID connects the resume line to a hover card and, optionally, a project's additional information.

Example:

```json
{
  "text": "Led development and production release support for a new additive manufacturing product line.",
  "proofId": "product-line"
}
```

The matching proof object is in `data/proofs.json`:

```json
{
  "id": "product-line",
  "title": "Product Development Evidence",
  "summary": "Prototype-to-production story with visuals and supporting context.",
  "projectId": "product-development"
}
```

The matching project in `data/projects.json` can contain its long-form content directly:

```json
{
  "id": "product-development",
  "name": "Product Development",
  "additionalInfo": {
    "title": "Product Development",
    "subtitle": "From prototype to production",
    "problem": "The challenge the project addressed.",
    "constraints": [],
    "approach": [],
    "impact": [],
    "tools": [],
    "assets": []
  }
}
```

Projects with `additionalInfo` display a **Read more** action and open an **Additional Info** drawer.

## Adding your resume PDF

Put your normal ATS resume PDF here:

```txt
public/resume.pdf
```

The download button is already configured through `resumePdfPath` in `data/resume.json`.

## Replacing placeholder visuals

Replace the files inside:

```txt
public/project-artifacts/
```

Use sanitized project visuals only. Good options:

- Cropped product photos
- Abstracted CAD renders
- Redrawn diagrams
- Blurred screenshots
- Non-proprietary workflow maps
- Generic architecture diagrams

## Recommended GitHub setup

Create an empty repository, then either upload these files or push from your local machine:

```bash
git init
git add .
git commit -m "Initial interactive resume starter"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Deployment

Recommended hosts:

- Vercel
- Cloudflare Pages
- Self-hosted through your own reverse proxy

For a custom domain, point something like this at the deployment:

```txt
resume.yourdomain.com
portfolio.yourdomain.com
rileybeenders.com/resume
```

## Design intent

The site should answer one question:

> Is this person actually as capable as the resume claims?

The PDF gets you screened. This site provides the proof.
