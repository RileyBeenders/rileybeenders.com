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

Note several deps are pinned to `"latest"` rather than a fixed range (`react`, `react-dom`, `framer-motion`, `lucide-react`, `typescript`, all `@types/*`) — this repo will pick up new majors automatically on a fresh `npm install`, which is worth knowing before debugging an unexpected behavior change that isn't in the diff.

## `tsconfig.json`

- `strict: true`, target `ES2017`, module/resolution `esnext`/`bundler`.
- `resolveJsonModule: true` — this is what lets `data/*.json` be imported directly as typed modules throughout the codebase.
- Path alias: `"@/*"` → `"./*"` (repo root) — used everywhere (`@/data/resumeData`, `@/components/...`, `@/types/resume`, `@/lib/gantt`).
- `exclude`: `node_modules`, `Under-Dev-UI` (a folder name that doesn't currently exist in the repo — likely a forward-looking exclusion for planned work-in-progress UI).

## `next.config.mjs`

```js
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["10.5.0.2", "10.1.1.184"]
};
```

`allowedDevOrigins` whitelists two specific LAN IPs so the dev server can be reached from other devices on the local network during development (Next.js otherwise blocks cross-origin dev requests). No other custom Next.js config — no image domains, no redirects/rewrites, no experimental flags.

## `.gitignore`

```
node_modules
.next
out
.env*.local
.DS_Store
*.log
*.tsbuildinfo
```

Notably, **`.obsidian/` is not listed** — this vault's own config folder is currently untracked by git purely because it's new, not because it's excluded. If you want the vault (this documentation) to travel with the repo across clones/branches, it needs to be `git add`ed explicitly.

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`. On Windows PowerShell, if script execution is disabled, the README recommends either using `npm.cmd` directly or running `Set-Execution-Policy -Scope CurrentUser RemoteSigned` once in an elevated terminal.

`npm run typecheck` runs `tsc --noEmit` — there's no separate lint script in `package.json`.

## Deployment signal

No explicit deployment config (no `vercel.json`), but strong indirect evidence of **Vercel** hosting: `@vercel/analytics` and `@vercel/speed-insights` are both mounted in `app/layout.tsx`, and `app/api/resume-pdf/route.ts` sets `CDN-Cache-Control` and `Vercel-CDN-Cache-Control` headers specifically (headers that only mean something on Vercel's edge network).

## Related
- [[Architecture and Data Flow]]
- [[Routes Overview]]
- [[Home]]
