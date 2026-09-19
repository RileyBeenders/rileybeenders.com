---
target: the public site (home page primary)
total_score: 22
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 4
target_identity: "file:C:\\Users\\riley\\Documents\\GitHub_Repos\\rileybeenders.com\\app\\(site)\\page.tsx"
target_fingerprint: "sha256:a97d3388c3f060b8ccb5c32ef80347f195478c6fdd7395544bb465ffe6c29980"
target_path: "C:\\Users\\riley\\Documents\\GitHub_Repos\\rileybeenders.com\\app\\(site)\\page.tsx"
timestamp: 2026-09-19T00-30-47Z
slug: app-site-page-tsx
---
Method: dual-agent (A: site design review · B: detector + browser evidence), synthesized 2026-09-18.
Target: the public site, primary surface app/(site)/page.tsx (Read mode); representative routes /projects, /contact, /more-info, /about-this-site.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | The nav monogram erases itself on a 7.3s loop and the badge shows "Ope|" mid-type; both read as broken, not as status. |
| 2 | Match System / Real World | 3 | "Toolchain" over Lean Six Sigma and vendor communication; "Meta · Design · Agents" is internal vocabulary. |
| 3 | User Control and Freedom | 3 | No way to stop the idle loops short of the OS reduced-motion setting. |
| 4 | Consistency and Standards | 2 | Faux-bold Instrument Serif on role titles; `--bp-font-display` undefined so project subtitles fall to Georgia; one pill-radius chip in a square system; the internal "Read the full story" link wears the external arrow. |
| 5 | Error Prevention | 3 | Little to get wrong; PDF button disables while busy. |
| 6 | Recognition Rather Than Recall | 3 | The evidence link exists on 1 of 33 bullets and never names its project; emphasis phrases exist only on role 1. |
| 7 | Flexibility and Efficiency | n/a | Read surface with no repeated task. |
| 8 | Aesthetic and Minimalist Design | 2 | Twelve eyebrows, ten infinite animations at rest on /, 46 skill pills, the same three contact links twice on /contact. |
| 9 | Error Recovery | 3 | One error state names the problem; recovery is "try again" when Email is 12px away. |
| 10 | Help and Documentation | n/a | No task needs help; /about-this-site documents the site itself. |
| **Total** | | **22/32** | **Acceptable (69%)** |

## Design Specificity Verdict

**LLM assessment:** split. The bones are authored for Riley: the continuous-stroke B monogram echoed behind the hero, the 16/96 blueprint ruling, the 190px index column, the scroll-filled spine, the date box sitting on the hairline, the timeline's drawn dimension line, the three live demos, and human copy that already exists in the data ("rebuilding cars, replicating movie props", "I usually respond rather quickly"). The trim is category-default and sits on top of everything the visitor sees first: eyebrow labels above every page title (twelve instances, including one that repeats the italic tagline verbatim), tracked uppercase on 25+ selectors so every small text sounds the same, seven idle effects looping at rest, identical translateY lifts on thirteen hover targets, a 9.5px accent-filled "VIEW PROJECT" chip as the only claim-to-proof control, a six-tile count-up stat row, same-size card grids, and "01 / 01" counters.

**Deterministic scan:** 60 findings in the CLI pass (2 warnings, 58 advisories). Warnings: `gradient-text` at blueprint.css:201 (the "About this site" nav link; agrees with the review) and `side-tab` at feature.css:340, which is a CSS-triangle arrowhead on the timeline link and a false positive. The two `codex-grid-background` advisories (blueprint.css:18, feature.css:877) are the committed blueprint surface and its miniature in the Studio demo: false positives. 53 `design-system-font-size` advisories reduce to one real class of drift: sixteen sizes below the documented 11px floor (7, 8, 9, 9.5, 10, 10.5px) in feature.css's timeline badges and mini-Studio demo, plus `.bp-bullet-link` at 9.5px and `.pj-gallery-note` at 10.5px. Three `design-system-color` advisories: an undocumented semantic green for commit insertions (`.tl-size-add`, feature.css:472/474) and the lightbox scrim `rgba(8,16,26,.93)`.

**Browser overlays:** injection succeeded on /, /projects, /contact, /about-this-site in both themes (a [Human] tab was left open at /more-info). The in-page detector agreed with the review on gradient text, the blinking caret in the first viewport, the sheen marquee, the all-caps eyebrow, 88 to 112 characters per line in `.bp-prose`, the 9.5px chip, and a skipped heading level (h1 to h3) on / and /about-this-site. It added: `dark-glow` on the two floating pills in dark mode (their shadow is the fallback navy `rgba(11,26,43,.1)`, invisible on black), low contrast on the footer note (3.9:1) and on accent eyebrows in dark mode (4.4:1), thirty undersized labels on /about-this-site (`.tl-badge` 10px x25), and heading-rhythm faults on the timeline card title and pillar titles (more space below than above). Two overlay false positives were verified and dropped.

## Overall Impression

A resume that already has a material (drawn depth, hairlines, one accent, editorial serif) and a genuinely authored structure, wearing a layer of generated-interface habits that undercut it in the first viewport. The single biggest opportunity is subtraction: remove the eyebrows and the idle loops, fix the grey ramp, and the authored bones read as the whole page.

## What's Working

1. **The document posture.** Summary, experience, toolchain, education in PDF order, 18 to 22px Spectral at 1.68, no marketing block. The ten-second recruiter scan works; the PRODUCT.md constraint is met.
2. **Drawn depth instead of lit depth.** Hairlines in `--rule`, 2px ink rules, the grid, the spine, the role's left rule, the date box on the line. Nothing rests on a shadow, which is why this can be refined rather than rebuilt.
3. **The About page's timeline and demos.** Real commits placed by date, a dimension line for a real interval, the actual tooling shown working. The section a copycat cannot fake, and the tone the rest of the site should borrow.

## Priority Issues

- **[P0] The grey ramp fails contrast on every "faint" and most "muted" text, in both themes.** `lib/palette.ts` fixes `muted` at 45% and `faint` at 60% toward paper; on the active Electric preset that is 3.9:1 for nav links at rest, the brand name, cert issuers, the footer note, and table headers, and 2.3 to 2.5:1 for cert dates, the footer URL, `.pj-index`, `.pj-gallery-note`, `.tl-era`, `.tl-tick-label`. Dark: faint `#666` on `#141414` is 3.2:1. The Default preset fails the same way, so it is by construction. `.bp-bullet-link` is `color: var(--paper)`, which is black on blue in dark mode (4.36:1 at 9.5px). Why it matters: Sam cannot read the dates; Morgan cannot read the issuer of a certificate he is checking. Fix: re-weight the ramp (muted 0.36, faint 0.50, verified to clear 4.5:1 on paper and white in both presets and both themes), re-derive the hand-tuned Default values, move 12 to 13px text off `faint` onto `muted`, and add an on-accent token for text on the accent fill. Suggested command: `$impeccable harden`.
- **[P1] The generated-interface layer: eyebrows, idle loops, gradient text.** Twelve eyebrow labels above headings; ten infinite animations at rest on / (nav monogram draw/erase x4 paths, chase x2, badge ping, badge typewriter caret, Download sheen, footer float, the 9s gradient nav link). The monogram erasing itself is the worst: the brand mark is absent about a third of the time, including in the dark mid-page capture. Why it matters: this is the "AI agent feel" the owner named; eyebrows are the template tell, loops are the page trying to look alive. Fix: remove the redundant eyebrows (keep only where the words carry information the heading does not), make the nav link a normal link, delete the sheen, the ping, and the typewriter, let the monogram draw once and stay (chase only on hover), keep the reader-triggered hover states as they are. Suggested command: `$impeccable quieter`.
- **[P1] Phone chrome eats the screen and the badge crowds the name.** At 390px the sticky nav is 151px tall (three rows, the toggle stranded at right, "About this site" alone on row three). The relocation badge rests beside "Beenders" over the ribbon showing "Ope|" mid-type; its box overlaps the h1 box by 22px (17px of glyph clearance at 390, 2.5px at 375). After scrolling, two floating pills fill both bottom corners and the badge covers body copy on /contact. `Reveal` at `amount: 0.25` on a 1,496px role entry leaves ~370px of blank paper under "02 Experience" before the first job appears. Fix: two-row phone nav (brand + toggle, then a horizontally scrolling link row) under 100px; dock the badge from the start below 860px; lower the reveal threshold. Suggested command: `$impeccable adapt`.
- **[P1] Four typographic faults in a typography-led design.** (a) `.bp-role h3 { font-weight: 700 }` synthesizes a bold Instrument Serif (the face ships 400 only; DESIGN.md's Regular Serif Rule). (b) `--bp-font-display` is never defined, so `.pj-subtitle` and `.pj-proof-subtitle` render in Georgia italic. (c) The drop cap splits "I'm" into an accent "I" and a line starting "'m". (d) `.bp-prose` has no measure: 88 to 112 characters per line. Fix: weight 400, `--bp-font-subheader` in projects.css, drop cap on the first whole word, `max-width: 70ch`, plus tabular numerals on dates and stats. Suggested command: `$impeccable typeset`.
- **[P1] The evidence link is a chip, appears once, and bullet markers drift.** The only claim-to-proof control is the 9.5px uppercase accent pill on 1 of 33 bullets, and it never names the project. On /projects and /about-this-site the `::marker` sits on the last line of every multi-line bullet because `.pj-bullet-content` is `inline-block`. PRODUCT.md's positioning is "every line links to its evidence"; today one line does, in a control that looks like a status tag. Fix: an inline `.bp-link` at the end of the bullet naming the project ("see ICARUS-Lite"), no fill, no radius, 13px; `display: inline` for the bullet content; emphasis phrases on roles 2 to 8 (content work in the Studio). Suggested command: `$impeccable clarify`.
- **[P2] Copy that reads generated where the data is thin.** "One project, the problem each one started from"; the "[Project page is currently under development]" bracket inside the ICARUS summary; an About Me section with no about-me; /contact listing Email, LinkedIn, GitHub twice and "Open to relocation" twice; "Toolchain" over 46 pills with one duplicate ("Fixture and Tooling Design" in two groups) and a typo ("Toleranceing"); the footer's single italic line. Fix: gate the projects copy on count, move the in-progress note to a dated line under the date box, drop one of the two contact groups, rename and dedupe the skills, write an About Me or hide the section. Suggested command: `$impeccable distill`, `$impeccable clarify`.
- **[P2] Sixteen text sizes below 11px and two heading-rhythm faults in the About page's timeline and demos.** `.tl-badge` 10px (x25), `.dm-eyebrow` 10px, `.dm-prev-eyebrow` 7px, `.dm-prev-btn` 8px, demo body lines 10.5px; `h4.tl-card-title` and the pillar titles carry more space below than above. Fix: floor at 11px (the demos may stay miniature but their text must be readable), tighten the space under those headings. Suggested command: `$impeccable typeset`.

## Persona Red Flags

**Jordan (first-timer, laptop):** reads "R&D · Electromechanical · Automation" and then the identical italic title 300px lower; cannot tell "More Info" from "About this site"; watches the B in the nav erase itself and assumes the page is still loading; expects software under "Toolchain".

**Casey (distracted, phone):** 151px sticky nav; the badge typing beside the surname; blank paper before the first job; two floating pills across a 390px bottom edge; the badge covering the contact paragraph; a 10,759px page whose section indexes are `<p>`, so nothing jumps to Education; the "VIEW PROJECT" chip is 26px tall.

**Sam (keyboard, screen reader, contrast):** the P0 above; black-on-blue chip in dark mode; the gradient link's `-webkit-text-fill-color: transparent` disappears in forced-colors mode; `ScrollWords` starts the About intro at 25% opacity; timeline labels appear only on hover or selection, so a sighted keyboard user tabs dot by dot. Good: focus rings everywhere, `aria-label` on the chip, `sr-only` label in the badge, `role="switch"`, `aria-expanded` on the case-study toggle.

**Morgan (hiring manager, PDF open, checking one claim):** finds the bullet; finds no link unless it is the ICARUS line; opens the one case study and reads "[under development]"; cannot confirm the site matches the PDF revision (no date or version on /); reads "Industrial Design" under a machine's name as a category tag; the role-1 hover emphasis suggests "these words are backed" but clicking does nothing.

## Minor Observations

- DESIGN.md says no monospace on the public site; feature.css uses IBM Plex Mono for hashes, counts, and demo labels (data, justified; the doc is stale). The vault still calls the Download button red.
- `.tl-size-add` hard-codes `#2e7d4f` / `#6cc48e`; document it as the semantic insertion green or derive it.
- The floating pills' shadow is a hard-coded navy (`rgba(11,26,43,.1)`) that vanishes on black; derive from `--ink`.
- The hero ribbon at 10% reads as a large "3" (the B's bowls without the stem).
- Two of six ICARUS photos are letterboxed with 22px paper padding beside four cover-cropped ones.
- The cert grid leaves an orphan cell (8 in 3 columns).
- `about-site.json` `screenshots[home-dark].src` points at `home-hero-light.png`.
- One identical `Reveal` rise on every section, index, role, and card; the hero's staggered name is the authored moment, the rest could simply be present.
- `BpComingSoon` (rings, rotating phrases, sweep bar) is dead UI now that a project is published.
- `background-attachment: fixed` is ignored by iOS Safari, so the grid scrolls with the page there.
- The section index labels could be anchors (`id="experience"`) for free jump links.
- No `::selection`, `caret-color`, `accent-color`, `scrollbar-color`, `text-underline-offset`, or `tabular-nums` anywhere in blueprint.css: the browser's defaults carry the page.

## Questions to Consider

- If the PDF is the official document and the site is the proof, why does the home page repeat the PDF word for word instead of showing what the PDF cannot: the machines' names as links, photographs, the roles on the same timeline the About page already knows how to draw?
- Seven things move on the home page while nobody is touching it. Which one is Riley's, and would he notice the other six were gone?
- "16 applications tracked, each with a tailored PDF" is public. When Morgan reads it, is he the one, or one of sixteen?
