---
tags: [agents, automation, meta]
---

# Repository Agent Skills

Every skill in this repo, repo-specific or vendored, lives in one place, `.claude/skills/<name>/SKILL.md`, tracked by git, in the Anthropic *Agent Skills* layout. Claude Code discovers that folder directly, so each one is a first-class skill invoked by name through the `Skill` tool; any other agent reads the same `SKILL.md` as plain markdown. The routing index is the repo-root `CLAUDE.md` (a table of the repo-specific procedures, a table of the vendored library, and the design-context file order); it has no frontmatter and lives outside `.claude/skills/`, so it is never mistaken for a skill. It also carries the Next.js managed agent-rules block that `next dev` re-adds, kept verbatim. There is no `.agents/` folder, no `AGENTS.md`, and no junction.

```
CLAUDE.md                      # routing index + Next.js agent-rules block (repo root)
.claude/
  launch.json                  # preview-server definitions for the Claude desktop app (tracked)
  settings.local.json          # per-machine Claude Code settings
  worktrees/                   # Claude Code checkouts, git-ignored
  skills/                      # every skill, one folder each (25 as of 2026-10-20)
    custom-resume/             # name: custom-resume — step 1 of the resume chain
      SKILL.md
      scripts/print-resume.mjs   # HTML → PDF (repo playwright-core + local Chromium), one spacing multiplier
      scripts/validate-resume.py # page count/size, fill, link styling, letter-spaced headings, repeated claims
    grill-my-resume/SKILL.md   # name: grill-my-resume — step 2, the review (from MCP Market as grill-my-cv; not in skills-lock.json)
    fix-my-resume/SKILL.md     # name: fix-my-resume — step 3, applies a review to output/resume-html/*.html and reprints
    vault-sync/SKILL.md        # name: vault-sync
    sync-charts/SKILL.md       # name: sync-charts
    design-guidelines/         # name: design-guidelines
      SKILL.md
      DESIGN.md                # light/dark router
      design-light.md          # Tesla reference system
      design-dark.md           # Bugatti reference system
    motion-design/             # name: motion-design — what to animate, how much
      SKILL.md
      references/component-catalog.md
    motion-fluidity/           # name: motion-fluidity — how to build it (framer-motion + CSS)
      SKILL.md
      references/grammar-map.md
      references/recipes.md
    motion-layout/             # name: motion-layout — nav / hero / grid / card composition
      SKILL.md
      references/svelte-bits-layouts.md
    site-timeline-sync/SKILL.md# name: site-timeline-sync — keeps /about-this-site current
    impeccable/                # vendored design entry point: SKILL.md, reference/<command>.md, scripts/impeccable (+ detector), agents/*.toml
    <14 more vendored>/        # brandkit, design-taste-frontend(-v1), …, web-design-guidelines — see CLAUDE.md
```

**History.** From 2026-09-19 to 2026-10-17 the skills lived in `.agents/skills/<name>/SKILL.md` (the cross-tool Agent Skills location, with a routing index at `.agents/README.md`) and `.claude/skills` was a git-ignored Windows directory junction to it, because Claude Code only looks in `.claude/skills/`; every fresh clone and the CI runner had to recreate the junction. On 2026-10-17 the skills moved to `.claude/skills/`, the junction, `.agents/README.md` and `AGENTS.md` were removed, and the routing index became the repo-root `CLAUDE.md`. Before 2026-09-19 the repo-specific procedures were a single bundled `.agents/SKILL.md` under one `name: custom-resume` frontmatter; it was split so each `SKILL.md`'s `name` matches its folder and each file is self-contained, which also cleared the VS Code skill-lint warnings. The index could never be a root `SKILL.md` for the same reason, so it stays a plain, frontmatter-less file kept current by hand (see "Keeping this file current" in `CLAUDE.md`).

## Format

Each `SKILL.md` is YAML frontmatter (`name` matching the folder, `description` used by a strict loader for triggering) followed by a free-form markdown body. `CLAUDE.md` has no frontmatter and is just the human/agent-facing index.

## The procedures
### `custom-resume`

Generates a job-targeted resume PDF for a specific posting in `2.JobsApplliedTo/`. In short:

1. **Collects two required inputs** first: final page count (recommended 1) and which job-posting PDF to target. Asks for both in one message if either is missing.
2. Extracts company, title, location, responsibilities, qualifications, and ATS keywords from the posting — preferring the posting's exact wording over `data/home/skills.json`'s when they differ slightly.
3. Builds a **fact-only evidence matrix** from the live site + `data/**/*.json` + relevant source files. Explicitly forbidden from inventing experience; unsupported claims are excluded, not softened.
   Then fills the requested pages **without ever repeating a claim** (Riley's rule of 2026-10-20: each fact, metric, machine, or project appears once; a Selected Projects entry may only carry a project no experience bullet already describes; the summary is a short value statement with no metrics and no title recital; skills follow the bullets; Education stays last with its real date and never gains "recent graduate", a GPA, or coursework; certifications go one per line; a relocation line appears when the job is on-site elsewhere and `header.json` says `openToRelocation`). It adds supported content first (more `experience.json` bullets, per-role Filament Innovations entries, projects not already covered, more relevant experience, the certification list), then tunes all vertical gaps together with one spacing multiplier (`--m`, about 0.8x–1.3x the reference). It never shrinks body text or pads with filler; if supported evidence runs out, the last page ends short and the summary says so. Multi-page resumes put their margins in `@page` and keep headings with their first bullet.
4. Matches the visual layout/theme of `output/pdf/Riley_Beenders_Disney_Principal_Ride_Control_Software_Engineer_Resume_v2.pdf` — US Letter portrait, navy headings, Arial, single column, blue underlined clickable contact links.
5. Saves to `output/pdf/RileyBeenders_<Company>_<Job_Title>.pdf`, with the HTML source beside it in `output/resume-html/`, printed by the skill's own `scripts/print-resume.mjs`.
6. Validates before delivery with `scripts/validate-resume.py`: exact page count at `612×792pt`, measured page fill (reported in the summary), visual inspection of rendered pages for clipping/overlap, working phone/email/website/LinkedIn link annotations, all links blue+underlined and no blue text that is not a link, headings that extract as plain words, no eight-word fragment appearing twice, supported keywords present and unsupported claims absent.
7. Hands off: offers `grill-my-resume` on the result, whose findings `fix-my-resume` applies.

Can parallelize job analysis, evidence auditing, and content strategy across subagents, but keeps final writing/PDF generation/approval with the primary agent.

### `grill-my-resume` and `fix-my-resume`

Steps 2 and 3 of the resume chain, both added 2026-10-20. **`grill-my-resume`** is the MCP Market skill `grill-my-cv` (`mcpmarket-version: 1.0.0`) renamed, so it has no `skills-lock.json` entry and `site-stats.mjs` counts it as a procedure; the body is upstream's and the only repo-local edits are the folder/`name` and an `argument-hint`. It runs as `/grill-my-resume [resume PDF] [job posting PDF or URL]` and delivers a ten-second recruiter read, an eight-dimension scorecard, a role-fit map that separates hard blockers from learnable gaps, line-by-line rewrites that never invent facts, and an apply / fix-then-apply / don't-apply verdict. It reviews only.

**`fix-my-resume`** takes that review (or external reports the user attaches, such as roast-my-resume result PDFs, or recruiter notes), triages every finding into *apply* (supported by `data/**/*.json` or the site), *needs a fact from Riley* (asked as a question, never written as a placeholder into the PDF), *decline* (conflicts with a standing rule or the evidence), or *reviewer was wrong* (an automated roast reading extracted text misses bold labels and layout), then edits the HTML source in `output/resume-html/`, reprints with `print-resume.mjs`, re-validates with `validate-resume.py`, and overwrites the PDF under the same name so tracker and vault links stay valid. Its standing rules, which also bind the build, are Riley's: never repeat a claim to fill a page (a short last page is the correct outcome), ignore "recent graduate" advice (Riley worked through college; Education stays last with its real date), never invent a metric, baseline, standard, tool, or team size, keep the summary a value statement rather than a hat list, let skills follow the bullets, explain an acquisition once, and carry a relocation line when the job is on-site elsewhere. The first run (2026-10-20, the Disney Sr Controls Engineer resume, application 022 in progress) removed a duplicated Selected Projects section, moved PLCs out of first position in the skills line because no bullet showed PLC work, added the relocation line, split certifications one per line, and cut heading letter-spacing so ATS extraction reads whole words.

### `vault-sync`

Keeps **this entire Obsidian vault** current whenever the website changes — through any agent that reads this repo's instructions. It tells any agent that touches site code, data, or config to check whether the corresponding vault note(s) need updating in the **same session**, using a **file → note mapping table** keyed to the current `main` tree (`app/(site)/` route group, `app/base.css` + `app/(site)/blueprint.css` styling, `components/blueprint/*`). It also holds the exact section template every `06 Job Search Tracking/Applications/` page follows, the `PDF Referenced` GitHub-URL rules, and the "keep the **Now** section current" rules for those pages.

The full vault was re-synced to `main` after the Blueprint Press reskin: the `02 Components/` notes became [[Blueprint Nav and Mark]], [[Blueprint UI Components]], [[GanttChart JobsTable and gantt.ts]] and [[Projects Route (BpComingSoon)]]; the styling note became [[Design System (Blueprint Press)]]; every Overview / Routes / Data Layer / Pipeline note was rewritten. The mapping table in `vault-sync/SKILL.md` points at the current filenames.

### `sync-charts`

A narrower, chart-only counterpart to `vault-sync`. The Job Application Tracker's Status Key + mermaid `gantt` block + tracker table lives in **two** hand-maintained places — `README.md` (under `## Job Application Tracker`, between that heading and the next `***`) and `data/more-info/gantt.md` (standalone, nothing else in the file besides that block) — with no code-level link, so they drift if only one is edited. This procedure: extract both blocks, compare exactly, and if they differ copy the more-recently-edited version over the other (uncommitted edits always win over commits), then deliver an itemized revision report. See [[More Info and Gantt Data]] for the drift history.

### `design-guidelines`

Points at two reference design-token systems (`design-light.md` — Tesla; `design-dark.md` — Bugatti, both sourced verbatim from an external reference collection) via a router file, `DESIGN.md`, so a light/dark component build pulls tokens from the matching file without mixing the two. Triggers on any styling/restyling task, or building the light/dark toggle for the in-progress Studio theme setting. These are **not** the live design system — that's [[Design System (Blueprint Press)]], specified machine-readably in the repo-root `DESIGN.md` (see [[Impeccable Design Workflow]]) — they're the reference material the Electric preset was seeded from. The skill file and the router now both say so, since the folder's `DESIGN.md` was being mistaken for the site's own. This folder previously lived at `design/DESIGN.md` + `design/design-dark.md` + `design/design-light.md`; it moved into the skills folder so it's discoverable the same way the other procedures are, and so its relative links (`DESIGN.md` → `design-light.md`/`design-dark.md`) travel together as one unit.

### `motion-design`, `motion-fluidity`, `motion-layout`

One set of three, added 2026-09-17, distilled from the `DavidHDev/svelte-bits` component library (MIT + Commons Clause) as the reference for fluid, polished motion — then translated into the site's own restrained system rather than copied. Nothing from svelte-bits is vendored or installed (no `gsap`, `lenis`, `three`, `ogl`, `motion`); the skills carry short attributed excerpts, the numbers each effect ships with, and Blueprint-amplitude equivalents built on the site's existing `framer-motion` + `blueprint.css` conventions (`--ease` / `EASE`, `Reveal`, the `220/34/0.4` spring, `useReducedMotion` branches).

- **`motion-design`** is the entry point — *what* to animate and *how much*. It inventories what already moves on the site (so nothing gets duplicated), states the taste rules (motion explains structure; one hand; amplitude halved on paper; pointer effects are for pointers; nothing pins), gives numeric subtlety thresholds per motion type, and lays out a placement-audit procedure for broad "add subtle animations" requests. Its `references/component-catalog.md` rates all ~130 svelte-bits components **adopt / adapt / avoid** for this site with a one-line Blueprint translation each (the whole Backgrounds category is *avoid*; the borrowable set is Animated/Fade Content, Blur/Split Text, Scroll Reveal, Count Up, Magnet, Spotlight Card, Tilted Card at ≤4°, the navbar's condense-on-scroll and sliding highlight, the Stepper height pattern).
- **`motion-fluidity`** is the *how*. It names svelte-bits' five motion grammars (entrance on view, scroll-linked, pointer proximity, ambient loop, state transition) and maps each to framer-motion 12 + CSS as this codebase already uses them, with GSAP→framer, ScrollTrigger→`useScroll`, Motion One→framer-motion, and Svelte→React translation tables and an implementation checklist. `references/grammar-map.md` documents each borrow-worthy component's mechanism and numbers; `references/recipes.md` has complete TSX/CSS for `Reveal` extensions, `WordReveal`, `ScrollWords`, a CSS stagger hook, `Magnet`, `Spotlight`, `Tilt`, `CountUp`, `Marquee`, `Shine`, `Expandable`, `SlidingHighlight`, and a condensing `BpNav`.
- **`motion-layout`** is the *structure*. svelte-bits' own landing site (`src/lib/components/landing/`) is where its composition lives — a nav that condenses at `scrollY > 50`, a hero in z-layers with an eased SVG fade mask, a 12-column feature grid whose cards reveal on a 70ms cadence, marquee rows, card anatomy, popovers, the Stepper's measured-height wrapper. Each is stated with its numbers and translated onto the Blueprint Press shell (`.bp-shell`, `.bp-section-grid`, `PageSpine`, `BpNav`, the single 860px breakpoint), plus a procedure for a new animated section. `references/svelte-bits-layouts.md` holds the original CSS.

All ten repo-specific procedures are first-class Claude Code skills, found directly in `.claude/skills/`. That matters most for the motion set: they need to fire on ordinary requests like "add a hover to the pills", not only when invoked by name. Both `motion-fluidity` and `motion-layout` end by requiring a `vault-sync` pass, since motion work touches `components/` and `blueprint.css`, which map to [[Blueprint UI Components]] and [[Design System (Blueprint Press)]].

### `site-timeline-sync`

Added 2026-09-17 with the [[About This Site Page]]. Keeps `data/site/about-site.json` honest as the repository grows (its shape table marks the page-copy keys added 2026-09-26, `meta`, `outro` and the deep-dive headings, as Riley's copy to leave alone): run `node scripts/site-stats.mjs` (six stats from git and the repo, plus every commit since the timeline's last hashed entry with key-commit candidates and JSON skeletons), `--write` the stats, decide which commits are *key* (design direction, capability, agent layer, or goal — several small commits become one entry; big asset drops don't count), write brief entries in the existing voice, move the single `present` entry to `past` when its work lands, promote or prune `future` items, fix any prose the change made untrue, recapture screenshots with `scripts/capture-site-screenshots.mjs` when the UI changed (both themes, since the page inverts them against the visitor's theme), keep the Behind-the-site demos' data honest (real resume lines, the current skill list), validate the file with `scripts/check-about-site.mjs`, verify on `/about-this-site` in both themes, then `vault-sync`. The rule it exists to enforce: the timeline is curated, not a changelog — if ten commits were polish, zero new entries is correct and the stats strip carries the work.

**It also runs by itself.** Since 2026-09-19, `.github/workflows/site-timeline-sync.yml` runs this procedure through Claude Code (`anthropics/claude-code-action@v1`) on a GitHub runner after every push to `main` (and on demand via *Run workflow*) — in two stages, since the action refuses the `push` event: the push re-launches the workflow as a `workflow_dispatch` run, and that run is where Claude works. The runner needs no setup for skill discovery (the skills are tracked in `.claude/skills/`, where Claude Code finds them on a plain checkout); it prints the stats report, then hands Claude a fixed prompt that points at the skill's **Unattended runs** section: refresh the stats, read the new commits, add an entry only for a genuinely key one, move the present marker, update the About-page vault note — never screenshots, servers, commits, or any other file. The workflow, not Claude, then validates the JSON and commits what changed as `github-actions[bot]` ("Update the site timeline after \<sha\>" or "Refresh the site stats after \<sha\>"); the commit is pushed with the workflow's own token, which never fires the `push` trigger, so there is no loop. It needs one repository secret, `CLAUDE_CODE_OAUTH_TOKEN` (from `claude setup-token`; an `ANTHROPIC_API_KEY` is the alternative), costs one short Claude session per push, and produces a bot commit on most pushes because the commit count itself is a stat. See [[Build Tooling and Config]].

## Vendored skill library (`.claude/skills/`)

Alongside the ten procedures above, `.claude/skills/` holds 15 generic (non-repo-specific) skills tracked in the repo-root `skills-lock.json` (source repo, exact file path, and content hash per skill). Thirteen are single-file taste guides mirrored from the `Leonxlnx/taste-skill` GitHub collection — brand-kit boards, image-generation-driven frontend design, several named "taste" aesthetics (minimalist, industrial-brutalist, high-end-visual-design, gpt-taste), image-to-code, and a Stitch-specific `DESIGN.md` generator. The fourteenth, **`impeccable`** (from `pbakaus/impeccable`, added 2026-09-18), is a full skill folder with a command set, a launcher, a bundled anti-pattern detector, and subagent definitions, and it is the one design skill that reads this repo's own `PRODUCT.md` / `DESIGN.md`; it is the entry point for design work and has its own note, [[Impeccable Design Workflow]]. The full list with one-line descriptions lives in the repo-root `CLAUDE.md` and is meant to be kept current there whenever a skill is added or removed — this note only records that the folder exists and why.

The fifteenth, `web-design-guidelines` (from `vercel-labs/agent-skills`), is an accessibility/compliance review skill that had lived only under `.claude/skills/` until the 2026-09-19 consolidation moved it to `.agents/skills/`; the 2026-10-17 move put every skill back in `.claude/skills/`. All fifteen are first-class Claude Code skills; Claude Code should invoke them by name via its `Skill` tool, while any other agent reads the same `SKILL.md` as a plain file.

`grill-my-resume` also came from outside GitHub (MCP Market) and has no lock entry; it is documented with the procedures above because it is one step of the resume chain.

Read the live instructions directly in `.claude/skills/` and `CLAUDE.md`; the mappings and templates are maintained there, not here.

## Related
- [[Job Application Tracker]]
- [[Resume PDF Pipeline]]
- [[More Info and Gantt Data]]
- [[Design System (Blueprint Press)]]
- [[Home]]
