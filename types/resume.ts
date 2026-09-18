export type ProofAsset = {
  label: string;
  src: string;
  alt: string;
};

export type ProofPoint = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  assets: ProofAsset[];
  projectId?: string;
  /** Omit or set true to publish. `false` keeps the history but hides it on the site. */
  visible?: boolean;
};

export type ResumeBullet = {
  text: string;
  /** Exact words or phrases that receive the active palette accent on interaction. */
  emphasis?: string[];
  proofId?: string;
  projectId?: string;
};

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  fit?: "cover" | "contain";
};

export type Experience = {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  context?: string;
  bullets: ResumeBullet[];
};

export type EducationDegree = {
  school: string;
  degree: string;
  graduation: string;
};

export type EducationCertificate = {
  certificateName: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  credentialLabel?: string;
};

export type Education = {
  degrees: EducationDegree[];
  certificates: EducationCertificate[];
};

/** Where a project's date box sits on its entry. The top/bottom corners ride the entry's hairline rule like a tag; inline sits under the subtitle. */
export type ProjectDatePosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "inline";

export type ProjectDates = {
  /** ISO date (YYYY-MM-DD) or free text. ISO dates are formatted for display and used for day counts. */
  start: string;
  /** Omit while `ongoing`; otherwise ISO or free text. */
  end?: string;
  /** The project is still moving: the box reads "→ Present" and its underline runs as an indeterminate progress bar. */
  ongoing?: boolean;
  position?: ProjectDatePosition;
};

export type ProjectStat = {
  label: string;
  value: number;
  /** Shown after the number, e.g. "+" or " days". */
  suffix?: string;
  note?: string;
};

export type TimelineEra = "past" | "present" | "future";

export type TimelineEntry = {
  /** ISO date. Future entries can be a target month (YYYY-MM-01); they render as "planned". */
  date: string;
  era: TimelineEra;
  title: string;
  summary: string;
  /** Short git hash, when the entry is a real commit. */
  hash?: string;
  tags?: string[];
  files?: number;
  insertions?: number;
  deletions?: number;
  /** A screenshot from `feature.screenshots` to show beside this entry. */
  screenshotId?: string;
};

/**
 * A capture of the site itself. `src` is the light-theme capture; `srcDark`
 * the dark one. The About page shows the *opposite* of the visitor's theme
 * (light site → dark shot) so the thumbnails read as a different surface.
 */
export type FeatureScreenshot = {
  id: string;
  src: string;
  srcDark?: string;
  alt: string;
  caption?: string;
};

/** Which live demo a "Behind the site" row renders beside its notes. */
export type BackendDemo = "resume" | "studio" | "skills";

/** resume demo: a posting keyword and the real resume line it matches. */
export type BackendMatch = {
  keyword: string;
  line: string;
};

/** skills demo: one procedure in the mini router. */
export type BackendSkill = {
  name: string;
  trigger: string;
  does: string;
};

export type BackendItem = {
  demo: BackendDemo;
  eyebrow?: string;
  title: string;
  /** Paragraphs shown beside the demo. */
  body: string[];
  /** Short one-line notes under the paragraphs. */
  notes?: string[];
  matches?: BackendMatch[];
  skills?: BackendSkill[];
};

/** The tools that never appear on the live site: the resume formatter, the Studio, the agent skills. */
export type FeatureBackend = {
  eyebrow?: string;
  intro?: string;
  items: BackendItem[];
};

export type FeaturePillar = {
  eyebrow?: string;
  title: string;
  /** Paragraphs. The first one shows at rest; the rest open on demand. */
  body: string[];
  screenshotId?: string;
};

/** The deep-dive layer of the About-this-site page: stats, a commit timeline, thematic pillars, and annotated screenshots. */
export type ProjectFeature = {
  eyebrow?: string;
  intro?: string;
  stats?: ProjectStat[];
  timeline?: TimelineEntry[];
  pillars?: FeaturePillar[];
  screenshots?: FeatureScreenshot[];
  backend?: FeatureBackend;
};

export type Project = {
  id: string;
  name: string;
  type: string;
  summary: string;
  bullets: ResumeBullet[];
  order?: number;
  proofId?: string;
  images?: ProjectImage[];
  additionalInfo?: ProjectAdditionalInfo;
  dates?: ProjectDates;
  /** Omit or set true to publish. `false` keeps the history but hides it on the site. */
  visible?: boolean;
};

export type ProjectAdditionalInfo = {
  title: string;
  subtitle: string;
  problem: string;
  constraints: string[];
  approach: string[];
  impact: string[];
  tools: string[];
  /** Diagrams. Optional in practice: the Studio drops the key when the list is empty. */
  assets?: ProofAsset[];
  /** Why the design went the way it did — the trade-offs behind the approach. */
  designDecisions?: string[];
  /** What was actually wrong underneath the symptom the project started from. */
  rootCause?: string;
};

export type ComingSoonAction = {
  label: string;
  href: string;
};

export type ComingSoonStatus = {
  label: string;
  value: string;
  note: string;
};

export type ComingSoonTeaser = {
  eyebrow: string;
  title: string;
  summary: string;
};

export type ComingSoonChecklistItem = {
  label: string;
  detail: string;
};

export type ComingSoonLaunchSignal = {
  charge: number;
  currentTask: string;
  targetLaunchDate: string;
};

export type ComingSoonContent = {
  badge: string;
  headline: string;
  subheadline: string;
  summary: string;
  availability: string;
  launchSignal: ComingSoonLaunchSignal;
  primaryAction?: ComingSoonAction;
  secondaryAction?: ComingSoonAction;
  statusBoard: ComingSoonStatus[];
  teasers: ComingSoonTeaser[];
  checklist: ComingSoonChecklistItem[];
  signals: string[];
};

export type ResumeVisibility = {
  experienceProjectButtons: boolean;
  experienceProofButtons: boolean;
  projectsSection: boolean;
  proofIndex: boolean;
  openToRelocation: boolean;
};

/** Five colors a palette is built from — the rest of the token set is derived from these (see lib/palette.ts). */
export type PaletteSeeds = {
  paper: string;
  white: string;
  ink: string;
  accent: string;
  blue: string;
};

export type ThemeSetting = {
  /** One of the preset ids in lib/palettes.ts, or "custom" to use the seeds below. */
  paletteId: string;
  custom: {
    light: PaletteSeeds;
    dark: PaletteSeeds;
  };
};

export type FontRole = "header" | "subheader" | "body";

/** Values are ids from lib/fonts.ts. */
export type FontSettings = Record<FontRole, string>;

export type ResumeData = {
  siteMode?: "resume" | "coming-soon";
  person: {
    name: string;
    title: string;
    location: string;
    email: string;
    phone: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string;
  visibility: ResumeVisibility;
  theme: ThemeSetting;
  fonts: FontSettings;
  resumePdfPath: string;
  comingSoon?: ComingSoonContent;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: Experience[];
  projects: Project[];
  education: Education;
  proofs: ProofPoint[];
};
