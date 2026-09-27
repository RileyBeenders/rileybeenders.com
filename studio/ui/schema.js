/**
 * Schemas describe every editable JSON file: which fields exist, how each one
 * is edited, and the order keys are written back in.
 *
 * Field order here IS the key order on disk, so an untouched entry saves back
 * byte-for-byte identical. When the site's types gain a field, add it here and
 * the form picks it up — there is no separate UI to update.
 *
 * Layout hints are optional and change nothing on disk: `span: "half"` or
 * `"third"` lets a short field share its row, `prose: true` gives a textarea
 * room to write in plus a running word count, and `multiline: true` turns a
 * string list's rows into textareas for paragraphs.
 *
 * `tabs` splits a list entry's form into pages, one open at a time. Each tab
 * names the fields it shows, in the order it shows them; `unwrap` draws a
 * group's own fields straight onto the tab instead of in a box, and `count`
 * puts a list's length beside the tab's name. Tabs change nothing on disk
 * either: `fields` still sets the key order. Name each field in one tab; a
 * field no tab names is drawn at the end of the first.
 *
 * RAIL, at the bottom, arranges the schemas in the editor's sidebar in the
 * order the site reads them.
 */

/** Every page's browser-tab title and search/share description. */
const META_GROUP = {
  name: "meta",
  type: "group",
  label: "Browser tab & search",
  help: "What the browser tab, search results and link previews show for this page.",
  fields: [
    { name: "title", type: "text", label: "Tab title", required: true },
    { name: "description", type: "textarea", label: "Description", rows: 2, required: true }
  ]
};

/** Copy that differs with how many projects are published. */
const COUNTED_FIELDS = [
  { name: "one", type: "textarea", label: "With one project", rows: 2, required: true },
  { name: "many", type: "textarea", label: "With several", rows: 2, required: true, help: "{count} becomes the number of published projects." }
];

/** Repeatable bullet rows, shared by projects and experience. */
const BULLET_FIELDS = [
  {
    name: "text",
    type: "emphasisText",
    emphasisName: "emphasis",
    label: "Bullet",
    rows: 3,
    required: true,
    help: "Select words in the bullet, then add them as an accent phrase. They stay unchanged at rest and use the active palette accent when the bullet is hovered."
  },
  { name: "projectId", type: "ref", source: "projects", label: "Links to project" },
  { name: "proofId", type: "ref", source: "proofs", label: "Links to proof" }
];

const ASSET_FIELDS = [
  { name: "label", type: "text", label: "Label" },
  { name: "src", type: "image", label: "File" },
  { name: "alt", type: "text", label: "Alt text", help: "Described for screen readers." }
];

const IMAGE_FIELDS = [
  // A GIF gets a playback-speed slider under its path, kept as `speed` beside `src`. A PDF gets a
  // first-page preview, its page count as `pages`, and a `download` switch.
  { name: "src", type: "image", label: "Image or PDF", required: true, speedName: "speed", pagesName: "pages", downloadName: "download", compareLabel: "Before" },
  // Default is the one image; "Before & after" adds `after` plus where each photo sits in the frame.
  { name: "display", type: "imageDisplay", label: "Display", afterName: "after", frameName: "frame", afterFrameName: "afterFrame" },
  {
    // The frame the gallery draws the image in. Unset is 4:3; "original" keeps the image's own shape, uncropped.
    name: "aspect",
    type: "select",
    label: "Aspect ratio",
    repaint: true,
    help: "The shape of this image's frame in the gallery. Original shows the whole image with nothing cropped (a before & after uses 4:3 instead). A PDF's first page shows whole unless you pick a shape.",
    options: [
      { value: "", label: "4:3 (standard)" },
      { value: "3:2", label: "3:2 (camera)" },
      { value: "16:9", label: "16:9 (wide)" },
      { value: "21:9", label: "21:9 (panorama)" },
      { value: "1:1", label: "1:1 (square)" },
      { value: "4:5", label: "4:5 (tall)" },
      { value: "3:4", label: "3:4 (portrait)" },
      { value: "2:3", label: "2:3 (portrait photo)" },
      { value: "9:16", label: "9:16 (phone)" },
      { value: "original", label: "Original (no crop)" }
    ]
  },
  { name: "alt", type: "text", label: "Alt text", required: true, help: "What the image shows, for screen readers." },
  { name: "caption", type: "text", label: "Caption", help: "Shown under the image in the gallery." },
  {
    name: "fit",
    type: "select",
    label: "Fit",
    options: [
      { value: "", label: "Cover (fill the frame)" },
      { value: "contain", label: "Contain (show the whole image)" },
      { value: "cover", label: "Cover (explicit)" }
    ]
  }
];

/**
 * Ten hand-picked presets plus Customization. `swatch` is the light mode's
 * seeds and `swatchDark` the dark mode's; the palette card shows paper, ink,
 * accent and blue from `swatch`, and previews drawn in the site's colors (the
 * Home page's Read more and Linked skills pickers) use the rest. Each preset's
 * full light/dark token set (and the ramp that derives ink-soft/muted/faint/
 * rule/prose/pill-text from just these five seeds) lives in lib/palettes.ts
 * and lib/palette.ts on the site side. Keep the two in sync by hand; they
 * change together and rarely.
 */
const PALETTE_OPTIONS = [
  {
    id: "default", name: "Default",
    description: "The site's original paper-and-ink palette with a red accent.",
    swatch: { paper: "#fbfbf9", white: "#ffffff", ink: "#0b1a2b", accent: "#e3342f", blue: "#2f86c4" },
    swatchDark: { paper: "#0d1b2a", white: "#142a3d", ink: "#eef3f7", accent: "#ff6b62", blue: "#5aa9e6" }
  },
  {
    id: "electric", name: "Electric",
    description: "Tesla-inspired white canvas in light, Bugatti-inspired near-black canvas in dark — one electric-blue accent both ways.",
    swatch: { paper: "#ffffff", white: "#f4f4f4", ink: "#171a20", accent: "#3e6ae1", blue: "#3e6ae1" },
    swatchDark: { paper: "#000000", white: "#141414", ink: "#ffffff", accent: "#3e6ae1", blue: "#3e6ae1" }
  },
  {
    id: "forest", name: "Forest",
    description: "Sage paper, deep forest ink, burnt-orange accent.",
    swatch: { paper: "#f8f7f0", white: "#ffffff", ink: "#1a2b1f", accent: "#c1622b", blue: "#2f7a63" },
    swatchDark: { paper: "#0f1a13", white: "#17261c", ink: "#eef3ea", accent: "#e2793f", blue: "#4fae8f" }
  },
  {
    id: "twilight", name: "Twilight",
    description: "Pale lavender paper, indigo ink, violet accent.",
    swatch: { paper: "#f7f6fb", white: "#ffffff", ink: "#1c1930", accent: "#7c4dbd", blue: "#3aa0c9" },
    swatchDark: { paper: "#14101f", white: "#201a33", ink: "#f1eef7", accent: "#a875e0", blue: "#5cc2e8" }
  },
  {
    id: "terracotta", name: "Terracotta",
    description: "Warm sand paper, espresso ink, clay-red accent.",
    swatch: { paper: "#fbf4ec", white: "#fffaf4", ink: "#2e1d14", accent: "#c1502e", blue: "#2d7d82" },
    swatchDark: { paper: "#1d130c", white: "#2a1d13", ink: "#f8ede2", accent: "#e07750", blue: "#4fa6ac" }
  },
  {
    id: "ocean", name: "Ocean",
    description: "Ice-blue paper, deep navy ink, coral accent.",
    swatch: { paper: "#f3f8fb", white: "#ffffff", ink: "#0d2436", accent: "#e8604a", blue: "#1f9ad6" },
    swatchDark: { paper: "#08161f", white: "#0f2331", ink: "#eaf4f9", accent: "#ff8468", blue: "#4fc3ee" }
  },
  {
    id: "graphite", name: "Graphite",
    description: "Restrained near-grayscale with a single charcoal accent.",
    swatch: { paper: "#f6f6f4", white: "#ffffff", ink: "#161616", accent: "#3a3a3a", blue: "#7d8590" },
    swatchDark: { paper: "#121212", white: "#1c1c1c", ink: "#f2f2f0", accent: "#d0d0d0", blue: "#8f97a1" }
  },
  {
    id: "amber", name: "Amber",
    description: "Cream paper, dark umber ink, gold accent.",
    swatch: { paper: "#fbf6e9", white: "#fffdf5", ink: "#2b2210", accent: "#b8791a", blue: "#2f6b5e" },
    swatchDark: { paper: "#1c160a", white: "#281f0f", ink: "#f7efd9", accent: "#e2a53f", blue: "#4f9a89" }
  },
  {
    id: "rose", name: "Rose",
    description: "Blush paper, deep plum ink, magenta accent.",
    swatch: { paper: "#fbf3f5", white: "#fffafb", ink: "#2c1420", accent: "#c13d6b", blue: "#5a5ec7" },
    swatchDark: { paper: "#1c0f15", white: "#291b21", ink: "#f8e9ee", accent: "#ec6d97", blue: "#8890e8" }
  },
  {
    id: "slate", name: "Slate",
    description: "Cool gray paper, slate-navy ink, teal accent.",
    swatch: { paper: "#f4f6f8", white: "#ffffff", ink: "#10202e", accent: "#0d8f8f", blue: "#3355a4" },
    swatchDark: { paper: "#0a1620", white: "#12212e", ink: "#eaf0f4", accent: "#38c6c6", blue: "#6f89d6" }
  },
  {
    id: "custom", name: "Customization",
    description: "Pick any colors you like, below."
    // No swatch: the palette control previews this one from the custom
    // colors themselves instead of a fixed swatch.
  }
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** WCAG relative luminance, as lib/palette.ts computes it. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const v = parseInt(hex.slice(at, at + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Two hex colors mixed in sRGB, t = 0 → a, t = 1 → b (lib/palette.ts → mix). */
function mix(a, b, t) {
  const channel = (hex, at) => parseInt(hex.slice(at, at + 2), 16);
  return "#" + [1, 3, 5]
    .map((at) => Math.round(channel(a, at) + (channel(b, at) - channel(a, at)) * t).toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The colors the site is drawn in under a theme setting (Site Settings →
 * Overall theme, saved or not), for previews that should look like the site
 * rather than the Studio: paper, white (the surface), ink and accent in each
 * mode, the text the site sets on the accent (lib/palette.ts → onAccentFor:
 * whichever of paper and ink reads better on it), and the pill-text, muted
 * and rule tints it derives from ink and paper. A Customization color that
 * isn't a full hex yet falls back to Default's.
 */
export function sitePaletteColors(theme) {
  const preset = PALETTE_OPTIONS.find((option) => option.id === theme?.paletteId && option.swatch) ?? PALETTE_OPTIONS[0];
  const custom = theme?.paletteId === "custom" ? theme.custom : null;
  const mode = (seeds, fallback) => {
    const pick = (key) => (HEX_COLOR.test(seeds?.[key] ?? "") ? seeds[key] : fallback[key]);
    const colors = { paper: pick("paper"), white: pick("white"), ink: pick("ink"), accent: pick("accent") };
    colors.onAccent = contrast(colors.paper, colors.accent) >= contrast(colors.ink, colors.accent) ? colors.paper : colors.ink;
    // The tint ramp lib/palette.ts derives from ink toward paper (RAMP there).
    colors.pillText = mix(colors.ink, colors.paper, 0.29);
    colors.muted = mix(colors.ink, colors.paper, 0.36);
    colors.rule = mix(colors.ink, colors.paper, 0.87);
    return colors;
  };
  return {
    light: mode(custom ? custom.light : preset.swatch, PALETTE_OPTIONS[0].swatch),
    dark: mode(custom ? custom.dark : preset.swatchDark, PALETTE_OPTIONS[0].swatchDark)
  };
}

/**
 * The ways a resume bullet's "Read more" button can move. Each value is a
 * `data-motion` styled in app/(site)/bullet-link.css (and the
 * ReadMoreAnimation type in types/pages.ts); the picker previews each one
 * with that same stylesheet, in the site's palette.
 */
const READ_MORE_MOTIONS = [
  { value: "sweep", label: "Ink sweep", help: "Ink wipes in from the left and the arrow lifts. The original." },
  { value: "roll", label: "Letter roll", help: "Each letter rolls up to a fresh copy, left to right, as the fill turns to ink." },
  { value: "launch", label: "Arrow launch", help: "The arrow flies off the corner and a new one slides in behind it." },
  { value: "offset", label: "Offset print", help: "Lifts onto a hard ink shadow, like a plate out of register, and presses flat on click." },
  { value: "trace", label: "Trace", help: "A hairline of ink draws itself around the button, like a pen outlining a part." },
  { value: "glint", label: "Glint", help: "A soft light crosses the button every few seconds. Hover sweeps in the ink." },
  { value: "still", label: "Still", help: "No movement. The fill simply turns to ink." }
];

/**
 * How a skill linked to a project or proof marks its border, and how its
 * hover card opens. Each value is a `data-border` / `data-reveal` styled in
 * app/(site)/skill-pills.css (the LinkedSkillBorder / LinkedSkillReveal
 * types in types/pages.ts); the pickers preview each with that stylesheet.
 */
const SKILL_BORDERS = [
  { value: "orbit", label: "Orbit", help: "A comet of accent circles the border, one slow lap every six seconds." },
  { value: "march", label: "Marching dashes", help: "A dashed accent line, like a drawing's hidden line, creeps round the border." },
  { value: "pulse", label: "Ping", help: "An accent ring leaves the border and fades every few seconds." },
  { value: "marks", label: "Registration marks", help: "Accent corner ticks settle in and out, then close onto the corners on hover." },
  { value: "signal", label: "Signal", help: "A short pulse of accent runs along the bottom edge, like current on a trace." },
  { value: "steady", label: "Steady", help: "An accent border and the link icon, with nothing moving." }
];

const SKILL_REVEALS = [
  { value: "card", label: "Card", help: "A card floats up above the skill, pointing at it, with the Read more button." },
  { value: "tab", label: "Tab", help: "A drawer unrolls from under the skill in its accent border." },
  { value: "callout", label: "Callout", help: "A drawing's leader line runs from the skill's corner up to an underlined label." }
];

/** Every option next/font/google preloads in app/(site)/layout.tsx — see lib/fonts.ts. */
const FONT_OPTIONS = [
  { value: "instrument-serif", label: "Instrument Serif — editorial display serif" },
  { value: "spectral", label: "Spectral — warm reading serif" },
  { value: "playfair-display", label: "Playfair Display — high-contrast formal serif" },
  { value: "fraunces", label: "Fraunces — soft, characterful serif" },
  { value: "source-serif-4", label: "Source Serif 4 — clean reading serif" },
  { value: "inter", label: "Inter — neutral modern sans" },
  { value: "space-grotesk", label: "Space Grotesk — geometric sans" },
  { value: "ibm-plex-mono", label: "IBM Plex Mono — monospace, engineering feel" }
];

const SCREENSHOT_FIELDS = [
  { name: "id", type: "slug", label: "ID", required: true, span: "third", help: "Referenced by timeline entries and pillars." },
  { name: "src", type: "image", label: "Light-theme capture", required: true, help: "Shown when the visitor is in dark mode (the page inverts)." },
  { name: "srcDark", type: "image", label: "Dark-theme capture", help: "Shown when the visitor is in light mode. Falls back to the light capture if empty." },
  { name: "alt", type: "text", label: "Alt text", required: true },
  { name: "caption", type: "text", label: "Caption" }
];

const BACKEND_MATCH_FIELDS = [
  { name: "keyword", type: "text", label: "Posting keyword", required: true, span: "third" },
  { name: "line", type: "text", label: "Resume line it matches", required: true }
];

const BACKEND_SKILL_FIELDS = [
  { name: "name", type: "text", label: "Skill", required: true, span: "third" },
  { name: "trigger", type: "text", label: "Triggers on", required: true, help: "The kind of request or change that runs it, in your words." },
  { name: "does", type: "textarea", label: "What it does", rows: 2, required: true }
];

const BACKEND_ITEM_FIELDS = [
  {
    name: "demo",
    type: "select",
    label: "Live demo",
    span: "third",
    options: [
      { value: "resume", label: "Resume formatter (posting → PDF)" },
      { value: "studio", label: "Studio (palette picker + preview)" },
      { value: "skills", label: "Agent skills (mini router)" }
    ]
  },
  { name: "title", type: "text", label: "Title", required: true, span: "half" },
  { name: "body", type: "stringList", label: "Paragraphs", multiline: true, required: true },
  { name: "notes", type: "stringList", label: "Side notes", help: "Short one-liners listed under the paragraphs." },
  { name: "matches", type: "objectList", label: "Resume demo: keyword matches", itemLabel: "Match", fields: BACKEND_MATCH_FIELDS, help: "Only the resume demo reads these." },
  { name: "skills", type: "objectList", label: "Skills demo: procedures", itemLabel: "Skill", fields: BACKEND_SKILL_FIELDS, help: "Only the skills demo reads these." }
];

const TIMELINE_FIELDS = [
  { name: "date", type: "text", label: "Date", required: true, span: "third", placeholder: "2026-07-31", help: "ISO date. A future target month works too (2026-10-01)." },
  {
    name: "era",
    type: "select",
    label: "Era",
    span: "third",
    options: [
      { value: "past", label: "Past (shipped)" },
      { value: "present", label: "Present (in progress)" },
      { value: "future", label: "Future (planned)" }
    ]
  },
  { name: "hash", type: "text", label: "Commit", span: "third", placeholder: "81b334c", help: "Short git hash, when this is a real commit." },
  { name: "title", type: "text", label: "Title", required: true },
  { name: "summary", type: "textarea", label: "Summary", rows: 3, required: true },
  { name: "tags", type: "stringList", label: "Tags", help: "design, agents, data, launch, studio, motion, content…" },
  { name: "files", type: "number", label: "Files", span: "third" },
  { name: "insertions", type: "number", label: "Lines added", span: "third" },
  { name: "deletions", type: "number", label: "Lines removed", span: "third" },
  { name: "screenshotId", type: "text", label: "Screenshot ID", help: "One of the screenshot IDs below, shown beside this entry." },
  {
    name: "mark",
    type: "select",
    label: "Dot",
    span: "third",
    options: [
      { value: "", label: "Dot (sized by the commit)" },
      { value: "star", label: "Star (a moment, not a commit)" }
    ]
  },
  { name: "id", type: "slug", label: "Entry ID", span: "third", help: "Only needed if another entry connects back to this one." },
  { name: "linkFrom", type: "text", label: "Connect from", span: "third", help: "The entry ID this one answers. Draws a line from that dot to this one." },
  { name: "linkLabel", type: "text", label: "Connector caption", placeholder: "7 days", help: "Rides on that line. Empty uses the gap between the two dates." }
];

const STAT_FIELDS = [
  { name: "label", type: "text", label: "Label", required: true, span: "half" },
  { name: "value", type: "number", label: "Value", required: true, span: "third" },
  { name: "suffix", type: "text", label: "Suffix", span: "third", placeholder: "+" },
  { name: "note", type: "text", label: "Note" }
];

const PILLAR_FIELDS = [
  { name: "title", type: "text", label: "Title", required: true },
  { name: "body", type: "stringList", label: "Paragraphs", multiline: true, required: true, help: "The first paragraph shows at rest; the rest open on demand." },
  { name: "screenshotId", type: "text", label: "Screenshot ID" }
];

const CUSTOM_PALETTE_MODE_FIELDS = [
  { name: "paper", type: "color", label: "Background", span: "third", always: true },
  { name: "white", type: "color", label: "Surface", span: "third", always: true },
  { name: "ink", type: "color", label: "Text", span: "third", always: true },
  { name: "accent", type: "color", label: "Accent", span: "third", always: true },
  { name: "blue", type: "color", label: "Secondary accent", span: "third", always: true }
];

export const SCHEMAS = {
  projects: {
    label: "Projects",
    shape: "array",
    /** Summary line for each row in the list rail. */
    title: (item) => item.name || item.id || "Untitled project",
    subtitle: (item) => item.type || "",
    idField: "id",
    orderField: "order",
    visibilityField: "visible",
    blank: () => ({
      name: "New project",
      id: "",
      type: "",
      summary: "",
      bullets: [],
      additionalInfo: {
        title: "",
        subtitle: "",
        problem: "",
        constraints: [],
        approach: [],
        impact: [],
        tools: [],
        assets: []
      }
    }),
    fields: [
      { name: "name", type: "text", label: "Name", required: true, span: "half" },
      { name: "id", type: "slug", label: "ID", required: true, span: "half", help: "Used in links and to match a proof. Lowercase, no spaces." },
      { name: "order", type: "number", label: "Order", span: "third", help: "Low numbers come first on the projects page." },
      { name: "type", type: "text", label: "Category", span: "half", placeholder: "Motion Control / Product Platform" },
      { name: "visible", type: "boolean", label: "Show on the site", default: true, omitWhenDefault: true, help: "Turn off to keep the write-up here but hide it from visitors." },
      { name: "summary", type: "textarea", label: "Summary", rows: 3 },
      { name: "status", type: "text", label: "Status note", help: "A short note on the state of the write-up, shown in small type under the summary. Leave blank when it is finished." },
      { name: "images", type: "objectList", label: "Gallery", itemLabel: "Image", fields: IMAGE_FIELDS, gallery: true },
      { name: "proofId", type: "ref", source: "proofs", label: "Linked proof", help: "Adds that proof's summary and tags to the case study, and its diagrams when there are none above. Left empty, a proof that names this project is used." },
      { name: "bullets", type: "objectList", label: "Bullets", itemLabel: "Bullet", fields: BULLET_FIELDS, always: true },
      {
        name: "additionalInfo",
        type: "group",
        label: "Case study",
        help: "Opens under the project behind its case-study toggle. A section left empty is skipped.",
        fields: [
          { name: "title", type: "text", label: "Title" },
          { name: "subtitle", type: "text", label: "Subtitle" },
          { name: "problem", type: "textarea", label: "Problem", rows: 4 },
          { name: "rootCause", type: "textarea", label: "Root cause", rows: 3, help: "What was actually wrong underneath the symptom." },
          { name: "constraints", type: "stringList", label: "Constraints" },
          { name: "approach", type: "stringList", label: "Approach" },
          { name: "designDecisions", type: "stringList", label: "Design decisions", help: "The trade-offs behind the approach." },
          { name: "impact", type: "stringList", label: "Impact" },
          { name: "tools", type: "stringList", label: "Tools" },
          { name: "assets", type: "objectList", label: "Diagrams", itemLabel: "Diagram", fields: ASSET_FIELDS }
        ]
      },
      {
        name: "dates",
        type: "group",
        label: "Dates",
        help: "When the work happened. Shown in a small box on the project entry; leave Start blank to hide it.",
        fields: [
          { name: "start", type: "text", label: "Start", span: "third", placeholder: "2026-06-28", help: "ISO date (formatted on the site) or free text." },
          { name: "end", type: "text", label: "End", span: "third", placeholder: "2026-09-01", help: "Leave blank while Ongoing is on." },
          { name: "ongoing", type: "boolean", label: "Ongoing", span: "third", default: false, omitWhenDefault: true, help: "Reads \"→ Present\" and animates the box's underline as a progress bar." },
          {
            name: "position",
            type: "select",
            label: "Position",
            span: "third",
            options: [
              { value: "", label: "Top right (default)" },
              { value: "top-left", label: "Top left" },
              { value: "bottom-right", label: "Bottom right" },
              { value: "bottom-left", label: "Bottom left" },
              { value: "inline", label: "Inline, under the subtitle" }
            ]
          }
        ]
      }
    ],
    tabs: [
      { id: "overview", label: "Overview", fields: ["name", "id", "type", "order", "visible", "summary", "status", "dates"] },
      { id: "gallery", label: "Gallery", fields: ["images"], count: "images" },
      { id: "bullets", label: "Bullets", fields: ["bullets"], count: "bullets" },
      { id: "case-study", label: "Case study", fields: ["additionalInfo", "proofId"], unwrap: "additionalInfo" }
    ]
  },

  projectsPage: {
    label: "Projects page",
    shape: "object",
    description: "The projects page around the entries: the browser tab, the headline and intro, the closing note, and what shows while nothing is published.",
    fields: [
      META_GROUP,
      { name: "title", type: "text", label: "Headline", required: true },
      { name: "intro", type: "group", label: "Intro", help: "Under the headline.", fields: COUNTED_FIELDS },
      {
        name: "outro",
        type: "group",
        label: "Closing note",
        help: "At the foot of the page, after the last project.",
        fields: [
          { name: "lead", type: "text", label: "Lead", required: true },
          { name: "body", type: "group", label: "Note", fields: COUNTED_FIELDS }
        ]
      },
      {
        name: "comingSoon",
        type: "group",
        label: "While nothing is published",
        help: "Shown instead of the projects when none is published, or the Projects page is switched off in Site Settings.",
        fields: [
          { name: "heading", type: "text", label: "Heading", required: true },
          { name: "body", type: "textarea", label: "Body", rows: 3, required: true },
          { name: "phases", type: "stringList", label: "Status lines", always: true, help: "The loading line cycles through these." },
          { name: "queueLabel", type: "text", label: "Queue label", required: true, help: "Above the list of drafts waiting to publish." }
        ]
      }
    ]
  },

  proofs: {
    label: "Proofs",
    shape: "array",
    title: (item) => item.title || item.id || "Untitled proof",
    subtitle: (item) => (item.tags || []).join(" · "),
    idField: "id",
    visibilityField: "visible",
    blank: () => ({ id: "", title: "New proof", summary: "", tags: [], assets: [] }),
    fields: [
      { name: "id", type: "slug", label: "ID", required: true },
      { name: "title", type: "text", label: "Title", required: true },
      { name: "visible", type: "boolean", label: "Show on the site", default: true, omitWhenDefault: true },
      { name: "summary", type: "textarea", label: "Summary", rows: 4 },
      { name: "tags", type: "stringList", label: "Tags" },
      { name: "assets", type: "objectList", label: "Diagrams", itemLabel: "Diagram", fields: ASSET_FIELDS },
      { name: "projectId", type: "ref", source: "projects", label: "Project" }
    ]
  },

  experience: {
    label: "Experience",
    shape: "array",
    title: (item) => item.role || "Untitled role",
    subtitle: (item) => [item.company, [item.start, item.end].filter(Boolean).join(" — ")].filter(Boolean).join(" · "),
    blank: () => ({ company: "", role: "New role", location: "", start: "", end: "", bullets: [] }),
    fields: [
      { name: "company", type: "text", label: "Company", required: true },
      { name: "role", type: "text", label: "Role", required: true },
      { name: "location", type: "text", label: "Location" },
      { name: "start", type: "text", label: "Start", placeholder: "Jan 2024" },
      { name: "end", type: "text", label: "End", placeholder: "Present" },
      { name: "context", type: "textarea", label: "Context", rows: 3 },
      { name: "bullets", type: "objectList", label: "Bullets", itemLabel: "Bullet", fields: BULLET_FIELDS, always: true }
    ]
  },

  skills: {
    label: "Skills",
    shape: "array",
    title: (item) => item.category || "Untitled group",
    subtitle: (item) => [`${(item.items || []).length} items`, (item.links || []).length ? `${item.links.length} linked` : ""].filter(Boolean).join(" · "),
    blank: () => ({ category: "New group", items: [] }),
    fields: [
      { name: "category", type: "text", label: "Category", required: true },
      {
        name: "items",
        type: "stringList",
        label: "Items",
        always: true,
        // Each row's link picker writes `links` beside `items`: [{ skill, projectId | proofId }].
        linksName: "links",
        help: "Link a skill to the project or proof that shows it, and on the home page it gets a link icon, a marked border and a card that opens on hover (Home page → Linked skills). A draft target is kept but not shown until it's published."
      }
    ]
  },

  education: {
    label: "Education",
    shape: "object",
    description: "Degrees and certificates, listed near the end of the resume.",
    fields: [
      {
        name: "degrees",
        type: "objectList",
        label: "Degrees",
        itemLabel: "Degree",
        always: true,
        fields: [
          { name: "school", type: "text", label: "School", required: true, span: "half" },
          { name: "degree", type: "text", label: "Degree", required: true, span: "half" },
          { name: "graduation", type: "text", label: "Graduated", placeholder: "May 2019", span: "third" }
        ]
      },
      {
        name: "certificates",
        type: "objectList",
        label: "Certificates",
        itemLabel: "Certificate",
        always: true,
        fields: [
          { name: "certificateName", type: "text", label: "Name", required: true, span: "half" },
          { name: "issuer", type: "text", label: "Issuer", span: "half" },
          { name: "date", type: "text", label: "Date", placeholder: "Issued July 2026", span: "third" },
          { name: "credentialUrl", type: "text", label: "Credential URL", placeholder: "https://…", span: "third" },
          { name: "credentialLabel", type: "text", label: "Link label", placeholder: "Show credential", span: "third" }
        ]
      }
    ]
  },

  homePage: {
    label: "Home page",
    shape: "object",
    description: "Everything on the home page around the resume itself: the browser tab, the big name, the section headings, the summary's link, and the footer.",
    fields: [
      {
        ...META_GROUP,
        fields: [
          ...META_GROUP.fields,
          { name: "shareTitle", type: "text", label: "Share title", required: true, help: "The headline a link preview shows (and the share image draws), which can be friendlier than the tab title." }
        ]
      },
      {
        name: "hero",
        type: "group",
        label: "Hero",
        fields: [
          { name: "lines", type: "stringList", label: "Name lines", always: true, help: "The big name at the top, one line each." },
          { name: "currentRole", type: "text", label: "Current role line", required: true, help: "Under the tagline. {company} and {start} fill in from the first Experience entry." }
        ]
      },
      {
        name: "summaryLink",
        type: "group",
        label: "Summary link",
        help: "This phrase becomes a link wherever it appears in the Summary. Leave the phrase blank for no link.",
        fields: [
          { name: "text", type: "text", label: "Phrase", span: "half", always: true },
          { name: "href", type: "text", label: "URL", span: "half", always: true, placeholder: "https://…" }
        ]
      },
      {
        name: "headings",
        type: "group",
        label: "Section headings",
        help: "The numbers in front of them are added by the site.",
        fields: [
          { name: "summary", type: "text", label: "Summary", required: true, span: "half" },
          { name: "experience", type: "text", label: "Experience", required: true, span: "half" },
          { name: "skills", type: "text", label: "Skills", required: true, span: "half" },
          { name: "education", type: "text", label: "Education", required: true, span: "half" }
        ]
      },
      {
        name: "readMore",
        type: "group",
        label: "Read more button",
        help: "The button at the end of a resume bullet that links to its project, shown while Site Settings → Visibility → Project links on resume bullets is on. Its words are Navigation & labels → Resume bullet link, and its colors follow Site Settings → Overall theme, light and dark.",
        fields: [
          {
            name: "animation",
            type: "motionChoice",
            preview: "readMore",
            label: "Animation",
            default: "sweep",
            always: true,
            // The Linked skills previews carry this button too, so they redraw with the new choice.
            repaint: true,
            options: READ_MORE_MOTIONS,
            help: "Hover or focus a card to play it. The previews use the site's palette, in the Studio's light or dark mode."
          }
        ]
      },
      {
        name: "linkedSkills",
        type: "group",
        label: "Linked skills",
        help: "A skill linked to a project or proof (Skills → each item's link) gets a link icon and a border that says so. Hovering it, or tabbing to it, opens what it links to with the Read more button above. It only shows while the Projects page is on and what it links to is published. Colors follow Site Settings → Overall theme.",
        fields: [
          {
            name: "border",
            type: "motionChoice",
            preview: "skillBorder",
            label: "Border",
            default: "orbit",
            always: true,
            // The On hover previews show this border, so they redraw with the new choice.
            repaint: true,
            options: SKILL_BORDERS,
            help: "Each linked skill keeps its own beat, and the border settles while it's hovered."
          },
          {
            name: "reveal",
            type: "motionChoice",
            preview: "skillReveal",
            label: "On hover",
            default: "card",
            always: true,
            options: SKILL_REVEALS,
            help: "Near the edge of the window the card turns to stay on screen."
          },
          {
            name: "labels",
            type: "group",
            label: "Words in the card",
            help: "The second line reads \"Project · its category\" or \"Proof · its project\".",
            fields: [
              { name: "project", type: "text", label: "A project", required: true, span: "third", placeholder: "Project" },
              { name: "proof", type: "text", label: "A proof", required: true, span: "third", placeholder: "Proof" }
            ]
          }
        ]
      },
      {
        name: "footer",
        type: "group",
        label: "Footer",
        fields: [
          { name: "note", type: "textarea", label: "Note beside the mark", rows: 2, required: true },
          { name: "sheetLabel", type: "text", label: "Site label", required: true, span: "third" },
          {
            name: "sheetLink",
            type: "group",
            label: "Site link",
            fields: [
              { name: "text", type: "text", label: "Text", required: true, span: "half" },
              { name: "href", type: "text", label: "URL", required: true, span: "half" }
            ]
          },
          { name: "revisionLabel", type: "text", label: "Revision label", required: true, span: "third", help: "Beside the latest commit." },
          { name: "locationLabel", type: "text", label: "Location label", required: true, span: "third", help: "Beside Site Settings → Location." }
        ]
      }
    ]
  },

  summary: {
    label: "Summary",
    shape: "object",
    description: "The opening paragraph of the resume. Its first letter becomes the drop cap.",
    fields: [{ name: "summary", type: "textarea", label: "Summary", rows: 12, required: true, prose: true }]
  },

  contact: {
    label: "Contact",
    shape: "object",
    description: "The contact page. The email, LinkedIn and GitHub addresses themselves come from Site Settings → Person.",
    fields: [
      META_GROUP,
      {
        name: "hero",
        type: "group",
        label: "Hero",
        fields: [
          { name: "title", type: "text", label: "Headline", required: true },
          { name: "tagline", type: "text", label: "Tagline", required: true }
        ]
      },
      {
        name: "details",
        type: "group",
        label: "Details",
        help: "The section under the hero: a short intro, then the email address spelled out from Site Settings → Person.",
        fields: [
          { name: "title", type: "text", label: "Section title", required: true, span: "half" },
          { name: "description", type: "stringList", label: "Paragraphs", multiline: true, always: true }
        ]
      }
    ]
  },

  moreInfo: {
    label: "More Info",
    shape: "object",
    description: "The About page: who you are, why this site exists, and the application tracker.",
    fields: [
      META_GROUP,
      {
        name: "aboutHeader",
        type: "group",
        label: "Header",
        help: "The headline and the intro under it.",
        fields: [
          { name: "title", type: "text", label: "Headline", required: true },
          { name: "description", type: "stringList", label: "Intro paragraphs", multiline: true, always: true }
        ]
      },
      {
        name: "aboutMe",
        type: "group",
        label: "About me",
        fields: [
          { name: "title", type: "text", label: "Section title", required: true },
          { name: "description", type: "stringList", label: "Paragraphs", multiline: true, always: true }
        ]
      },
      {
        name: "aboutSite",
        type: "group",
        label: "About this site",
        fields: [
          { name: "title", type: "text", label: "Section title", required: true },
          { name: "description", type: "stringList", label: "Paragraphs", multiline: true, always: true },
          {
            name: "readMore",
            type: "group",
            label: "Read more link",
            help: "Leave both blank to hide the link.",
            fields: [
              { name: "label", type: "text", label: "Label", span: "half", placeholder: "Read more" },
              { name: "href", type: "text", label: "URL", span: "half", placeholder: "https://…" }
            ]
          }
        ]
      },
      {
        name: "ganttSection",
        type: "group",
        label: "Application tracker",
        help: "The chart itself is drawn from data/more-info/gantt.md, which is still edited by hand.",
        fields: [
          {
            name: "chartVisible",
            type: "boolean",
            label: "Show Gantt chart on live site",
            default: true,
            always: true,
            span: "half"
          },
          {
            name: "tableVisible",
            type: "boolean",
            label: "Show tracker table on live site",
            default: true,
            always: true,
            span: "half",
            help: "Turning both off hides the whole section."
          },
          { name: "title", type: "text", label: "Section title", required: true },
          { name: "intro", type: "textarea", label: "Intro", rows: 3, help: "Optional lead-in above the chart." },
          { name: "tableNote", type: "text", label: "Table note", required: true, help: "Above the table: what the gray rows mean." },
          {
            name: "statusKey",
            type: "group",
            label: "Status key",
            help: "The words beside each circle. The circles themselves match the rows in gantt.md.",
            fields: [
              { name: "received", type: "text", label: "🟢", required: true, span: "third" },
              { name: "interviewing", type: "text", label: "🟠", required: true, span: "third" },
              { name: "closed", type: "text", label: "🔴", required: true, span: "third" }
            ]
          }
        ]
      }
    ]
  },

  aboutSite: {
    label: "About this site",
    shape: "object",
    description: "The site as its own case study: hero, the running date bar, summary and bullets, screenshots, the case study, and the deep-dive (stats, commit timeline, pillars, and the Behind-the-site demos). The site-timeline-sync agent skill refreshes the stats and timeline from git.",
    fields: [
      META_GROUP,
      {
        name: "hero",
        type: "group",
        label: "Hero",
        fields: [
          { name: "title", type: "text", label: "Headline", required: true },
          { name: "tagline", type: "text", label: "Tagline", required: true }
        ]
      },
      {
        name: "dates",
        type: "group",
        label: "Dates",
        help: "Shown as the running date bar under the headline. Start is the first commit.",
        fields: [
          { name: "start", type: "text", label: "Start", span: "third", placeholder: "2026-06-28", required: true },
          { name: "end", type: "text", label: "End", span: "third", help: "Leave blank while Ongoing is on." },
          { name: "ongoing", type: "boolean", label: "Ongoing", span: "third", default: false, omitWhenDefault: true, help: "Reads \"→ Present\" and keeps the bar moving." }
        ]
      },
      { name: "storyHeading", type: "text", label: "Story heading", required: true, span: "half", help: "The section heading beside the summary; the site adds the number." },
      { name: "summary", type: "textarea", label: "Summary", rows: 4, required: true },
      { name: "bullets", type: "objectList", label: "Bullets", itemLabel: "Bullet", fields: BULLET_FIELDS, always: true },
      { name: "images", type: "objectList", label: "Gallery", itemLabel: "Image", fields: IMAGE_FIELDS, gallery: true, always: true },
      {
        name: "caseStudy",
        type: "group",
        label: "Case study",
        help: "Opens under the bullets, like a project's case study.",
        fields: [
          { name: "title", type: "text", label: "Title" },
          { name: "subtitle", type: "text", label: "Subtitle" },
          { name: "problem", type: "textarea", label: "Problem", rows: 4 },
          { name: "rootCause", type: "textarea", label: "Root cause", rows: 3 },
          { name: "constraints", type: "stringList", label: "Constraints" },
          { name: "approach", type: "stringList", label: "Approach" },
          { name: "designDecisions", type: "stringList", label: "Design decisions" },
          { name: "impact", type: "stringList", label: "Impact" },
          { name: "tools", type: "stringList", label: "Tools" },
          { name: "assets", type: "objectList", label: "Diagrams", itemLabel: "Diagram", fields: ASSET_FIELDS }
        ]
      },
      {
        name: "feature",
        type: "group",
        label: "Deep-dive",
        help: "Stats count up on view; timeline entries are placed by date (past, present, future); pillars expand in place; screenshot pins are percent coordinates.",
        always: true,
        fields: [
          { name: "eyebrow", type: "text", label: "Eyebrow", span: "half", placeholder: "A living project" },
          { name: "intro", type: "textarea", label: "Intro", rows: 3 },
          { name: "repoLabel", type: "text", label: "Repository button", span: "half", placeholder: "GitHub", help: "Beside the intro." },
          { name: "stats", type: "objectList", label: "Stats", itemLabel: "Stat", fields: STAT_FIELDS },
          { name: "timelineTitle", type: "text", label: "Timeline heading", span: "half", help: "Blank hides the heading." },
          { name: "timelineNote", type: "textarea", label: "Timeline note", rows: 2, help: "How to use the timeline, under its heading." },
          { name: "timeline", type: "objectList", label: "Timeline", itemLabel: "Entry", fields: TIMELINE_FIELDS },
          { name: "pillarsTitle", type: "text", label: "Pillars heading", span: "half", help: "Blank hides the heading." },
          { name: "pillars", type: "objectList", label: "Pillars", itemLabel: "Pillar", fields: PILLAR_FIELDS },
          { name: "screenshots", type: "objectList", label: "Screenshots", itemLabel: "Screenshot", fields: SCREENSHOT_FIELDS, gallery: true, help: "Thumbnails for timeline entries and pillars. Each has a light and a dark capture; the page shows the opposite of the visitor's theme." },
          {
            name: "backend",
            type: "group",
            label: "Behind the site",
            help: "The tools visitors never see, each with a small live demo beside your notes.",
            fields: [
              { name: "eyebrow", type: "text", label: "Eyebrow", span: "half" },
              { name: "intro", type: "textarea", label: "Intro", rows: 2 },
              { name: "items", type: "objectList", label: "Rows", itemLabel: "Row", fields: BACKEND_ITEM_FIELDS, always: true }
            ]
          }
        ]
      },
      {
        name: "outro",
        type: "group",
        label: "Closing note",
        help: "At the foot of the page.",
        fields: [
          { name: "lead", type: "text", label: "Lead", required: true },
          { name: "body", type: "textarea", label: "Note", rows: 3, required: true }
        ]
      }
    ]
  },

  interface: {
    label: "Navigation & labels",
    shape: "object",
    description: "The words the site uses on every page: the menu, the buttons, and the small labels around content. Where a label says {count}, the site fills in the number.",
    fields: [
      {
        name: "nav",
        type: "group",
        label: "Menu",
        fields: [
          { name: "home", type: "text", label: "Home", required: true, span: "third" },
          { name: "projects", type: "text", label: "Projects", required: true, span: "third" },
          { name: "contact", type: "text", label: "Contact", required: true, span: "third" },
          { name: "moreInfo", type: "text", label: "More Info", required: true, span: "third" },
          { name: "aboutSite", type: "text", label: "About this site", required: true, span: "third" }
        ]
      },
      {
        name: "actions",
        type: "group",
        label: "Buttons",
        help: "The row of buttons under the home and contact headlines. Where each one goes is Site Settings → Person.",
        fields: [
          { name: "downloadPdf", type: "text", label: "Download PDF", required: true, span: "half" },
          { name: "preparingPdf", type: "text", label: "While the PDF is made", required: true, span: "half" },
          { name: "email", type: "text", label: "Email", required: true, span: "third" },
          { name: "linkedin", type: "text", label: "LinkedIn", required: true, span: "third" },
          { name: "github", type: "text", label: "GitHub", required: true, span: "third" }
        ]
      },
      { name: "backToTop", type: "text", label: "Back to top button", required: true, span: "half" },
      { name: "openToRelocation", type: "text", label: "Relocation badge", required: true, span: "half", help: "Shown while Site Settings → Visibility has it on." },
      { name: "bulletReadMore", type: "text", label: "Resume bullet link", required: true, span: "half", help: "On a bullet that links to its project." },
      { name: "showCredential", type: "text", label: "Certificate link", required: true, span: "half", help: "When a certificate doesn't name its own." },
      {
        name: "caseStudy",
        type: "group",
        label: "Case studies",
        help: "The toggle under a project, and the headings inside its case study.",
        fields: [
          { name: "view", type: "text", label: "Open", required: true, span: "half" },
          { name: "hide", type: "text", label: "Close", required: true, span: "half" },
          { name: "problem", type: "text", label: "Problem", required: true, span: "third" },
          { name: "rootCause", type: "text", label: "Root cause", required: true, span: "third" },
          { name: "constraints", type: "text", label: "Constraints", required: true, span: "third" },
          { name: "approach", type: "text", label: "Approach", required: true, span: "third" },
          { name: "designDecisions", type: "text", label: "Design decisions", required: true, span: "third" },
          { name: "impact", type: "text", label: "Impact", required: true, span: "third" }
        ]
      },
      {
        name: "gallery",
        type: "group",
        label: "Photo galleries",
        fields: [
          { name: "oneImage", type: "text", label: "Note under one image", required: true, span: "half" },
          { name: "manyImages", type: "text", label: "Note under several", required: true, span: "half", help: "{count} becomes the number of images." },
          { name: "dragToCompare", type: "text", label: "Added when there's a before & after", required: true, span: "half" },
          { name: "before", type: "text", label: "Before tag", required: true, span: "third" },
          { name: "after", type: "text", label: "After tag", required: true, span: "third" },
          { name: "loading", type: "text", label: "Full-screen: loading", required: true, span: "half" },
          { name: "failed", type: "text", label: "Full-screen: failed", required: true, span: "half" },
          { name: "pdf", type: "text", label: "PDF tag", required: true, span: "third" },
          { name: "pages", type: "text", label: "PDF page count", required: true, span: "third", help: "{count} is the number of pages." },
          { name: "onePage", type: "text", label: "…with one page", required: true, span: "third" },
          { name: "firstPageOf", type: "text", label: "Full-screen: PDF page note", required: true, span: "half", help: "{count} is the number of pages." },
          { name: "downloadPdf", type: "text", label: "Download PDF button", required: true, span: "half" }
        ]
      },
      {
        name: "dates",
        type: "group",
        label: "Dates",
        fields: [
          { name: "present", type: "text", label: "End of an ongoing range", required: true, span: "half" }
        ]
      },
      {
        name: "timeline",
        type: "group",
        label: "About this site: timeline",
        fields: [
          { name: "shipped", type: "text", label: "Past entry badge", required: true, span: "third" },
          { name: "inProgress", type: "text", label: "Present entry badge", required: true, span: "third" },
          { name: "planned", type: "text", label: "Future entry badge", required: true, span: "third" },
          { name: "past", type: "text", label: "Axis: past", required: true, span: "third" },
          { name: "present", type: "text", label: "Axis: present", required: true, span: "third" },
          { name: "future", type: "text", label: "Axis: future", required: true, span: "third" },
          { name: "playing", type: "text", label: "Tour playing", required: true, span: "third" },
          { name: "paused", type: "text", label: "Tour paused", required: true, span: "third" },
          { name: "viewScreenshot", type: "text", label: "Screenshot without a caption", required: true, span: "third" }
        ]
      },
      {
        name: "pillars",
        type: "group",
        label: "About this site: pillars",
        fields: [
          { name: "readMore", type: "text", label: "Open", required: true, span: "half" },
          { name: "less", type: "text", label: "Close", required: true, span: "half" }
        ]
      }
    ]
  },

  header: {
    label: "Site Settings",
    shape: "object",
    icon: "gear",
    description: "Who the site is about, and which parts of it are switched on.",
    fields: [
      {
        name: "siteMode",
        type: "select",
        label: "Site mode",
        span: "third",
        help: "Not read by the site yet.",
        options: [
          { value: "resume", label: "Resume" },
          { value: "coming-soon", label: "Coming soon" }
        ]
      },
      {
        name: "person",
        type: "group",
        label: "Person",
        help: "The hero block at the top of the resume, and the contact buttons.",
        fields: [
          { name: "name", type: "text", label: "Name", required: true, span: "half" },
          { name: "title", type: "text", label: "Title", span: "half" },
          { name: "location", type: "text", label: "Location", span: "half" },
          { name: "email", type: "text", label: "Email", span: "half" },
          { name: "phone", type: "text", label: "Phone", span: "half" },
          { name: "website", type: "text", label: "Website", span: "half" },
          { name: "linkedin", type: "text", label: "LinkedIn", span: "half" },
          { name: "github", type: "text", label: "GitHub", span: "half" }
        ]
      },
      {
        name: "visibility",
        type: "group",
        label: "Visibility",
        help: "Section-level switches for the public site.",
        fields: [
          { name: "experienceProjectButtons", type: "boolean", label: "Project links on resume bullets", default: false, always: true, span: "half" },
          { name: "experienceProofButtons", type: "boolean", label: "Proof links on resume bullets", default: false, always: true, span: "half" },
          { name: "projectsSection", type: "boolean", label: "Projects page", default: true, always: true, span: "half" },
          { name: "proofIndex", type: "boolean", label: "Proof index", default: false, always: true, span: "half" },
          { name: "openToRelocation", type: "boolean", label: "\"Open to relocation\" badge", default: true, always: true, span: "half" }
        ]
      },
      {
        name: "theme",
        type: "group",
        label: "Overall theme",
        help: "Ten preset color palettes, each with its own light and dark mode, plus a Customization option for picking any colors you like.",
        fields: [
          { name: "paletteId", type: "palette", label: "Palette", options: PALETTE_OPTIONS, always: true },
          {
            name: "custom",
            type: "group",
            label: "Customization colors",
            help: "Only used when the palette above is set to Customization.",
            fields: [
              { name: "light", type: "group", label: "Light mode", fields: CUSTOM_PALETTE_MODE_FIELDS },
              { name: "dark", type: "group", label: "Dark mode", fields: CUSTOM_PALETTE_MODE_FIELDS }
            ]
          }
        ]
      },
      {
        name: "fonts",
        type: "group",
        label: "Typography",
        help: "Broad, section-level typefaces — not per-component control.",
        fields: [
          { name: "header", type: "select", label: "Headers (H1)", span: "third", options: FONT_OPTIONS, always: true },
          { name: "subheader", type: "select", label: "Sub-headers (H2/H3)", span: "third", options: FONT_OPTIONS, always: true },
          { name: "body", type: "select", label: "Body copy", span: "third", options: FONT_OPTIONS, always: true }
        ]
      },
      {
        name: "layout",
        type: "group",
        label: "Layout",
        help: "How page-level text sits, the same on every page.",
        fields: [
          {
            name: "introAlign",
            type: "choice",
            label: "Intro under a page headline",
            default: "left",
            always: true,
            help: "The paragraph under the headline on Projects, More Info and About this site. Left, Centered and Right keep a comfortable line length; Full width runs it across the page.",
            options: [
              { value: "left", label: "Left", help: "Against the left edge, the page's reading width." },
              { value: "center", label: "Centered", help: "Centered, with even space on each side." },
              { value: "right", label: "Right", help: "Against the right edge." },
              { value: "full", label: "Full width", help: "Across the whole page." }
            ]
          }
        ]
      },
      {
        // Left out of header.json while off, so a save that didn't touch it changes nothing.
        name: "motion",
        type: "group",
        label: "Motion",
        help: "How the site's repeating animations run together.",
        fields: [
          {
            name: "syncAnimations",
            type: "boolean",
            label: "Sync animations",
            default: false,
            omitWhenDefault: true,
            help: "On: every repeating animation runs on one shared beat, so all the Read more glints sweep together and all the skill pills' borders move together. Off: each runs on its own offset, as the site does now."
          }
        ]
      },
      { name: "resumePdfPath", type: "text", label: "Resume PDF path", span: "half", placeholder: "/api/resume-pdf", help: "What the “Download PDF” button fetches." }
    ]
  }
};

/**
 * The editor's sidebar, read like the site is: the home page top to bottom,
 * then each further page in nav order, then the settings that apply to all of
 * them. One group per page — the rail draws a divider wherever the page
 * changes. A schema that isn't listed here doesn't appear.
 */
export const RAIL = [
  { page: "Home", path: "/", keys: ["homePage", "summary", "experience", "skills", "education"] },
  { page: "Projects", path: "/projects", keys: ["projectsPage", "projects", "proofs"] },
  { page: "Contact", path: "/contact", keys: ["contact"] },
  { page: "More Info", path: "/more-info", keys: ["moreInfo"] },
  { page: "About this site", path: "/about-this-site", keys: ["aboutSite"] },
  { page: "Site settings", path: "/", keys: ["header", "interface"] }
];
