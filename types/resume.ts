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
  /** An image, GIF, PDF or MP4. An MP4 shows as the poster frame saved beside it as `<src>.jpg` and plays in the full-screen viewer. */
  src: string;
  alt: string;
  caption?: string;
  fit?: "cover" | "contain";
  /** The shape of the image's gallery frame; omitted = 4:3. "original" draws the whole image uncropped. */
  aspect?: ImageAspect;
  /**
   * GIF only: playback rate relative to the recording (2 = twice as fast).
   * The Studio bakes it into the file's frame delays on save, so the site
   * never reads it — a browser plays a GIF at the file's own pace.
   */
  speed?: number;
  /**
   * Omitted: the one image (or GIF) as it is. "compare": `src` is the Before,
   * `after` the After, and a bar slides between them.
   */
  display?: "compare";
  /** The After image of a comparison. */
  after?: string;
  /**
   * PDF only (a `src` ending in .pdf): its page count, and whether visitors
   * get a Download PDF button. The gallery grid shows just the first page, from
   * the preview the Studio saves beside the file as `<src>.png`; the full-screen
   * viewer scrolls every page, drawn from the file.
   */
  pages?: number;
  download?: boolean;
  /**
   * A LinkedIn post this artifact is a capture of. `src` is the picture the
   * Studio took of the post; this is what it said, kept beside it so the
   * record survives the post being edited or taken down. The site shows the
   * words as its own card and links back to the original.
   */
  post?: SocialPost;
  /** Where the Before sits in the comparison's frame; omitted = cover, centred. */
  frame?: ImageFrame;
  /** Where the After sits in the comparison's frame; omitted = cover, centred. */
  afterFrame?: ImageFrame;
  /**
   * Set by Photo Mode on the dev site: the photo leaves the gallery and floats
   * in the project's body text, which wraps around it. Omitted = in the gallery.
   */
  place?: ImagePlace;
};

/**
 * Where a photo sits in its project's body text. Anchored to a paragraph or
 * bullet rather than to pixels, so it stays inside the body (never over the
 * title, the rules or the dates) at every screen width, and survives the
 * text being edited: an anchor past the last block falls back to the last.
 */
export type ImagePlace = {
  /** Which block the photo floats at the start of: the summary's paragraphs first, then the bullets. */
  at: number;
  /** Which edge of the body it floats against. */
  side: "left" | "right";
  /** Its width, as a percentage of the body's width. */
  width: number;
};

/**
 * A post captured from elsewhere, kept as evidence. Only `url` and
 * `capturedAt` are certain: the rest is what the Studio could read off the
 * page, corrected by hand where it came back thin.
 */
export type SocialPost = {
  /** The original, linked from the card. */
  url: string;
  author?: string;
  /** As the post showed it ("3mo", "May 2026") — not normalised, since it is a quotation. */
  date?: string;
  /** The post's words. */
  text?: string;
  /** ISO timestamp of the capture, shown on the card so the record dates itself. */
  capturedAt: string;
};

/**
 * An image's crop inside its frame (the image's `aspect`), as percentages of the frame: `x`/`y`
 * the image's top-left corner, `w` its width (its height follows its own
 * shape). Set in the Studio's aligner so a before and after line up.
 */
export type ImageFrame = { x: number; y: number; w: number };

/** The frame shapes the Studio offers for a gallery image. */
export type ImageAspect = "3:2" | "16:9" | "21:9" | "1:1" | "4:5" | "3:4" | "2:3" | "9:16" | "original";

export type Experience = {
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  context?: string;
  /**
   * Where the role sits on the home page's Experience section. "auto" (or left
   * out) goes by its end date and Site Settings → Layout → Experience shown
   * (years); "always" shows it at rest whatever its dates; "more" keeps it
   * behind the "See more of my past" button even while it is current.
   */
  homeDisplay?: "auto" | "always" | "more";
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

/** A dot's shape. `star` marks a moment whose weight isn't in its diff. */
export type TimelineMark = "dot" | "star";

export type TimelineEntry = {
  /** ISO date. Future entries can be a target month (YYYY-MM-01); they render as "planned". */
  date: string;
  era: TimelineEra;
  /** Stable handle. Only needed when another entry points a connector back at this one. */
  id?: string;
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
  /** Defaults to a dot sized by the commit. */
  mark?: TimelineMark;
  /** The `id` of an earlier entry. Draws a line from its dot to this one, arrow pointing here. */
  linkFrom?: string;
  /** Caption on that line. Defaults to the gap between the two dates, e.g. "7 days". */
  linkLabel?: string;
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
  title: string;
  /** Paragraphs. The first one shows at rest; the rest open on demand. */
  body: string[];
  screenshotId?: string;
};

/**
 * One version of the site's design, for the Versions block of the site's own
 * project. The current one comes first; an older one links to its frozen
 * snapshot under /versions/<slug>/ (scripts/snapshot-version.mjs).
 */
export type SiteVersion = {
  name: string;
  /** e.g. "Aug 27 to Nov 7, 2026". */
  dates: string;
  /** The design live today. Shown first and largest; it has no snapshot. */
  current?: boolean;
  summary: string;
  /** What this version brought, one line each. */
  changes?: string[];
  /** Captures of the version, light theme: home first. */
  images?: { src: string; alt: string }[];
  /** The frozen snapshot, e.g. "/versions/blueprint-press/index.html". */
  snapshotHref?: string;
  /** The commit the snapshot was built from. */
  commit?: string;
};

/** The deep-dive layer of the About-this-site page: stats, a commit timeline, thematic pillars, and annotated screenshots. */
export type ProjectFeature = {
  /** Every design the site has had, current first. */
  versionsTitle?: string;
  versionsNote?: string;
  versions?: SiteVersion[];
  intro?: string;
  /** The repository button beside the intro. */
  repoLabel?: string;
  stats?: ProjectStat[];
  timelineTitle?: string;
  /** How to use the timeline, under its title. */
  timelineNote?: string;
  timeline?: TimelineEntry[];
  pillarsTitle?: string;
  pillars?: FeaturePillar[];
  screenshots?: FeatureScreenshot[];
  backend?: FeatureBackend;
};

/** A button under a project's bullets: a repository, a release, or another project on this page (`#project-<id>`). */
export type ProjectLink = {
  label: string;
  href: string;
  /** A short word beside the label, e.g. "v1.0.0". */
  note?: string;
};

/** One numbered callout on a walkthrough capture, placed as percentages of the image. */
export type WalkthroughHotspot = {
  x: number;
  y: number;
  /** Omitted: a pin. Given: a rectangle, from (x, y), in percentages of the image. */
  w?: number;
  h?: number;
  label: string;
  text: string;
};

/** One stop on a project's panel walkthrough. */
export type WalkthroughStep = {
  id: string;
  title: string;
  /** Who the panel is for, in a few words. */
  audience: string;
  /** Paragraphs. */
  body: string[];
  shot: FeatureScreenshot;
  hotspots?: WalkthroughHotspot[];
  /** More captures of the same panel, opened from thumbnails under the main one. */
  extras?: FeatureScreenshot[];
};

/** A file the walkthrough offers: a sample the real program wrote. */
export type WalkthroughSample = {
  label: string;
  src: string;
  /** Shown as a chip beside the label, e.g. "CSV · 150 KB". */
  kind: string;
  note: string;
  /** A capture of the file, so it can open in the lightbox as well as in a tab. */
  shot?: FeatureScreenshot;
};

/**
 * An interactive tour of a program's screens, under the project's entry:
 * one capture per step with numbered callouts, prev/next, and the sample
 * files the program writes.
 */
export type ProjectWalkthrough = {
  title: string;
  intro?: string;
  steps: WalkthroughStep[];
  samplesTitle?: string;
  samplesIntro?: string;
  samples?: WalkthroughSample[];
};

/** A shared project category: a filter chip on /projects. The list and its order live in lib/categories.ts. */
export type ProjectCategory = "productDesign" | "software" | "automationControls" | "networkInfrastructure";

export type Project = {
  id: string;
  name: string;
  /** The specific tag on the card ("Windows Desktop App / TypeScript, Electron"). Free text; the filters do not read it. */
  type: string;
  /**
   * The shared categories the project sits in, which the filter chips on
   * /projects sort by (lib/categories.ts). More than one can be on.
   */
  categories?: Partial<Record<ProjectCategory, boolean>>;
  summary: string;
  bullets: ResumeBullet[];
  order?: number;
  proofId?: string;
  images?: ProjectImage[];
  /** A small square mark shown beside the project's title; omitted = none. */
  logo?: { src: string; alt?: string };
  additionalInfo?: ProjectAdditionalInfo;
  dates?: ProjectDates;
  links?: ProjectLink[];
  walkthrough?: ProjectWalkthrough;
  /** A short note on the state of the write-up ("Project page under development"), shown in small type under the summary. */
  status?: string;
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

/**
 * A skill that points at the work behind it: exactly one of `projectId` or
 * `proofId`. Kept beside `items` rather than in it, so every other reader of
 * the skills (the resume PDF, the agent procedures) still sees plain strings.
 */
export type SkillLink = {
  /** The item in the group's `items`, word for word. */
  skill: string;
  projectId?: string;
  proofId?: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
  /** Optional links from items to a project or proof, in item order. */
  links?: SkillLink[];
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
  /** Mode a first-time visitor sees before they use the toggle. "system" follows the device. Defaults to "dark". */
  defaultMode?: "dark" | "light" | "system";
  custom: {
    light: PaletteSeeds;
    dark: PaletteSeeds;
  };
};

/** `mono` is the small-label face: dates, captions, eyebrows and other minor notes. */
export type FontRole = "header" | "subheader" | "body" | "mono";

/** Values are ids from lib/fonts.ts. */
export type FontSettings = Record<FontRole, string>;

/**
 * How the intro under a page headline sits (Projects, More Info, About this
 * site): against the left edge, centred, against the right edge, or across
 * the full width of the page.
 */
export type IntroAlign = "left" | "center" | "right" | "full";

export type LayoutSettings = {
  introAlign: IntroAlign;
  /**
   * How solid the tiles are, as a percentage (40 to 100). Below 100 they are
   * frosted glass: the animated grid and the pen's glow show through, softened
   * (.card in bench.css, --tile-fill). 72 when left out.
   */
  tileOpacity?: number;
  /**
   * How solid the box around a home page section's tiles is, as a percentage
   * (0 to 90; .sec-group in bench.css, --group-fill). The tiles inside keep
   * their own tileOpacity: the two fills do not add up. 50 when left out.
   */
  groupOpacity?: number;
  /**
   * How solid the heading band across the top of a section box reads, as a
   * percentage (40 to 100; .sec-group .sec-head in bench.css,
   * --head-fill-grouped). 95 when left out.
   */
  headingOpacity?: number;
  /**
   * How many years of experience the home page shows at rest. A role that
   * ended longer ago than this waits behind the "See more of my past" button;
   * a role still running always shows. 5 when left out; 0 shows every role.
   */
  experienceYears?: number;
  /**
   * The colour of the "Open to relocation" corner tab on the home page's hero
   * tile (.hero-flag in bench.css, data-tone). Each tone has its own light and
   * dark pair, deliberately outside the palette. Amber when left out.
   */
  relocationColor?: RelocationColor;
};

export type RelocationColor = "amber" | "green" | "coral" | "violet" | "ink";

/**
 * Site-wide motion. `syncAnimations` puts every repeating animation (the Read
 * more glints, the skill pills' borders, the rest) on one shared beat instead
 * of each on its own offset. Left out of header.json, it is off.
 */
export type MotionSettings = {
  syncAnimations?: boolean;
  /** Wheel scrolling eases toward its target instead of jumping (components/bench/SmoothScroll.tsx). Off when left out. */
  smoothScroll?: boolean;
  /** The animated graph paper behind the tiles (components/bench/PlotGrid.tsx). On when left out. */
  grid?: boolean;
  /** Seconds a typical ripple takes to cross the window on that grid. 8 when left out. */
  gridLoopSeconds?: number;
  /** The pen: whether the mouse etches a glowing line along the grid lines. On when left out. */
  gridPointer?: boolean;
  /** Seconds before a piece of that line has faded away. 4 when left out. */
  gridTrailSeconds?: number;
};

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
  layout: LayoutSettings;
  motion?: MotionSettings;
  resumePdfPath: string;
  /** Interactive HTML resume. When set, Download PDF opens it in a new tab
   * (its own Print / PDF button saves the file) instead of downloading resumePdfPath. */
  resumeHtmlPath?: string;
  comingSoon?: ComingSoonContent;
  skills: SkillGroup[];
  experience: Experience[];
  projects: Project[];
  education: Education;
  proofs: ProofPoint[];
};
