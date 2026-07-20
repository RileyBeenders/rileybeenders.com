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
  caseStudyId?: string;
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

export type Project = {
  id: string;
  name: string;
  type: string;
  summary: string;
  bullets: ResumeBullet[];
  order?: number;
  proofId?: string;
  images?: ProjectImage[];
};

export type CaseStudy = {
  id: string;
  title: string;
  subtitle: string;
  problem: string;
  constraints: string[];
  approach: string[];
  impact: string[];
  tools: string[];
  assets: ProofAsset[];
};

export type ResumeData = {
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
  proofModeLabel: string;
  skills: {
    category: string;
    items: string[];
  }[];
  experience: Experience[];
  projects: Project[];
  education: {
    school: string;
    degree: string;
    graduation: string;
  }[];
  proofs: ProofPoint[];
  caseStudies: CaseStudy[];
};
