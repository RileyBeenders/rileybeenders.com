# Design System — Light/Dark Pairing

This project uses two reference design systems, switched by color-scheme mode:

- **Light mode:** [design-light.md](./design-light.md) — Tesla's design system (radical minimalism, white canvas, single electric-blue accent, Universal Sans typography).
- **Dark mode:** [design-dark.md](./design-dark.md) — Bugatti's design system (near-black canvas, white uppercase letterspaced display type, full-bleed automotive photography, no accent color).

## How to use this

When building or restyling a component:
1. Check which mode you're building for (or build both).
2. Pull colors, typography, spacing, and component specs from the matching file above — don't mix tokens across the two systems within the same mode.
3. Both systems share a "photography-first, minimal chrome" philosophy, so structurally (layout, spacing rhythm, restraint on decoration) they should feel like one coherent product even though the palettes and type differ.
4. If a component needs a value not specified in either file, default to the Tesla (light) system's spacing/radius conventions for consistency, and note the gap.

Source: both files are sourced verbatim from https://github.com/voltagent/awesome-design-md (Tesla and Bugatti entries).
