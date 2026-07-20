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
