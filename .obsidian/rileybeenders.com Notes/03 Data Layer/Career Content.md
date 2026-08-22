---
tags: [data, content]
---

# Career Content

The actual professional content that flows through [[Data Layer and Types|resumeData.ts]] into every page. Source files: `data/home/experience.json`, `data/home/education.json`, `data/home/skills.json`, `data/home/summary.json`, `data/projects/projects.json`, `data/projects/proofs.json`.

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

Filament Innovations was acquired by Proteor in January 2025 (the current role's `context` field explains this — the person's title changed from CTO to Lead R&D Engineer with expanded East Coast + global-portfolio scope). Bullets across these roles link out to 9 distinct `projectId`s and 7 distinct `proofId`s.

## Projects (`data/projects/projects.json`)

9 entries, each with an `order` (drives grid sort order in [[ProjectsExplorer and ProjectDetails]]) and a full `additionalInfo` drawer payload:

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

Only `icarus-lite` currently has an `images[]` gallery (two entries, both `IcarusLiteRender.png` — effectively a single image today). Every project has at least one `public/project-artifacts/*.svg` abstract diagram in its `additionalInfo.assets`.

**`unifi-network` is a placeholder** — its `bullets` array is empty and its `additionalInfo` still has literal placeholder strings (`"title": "title"`, `"constraint01"`, `"approach01"`, etc.). This is a genuine in-progress content gap, not a documentation error — flag it if asked to "finish" project content.

## Proofs (`data/projects/proofs.json`)

~17 entries. Most map 1:1 to a project via `projectId`, but several exist as **standalone evidence with no matching project entry** (they're referenced only from experience bullets, not from the projects grid):

- `strain-gauge-probing`, `nonplanar-research`, `kratos`, `product-reliability`, `rjb-engineering`, `ski-lift-systems`, `school-network` — no `projectId`.

Two proofs referenced by experience bullets don't yet exist as entries in `proofs.json` at all: `ExtrusionLine-Studio_Modbus` and `ExtrusionLine-Studio_SimpleStart` are used as `proofId`s inside `projects.json`'s `ExtrusionLine-Studio` bullets, but `README_TODO.md` explicitly lists creating those two proofs as outstanding work.

Currently `resumeData.proofs` renders as `[]` at runtime regardless of this file's contents, because `visibility.proofIndex` and `visibility.experienceProofButtons` are both `false` — see [[Data Layer and Types]].

## Education (`data/home/education.json`)

One degree: **BS, Electro-Mechanical Engineering**, Penn State University, graduated December 2024. Eight certificates: four MathWorks "OnRamp" certs (MATLAB, Simulink, Simscape, Machine Learning — all issued July 2026, each with a `credentialUrl`), Lean Six Sigma Yellow Belt (Jul 2025) and White Belt (Jun 2025) from Educate 360, plus two non-linked certificates (Penn State Engineering Design and Tools, Spring 2023; Lafayette College Mechanical Engineering Certificate, Spring 2019).

## Skills (`data/home/skills.json`)

Four categories: **Engineering** (DFM/DFA, GD&T, Lean Six Sigma, product development, etc.), **Design & Software** (Inventor, CATIA, Fusion 360, LabVIEW, MATLAB, Python, SolidWorks, Siemens NX, etc.), **Controls & Automation** (Allen Bradley PLCs, Git, workflow automation), **Infrastructure & Systems** (Docker, Proxmox, VLANs, reverse proxy, Windows/Linux sysadmin).

## Summary (`data/home/summary.json`)

The single professional-summary paragraph rendered under "Summary" on the homepage — describes the person as an electromechanical engineer/R&D leader spanning mechanical, electronics, controls, software, and manufacturing, and explicitly frames the website itself as "another extension of my curiosity."

## Open content TODOs (`README_TODO.md`)

- Whether to merge `proofs` into `projects` is an open question ("Not sure if it makes sense to do so yet").
- Create `ExtrusionLine-Studio_Modbus` and `ExtrusionLine-Studio_SimpleStart` as real proofs (text + skills still need writing).
- "Alter Line 136" — a note to link the network project to VLAN/Wifi routing detail (refers to an older version of `experience.json`; the `unifi-network`-tagged bullet is the current target).

## Related
- [[Data Layer and Types]]
- [[ProjectsExplorer and ProjectDetails]]
- [[Home]]
