"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BriefcaseBusiness, Code, Download, ExternalLink, Mail, MousePointer2, X } from "lucide-react";
import type { CaseStudy, ComingSoonContent, ProofPoint, ResumeBullet, ResumeData } from "@/types/resume";

type InteractiveResumeProps = {
  data: ResumeData;
};

export function InteractiveResume({ data }: InteractiveResumeProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [proofMode, setProofMode] = useState(true);
  const [activeProofId, setActiveProofId] = useState<string | null>(null);
  const [selectedCaseStudyId, setSelectedCaseStudyId] = useState<string | null>(null);
  const isComingSoon = data.siteMode === "coming-soon" && Boolean(data.comingSoon);

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
    const rotateX = (0.5 - y) * 1;
    const rotateY = (x - 0.5) * 2;

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
      {isComingSoon && data.comingSoon ? (
        <ComingSoonExperience data={data} content={data.comingSoon} />
      ) : (
        <>
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
                          <span>{job.start} - {job.end}</span>
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
        </>
      )}
    </main>
  );
}

function ComingSoonExperience({ data, content }: { data: ResumeData; content: ComingSoonContent }) {
  const [activeTeaserIndex, setActiveTeaserIndex] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([
    "Client ready. Waiting for input.",
    "Backend status: no server action for this page."
  ]);

  const teaserCount = content.teasers.length;
  const activeTeaser = teaserCount > 0 ? content.teasers[activeTeaserIndex % teaserCount] : null;
  const signalStrength = Math.max(0, Math.min(100, content.launchSignal.charge));

  function selectTeaser(index: number) {
    if (teaserCount === 0) return;
    setActiveTeaserIndex(index % teaserCount);
    pushEvent(`Status tile selected. Active preview -> ${index % teaserCount + 1}.`);
  }

  function getStatusTone(value: string) {
    const normalized = value.toLowerCase();

    if (normalized.includes("live")) return "live";
    if (normalized.includes("polish")) return "polishing";
    if (normalized.includes("queue")) return "queued";
    return "building";
  }

  function pushEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const entry = `${timestamp} - ${message}`;

    setEventLog((current) => [entry, ...current].slice(0, 8));

    if (typeof window !== "undefined") {
      console.log(`[RileyBeenders.com debug] ${message}`);
    }
  }

  return (
    <section className="resume-stage coming-stage">
      <header className="hero-card coming-hero interactive-card">
        <div className="coming-hero-copy">
          <div className="status-pill">
            <MousePointer2 size={14} /> {content.badge}
          </div>
          <h1>{content.headline}</h1>
          <div className="coming-headline-row">
            <svg className="coming-headline-arrow" viewBox="0 0 46 42" fill="none" aria-hidden="true">
              <path d="M7 5V24C7 28.4 10.6 32 15 32H36L27 23M36 32L27 41" />
            </svg>
            <p className="coming-headline">{content.subheadline}</p>
          </div>
          <p className="coming-summary">{content.summary}</p>
          <div className="contact-row">
            <span>{data.person.location}</span>
            <a href={`mailto:${data.person.email}`}><Mail size={14} /> Email</a>
            <a href={data.person.linkedin}><BriefcaseBusiness size={14} /> LinkedIn</a>
            <a href={data.person.github}><Code size={14} /> GitHub</a>
          </div>
          {(content.primaryAction || content.secondaryAction) && (
            <div className="hero-actions coming-actions">
              {content.primaryAction && (
                <a className="primary-action" href={content.primaryAction.href}>
                  {content.primaryAction.label}
                </a>
              )}
              {content.secondaryAction && (
                <a className="secondary-action" href={content.secondaryAction.href}>
                  {content.secondaryAction.label} <ExternalLink size={16} />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="signal-card interactive-card">
          <div className="signal-card-top">
            <div>
              <p className="eyebrow">Launch Signal</p>
              <h2>{signalStrength}% charged</h2>
              <p className="signal-preview-index">Status: {signalStrength}% charged</p>
            </div>
          </div>

          <div className="signal-meter" aria-hidden="true">
            <span style={{ width: `${signalStrength}%` }} />
          </div>

          <div className="signal-task-block">
            <p className="signal-task-label">Currently in development</p>
            <p className="signal-task-copy">{content.launchSignal.currentTask}</p>
          </div>

          <p className="signal-target-date">{content.launchSignal.targetLaunchDate}</p>
        </div>
      </header>

      <section className="coming-grid">
        <section className="coming-main-column interactive-card">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Status Board + Preview Feed</p>
              <h2>{activeTeaser?.title ?? content.headline}</h2>
            </div>
            <span className="panel-kicker">{activeTeaser?.eyebrow ?? "Unified preview board"}</span>
          </div>

          <div className="kanban-board">
            {content.statusBoard.map((item, index) => (
              <button
                className={`kanban-card tone-${getStatusTone(item.value)}${teaserCount > 0 && activeTeaserIndex === index % teaserCount ? " active" : ""}`}
                key={item.label}
                onClick={() => selectTeaser(index)}
                type="button"
              >
                <span className="kanban-label">{item.label}</span>
                <strong>{item.value}</strong>
                <em>{item.note}</em>
              </button>
            ))}
          </div>

          <div className="preview-row">
            <AnimatePresence mode="wait">
              <motion.article
                className="teaser-card teaser-card-featured"
                key={activeTeaser?.title ?? content.headline}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2 }}
              >
                <p className="project-type">{activeTeaser?.eyebrow ?? "Preview"}</p>
                <h3>{activeTeaser?.title ?? content.headline}</h3>
                <p>{activeTeaser?.summary ?? content.summary}</p>
              </motion.article>
            </AnimatePresence>
          </div>
        </section>
      </section>

      <div className={logOpen ? "log-dock open" : "log-dock"}>
        <button
          className="log-dock-toggle"
          onClick={() => setLogOpen((current) => !current)}
          type="button"
        >
          <span>Live Log</span>
          <strong>{logOpen ? "Hide" : "Show"}</strong>
        </button>

        {logOpen && (
          <section className="debug-panel log-drawer interactive-card">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Live Log</p>
                <h2>What the page is doing</h2>
              </div>
              <span className="panel-kicker">Client-side events only</span>
            </div>

            <div className="debug-meta">
              <span>Charge: {signalStrength}%</span>
              <span>Preview: {teaserCount === 0 ? 0 : activeTeaserIndex + 1}</span>
              <span>Clicks: {eventLog.length}</span>
            </div>

            <div className="debug-log" aria-live="polite">
              {eventLog.map((entry) => (
                <p key={entry}>{entry}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
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
          <a href={data.person.linkedin}><BriefcaseBusiness size={14} /> LinkedIn</a>
          <a href={data.person.github}><Code size={14} /> GitHub</a>
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
