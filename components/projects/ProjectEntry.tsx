"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ProjectView } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectDateBox } from "@/components/projects/ProjectDateBox";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { EmphasizedText } from "@/components/content/EmphasizedText";

type ProjectEntryProps = {
  view: ProjectView;
  index: number;
  total: number;
};

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** How far the media column drifts against the text column as the entry scrolls past — a classic parallax read of depth, with no pinning involved. */
const PARALLAX_RANGE = 56;

function ProjectBullet({ text, emphasis }: { text: string; emphasis?: string[] }) {
  return (
    <span className="pj-bullet-content">
      <EmphasizedText text={text} phrases={emphasis} className="pj-bullet-emphasis" />
    </span>
  );
}

const bulletListVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } }
};
const bulletItemVariants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
};

/**
 * One project, full height, no pinning. Summary and bullets sit beside a photo
 * grid; the deeper case study (problem, approach, impact) is tucked behind a
 * toggle instead of a scroll-scrubbed slide-in panel. Nothing here is clamped
 * to a fixed height, so nothing ever needs its own scrollbar.
 */
export function ProjectEntry({ view, index, total }: ProjectEntryProps) {
  const { project, images, proof } = view;
  // The date box rides the opening rule by default; bottom corners get a closing rule of their own.
  const datePosition = project.dates?.position ?? "top-right";
  const dateBox = project.dates?.start ? <ProjectDateBox dates={project.dates} position={datePosition} /> : null;
  const dateOnTop = dateBox && datePosition.startsWith("top");
  const dateOnBottom = dateBox && datePosition.startsWith("bottom");
  const dateInline = dateBox && datePosition === "inline";
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();

  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: mediaProgress } = useScroll({
    target: mediaRef,
    offset: ["start end", "end start"]
  });
  const mediaProgressSmooth = useSpring(mediaProgress, { stiffness: 220, damping: 36, mass: 0.4 });
  const mediaY = useTransform(mediaProgressSmooth, [0, 1], [PARALLAX_RANGE, -PARALLAX_RANGE]);

  const caseStudy = proof && <CaseStudy proof={proof} />;

  return (
    <section
      id={`project-${project.id}`}
      className={`pj-entry${index % 2 === 1 ? " pj-entry--reverse" : ""}${images.length === 0 ? " pj-entry--text-only" : ""}`}
      aria-label={project.name}
    >
      <div className="bp-shell">
        <div className="pj-entry-rule">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          {dateOnTop && <Reveal delay={0.3}>{dateBox}</Reveal>}
        </div>

        <div className="pj-entry-grid">
          <div className="pj-entry-text">
            <Reveal>
              <p className="pj-index">
                {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(total).padStart(2, "0")}
              </p>
            </Reveal>
            <Reveal delay={0.08}><h2 className="pj-title">{project.name}</h2></Reveal>
            {project.type && (
              <Reveal delay={0.14}><p className="pj-subtitle">{project.type}</p></Reveal>
            )}
            <Reveal as="rule" delay={0.2}><div className="pj-head-rule" /></Reveal>
            {dateInline && <Reveal delay={0.24}>{dateBox}</Reveal>}

            <div className="pj-body">
              {project.summary && (
                <Reveal delay={0.26}><p className="pj-summary">{project.summary}</p></Reveal>
              )}
              {project.status && (
                <Reveal delay={0.3}><p className="pj-status">{project.status}</p></Reveal>
              )}

              {project.bullets.length > 0 && (
                reduced ? (
                  <ul className="pj-bullets">
                    {project.bullets.map((bullet) => (
                      <li key={bullet.text}><ProjectBullet {...bullet} /></li>
                    ))}
                  </ul>
                ) : (
                  <motion.ul
                    className="pj-bullets"
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true, amount: 0.3, margin: "0px 0px -80px 0px" }}
                    variants={bulletListVariants}
                  >
                    {project.bullets.map((bullet) => (
                      <motion.li key={bullet.text} variants={bulletItemVariants}>
                        <ProjectBullet {...bullet} />
                      </motion.li>
                    ))}
                  </motion.ul>
                )
              )}
            </div>

            {proof && (
              <Reveal delay={0.32}>
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
            <div className="pj-entry-media" ref={mediaRef}>
              <Reveal delay={0.14}>
                {reduced ? (
                  <ProjectGallery images={images} projectName={project.name} />
                ) : (
                  <motion.div style={{ y: mediaY }}>
                    <ProjectGallery images={images} projectName={project.name} />
                  </motion.div>
                )}
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

        {dateOnBottom && (
          <div className="pj-entry-rule pj-entry-rule--close">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <Reveal delay={0.2}>{dateBox}</Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
