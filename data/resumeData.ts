import masterResume from "@/data/resume.json";
import education from "@/data/education.json";
import experience from "@/data/experience.json";
import proofs from "@/data/proofs.json";
import projects from "@/data/projects.json";
import skills from "@/data/skills.json";
import type { ResumeData } from "@/types/resume";

/**
 * The master resume keeps only shared site metadata. Editable resume content,
 * proof summaries, and project details live in focused JSON files and are
 * merged here at build time.
 */
const resumeData: ResumeData = {
  ...(masterResume as ResumeData),
  education: education as ResumeData["education"],
  experience: experience as ResumeData["experience"],
  proofs: proofs as ResumeData["proofs"],
  projects: projects as ResumeData["projects"],
  skills: skills as ResumeData["skills"]
};

export default resumeData;
