import type { ResumeData, SkillGroup } from "@/types/resume";

/** Where a linked skill points, ready for its hover card. */
export type SkillTarget = {
  kind: "project" | "proof";
  /** The project's name or the proof's title. */
  name: string;
  /** The project's category, or for a proof, the project it sits in. */
  detail?: string;
  href: string;
};

/**
 * Resolves one skill group's links (Skills → Links to, in the Studio) to the
 * places they go, keyed by item. A link only counts when the Projects page is
 * on and what it names is published: a project goes to its entry; a proof,
 * which the site shows inside a project's case study, goes to that project
 * with the case study opened (`#project-<id>-case-study`, see ProjectEntry).
 * Anything else renders as a plain skill, never a dead end.
 */
export function skillTargets(group: SkillGroup, data: ResumeData): Map<string, SkillTarget> {
  const targets = new Map<string, SkillTarget>();
  if (!data.visibility.projectsSection || !group.links?.length) return targets;

  for (const link of group.links) {
    if (!group.items.includes(link.skill)) continue;

    if (link.projectId) {
      const project = data.projects.find((entry) => entry.id === link.projectId);
      if (project) {
        targets.set(link.skill, {
          kind: "project",
          name: project.name,
          detail: project.type || undefined,
          href: `/projects#project-${project.id}`
        });
      }
      continue;
    }

    if (link.proofId) {
      const proof = data.proofs.find((entry) => entry.id === link.proofId);
      const project = proof
        && (data.projects.find((entry) => entry.proofId === proof.id)
          ?? data.projects.find((entry) => entry.id === proof.projectId));
      if (proof && project) {
        targets.set(link.skill, {
          kind: "proof",
          name: proof.title,
          detail: project.name,
          href: `/projects#project-${project.id}-case-study`
        });
      }
    }
  }

  return targets;
}
