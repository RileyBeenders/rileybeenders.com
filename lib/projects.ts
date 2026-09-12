import type { Project, ProjectImage, ProofAsset, ProofPoint } from "@/types/resume";

/**
 * The projects page shows each project twice: the project panel itself, then a
 * proof panel that slides in beside it. Both views are assembled here so the
 * page component stays a layout, and so the shape the UI consumes is stable
 * even as the JSON behind it grows.
 */

export type ProofSection = {
  label: string;
  /** Exactly one of these is set. */
  body?: string;
  items?: string[];
};

export type ProofView = {
  title: string;
  subtitle?: string;
  summary?: string;
  sections: ProofSection[];
  tags: string[];
  assets: ProofAsset[];
};

export type ProjectView = {
  project: Project;
  /** Gallery images, falling back to the proof diagrams when there are no photos. */
  images: ProjectImage[];
  proof: ProofView | null;
};

const hasText = (value?: string): value is string => typeof value === "string" && value.trim() !== "";
const hasItems = (value?: string[]): value is string[] => Array.isArray(value) && value.length > 0;

function prose(label: string, body?: string): ProofSection | null {
  return hasText(body) ? { label, body } : null;
}

function list(label: string, items?: string[]): ProofSection | null {
  return hasItems(items) ? { label, items } : null;
}

/**
 * Builds the slide-in panel from the project's own write-up, enriched with the
 * matching proof entry. Returns null when there is nothing worth sliding in, so
 * the stage can render as a project on its own.
 */
export function buildProofView(project: Project, proofs: ProofPoint[]): ProofView | null {
  const proof = project.proofId
    ? proofs.find((entry) => entry.id === project.proofId)
    : proofs.find((entry) => entry.projectId === project.id);

  const info = project.additionalInfo;
  if (!info && !proof) return null;

  const sections = [
    prose("Problem", info?.problem),
    prose("Root cause", info?.rootCause),
    list("Constraints", info?.constraints),
    list("Approach", info?.approach),
    list("Design decisions", info?.designDecisions),
    list("Impact", info?.impact)
  ].filter((section): section is ProofSection => section !== null);

  const summary = proof?.summary ?? project.summary;
  if (sections.length === 0 && !hasText(summary)) return null;

  // Tools and proof tags describe the same thing from two angles; show each once.
  const tags = [...new Set([...(info?.tools ?? []), ...(proof?.tags ?? [])])];
  const assets = info?.assets?.length ? info.assets : (proof?.assets ?? []);

  return {
    title: info?.title || proof?.title || project.name,
    subtitle: hasText(info?.subtitle) ? info.subtitle : undefined,
    summary: hasText(summary) ? summary : undefined,
    sections,
    tags,
    assets
  };
}

/**
 * Diagrams stand in for photographs on projects that don't have any yet, so the
 * gallery column never renders empty.
 */
function assetsAsImages(assets: ProofAsset[]): ProjectImage[] {
  return assets.map((asset) => ({
    src: asset.src,
    alt: asset.alt,
    caption: asset.label,
    fit: "contain" as const
  }));
}

export function buildProjectViews(projects: Project[], proofs: ProofPoint[]): ProjectView[] {
  return projects.map((project) => {
    const proof = buildProofView(project, proofs);
    const images = project.images?.length
      ? project.images
      : assetsAsImages(project.additionalInfo?.assets ?? []);
    return { project, images, proof };
  });
}
