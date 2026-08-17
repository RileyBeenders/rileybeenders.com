"use client";
//import the following modules
import { useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  BriefcaseBusiness,
  Code,
  Download,
  ExternalLink,
  LoaderCircle,
  Mail,
  MousePointer2
} from "lucide-react";
import { BulletList } from "@/components/BulletList";
import { AdditionalInfoDrawer } from "@/components/ProjectDetails";
import type { Project, ProofPoint, ResumeData } from "@/types/resume";

type InteractiveResumeProps = {
  data: ResumeData;
};

export function InteractiveResume({ data }: InteractiveResumeProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [activeProofId, setActiveProofId] = useState<string | null>(null);
  const [selectedAdditionalInfoProjectId, setSelectedAdditionalInfoProjectId] = useState<string | null>(null);

  const proofById = useMemo(() => {
    return new Map(data.proofs.map((proof) => [proof.id, proof]));
  }, [data.proofs]);

  const projectById = useMemo(() => {
    return new Map(data.projects.map((project) => [project.id, project]));
  }, [data.projects]);

  const selectedAdditionalInfo = selectedAdditionalInfoProjectId
    ? projectById.get(selectedAdditionalInfoProjectId)?.additionalInfo ?? null
    : null;

  const activeProof = activeProofId ? proofById.get(activeProofId) ?? null : null;
  const portfolioLayersEnabled = data.visibility.projectsSection
    || data.visibility.proofIndex
    || data.visibility.experienceProjectButtons
    || data.visibility.experienceProofButtons;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = shellRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 0.4;
    const rotateY = (x - 0.5) * 0.8;

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

  return (
    <main className="site-shell" onPointerMove={handlePointerMove} ref={shellRef}>
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <ResumeHeader data={data} />

        <section className="resume-paper">
          <div className="resume-column-main">
            <ResumeBlock eyebrow="Profile" title="Summary" id="section-summary">
              <p className="summary-text">{data.summary}</p>
            </ResumeBlock>

            <ResumeBlock eyebrow="Experience" title="Professional Experience" id="section-experience">
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
                      showProofButtons={data.visibility.experienceProofButtons}
                      showProjectButtons={data.visibility.experienceProjectButtons}
                    />
                  </article>
                ))}
              </div>
            </ResumeBlock>
          </div>

          <aside className="resume-column-side">
            <ResumeBlock eyebrow="Education" title="Degrees" id="section-education">
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
                            suppressHydrationWarning
                          >
                            {certificate.credentialLabel || "Show credential"}
                            <ExternalLink aria-hidden="true" size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ResumeBlock>

            <ResumeBlock eyebrow="Toolchain" title="Skills" id="section-skills">
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

            {data.visibility.proofIndex && (
              <ProofPanel
                proof={activeProof}
                fallbackProofs={data.proofs.slice(0, 4)}
                onOpenProof={openProofAdditionalInfo}
              />
            )}
          </aside>
        </section>
      </section>

      <AnimatePresence>
        {portfolioLayersEnabled && selectedAdditionalInfo && (
          <AdditionalInfoDrawer
            additionalInfo={selectedAdditionalInfo}
            onClose={() => setSelectedAdditionalInfoProjectId(null)}
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
  const [pdfDownloadState, setPdfDownloadState] = useState<"idle" | "loading" | "error">("idle");
  const isPdfDownloading = pdfDownloadState === "loading";

  async function handlePdfDownload() {
    if (isPdfDownloading) return;

    setPdfDownloadState("loading");

    try {
      const { downloadPublishedResumePdf } = await import("@/ResumeBuilder/downloadPublishedResume");
      await downloadPublishedResumePdf(data.resumePdfPath);
      setPdfDownloadState("idle");
    } catch (error) {
      console.error("Unable to download the published resume PDF.", error);
      setPdfDownloadState("error");
    }
  }

  return (
    <header className="hero-card interactive-card" id="section-header">
      <div>
        <div className="status-pill"><MousePointer2 size={14} /> Interactive resume experience</div>
        <h1>{data.person.name}</h1>
        <p>{data.person.title}</p>
        <div className="contact-row">
          <span>{data.person.location}</span>
          <a href={`mailto:${data.person.email}`} suppressHydrationWarning><Mail size={14} /> Email</a>
          <a href={data.person.linkedin} suppressHydrationWarning><BriefcaseBusiness size={14} /> LinkedIn</a>
          <a href={data.person.github} suppressHydrationWarning><Code size={14} /> GitHub</a>
        </div>
      </div>
      <div className="hero-actions">
        <button
          aria-busy={isPdfDownloading}
          className="primary-action"
          disabled={isPdfDownloading}
          onClick={handlePdfDownload}
          type="button"
        >
          {isPdfDownloading
            ? <LoaderCircle aria-hidden="true" className="pdf-loading-icon" size={16} />
            : <Download aria-hidden="true" size={16} />}
          {isPdfDownloading ? "Preparing PDF..." : "Download PDF"}
        </button>
        {pdfDownloadState === "error" && (
          <span className="pdf-download-error" role="alert">
            The PDF could not be created. Please try again.
          </span>
        )}
      </div>
    </header>
  );
}

type ResumeBlockProps = {
  eyebrow: string;
  title: string;
  id?: string;
  children: React.ReactNode;
};

function ResumeBlock({ eyebrow, title, id, children }: ResumeBlockProps) {
  return (
    <section className="resume-block" id={id}>
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
