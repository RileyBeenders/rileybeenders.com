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
  assets: ProofAsset[];
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
