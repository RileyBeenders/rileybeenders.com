---
target: the Studio (local content editor)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\riley\\Documents\\GitHub_Repos\\rileybeenders.com\\studio\\ui\\index.html"
target_fingerprint: "sha256:327271a571d0ff69e83a84038ba8bd803fa84df1d5b62a4373516cfb163c6d10"
target_path: "C:\\Users\\riley\\Documents\\GitHub_Repos\\rileybeenders.com\\studio\\ui\\index.html"
timestamp: 2026-09-19T00-30-47Z
slug: studio-ui-index-html
---
Method: dual-agent (A: Studio design review · B: detector + browser evidence), synthesized 2026-09-18.
Target: the Studio, studio/ui/index.html (Operate mode; local content editor, never deployed).

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Dirty state shows three ways, but there is no "Saving…" state, no last-saved time, `#status` is not live, the tab title never changes. |
| 2 | Match System / Real World | 3 | Rail in site order, labels in the site's words. "Site mode: not read by the site yet"; two "Cover" fit options mean the same thing. |
| 3 | User Control and Freedom | 2 | 24 instant Remove buttons on one project with no undo; the 409 recovery is "Reload", which discards the work. |
| 4 | Consistency and Standards | 3 | One button vocabulary and icon family; but a "Live" tag renders on entries with no visibility switch. |
| 5 | Error Prevention | 2 | Revision guard and atomic writes, but required fields are never validated client-side; an empty required alt text saves as "". |
| 6 | Recognition Rather Than Recall | 3 | Thumbnails, swatches, ref dropdowns; `screenshotId` / `linkFrom` are free-text IDs remembered from another card. |
| 7 | Flexibility and Efficiency | 1 | Ctrl/Cmd+S exists and is never surfaced; reorder is one click per step with a full repaint; no collapse, no search across 17 proofs. |
| 8 | Aesthetic and Minimalist Design | 2 | Everything is expanded: 149 controls on ICARUS-Lite, 1,048 on About this site, ten custom color pickers shown when the palette is not Custom. |
| 9 | Error Recovery | 2 | Server messages are good, but errors are toasts, not on the field, and the error toast is the accent color, same as "Unsaved changes". |
| 10 | Help and Documentation | 3 | Inline help is specific and in Riley's voice; nothing mentions Ctrl+S, backups, or the conflict guard. |
| **Total** | | **23/40** | **Acceptable (58%)** |

## Design Specificity Verdict

**LLM assessment:** a well-built generic three-pane admin wearing the site's palette, with Riley's voice in the help text and a genuinely product-specific data story underneath. Generic: the pencil-emoji favicon while the site has a monogram; a tracked-uppercase "STUDIO" wordmark; a `Site ↗` text glyph; centered document title over a mono path; strikethrough on hidden entries (the state of 26 of 27 entries, so the list reads as a graveyard); a green second hue for on/live/eye; 7 to 12px radii on every control in a square system; a 24px uniform grid standing in for the site's 16-in-96 blueprint; bare-text status, a black toast pill, `window.confirm()`; "Image 1 … Image 6" card titles that carry no content. Product-specific and worth building around: the rail as the site's table of contents with hairlines as page breaks; the byte-stable save (schema order is key order, empties dropped, unknown keys kept); the sha1 revision guard, atomic rename, and 25 rolling backups; the emphasis-phrase editor with "Accent selection"; the word count under the Summary; help copy about the real site; palette cards previewing the real presets; the Lucide sun/moon matching the site toggle.

**Deterministic scan:** 24 findings, all advisory, all in studio.css: 17 `design-system-radius` (4 to 12px on inputs, cards, buttons, the modal, the toast; DESIGN.md's scale is 0 / 999px / 50%), 6 `design-system-font-size` (11px on the file path, tag, word count, empty thumb, palette description, picker meta; the ramp bottoms at 12px), and one `codex-grid-background` on `body` (the grid is the brand surface; false positive as slop, but its parameters differ from the site's). No color, font-family, or markup findings.

**Browser overlays:** injection succeeded on Summary, Projects (ICARUS-Lite), and Site Settings in dark mode. The in-page detector found 2 issues on Summary (`.f-count` 3.7:1 and 11px), 35 on the project form (30 low-contrast: every `.f-help` at 3.2 to 3.7:1, the "Delete" button 3.8:1, the legends 4.1:1; 4 tiny-text at 11.5px), and 16 on Site Settings (14 low-contrast on legends and help, one all-caps body label). A page-level `dark-glow` was the detector's own overlay and was dropped.

## Overall Impression

The plumbing is Riley's (the save story, the rail, the help copy); the surface is a template. The biggest opportunity is structural: lock the workspace to the viewport so the three panes scroll independently, then let the form collapse, and the tool becomes a drafting room instead of a 43,000px scroll.

## What's Working

1. **The data contract.** Schema order equals disk order, empties are dropped, unknown keys are preserved, writes are revision-guarded and atomic with backups. This is the story the redesign should make visible.
2. **The rail as the site's own index.** Page-order groups with hairline page breaks, opening on Summary. The one piece of information architecture that could only belong to this site.
3. **The help copy and the emphasis editor.** Every help line is specific to what the site does with the field; "Select text above to add a phrase" is a small, real interaction designed for this resume.

## Priority Issues

- **[P0] The workspace is not viewport-locked, so the panes never scroll independently.** `body { min-height: 100vh }` lets `.workspace` grow to content; `.detail` and `.list-body` have `overflow-y: auto` but no height constraint. Measured: all three columns 6,786px tall on Projects, 42,894px on About this site; the rail and list scroll away while editing; the scrollTop save/restore in `paintDetail` is a no-op. Fix: `body { height: 100dvh; overflow: hidden }` with `.workspace { min-height: 0 }`, keep `.detail` and `.list-body` as the scroll containers (the stacked layout under 1080px keeps document scroll). Suggested command: `$impeccable layout`.
- **[P1] Focus, naming, and live-state semantics.** No shared `:focus-visible` rule (only the switch, toggle, and two remove buttons have one; rail items, list rows, every `.f-btn`, the icon buttons, palette cards, and picker tiles rely on the UA ring); no `aria-current` on the active rail or list item; `#status` has no `aria-live`; the unsaved dot is title-only; 24 unnamed controls (2 switches, 16 string-list row inputs, 6 image path inputs whose label points at a wrapper div); 18 list-tool icon buttons have `title` only; "Live" renders on Experience and Skills entries that have no visibility switch. Fix: one `:focus-visible` rule in the site's vocabulary (2px accent, 3px offset), `aria-current`, `aria-live="polite"`, explicit input ids in `fieldShell`, `aria-label` on row inputs and switches, the tag only when `schema.visibilityField`. Suggested command: `$impeccable harden`.
- **[P1] Contrast on the small text that carries the instructions.** Light: `--faint` on paper 2.5:1 (every `.f-help` at 12px, `.f-count`, `.brand-sub`, `#doc-path`, hidden list names), `--muted` on paper 3.9:1 (`.f-label`, `.status`, `.list-head h2`, `.list-sub`), `--muted` on panel 3.55:1 (`.f-card-title`), green "Live" 4.3:1, "Delete" 4.4:1, UA placeholder 4.2:1. Dark: `--faint` 3.2 to 3.7:1 on help text, legends 4.1 to 4.35:1, "Delete" 3.8:1. Fix: adopt the site's re-weighted ramp (muted 0.36, faint 0.50) in the Studio's pre-computed tints, promote `.f-help` to muted at 13px and `.f-label` / `.f-card-title` to ink-soft, reserve faint for rules and disabled chrome, style `::placeholder`, drop the green. Suggested command: `$impeccable colorize` with `harden`.
- **[P1] The long form has no structure the owner can hold.** 149 controls in one 6,779px column on ICARUS-Lite (41 inputs, 5 textareas, 12 selects, 72 icon buttons, 8 "Add" buttons, 16 required marks), one `<h2>` and no other headings, eight fully-open gallery cards titled "Image n"; About this site is 48 screens tall. Fix: object-list cards become `<details>` whose summary is built from content (thumbnail plus alt or caption, or a bullet's first words), open only for the newest card; card titles as headings; a sticky mini-index of the top-level field labels in the detail's margin, in the site's index-column pattern. Suggested command: `$impeccable distill`, then `$impeccable layout`.
- **[P2] The Studio has drifted out of the site's visual world.** 17 rounded corners; a green second hue; a 24px 6% grid; the pencil-emoji favicon; the "STUDIO" wordmark; the `Site ↗` glyph; three form measures (780 / 812 / 920); a 111ch Summary textarea. Fix: square corners except the two switches, on-state and eye in the accent, the site's 16-in-96 grid, the monogram as favicon and brand, a drawn arrow, one measure. Suggested command: `$impeccable polish`.
- **[P2] The save lifecycle has one state and a destructive recovery.** No saving state; "Saved" carries no time or scope; the 409 says "Reload". Fix: status cycles Unsaved → Saving… → Saved 11:42 pm (the server already returns `savedAt`); the toast names the entry and the size of the change; on 409 keep the unsaved copy across the reload. Suggested command: `$impeccable harden`, then `clarify`.
- **[P3] Picker defaults, weight, and the theme switch.** The upload folder defaults to `project-artifacts` alphabetically; the active tile is not scrolled into view; every tile loads the full 8 to 10MB JPG; the 16MB limit appears only on failure. Toggling the theme starts 469 CSS transitions at once because every input transitions its four border colors. Fix: default both selects to the current image's folder, `scrollIntoView` the active tile, state the limit under the file input, transition only on interaction states. Suggested command: `$impeccable optimize`.

## Persona Red Flags

**Alex (impatient power user):** Ctrl+S is the only shortcut and nothing says so; moving the last project to the top is eight clicks with eight repaints; no drag, no Alt+arrow reorder, no bulk hide/show, no search over 17 proofs; `Site ↗` opens `/` in a new tab per click, so the two-window scene becomes six tabs.

**Sam (keyboard, screen reader):** 184 tab stops on the Projects screen; UA focus rings only; no `aria-current`; 24 unnamed inputs; dirty state never announced; "Image 1" is a span, not a heading; help text at 2.5:1; error and brand share one color.

**Riley the stress-tester:** 20 images is ~10,000px of open cards and every image loaded twice at full size; refresh with unsaved changes gets the `beforeunload` prompt and then loses everything; a second tab's save 409s and the only path discards it; "Remove" on an image card is instant.

**Riley at 11pm before a deadline:** "+ New" gives an empty ID to type by hand (the slug control swaps whitespace for hyphens but never lowercases, while the help says "Lowercase"); the upload lands in `project-artifacts` unless the folder is changed every time; the save toast says a file path, not "ICARUS-Lite is on /projects"; required alt text can be skipped silently.

## Minor Observations

- The error toast is the accent color, indistinguishable from brand; the site has no error color either.
- `.f-card-head` stacks a 3% ink tint on `--panel` on a `--rule` border: two elevation declarations.
- "Fit" offers "Cover (fill the frame)" and "Cover (explicit)".
- The "Order" number field and the arrows are two sources of truth.
- `spellcheck` stays on for URL and path inputs.
- The 26 by 26px icon buttons are under the 44px touch floor (fine for a mouse tool, worth knowing).
- Under 1080px the rail wraps into a row and the list caps at 320px, so the scroll problem appears inverted.
- Reduced-motion blanket rule is correct for a tool; the palette card's 2px lift matches the site.

## Questions to Consider

- The real scene is two windows: why is the Studio a form beside the site rather than a margin on it? If the running site were the canvas and the form lived in the drafting margin, preview would stop being a feature and become the page.
- The JSON is the source of truth and git is the history, but the Studio hides both. What if "Saved" showed the diff and the About page's timeline wrote itself from it?
- 26 of 27 entries are hidden. Is the Studio a publishing tool with a drafts problem, or a drafts drawer with one published item? Right now it treats the majority state as an exception drawn in strikethrough.
