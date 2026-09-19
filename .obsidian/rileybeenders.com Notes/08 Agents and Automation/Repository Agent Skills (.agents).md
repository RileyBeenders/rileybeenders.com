---
tags: [agents, automation, meta]
---

# Repository Agent Skills (`.agents/`)

`.agents/` holds this repo's own standing instructions for AI coding agents (Claude Code, ChatGPT, or any other tool pointed at this repo). Most of these aren't auto-loaded by Claude Code (that's `.claude/skills/`), but each is packaged in the Anthropic *Agent Skills* layout so a skill-aware tool can register them individually. The three `motion-*` procedures and `site-timeline-sync` are the exceptions — they're junctioned into `.claude/skills/` so they trigger automatically (see below).

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
  motion-design/               # name: motion-design — what to animate, how much
    SKILL.md
    references/component-catalog.md
  motion-fluidity/             # name: motion-fluidity — how to build it (framer-motion + CSS)
    SKILL.md
    references/grammar-map.md
    references/recipes.md
  motion-layout/               # name: motion-layout — nav / hero / grid / card composition
    SKILL.md
    references/svelte-bits-layouts.md
  site-timeline-sync/SKILL.md  # name: site-timeline-sync — keeps /about-this-site current
  skills/                      # vendored, non-repo-specific skills (14 folders) — see README.md
    impeccable/                # the design entry point: SKILL.md, reference/<command>.md, scripts/impeccable (+ detector), agents/*.toml
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

Points at two reference design-token systems (`design-light.md` — Tesla; `design-dark.md` — Bugatti, both sourced verbatim from an external reference collection) via a router file, `DESIGN.md`, so a light/dark component build pulls tokens from the matching file without mixing the two. Triggers on any styling/restyling task, or building the light/dark toggle for the in-progress Studio theme setting. These are **not** the live design system — that's [[Design System (Blueprint Press)]], specified machine-readably in the repo-root `DESIGN.md` (see [[Impeccable Design Workflow]]) — they're the reference material the Electric preset was seeded from. The skill file and the router now both say so, since the folder's `DESIGN.md` was being mistaken for the site's own. This folder previously lived at `design/DESIGN.md` + `design/design-dark.md` + `design/design-light.md`; it moved here so it's discoverable the same way the other procedures are, and so its relative links (`DESIGN.md` → `design-light.md`/`design-dark.md`) travel together as one unit.

### `motion-design`, `motion-fluidity`, `motion-layout`

One set of three, added 2026-09-17, distilled from the `DavidHDev/svelte-bits` component library (MIT + Commons Clause) as the reference for fluid, polished motion — then translated into the site's own restrained system rather than copied. Nothing from svelte-bits is vendored or installed (no `gsap`, `lenis`, `three`, `ogl`, `motion`); the skills carry short attributed excerpts, the numbers each effect ships with, and Blueprint-amplitude equivalents built on the site's existing `framer-motion` + `blueprint.css` conventions (`--ease` / `EASE`, `Reveal`, the `220/34/0.4` spring, `useReducedMotion` branches).

- **`motion-design`** is the entry point — *what* to animate and *how much*. It inventories what already moves on the site (so nothing gets duplicated), states the taste rules (motion explains structure; one hand; amplitude halved on paper; pointer effects are for pointers; nothing pins), gives numeric subtlety thresholds per motion type, and lays out a placement-audit procedure for broad "add subtle animations" requests. Its `references/component-catalog.md` rates all ~130 svelte-bits components **adopt / adapt / avoid** for this site with a one-line Blueprint translation each (the whole Backgrounds category is *avoid*; the borrowable set is Animated/Fade Content, Blur/Split Text, Scroll Reveal, Count Up, Magnet, Spotlight Card, Tilted Card at ≤4°, the navbar's condense-on-scroll and sliding highlight, the Stepper height pattern).
- **`motion-fluidity`** is the *how*. It names svelte-bits' five motion grammars (entrance on view, scroll-linked, pointer proximity, ambient loop, state transition) and maps each to framer-motion 12 + CSS as this codebase already uses them, with GSAP→framer, ScrollTrigger→`useScroll`, Motion One→framer-motion, and Svelte→React translation tables and an implementation checklist. `references/grammar-map.md` documents each borrow-worthy component's mechanism and numbers; `references/recipes.md` has complete TSX/CSS for `Reveal` extensions, `WordReveal`, `ScrollWords`, a CSS stagger hook, `Magnet`, `Spotlight`, `Tilt`, `CountUp`, `Marquee`, `Shine`, `Expandable`, `SlidingHighlight`, and a condensing `BpNav`.
- **`motion-layout`** is the *structure*. svelte-bits' own landing site (`src/lib/components/landing/`) is where its composition lives — a nav that condenses at `scrollY > 50`, a hero in z-layers with an eased SVG fade mask, a 12-column feature grid whose cards reveal on a 70ms cadence, marquee rows, card anatomy, popovers, the Stepper's measured-height wrapper. Each is stated with its numbers and translated onto the Blueprint Press shell (`.bp-shell`, `.bp-section-grid`, `PageSpine`, `BpNav`, the single 860px breakpoint), plus a procedure for a new animated section. `references/svelte-bits-layouts.md` holds the original CSS.

These three, plus `site-timeline-sync`, are the only repo-specific procedures also registered as first-class Claude Code skills, via junctions `.claude/skills/<name>` → `.agents/<name>` (same mechanism as the vendored library below). That's deliberate: they need to fire on ordinary requests like "add a hover to the pills", not only when invoked by name. Both `motion-fluidity` and `motion-layout` end by requiring a `vault-sync` pass, since motion work touches `components/` and `blueprint.css`, which map to [[Blueprint UI Components]] and [[Design System (Blueprint Press)]].

### `site-timeline-sync`

Added 2026-09-17 with the [[About This Site Page]]. Keeps `data/site/about-site.json` honest as the repository grows: run `node scripts/site-stats.mjs` (six stats from git and the repo, plus every commit since the timeline's last hashed entry with key-commit candidates and JSON skeletons), `--write` the stats, decide which commits are *key* (design direction, capability, agent layer, or goal — several small commits become one entry; big asset drops don't count), write brief entries in the existing voice, move the single `present` entry to `past` when its work lands, promote or prune `future` items, fix any prose the change made untrue, recapture screenshots with `scripts/capture-site-screenshots.mjs` when the UI changed (both themes, since the page inverts them against the visitor's theme), keep the Behind-the-site demos' data honest (real resume lines, the current skill list), verify on `/about-this-site` in both themes, then `vault-sync`. The rule it exists to enforce: the timeline is curated, not a changelog — if ten commits were polish, zero new entries is correct and the stats strip carries the work.

## Vendored skill library (`.agents/skills/`)

Separate from the eight procedures above: `.agents/skills/` holds 14 generic (non-repo-specific) frontend/visual-design skills tracked in the repo-root `skills-lock.json` (source repo, exact file path, and content hash per skill). Thirteen are single-file taste guides mirrored from the `Leonxlnx/taste-skill` GitHub collection — brand-kit boards, image-generation-driven frontend design, several named "taste" aesthetics (minimalist, industrial-brutalist, high-end-visual-design, gpt-taste), image-to-code, and a Stitch-specific `DESIGN.md` generator. The fourteenth, **`impeccable`** (from `pbakaus/impeccable`, added 2026-09-18), is a full skill folder with a command set, a launcher, a bundled anti-pattern detector, and subagent definitions, and it is the one design skill that reads this repo's own `PRODUCT.md` / `DESIGN.md`; it is the entry point for design work and has its own note, [[Impeccable Design Workflow]]. The full list with one-line descriptions lives in `.agents/README.md` and is meant to be kept current there whenever a skill is added or removed — this note only records that the folder exists and why.

The same 14 (plus an unrelated accessibility/compliance skill, `web-design-guidelines`, from a different source) are also registered as first-class Claude Code skills. `.agents/skills/` exists so a non-Claude-Code agent can read the same instructions as plain files; Claude Code itself should invoke them directly by name via its `Skill` tool rather than reading the copy here.

Read the live instructions directly in `.agents/`; the mappings and templates are maintained there, not here.

## Related
- [[Job Application Tracker]]
- [[Resume PDF Pipeline]]
- [[More Info and Gantt Data]]
- [[Design System (Blueprint Press)]]
- [[Home]]
