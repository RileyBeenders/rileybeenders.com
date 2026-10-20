---
tags: [component, projects]
---

# Panel Walkthrough

An interactive tour of a program's screens under a project's entry on `/projects` (2026-10-17). First and so far only use: **ExtrusionStudio**, whose six stops walk the plant's panels in the order the plant uses them — Operator-GUI, Operator-Graphs, Packaging Panel, Production Statistics, Server Settings, Admin Settings — and end with the sample files the program itself wrote.

## Where it lives

- `components/projects/walkthrough/PanelWalkthrough.tsx` — client component, rendered by `ProjectEntry` when `project.walkthrough` is set, between the entry grid and the case study (see [[Projects Route (BpComingSoon)]]).
- `app/(site)/projects/walkthrough.css` — `.wt-*` styles, imported by `app/(site)/projects/page.tsx` next to `projects.css` and `feature.css`. It also holds `.pj-links` (the project's link buttons, which arrived with it).
- Data: `Project.walkthrough` (`ProjectWalkthrough` in `types/resume.ts`, see [[Data Layer and Types]]) in `data/projects/projects.json`; labels in `data/site/interface.json` → `walkthrough` (`previous`, `next`, `stepOf`, `callouts`, `alsoOn`, `enlarge`, `openFile`, `download`, `viewCapture`).

## What it does

- **Rail** (`.wt-rail`, sticky under the nav on desktop): one `.wt-stop` per step with its number, title and `audience`. Stops arrive staggered once in view (`useInViewOnce`). Under 860px the rail becomes a horizontal row of pill chips.
- **Stage** (`.wt-stage`, a 1440 × 900 frame): the step's main capture through `ThemedShot` (light `src`, optional `srcDark`; the visitor sees the capture from the theme they are *not* in, as on the About page), with the step's `hotspots` drawn on top as plain `<button>`s — a numbered **pin** at (`x`, `y`) in percentages of the image, or a numbered **box** from (`x`, `y`) sized `w` × `h`. Pressing one lights it up and dims the rest; the same callouts are listed under the notes (`.wt-callouts`) and the two stay in step. A fresh stop selects its first callout after the picture settles (at once under reduced motion). Pins carry a slow ring pulse (`wt-ring`, off under reduced motion).
- **Extras** (`.wt-extras`): more captures of the same panel as thumbnails under the stage ("Also on this panel"); picking one swaps it onto the stage and hides the callouts, which belong to the main capture only.
- **Enlarge** (`.wt-enlarge`): opens the stage's captures in the site's own `Lightbox` (as `ProjectImage`s with `aspect: "original"`), so they page like a gallery.
- **Navigation**: Previous / Next (`.wt-nav`; Next names the coming stop), a `.wt-progress` row of dashes, the ←/→ keys while the walkthrough has focus, and the rail itself. Steps cross-fade and slide 28px in the direction of travel (`AnimatePresence`, `popLayout`; a plain fade under reduced motion).
- **Samples** (`.wt-samples`): a card per `WalkthroughSample` — a kind chip ("HTML · 75 KB"), label, note, **Open** (new tab) and **Download** links, and an optional `shot` thumbnail that opens in the lightbox.

Everything the walkthrough shows is static: captures are files under `public/project-images/ExtrusionStudio/` (WebP, 1920 wide, `-light` / `-dark` pairs where the panel has a dark appearance) and the samples are files under `public/project-artifacts/ExtrusionStudio/`. Nothing is generated or stored at request time.

## The ExtrusionStudio captures

Taken from the program's own Modbus simulator, seeded with three weeks of made-up spools (every decision by the user **RileyBeenders**), through Playwright scripts kept in the git-ignored `tmp/` folder (`capture-extrusion.mjs`, `capture-samples.mjs`, `convert-extrusion.mjs`, `es-seed.py`). Before each capture the DOM is masked: LAN addresses become "plant network", the server's hostname "ExtrusionStudio", and the Pi token is blanked. The samples are one 90-second spool's certificate (`sample-certificate-SS33-A5NA.html`), a second certificate approved with a reason (`sample-certificate-AAD0-YJM1.html`), its CSV (`sample-spool-SS33-A5NA.csv`, 1,800 rows at 20 Hz) and its filament file. The deployment diagram `public/project-artifacts/ExtrusionStudio/deployment.svg` is a themed SVG (listed in `THEMED_SVGS`) drawn by hand, so it follows the palette and theme in the case study.

## Related
- [[Projects Route (BpComingSoon)]]
- [[About This Site Page]] — `ThemedShot` and the themed-capture rule it shares
- [[Data Layer and Types]]
- [[Career Content]]
- [[Home]]
