"use client";

import type { Project, ProofPoint, ResumeBullet } from "@/types/resume";

export type BulletListProps = {
  bullets: ResumeBullet[];
  proofById: Map<string, ProofPoint>;
  projectById: Map<string, Project>;
  onProofEnter: (id: string) => void;
  onProofLeave: () => void;
  onOpenProof: (proof?: ProofPoint) => void;
  onOpenProject: (project?: Project) => void;
  showProofButtons?: boolean;
  showProjectButtons?: boolean;
  compact?: boolean;
};

export function BulletList({
  bullets,
  proofById,
  projectById,
  onProofEnter,
  onProofLeave,
  onOpenProof,
  onOpenProject,
  showProofButtons = true,
  showProjectButtons = true,
  compact
}: BulletListProps) {
  return (
    <ul className={compact ? "bullet-list compact" : "bullet-list"}>
      {bullets.map((bullet, index) => {
        const proof = showProofButtons && bullet.proofId ? proofById.get(bullet.proofId) : undefined;
        const project = showProjectButtons && bullet.projectId ? projectById.get(bullet.projectId) : undefined;
        return (
          <li key={`${bullet.text}-${bullet.proofId ?? bullet.projectId ?? index}`}>
            <span>{bullet.text}</span>
            {proof && (
              <button
                className="proof-chip"
                onMouseEnter={() => onProofEnter(proof.id)}
                onMouseLeave={onProofLeave}
                onFocus={() => onProofEnter(proof.id)}
                onBlur={onProofLeave}
                onClick={() => onOpenProof(proof)}
              >
                proof
              </button>
            )}
            {!proof && project && (
              <button
                className="project-chip"
                onClick={() => onOpenProject(project)}
              >
                project
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
