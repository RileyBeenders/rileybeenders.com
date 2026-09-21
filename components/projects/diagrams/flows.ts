/**
 * The flowcharts that render inline instead of as an <img>, keyed by the
 * diagram's `src` in projects.json. An inline diagram takes the site's
 * palette and theme (an <img> SVG can't see `data-theme`) and animates —
 * the boxes settle in one after another, the arrows draw, and a pulse then
 * keeps travelling the path. The SVG file at `src` stays in public/ as the
 * Studio thumbnail and the fallback for anything that isn't in this map.
 *
 * Coordinates are the original drawings' (a 680-wide viewBox), so a diagram
 * here matches its file one-to-one.
 */

/** What a box means; each tone is a colour in the legend. */
export type FlowTone = "step" | "check" | "system" | "stop";

export type FlowNode = {
  id: string;
  title: string;
  detail: string;
  tone: FlowTone;
  x: number;
  y: number;
  /** Box width; the height is the same for every box. */
  w?: number;
};

export type FlowEdge = {
  from: string;
  to: string;
  /** "yes" / "no" beside a branch. */
  label?: string;
};

export type FlowDiagramSpec = {
  width: number;
  height: number;
  nodes: FlowNode[];
  /** In the order the pulse should travel them. */
  edges: FlowEdge[];
  legend: { tone: FlowTone; label: string }[];
};

export const NODE_HEIGHT = 56;

const installFlow: FlowDiagramSpec = {
  width: 680,
  height: 640,
  nodes: [
    { id: "run", title: "Run the one-liner", detail: "irm install.ps1 | iex", tone: "step", x: 210, y: 40 },
    { id: "verify", title: "Download and verify", detail: "SHA-256 vs version.json", tone: "check", x: 210, y: 156 },
    { id: "stop", title: "Install stops", detail: "hash mismatch", tone: "stop", x: 510, y: 156, w: 130 },
    { id: "elevate", title: "Elevated setup", detail: "one UAC prompt, checks WinGet", tone: "step", x: 210, y: 272 },
    { id: "workers", title: "Install workers and tasks", detail: "launcher, worker, 2 tasks", tone: "system", x: 210, y: 388 },
    { id: "shortcut", title: "Create desktop shortcut", detail: "custom icon from icon.png", tone: "system", x: 210, y: 504 }
  ],
  edges: [
    { from: "run", to: "verify" },
    { from: "verify", to: "stop" },
    { from: "verify", to: "elevate" },
    { from: "elevate", to: "workers" },
    { from: "workers", to: "shortcut" }
  ],
  legend: [
    { tone: "step", label: "user steps" },
    { tone: "check", label: "security check" },
    { tone: "system", label: "installed on the PC" }
  ]
};

const runFlow: FlowDiagramSpec = {
  width: 680,
  height: 760,
  nodes: [
    { id: "open", title: "Open desktop shortcut", detail: "launcher runs without UAC", tone: "step", x: 40, y: 40 },
    { id: "version", title: "Check version.json", detail: "newer release available?", tone: "check", x: 40, y: 156 },
    { id: "update", title: "Self-update task (elevated)", detail: "verify SHA-256, reinstall", tone: "system", x: 360, y: 156, w: 280 },
    { id: "restart", title: "Restart launcher", detail: "skips the update check once", tone: "step", x: 360, y: 272, w: 280 },
    { id: "scan", title: "Scan with WinGet", detail: "show available upgrades", tone: "step", x: 40, y: 272 },
    { id: "confirm", title: "Confirm", detail: "install all updates? [Y/N]", tone: "step", x: 40, y: 388 },
    { id: "worker", title: "Worker task (elevated)", detail: "upgrades packages one by one", tone: "system", x: 40, y: 504 },
    { id: "summary", title: "Summary", detail: "failures explained, some retried", tone: "step", x: 40, y: 620 }
  ],
  edges: [
    { from: "open", to: "version" },
    { from: "version", to: "update", label: "yes" },
    { from: "update", to: "restart" },
    { from: "restart", to: "scan" },
    { from: "version", to: "scan", label: "no" },
    { from: "scan", to: "confirm" },
    { from: "confirm", to: "worker" },
    { from: "worker", to: "summary" }
  ],
  legend: [
    { tone: "step", label: "runs as you, no UAC" },
    { tone: "check", label: "security check" },
    { tone: "system", label: "scheduled task, pre-approved admin" }
  ]
};

export const FLOW_DIAGRAMS: Record<string, FlowDiagramSpec> = {
  "/project-artifacts/auto-app-updater/install-flow.svg": installFlow,
  "/project-artifacts/auto-app-updater/run-flow.svg": runFlow
};
