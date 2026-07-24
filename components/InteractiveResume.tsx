"use client";
//import the following modules
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Code,
  Download,
  ExternalLink,
  Mail,
  Maximize2,
  MousePointer2,
  X
} from "lucide-react";
import type { Project, ProjectAdditionalInfo, ProjectImage, ProofPoint, ResumeBullet, ResumeData } from "@/types/resume";

type InteractiveResumeProps = {
  data: ResumeData;
};

type ProjectLightboxState = {
  images: ProjectImage[];
  index: number;
  projectName: string;
};

export function InteractiveResume({ data }: InteractiveResumeProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [activeProofId, setActiveProofId] = useState<string | null>(null);
  const [selectedAdditionalInfoProjectId, setSelectedAdditionalInfoProjectId] = useState<string | null>(null);
  const [projectLightbox, setProjectLightbox] = useState<ProjectLightboxState | null>(null);

  const proofById = useMemo(() => {
    return new Map(data.proofs.map((proof) => [proof.id, proof]));
  }, [data.proofs]);

  const projectById = useMemo(() => {
    return new Map(data.projects.map((project) => [project.id, project]));
  }, [data.projects]);

  const selectedAdditionalInfo = selectedAdditionalInfoProjectId
    ? projectById.get(selectedAdditionalInfoProjectId)?.additionalInfo ?? null
    : null;

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

  const activeProof = activeProofId ? proofById.get(activeProofId) ?? null : null;

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

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = shellRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 1;
    const rotateY = (x - 0.5) * 2;

    element.style.setProperty("--pointer-x", `${x * 100}%`);
    element.style.setProperty("--pointer-y", `${y * 100}%`);
    element.style.setProperty("--rotate-x", `${rotateX}deg`);
    element.style.setProperty("--rotate-y", `${rotateY}deg`);
  }

  function openProofAdditionalInfo(proof?: ProofPoint) {
    if (!proof?.projectId) return;
    const project = projectById.get(proof.projectId);
    if (!project?.additionalInfo) return;
    setSelectedAdditionalInfoProjectId(project.id);
  }

  function openProjectAdditionalInfo(project?: Project) {
    if (!project?.additionalInfo) return;
    setSelectedAdditionalInfoProjectId(project.id);
  }

  function openProject(project?: Project) {
    if (!project?.id) return;
    const projectCard = document.getElementById(`project-${project.id}`);
    if (!projectCard) return;

    projectCard.scrollIntoView({ behavior: "smooth", block: "center" });
    projectCard.focus({ preventScroll: true });
  }

  function stepProjectLightbox(direction: -1 | 1) {
    setProjectLightbox((current) => {
      if (!current) return current;
      const nextIndex = (current.index + direction + current.images.length) % current.images.length;
      return { ...current, index: nextIndex };
    });
  }

  return (
    <main className="site-shell" onPointerMove={handlePointerMove} ref={shellRef}>
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <ResumeHeader data={data} />

        <section className="resume-paper">
          <div className="resume-column-main">
            <ResumeBlock eyebrow="Profile" title="Summary">
              <p className="summary-text">{data.summary}</p>
            </ResumeBlock>

            <ResumeBlock eyebrow="Experience" title="Professional Experience">
              <div className="stacked-list">
                {data.experience.map((job) => (
                  <article className="timeline-card interactive-card" key={`${job.company}-${job.start}`}>
                    <div className="timeline-card-header">
                      <div>
                        <h3>{job.role}</h3>
                        <p>{job.company}</p>
                      </div>
                      <span>{job.start} – {job.end}</span>
                    </div>
                    <div className="meta-line">{job.location}</div>
                    {job.context && <p className="context-note">{job.context}</p>}
                    <BulletList
                      bullets={job.bullets}
                      proofById={proofById}
                      projectById={projectById}
                      onProofEnter={setActiveProofId}
                      onProofLeave={() => setActiveProofId(null)}
                      onOpenProof={openProofAdditionalInfo}
                      onOpenProject={openProject}
                    />
                  </article>
                ))}
              </div>
            </ResumeBlock>

            <ResumeBlock eyebrow="Selected Work" title="Projects">
              <div className="project-grid">
                {orderedProjects.map((project) => {
                  return (
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
                      {project.bullets && (
                        <BulletList
                          bullets={project.bullets}
                          proofById={proofById}
                          projectById={projectById}
                          onProofEnter={setActiveProofId}
                          onProofLeave={() => setActiveProofId(null)}
                          onOpenProof={openProofAdditionalInfo}
                          onOpenProject={openProject}
                          compact
                        />
                      )}
                      {project.additionalInfo && (
                        <button className="text-button" onClick={() => openProjectAdditionalInfo(project)}>
                          Read more <ChevronRight size={14} />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </ResumeBlock>
          </div>

          <aside className="resume-column-side">
            <ResumeBlock eyebrow="Education" title="Degrees">
              <div className="education-list">
                {data.education.degrees.map((item) => (
                  <div className="education-card" key={`${item.school}-${item.degree}`}>
                    <h3>{item.school}</h3>
                    <p>{item.degree}</p>
                    <span>{item.graduation}</span>
                  </div>
                ))}
              </div>

              {data.education.certificates.length > 0 && (
                <div className="certificate-section">
                  <h3 className="education-subheading">Certificates</h3>
                  <div className="education-list">
                    {data.education.certificates.map((certificate) => (
                      <div
                        className="education-card certificate-card"
                        key={`${certificate.certificateName}-${certificate.issuer}`}
                      >
                        <h3>{certificate.certificateName}</h3>
                        <p>{certificate.issuer}</p>
                        <span>{certificate.date}</span>
                        {certificate.credentialUrl && (
                          <a
                            className="certificate-link"
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View credential <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ResumeBlock>

            <ResumeBlock eyebrow="Toolchain" title="Skills">
              <div className="skill-stack">
                {data.skills.map((group) => (
                  <div className="skill-group" key={group.category}>
                    <h3>{group.category}</h3>
                    <div className="skill-pills">
                      {group.items.map((item) => (
                        <span key={item}>{item}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ResumeBlock>

            <ProofPanel
              proof={activeProof}
              fallbackProofs={data.proofs.slice(0, 4)}
              onOpenProof={openProofAdditionalInfo}
            />
          </aside>
        </section>
      </section>

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
    </main>
  );
}

type HeaderProps = {
  data: ResumeData;
};

function ResumeHeader({ data }: HeaderProps) {
  return (
    <header className="hero-card interactive-card">
      <div>
        <div className="status-pill"><MousePointer2 size={14} /> Interactive resume experience</div>
        <h1>{data.person.name}</h1>
        <p>{data.person.title}</p>
        <div className="contact-row">
          <span>{data.person.location}</span>
          <a href={`mailto:${data.person.email}`}><Mail size={14} /> Email</a>
          <a href={data.person.linkedin}><BriefcaseBusiness size={14} /> LinkedIn</a>
          <a href={data.person.github}><Code size={14} /> GitHub</a>
        </div>
      </div>
      <div className="hero-actions">
        <a className="primary-action" href={data.resumePdfPath}>
          <Download size={16} /> Download PDF
        </a>
        <a className="secondary-action" href={data.person.website}>
          Live URL <ExternalLink size={16} />
        </a>
      </div>
    </header>
  );
}

type ResumeBlockProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

function ResumeBlock({ eyebrow, title, children }: ResumeBlockProps) {
  return (
    <section className="resume-block">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

type BulletListProps = {
  bullets: ResumeBullet[];
  proofById: Map<string, ProofPoint>;
  projectById: Map<string, Project>;
  onProofEnter: (id: string) => void;
  onProofLeave: () => void;
  onOpenProof: (proof?: ProofPoint) => void;
  onOpenProject: (project?: Project) => void;
  compact?: boolean;
};

function BulletList({
  bullets,
  proofById,
  projectById,
  onProofEnter,
  onProofLeave,
  onOpenProof,
  onOpenProject,
  compact
}: BulletListProps) {
  return (
    <ul className={compact ? "bullet-list compact" : "bullet-list"}>
      {bullets.map((bullet, index) => {
        const proof = bullet.proofId ? proofById.get(bullet.proofId) : undefined;
        const project = bullet.projectId ? projectById.get(bullet.projectId) : undefined;
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

type ProjectImageGalleryProps = {
  images: ProjectImage[];
  projectName: string;
  onOpen: (index: number) => void;
};

const PROJECT_IMAGE_ROTATION_MS = 10_000;

function ProjectImageGallery({ images, projectName, onOpen }: ProjectImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageIndex = activeIndex % images.length;
  const image = images[imageIndex];

  useEffect(() => {
    if (images.length < 2) return;

    const rotationTimer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, PROJECT_IMAGE_ROTATION_MS);

    return () => window.clearTimeout(rotationTimer);
  }, [activeIndex, images.length]);

  return (
    <div className="project-gallery project-gallery-carousel" aria-label={`${projectName} image gallery`}>
      <AnimatePresence initial={false} mode="wait">
        <motion.button
          className={`project-gallery-item ${image.fit === "contain" ? "project-gallery-item-contain" : ""}`}
          key={`${image.src}-${imageIndex}`}
          type="button"
          onClick={() => onOpen(imageIndex)}
          aria-label={`Open image ${imageIndex + 1} of ${images.length}: ${image.caption ?? image.alt}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <img src={image.src} alt={image.alt} loading="lazy" />
          <span className="project-gallery-caption">
            <span>{image.caption ?? `${projectName} image ${imageIndex + 1}`}</span>
          </span>
          <span className="project-gallery-expand" aria-hidden="true">
            <Maximize2 size={16} />
          </span>
        </motion.button>
      </AnimatePresence>

      {images.length > 1 && (
        <div
          className="project-gallery-progress"
          key={imageIndex}
          role="status"
          aria-live="polite"
          aria-label={`Image ${imageIndex + 1} of ${images.length}`}
        >
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="project-gallery-progress-track" cx="26" cy="26" r="22" pathLength="100" />
            <circle
              className="project-gallery-progress-indicator"
              cx="26"
              cy="26"
              r="22"
              pathLength="100"
              style={{ animationDuration: `${PROJECT_IMAGE_ROTATION_MS}ms` }}
            />
          </svg>
          <span aria-hidden="true">{imageIndex + 1}/{images.length}</span>
        </div>
      )}
    </div>
  );
}

type ProjectImageLightboxProps = {
  images: ProjectImage[];
  index: number;
  projectName: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

function ProjectImageLightbox({
  images,
  index,
  projectName,
  onClose,
  onPrevious,
  onNext,
  onSelect
}: ProjectImageLightboxProps) {
  const image = images[index];
  const hasMultipleImages = images.length > 1;

  return (
    <motion.div
      className="image-lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`${projectName} image viewer`}
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.18 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="image-lightbox-header">
          <div>
            <p className="eyebrow">Project Gallery</p>
            <h2>{projectName}</h2>
          </div>
          <div className="image-lightbox-actions">
            <span aria-live="polite">{index + 1} / {images.length}</span>
            <button type="button" onClick={onClose} aria-label="Close image viewer">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="image-lightbox-stage">
          {hasMultipleImages && (
            <button
              className="image-lightbox-nav image-lightbox-nav-previous"
              type="button"
              onClick={onPrevious}
              aria-label="View previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <figure>
            <img src={image.src} alt={image.alt} />
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>

          {hasMultipleImages && (
            <button
              className="image-lightbox-nav image-lightbox-nav-next"
              type="button"
              onClick={onNext}
              aria-label="View next image"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {hasMultipleImages && (
          <div className="image-lightbox-thumbnails" aria-label="Choose an image">
            {images.map((thumbnail, thumbnailIndex) => (
              <button
                className={thumbnailIndex === index ? "is-active" : ""}
                key={`${thumbnail.src}-${thumbnailIndex}`}
                type="button"
                onClick={() => onSelect(thumbnailIndex)}
                aria-label={`View image ${thumbnailIndex + 1}: ${thumbnail.caption ?? thumbnail.alt}`}
                aria-current={thumbnailIndex === index ? "true" : undefined}
              >
                <img src={thumbnail.src} alt="" />
              </button>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

type ProofPanelProps = {
  proof: ProofPoint | null;
  fallbackProofs: ProofPoint[];
  onOpenProof: (proof?: ProofPoint) => void;
};

function ProofPanel({ proof, fallbackProofs, onOpenProof }: ProofPanelProps) {
  const visibleProofs = proof ? [proof] : fallbackProofs;

  return (
    <div className="proof-panel interactive-card">
      <div className="proof-panel-header">
        <p className="eyebrow">Evidence Layer</p>
        <h2>{proof ? "Active Proof" : "Proof Index"}</h2>
      </div>
      <div className="proof-list">
        {visibleProofs.map((item) => (
          <button className="proof-card" key={item.id} onClick={() => onOpenProof(item)}>
            {item.assets[0] && <img src={item.assets[0].src} alt={item.assets[0].alt} />}
            <strong>{item.title}</strong>
            <span>{item.summary}</span>
            <div className="tag-row">
              {item.tags.slice(0, 3).map((tag) => <em key={tag}>{tag}</em>)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

type AdditionalInfoDrawerProps = {
  additionalInfo: ProjectAdditionalInfo;
  onClose: () => void;
};

function AdditionalInfoDrawer({ additionalInfo, onClose }: AdditionalInfoDrawerProps) {
  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="additional-info-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose} aria-label="Close additional information">
          <X size={20} />
        </button>

        <div className="drawer-hero">
          <p className="eyebrow">Additional Info</p>
          <h2>{additionalInfo.title}</h2>
          <p>{additionalInfo.subtitle}</p>
        </div>

        <div className="asset-strip">
          {additionalInfo.assets.map((asset) => (
            <figure key={asset.src}>
              <img src={asset.src} alt={asset.alt} />
              <figcaption>{asset.label}</figcaption>
            </figure>
          ))}
        </div>

        <AdditionalInfoSection title="Problem">
          <p>{additionalInfo.problem}</p>
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Constraints">
          <Checklist items={additionalInfo.constraints} />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Approach">
          <Checklist items={additionalInfo.approach} ordered />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Impact">
          <Checklist items={additionalInfo.impact} />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Tools">
          <div className="skill-pills drawer-pills">
            {additionalInfo.tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </AdditionalInfoSection>
      </motion.aside>
    </motion.div>
  );
}

function AdditionalInfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="additional-info-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Checklist({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className="drawer-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ListTag>
  );
}
