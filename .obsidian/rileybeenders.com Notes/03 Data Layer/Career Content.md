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

**`unifi-network` is still a placeholder** — `bullets: []` and `additionalInfo` full of literal placeholder strings (`"title": "title"`, `"constraint01"`, etc.). Genuine in-progress content gap; flag it if asked to "finish" project content.

## Proofs (`data/projects/proofs.json`)

17 entries, **all `visible: false`** since 2026-09-16. `resumeData.ts` now loads proofs whenever the projects page is on (`includeProofData` counts `projectsSection`), and `lib/projects.ts` → `buildProofView()` would merge a matching proof's summary, tags, and assets into a project's case study — but with every entry hidden, `resumeData.proofs === []` at runtime and each case study is the project's own `additionalInfo`. There is still no standalone proof UI on `main` (`proofIndex` is `false`).

Entries with **no matching project** (`projectId` absent — they only ever backed experience bullets in the old design): `strain-gauge-probing`, `nonplanar-research`, `kratos`, `product-reliability`, `rjb-engineering`, `ski-lift-systems`, `school-network`.

`ExtrusionLine-Studio`, `ExtrusionLine-Studio_Modbus`, and `ExtrusionLine-Studio_SimpleStart` now all exist as entries (the latter two were the outstanding "to create" items in the old `README_TODO.md`; the TODO text is stale on that point).

## Education (`data/home/education.json`)

One degree: **BS, Electro-Mechanical Engineering**, Penn State University, December 2024. Eight certificates: four MathWorks "OnRamp" certs (MATLAB, Simulink, Simscape, Machine Learning — all "Issued July 2026", each with a `credentialUrl`), Lean Six Sigma Yellow Belt (Jul 2025) and White Belt (Jun 2025) from Educate 360, plus two non-linked certificates (Penn State "Certificate in Engineering Design and Tools", Spring 2023; Lafayette College "Mechanical Engineering Certificate", Spring 2019). On the home page these render as `.bp-cert` cards; the linked ones get a "Show credential" external link.

## Skills (`data/home/skills.json`)

Four categories, rendered on the home page as `03 Skills` pill groups (the section was labelled "Toolchain" until 2026-09-18; on 2026-09-19 "Fixture and Tooling Design" was deduplicated out of Design & Software — it stays under Engineering — and "Toleranceing" corrected to "Geometric Dimensioning & Tolerancing (GD&T)"): **Engineering** (DFM/DFA, GD&T, Lean Six Sigma, fixture and tooling design, product development, process development, …), **Design & Software** (Inventor, CATIA, Fusion 360, LabVIEW, MATLAB, Python, SolidWorks, Siemens NX, LM Studio, oMLX, …), **Controls & Automation** (Allen Bradley PLCs, data logging, Git version control, workflow automation, Windows applications), **Infrastructure & Systems** (Docker, Proxmox, VLAN config, reverse proxy/firewall routing, DNS/subdomain config, Windows/Linux sysadmin).

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
