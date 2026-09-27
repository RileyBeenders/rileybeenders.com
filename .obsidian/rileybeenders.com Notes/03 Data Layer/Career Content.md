---
tags: [data, content]
---

# Career Content

The professional content that flows through [[Data Layer and Types|resumeData.ts]] into the pages. Source files: `data/home/experience.json`, `data/home/education.json`, `data/home/skills.json`, `data/home/summary.json`, `data/projects/projects.json`, `data/projects/proofs.json`.

**Rendering note:** on `main` the home page (`app/(site)/page.tsx`) renders `experience`, `skills`, `education`, and `summary` directly as an editorial layout. Bullets are `EmphasizedText` (their `emphasis` phrases take the accent on hover) and a bullet whose `projectId` names a *published* project ends with an inline "see ICARUS-Lite ↗" evidence link — no chips. `projects` feeds `/projects` in full (`ProjectEntry` renders summary, bullets, `images`, the `status` note, an optional date box, and the case study from `additionalInfo`), but only entries without `visible: false` get there — one of nine today. `proofs` would enrich a case study through `buildProofView()`, but every proof is `visible: false`, so `resumeData.proofs` is `[]` and the file is dormant data. All of it is edited in the Studio (`npm run studio`), never by hand.

## Experience (`data/home/experience.json`)

8 entries, most recent first:

| Company | Role | Location | Dates |
|---|---|---|---|
| Proteor | Lead, Research & Development Engineer | Coplay, PA | Jan 2025 – Present |
| Filament Innovations | Chief Technology Officer | Whitehall, PA | Jan 2023 – Jan 2025 |
| Filament Innovations | Lead Electro-Mechanical Engineer | Whitehall, PA | Jun 2022 – Jan 2023 |
| Filament Innovations | Industrial Engineer | Whitehall, PA | Apr 2021 – Jun 2022 |
| Filament Innovations | Engineering Technician | Whitehall, PA | May 2020 – Apr 2021 |
| RJB.Engineering | Owner & Engineering Consultant | Pennsylvania | 2015 – Present |
| Blue Mountain Ski Resort | Ski Lift Operator | Palmerton, PA | Nov 2019 – Jan 2021 |
| Northampton Area School District | Computer / Network Technician | Northampton, PA | Jun 2016 – Aug 2019 |

Filament Innovations was acquired by Proteor in January 2025 (the current role's `context` is now one sentence: "When Proteor acquired Filament Innovations, my role as CTO carried forward as Lead R&D Engineer."). The Proteor entry was reworked between 2026-09-15 and 2026-09-16: the company name lost its "/ Proteor Printing Solutions" suffix, a new bullet states that Riley acts as **Hiring Manager** for engineering roles (technical interviews, final hiring decisions), and the remaining ten bullets were condensed to one clause each — the ICARUS-Lite design and commercialization, the LabVIEW QC system, the Business Central ERP rollout across Proteor's global locations, ProteorPrint OS with SimplyPrint, EU/U.S. risk analysis, the co-developed hotend, cross-functional support, the POSEIDON/ICARUS re-engineering (4 m/s, 1-micron), and the division's IT infrastructure. Details that lived only in the long versions (dual-voltage 120/240 VAC operation, the nine-point / 15 ms Modbus acquisition figures, "approximately five new roles", the East Coast team oversight wording) are no longer stated anywhere in the record — the Modbus and laser-sensor specifics survive in the ExtrusionLine Studio project entry. Thirty bullets across the eight roles carry `emphasis` phrases (2026-09-16 for Proteor, 2026-09-19 for the rest). Four Proteor bullets carry a `projectId` (`icarus-lite`, `ExtrusionLine-Studio`, `proteor-print`, `unifi-network`) and pass through the merge; `proofId`s are still present on the Filament-era bullets but stripped before any page sees them.

## Projects (`data/projects/projects.json`)

9 entries, each with an `order` and a full `additionalInfo` payload:

| Order | id | Name | Type |
|---|---|---|---|
| 1 | `linear-motion-platform` | Linear Motor Platform Standardization | Motion Control / Product Platform |
| 2 | `icarus-lite` | ICARUS-Lite | Industrial Design |
| 3 | `ExtrusionLine-Studio` | ExtrusionLine Studio Software | LabVIEW Data Acquisition |
| 4 | `proteor-print` | PROTEOR Print | Remote Operations Software |
| 5 | `gen3-poseidon` | Gen3 POSEIDON | Large-Format Additive Manufacturing System |
| 6 | `kraken` | THE KRAKEN | Custom Hybrid Additive Manufacturing System |
| 7 | `internal-erp` | Engineering Operations Platform | Internal Software / Infrastructure |
| 8 | `modular-controls` | Modular CAN-Bus Controls Architecture | Electrical / Manufacturing System |
| 9 | `unifi-network` | Unified Ubiquiti Network | Network Infrastructure |

Only **`icarus-lite` is published** (no `visible` key); the other eight carry `visible: false` since 2026-09-16 and show in the Studio as drafts. `/projects` renders it in full: six photographs from `public/project-images/ICARUS-Lite/` in `images[]` (the two placeholder render entries are gone), a `status` note ("Project page under development. More details to come soon."), and a case study from its `additionalInfo` — whose `assets` were removed, so the gallery is photos only. The drafts keep their single `additionalInfo.assets` diagram from `public/project-artifacts/*.svg` (the gallery fallback they will use until they have photos).

**GIFs in a gallery (2026-09-20).** A gallery image whose `src` ends in `.gif` gets a **Playback speed** slider in the Studio (¼× up to the fastest the recording allows — a frame can't show for under 2 hundredths of a second, so a 12.5 fps recording tops out at 4×), a readout of the resulting length and frame rate, and a preview retimed on the fly by `/api/thumb?src=&speed=` (`/api/gif?src=&speed=` returns the numbers). The choice is saved as `speed` beside `src` (dropped at 1×; `ProjectImage.speed` in [[Data Layer and Types]]). On every save `studio/gif.mjs` makes each GIF the file refers to match: it rewrites the per-frame delays and sets the loop flag to forever without decoding the pixels (a 15 MB recording takes milliseconds), keeps the recording's original delays in a comment inside the GIF so later speeds are computed from those (2× → 3× → 1× lands on the original bytes), and leaves a file alone when it already reads as the JSON says. Every referenced GIF is set to loop, slider or not. The first such image is `public/project-artifacts/RBs-Auto-Win-Updater.gif` (1376×768, 369 frames at 8 cs) on the draft `auto-app-updater` entry, whose `additionalInfo.assets` also names two diagrams — `/project-artifacts/auto-app-updater/install-flow.svg` ("Install flow") and `run-flow.svg` ("Everyday run flow") — that the case study draws inline and animated rather than as images (see [[Projects Route (BpComingSoon)]]).

**Paragraphs (2026-09-26).** Every multi-line body field (project, proof and About-site summaries, `problem`, `rootCause`, experience `context`, the home summary, timeline summaries, section intros, and each entry of a paragraph list) is plain text in which an **empty line starts a new paragraph**. `components/content/Paragraphs.tsx` holds `splitParagraphs()` (splits on a blank line, trims, drops empties) and `<Paragraphs text className>` (one `<p data-para>` per paragraph); `blueprint.css` spaces `p[data-para] + p[data-para]` by 0.85em (20px for `.bp-prose`), and paragraph lists are `flatMap`ped through the splitter. The home summary keeps its drop cap on the first paragraph and links "RileyBeenders.com" in whichever paragraph mentions it; `ScrollWords` intros render one block per paragraph. A single line break still flows into the same paragraph. First use: the `unifi-network` summary.

**PDFs in a gallery (2026-09-26).** A gallery entry's `src` may be a PDF. The Studio draws its first page with pdf.js in the browser (the `pdfjs-dist` dev dependency, served at `/vendor/pdfjs/`, rendered with the print intent so it doesn't stall in a background tab) and saves it beside the file as `<name>.pdf.png` (`POST /api/pdf-preview`, PNG-only; `GET /api/pdf` reports whether the preview is newer than the PDF). The panel under the path shows the preview, the page count (`pages`) and a **Visitors can download it** switch (`download: true`, omitted while off). On the site the grid cell shows only that preview, whole unless an aspect ratio is set, tagged "PDF · N pages", with a Download PDF link under it when allowed. Since 2026-09-27 the **full-screen viewer scrolls every page** instead of repeating the first: `components/projects/PdfPages.tsx` reads the PDF itself with pdf.js in the browser (a dynamic import, so only a visitor who opens one fetches the library), and the caption follows the page under the reader ("Page 2 of N", the renamed copy key `gallery.pageOf`). Only the grid uses the saved `<name>.pdf.png`, so a page of thumbnails still never fetches a PDF, and the later pages need nothing saved beside the file. The PDF stays in `public/`, so the switch hides the offer of the file, not the reading of it. Uploads and the picker accept PDFs (16 MB cap), the picker lists the PDF rather than its preview, deleting a PDF deletes its preview, and Before & after is disabled for PDFs.

**LinkedIn posts as artifacts (2026-09-27).** An artifact can be a captured post. **From a LinkedIn post**, folded away under any non-PDF artifact's path, takes the post's address and **Capture** writes a picture of it into that artifact's folder, points `src` at it, and copies out the author, the date and the words — all editable, since LinkedIn's markup is theirs to change and a thin capture is a normal outcome (the panel says "captured, but some of it came back empty"). Saved beside `src` as `post` (`SocialPost` in [[Data Layer and Types]]); clearing the address clears the record. It writes into the folder the artifact already points at, or the one the project's other artifacts use, and fills in empty alt text.

Three things are cleaned up on the way in, because the page's own text is not fit to keep as it stands. **Comments** are taken out of the page before anything is read or photographed — on a permalink the replies share the post's container and carry their own text node — first by class name and then by a sweep for anything still calling itself a comment; the byline is deliberately kept, since a screenshot of a post with no byline is not evidence of much. **Hashtags** arrive as "hashtag #usa", one per line, because LinkedIn labels each tag link with a hidden word for screen readers; those nodes go, and the run of tags is folded back into one line. **The date** shown on the page is relative ("4yr") and would be wrong from the day after the capture, so the real one is recovered from the activity id in the post's own address and stored as an ISO stamp.

On the site a captured post is not shown as a thumbnail at all: the grid gets a card of the site's own (`PostButton`) carrying the source, the author, the date, the opening of the post and **View LinkedIn post**, because a screenshot at that size is unreadable grey. Opening it gives the record in full beside the screenshot, which is labelled as the evidence rather than the reading copy, with **Redirect to LinkedIn** offered inside — the words typeset by the site rather than only photographed, which is the point: the record outlives the post being edited or taken down.

LinkedIn answers a signed-out browser with HTTP 999 and its wall, headless or not, so `studio/linkedin.mjs` drives a browser profile of the editor's own in git-ignored `.studio-cache/linkedin`: **Sign in to LinkedIn** opens a visible window once and the session stays in that folder. Endpoints are `GET /api/linkedin` (session state), `POST /api/linkedin/sign-in`, `DELETE /api/linkedin` (forget it) and `POST /api/linkedin/capture` `{ url, folder }`. The session is asked about once per editor session and only when a panel is opened, because answering costs a headless browser launch; a capture refused for want of one returns 401 and writes nothing. The wall arrives two ways and both are checked — `/feed/` **redirects** to `/login/?session_redirect=…` under an ordinary 200, while a post is walled **at its own address** under 999 — since a wall mistaken for a post would be screenshotted and saved as though it were the evidence.

**Aspect ratio (2026-09-26).** Each gallery image has an **Aspect ratio** select in the Studio — 4:3 (default, not written), 3:2, 16:9, 21:9, 1:1, 4:5, 3:4, 2:3, 9:16, or Original (no crop) — saved as `aspect`. The gallery frame takes that shape; Original lets the image set its own height. A before & after and its crop-and-align stage use the same shape (Original compares in 4:3); changing it repaints the card so the stage follows.

**Before & after images (2026-09-26).** Each gallery image has a **Display** switch in the Studio: *Default* (the one image or GIF) or *Before & after*. A comparison relabels the image path **Before**, adds an **After** path, and shows a crop-and-align stage in the image's frame shape: pick a photo, drag to move it, scroll or use Zoom (100–400%) to crop in, with *Overlay* (After at half strength, for matching edges) and *Slider* (what the visitor sees) views. Movement is clamped so a photo always fills the frame. It saves `display: "compare"`, `after`, and `frame` / `afterFrame` only for a photo that was moved (`ImageFrame` in [[Data Layer and Types]]); switching back to Default drops them all. An After that is a GIF is set to loop on save like any other referenced GIF, at its recorded speed.

**`unifi-network`** has a written case study (problem, root cause, constraints, approach, impact, tools) but still `bullets: []`. Its `additionalInfo.assets` are two network topologies, `public/project-artifacts/unifi-network/proteor-printing.svg` and `rb-cgf.svg` (2026-09-26), redrawn from UniFi exports by `scripts/unifi-topology.mjs` and inlined in the case study by `ThemedSvg` so they follow the palette and theme (see [[Projects Route (BpComingSoon)]]). They never fill the gallery, so with no photos the entry is text-only; photos added to `images[]` in the Studio fill the top.

## Proofs (`data/projects/proofs.json`)

17 entries, **all `visible: false`** since 2026-09-16. `resumeData.ts` now loads proofs whenever the projects page is on (`includeProofData` counts `projectsSection`), and `lib/projects.ts` → `buildProofView()` would merge a matching proof's summary, tags, and assets into a project's case study — but with every entry hidden, `resumeData.proofs === []` at runtime and each case study is the project's own `additionalInfo`. There is still no standalone proof UI on `main` (`proofIndex` is `false`).

Entries with **no matching project** (`projectId` absent — they only ever backed experience bullets in the old design): `strain-gauge-probing`, `nonplanar-research`, `kratos`, `product-reliability`, `rjb-engineering`, `ski-lift-systems`, `school-network`.

`ExtrusionLine-Studio`, `ExtrusionLine-Studio_Modbus`, and `ExtrusionLine-Studio_SimpleStart` now all exist as entries (the latter two were the outstanding "to create" items in the old `README_TODO.md`; the TODO text is stale on that point).

## Education (`data/home/education.json`)

One degree: **BS, Electro-Mechanical Engineering**, Penn State University, December 2024. Eight certificates: four MathWorks "OnRamp" certs (MATLAB, Simulink, Simscape, Machine Learning — all "Issued July 2026", each with a `credentialUrl`), Lean Six Sigma Yellow Belt (Jul 2025) and White Belt (Jun 2025) from Educate 360, plus two non-linked certificates (Penn State "Certificate in Engineering Design and Tools", Spring 2023; Lafayette College "Mechanical Engineering Certificate", Spring 2019). On the home page these render as `.bp-cert` cards; the linked ones get a "Show credential" external link.

## Skills (`data/home/skills.json`)

Four categories, rendered on the home page as `03 Skills` pill groups (the section was labelled "Toolchain" until 2026-09-18; on 2026-09-19 "Fixture and Tooling Design" was deduplicated out of Design & Software — it stays under Engineering — and "Toleranceing" corrected to "Geometric Dimensioning & Tolerancing (GD&T)"): **Engineering** (DFM/DFA, GD&T, Lean Six Sigma, fixture and tooling design, product development, process development, …), **Design & Software** (Inventor, CATIA, Fusion 360, LabVIEW, MATLAB, Python, SolidWorks, Siemens NX, LM Studio, oMLX, …), **Controls & Automation** (Allen Bradley PLCs, data logging, Git version control, workflow automation, Windows applications), **Infrastructure & Systems** (Docker, Proxmox, VLAN config, reverse proxy/firewall routing, DNS/subdomain config, Windows/Linux sysadmin).

Since 2026-09-26 a group may carry `links: [{ skill, projectId | proofId }]` beside its `items` (edited per item in the Studio's Skills list), which turns those skills into linked pills on the home page (see [[Routes Overview]]); `items` stay plain strings, so the resume PDF and the job-application comparisons read them unchanged. The first links came from exact matches with a published project's own `additionalInfo.tools`: Design & Software's GitHub → `auto-app-updater`, and eight Infrastructure & Systems skills (DNS and Subdomain Configuration, Reverse Proxy and Firewall Routing, Server Network and VLAN Configuration, Ubiquiti UniFi Network Administration, DHCP and IP Address Management, Multi-Site Network Management, Network Monitoring and Troubleshooting, IoT and Production Network Segmentation) → `unifi-network`.

## Summary (`data/home/summary.json`)

The single professional-summary paragraph rendered under `01 Summary` on the home page (with a drop-cap on the first letter, and the literal "RileyBeenders.com" turned into a link) — rewritten 2026-09-16: an electro-mechanical engineer and leader in product development, manufacturing and industrial automation, "quick to pick up, apply, and integrate new technologies into real-world systems", uniting mechanical, electronics, controls, software, and manufacturing; the website as "another extension of that curiosity", built to house experience and projects and to apply to ambitious opportunities. Also used verbatim as the "Profile" section of the generated PDF.

## Open content TODOs (`README_TODO.md`)

- Whether to merge `proofs` into `projects` is an open question.
- "Alter Line 136" — link the network project to VLAN/Wifi routing detail (refers to an older `experience.json`; the `unifi-network`-tagged bullet is the current target).
- The two ExtrusionLine proofs it lists as "to create" already exist — that item is done.
- The resume-PDF data rules that used to be drafted here moved into `.agents/skills/custom-resume/SKILL.md` step 3 on 2026-09-19; the file now just points there.

## Related
- [[Data Layer and Types]]
- [[Projects Route (BpComingSoon)]]
- [[Home]]
