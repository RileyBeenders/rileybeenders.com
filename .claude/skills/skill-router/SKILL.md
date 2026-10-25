---
name: skill-router
description: Pick which skills in .claude/skills/ apply to a request before starting work. Use at the start of any non-trivial task, when unsure which skill fits, when several skills overlap (motion, design, resume, git), or when asked "which skill should I use", "route this", or to run the load balancer. Runs scripts/route.mjs against the request and returns an ordered plan with guardrails.
---

# Skill router

The repo has about 50 skills and several overlap. This skill is the front door: it scores the request against `registry.json`, applies repo rules, and returns an ordered plan so only the skills that matter get loaded.

## Run it

From the repo root, pass the user's request verbatim:

```bash
node .claude/skills/skill-router/scripts/route.mjs "make the hero animate in smoother and update the about page"
```

`--json` gives machine-readable output, `--list` prints the registry by group, `--check` verifies the registry against the folders and `CLAUDE.md` (exit 1 on drift).

## How to use the result

1. Take the plan in the order shown: ground, decide, build, verify, ship. Load each skill with the `Skill` tool, not by reading its file.
2. Obey every `!` note. They are the repo guardrails for that skill.
3. Skills marked `[heavy]` are large: read only the section the task needs.
4. `Explicit-only` skills (greenfield design, image generation, GSAP-heavy) conflict with `PRODUCT.md` (refinement inside Blueprint Press, subtle motion). Surface them to Riley; do not run them on your own.
5. If nothing clears the threshold, proceed without a skill. Do not force one.
6. Router output is a recommendation. If the plan looks wrong for the request, say so and override it.

## Standing rules it encodes

- Any change to code, data, or config ends with `vault-sync`.
- Any UI work goes through `impeccable` (reads `PRODUCT.md` / `DESIGN.md`).
- Any motion work starts at `motion-design` (what and how much), then `motion-fluidity` (how), `motion-layout` (structure). The generic motion skills (`animate`, `emil-design-eng`, `apple-design`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`) are advisory and yield to `motion-design`.
- Resume work is the chain `custom-resume` → `grill-my-resume` → `fix-my-resume`.
- `write-commit` / `write-merge` come last, after `vault-sync`. Prefer the project `write-commit` over `anthropic-skills:write-commit`.

## Maintaining it

Whenever a skill folder is added or removed, add or remove its entry in `registry.json` in the same session (group, phase 1-5, keywords, optional `gate`, `note`, `next`), then run `--check`. Tune routing by editing keywords or rules, not the script. Keep keywords specific: a bare common word scores only 1.5 and cannot select a skill alone (threshold 3).
