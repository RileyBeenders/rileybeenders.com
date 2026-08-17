"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { BulletList } from "@/components/BulletList";
import { AdditionalInfoDrawer, ProjectImageGallery, ProjectImageLightbox } from "@/components/ProjectDetails";
import type { Project, ProjectImage, ProofPoint, ResumeData } from "@/types/resume";

type ProjectsExplorerProps = {
  data: ResumeData;
};

type ProjectLightboxState = {
  images: ProjectImage[];
  index: number;
  projectName: string;
};

export function ProjectsExplorer({ data }: ProjectsExplorerProps) {
  const [selectedAdditionalInfoProjectId, setSelectedAdditionalInfoProjectId] = useState<string | null>(null);
  const [projectLightbox, setProjectLightbox] = useState<ProjectLightboxState | null>(null);

  const proofById = useMemo(() => {
    return new Map(data.proofs.map((proof) => [proof.id, proof]));
  }, [data.proofs]);

  const projectById = useMemo(() => {
    return new Map(data.projects.map((project) => [project.id, project]));
  }, [data.projects]);

  const orderedProjects = useMemo(() => {
    return data.projects
      .map((project, originalIndex) => ({ project, originalIndex }))
      .sort((a, b) => {
        const orderDifference = (a.project.order ?? Number.MAX_SAFE_INTEGER)
          - (b.project.order ?? Number.MAX_SAFE_INTEGER);

        return orderDifference || a.originalIndex - b.originalIndex;
      })
      .map(({ project }) => project);
  }, [data.projects]);

  const selectedAdditionalInfo = selectedAdditionalInfoProjectId
    ? projectById.get(selectedAdditionalInfoProjectId)?.additionalInfo ?? null
    : null;

  useEffect(() => {
    if (!projectLightbox) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProjectLightbox(null);
        return;
      }

      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const direction = event.key === "ArrowLeft" ? -1 : 1;
      setProjectLightbox((current) => {
        if (!current) return current;
        const nextIndex = (current.index + direction + current.images.length) % current.images.length;
        return { ...current, index: nextIndex };
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [projectLightbox]);

  function openProjectAdditionalInfo(project?: Project) {
    if (!project?.additionalInfo) return;
    setSelectedAdditionalInfoProjectId(project.id);
  }

  function openProofAdditionalInfo(proof?: ProofPoint) {
    if (!proof?.projectId) return;
    const project = projectById.get(proof.projectId);
    if (!project?.additionalInfo) return;
    setSelectedAdditionalInfoProjectId(project.id);
  }

  function stepProjectLightbox(direction: -1 | 1) {
    setProjectLightbox((current) => {
      if (!current) return current;
      const nextIndex = (current.index + direction + current.images.length) % current.images.length;
      return { ...current, index: nextIndex };
    });
  }

  return (
    <>
      <div className="project-grid">
        {orderedProjects.map((project) => (
          <article
            className="project-card interactive-card"
            id={`project-${project.id}`}
            key={project.id}
            tabIndex={-1}
          >
            <div className="project-type">
              {project.order !== undefined && (
                <span className="project-order">{String(project.order).padStart(2, "0")}</span>
              )}
              <span>{project.type}</span>
            </div>
            <h3>{project.name}</h3>
            <p>{project.summary}</p>
            {project.images && project.images.length > 0 && (
              <ProjectImageGallery
                images={project.images}
                projectName={project.name}
                onOpen={(index) => {
                  setProjectLightbox({
                    images: project.images ?? [],
                    index,
                    projectName: project.name
                  });
                }}
              />
            )}
            {project.bullets && project.bullets.length > 0 && (
              <BulletList
                bullets={project.bullets}
                proofById={proofById}
                projectById={projectById}
                onProofEnter={() => {}}
                onProofLeave={() => {}}
                onOpenProof={openProofAdditionalInfo}
                onOpenProject={openProjectAdditionalInfo}
                compact
              />
            )}
            {project.additionalInfo && (
              <button className="text-button" onClick={() => openProjectAdditionalInfo(project)}>
                Read more <ChevronRight size={14} />
              </button>
            )}
          </article>
        ))}
      </div>

      <AnimatePresence>
        {selectedAdditionalInfo && (
          <AdditionalInfoDrawer
            additionalInfo={selectedAdditionalInfo}
            onClose={() => setSelectedAdditionalInfoProjectId(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {projectLightbox && (
          <ProjectImageLightbox
            images={projectLightbox.images}
            index={projectLightbox.index}
            projectName={projectLightbox.projectName}
            onClose={() => setProjectLightbox(null)}
            onPrevious={() => stepProjectLightbox(-1)}
            onNext={() => stepProjectLightbox(1)}
            onSelect={(index) => {
              setProjectLightbox((current) => current ? { ...current, index } : current);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
