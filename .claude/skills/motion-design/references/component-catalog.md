# svelte-bits component catalog, rated for Blueprint Press

Every component in svelte-bits (`DavidHDev/svelte-bits`, `main` @ `ad44142`, 2026-09-09; MIT + Commons Clause, © David Haz) with its mechanism, its runtime, a verdict for *this* site, and what it becomes here. Source path for any row: `src/lib/components/library/<Category>/<PascalName>/<PascalName>.svelte`.

**Verdicts**
- **adopt** — the mechanism fits; re-implement in framer-motion/CSS at Blueprint amplitude (see `motion-fluidity` recipes).
- **adapt** — keep the idea, change the material (glow → hairline, glass → paper) or cut the amplitude by half or more.
- **avoid** — wrong material, wrong scale, wrong runtime, or contradicts a site decision (no pinning, no cursor replacement, no WebGL).

**Runtime column** is the dependency the original declares. `—` means vanilla DOM/CSS. None of these get installed here; the column tells you how much translation work the recipe is.

Contents: [Text Animations](#text-animations) · [Animations](#animations) · [Components](#components) · [Backgrounds](#backgrounds) · [Landing-page pieces](#landing-page-pieces-not-in-the-library)

## Text Animations

| Component | Mechanism | Runtime | Verdict | Blueprint translation |
|---|---|---|---|---|
| Split Text | GSAP SplitText into chars/words/lines; `fromTo` `{opacity:0,y:40}` → `{1,0}`, `power3.out`, 1.25s, stagger 50ms, ScrollTrigger `once`, waits for `document.fonts.ready` | gsap | **adopt** (words) | Split headings/eyebrows into word `<span>`s; framer `staggerChildren 0.06`, y 14→0, `EASE`, 0.7s. Chars only for the two-word hero name, if ever. |
| Blur Text | Per-word/letter spans; keyframes `blur(10px) op 0 y ∓50` → `blur(5px) 0.5 ±5` → `blur(0) 1 0`, 0.35s/step, 200ms stagger, IntersectionObserver once | motion | **adopt** | Same 3-step keyframe with blur 6→2→0, y 14→2→0, stagger 0.06. Eyebrows, section indexes, `pj-title`. Not prose. |
| Circular Text | Letters on a rotating circle | motion | avoid | Decorative; the site has the monogram. |
| Text Type | Typewriter: 50ms/char, 30ms delete, 2s pause, blinking cursor, optional variable speed | gsap | adapt | A once-only typed eyebrow on load (no delete loop, no cursor after finish). Rarely worth it. |
| Shuffle | Per-char slide/shuffle-in on view | gsap | avoid | Too playful for a résumé. |
| Shiny Text | `background-clip: text` gradient sweeping via rAF-driven `background-position`, 2s cycle, pause-on-hover | — | adapt | CSS keyframe sweep `--ink-soft` → `--ink` → `--ink-soft` on one eyebrow or the footer URL, 6–8s, pause on hover, off under reduced motion. |
| Text Pressure | Variable-font axes react to cursor distance | — | avoid | Instrument Serif/Spectral aren't variable here; too showy anyway. |
| Curved Loop | Text on an SVG path marquee | — | avoid | — |
| Fuzzy Text | Canvas-rendered jitter on hover | — | avoid | — |
| Gradient Text | Animated multi-stop gradient clip, 8s yoyo | motion | avoid | Off-palette. |
| Falling Text | matter-js physics dropping words | matter-js | avoid | — |
| Text Cursor | Trailing text follows cursor | motion | avoid | Cursor replacement. |
| Decrypted Text | Random chars settle into the real text | — | avoid | Hacker aesthetic. |
| True Focus | Words blur except the active one; a cornered frame springs between them, 0.5s, 1s pause | motion | adapt | The *frame* only: a hairline rectangle in `--rule` that springs to the hovered nav link or toolchain pill. Keep the blur off. |
| Scroll Float | Chars rise from `yPercent 120, scaleY 2.3, scaleX 0.7`, `back.inOut(2)`, scrubbed | gsap | adapt | Scrub is fine, the squash is not: a section index (`01 Summary`) drifting y 12→0 with `useScroll`, no scale. |
| Scroll Reveal | Block rotates 3°→0 and words fade 0.1→1 (+ blur 4→0) as the block scrolls, scrubbed, stagger 0.05 | gsap | **adopt** | The summary paragraph's first sentence or the footer note: opacity 0.25→1 per word, rotate ≤2°, `useScroll` offset `["start 0.9","start 0.45"]`. Once per page. |
| ASCII Text | three.js ASCII shader | three | avoid | — |
| Scrambled Text | GSAP ScrambleText within cursor radius | gsap | avoid | — |
| Rotating Text | Phrases cycle; chars spring in from `y 100%` and exit to `-120%`, `stiffness 300 damping 25` | motion | adapt | One cycling noun in the hero tagline ("R&D · **Electromechanical** · Automation"), words not chars, `AnimatePresence` with `EASE`, 4s hold. Only if the tagline has ≥3 peers; otherwise avoid. |
| Glitch Text | CSS clip-path glitch | — | avoid | — |
| Scroll Velocity | Marquee whose speed follows scroll velocity through a spring (`stiffness 400 damping 50`) | — | adapt | Direction/speed coupling is nice; use it on a *slow* toolchain-pill marquee if one exists, never on text. |
| Variable Proximity | Variable-font weight by cursor distance with linear/exp/gaussian falloff | — | avoid | Fonts aren't variable; effect is loud. The *falloff functions* are worth borrowing for any proximity effect. |
| Count Up | Number springs from→to on view (`damping 20+40/duration`, `stiffness 100/duration`), `Intl.NumberFormat`, separators | motion | **adopt** | Any stat: years, project count, image count. `useSpring` on a `MotionValue`, format with `Intl`, `tabular-nums`. |

## Animations

| Component | Mechanism | Runtime | Verdict | Blueprint translation |
|---|---|---|---|---|
| Animated Content | Scroll-gated entrance: `distance 100` on an axis, optional scale, opacity, `power3.out` 0.8s, `once`, threshold→`start` percent | gsap | **adopt** | This *is* `Reveal`. Extend `Reveal` with `as="slide"` (x 18→0) and a `from="left"/"right"` prop rather than adding a new component. |
| Fade Content | Opacity (+ optional `blur(10px)`) entrance, `power2.out`, 1s | gsap | **adopt** | `Reveal as="fade"` with optional `blur` prop (≤6px). For images and cards where a rise would fight the grid. |
| Electric Border | SVG turbulence-filtered animated border | — | avoid | — |
| Orbit Images | Images orbit a center | motion | avoid | — |
| Pixel Transition | Grid of pixels flips to reveal content on hover | gsap | avoid | — |
| Glare Hover | A diagonal gradient band sweeps `-100% -100%` → `100% 100%` on enter, 650ms ease | — | adapt | A faint paper sheen (`--white` at 30% alpha, 12% band) across `.bp-cert` or a gallery shot on hover. Barely visible is correct. |
| Antigravity | three.js particles | three | avoid | — |
| Logo Loop | Infinite track, `translate3d` by rAF, velocity eased with `1-exp(-dt/τ)`, pause/slow on hover, edge fade, reduced-motion stop | — | **adopt** (mechanism) | CSS-only marquee of toolchain pills, doubled track, `translateX(-50%)` keyframe 40–60s, `animation-play-state: paused` on hover, mask-image edge fade. Optional; pills are content and static is the default. |
| Target Cursor | Cursor replaced by a targeting reticle | gsap | avoid | — |
| Magic Rings | three.js rings | three | avoid | — |
| Laser Flow | three.js beam | three | avoid | — |
| Magnet Lines | Grid of lines rotate to point at cursor | — | avoid | Too much; the blueprint grid is texture, not a toy. |
| Ghost Cursor | three.js trailing ghost | three | avoid | — |
| Gradual Blur | Stack of 5 masked `backdrop-filter` layers making a progressive blur at an edge; optional scroll/hover animation | — | adapt | A soft *opacity* fade (not backdrop blur) at the bottom of any clipped list, matching `.pj-lightbox`'s materials. |
| Click Spark | Canvas radial sparks on click, 400ms | — | avoid | — |
| Cursor Grid | Grid cells react to cursor | — | avoid | — |
| Magnet | Inner element translates toward cursor by `(cursor−center)/strength` while inside `padding` px of the bounds; `0.3s ease-out` in, `0.5s ease-in-out` out | — | **adopt** | `.bp-btn`, `BackToTop`, the theme toggle: strength 6–8 (≈ 4–6px max), `useMotionValue` + `useSpring`, hover-media gated. |
| Sticker Peel | Draggable peeling sticker | gsap | avoid | — |
| Pixel Trail | three.js pixel trail | three | avoid | — |
| Cubes | 3D cube grid | gsap | avoid | — |
| Metallic Paint | WebGL liquid metal | — | avoid | — |
| Noise | Canvas film grain redrawn every N frames, alpha 15 | — | avoid | The blueprint grid is the texture; grain on top muddies it. |
| Shape Blur | three.js | three | avoid | — |
| Crosshair | Cursor crosshair lines | gsap | avoid | — |
| Image Trail | Trailing images behind cursor | gsap | avoid | — |
| Ribbons | ogl ribbons | ogl | avoid | — |
| Splash Cursor | Fluid-sim cursor | — | avoid | — |
| Meta Balls | ogl metaballs | ogl | avoid | — |
| Blob Cursor | Trailing blob cursor | gsap | avoid | — |
| Star Border | Two radial-gradient sweeps travel the top and bottom edges, `linear` alternate, 6s | — | adapt | A single hairline that traces around `.bp-btn--solid` on hover using a `conic-gradient` mask or an SVG `stroke-dashoffset` draw (the site already owns `bp-draw-in`). Ink, not white. |

## Components

| Component | Mechanism | Runtime | Verdict | Blueprint translation |
|---|---|---|---|---|
| Animated List | Items in a scroll container scale `0.7→1` and fade as they cross 50% visibility (IO with `root: list`), `0.2s ease 0.1s`; top/bottom gradient masks track scroll; arrow-key nav | — | **adopt** (idea) | Any clipped list (Studio, more-info tables): IO-driven `is-in` class, scale 0.98→1, opacity. The gradient-mask-by-scroll-position trick is worth reusing. |
| Scroll Stack | Lenis smooth scroll; cards pin and scale `0.85 + i·0.03`, stack offset 30px | lenis | avoid | Site decision: no pinning. |
| Bubble Menu | Blobby expanding menu | gsap | avoid | — |
| Magic Bento | Per-card: hover lift −2px + shadow; cursor-tracked border glow via `--glow-x/y/intensity` and a `conic`/`radial` mask; optional tilt ±10°, magnetism 5%, click ripple, particles; global 800px spotlight following the cursor; disabled ≤768px | gsap | adapt | Keep **only** the hover lift (already have it) and the cursor-position border highlight as a hairline in `--rule` → `--ink-soft`. No particles, ripple, spotlight orb, or tilt. |
| Circular Gallery | ogl bent gallery | ogl | avoid | — |
| Reflective Card | Holographic foil reflection | — | avoid | — |
| Card Nav | Nav that expands into cards | gsap | avoid | — |
| Stack | Draggable card stack | motion | avoid | — |
| Pill Nav | Hover: a circle scales up from the pill's bottom while the label slides up and a second label slides in; `power3.easeOut`; initial load: logo scale 0→1, nav width 0→auto, 0.6s | gsap | adapt | The *label swap* only, as a 1px `translateY` nudge with the underline — the site's `.bp-nav-link::after` already does the important part. |
| Tilted Card | `perspective 800px`; `rotateX/Y` from cursor offset × 14°, `scale 1.1`, spring `stiffness 100 damping 30 mass 2`; cursor-following caption with velocity-based rotation | motion | adapt | `.pj-shot` and `.bp-cert`: ≤4°, scale ≤1.01, same spring, no caption. Hover-media gated. |
| Masonry | GSAP-laid-out masonry with entrance | gsap | avoid | `ProjectGallery` already handles layout with CSS grid. |
| Glass Surface | SVG-filter refraction glass | — | avoid | Wrong material. |
| Dome Gallery | 3D dome of images | — | avoid | — |
| Chroma Grid | Cursor-tracked color grid | gsap | avoid | — |
| Folder | Folder opens on hover revealing papers | — | avoid | — |
| Staggered Menu | Full-screen staggered menu | gsap | avoid | — |
| Model Viewer | three.js GLTF viewer | three | avoid | — |
| Profile Card | Holographic tilt card | — | avoid | — |
| Dock | macOS dock: each item's size = `transform([-d,0,d],[base,mag,base])(cursorDistance)` through spring `mass 0.1 stiffness 150 damping 12`; panel height springs on hover; tooltip fades in | motion | adapt | The distance→size mapping is a great model for *any* proximity effect. Apply at tiny amplitude to the nav links (letter-spacing or underline width) or don't. |
| Gooey Nav | SVG-filter gooey blobs | — | avoid | — |
| Pixel Card | Canvas pixel shimmer on hover | — | avoid | — |
| Carousel | Drag/auto carousel with spring | motion | avoid | `Lightbox` covers image browsing. |
| Spotlight Card | Radial gradient at cursor position, opacity `0→0.6` over `0.5s ease-in-out`, tracked with `getBoundingClientRect` | — | **adopt** | `.bp-cert`, `.bp-role`, project media frames: `radial-gradient(circle at var(--sx) var(--sy), color-mix(in srgb, var(--ink) 5%, transparent), transparent 70%)`, opacity 0→1 over 0.4s. Reads as light on paper, not a lamp. |
| Border Glow | Cursor angle → `conic-gradient` masked border + mesh fill; edge-proximity drives opacity; optional auto sweep on mount | — | adapt | The cursor-angle conic mask is the trick: a hairline in `--ink-soft` that appears on the card edge nearest the cursor. Fill stays paper. |
| Flying Posters | ogl posters | ogl | avoid | — |
| Card Swap | Cards swap positions | gsap | avoid | — |
| Glass Icons | Glass-effect icon tiles | — | avoid | — |
| Decay Card | SVG displacement on cursor | gsap | avoid | — |
| Flowing Menu | Marquee reveals on hover | gsap | avoid | — |
| Elastic Slider | Slider with overshoot | motion | avoid | No sliders on the site (Studio has its own). |
| Counter | Rolling-digit odometer, spring `stiffness 250 damping 30`, top/bottom gradient masks | motion | adapt | Count Up is the quieter pick; use Counter's digit-roll only for a hero stat if there is one. |
| Infinite Menu | WebGL sphere menu | gl-matrix | avoid | — |
| Stepper | Content height measured and transitioned `0.4s cubic-bezier(0.5,1,0.5,1)`; keyed step slides in from ±100%; progress line width 0→100% 400ms | motion | **adopt** (mechanism) | The case-study toggle already animates height via `AnimatePresence`. Reuse the measured-height pattern for any future expandable (more-info sections). |
| Bounce Cards | Cards bounce into a fan | gsap | avoid | — |

## Backgrounds

All 42 are canvas/WebGL shaders (`ogl`/`three`) or heavy canvas loops. **Avoid all of them** for this site: the fixed blueprint grid is the background, and any of these would replace the paper with a screen. Two have a borrowable *idea*:

| Component | Idea worth keeping | Blueprint translation |
|---|---|---|
| Dot Grid | Dots within `proximity 150px` of the cursor tint toward `activeColor`; fast cursor movement (`speedTrigger 100`) pushes dots with inertia, returning on `elastic.out(1, 0.75)` over 1.5s | A pointer-proximity darkening of the existing grid lines — a `radial-gradient` in `color-mix(in srgb, var(--ink) 8%, transparent)` at `--mx/--my` composited over `.bp`'s background. No physics. Optional, and only if it stays under ~8% ink. |
| Dot Field | Cursor bulge with `cursorForce`, `glowRadius` | Same as above; don't also do the bulge. |

Everything else — Liquid Ether, Prism, Dark Veil, Light Pillar, Silk, Floating Lines, Light Rays, Pixel Blast, Color Bends, Evil Eye, Line Waves, Radar, Soft Aurora, Aurora, Plasma, Plasma Wave, Particles, Gradient Blinds, Grainient, Grid Scan, Beams, Pixel Snow, Lightning, Prismatic Burst, Galaxy, Dither, Faulty Terminal, Ripple Grid, Threads, Hyperspeed, Iridescence, Waves, Grid Distortion, Ballpit, Orb, Letter Glitch, Grid Motion, Shape Grid, Liquid Chrome, Balatro — **avoid**.

## Landing-page pieces (not in the library)

svelte-bits' own site (`src/lib/components/landing/`) is where its *composition* lives. These are covered in detail by `motion-layout`; verdicts here for completeness.

| Piece | Mechanism | Verdict | Blueprint translation |
|---|---|---|---|
| Navbar condense | `scrolled = scrollY > 50` toggles a class; inner `max-width 1680→1276`, `background transparent→solid`, `border-color`, all `0.5s ease` | **adopt** | `BpNav` gains `is-scrolled`: tighten padding, show a hairline bottom border, 0.4s `--ease`. |
| Navbar link highlight | A single absolutely-positioned pill moves/resizes to the hovered link (`transform`/`width` 0.3s), returns to the active link on leave | adapt | A sliding hairline underline shared by all links, replacing the per-link `::after` (or keep per-link; both are fine). |
| Hamburger morph | Three bars: `translateY(±5.5px) rotate(±45°)`, middle fades, 0.25s | adopt | If the mobile nav ever gets a hamburger. |
| Dropdown menu | `opacity 0→1`, `translateY(-4px)→0`, `scale(0.97)→1`, 0.2s | adopt | Any popover (theme menu, Studio). |
| Landing loader → page reveal | Fixed overlay fades 0.6s; header opacity 0.7s `cubic-bezier(0.16,1,0.3,1)`; hero 0.8s +0.1s | avoid | The hero already staggers in via `Reveal`; an overlay would add a beat before content for no reason. |
| Feature cards reveal | IO once → `.is-visible`; `opacity 0 / translateY(24px)` → `1 / 0` over 0.5s with `transition-delay: i·70ms` | adopt | Pure-CSS sibling of `Reveal` for lists where a framer wrapper per item is overkill (`.bp-pill`s, `.bp-cert`s). |
| Feature card hover | `border-color` brighten + `translate: 0 -2px`, 0.3s | already shipped | `.bp-cert:hover`, `.bp-role:hover`. |
| Component marquee | Two rows, opposite directions, doubled items, pill links | adapt | See Logo Loop. |
| Side fades | `::before/::after` 300px gradients on the page wrapper | avoid | The grid texture should reach the edges. |
| Hero bottom fade | An SVG `linearGradient` rect from transparent at 50% to solid at 100% over the hero background | adapt | A gentle fade of the *grid texture* at the hero's bottom edge, so the first hairline rule sits on clean paper. Optional. |
