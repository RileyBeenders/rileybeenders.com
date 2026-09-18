---
tags: [agents, design, styling, meta]
---

# Impeccable Design Workflow

`impeccable` is the design skill that entered the repo on 2026-09-18 (`.agents/skills/impeccable/`, junctioned to `.claude/skills/impeccable`, tracked in `skills-lock.json` from `pbakaus/impeccable`, v0.1.5). Unlike the thirteen single-file taste guides beside it, it is a command set with a launcher and a bundled anti-pattern detector, and it is the only design skill that reads this repository's own context. It is now the entry point for any design, review, or polish request on the site or the Studio; see [[Repository Agent Skills (.agents)]] for where it sits among the other procedures.

## The three context files

| File | Role | Written by |
|---|---|---|
| `PRODUCT.md` (repo root) | Product truth: audience, what a successful visit is, positioning, operating context, constraints future work must preserve, brand commitments, evidence on hand, principles, accessibility floor. | `$impeccable init`, from an interview with Riley on 2026-09-18. Re-run only to update stale facts. |
| `DESIGN.md` (repo root) | The Blueprint Press system in the Google Stitch `DESIGN.md` format: YAML frontmatter of tokens (the active **Electric** preset and the **Default** fallback for both themes, twelve type roles, radii, spacing, fourteen component specs), then Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts, with six named rules. The detector compares literal CSS values against it. | `$impeccable document`. Regenerate after any token change in `blueprint.css`, `lib/palettes.ts`, or `lib/palette.ts`. |
| `.impeccable/design.json` | The sidecar for what the frontmatter cannot hold: tonal ramps, the four shadows, the motion vocabulary (`--ease`, the four `Reveal` variants, wipes, the monogram loop, reduced-motion), the one breakpoint, the blueprint grid as a named surface, drop-in HTML/CSS for nine canonical components, and the narrative verbatim. `.impeccable/critique/` holds critique snapshots that `$impeccable polish` reads as its backlog. | Regenerated with `DESIGN.md`; snapshots by `$impeccable critique`. |

Until this pass the root `DESIGN.md` was a stray analysis of *claude.com* (cream canvas, coral CTAs, Copernicus) committed with the "Reworked AGENT skills" change. `impeccable` resolved it as the site's design authority, so its detector reported 100+ "off-system" values that were in fact Blueprint Press's own tokens. The file was replaced with the real system; the claude.com analysis exists only in git history. The narrative language in the new file (north star "The Blueprint Press", the color and philosophy descriptions) was taken from Riley's own words in `data/site/about-site.json` and [[Design System (Blueprint Press)]] rather than from a fresh interview.

The `.agents/design-guidelines/DESIGN.md` router is a different file: it picks between the Tesla and Bugatti reference token sets the Electric preset was seeded from. It now carries a note pointing at the root file.

## Standing decisions from the 2026-09-18 interview

These are recorded so no agent re-asks them:

- **Visitor:** everyone. A recruiter, a hiring manager checking the PDF's claims, an engineer at the target company, family. Easy to read and professional throughout.
- **Two depths:** the surface (hero, summary, roles, project cards, contact) is for every visitor; the depth ("Read more", case studies, the About page's deep dive, the bullets' project links) is for a reader a little above the normal reader. Nothing on the surface should require that reader.
- **Success:** the visitor explores and reads through the majority of the site. Dwell and exploration, not a conversion.
- **Scope of design work:** refinement inside Blueprint Press. The general layout, the B monogram, the resume section order, the Studio's palette/font switching, and the fluid motion all stay. The goal of refinement is to take away the "generated interface" feel and add human specificity, without turning into a landing page or a template, losing the engineering character, or getting loud or playful. A replacement visual world would go through `impeccable`'s new-work direction round with Riley; nobody starts one on their own.
- **The Studio** may change more freely than the site (it never ships) but stays in the same visual world.
- **Modes:** the home page and `/more-info` are Read surfaces (comprehension and wayfinding first); `/projects` and `/about-this-site` are Experience surfaces (the work leads); the Studio is Operate.

## How the commands map onto this repo

- Run the launcher from the repo root: `sh .agents/skills/impeccable/scripts/impeccable <verb>` (Git Bash) or `.agents\skills\impeccable\scripts\impeccable.cmd <verb>` (PowerShell). `impeccable context` loads the three files above and prints directives; run it once per session.
- `impeccable detect --json <files>` is the mechanical scan. Pass the `.tsx` pages and the `.css` files explicitly (Next.js CSS imports are not followed). Expected advisories: the grid background (`codex-grid-background`) on `blueprint.css`, `feature.css`, and `studio.css`, because the blueprint grid is the committed surface; treat those as false positives, everything else as a finding.
- `$impeccable critique <route or file>` runs two isolated subagents (a design review and the detector/browser evidence), synthesizes a report with Nielsen scores and P0–P3 issues, and writes a snapshot under `.impeccable/critique/`. `$impeccable polish` reads that snapshot as its backlog and closes it when cleared.
- `$impeccable audit` (a11y, performance, responsive), `typeset`, `layout`, `quieter`, `delight`, `clarify`, `harden`, `adapt` are the scoped refinement commands. All of them preserve the incumbent world by contract.
- `$impeccable animate` defers to `motion-design` here: that procedure owns *what* moves and *how much* on this site.
- `$impeccable live` / `generate` are the in-browser variant tools; they need the dev server and a configured `.impeccable/live/config.json` (not set up yet).

## Where the other procedures call it

- `site-timeline-sync` runs the detector over changed UI files before recapturing the About page's screenshots, so a capture never immortalizes a tell.
- `custom-resume` applies the craft floor (`reference/craft-floor.md`, the Verify list read as print) to the rendered PDF. The PDF keeps its own ATS identity and does not follow `DESIGN.md`.
- `sync-charts` carries the Hard-Copy Rule: `GanttChart.tsx` bakes colors into mermaid, so a palette change must reach it by hand, and the detector runs over it afterward.
- `vault-sync` maps `PRODUCT.md`, `DESIGN.md`, and `.impeccable/` to this note and to [[Design System (Blueprint Press)]].
- `motion-design` names the two motion rules the craft floor adds (one authored moment per surface; no looping ambient effect that carries no state).

## Critique history

See the section below for each run; the snapshots themselves live in `.impeccable/critique/`.

### 2026-09-18 — first run, site and Studio

Recorded after the first critique pass; see the git commit that introduced this note for the report, and `.impeccable/critique/` for the snapshots.

## Related
- [[Repository Agent Skills (.agents)]]
- [[Design System (Blueprint Press)]]
- [[Blueprint UI Components]]
- [[About This Site Page]]
- [[Home]]
