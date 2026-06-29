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
  name: string;
  type: string;
  summary: string;
  bullets: ResumeBullet[];
  proofId?: string;
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
