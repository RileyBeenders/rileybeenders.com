import header from "@/data/header.json";
import education from "@/data/home/education.json";
import experience from "@/data/home/experience.json";
import proofs from "@/data/projects/proofs.json";
import projects from "@/data/projects/projects.json";
import skills from "@/data/home/skills.json";
import summary from "@/data/home/summary.json";
import type { Project, ProofPoint, ResumeData } from "@/types/resume";

/**
 * Header data keeps the shared site metadata. Editable resume content, proof
 * summaries, and project details live in focused JSON files and are merged
 * here at build time.
 */
const visibility = header.visibility as ResumeData["visibility"];

/**
 * Entries opt out of the public site with `"visible": false`. Anything without
 * the key stays published, so the flag is additive — history lives on in the
 * JSON (and in the Studio) even once a project comes off the site.
 */
function isPublished(entry: { visible?: boolean }): boolean {
  return entry.visible !== false;
}

/** Explicit `order` wins; anything without one falls to the back, in file order. */
function byOrder(a: Project, b: Project): number {
  return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
}

const publishedProjects = (projects as Project[]).filter(isPublished).sort(byOrder);
const publishedProofs = (proofs as ProofPoint[]).filter(isPublished);

const experienceData = experience as ResumeData["experience"];

const visibleExperience: ResumeData["experience"] = experienceData.map((job) => ({
  ...job,
  bullets: job.bullets.map((bullet) => ({
    text: bullet.text,
    ...(Array.isArray(bullet.emphasis) && bullet.emphasis.length > 0
      ? { emphasis: bullet.emphasis }
      : {}),
    ...(visibility.experienceProofButtons && "proofId" in bullet
      ? { proofId: bullet.proofId }
      : {}),
    ...(visibility.experienceProjectButtons && "projectId" in bullet
      ? { projectId: bullet.projectId }
      : {})
  }))
}));

// The projects page uses proofs as its detail layer, so it needs them loaded
// even when the standalone proof index stays switched off.
const includeProofData = visibility.proofIndex
  || visibility.experienceProofButtons
  || visibility.projectsSection;
const includeProjectData = visibility.projectsSection
  || visibility.experienceProjectButtons
  || includeProofData;

const resumeData: ResumeData = {
  ...(header as ResumeData),
  education: education as ResumeData["education"],
  experience: visibleExperience,
  proofs: includeProofData ? publishedProofs : [],
  projects: includeProjectData ? publishedProjects : [],
  skills: skills as ResumeData["skills"],
  summary: summary.summary
};

export default resumeData;
