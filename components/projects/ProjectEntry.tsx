"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ProjectView } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { ProjectGallery } from "@/components/projects/ProjectGallery";

type ProjectEntryProps = {
  view: ProjectView;
  index: number;
  total: number;
};

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/**
 * One project, full height, no pinning. Summary and bullets sit beside a photo
 * grid; the deeper case study (problem, approach, impact) is tucked behind a
 * toggle instead of a scroll-scrubbed slide-in panel. Nothing here is clamped
 * to a fixed height, so nothing ever needs its own scrollbar.
 */
export function ProjectEntry({ view, index, total }: ProjectEntryProps) {
  const { project, images, proof } = view;
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();

  const caseStudy: ReactNode = proof && (
    <div className="pj-case-study">
      <p className="pj-eyebrow">Case study</p>
      <h3 className="pj-proof-title">{proof.title}</h3>
      {proof.subtitle && <p className="pj-proof-subtitle">{proof.subtitle}</p>}
      {proof.summary && <p className="pj-proof-summary">{proof.summary}</p>}

      {proof.sections.map((section) => (
        <section className="pj-proof-section" key={section.label}>
          <h4>{section.label}</h4>
          {section.body && <p>{section.body}</p>}
          {section.items && (
            <ul>
              {section.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}

      {proof.tags.length > 0 && (
        <div className="pj-proof-tags">
          {proof.tags.map((tag) => <span className="pj-tag" key={tag}>{tag}</span>)}
        </div>
      )}

      {proof.assets.length > 0 && (
        <div className="pj-proof-assets">
          {proof.assets.map((asset) => (
            <figure key={asset.src}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.src} alt={asset.alt} loading="lazy" />
              <figcaption>{asset.label}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <section
      id={`project-${project.id}`}
      className={`pj-entry${index % 2 === 1 ? " pj-entry--reverse" : ""}${images.length === 0 ? " pj-entry--text-only" : ""}`}
      aria-label={project.name}
    >
      <div className="bp-shell">
        <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>

        <div className="pj-entry-grid">
          <div className="pj-entry-text">
            <Reveal>
              <p className="pj-index">
                {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(total).padStart(2, "0")}
              </p>
            </Reveal>
            <Reveal delay={0.05}><h2 className="pj-title">{project.name}</h2></Reveal>
            {project.type && (
              <Reveal delay={0.08}><p className="pj-subtitle">{project.type}</p></Reveal>
            )}
            <Reveal as="rule" delay={0.12}><div className="pj-head-rule" /></Reveal>

            <Reveal delay={0.16}>
              <div className="pj-body">
                {project.summary && <p className="pj-summary">{project.summary}</p>}
                {project.bullets.length > 0 && (
                  <ul className="pj-bullets">
                    {project.bullets.map((bullet) => (
                      <li key={bullet.text}>{bullet.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            {proof && (
              <Reveal delay={0.2}>
                <button
                  type="button"
                  className="pj-toggle"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setExpanded((value) => !value)}
                >
                  <span>{expanded ? "Hide the case study" : "View the full case study"}</span>
                  <ChevronDown
                    className={`pj-toggle-icon${expanded ? " is-open" : ""}`}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              </Reveal>
            )}
          </div>

          {images.length > 0 && (
            <div className="pj-entry-media">
              <Reveal delay={0.1}>
                <ProjectGallery images={images} projectName={project.name} />
              </Reveal>
            </div>
          )}
        </div>

        {proof && (
          reduced ? (
            expanded && <div id={panelId} className="pj-case-study-wrap">{caseStudy}</div>
          ) : (
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panelId}
                  key="case-study"
                  className="pj-case-study-wrap"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  {caseStudy}
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}
      </div>
    </section>
  );
}
