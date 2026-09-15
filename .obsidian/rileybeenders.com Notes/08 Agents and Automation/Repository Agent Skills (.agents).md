---
tags: [agents, automation, meta]
---

# Repository Agent Skills (`.agents/`)

`.agents/` holds this repo's own standing instructions for AI coding agents (Claude Code, ChatGPT, or any other tool pointed at this repo). Not `.claude/skills/` — these aren't auto-loaded by Claude Code — but each is packaged in the Anthropic *Agent Skills* layout so a skill-aware tool can register them individually.

```
.agents/
  README.md                    # routing index — the "Repository AI Commands" tables
  custom-resume/SKILL.md       # name: custom-resume
  vault-sync/SKILL.md          # name: vault-sync
  sync-charts/SKILL.md         # name: sync-charts
  design-guidelines/           # name: design-guidelines
    SKILL.md
    DESIGN.md                  # light/dark router
    design-light.md            # Tesla reference system
    design-dark.md             # Bugatti reference system
  skills/                      # vendored, non-repo-specific skills (13 folders) — see README.md
```

Previously this was one file (`.agents/SKILL.md`) bundling all three procedures under a single `name: custom-resume` frontmatter. It was split so each `SKILL.md`'s `name` matches its folder and each file is self-contained (no cross-file anchor links) — which also clears the VS Code skill-lint warnings.

That constraint came up again when a fourth procedure (`design-guidelines`) was added and a single routing entry point was wanted: a root `.agents/SKILL.md` would have hit the same problem, since `.agents` itself isn't a valid skill-name slug for any `name:` to match. Rather than recreate the bundled-file anti-pattern, `.agents/README.md` — which already had no frontmatter and was never subject to that lint rule — became the living routing index instead. It's kept current by hand (see "Keeping this file current" in the file itself) rather than by a strict loader.

## Format

Each `SKILL.md` is YAML frontmatter (`name` matching the folder, `description` used by a strict loader for triggering) followed by a free-form markdown body. `.agents/README.md` has no frontmatter and is just the human/agent-facing index; GitHub renders it when viewing the folder.

## The procedures

### `custom-resume`

Generates a job-targeted resume PDF for a specific posting in `2.JobsApplliedTo/`. In short:

1. **Collects two required inputs** first: final page count (recommended 1) and which job-posting PDF to target. Asks for both in one message if either is missing.
2. Extracts company, title, location, responsibilities, qualifications, and ATS keywords from the posting — preferring the posting's exact wording over `data/home/skills.json`'s when they differ slightly.
3. Builds a **fact-only evidence matrix** from the live site + `data/**/*.json` + relevant source files. Explicitly forbidden from inventing experience; unsupported claims are excluded, not softened.
4. Matches the visual layout/theme of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf` — US Letter portrait, navy headings, Arial, single column, blue underlined clickable contact links.
5. Saves to `output/pdf/RileyBeenders_<Company>_<Job_Title>.pdf`.
6. Validates before delivery: exact page count at `612×792pt`, visual inspection for clipping/overlap, working phone/email/website/LinkedIn link annotations, all links blue+underlined, supported keywords present and unsupported claims absent.

Can parallelize job analysis, evidence auditing, and content strategy across subagents, but keeps final writing/PDF generation/approval with the primary agent.

### `vault-sync`

Keeps **this entire Obsidian vault** current whenever the website changes — through any agent that reads this repo's instructions. It tells any agent that touches site code, data, or config to check whether the corresponding vault note(s) need updating in the **same session**, using a **file → note mapping table** keyed to the current `main` tree (`app/(site)/` route group, `app/base.css` + `app/(site)/blueprint.css` styling, `components/blueprint/*`). It also holds the exact section template every `06 Job Search Tracking/Applications/` page follows, the `PDF Referenced` GitHub-URL rules, and the "keep the **Now** section current" rules for those pages.

The full vault was re-synced to `main` after the Blueprint Press reskin: the `02 Components/` notes became [[Blueprint Nav and Mark]], [[Blueprint UI Components]], [[GanttChart JobsTable and gantt.ts]] and [[Projects Route (BpComingSoon)]]; the styling note became [[Design System (Blueprint Press)]]; every Overview / Routes / Data Layer / Pipeline note was rewritten. The mapping table in `vault-sync/SKILL.md` points at the current filenames.

### `sync-charts`

A narrower, chart-only counterpart to `vault-sync`. The Job Application Tracker's mermaid `gantt` block + JobID table lives in **two** hand-maintained places — `README.md` (under `## Job Application Tracker`, between that heading and the next `***`) and `data/more-info/gantt.md` (standalone, nothing else in the file) — with no code-level link, so they drift if only one is edited. This procedure: extract both blocks, compare exactly, and if they differ copy the more-recently-edited version over the other (uncommitted edits always win over commits), then deliver an itemized revision report. See [[More Info and Gantt Data]] for the drift history.

### `design-guidelines`

Points at two reference design-token systems (`design-light.md` — Tesla; `design-dark.md` — Bugatti, both sourced verbatim from an external reference collection) via a router file, `DESIGN.md`, so a light/dark component build pulls tokens from the matching file without mixing the two. Triggers on any styling/restyling task, or building the light/dark toggle for the in-progress Studio theme setting. These are **not** the live design system — that's [[Design System (Blueprint Press)]] — they're reference material for future theme-aware work. This folder previously lived at `design/DESIGN.md` + `design/design-dark.md` + `design/design-light.md`; it moved here so it's discoverable the same way the other procedures are, and so its relative links (`DESIGN.md` → `design-light.md`/`design-dark.md`) travel together as one unit.

## Vendored skill library (`.agents/skills/`)

Separate from the four procedures above: `.agents/skills/` holds 13 generic (non-repo-specific) frontend/visual-design skills mirrored from the `Leonxlnx/taste-skill` GitHub collection, tracked in the repo-root `skills-lock.json` (source repo, exact file path, and content hash per skill). They cover brand-kit boards, image-generation-driven frontend design, several named "taste" aesthetics (minimalist, industrial-brutalist, high-end-visual-design, gpt-taste), image-to-code, and a Stitch-specific `DESIGN.md` generator. The full list with one-line descriptions lives in `.agents/README.md` and is meant to be kept current there whenever a skill is added or removed — this note only records that the folder exists and why.

The same 13 (plus an unrelated accessibility/compliance skill, `web-design-guidelines`, from a different source) are also registered as first-class Claude Code skills. `.agents/skills/` exists so a non-Claude-Code agent can read the same instructions as plain files; Claude Code itself should invoke them directly by name via its `Skill` tool rather than reading the copy here.

Read the live instructions directly in `.agents/`; the mappings and templates are maintained there, not here.

## Related
- [[Job Application Tracker]]
- [[Resume PDF Pipeline]]
- [[More Info and Gantt Data]]
- [[Design System (Blueprint Press)]]
- [[Home]]
