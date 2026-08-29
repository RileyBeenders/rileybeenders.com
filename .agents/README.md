# Repository AI Commands

Standing instructions for **any** AI agent working in this repo (Claude Code, ChatGPT, or anything else). Each procedure is a self-contained skill in its own folder.

| Skill | How it's triggered | What it does |
|---|---|---|
| [`custom-resume`](custom-resume/SKILL.md) | `$custom-resume`, or "create / tailor / revise / regenerate a resume for `<job PDF>`" | Generates and verifies a job-targeted resume PDF from a posting in `2.JobsApplliedTo/`, the live site, and `data/**/*.json`. Prompts for the final page count and which job PDF if either is missing. |
| [`vault-sync`](vault-sync/SKILL.md) | Any change to site code, data, or config in this repo — or "sync the vault" | Updates the Obsidian vault in `.obsidian/rileybeenders.com Notes/` so its notes match the change, in the **same** session, before finishing the task. |
| [`sync-charts`](sync-charts/SKILL.md) | Editing either tracker file, or "sync / check / verify the gantt charts" | Reconciles the Job Application Tracker mermaid `gantt` block + JobID table between `README.md` and `data/more-info/gantt.md`. |

## Format

Each folder holds a `SKILL.md` in the Anthropic *Agent Skills* layout: YAML frontmatter (`name` matching the folder, `description` used for triggering) followed by a free-form markdown body of instructions. A strict skill loader registers each one independently; a plain agent should just read the relevant file top to bottom.

`vault-sync` and `sync-charts` overlap — `sync-charts` is the chart-only fast path, `vault-sync` covers everything else and picks up after a chart sync when the vault also needs updating.

The vault note documenting this folder is `.obsidian/rileybeenders.com Notes/08 Agents and Automation/Repository Agent Skills (.agents).md`.
