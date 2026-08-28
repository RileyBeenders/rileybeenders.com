---
tags: [agents, automation, meta]
---

# Repository Skills (`.agents/SKILL.md`)

`.agents/SKILL.md` is this repo's own instruction file for AI coding agents (Claude Code, ChatGPT, or any other tool pointed at this repo) — not a Claude-Code-loaded project skill in the usual `.claude/skills/` sense, just a plain markdown file of standing procedures that any assistant working in this repo is expected to read and follow. It currently holds two skills.

## `custom-resume`

Generates a job-targeted resume PDF for a specific posting in `JobsAppliedTo/`. Summary (see [[Job Application Tracker]] for the produced-file mapping):

1. **Collects two required inputs** before doing anything: final page count (recommended 1) and which job-posting PDF to target. Asks for both in one message if either is missing.
2. Extracts company, title, location, responsibilities, qualifications, and ATS keywords from the posting — preferring the posting's exact wording over `data/skills.json`'s wording when they differ slightly.
3. Builds a **fact-only evidence matrix** from the live site + `data/*.json` + relevant source files. Explicitly forbidden from inventing experience; unsupported claims are excluded, not softened into truth.
4. Matches the visual layout/theme of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf` — US Letter portrait, navy headings, Arial, single column, blue underlined clickable contact links.
5. Saves to `output/pdf/RileyBeenders_<Company>_<Job_Title>.pdf`.
6. Validates before delivery: exact page count at `612×792pt`, visual inspection for clipping/overlap, working phone/email/website/LinkedIn link annotations, all links blue+underlined, supported keywords present and unsupported claims absent.

Can parallelize job analysis, evidence auditing, and content strategy across subagents, but keeps final writing/PDF generation/approval with the primary agent.

## Vault sync (this vault's self-updating skill)

The second skill in `.agents/SKILL.md` is what keeps **this entire Obsidian vault** (`.obsidian/rileybeenders.com Notes/`) current whenever the website changes — through Claude Code, ChatGPT, or any other agent that reads this repo's instructions. Read the live instructions directly in `.agents/SKILL.md`; in short, it tells any agent that touches site code, data, or config to check whether the corresponding vault note(s) need updating in the same session, using this vault's own folder structure (see [[Home]]) as the map of what covers what.

## Related
- [[Job Application Tracker]]
- [[Resume PDF Pipeline]]
- [[Home]]
