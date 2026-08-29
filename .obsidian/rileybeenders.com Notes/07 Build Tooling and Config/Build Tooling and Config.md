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

## Related
- [[Architecture and Data Flow]]
- [[Routes Overview]]
- [[Home]]
