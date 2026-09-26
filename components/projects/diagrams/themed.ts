/**
 * SVG drawings whose colours and faces are `var(--token, fallback)`, keyed by
 * their `src` in projects.json. The case study inlines them (ThemedSvg) so
 * they follow the live palette and the theme toggle. They are full-sheet
 * drawings meant to be read at full width, so they never stand in for photos
 * in a project's gallery (lib/projects.ts). The UniFi topologies are drawn by
 * scripts/unifi-topology.mjs.
 *
 * A plain module, not the client component, so the server can read it too.
 */
export const THEMED_SVGS = new Set([
  "/project-artifacts/unifi-network/proteor-printing.svg",
  "/project-artifacts/unifi-network/rb-cgf.svg"
]);
