import { writeFileSync } from "node:fs";
const h2r = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const r2h = (r) => "#" + r.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); };
// 8 steps dark→light: mix the color toward black for the dark half and toward white for the light half.
const ramp = (hex) => [0.7, 0.45, 0.2].map((t) => mix(hex, "#000000", t)).concat([hex]).concat([0.25, 0.5, 0.75, 0.92].map((t) => mix(hex, "#ffffff", t)));
const color = (role, displayName, canonical, extra = {}) => ({ role, displayName, canonical, tonalRamp: ramp(canonical), ...extra });
const EASE = "cubic-bezier(.22,.9,.28,1)";
const sidecar = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  title: "Design System: Blueprint Press",
  extensions: {
    colorMeta: {
      "accent": color("primary", "Electric Blue (active preset)", "#3e6ae1", { note: "Studio preset 'electric'. Default preset uses Signal Red #e3342f / #ff6b62." }),
      "blue": color("secondary", "Diagram Blue", "#3e6ae1", { note: "Equals the accent on Electric; a distinct cooler hue on the other presets." }),
      "paper": color("neutral", "Paper", "#ffffff"),
      "white": color("neutral", "Sheet White", "#f4f4f4"),
      "ink": color("neutral", "Carbon Ink", "#171a20"),
      "prose": color("neutral", "Prose Ink (10% toward paper)", "#2e3136"),
      "ink-soft": color("neutral", "Soft Ink (25%)", "#515358"),
      "pill-text": color("neutral", "Pill Ink (29%)", "#5a5c61"),
      "muted": color("neutral", "Muted (45%)", "#7f8184"),
      "faint": color("neutral", "Faint (60%)", "#a2a3a6"),
      "rule": color("neutral", "Hairline (87%)", "#e1e1e2"),
      "paper-dark": color("neutral", "Paper, dark", "#000000"),
      "white-dark": color("neutral", "Sheet, dark", "#141414"),
      "ink-dark": color("neutral", "Ink, dark", "#ffffff"),
      "rule-dark": color("neutral", "Hairline, dark", "#212121")
    },
    typographyMeta: {
      display: { displayName: "Display", purpose: "The hero name only, two lines, Instrument Serif 400 at up to 152px." },
      headline: { displayName: "Headline", purpose: "Page titles on every non-home route." },
      tagline: { displayName: "Tagline", purpose: "The italic line under the hero rule; ink-soft, max 24ch." },
      title: { displayName: "Title", purpose: "Role titles and degree names." },
      subtitle: { displayName: "Subtitle", purpose: "Skill group headings and card titles, 20 to 21px." },
      prose: { displayName: "Prose", purpose: "Summary and page intros; drop cap on the summary." },
      body: { displayName: "Body", purpose: "Bullets and role context at 17px." },
      ui: { displayName: "UI", purpose: "Buttons, nav links, the footer note." },
      small: { displayName: "Small", purpose: "Pills, table cells, issuers." },
      index: { displayName: "Section index", purpose: "The uppercase accent label in the 190px column." },
      label: { displayName: "Label", purpose: "Dates, brand name, read-more, back-to-top, table headers." },
      caption: { displayName: "Caption", purpose: "Cert dates and the footer URL." }
    },
    shadows: [
      { name: "hover-lift", value: "0 6px 18px rgba(11, 26, 43, 0.10)", purpose: "Skill pills on hover, with a 3px rise." },
      { name: "card-lift", value: "0 16px 34px rgba(11, 26, 43, 0.13)", purpose: "Cert and contact cards on hover, with a 5px rise." },
      { name: "floating-pill", value: "0 10px 28px rgba(11, 26, 43, 0.10)", purpose: "The relocation badge and back-to-top control at rest." },
      { name: "accent-glow", value: "0 6px 18px color-mix(in srgb, var(--accent) 35%, transparent)", purpose: "The bullet's project link on hover." }
    ],
    motion: [
      { name: "ease", value: "cubic-bezier(0.22, 0.9, 0.28, 1)", purpose: "The one easing curve for every transition and framer-motion Reveal (EASE = [0.22, 0.9, 0.28, 1])." },
      { name: "reveal-rise", value: "0.82s, y 22px to 0, opacity 0 to 1, once, 25% in view", purpose: "Default section entrance." },
      { name: "reveal-rule", value: "0.9s, scaleX 0 to 1 from the left", purpose: "Every hairline and 2px rule." },
      { name: "reveal-fade", value: "0.7s, opacity, optional 6px blur", purpose: "Images and captions." },
      { name: "reveal-slide", value: "0.72s, x +/-18px", purpose: "Side panels." },
      { name: "hover-lift", value: "0.34 to 0.44s on --ease, translateY(-2px to -5px)", purpose: "Pills, cards, buttons, floating pills." },
      { name: "wipe", value: "0.42 to 0.52s on --ease, scaleX or scaleY 0 to 1", purpose: "Button fills, link underlines, role bars, cert bars, nav underline." },
      { name: "mark-draw", value: "bp-draw 7.3s infinite; bp-chase 1.8s linear infinite; bp-float 5s", purpose: "The monogram draws on and off; the footer mark floats." },
      { name: "ribbon-draw", value: "bp-draw-in 1.7s cubic-bezier(0.5, 0, 0.2, 1) 0.4s", purpose: "The hero ribbon draws in once." },
      { name: "reduced-motion", value: "animation-duration 0.001ms; transition-duration 0.001ms; strokes at final offset", purpose: "prefers-reduced-motion freezes everything on its final frame." }
    ],
    breakpoints: [{ name: "stack", value: "860px" }],
    surfaces: [
      { name: "blueprint-grid", value: "16px fine at 4.5% ink + 96px coarse at 8.5% ink, background-attachment: fixed", purpose: "The drafting grid behind every page; it is the subject's own surface, not decoration." }
    ]
  },
  components: [
    { name: "Outline button", kind: "button", refersTo: "button-outline", description: "The Email / LinkedIn / GitHub action; fill wipes in from the left on hover.",
      html: `<a class="ds-btn" href="#"><span>LinkedIn</span><svg class="ds-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2.5 8h11m0 0L9 3.5M13.5 8L9 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`,
      css: `.ds-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 28px;min-height:48px;border:1px solid var(--ink,#171a20);background:transparent;color:var(--ink,#171a20);font:500 15px/1.4 Spectral,Georgia,serif;text-decoration:none;cursor:pointer;transition:color .42s ${EASE},transform .42s ${EASE}}.ds-btn>*{position:relative;z-index:1}.ds-btn::before{content:"";position:absolute;inset:0;background:var(--ink,#171a20);transform:scaleX(0);transform-origin:left center;transition:transform .48s ${EASE}}.ds-btn:hover{color:var(--paper,#fff);transform:translateY(-2px)}.ds-btn:hover::before{transform:scaleX(1)}.ds-btn .ds-arrow{transition:transform .42s ${EASE}}.ds-btn:hover .ds-arrow{transform:translateX(5px)}.ds-btn:focus-visible{outline:2px solid var(--accent,#3e6ae1);outline-offset:3px}` },
    { name: "Solid button", kind: "button", refersTo: "button-solid", description: "The Download PDF action; accent fill, ink wipe on hover, wait state when disabled.",
      html: `<button class="ds-btn ds-btn--solid" type="button"><span>Download PDF</span><svg class="ds-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2v11m0 0l-4.5-4.5M8 13l4.5-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>`,
      css: `.ds-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 28px;min-height:48px;border:1px solid var(--ink,#171a20);background:transparent;color:var(--ink,#171a20);font:500 15px/1.4 Spectral,Georgia,serif;cursor:pointer;transition:color .42s ${EASE},transform .42s ${EASE},border-color .42s ease}.ds-btn>*{position:relative;z-index:1}.ds-btn::before{content:"";position:absolute;inset:0;background:var(--ink,#171a20);transform:scaleX(0);transform-origin:left center;transition:transform .48s ${EASE}}.ds-btn:hover{color:var(--paper,#fff);transform:translateY(-2px)}.ds-btn:hover::before{transform:scaleX(1)}.ds-btn--solid{background:var(--accent,#3e6ae1);border-color:var(--accent,#3e6ae1);color:var(--paper,#fff)}.ds-btn--solid:hover{border-color:var(--ink,#171a20)}.ds-btn--solid:disabled{cursor:wait;opacity:.75;transform:none}.ds-btn:focus-visible{outline:2px solid var(--accent,#3e6ae1);outline-offset:3px}` },
    { name: "Inline link", kind: "custom", refersTo: "link-inline", description: "Ink text with an accent underline that wipes in and a diagonal arrow that nudges.",
      html: `<a class="ds-link" href="#">Show credential<svg class="ds-arrow" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 12L12 4m0 0H5.5M12 4v6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>`,
      css: `.ds-link{position:relative;display:inline-flex;align-items:center;gap:7px;padding:3px 0;color:var(--ink,#171a20);font:400 17px/1.5 Spectral,Georgia,serif;text-decoration:none}.ds-link::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1.6px;background:var(--accent,#3e6ae1);transform:scaleX(0);transform-origin:right center;transition:transform .44s ${EASE}}.ds-link:hover::after{transform:scaleX(1);transform-origin:left center}.ds-link .ds-arrow{transition:transform .42s ${EASE}}.ds-link:hover .ds-arrow{transform:translate(3px,-3px)}.ds-link:focus-visible{outline:2px solid var(--accent,#3e6ae1);outline-offset:3px}` },
    { name: "Nav link", kind: "nav", refersTo: "nav-link", description: "Muted at rest, ink when active, a 2px accent underline scales in from the left.",
      html: `<nav class="ds-nav"><a class="ds-nav-link is-active" href="#" aria-current="page">Home</a><a class="ds-nav-link" href="#">Projects</a><a class="ds-nav-link" href="#">Contact</a></nav>`,
      css: `.ds-nav{display:flex;gap:28px;font:400 15px/1.4 Spectral,Georgia,serif}.ds-nav-link{position:relative;padding:6px 2px;color:var(--muted,#7f8184);text-decoration:none;transition:color .3s ease}.ds-nav-link::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:var(--accent,#3e6ae1);transform:scaleX(0);transform-origin:left center;transition:transform .42s ${EASE}}.ds-nav-link:hover,.ds-nav-link.is-active{color:var(--ink,#171a20)}.ds-nav-link:hover::after,.ds-nav-link.is-active::after{transform:scaleX(1)}.ds-nav-link:focus-visible{outline:2px solid var(--accent,#3e6ae1);outline-offset:3px}` },
    { name: "Skill pill", kind: "chip", refersTo: "pill", description: "A square white chip with a hairline border; lifts 3px and darkens on hover.",
      html: `<span class="ds-pill">LabVIEW</span> <span class="ds-pill">Allen Bradley PLCs</span>`,
      css: `.ds-pill{display:inline-block;padding:8px 16px;border:1px solid var(--rule,#e1e1e2);background:var(--white,#f4f4f4);color:var(--pill-text,#5a5c61);font:400 14px/1.4 Spectral,Georgia,serif;transition:transform .34s ${EASE},border-color .34s ease,color .34s ease,box-shadow .34s ease}.ds-pill:hover{transform:translateY(-3px);border-color:var(--ink,#171a20);color:var(--ink,#171a20);box-shadow:0 6px 18px rgba(11,26,43,.1)}` },
    { name: "Cert card", kind: "card", refersTo: "card", description: "Square white card: serif title, muted issuer, faint uppercase date, an accent bar that wipes in on hover.",
      html: `<div class="ds-card"><h4>Lean Six Sigma Yellow Belt</h4><p class="ds-card-issuer">Educate 360</p><p class="ds-card-date">Issued June 2016</p><div class="ds-card-bar" aria-hidden="true"></div></div>`,
      css: `.ds-card{border:1px solid var(--rule,#e1e1e2);background:var(--white,#f4f4f4);padding:18px 20px;max-width:300px;transition:transform .44s ${EASE},box-shadow .44s ease,border-color .44s ease}.ds-card:hover{transform:translateY(-5px);border-color:var(--ink,#171a20);box-shadow:0 16px 34px rgba(11,26,43,.13)}.ds-card h4{margin:0;font:400 21px/1.2 "Instrument Serif",Georgia,serif;color:var(--ink,#171a20)}.ds-card-issuer{margin:5px 0 0;font:400 14px/1.5 Spectral,Georgia,serif;color:var(--muted,#7f8184)}.ds-card-date{margin:8px 0 0;font:400 12px/1.4 Spectral,Georgia,serif;letter-spacing:.1em;text-transform:uppercase;color:var(--faint,#a2a3a6)}.ds-card-bar{height:2px;margin-top:12px;background:var(--accent,#3e6ae1);transform:scaleX(0);transform-origin:left center;transition:transform .5s ${EASE}}.ds-card:hover .ds-card-bar{transform:scaleX(1)}` },
    { name: "Section index", kind: "custom", refersTo: "section-index", description: "The uppercase accent label in the 190px margin column.",
      html: `<p class="ds-index">02&nbsp;&nbsp;Experience</p>`,
      css: `.ds-index{margin:0;padding-top:12px;font:400 16px/1.3 Spectral,Georgia,serif;letter-spacing:.26em;text-transform:uppercase;color:var(--accent,#3e6ae1)}` },
    { name: "Theme toggle", kind: "control", refersTo: "theme-toggle", description: "A 44x24 white pill; the ink thumb slides right and turns accent in dark mode.",
      html: `<button class="ds-toggle" type="button" role="switch" aria-checked="false" aria-label="Switch to dark mode"><span class="ds-toggle-thumb"></span></button>`,
      css: `.ds-toggle{position:relative;width:44px;height:24px;padding:0;border:1px solid var(--rule,#e1e1e2);border-radius:999px;background:var(--white,#f4f4f4);cursor:pointer;transition:border-color .34s ease}.ds-toggle:hover{border-color:var(--ink,#171a20)}.ds-toggle-thumb{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--ink,#171a20);transition:transform .34s ${EASE},background-color .34s ease}.ds-toggle[aria-checked="true"] .ds-toggle-thumb{transform:translateX(20px);background:var(--accent,#3e6ae1)}.ds-toggle:focus-visible{outline:2px solid var(--accent,#3e6ae1);outline-offset:3px}` },
    { name: "Floating pill", kind: "custom", refersTo: "floating-pill", description: "The relocation badge: translucent white pill with blur, hairline border, soft shadow, accent dot.",
      html: `<span class="ds-float"><span class="ds-float-dot" aria-hidden="true"></span>Open to relocation</span>`,
      css: `.ds-float{display:inline-flex;align-items:center;gap:11px;padding:11px 20px;border:1px solid var(--rule,#e1e1e2);border-radius:999px;background:color-mix(in srgb,var(--white,#f4f4f4) 92%,transparent);backdrop-filter:blur(10px);box-shadow:0 10px 28px rgba(11,26,43,.1);font:400 13px/1.4 Spectral,Georgia,serif;color:var(--ink,#171a20)}.ds-float-dot{width:9px;height:9px;border-radius:50%;background:var(--accent,#3e6ae1)}` }
  ],
  narrative: {
    northStar: "The Blueprint Press",
    overview: "A resume printed on paper, over the drafting grid it was laid out on. The page is set on paper with ink, a single accent, and hairline rules, and a fixed blueprint grid shows through the whole page at a few percent of ink. Headings are Instrument Serif at regular weight, tight and large; running text is Spectral. Numbered section indexes sit in a narrow left column like the margin of an engineering drawing, and every card is a square hairline box on a slightly whiter sheet.\n\nThe voice is a document, not a campaign. At rest the home page reads top to bottom exactly like the PDF it complements; the design's job is to make the reading feel considered and to surface evidence without ever turning into a marketing page.\n\nEvery transition uses one easing curve so the motion reads as a single hand. Dark mode swaps paper and ink and changes nothing else. The palette is a Studio setting: five seeds per mode through a fixed tint ramp.",
    keyCharacteristics: [
      "Warm-neutral paper with one accent; the accent is used for indexes, eyebrows, the solid CTA, link underlines, active nav, hover bars, and the badge dot, never for surfaces.",
      "Instrument Serif display at weight 400 only, Spectral body, both loaded through next/font; the three roles are Studio choices among eight preloaded faces.",
      "Square hairline cards on white (one step off paper), 1px rule borders, 2px ink rules under headings.",
      "A visible blueprint grid on the page background, fixed to the viewport.",
      "Uppercase, tracked labels in Spectral for indexes, dates, eyebrows, and captions; the serif never appears in small caps.",
      "One easing curve, one entrance pattern (Reveal), hover lifts of 2 to 5px, and a full prefers-reduced-motion opt-out."
    ],
    rules: [
      { name: "The One Accent Rule", body: "Color lives in the accent alone. Surfaces are paper and white; text is ink and its tints. A second hue (blue) appears only inside drawn geometry and data, never on type or chrome.", section: "colors" },
      { name: "The Ramp Rule", body: "Never hand-pick a gray. Secondary tones come from lib/palette.ts's ramp so all ten presets and any custom palette share one tonal rhythm.", section: "colors" },
      { name: "The Hard-Copy Rule", body: "GanttChart.tsx, apple-icon.tsx, and opengraph-image.tsx carry literal copies of the active preset; a palette change must reach them by hand.", section: "colors" },
      { name: "The Regular Serif Rule", body: "Instrument Serif is loaded at weight 400 only. Emphasis in the serif comes from size, never from a synthesized bold.", section: "typography" },
      { name: "The Tracked Label Rule", body: "Anything uppercase is Spectral, 11 to 16px, with 0.1 to 0.3em of tracking. The serif is never uppercased.", section: "typography" },
      { name: "The Drawn Depth Rule", body: "Rest states have no shadow. If an element needs separation at rest, it gets a hairline border or a whiter sheet, not a shadow.", section: "elevation" }
    ],
    dos: [
      "Do put color only in the accent: indexes, eyebrows, the solid CTA, underlines, hover bars, the badge dot. Surfaces stay paper and white.",
      "Do derive every gray from the ramp in lib/palette.ts and every palette from five seeds, so all presets and dark mode keep the same rhythm.",
      "Do keep cards, buttons, and frames square with 1px rule borders; reserve 999px for small floating controls and 50% for dots.",
      "Do run every transition on --ease and every entrance through Reveal; keep hover lifts between 2 and 5px.",
      "Do honor prefers-reduced-motion by freezing on the final frame, never by hiding content.",
      "Do keep the index column, the hairline section rules, and the 2px ink rule under every page title; they are the page's structure.",
      "Do put suppressHydrationWarning on every <a> and <Link>."
    ],
    donts: [
      "Don't synthesize a bold Instrument Serif; the face has none. Go larger instead.",
      "Don't add a second surface color, a colored band, or a gradient surface; paper, white, and ink are the whole material.",
      "Don't add shadows at rest to cards or controls that are not floating over the page.",
      "Don't hand-write a gray or an accent tint; use the ramp or color-mix() from a token.",
      "Don't introduce a second breakpoint or a mobile-only layout; scale with clamp() and collapse at 860px.",
      "Don't change the palette in blueprint.css alone; the active preset lives in data/header.json and is injected by app/(site)/layout.tsx, and three files carry hard copies of it."
    ]
  }
};
writeFileSync(".impeccable/design.json", JSON.stringify(sidecar, null, 2) + "\n");
console.log("wrote .impeccable/design.json");
