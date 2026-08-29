---
tags: [data, content]
---

# Career Content

The professional content that flows through [[Data Layer and Types|resumeData.ts]] into the pages. Source files: `data/home/experience.json`, `data/home/education.json`, `data/home/skills.json`, `data/home/summary.json`, `data/projects/projects.json`, `data/projects/proofs.json`.

**Rendering note (post-reskin):** on `main` the home page (`app/(site)/page.tsx`) renders `experience`, `skills`, `education`, and `summary` directly as an editorial layout — plain bullet `<li>`s, no proof/project chips. `projects` is used **only** by `/projects` (top 6 by `order`, `name` + `type`). `proofs` is pruned to `[]` at runtime and rendered nowhere. So most of the structure below (project `additionalInfo`, `images`, `bullets`; the whole `proofs.json` file) is currently dormant data.

## Experience (`data/home/experience.json`)

8 entries, most recent first:

| Company | Role | Location | Dates |
|---|---|---|---|
| Proteor / Proteor Printing Solutions | Lead, Research & Development Engineer | Coplay, PA | Jan 2025 – Present |
| Filament Innovations | Chief Technology Officer | Whitehall, PA | Jan 2023 – Jan 2025 |
| Filament Innovations | Lead Electro-Mechanical Engineer | Whitehall, PA | Jun 2022 – Jan 2023 |
| Filament Innovations | Industrial Engineer | Whitehall, PA | Apr 2021 – Jun 2022 |
| Filament Innovations | Engineering Technician | Whitehall, PA | May 2020 – Apr 2021 |
| RJB.Engineering | Owner & Engineering Consultant | Pennsylvania | 2015 – Present |
| Blue Mountain Ski Resort | Ski Lift Operator | Palmerton, PA | Nov 2019 – Jan 2021 |
| Northampton Area School District | Computer / Network Technician | Northampton, PA | Jun 2016 – Aug 2019 |

Filament Innovations was acquired by Proteor in January 2025 (the current role's `context` field explains the CTO → Lead R&D Engineer transition with expanded East Coast + global-portfolio scope). Bullets still carry `projectId` / `proofId` fields, but `resumeData.ts` strips them before any page sees them (both visibility flags are `false`).

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

`/projects` shows the first 6 of these (by `order`) as name/type teasers in `BpComingSoon`. `icarus-lite` still has an `images[]` array (two identical `IcarusLiteRender.png` entries) and every project has `additionalInfo.assets` pointing at `public/project-artifacts/*.svg`, but none of that renders on `main`.

**`unifi-network` is still a placeholder** — `bullets: []` and `additionalInfo` full of literal placeholder strings (`"title": "title"`, `"constraint01"`, etc.). Genuine in-progress content gap; flag it if asked to "finish" project content.

## Proofs (`data/projects/proofs.json`)

17 entries. This file is imported by `resumeData.ts` and then dropped (`resumeData.proofs === []` at runtime, because `visibility.proofIndex` and `experienceProofButtons` are both `false`), and there is no proof UI on `main` — so nothing surfaces it directly.

Entries with **no matching project** (`projectId` absent — they only ever backed experience bullets in the old design): `strain-gauge-probing`, `nonplanar-research`, `kratos`, `product-reliability`, `rjb-engineering`, `ski-lift-systems`, `school-network`.

`ExtrusionLine-Studio`, `ExtrusionLine-Studio_Modbus`, and `ExtrusionLine-Studio_SimpleStart` now all exist as entries (the latter two were the outstanding "to create" items in the old `README_TODO.md`; the TODO text is stale on that point).

## Education (`data/home/education.json`)

One degree: **BS, Electro-Mechanical Engineering**, Penn State University, December 2024. Eight certificates: four MathWorks "OnRamp" certs (MATLAB, Simulink, Simscape, Machine Learning — all "Issued July 2026", each with a `credentialUrl`), Lean Six Sigma Yellow Belt (Jul 2025) and White Belt (Jun 2025) from Educate 360, plus two non-linked certificates (Penn State "Certificate in Engineering Design and Tools", Spring 2023; Lafayette College "Mechanical Engineering Certificate", Spring 2019). On the home page these render as `.bp-cert` cards; the linked ones get a "Show credential" external link.

## Skills (`data/home/skills.json`)

Four categories, rendered on the home page as `03 Toolchain` pill groups: **Engineering** (DFM/DFA, GD&T, Lean Six Sigma, product development, process development, …), **Design & Software** (Inventor, CATIA, Fusion 360, LabVIEW, MATLAB, Python, SolidWorks, Siemens NX, LM Studio, oMLX, …), **Controls & Automation** (Allen Bradley PLCs, data logging, Git version control, workflow automation, Windows applications), **Infrastructure & Systems** (Docker, Proxmox, VLAN config, reverse proxy/firewall routing, DNS/subdomain config, Windows/Linux sysadmin).

## Summary (`data/home/summary.json`)

The single professional-summary paragraph rendered under `01 Summary` on the home page (with a drop-cap on the first letter) — electromechanical engineer / R&D leader spanning mechanical, electronics, controls, software, and manufacturing, explicitly framing the website as "another extension of my curiosity." Also used verbatim as the "Profile" section of the generated PDF.

## Open content TODOs (`README_TODO.md`)

- Whether to merge `proofs` into `projects` is an open question.
- "Alter Line 136" — link the network project to VLAN/Wifi routing detail (refers to an older `experience.json`; the `unifi-network`-tagged bullet is the current target).
- The two ExtrusionLine proofs it lists as "to create" already exist — that item is done.

## Related
- [[Data Layer and Types]]
- [[Projects Route (BpComingSoon)]]
- [[Home]]
