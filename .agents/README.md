# Repository AI Commands

Standing instructions for **any** AI agent working in this repo (Claude Code, ChatGPT, or anything else). This file is the routing index for everything under `.agents/` — read it first to find which procedure or skill applies before searching further. Each procedure is a self-contained skill in its own folder.

## Repository-specific procedures

| Skill | How it's triggered | What it does |
|---|---|---|
| [`custom-resume`](custom-resume/SKILL.md) | `$custom-resume`, or "create / tailor / revise / regenerate a resume for `<job PDF>`" | Generates and verifies a job-targeted resume PDF from a posting in `2.JobsApplliedTo/`, the live site, and `data/**/*.json`. Prompts for the final page count and which job PDF if either is missing. |
| [`vault-sync`](vault-sync/SKILL.md) | Any change to site code, data, or config in this repo — or "sync the vault" | Updates the Obsidian vault in `.obsidian/rileybeenders.com Notes/` so its notes match the change, in the **same** session, before finishing the task. |
| [`sync-charts`](sync-charts/SKILL.md) | Editing either tracker file, or "sync / check / verify the gantt charts" | Reconciles the Job Application Tracker mermaid `gantt` block + JobID table between `README.md` and `data/more-info/gantt.md`. |
| [`design-guidelines`](design-guidelines/SKILL.md) | Styling or restyling a component, implementing a light/dark toggle (e.g. the Studio theme setting), or asked about design tokens for a mode | Routes to the matching light/dark reference-token file (`design-light.md` / `design-dark.md`) via its own `DESIGN.md` router. Reference material the **Electric** preset was seeded from, not the live design system — that is the repo-root `DESIGN.md` (see **Design context files** below). |
| [`motion-design`](motion-design/SKILL.md) | Before adding, choosing, reviewing, or auditing any animation, hover/cursor effect, scroll effect, or micro-interaction; any mention of svelte-bits / react-bits / "subtle animations" / "make it feel smoother" | The *what and how much* of motion: the site's existing motion inventory, taste rules, numeric subtlety thresholds, a placement-audit procedure, and a rated adopt/adapt/avoid catalog of every svelte-bits component (`references/component-catalog.md`). Entry point of the three motion skills. |
| [`motion-fluidity`](motion-fluidity/SKILL.md) | Writing or editing framer-motion, CSS transitions/keyframes, `useScroll`/`useSpring`, `whileInView`, `AnimatePresence`, springs, staggers, easing; translating a svelte-bits / GSAP / Motion One component into React | The *how*: svelte-bits' five motion grammars (entrance, scroll-linked, pointer proximity, ambient loop, state transition) mapped onto the site's `--ease` / `EASE` / `Reveal` / `useReducedMotion` system, with translation tables (`references/grammar-map.md`) and copy-ready TSX/CSS recipes (`references/recipes.md`). |
| [`motion-layout`](motion-layout/SKILL.md) | Adding or restructuring a section, hero, nav, card grid, list, marquee, tabs/stepper, or any layout that animates as a unit; deciding where layout CSS goes in `blueprint.css` | The *structure*: how svelte-bits' own landing site composes a condensing nav, layered hero, 12-col cadence grid, marquee, cards, popovers, and expandables, each translated to the Blueprint Press shell (`.bp-shell`, `.bp-section-grid`, `PageSpine`, `BpNav`), with the original CSS in `references/svelte-bits-layouts.md`. |
| [`site-timeline-sync`](site-timeline-sync/SKILL.md) | After a meaningful commit or merge; "update the site timeline / about page", "refresh the site stats"; when `/about-this-site` looks stale | Keeps `data/site/about-site.json` current: runs `scripts/site-stats.mjs` to refresh the six stats from git and list commits since the timeline's last entry, adds only KEY commits as brief timeline entries, moves the present marker, promotes/prunes planned items, recaptures screenshots (`scripts/capture-site-screenshots.mjs`) when the UI changed, then hands off to `vault-sync`. |

`vault-sync` and `sync-charts` overlap — `sync-charts` is the chart-only fast path, `vault-sync` covers everything else and picks up after a chart sync when the vault also needs updating.

The three `motion-*` procedures are one set: `motion-design` decides, `motion-fluidity` implements, `motion-layout` composes. They and `site-timeline-sync` are the only repo-specific procedures also registered as first-class Claude Code skills (junctions at `.claude/skills/<name>` → `.agents/<name>`), because they need to trigger automatically on ordinary requests ("add an animation", "update the about page") rather than by name. Their reference source is `DavidHDev/svelte-bits` (MIT + Commons Clause), read directly from GitHub — nothing from it is vendored or installed; the skills carry short attributed excerpts and Blueprint-amplitude translations.

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
| [`impeccable`](skills/impeccable/SKILL.md) | **The design entry point for this repo.** A command set (`critique`, `audit`, `polish`, `typeset`, `layout`, `quieter`, `delight`, `harden`, `adapt`, `document`, …) plus a bundled anti-pattern detector, all reading the repo-root `PRODUCT.md` / `DESIGN.md`. Use it for any design, review, or polish request on the site or the Studio; see **Design context files** below for how it is wired into this repo. Source: `pbakaus/impeccable`. |
| [`industrial-brutalist-ui`](skills/industrial-brutalist-ui/SKILL.md) | Swiss-print + military-terminal aesthetic for data-heavy or editorial UI |
| [`minimalist-ui`](skills/minimalist-ui/SKILL.md) | Clean editorial minimalism, warm monochrome, flat bento grids |
| [`redesign-existing-projects`](skills/redesign-existing-projects/SKILL.md) | Audits and upgrades an existing site's design without breaking functionality |
| [`stitch-design-taste`](skills/stitch-design-taste/SKILL.md) | Semantic `DESIGN.md` generation for Google Stitch |

Thirteen of the 14 come from the `Leonxlnx/taste-skill` GitHub collection; `impeccable` comes from `pbakaus/impeccable` (both per `skills-lock.json`). The `Leonxlnx` set are single-file taste guides; `impeccable` is a full skill folder (`SKILL.md`, `reference/*.md` per command, `scripts/impeccable` launcher with a bundled detector, `agents/*.toml` subagent definitions) and is the one to reach for first on a design task, because it is the only one that reads this repo's own product and design context.

## Design context files

`impeccable` reads three files at the repo root, and every agent doing design work should treat them as authority in this order:

| File | What it holds | Who writes it |
|---|---|---|
| `PRODUCT.md` | Product truth: who visits, what a successful visit is, positioning, operating context, the constraints future work must preserve (resume at rest, every claim traces to data, content edits never touch code, subtle motion, Studio local-only), brand commitments, evidence on hand, principles. Interviewed from Riley on 2026-09-18. | `$impeccable init` (re-run only to update stale product facts; never to pick a look). |
| `DESIGN.md` | The Blueprint Press design system in the Google Stitch DESIGN.md format: YAML frontmatter of real tokens (the active **Electric** preset and the Default fallback, the type roles, radii, spacing, components) then Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts with named rules. The detector compares literal values in CSS against it. | `$impeccable document` (re-run after any token change in `app/(site)/blueprint.css`, `lib/palettes.ts`, or `lib/palette.ts`; it asks before overwriting). |
| `.impeccable/design.json` | The sidecar DESIGN.md's schema cannot hold: tonal ramps, shadow / motion / breakpoint tokens, drop-in HTML+CSS snippets for the nine canonical components, and the narrative (north star, named rules, do's/don'ts) verbatim. `.impeccable/critique/` holds critique snapshots that `$impeccable polish` reads as its backlog. | Regenerated with `DESIGN.md`; critique snapshots by `$impeccable critique`. |

Running it: from the repo root, `sh .agents/skills/impeccable/scripts/impeccable <verb>` (or the `.cmd` launcher from PowerShell). `impeccable context` loads the files above; `impeccable detect --json <files>` is the mechanical scan to run over changed UI files before screenshots or handoff. The vendored copy under `.agents/skills/impeccable/` is the same folder Claude Code sees at `.claude/skills/impeccable` (a junction), so any agent can read the command references as plain files.

Standing outcomes of the 2026-09-18 interview, so no agent re-asks them: the visitor is *everyone* (recruiter, hiring manager, an engineer at the company, family), and the site reads at two depths — the surface for all of them, "Read more" / case studies for the technical reader; success is the visitor reading through most of the site, not a conversion; and design work on the site is **refinement inside Blueprint Press** (layout, monogram, section order, Studio palette/font switching, and fluid motion all stay), never a replacement world. The Studio may change more freely but stays in the same world. If Riley ever wants a new visual world, `impeccable`'s new-work flow (`reference/new-work.md`) runs a direction round with them first; nobody starts one on their own.

Three procedures call into it: `site-timeline-sync` runs the detector before recapturing screenshots, `custom-resume` applies the craft floor to the rendered PDF, and `vault-sync` maps the three files above to their vault notes. `motion-design` stays the authority on *what* moves and *how much*; `$impeccable animate` defers to it here.

**For Claude Code specifically:** every skill listed above is also registered as a first-class Skill under the same name — invoke it directly with the `Skill` tool rather than reading its `skills/<name>/SKILL.md` copy by hand. The copy in this folder is what lets a non-Claude-Code agent (ChatGPT, Codex, etc.) follow the same instructions as a plain file; Claude Code itself should prefer the live `Skill` invocation. The same is true of the repo-specific `motion-*` and `site-timeline-sync` procedures above.

The `.claude/skills/<name>` entries are Windows directory junctions (`mklink /J`, or `New-Item -ItemType Junction` in PowerShell) into `.agents/…`; git stores them as plain file copies (`core.symlinks=false`), so a fresh clone on another machine gets real folders rather than links — recreate the junctions there if you want edits in `.agents/` to flow through.

Related but separate: `.claude/skills/web-design-guidelines` (source: `vercel-labs/agent-skills`, also tracked in `skills-lock.json`) is a UI-guidelines/accessibility compliance-review skill. It hasn't been mirrored into `.agents/skills/` — add it here if a non-Claude-Code agent ever needs it.

## Keeping this file current

This index is only useful if it matches what's on disk. Whenever a new procedure folder is added directly under `.agents/`, or a new skill folder is added under `.agents/skills/` (or `skills-lock.json` gains/loses an entry), add or remove the matching row above **in the same session** — before finishing whatever task added it. Don't let this file drift.

## Format

Each procedure folder holds a `SKILL.md` in the Anthropic *Agent Skills* layout: YAML frontmatter (`name` matching the folder, `description` used for triggering) followed by a free-form markdown body of instructions. A strict skill loader registers each one independently, so `name` must match its own folder exactly and a single `SKILL.md` must describe exactly one skill — this repo previously bundled three procedures into one root `.agents/SKILL.md` and had to split it back apart for exactly that reason (see the vault note below). `.agents/README.md` (this file) intentionally carries no frontmatter, so it's never mistaken for a skill itself — it's the plain-markdown index a human or agent reads first, and the natural place for a repo-wide routing table that a `SKILL.md` can't hold on its own without re-triggering the same problem.

The vault note documenting this folder is `.obsidian/rileybeenders.com Notes/08 Agents and Automation/Repository Agent Skills (.agents).md`.
