# Repository AI Commands

Standing instructions for **any** AI agent working in this repo (Claude Code, ChatGPT, or anything else). This file is the routing index for everything under `.agents/` — read it first to find which procedure or skill applies before searching further. Each procedure is a self-contained skill in its own folder.

## Repository-specific procedures

| Skill | How it's triggered | What it does |
|---|---|---|
| [`custom-resume`](custom-resume/SKILL.md) | `$custom-resume`, or "create / tailor / revise / regenerate a resume for `<job PDF>`" | Generates and verifies a job-targeted resume PDF from a posting in `2.JobsApplliedTo/`, the live site, and `data/**/*.json`. Prompts for the final page count and which job PDF if either is missing. |
| [`vault-sync`](vault-sync/SKILL.md) | Any change to site code, data, or config in this repo — or "sync the vault" | Updates the Obsidian vault in `.obsidian/rileybeenders.com Notes/` so its notes match the change, in the **same** session, before finishing the task. |
| [`sync-charts`](sync-charts/SKILL.md) | Editing either tracker file, or "sync / check / verify the gantt charts" | Reconciles the Job Application Tracker mermaid `gantt` block + JobID table between `README.md` and `data/more-info/gantt.md`. |
| [`design-guidelines`](design-guidelines/SKILL.md) | Styling or restyling a component, implementing a light/dark toggle (e.g. the Studio theme setting), or asked about design tokens for a mode | Routes to the matching light/dark reference-token file (`design-light.md` / `design-dark.md`) via `DESIGN.md`. Reference material, not the live design system — see the skill file. |

`vault-sync` and `sync-charts` overlap — `sync-charts` is the chart-only fast path, `vault-sync` covers everything else and picks up after a chart sync when the vault also needs updating.

## Vendored skill library (`skills/`)

`skills/` mirrors a set of generic, non-repo-specific frontend/visual-design skills so any agent — not just Claude Code — can read their instructions as plain files. They're installed from GitHub sources and tracked in the repo-root `skills-lock.json` (source repo + exact file path + content hash per skill, so a change upstream is detectable).

| Folder | What it's for |
|---|---|
| [`brandkit`](skills/brandkit/SKILL.md) | Brand-guidelines boards, logo systems, identity decks, visual-world presentations |
| [`design-taste-frontend`](skills/design-taste-frontend/SKILL.md) | Anti-slop frontend design taste for landing pages, portfolios, redesigns (current default) |
| [`design-taste-frontend-v1`](skills/design-taste-frontend-v1/SKILL.md) | Frozen v1 of the above, kept only for projects depending on its exact behavior |
| [`full-output-enforcement`](skills/full-output-enforcement/SKILL.md) | Forces complete, unabridged code generation — bans placeholders/truncation |
| [`gpt-taste`](skills/gpt-taste/SKILL.md) | UX/UI + advanced GSAP scroll-motion engineering |
| [`high-end-visual-design`](skills/high-end-visual-design/SKILL.md) | Agency-grade visual-design defaults (fonts, spacing, shadows, card structure) |
| [`image-to-code`](skills/image-to-code/SKILL.md) | Generates a design reference image first, then implements the page to match it |
| [`imagegen-frontend-mobile`](skills/imagegen-frontend-mobile/SKILL.md) | Premium mobile app screen/flow concept images |
| [`imagegen-frontend-web`](skills/imagegen-frontend-web/SKILL.md) | Per-section landing-page design reference images |
| [`industrial-brutalist-ui`](skills/industrial-brutalist-ui/SKILL.md) | Swiss-print + military-terminal aesthetic for data-heavy or editorial UI |
| [`minimalist-ui`](skills/minimalist-ui/SKILL.md) | Clean editorial minimalism, warm monochrome, flat bento grids |
| [`redesign-existing-projects`](skills/redesign-existing-projects/SKILL.md) | Audits and upgrades an existing site's design without breaking functionality |
| [`stitch-design-taste`](skills/stitch-design-taste/SKILL.md) | Semantic `DESIGN.md` generation for Google Stitch |

All 13 currently come from the `Leonxlnx/taste-skill` GitHub collection (per `skills-lock.json`).

**For Claude Code specifically:** every skill listed above is also registered as a first-class Skill under the same name — invoke it directly with the `Skill` tool rather than reading its `skills/<name>/SKILL.md` copy by hand. The copy in this folder is what lets a non-Claude-Code agent (ChatGPT, Codex, etc.) follow the same instructions as a plain file; Claude Code itself should prefer the live `Skill` invocation.

Related but separate: `.claude/skills/web-design-guidelines` (source: `vercel-labs/agent-skills`, also tracked in `skills-lock.json`) is a UI-guidelines/accessibility compliance-review skill. It hasn't been mirrored into `.agents/skills/` — add it here if a non-Claude-Code agent ever needs it.

## Keeping this file current

This index is only useful if it matches what's on disk. Whenever a new procedure folder is added directly under `.agents/`, or a new skill folder is added under `.agents/skills/` (or `skills-lock.json` gains/loses an entry), add or remove the matching row above **in the same session** — before finishing whatever task added it. Don't let this file drift.

## Format

Each procedure folder holds a `SKILL.md` in the Anthropic *Agent Skills* layout: YAML frontmatter (`name` matching the folder, `description` used for triggering) followed by a free-form markdown body of instructions. A strict skill loader registers each one independently, so `name` must match its own folder exactly and a single `SKILL.md` must describe exactly one skill — this repo previously bundled three procedures into one root `.agents/SKILL.md` and had to split it back apart for exactly that reason (see the vault note below). `.agents/README.md` (this file) intentionally carries no frontmatter, so it's never mistaken for a skill itself — it's the plain-markdown index a human or agent reads first, and the natural place for a repo-wide routing table that a `SKILL.md` can't hold on its own without re-triggering the same problem.

The vault note documenting this folder is `.obsidian/rileybeenders.com Notes/08 Agents and Automation/Repository Agent Skills (.agents).md`.
