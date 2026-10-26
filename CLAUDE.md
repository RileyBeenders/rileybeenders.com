# Repository AI Instructions

Standing instructions for any AI agent working in this repo. This file is the routing index for the skills under `.claude/skills/` — read it first to find which procedure applies before searching further.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Start here: the skill router

Before any non-trivial task, run the load balancer on the user's request to find which skills apply and in what order:

```bash
node .claude/skills/skill-router/scripts/route.mjs "<the request, verbatim>"
```

It scores the request against `.claude/skills/skill-router/registry.json`, applies the repo rules (code change → `vault-sync`, UI work → `impeccable`, motion → `motion-design` first), and prints an ordered plan with guardrails. Skills that would replace the Blueprint Press look (greenfield design, image generation, GSAP-heavy) are marked explicit-only. Its output is a recommendation; override it when it is wrong. See the [`skill-router`](.claude/skills/skill-router/SKILL.md) row below.

## Layout

Every skill, whether written for this repo or vendored from GitHub, lives in exactly one place, tracked by git:

```text
.claude/
  skills/<name>/SKILL.md    one folder per skill, Anthropic Agent Skills layout
  launch.json               dev-server definitions for the browser preview
  settings.local.json       per-machine Claude Code settings
  worktrees/                Claude Code checkouts (git-ignored)
```

Claude Code discovers `.claude/skills/` directly, so every skill below is registered under its own name — invoke it with the `Skill` tool rather than reading its `SKILL.md` by hand. Other agents read the same files as plain markdown. (Until 2026-10-17 the skills lived under `.agents/skills/` with a junction at `.claude/skills`; the `.agents/` folder and `AGENTS.md` are gone and nothing should recreate them.)

## Repository-specific procedures

| Skill | How it's triggered | What it does |
| --- | --- | --- |
| [`custom-resume`](.claude/skills/custom-resume/SKILL.md) | "create / tailor / revise / regenerate a resume for `<job PDF>`" | **Step 1 of the resume chain** (`custom-resume` → `grill-my-resume` → `fix-my-resume`). Generates and verifies a job-targeted resume PDF from a posting in `2.JobsApplliedTo/`, the live site, and `data/**/*.json`; prompts for the final page count and which job PDF if either is missing. Keeps the HTML source in `output/resume-html/` and prints and validates it with its own `scripts/print-resume.mjs` and `scripts/validate-resume.py`. Never repeats a claim to fill a page. |
| [`grill-my-resume`](.claude/skills/grill-my-resume/SKILL.md) | `/grill-my-resume [resume PDF] [job posting PDF or URL]`; "grill / roast / audit / ATS-check my resume" | **Step 2.** Blunt, evidence-first review: ten-second recruiter read, eight-dimension scorecard, role-fit map, line-by-line rewrites, apply/don't-apply verdict. Reviews only; it edits nothing. Renamed from `grill-my-cv` on 2026-10-20. |
| [`fix-my-resume`](.claude/skills/fix-my-resume/SKILL.md) | After a grill, or "fix / apply the review / clean up `<resume PDF>`" with grill output, roast-my-resume report PDFs, or recruiter notes attached | **Step 3.** Triages every finding into apply / needs-a-fact-from-Riley / decline / reviewer-was-wrong, edits the HTML source, reprints, re-validates, and overwrites the PDF under the same name. Carries Riley's standing rules: no repeated claims, no filler, ignore "recent graduate" advice, never invent a number. |
| [`vault-sync`](.claude/skills/vault-sync/SKILL.md) | Any change to site code, data, or config in this repo, or "sync the vault" | Updates the Obsidian vault in `.obsidian/rileybeenders.com Notes/` so its notes match the change, in the **same** session, before finishing the task. |
| [`sync-charts`](.claude/skills/sync-charts/SKILL.md) | Editing either tracker file, or "sync / check / verify the gantt charts" | Reconciles the Job Application Tracker mermaid `gantt` block + JobID table between `README.md` and `data/more-info/gantt.md`. |
| [`design-guidelines`](.claude/skills/design-guidelines/SKILL.md) | Styling or restyling a component, implementing a light/dark toggle (e.g. the Studio theme setting), or asked about design tokens for a mode | Routes to the matching light/dark reference-token file (`design-light.md` / `design-dark.md`) via its own `DESIGN.md` router. Reference material the **Electric** preset was seeded from, not the live design system — that is the repo-root `DESIGN.md` (see **Design context files** below). |
| [`motion-design`](.claude/skills/motion-design/SKILL.md) | Before adding, choosing, reviewing, or auditing any animation, hover/cursor effect, scroll effect, or micro-interaction; any mention of svelte-bits / react-bits / "subtle animations" / "make it feel smoother" | The *what and how much* of motion: the site's existing motion inventory, taste rules, numeric subtlety thresholds, a placement-audit procedure, and a rated adopt/adapt/avoid catalog of every svelte-bits component (`references/component-catalog.md`). Entry point of the three motion skills. |
| [`motion-fluidity`](.claude/skills/motion-fluidity/SKILL.md) | Writing or editing framer-motion, CSS transitions/keyframes, `useScroll`/`useSpring`, `whileInView`, `AnimatePresence`, springs, staggers, easing; translating a svelte-bits / GSAP / Motion One component into React | The *how*: svelte-bits' five motion grammars mapped onto the site's `--ease` / `EASE` / `Reveal` / `useReducedMotion` system, with translation tables (`references/grammar-map.md`) and copy-ready TSX/CSS recipes (`references/recipes.md`). |
| [`motion-layout`](.claude/skills/motion-layout/SKILL.md) | Adding or restructuring a section, hero, nav, card grid, list, marquee, tabs/stepper, or any layout that animates as a unit; deciding where layout CSS goes in `blueprint.css` | The *structure*: how svelte-bits' landing site composes a condensing nav, layered hero, 12-col grid, marquee, cards, popovers, and expandables, each translated to the Blueprint Press shell (`.bp-shell`, `.bp-section-grid`, `PageSpine`, `BpNav`), with the original CSS in `references/svelte-bits-layouts.md`. |
| [`site-timeline-sync`](.claude/skills/site-timeline-sync/SKILL.md) | After a meaningful commit or merge; "update the site timeline / about page", "refresh the site stats"; when `/about-this-site` looks stale — and **automatically after every push to `main`** (`.github/workflows/site-timeline-sync.yml` runs it through Claude Code and commits the result) | Keeps `data/site/about-site.json` current: runs `scripts/site-stats.mjs` to refresh the six stats from git and list commits since the timeline's last entry, adds only KEY commits as brief timeline entries, moves the present marker, promotes/prunes planned items, validates the file (`scripts/check-about-site.mjs`), recaptures screenshots (`scripts/capture-site-screenshots.mjs`) when the UI changed (local runs only), then hands off to `vault-sync`. |
| [`skill-router`](.claude/skills/skill-router/SKILL.md) | Start of any non-trivial task; "which skill should I use", "route this", "load balancer" | The front door. `scripts/route.mjs` ranks every skill against the request using `registry.json` (keywords, phase, gates, rules, chains) and returns an ordered ground → decide → build → verify → ship plan. `--check` verifies the registry against the skill folders and this file; run it whenever a skill is added or removed. |

The three resume procedures are one chain: `custom-resume` builds, `grill-my-resume` reviews, `fix-my-resume` applies the review and re-verifies, each handing to the next in the same session when the user asks for the whole route. `vault-sync` and `sync-charts` overlap: `sync-charts` is the chart-only fast path, `vault-sync` covers everything else and picks up after a chart sync when the vault also needs updating.

The three `motion-*` procedures are one set: `motion-design` decides, `motion-fluidity` implements, `motion-layout` composes. Their reference source is `DavidHDev/svelte-bits` (MIT + Commons Clause), read directly from GitHub; nothing from it is vendored or installed.

## Vendored skill library

Generic, non-repo-specific skills installed from GitHub and tracked in the repo-root `skills-lock.json` (source repo + path in that repo + content hash per skill, so an upstream change is detectable). `skillPath` in the lock is the file's location in its *source* repo, not here. Don't edit these files by hand; it breaks the hash.

| Folder | What it's for |
| --- | --- |
| [`brandkit`](.claude/skills/brandkit/SKILL.md) | Brand-guidelines boards, logo systems, identity decks, visual-world presentations |
| [`design-taste-frontend`](.claude/skills/design-taste-frontend/SKILL.md) | Anti-slop frontend design taste for landing pages, portfolios, redesigns (current default) |
| [`design-taste-frontend-v1`](.claude/skills/design-taste-frontend-v1/SKILL.md) | Frozen v1 of the above, kept only for projects depending on its exact behavior |
| [`full-output-enforcement`](.claude/skills/full-output-enforcement/SKILL.md) | Forces complete, unabridged code generation; bans placeholders/truncation |
| [`gpt-taste`](.claude/skills/gpt-taste/SKILL.md) | UX/UI + advanced GSAP scroll-motion engineering |
| [`high-end-visual-design`](.claude/skills/high-end-visual-design/SKILL.md) | Agency-grade visual-design defaults (fonts, spacing, shadows, card structure) |
| [`image-to-code`](.claude/skills/image-to-code/SKILL.md) | Generates a design reference image first, then implements the page to match it |
| [`imagegen-frontend-mobile`](.claude/skills/imagegen-frontend-mobile/SKILL.md) | Premium mobile app screen/flow concept images |
| [`imagegen-frontend-web`](.claude/skills/imagegen-frontend-web/SKILL.md) | Per-section landing-page design reference images |
| [`impeccable`](.claude/skills/impeccable/SKILL.md) | **The design entry point for this repo.** A command set (`critique`, `audit`, `polish`, `typeset`, `layout`, `quieter`, `delight`, `harden`, `adapt`, `document`, …) plus a bundled anti-pattern detector, all reading the repo-root `PRODUCT.md` / `DESIGN.md`. Use it for any design, review, or polish request on the site or the Studio. Source: `pbakaus/impeccable`. |
| [`industrial-brutalist-ui`](.claude/skills/industrial-brutalist-ui/SKILL.md) | Swiss-print + military-terminal aesthetic for data-heavy or editorial UI |
| [`minimalist-ui`](.claude/skills/minimalist-ui/SKILL.md) | Clean editorial minimalism, warm monochrome, flat bento grids |
| [`redesign-existing-projects`](.claude/skills/redesign-existing-projects/SKILL.md) | Audits and upgrades an existing site's design without breaking functionality |
| [`stitch-design-taste`](.claude/skills/stitch-design-taste/SKILL.md) | Semantic `DESIGN.md` generation for Google Stitch |
| [`web-design-guidelines`](.claude/skills/web-design-guidelines/SKILL.md) | UI-guidelines / accessibility compliance review ("review my UI", "check accessibility"). Source: `vercel-labs/agent-skills`. |

Thirteen come from `Leonxlnx/taste-skill` (single-file taste guides), `impeccable` from `pbakaus/impeccable`, `web-design-guidelines` from `vercel-labs/agent-skills`. `impeccable` is a full skill folder (`SKILL.md`, `reference/*.md` per command, `scripts/impeccable` launcher with a bundled detector, `agents/*.toml` subagent definitions) and is the one to reach for first on a design task, because it is the only one that reads this repo's own product and design context. Its reference files still spell paths as `.agents/skills/impeccable/...` (its upstream default install location); in this repo that always means `.claude/skills/impeccable/...`.

`grill-my-resume` (listed with the repository procedures above because it is one step of the resume chain) came from MCP Market as `grill-my-cv` (`mcpmarket-version: 1.0.0`) rather than GitHub, so it has no `skills-lock.json` entry and `scripts/site-stats.mjs` counts it as a repo procedure. Repo-local edits: the folder and `name` were renamed to `grill-my-resume` on 2026-10-20 and an `argument-hint` was added to its frontmatter; the body is upstream's. When grilling Riley's own resume, the candidate dossier is the live site plus `data/**/*.json`, postings live in `2.JobsApplliedTo/`, and rewrites follow Riley's resume copy rules: one to three sentences per bullet, no mid-sentence em dashes, and no "3D printing" or "additive manufacturing". Its findings go to `fix-my-resume`, never straight back into a rebuild.

## Added skill library (planning, motion, polish, git)

Generic skills added 2026-10-25, tracked in git but not in `skills-lock.json` (no upstream hash). Routing for all of them lives in `skill-router/registry.json`. Where a repo skill covers the same ground, the repo skill wins: `motion-design` decides what moves before any generic motion skill, `impeccable` is the design entry point, and the planning chain never overrides `PRODUCT.md`.

| Folder | What it's for | Repo note |
| --- | --- | --- |
| [`animate`](.claude/skills/animate/SKILL.md) | Build one animation decision-first (purpose, tool, properties, curve, interruption, exit) | Defers to `motion-design` for limits and `motion-fluidity` for `--ease` / `EASE` / `Reveal` |
| [`animation-vocabulary`](.claude/skills/animation-vocabulary/SKILL.md) | Turn "the bouncy thing when a popover opens" into the exact term | Naming only |
| [`apple-design`](.claude/skills/apple-design/SKILL.md) | Apple-style fluid, physical, interruptible interaction and typography | Advisory; stay subtle |
| [`emil-design-eng`](.claude/skills/emil-design-eng/SKILL.md) | Emil Kowalski's UI polish and animation philosophy | Advisory |
| [`find-animation-opportunities`](.claude/skills/find-animation-opportunities/SKILL.md) | Read-only: where motion is missing and worth adding | Filter results through `motion-design` |
| [`improve-animations`](.claude/skills/improve-animations/SKILL.md) | Read-only codebase motion audit with executable plans | Compare against the `motion-design` inventory |
| [`review-animations`](.claude/skills/review-animations/SKILL.md) | Review motion code against a high craft bar | Review only |
| [`mobile-native`](.claude/skills/mobile-native/SKILL.md) | Make the web app feel native on a phone (100vh, tap flash, safe areas) | Fixes only; no redesign |
| [`grill-me`](.claude/skills/grill-me/SKILL.md) | Relentless interview to stress-test a plan | Step 1 of the planning chain |
| [`design-brief`](.claude/skills/design-brief/SKILL.md) | Interview and codebase read into a saved design brief | Planning chain step 2 |
| [`information-architecture`](.claude/skills/information-architecture/SKILL.md) | Navigation, hierarchy, URL patterns, flows before visuals | Planning chain step 3 |
| [`brief-to-tasks`](.claude/skills/brief-to-tasks/SKILL.md) | Brief into an ordered checklist of vertical slices | Planning chain step 4 |
| [`design-review`](.claude/skills/design-review/SKILL.md) | Structured critique against a brief | Without a brief use `impeccable critique` |
| [`design-flow`](.claude/skills/design-flow/SKILL.md) | Runs the whole planning-to-build sequence | Explicit-only; its tokens and frontend phases can drift from Blueprint Press |
| [`design-tokens`](.claude/skills/design-tokens/SKILL.md) | Generate a tokens file from an aesthetic | Explicit-only; root `DESIGN.md` and `blueprint.css` own tokens |
| [`frontend-design`](.claude/skills/frontend-design/SKILL.md) | Build distinctive frontends from named aesthetic philosophies | Explicit-only; refinement inside Blueprint Press instead |
| [`prototype`](.claude/skills/prototype/SKILL.md) | Several genuinely different UI variants behind a live picker | Keep throwaways out of `app/` unless Riley promotes one |
| [`pick-ui-library`](.claude/skills/pick-ui-library/SKILL.md) | Choose a library for a frontend task | Check `package.json` first; avoid new dependencies |
| [`write-commit`](.claude/skills/write-commit/SKILL.md) | GitHub Desktop-ready commit summary and description, in chat | Run `vault-sync` first if code or data changed |
| [`write-merge`](.claude/skills/write-merge/SKILL.md) | PR title/body and merge commit text, in chat | After `vault-sync` |

The vendored skills listed above (`design-taste-frontend`, `gpt-taste`, `redesign-existing-projects`, `brandkit`, `image-to-code`, `imagegen-*`, `minimalist-ui`, `industrial-brutalist-ui`, `high-end-visual-design`, `stitch-design-taste`) are all explicit-only in the router: they push toward a new visual world, which `PRODUCT.md` rules out without a direction round with Riley.

## Design context files

`impeccable` reads three files at the repo root, and every agent doing design work should treat them as authority in this order:

| File | What it holds | Who writes it |
| --- | --- | --- |
| `PRODUCT.md` | Product truth: who visits, what a successful visit is, positioning, operating context, the constraints future work must preserve (resume at rest, every claim traces to data, content edits never touch code, subtle motion, Studio local-only), brand commitments, evidence on hand, principles. Interviewed from Riley on 2026-09-18. | `$impeccable init` (re-run only to update stale product facts; never to pick a look). |
| `DESIGN.md` | The Blueprint Press design system in the Google Stitch DESIGN.md format: YAML frontmatter of real tokens (the active **Electric** preset and the Default fallback, type roles, radii, spacing, components) then Overview / Colors / Typography / Layout / Elevation & Depth / Shapes / Components / Do's and Don'ts with named rules. The detector compares literal values in CSS against it. | `$impeccable document` (re-run after any token change in `app/(site)/blueprint.css`, `lib/palettes.ts`, or `lib/palette.ts`; it asks before overwriting). |
| `.impeccable/design.json` | The sidecar DESIGN.md's schema cannot hold: tonal ramps, shadow / motion / breakpoint tokens, drop-in HTML+CSS snippets for the nine canonical components, and the narrative verbatim. `.impeccable/critique/` holds critique snapshots that `$impeccable polish` reads as its backlog; they are run outputs and git-ignored. | Regenerated with `DESIGN.md`; critique snapshots by `$impeccable critique`. |

Running it: from the repo root, `sh .claude/skills/impeccable/scripts/impeccable <verb>` (or the `.cmd` launcher from PowerShell). `impeccable context` loads the files above; `impeccable detect --json <files>` is the mechanical scan to run over changed UI files before screenshots or handoff.

Standing outcomes of the 2026-09-18 interview, so no agent re-asks them: the visitor is *everyone* (recruiter, hiring manager, an engineer at the company, family), and the site reads at two depths, the surface for all of them and "Read more" / case studies for the technical reader; success is the visitor reading through most of the site, not a conversion; and design work on the site is **refinement inside Blueprint Press** (layout, monogram, section order, Studio palette/font switching, and fluid motion all stay), never a replacement world. The Studio may change more freely but stays in the same world. If Riley ever wants a new visual world, `impeccable`'s new-work flow (`reference/new-work.md`) runs a direction round with them first; nobody starts one on their own.

Three procedures call into it: `site-timeline-sync` runs the detector before recapturing screenshots, `custom-resume` applies the craft floor to the rendered PDF, and `vault-sync` maps the three files above to their vault notes. `motion-design` stays the authority on *what* moves and *how much*; `$impeccable animate` defers to it here.

## Keeping this file current

This index is only useful if it matches what's on disk. Whenever a skill folder is added to or removed from `.claude/skills/` (or `skills-lock.json` gains/loses an entry), add or remove the matching row above **in the same session**, before finishing whatever task added it. `scripts/site-stats.mjs` counts the folders here for the `/about-this-site` stats, and `vault-sync` maps this file and `.claude/skills/**` to the vault note `08 Agents and Automation/Repository Agent Skills.md`.

## Format

Each skill folder holds a `SKILL.md` in the Anthropic *Agent Skills* layout: YAML frontmatter (`name` matching the folder, `description` used for triggering) followed by a free-form markdown body of instructions. A strict skill loader registers each one independently, so `name` must match its own folder exactly and a single `SKILL.md` must describe exactly one skill. This file intentionally carries no frontmatter and lives outside `.claude/skills/`, so it is never mistaken for a skill itself; it is the plain-markdown index a human or agent reads first.
