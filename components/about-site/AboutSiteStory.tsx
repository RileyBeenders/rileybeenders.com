"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { AboutSiteData } from "@/types/about-site";
import type { ProofView } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { ProjectGallery } from "@/components/projects/ProjectGallery";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** Same drift as a project entry's media column. */
const PARALLAX_RANGE = 56;

const bulletListVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } }
};
const bulletItemVariants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
};

type AboutSiteStoryProps = {
  data: AboutSiteData;
  proof: ProofView | null;
};

/**
 * The site described the way a project is: summary and bullets beside a
 * gallery of the site itself, with the case study tucked behind a toggle.
 * Shares the projects page's layout classes so the two read as one system.
 */
export function AboutSiteStory({ data, proof }: AboutSiteStoryProps) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();

  const mediaRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mediaRef, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 36, mass: 0.4 });
  const mediaY = useTransform(smooth, [0, 1], [PARALLAX_RANGE, -PARALLAX_RANGE]);

  const hasImages = data.images.length > 0;

  return (
    <section className="bp-section as-story" aria-label="The site as a project">
      <div className="bp-shell">
        <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>

        <div className={`pj-entry-grid${hasImages ? "" : " as-story-grid--text-only"}`}>
          <div className="pj-entry-text">
            <Reveal><h2 className="bp-section-index">01&nbsp;&nbsp;The site</h2></Reveal>

            <div className="pj-body">
              <Reveal delay={0.06}><p className="pj-summary">{data.summary}</p></Reveal>

              {data.bullets.length > 0 && (
                reduced ? (
                  <ul className="pj-bullets">
                    {data.bullets.map((bullet) => (
                      <li key={bullet.text}>
                        <span className="pj-bullet-content">
                          <EmphasizedText text={bullet.text} phrases={bullet.emphasis} className="pj-bullet-emphasis" />
                        </span>
                      </li>
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
                    {data.bullets.map((bullet) => (
                      <motion.li key={bullet.text} variants={bulletItemVariants}>
                        <span className="pj-bullet-content">
                          <EmphasizedText text={bullet.text} phrases={bullet.emphasis} className="pj-bullet-emphasis" />
                        </span>
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
                  <ChevronDown className={`pj-toggle-icon${expanded ? " is-open" : ""}`} size={16} strokeWidth={1.8} aria-hidden="true" />
                </button>
              </Reveal>
            )}
          </div>

          {hasImages && (
            <div className="pj-entry-media" ref={mediaRef}>
              <Reveal delay={0.14}>
                {reduced ? (
                  <ProjectGallery images={data.images} projectName={data.hero.title} />
                ) : (
                  <motion.div style={{ y: mediaY }}>
                    <ProjectGallery images={data.images} projectName={data.hero.title} />
                  </motion.div>
                )}
              </Reveal>
            </div>
          )}
        </div>

        {proof && (
          reduced ? (
            expanded && <div id={panelId} className="pj-case-study-wrap"><CaseStudy proof={proof} /></div>
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
                  <CaseStudy proof={proof} />
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}
      </div>
    </section>
  );
}
