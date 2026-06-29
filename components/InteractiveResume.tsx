"use client";
//import the following modules
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ExternalLink, Github, Linkedin, Mail, MousePointer2, X } from "lucide-react";
import type { CaseStudy, ProofPoint, ResumeBullet, ResumeData } from "@/types/resume";

type InteractiveResumeProps = {
  data: ResumeData;
};

export function InteractiveResume({ data }: InteractiveResumeProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [proofMode, setProofMode] = useState(true);
  const [activeProofId, setActiveProofId] = useState<string | null>(null);
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string | null>(null);

  const proofById = useMemo(() => {
    return new Map(data.proofs.map((proof) => [proof.id, proof]));
  }, [data.proofs]);

  const selectedCaseStudy = useMemo(() => {
    return data.caseStudies.find((caseStudy) => caseStudy.id === selectedCaseStudyId) ?? null;
  }, [data.caseStudies, selectedCaseStudyId]);

  const activeProof = activeProofId ? proofById.get(activeProofId) ?? null : null;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const element = shellRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * 5;
    const rotateY = (x - 0.5) * 7;

    element.style.setProperty("--pointer-x", `${x * 100}%`);
    element.style.setProperty("--pointer-y", `${y * 100}%`);
    element.style.setProperty("--rotate-x", `${rotateX}deg`);
    element.style.setProperty("--rotate-y", `${rotateY}deg`);
  }

  function openProofCaseStudy(proof?: ProofPoint) {
    if (!proof?.caseStudyId) return;
    setSelectedCaseStudyId(proof.caseStudyId);
  }

  return (
    <main className="site-shell" onPointerMove={handlePointerMove} ref={shellRef}>
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <ResumeHeader data={data} proofMode={proofMode} setProofMode={setProofMode} />

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
                      proofMode={proofMode}
                      onProofEnter={setActiveProofId}
                      onProofLeave={() => setActiveProofId(null)}
                      onOpenProof={openProofCaseStudy}
                    />
                  </article>
                ))}
              </div>
            </ResumeBlock>

            <ResumeBlock eyebrow="Selected Work" title="Projects">
              <div className="project-grid">
                {data.projects.map((project) => {
                  const proof = project.proofId ? proofById.get(project.proofId) : undefined;
                  return (
                    <article className="project-card interactive-card" key={project.name}>
                      <div className="project-type">{project.type}</div>
                      <h3>{project.name}</h3>
                      <p>{project.summary}</p>
                      {project.bullets && (
                        <BulletList
                          bullets={project.bullets}
                          proofById={proofById}
                          proofMode={proofMode}
                          onProofEnter={setActiveProofId}
                          onProofLeave={() => setActiveProofId(null)}
                          onOpenProof={openProofCaseStudy}
                          compact
                        />
                      )}
                      {proof?.caseStudyId && (
                        <button className="text-button" onClick={() => openProofCaseStudy(proof)}>
                          Open case study <ExternalLink size={14} />
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            </ResumeBlock>
          </div>

          <aside className="resume-column-side">
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

            <ResumeBlock eyebrow="Education" title="Education">
              {data.education.map((item) => (
                <div className="education-card" key={item.school}>
                  <h3>{item.school}</h3>
                  <p>{item.degree}</p>
                  <span>{item.graduation}</span>
                </div>
              ))}
            </ResumeBlock>

            <ProofPanel
              proof={activeProof}
              fallbackProofs={data.proofs.slice(0, 4)}
              onOpenProof={openProofCaseStudy}
            />
          </aside>
        </section>
      </section>

      <AnimatePresence>
        {selectedCaseStudy && (
          <CaseStudyDrawer
            caseStudy={selectedCaseStudy}
            onClose={() => setSelectedCaseStudyId(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

type HeaderProps = {
  data: ResumeData;
  proofMode: boolean;
  setProofMode: (value: boolean) => void;
};

function ResumeHeader({ data, proofMode, setProofMode }: HeaderProps) {
  return (
    <header className="hero-card interactive-card">
      <div>
        <div className="status-pill"><MousePointer2 size={14} /> Interactive resume experience</div>
        <h1>{data.person.name}</h1>
        <p>{data.person.title}</p>
        <div className="contact-row">
          <span>{data.person.location}</span>
          <a href={`mailto:${data.person.email}`}><Mail size={14} /> Email</a>
          <a href={data.person.linkedin}><Linkedin size={14} /> LinkedIn</a>
          <a href={data.person.github}><Github size={14} /> GitHub</a>
        </div>
      </div>
      <div className="hero-actions">
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={proofMode}
            onChange={(event) => setProofMode(event.target.checked)}
          />
          <span>{data.proofModeLabel}</span>
        </label>
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
  proofMode: boolean;
  onProofEnter: (id: string) => void;
  onProofLeave: () => void;
  onOpenProof: (proof?: ProofPoint) => void;
  compact?: boolean;
};

function BulletList({ bullets, proofById, proofMode, onProofEnter, onProofLeave, onOpenProof, compact }: BulletListProps) {
  return (
    <ul className={compact ? "bullet-list compact" : "bullet-list"}>
      {bullets.map((bullet) => {
        const proof = bullet.proofId ? proofById.get(bullet.proofId) : undefined;
        return (
          <li key={bullet.text}>
            <span>{bullet.text}</span>
            {proofMode && proof && (
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
          </li>
        );
      })}
    </ul>
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

type CaseStudyDrawerProps = {
  caseStudy: CaseStudy;
  onClose: () => void;
};

function CaseStudyDrawer({ caseStudy, onClose }: CaseStudyDrawerProps) {
  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="case-study-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose} aria-label="Close case study">
          <X size={20} />
        </button>

        <div className="drawer-hero">
          <p className="eyebrow">Case Study</p>
          <h2>{caseStudy.title}</h2>
          <p>{caseStudy.subtitle}</p>
        </div>

        <div className="asset-strip">
          {caseStudy.assets.map((asset) => (
            <figure key={asset.src}>
              <img src={asset.src} alt={asset.alt} />
              <figcaption>{asset.label}</figcaption>
            </figure>
          ))}
        </div>

        <CaseStudySection title="Problem">
          <p>{caseStudy.problem}</p>
        </CaseStudySection>

        <CaseStudySection title="Constraints">
          <Checklist items={caseStudy.constraints} />
        </CaseStudySection>

        <CaseStudySection title="Approach">
          <Checklist items={caseStudy.approach} ordered />
        </CaseStudySection>

        <CaseStudySection title="Impact">
          <Checklist items={caseStudy.impact} />
        </CaseStudySection>

        <CaseStudySection title="Tools">
          <div className="skill-pills drawer-pills">
            {caseStudy.tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </CaseStudySection>
      </motion.aside>
    </motion.div>
  );
}

function CaseStudySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="case-section">
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
