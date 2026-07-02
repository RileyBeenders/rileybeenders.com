# Interactive Resume Starter

A resume-shaped portfolio website that stays readable at rest and reveals proof-of-work through hover states, subtle 3D motion, and expandable case-study drawers.

This is designed to sit next to a normal ATS resume PDF. The PDF remains the official application document. The website is the interactive evidence layer.

## What is included

- Next.js app router project
- TypeScript
- Resume content stored in `data/resume.json`
- Interactive resume layout that mirrors a conventional PDF resume
- Proof mode toggle
- Hover proof cards
- Expandable case-study drawer
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

Most content lives in:

```txt
data/resume.json
```

Update:

- `person`
- `summary`
- `experience`
- `projects`
- `skills`
- `proofs`
- `caseStudies`

Each bullet can optionally include a `proofId`. That proof ID connects the resume line to a hover card and, optionally, a full case study.

Example:

```json
{
  "text": "Led development and production release support for a new additive manufacturing product line.",
  "proofId": "product-line"
}
```

The matching proof object is in the `proofs` array:

```json
{
  "id": "product-line",
  "title": "Product Development Evidence",
  "summary": "Prototype-to-production story with visuals and supporting context.",
  "caseStudyId": "product-development"
}
```

The matching case study is in the `caseStudies` array:

```json
{
  "id": "product-development",
  "title": "Product Development Case Study"
}
```

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
