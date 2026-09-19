---
tags: [build, tooling, config]
---

# Build, Tooling and Config

## `package.json`

```json
{
  "name": "interactive-resume-starter",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit"
  }
}
```

**Dependencies**: `@vercel/analytics`, `@vercel/speed-insights`, `framer-motion`, `jspdf`, `lucide-react`, `mermaid`, `next` (`^16.2.12`), `react`, `react-dom` (both `latest`).

**Dev dependencies**: `@types/node`, `@types/react`, `@types/react-dom`, `typescript` (all `latest`).

Several deps are pinned to `"latest"` (`react`, `react-dom`, `framer-motion`, `lucide-react`, `typescript`, all `@types/*`) — a fresh `npm install` can pick up new majors, worth knowing before debugging a behaviour change that isn't in the diff. Next 16 dev uses **Turbopack** by default.

## `tsconfig.json`

- `strict: true`, target `ES2017`, module/resolution `esnext` / `bundler`.
- `resolveJsonModule: true` — lets `data/*.json` be imported directly as typed modules.
- Path alias: `"@/*"` → `"./*"` (repo root) — used everywhere (`@/data/resumeData`, `@/components/blueprint/...`, `@/types/resume`, `@/lib/gantt`, `@/ResumeBuilder/...`).
- `include` lists both `.next/types/**/*.ts` **and** `.next/dev/types/**/*.ts` — Next 16 writes generated route types under `.next/dev/types/` in dev and `.next/types/` for `build`. `next-env.d.ts` (Next-generated, "should not be edited") flips its two `import` lines between those two paths depending on which command ran last; a bare branch switch can leave it pointing at a stale set until the dev server or a build regenerates it.
- `exclude`: `node_modules`, `Under-Dev-UI` (a folder that doesn't currently exist — a forward-looking exclusion).

## `next.config.mjs`

```js
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.5.0.2", "10.1.1.184"]
};
```

`allowedDevOrigins` whitelists two LAN IPs so the dev server is reachable from other devices on the local network. No image domains, redirects/rewrites, or experimental flags.

## `.gitignore`

```
node_modules
.next
out
.env*.local
.DS_Store
*.log
*.tsbuildinfo

# Obsidian vault: track the notes and shared config, ignore per-device
# window/pane state so it doesn't churn or conflict across machines.
**/.obsidian/workspace.json
**/.obsidian/workspace-mobile.json
```

The vault (this documentation) is tracked — only the two per-device Obsidian workspace files are ignored. When editing vault notes, stage them normally.

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. On Windows PowerShell, if script execution is disabled, use `npm.cmd` directly or run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.

`npm run typecheck` runs `tsc --noEmit` — no separate lint script.

## Deployment signal

No explicit deployment config (no `vercel.json`), but strong indirect evidence of **Vercel** hosting: `@vercel/analytics` and `@vercel/speed-insights` are both mounted in the root `app/layout.tsx`, and `app/api/resume-pdf/route.ts` sets `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` headers (meaningful only on Vercel's edge).

## `scripts/` and `playwright-core` (2026-09-17)

`package.json` gained one devDependency, `playwright-core`, used only by `scripts/capture-site-screenshots.mjs` to drive the machine's own Chrome or Edge headlessly (`channel: "chrome"` → `"msedge"`; no browser download). The new top-level `scripts/` folder holds that capture script and `scripts/site-stats.mjs` (git-derived stats and key-commit candidates for the About page). Both are plain Node ESM, run with `node scripts/<name>.mjs`, and are not part of the Next build. See [[About This Site Page]].

## The Studio's own design (2026-09-18)

`studio/ui/` was reworked after the first `$impeccable critique` of it (Operate mode; see [[Impeccable Design Workflow]]). The mechanics (`server.mjs`, the allow-list, backups, the revision guard) are untouched; the shell changed:

- **Viewport-locked panes.** `body` is `100dvh` with `overflow: hidden` at desktop width, so the rail, the list, and the editor scroll independently instead of the page growing to the form's height (it was 6,786px on a project, 42,894px on About this site). Under 1080px the page scrolls as a whole again.
- **The site's world.** Square corners everywhere but the two switches; the 16-inside-96 blueprint grid at the site's 4.5% / 8.5% ink; the monogram as favicon and brand mark with "Studio" as a tracked label; the entry title in a system serif (`--serif`); the form as a paper sheet with a hairline; the site's 2px accent focus ring on every control; no second (green) hue — on-states, the live eye, and the "On the site" tag use the accent.
- **Contrast.** The Studio's pre-computed tints follow the site's re-weighted ramp (`muted` `#6b6c70` light / `#a3a3a3` dark, `faint` `#8b8d90` / `#808080`); help text is 13px muted, labels ink-soft, placeholders muted, legends ink, "Delete" ink with an accent border. Nothing text is set in `faint` or below 11px.
- **Hidden entries are drafts.** Strikethrough is gone: a muted name with a DRAFT caption, a small accent dot on live entries, and the list header counts them ("1 on the site · 8 drafts"). The detail tag reads "On the site" / "Draft · not on the site" and only appears on files with a visibility switch.
- **The long form.** Object-list cards (gallery images, bullets, matches) are `<details>` whose summary is built from the card's own content (alt or caption or filename, a bullet's first line), open only when the list is short, the user opened it, or it was just added; a sticky margin index in the site's section-index pattern lists the sections of the entry (summary, gallery, bullets, groups) when there are three or more.
- **Save lifecycle.** Status cycles Unsaved changes → Saving… → Saved 11:42 pm (from the server's `savedAt`); the toast names the entry and the number of changed fields; a save refused because the file changed on disk keeps the unsaved copy in `sessionStorage` and restores it after the reload, marked dirty. Delete, Revert, and image deletion use the Studio's own `<dialog>` confirm instead of `window.confirm`.
- **Small things.** `aria-current` on the active rail and list item; `aria-live` on the status; names on every list-tool button and list-row input; Alt+↑/↓ reorders the focused list entry; the Save button's tooltip says Ctrl+S; "Open on the site" points at the page the file renders (and at `#project-<id>` for a project) in one reused window; the image picker starts in the current image's folder, keeps the current tile in view, and states the 16 MB limit up front; the slug field lowercases as its help promised.

## Related
- [[Architecture and Data Flow]]
- [[Routes Overview]]
- [[Impeccable Design Workflow]]
- [[Home]]
