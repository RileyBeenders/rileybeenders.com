# Studio

The local content editor for the site. It reads and writes the JSON files under
`data/` so content is edited in a browser instead of by hand in VS Code.

```bash
npm run studio          # http://localhost:3001
STUDIO_PORT=3002 npm run studio
```

Run it next to `npm run dev` (port 3000) and the site hot-reloads on save.

## Why it lives outside the Next app

The Studio is a plain Node server with no dependencies and no build step. It is
not a route, so it cannot be deployed by accident, and it binds to `127.0.0.1`
only — nothing off this machine can reach it. It also refuses any request whose
`Host` header is not localhost, which stops a page in the browser from reaching
it by DNS rebinding.

## Layout

```txt
server.mjs      HTTP server: the JSON API, image uploads, static files
ui/
  index.html    the editor shell
  studio.css
  studio.js     loads files, tracks unsaved changes, saves
  schema.js     what each data file contains and how it is edited
  fields.js     renders a schema as a form; normalizes a form back to JSON
```

## Adding a field

Add it to `ui/schema.js` in the position it should occupy in the JSON, and to
the matching type in `types/resume.ts`. The form picks it up — there is no
separate UI to update.

Field order in a schema **is** key order on disk, and optional fields that are
empty are left out, so an entry you did not touch saves back byte-for-byte
identical. That keeps a save's git diff to the thing you actually changed.

## Safety rails

- Only the files listed in `FILES` in `server.mjs` can be read or written.
- Every save backs up the previous version into `.studio-backups/` (git-ignored,
  last 25 kept per file).
- Files are written to a temporary name and renamed into place, so an interrupted
  save cannot truncate the original.
- A save is rejected if the file changed on disk since the editor loaded it.
- Uploads are limited to image extensions, are written under a sanitized
  filename, and never overwrite an existing file.
