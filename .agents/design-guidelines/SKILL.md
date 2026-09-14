---
name: design-guidelines
description: Reference the site's light/dark design-token systems before any styling, theming, or visual-design change. Use when building or restyling a component, implementing a light/dark toggle (e.g. the Studio theme setting), or asked to check colors, typography, spacing, or component specs for light or dark mode.
---

# Design Guidelines

One of several repository agent procedures — see `.agents/README.md` for the set.

Two reference design-token systems live here, switched by color-scheme mode. Start at [`DESIGN.md`](DESIGN.md) — it routes to whichever of [`design-light.md`](design-light.md) or [`design-dark.md`](design-dark.md) matches the mode being built, and explains how to use them together (pull tokens from the matching file only, don't mix across modes within the same mode; both share a "photography-first, minimal chrome" philosophy so a component should still read as one coherent product across modes).

**These files are reference token/component libraries, not a description of blueprint.css's own layout, type, or component markup** — the "Blueprint Press" structure (Instrument Serif + Spectral, the section-index grid, the monogram, hairline cards) stays as documented in the vault at `.obsidian/rileybeenders.com Notes/05 Styling and Design/Design System (Blueprint Press).md`. Colors are the exception: the live **Electric** palette preset (`lib/palettes.ts`) pulls its light-mode canvas/ink/accent straight from `design-light.md` (Tesla) and its dark-mode canvas/ink from `design-dark.md` (Bugatti), so for color specifically these files now describe what's shipped, not just what's available to pull from.

## When this applies

Any task that touches visual styling: a new or restyled component, a light/dark toggle (including the in-progress Studio theme/font settings), color/typography/spacing decisions, or an explicit ask to check "the design guidelines" for a mode.

## Related procedure

`vault-sync` (`.agents/vault-sync/SKILL.md`) still applies on top of this — a change under `design/`, `.agents/design-guidelines/`, or the site's own CSS updates the vault's styling note independently of which reference file this skill points you to.
