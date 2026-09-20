# Studio

The local content editor for the site. It reads and writes the JSON files under
`data/` so content is edited in a browser instead of by hand in VS Code.

```bash
npm run site            # the site on :3000 and the Studio on :3001, together
npm run studio          # the Studio alone, http://localhost:3001
STUDIO_PORT=3002 npm run studio
```

Save here and the site hot-reloads. Each page of the dev site has an
**Edit in Studio** control (bottom-right, only under `npm run site`) that opens
this editor on the file behind that page; **Open on the site** is the way back.
Both reuse one window each, driven by the hash in this page's address
(`#projects`, or `#projects/icarus-lite` for one entry), so a link into the
Studio never reloads it or loses unsaved work.

## Why it lives outside the Next app

The Studio is a plain Node server with no dependencies and no build step. It is
not a route, so it cannot be deployed by accident, and it binds to `127.0.0.1`
only — nothing off this machine can reach it. It also refuses any request whose
`Host` header is not localhost, which stops a page in the browser from reaching
it by DNS rebinding.

## Layout

```txt
site.mjs        `npm run site`: hosts the gate and the Studio in one process, spawns `next dev` behind them
gate.mjs        the device gate on :3000 — proxies to `next dev`, lets this machine and allowed devices through
access.mjs      the grants the gate enforces (who, until when), address rules, the knock list
server.mjs      HTTP server: the JSON API, image uploads, static files, /api/access
ui/
  index.html    the editor shell
  studio.css
  studio.js     loads files, tracks unsaved changes, saves, hash deep links
  devices.js    the Devices panel
  schema.js     what each data file contains and how it is edited
  fields.js     renders a schema as a form; normalizes a form back to JSON
```

## Letting a phone in

`next dev` itself listens on loopback only. Under `npm run site` the gate takes
port 3000 on every interface and decides per device: this machine always gets
through; a device on the local network gets through while a grant covers it;
anything else is refused. A device that is turned away sees a page with its
own address that reloads by itself, and the gate remembers the knock, so
**Devices** in the top bar lists it with a one-click **Allow**. Grants last
1–24 hours or until the server stops, can be revoked at any time (open
connections from that device are closed), may cover a range as wide as one
network (`/16` at most), and persist in the git-ignored `.studio-access.json`.

Next's own cross-origin check for dev assets still applies: `next.config.mjs`
allows every private-network hostname in development, which is what lets Fast
Refresh work when the site is opened at this machine's LAN address. Which
devices get in is the gate's decision, not that list's.

`npm run studio` on its own has no gate, so the panel shows "Gate off" and
grants made there apply the next time `npm run site` runs.

## Adding a field

Add it to `ui/schema.js` in the position it should occupy in the JSON, and to
the matching type under `types/`. The form picks it up — there is no separate
UI to update.

## Adding a file

1. List it in `FILES` in `server.mjs`. That is the allow-list, so nothing else
   can be read or written.
2. Describe its fields in `SCHEMAS` in `ui/schema.js`.
3. Slot it into `RAIL` in `ui/schema.js` under the page it belongs to. The rail
   reads the way the site does — the home page top to bottom, then each further
   page in nav order, then Site Settings — and draws a divider wherever the
   page changes.

Field order in a schema **is** key order on disk, and optional fields that are
empty are left out, so an entry you did not touch saves back byte-for-byte
identical. That keeps a save's git diff to the thing you actually changed.

## How it is drawn

The Studio is the site's own drafting room, not a generic admin: the same
Electric palette, the same 16-inside-96 blueprint grid, square hairline
surfaces, the site's 2px accent focus ring, and the monogram as favicon and
brand. It runs on system fonts because it never ships. The workspace is locked
to the viewport, so the rail, the list, and the editor scroll on their own.

- Hidden entries are **drafts**: a muted name with a DRAFT caption, an accent
  dot on live ones, and the list header counts both ("1 on the site · 8 drafts").
- Gallery images, bullets, and other repeated cards are collapsible; their
  title is their own content (the alt text, the first line of the bullet). A
  long entry gets a margin index of its sections.
- Saving reads "Unsaved changes → Saving… → Saved 11:42 pm" and the toast says
  how many fields changed. If the file changed on disk underneath you, the save
  is refused and your copy is kept across the reload.
- Ctrl+S saves. Alt+↑ / Alt+↓ reorders the focused list entry. "Open on the
  site" opens the page this file renders, reusing one window.

`.impeccable/critique/` holds the design critique this rework answered; the
tokens it follows are the repo-root `DESIGN.md`.

## Safety rails

- Only the files listed in `FILES` in `server.mjs` can be read or written.
- Every save backs up the previous version into `.studio-backups/` (git-ignored,
  last 25 kept per file).
- Files are written to a temporary name and renamed into place, so an interrupted
  save cannot truncate the original.
- A save is rejected if the file changed on disk since the editor loaded it.
- Uploads are limited to image extensions, are written under a sanitized
  filename, and never overwrite an existing file.
