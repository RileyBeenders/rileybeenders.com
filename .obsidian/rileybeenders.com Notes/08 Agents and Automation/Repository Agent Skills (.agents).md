---
tags: [agents, automation, meta]
---

# Repository Agent Skills (`.agents/`)

`.agents/` holds this repo's own standing instructions for AI coding agents (Claude Code, ChatGPT, or any other tool pointed at this repo). Not `.claude/skills/` — these aren't auto-loaded by Claude Code — but each is packaged in the Anthropic *Agent Skills* layout so a skill-aware tool can register them individually.

```
.agents/
  README.md              # index + the "Repository AI Commands" table
  custom-resume/SKILL.md  # name: custom-resume
  vault-sync/SKILL.md     # name: vault-sync
  sync-charts/SKILL.md    # name: sync-charts
```

Previously this was one file (`.agents/SKILL.md`) bundling all three procedures under a single `name: custom-resume` frontmatter. It was split so each `SKILL.md`'s `name` matches its folder and each file is self-contained (no cross-file anchor links) — which also clears the VS Code skill-lint warnings.

## Format

Each `SKILL.md` is YAML frontmatter (`name` matching the folder, `description` used by a strict loader for triggering) followed by a free-form markdown body. `.agents/README.md` has no frontmatter and is just the human/agent-facing index; GitHub renders it when viewing the folder.

## The three procedures

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

Read the live instructions directly in `.agents/`; the mappings and templates are maintained there, not here.

## Related
- [[Job Application Tracker]]
- [[Resume PDF Pipeline]]
- [[More Info and Gantt Data]]
- [[Home]]
