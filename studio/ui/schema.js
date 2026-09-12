/**
 * Schemas describe every editable JSON file: which fields exist, how each one
 * is edited, and the order keys are written back in.
 *
 * Field order here IS the key order on disk, so an untouched entry saves back
 * byte-for-byte identical. When the site's types gain a field, add it here and
 * the form picks it up — there is no separate UI to update.
 *
 * Layout hints are optional and change nothing on disk: `span: "half"` or
 * `"third"` lets a short field share its row, and `prose: true` gives a
 * textarea room to write in plus a running word count.
 */

/** Repeatable bullet rows, shared by projects and experience. */
const BULLET_FIELDS = [
  { name: "text", type: "textarea", label: "Bullet", rows: 3, required: true },
  { name: "projectId", type: "ref", source: "projects", label: "Links to project" },
  { name: "proofId", type: "ref", source: "proofs", label: "Links to proof" }
];

const ASSET_FIELDS = [
  { name: "label", type: "text", label: "Label" },
  { name: "src", type: "image", label: "File" },
  { name: "alt", type: "text", label: "Alt text", help: "Described for screen readers." }
];

const IMAGE_FIELDS = [
  { name: "src", type: "image", label: "Image", required: true },
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

  header: {
    label: "Site Settings",
    shape: "object",
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
          { name: "proofIndex", type: "boolean", label: "Proof index", default: false, always: true, span: "half" }
        ]
      },
      { name: "resumePdfPath", type: "text", label: "Resume PDF path", span: "half", placeholder: "/api/resume-pdf", help: "What the “Download PDF” button fetches." }
    ]
  }
};
