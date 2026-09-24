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
 * RAIL, at the bottom, arranges the schemas in the editor's sidebar in the
 * order the site reads them.
 */

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
  // A GIF gets a playback-speed slider under its path, kept as `speed` beside `src`.
  { name: "src", type: "image", label: "Image", required: true, speedName: "speed" },
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
 * Ten hand-picked presets plus Customization. Swatches are the light-mode
 * preview only — each preset's full light/dark token set (and the ramp that
 * derives ink-soft/muted/faint/rule/prose/pill-text from just these five
 * seeds) lives in lib/palettes.ts and lib/palette.ts on the site side. Keep
 * the two in sync by hand; they change together and rarely.
 */
const PALETTE_OPTIONS = [
  {
    id: "default", name: "Default",
    description: "The site's original paper-and-ink palette with a red accent.",
    swatch: { paper: "#fbfbf9", ink: "#0b1a2b", accent: "#e3342f", blue: "#2f86c4" }
  },
  {
    id: "electric", name: "Electric",
    description: "Tesla-inspired white canvas in light, Bugatti-inspired near-black canvas in dark — one electric-blue accent both ways.",
    swatch: { paper: "#ffffff", ink: "#171a20", accent: "#3e6ae1", blue: "#3e6ae1" }
  },
  {
    id: "forest", name: "Forest",
    description: "Sage paper, deep forest ink, burnt-orange accent.",
    swatch: { paper: "#f8f7f0", ink: "#1a2b1f", accent: "#c1622b", blue: "#2f7a63" }
  },
  {
    id: "twilight", name: "Twilight",
    description: "Pale lavender paper, indigo ink, violet accent.",
    swatch: { paper: "#f7f6fb", ink: "#1c1930", accent: "#7c4dbd", blue: "#3aa0c9" }
  },
  {
    id: "terracotta", name: "Terracotta",
    description: "Warm sand paper, espresso ink, clay-red accent.",
    swatch: { paper: "#fbf4ec", ink: "#2e1d14", accent: "#c1502e", blue: "#2d7d82" }
  },
  {
    id: "ocean", name: "Ocean",
    description: "Ice-blue paper, deep navy ink, coral accent.",
    swatch: { paper: "#f3f8fb", ink: "#0d2436", accent: "#e8604a", blue: "#1f9ad6" }
  },
  {
    id: "graphite", name: "Graphite",
    description: "Restrained near-grayscale with a single charcoal accent.",
    swatch: { paper: "#f6f6f4", ink: "#161616", accent: "#3a3a3a", blue: "#7d8590" }
  },
  {
    id: "amber", name: "Amber",
    description: "Cream paper, dark umber ink, gold accent.",
    swatch: { paper: "#fbf6e9", ink: "#2b2210", accent: "#b8791a", blue: "#2f6b5e" }
  },
  {
    id: "rose", name: "Rose",
    description: "Blush paper, deep plum ink, magenta accent.",
    swatch: { paper: "#fbf3f5", ink: "#2c1420", accent: "#c13d6b", blue: "#5a5ec7" }
  },
  {
    id: "slate", name: "Slate",
    description: "Cool gray paper, slate-navy ink, teal accent.",
    swatch: { paper: "#f4f6f8", ink: "#10202e", accent: "#0d8f8f", blue: "#3355a4" }
  },
  {
    id: "custom", name: "Customization",
    description: "Pick any colors you like, below."
    // No swatch: the palette control previews this one from the custom
    // colors themselves instead of a fixed swatch.
  }
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
      { name: "name", type: "text", label: "Name", required: true },
      { name: "id", type: "slug", label: "ID", required: true, help: "Used in links and to match a proof. Lowercase, no spaces." },
      { name: "order", type: "number", label: "Order", help: "Low numbers come first on the projects page." },
      { name: "type", type: "text", label: "Category", placeholder: "Motion Control / Product Platform" },
      { name: "visible", type: "boolean", label: "Show on the site", default: true, omitWhenDefault: true, help: "Turn off to keep the write-up here but hide it from visitors." },
      { name: "summary", type: "textarea", label: "Summary", rows: 3 },
      { name: "status", type: "text", label: "Status note", help: "A short note on the state of the write-up, shown in small type under the summary. Leave blank when it is finished." },
      { name: "images", type: "objectList", label: "Gallery", itemLabel: "Image", fields: IMAGE_FIELDS, gallery: true },
      { name: "proofId", type: "ref", source: "proofs", label: "Proof", help: "The write-up that slides in after this project." },
      { name: "bullets", type: "objectList", label: "Bullets", itemLabel: "Bullet", fields: BULLET_FIELDS, always: true },
      {
        name: "additionalInfo",
        type: "group",
        label: "Proof detail",
        help: "The panel that slides in from the right on the projects page.",
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
    subtitle: (item) => `${(item.items || []).length} items`,
    blank: () => ({ category: "New group", items: [] }),
    fields: [
      { name: "category", type: "text", label: "Category", required: true },
      { name: "items", type: "stringList", label: "Items", always: true }
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
          { name: "description", type: "stringList", label: "Paragraphs", multiline: true, always: true },
          { name: "linkedinLabel", type: "text", label: "LinkedIn link text", required: true, span: "half", help: "Shown on the card; the address is Site Settings → Person → LinkedIn." },
          { name: "githubLabel", type: "text", label: "GitHub link text", required: true, span: "half", help: "Shown on the card; the address is Site Settings → Person → GitHub." }
        ]
      }
    ]
  },

  moreInfo: {
    label: "More Info",
    shape: "object",
    description: "The About page: who you are, why this site exists, and the application tracker.",
    fields: [
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
          { name: "intro", type: "textarea", label: "Intro", rows: 3, help: "Optional lead-in above the chart." }
        ]
      }
    ]
  },

  aboutSite: {
    label: "About this site",
    shape: "object",
    description: "The site as its own case study: hero, the running date bar, summary and bullets, screenshots, the case study, and the deep-dive (stats, commit timeline, pillars, and the Behind-the-site demos). The site-timeline-sync agent skill refreshes the stats and timeline from git.",
    fields: [
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
          { name: "stats", type: "objectList", label: "Stats", itemLabel: "Stat", fields: STAT_FIELDS },
          { name: "timeline", type: "objectList", label: "Timeline", itemLabel: "Entry", fields: TIMELINE_FIELDS },
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
  { page: "Home", path: "/", keys: ["summary", "experience", "skills", "education"] },
  { page: "Projects", path: "/projects", keys: ["projects", "proofs"] },
  { page: "Contact", path: "/contact", keys: ["contact"] },
  { page: "More Info", path: "/more-info", keys: ["moreInfo"] },
  { page: "About this site", path: "/about-this-site", keys: ["aboutSite"] },
  { page: "Site settings", path: "/", keys: ["header"] }
];
