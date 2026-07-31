import header from "@/data/header.json";
import education from "@/data/education.json";
import experience from "@/data/experience.json";
import proofs from "@/data/proofs.json";
import projects from "@/data/projects.json";
import skills from "@/data/skills.json";
import summary from "@/data/summary.json";
import type { ResumeData } from "@/types/resume";

/**
 * Header data keeps the shared site metadata. Editable resume content, proof
 * summaries, and project details live in focused JSON files and are merged
 * here at build time.
 */
const visibility = header.visibility as ResumeData["visibility"];

const visibleExperience: ResumeData["experience"] = experience.map((job) => ({
  ...job,
  bullets: job.bullets.map((bullet) => ({
    text: bullet.text,
    ...(visibility.experienceProofButtons && "proofId" in bullet
      ? { proofId: bullet.proofId }
      : {}),
    ...(visibility.experienceProjectButtons && "projectId" in bullet
      ? { projectId: bullet.projectId }
      : {})
  }))
}));

const includeProofData = visibility.proofIndex || visibility.experienceProofButtons;
const includeProjectData = visibility.projectsSection
  || visibility.experienceProjectButtons
  || includeProofData;

const resumeData: ResumeData = {
  ...(header as ResumeData),
  education: education as ResumeData["education"],
  experience: visibleExperience,
  proofs: includeProofData ? proofs as ResumeData["proofs"] : [],
  projects: includeProjectData ? projects as ResumeData["projects"] : [],
  skills: skills as ResumeData["skills"],
  summary: summary.summary
};

export default resumeData;
