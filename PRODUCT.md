# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Everyone who follows the link. A recruiter placing the name, a hiring manager checking the claims on the PDF they were sent, an engineer at the target company deciding whether the work is real, a family member seeing what Riley does. The site is written for all of them at once, so the surface has to be easy to read and professional throughout.

The site reads at two depths. The surface (hero, the GitHub activity calendar, summary, the role list, the project cards, the stack, education, the contact block) is for every visitor. The depth (a project's dialog and its full page, the case study, "Read more", the site's own deep dive and application tracker on `/projects/rileybeenders-com`, the project links on individual resume bullets) is where a reader a little above the normal reader goes for the heaviness of the work. Nothing on the surface should require that reader.

## Product Purpose

RileyBeenders.com is a resume-shaped evidence layer. The tailored PDF resume remains the official application document; the site is the proof behind its lines. It exists so a visitor can move from a claim on the resume to the project, decision, and outcome that back it, without the site turning into a marketing page.

A successful visit is one where the visitor explores and reads through the majority of the site rather than glancing at it and steering their attention elsewhere. Success is dwell and exploration, not a single conversion event. Email, LinkedIn, GitHub, and the PDF download are always reachable, but they are not the measure.

## Positioning

Every line of the resume links to the evidence behind it, and the same data renders the site, the job-tailored PDFs, and the application tracker. The site also documents and maintains itself: repository agent procedures tailor resumes, keep an Obsidian vault in sync with the code, and keep `/about-this-site` honest, and that page shows the visitor how. A neighboring portfolio can copy the layout; it cannot truthfully copy a resume whose every claim traces to a data file and whose maintenance is visible on the page.

## Operating Context

- The site sits beside a job search. Each application in `2.JobsApplliedTo/` gets a tailored PDF in `1.ApplicationsUsed/`, generated from the same `data/` files the site renders. Roles targeted so far are senior R&D, manufacturing, automation, and software engineering positions at hardware, robotics, aerospace, and entertainment-engineering companies. Riley is based in Bethlehem, PA and open to relocation.
- Visitors usually arrive from a link in a resume, an application, LinkedIn, or GitHub, on a laptop or a phone. Many of them have the PDF open beside the site.
- Content lives in JSON under `data/` and is edited through the Studio, a local-only editor (`npm run site` brings it up beside the dev server; `127.0.0.1:3001`) that is never deployed. In development every page carries an "Edit in Studio" control that opens the file behind it. Site settings (palette preset, custom palette seeds, the three font roles, visibility switches) are Studio fields in `data/header.json`.
- The site deploys continuously to Vercel from a solo workflow. Next.js 16, React 19, TypeScript, framer-motion, plain global CSS (no Tailwind, no CSS modules).
- An Obsidian vault at `.obsidian/rileybeenders.com Notes/` documents the code, the data layer, the styling, and every application. Agents update it in the same session as any change.
- The site's own case study is one entry in the projects catalog, `/projects/rileybeenders-com` (the retired `/about-this-site` and `/more-info` redirect there): stats from git, a curated commit timeline, three pillars, three live demos of the tooling (the resume formatter, the Studio, the agent skills), and the application tracker at its foot. It is refreshed by an agent procedure, not by hand.
- The message form posts to `/api/contact`, which delivers through Resend to one inbox (`CONTACT_TO`, intended to be contact@rileybeenders.com; see `.env.example`). Until the inbox and key are configured the route answers 503 and the form opens the visitor's own mail app with the message filled in.
- The GitHub contribution calendar is read from GitHub's public contributions fragment on the server at build time and revalidated hourly; no token, no third-party widget.

## Capabilities and Constraints

Confirmed functionality:

- Four routes: `/` (the resume: hero, GitHub activity, summary, experience, a project grid, the stack, education, contact), `/projects` (the catalog: every published project plus the site itself as cards with type filters; a card opens a dialog, with galleries, lightbox, and case studies inside; proofs exist in data but are hidden), `/projects/[id]` (each entry's own page, prerendered), `/contact` (the ways in and the message form). `/about-this-site` and `/more-info` redirect into the catalog.
- Light and dark themes, eleven palette presets (Blue Sheet is the active one) plus a custom palette, and three font roles (header, sub-header, body), all switched from the Studio and written as CSS tokens at render time. Dark mode lightens the accent for text and deepens it for fills.
- Projects open in a dialog addressed by the URL hash (`#project-<id>`, `-case-study` to expand the case study) with a full page behind each one, so resume links, linked skills and shared links all land with the project up.
- Motion switches in the Studio: synced repeating animations, inertial wheel scrolling, and the monogram chip that trails the pointer across the hero.
- A PDF download of the resume generated on demand from the site's data (`/api/resume-pdf`).
- An "Open to relocation" badge, switchable in the Studio.
- Resume bullets that link to their project; projects that open into a case study.
- Analytics and speed insights, a social card, and an icon rendered from the same data.

Constraints future work must preserve:

- The home page must stay recognizable as a resume at rest: no hero video, no marketing voice. The surface reads like the document a recruiter expects (hero, activity, who, experience, projects, stack, education, contact, in that order); the depth opens on request.
- Every claim on the site must trace to real work in the data files. No invented metrics, testimonials, clients, or capabilities.
- Content edits must never require touching code. Any new field is a Studio schema entry, not a hard-coded string.
- Motion must be subtle enough to survive a recruiter's ten-second scan and must respect `prefers-reduced-motion`. No pinning or scroll-jacking.
- Both themes are first-class. Dark mode is a token swap, not a second design; fills use `--accent-fill` so they deepen in the dark while text on `--accent` lightens.
- The Studio runs outside the Next app on localhost only and must stay that way.
- Every rendered `<a>` / `<Link>` carries `suppressHydrationWarning` (a browser extension on Riley's machine stamps anchors; `scripts/check-anchor-hydration.mjs` verifies).
- `components/GanttChart.tsx`, `app/apple-icon.tsx`, and `app/opengraph-image.tsx` carry hard-coded copies of the active palette because mermaid and Satori cannot read CSS variables. A palette change has to reach them by hand.
- Tokens are scoped to `.bp`; anything portalled must land in `[data-sheet-portal]` (the project dialog does) or carry literal colours (the lightbox does).

Terminology: "projects" are published work with galleries and case studies; "proofs" are supporting evidence entries (hidden today); the "Studio" is the local editor; "skills" or "procedures" are the agent instructions under `.claude/skills/`; the "vault" is the Obsidian documentation.

Undecided: whether proofs ever surface publicly; whether the beta (this branch, planned for beta.rileybeenders.com) replaces the main site as is or after a round of changes.

## Brand Commitments

- The name is Riley Beenders; the site is RileyBeenders.com. Title line: "R&D, Electromechanical and Automation Engineer".
- Voice is first person, plain, and specific, in Riley's own words. Facts over adjectives. Copy that exists in `data/` is content, not placeholder, and is replaced only with Riley's agreement.
- The "B" monogram (`components/blueprint/BpMark.tsx`, `app/icon.svg`, the apple icon and social card) is the site's mark and stays.
- The visual system is "Blue Sheet" (a cool blue-white drafting sheet inside a dashed cut line, rounded cards, one blue from a pale wash to a deep fill, Instrument Serif over Inter with IBM Plex Mono labels, one easing curve), documented in `DESIGN.md`. It replaced "Blueprint Press" on 2026-11-08 at Riley's request for a fresh UI on the same data and wording, taking its cues from the portfolios Riley named (a profile-card hero and contribution calendar, project tiles that open into a dialog with a full page behind, a message form, a dark mode that deepens its colour). The monogram, the Studio's palette and font switching, the resume section order and the fluid motion carried over. Design work on the site is refinement inside this world, not a replacement world; Blueprint Press survives as the "Default" palette's lineage and in the vault's history.
- The Studio (local editor) is a sibling surface in the same world and may change more freely than the site, since it never ships.

## Evidence on Hand

- `data/home/*.json`: summary, experience (eight roles with bullets and emphasis phrases), skills (four groups), education (one degree, eight certificates with credential links).
- `data/projects/projects.json` and `proofs.json`: one published project (ICARUS-Lite, six photographs, a full case study) and eight written but hidden projects; proofs are hidden.
- `public/project-images/` and `public/project-artifacts/`: photographs, renders, and diagrams for the projects; `public/project-images/rileybeenders-com/`: the site's own screenshots in both themes.
- `data/site/about-site.json`: the site's case study, stats, timeline, pillars, and demo copy, in Riley's words.
- `1.ApplicationsUsed/`, `2.JobsApplliedTo/`, `output/pdf/`: sixteen tracked applications, each with the posting PDF and the tailored resume; `references/`: earlier resumes (2022, 2025, 2026).
- `design/*.dc.html` + `canvas.json`: the Claude Design canvases the incumbent Blueprint Press direction was chosen from.
- Absent, and not to be fabricated: testimonials, client logos, performance benchmarks beyond what the bullets state, and any project not in `projects.json`.

## Product Principles

1. **Resume at rest, evidence on demand.** The surface is the document; the depth is a click away and never forced on the reader.
2. **Everything traces.** A claim exists on the site only because it exists in the data, and the data exists because the work happened.
3. **Content is data, design is tokens.** Riley edits words, images, palettes, and fonts from a form; agents and code change how they render.
4. **Readable by everyone, professional throughout.** The heaviness of the work lives behind "Read more", not on the first screen.
5. **The site keeps itself honest.** Procedures, the vault, and the site's own project entry (`/projects/rileybeenders-com`) document what changed and why, in the same session as the change.

## Accessibility & Inclusion

No product-specific standard has been set. The site already honors `prefers-reduced-motion` site-wide, keeps visible focus rings on interactive elements, and provides keyboard-operable galleries and lightbox. Treat WCAG 2.2 AA contrast and target sizes as the floor for new work; Riley has not asked for more, and nothing here should assume less.
