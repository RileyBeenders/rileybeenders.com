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
(`#projects`, `#projects/icarus-lite` for one entry, or
`#projects/icarus-lite/artifacts` for one of its tabs), so a link into the
Studio never reloads it or loses unsaved work.

## Why it lives outside the Next app

The Studio is a plain Node server with no dependencies of its own and no build step
(for thumbnails it borrows `sharp`, which `npm install` brings in with Next, and
for PDF previews the `pdfjs-dist` dev dependency, which runs in the browser). It is
not a route, so it cannot be deployed by accident, and it binds to `127.0.0.1`
only — nothing off this machine can reach it. It also refuses any request whose
`Host` header is not localhost, which stops a page in the browser from reaching
it by DNS rebinding.

## Layout

```txt
site.mjs        `npm run site`: hosts the gate and the Studio in one process, spawns `next dev` behind them
gate.mjs        the device gate on :3000 — proxies to `next dev`, lets this machine and allowed devices through
access.mjs      the grants the gate enforces (who, until when), address rules, the knock list
server.mjs      HTTP server: the JSON API, image uploads, folders, moves, static files, /api/access, /api/thumb, /api/gif, /site/ (site styles for previews), /api/photo-place (the projects page's Photo Mode)
gif.mjs         retimes a GIF's frame delays and loop flag in place, without decoding it
ui/
  index.html    the editor shell
  studio.css
  studio.js     loads files, tracks unsaved changes, saves, hash deep links
  devices.js    the Devices panel
  files.js      the image picker, a small Explorer: folders, uploads, drag-to-move, rename, delete
  schema.js     what each data file contains and how it is edited
  fields.js     renders a schema as a form; normalizes a form back to JSON; thumbImage()
```

## Images are shown small

A project photograph is a 6000px, 9 MB JPEG; drawing seven of them into 38px
boxes is what made the projects page drag. Every image the editor shows now
comes through `/api/thumb?src=<public path>&w=<px>`: `thumbImage(src, cssSize)`
in `ui/fields.js` asks for the slot's longest edge at the screen's pixel
density (a 92px preview on a 2x display asks for 184px, the picker's ~220px
cells for ~440px), and the server rounds that up to one of 96 / 192 / 320 /
480 / 640 / 960 / 1280, resizes with `sharp` (EXIF orientation honoured) to a
WebP, and caches it in the git-ignored `.studio-cache/thumbs/` keyed by the
file's path, mtime and size, so a changed image gets a fresh copy and the
folder is safe to delete. SVG and GIF are served as they are. Without `sharp`
the endpoint serves the original, and an `<img>` whose copy fails falls back
to the original too.

## Choosing and organizing images

**Browse…** on an image field opens the picker, which works like a Windows
Explorer window over `public/project-images/` and `public/project-artifacts/`.
It opens in the folder of the image the field holds (tagged CURRENT), else
where the last picker was left.

The **Files** button in the Studio's bottom-right corner (where the site
keeps its "Edit in Studio" control) opens the same window just to look after
the images, with no field waiting on it: Choose gives way to **Copy path**
(to paste into any field) and **Open**, and double-clicking a file opens it
in a new tab. In both, the foot says where the selected file or folder is
used ("Used in Projects and Proofs", "Not used by the site"), from
`GET /api/refs`, so it's clear what is safe to move or delete.

- The address bar at the top is where you are: `public › project-images ›
  ICARUS-Lite`. Click a crumb or ↑ (Backspace) to go back out; going up
  lands on the folder you just left.
- Folders come first, then files, in name order. A click selects, Ctrl+click
  adds one, Shift+click takes a run, Ctrl+A takes them all. Double-click (or
  Enter) opens a folder or chooses a file; **Choose** does the same for the
  selected file.
- **Upload** and **New folder** (Ctrl+Shift+N) act on the folder you are in.
  Uploads take several files at once, and files dragged in from the desktop
  upload to wherever they are dropped: the open folder, or a folder tile or
  crumb. Names are cleaned the same way (`New folder` becomes `New-folder`).
- Drag files or folders onto a folder or a crumb to move them. **Rename** (F2)
  edits the name in place with the extension left alone, and **Delete**
  (Del) asks first and says where a file is still used. A folder must be
  empty to delete. The two top folders stay where they are.

Moving or renaming never breaks the site: `POST /api/move` moves the file
(a PDF's preview goes with it), then rewrites every path to it, or to
anything inside a moved folder, in the data files the Studio edits (each
backed up first), and the editor updates its open copies to match, so the
move doesn't count as an unsaved change. A path the site's code names
directly (the themed diagrams in `components/projects/diagrams/`, the folder
`scripts/capture-site-screenshots.mjs` writes) is refused with the file that
names it; move those in the code first.

## PDFs as artifacts

An artifact can be a PDF (the picker offers PDFs for artifacts only, and
uploads accept them). In the grid the site shows a preview of the first page,
which the editor draws with pdf.js (served from `node_modules/pdfjs-dist` at
`/vendor/pdfjs/`) and saves beside the file as `<name>.pdf.png` through
`POST /api/pdf-preview`. That happens as soon as the
PDF is chosen, and again whenever the PDF is newer than its preview
(`GET /api/pdf` says which); **Remake preview** forces it. The picker lists the
PDF, not the PNG, and deleting a PDF deletes its preview.

The panel under a PDF's path shows the preview and the page count (saved as
`pages`) and holds **Visitors can download it** (saved as `download: true`,
left out while off). With it on, the site puts a Download PDF link under the
preview and in the full-screen viewer; with it off, visitors can still read
every page but are not handed the file. The PDF itself sits in `public/`, so
anyone with its exact address can open it; the switch only decides whether the
site offers it.

Opening a PDF full screen scrolls **every** page, not just the saved preview:
`components/projects/PdfPages.tsx` loads pdf.js in the browser (a dynamic
import, so only a visitor who opens a PDF fetches it) and draws each page into
a canvas as it is scrolled to, with the caption following along ("Page 2 of
3"). Only the grid uses the saved `<name>.pdf.png`, which is why a page of
thumbnails never fetches a PDF. A PDF keeps its page's own shape in the grid
unless Aspect ratio picks one, and Before & after is for images only.

## LinkedIn posts as artifacts

A post on LinkedIn is not evidence you own: it can be edited, taken down, or
lost with the account. **From a LinkedIn post**, folded away under any
artifact's path, turns one into something the site keeps.

Paste the post's address and **Capture** takes a picture of it into this
artifact's folder, points `src` at that picture, and copies out who posted it,
when, and what it said. Those land in editable fields, because LinkedIn's markup
is theirs to change and a thin capture is a normal outcome rather than a failure
— the panel says so ("captured, but some of it came back empty") and you fill in
the rest. Everything is kept beside `src` as `post`
(`{ url, author, date, text, capturedAt }`). Clearing the address clears the
record and the artifact goes back to being a plain image.

The capture writes into the folder this artifact already points at, or, for a
new one with no path yet, the folder the project's other artifacts use. It also
fills in **Alt text** if that is still empty ("LinkedIn post by …"), since it is
a required field and nobody wants to describe a screenshot by hand.

What is deliberately left out and cleaned up:

- **Comments.** On a permalink the replies sit in the same container as the
  post and carry their own text node, so they are taken out of the page before
  anything is read *or photographed* — by class name, and then by a sweep for
  anything still calling itself a comment, since the names are LinkedIn's to
  change. The author's byline is deliberately kept: a screenshot of a post with
  no byline is not evidence of much.
- **Hashtags.** LinkedIn labels every tag link with a hidden "hashtag" word for
  screen readers, which is why they used to read "hashtag #usa", and it puts
  each tag on its own line. The hidden nodes go with the rest, and a run of tags
  is folded back into the one line it reads as. The site then sets that line
  apart from the prose on the card.
- **The date.** The page shows a relative age ("4yr"), which is true on the day
  of the capture and wrong forever after. A LinkedIn activity id carries a Unix
  millisecond timestamp in its top bits, so the real date is recovered from the
  address instead and stored as an ISO stamp; the page's own wording is only the
  fallback for an address with no id.

On the site a captured post is **not** shown as a thumbnail. A screenshot of a
post shrunk into a grid cell is a grey rectangle of unreadable type, which tells
a visitor nothing and looks like a mistake, so the grid shows the site's own
card instead: the source, who posted it, when, the opening of the post, and
**View LinkedIn post**, which opens it.

Opening it gives the record in full — the words set in the site's type, the
hashtags apart from them, **Redirect to LinkedIn**, and the date the copy was
taken — beside the screenshot, which is labelled as what it is ("The post as it
was captured") and kept as the evidence rather than the reading copy. Given the
width the two sit side by side, each scrolling on its own, the record taking the
larger share; below 900px they stack, the record first. The way out to LinkedIn
is offered on the understanding that it may not answer forever, which is the
whole reason for keeping the copy.

The hashtags are found by pattern at the end of the text rather than by the line
the capture put them on, since the text is editable and passes through a
textarea on the way back; two or more in a row is the test, so a lone
"#3dprinting" ending a sentence stays in the sentence.

### The signed-in browser

LinkedIn answers a signed-out browser with HTTP 999 and its sign-up wall,
headless or not, so a capture needs a session. Rather than ask for credentials
or drive the real Chrome profile (which is locked while Chrome is running), the
editor keeps its own browser profile in `.studio-cache/linkedin`:
**Sign in to LinkedIn** opens a visible window, you sign in there as you
normally would, and the cookies stay in that folder. It is git-ignored and must
stay that way — it holds a live session.

The session is asked about once per editor session and only when a panel is
actually opened, because answering costs a headless browser launch. A capture
refused for want of one comes back as a 401, the sign-in button reappears, and
nothing is written to disk. Sessions lapse eventually; sign in again when the
panel says "not signed in".

`readPostInPage()` (the part most likely to be broken by a LinkedIn markup
change) is exported rather than inlined, so it can be run against a fixture page
instead of a live post.

LinkedIn serves its wall two different ways and `studio/linkedin.mjs` has to
catch both: `/feed/` **redirects** to `/login/?session_redirect=…` under an
ordinary 200, while a post is walled **at its own address** under HTTP 999.
Getting that wrong is not a harmless miss — a wall mistaken for a post gets
screenshotted and saved as though it were the evidence.

## GIFs: speed and looping

A browser plays a GIF at the pace written into the file, and loops it only if
the file says so, so neither can be set from the site. Instead an artifact
whose path ends in `.gif` gets a **Playback speed** slider under it, from ¼×
up to the fastest the recording allows (a frame can't be shown for less than
2 hundredths of a second, so a 12.5 fps recording tops out at 4×). The readout
says what the speed does to the clip's length and frame rate, and the preview
under it is the file retimed on the fly by `/api/thumb?speed=`.

The chosen speed is saved as `speed` beside the image's `src` (left out at 1×).
On every save, `gif.mjs` makes each GIF the file refers to match: it rewrites
the per-frame delays and sets the loop flag to forever, copying the pixel data
through untouched — no decode, a few milliseconds for a 15 MB recording. The
recording's own delays are kept in a comment inside the GIF the first time it
is retimed, so later speeds are computed from those and 2× → 3× → 1× lands on
the original bytes. A file that already reads as the JSON says is not touched,
so a save that didn't move the slider never rewrites it. Every referenced GIF
is set to loop, slider or not; a GIF that only appears in the picker is left
as it is until something refers to it.

## Page text and labels

Every word a visitor reads is editable here, not only the content. Each page
has a page file at the top of its group in the rail (**Home page**, **Projects
page**; Contact, More Info and About this site keep theirs in their own file)
holding the browser-tab title and description, headlines, intros, section
headings and closing notes. The words shared by every page (the menu, the
buttons, Back to Top, case-study headings, gallery notes, timeline labels) are
in **Navigation & labels** under Site settings. Where a field mentions
`{count}`, `{company}` or `{start}`, the site fills the value in. The site reads
these through `lib/copy.ts`; the types are in `types/pages.ts`.

How the intro under a page headline sits (Left, Centered, Right or Full
width) is one choice for every page, in Site Settings → Layout.

How the "Read more" button at the end of a resume bullet moves is **Home
page → Read more button**: seven cards (Ink sweep, Letter roll, Arrow launch,
Offset print, Trace, Glint, Still), each playing the real button when hovered
or focused. The previews are drawn by the site's own
`app/(site)/bullet-link.css`, which the server hands out read-only at
`/site/bullet-link.css` (`SITE_STYLES` in `server.mjs`), in the palette Site
Settings holds right now, saved or not, and in the Studio's light or dark
mode. The choice is saved as `readMore.animation` in `data/home/page.json`.

## Linked skills

In **Skills**, every item has a link picker beside it: No link, a project, or
a proof (drafts are marked). The links are saved beside the group's items as
`links: [{ skill, projectId | proofId }]`, keyed by the item's text, so the
items themselves stay plain strings for the resume PDF and everything else
that reads them. Retyping an item carries its link along; removing an item
drops its link. The rail counts them ("16 items · 8 linked").

On the home page a linked skill gets a link icon, a border that marks it, and
a card that opens on hover (or when its Read more is tabbed to) naming the
project or proof, with the Read more button. A link only shows while the
Projects page is on and its target is published; a proof link opens the
case study of the project it sits in. How the border moves and how the card
opens are **Home page → Linked skills**: six borders (Orbit, Marching dashes,
Ping, Registration marks, Signal, Steady) and three layouts (Card, Tab,
Callout), previewed on one of your real linked skills by the site's own
`app/(site)/skill-pills.css` (`/site/skill-pills.css`), plus the words the
card uses for a project and a proof.

Still in code: the interactive demo replicas on About this site, the
flowchart text in `components/projects/diagrams/flows.ts`, and labels only a
screen reader hears.

## Paragraphs

Body text is plain text. In any multi-line field (a summary, a problem, an
intro, a paragraph in a list of paragraphs), an empty line starts a new
paragraph on the site; a single line break just flows on. The site splits the text with `splitParagraphs` /
`<Paragraphs>` in `components/content/Paragraphs.tsx`, and the resume PDF
keeps it as one compact block.

## Aspect ratio

Each artifact picks the shape of its frame on the site from **Aspect
ratio**: 4:3 (the default, left out of the JSON), 3:2, 16:9, 21:9, 1:1, 4:5,
3:4, 2:3 or 9:16, saved as `aspect`. **Original** draws the whole image at its
own proportions with nothing cropped. A before & after uses the chosen shape
for both photos and for its crop-and-align stage (Original compares in 4:3,
since a comparison needs one fixed frame).

## Before & after images

An artifact's **Display** is either *Default* (the one image or GIF) or
*Before & after*. A comparison keeps its first image in `src` as the Before and
adds `after`; the site lays the After over the Before and the visitor drags a
bar between them (arrow keys once it is focused). Under the After path is a
crop-and-align stage in the same frame the site draws (the image's aspect ratio): pick a photo, drag
to move it, scroll or use Zoom to crop in, and *Overlay* shows the After at half
strength so edges can be matched by eye. Where each photo sits is saved as
`frame` / `afterFrame` (`{ x, y, w }`, percentages of the frame), so the crop
holds at thumbnail and full-screen size. A photo left untouched has no frame
and simply covers the frame, centred.

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
UI to update. A project field also goes into one of the `tabs` listed under
the projects schema; left out of every tab, it shows at the end of Overview.

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
The editor fills the rest of the window and resizes with it, keeping the same
gap on its right as on its left.

Three surface tones separate the chrome from the work, all mixed from the
palette's own ink and paper: in light mode a white page, a light gray rail and
a slightly darker top bar; in dark mode a black top bar, a deep dark gray rail
and a deep gray page, with cards and inputs a step lighter than the page. The
open file in the rail takes the page's color, like a tab joined to its sheet,
and 2px dividers mark where one page of the site ends and the next begins.

- Hidden entries are **drafts**: a muted name with a DRAFT caption, an accent
  dot on live ones, and the list header counts both ("1 on the site · 8 drafts").
- A project is four tabs instead of one long form: **Overview** (name, ID,
  category, order, visibility, summary, status, dates), **Artifacts**,
  **Bullets**, and **Case study** (the write-up behind the case-study toggle,
  plus the linked proof). Artifacts and Bullets show their count. The open tab
  stays open as you move between projects, so you can work through every
  project's artifacts in a row; the tab row sticks to the top of the editor, ← / → move
  along it, and the address bar remembers it. Tabs only change what is drawn:
  `schema.tabs` groups the fields, and the key order on disk is unchanged.
- Artifacts, bullets, and other repeated cards are collapsible; their
  title is their own content (the alt text, the first line of the bullet). A
  long entry (or a long tab, like Case study) gets a margin index of its
  sections.
- Saving reads "Unsaved changes → Saving… → Saved 11:42 pm" and the toast says
  how many fields changed. If the file changed on disk underneath you, the save
  is refused and your copy is kept across the reload.
- Every reorderable thing (entries in the list, artifacts, bullets, list
  rows) has a three-line grip. Grab it and the entry follows the pointer while
  the others slide aside to show where it will land; let go and it settles
  into that gap. Escape puts it back, and the list scrolls itself near the
  pane's edges. Focus the grip and ↑ / ↓ move it one place. `makeSortable` in
  `ui/fields.js` does all of it, moving only transforms until the drop.
- Text boxes are as tall as their text, with no scrollbar, and grow as you
  type. Drag a box's corner to give it more room; it won't go shorter than
  its text.
- Ctrl+S saves. Alt+↑ / Alt+↓ also reorders the focused list entry. "Open on the
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
- Moves and renames stay inside the image folders, never overwrite, rewrite
  the data files' references (with a backup), and are refused for any path
  the site's code names directly. Only empty folders can be deleted.
- Uploads are limited to image extensions, are written under a sanitized
  filename, and never overwrite an existing file.
