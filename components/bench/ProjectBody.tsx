"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ExternalLink } from "lucide-react";
import type { CatalogEntry } from "@/lib/catalog";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectDateBox } from "@/components/projects/ProjectDateBox";
import { ProjectStatus } from "@/components/projects/ProjectStatus";
import { ProjectFeature } from "@/components/projects/ProjectFeature";
import { PanelWalkthrough } from "@/components/projects/walkthrough/PanelWalkthrough";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { Paragraphs } from "@/components/content/Paragraphs";
import { JobsTable } from "@/components/JobsTable";
import { GanttChart } from "@/components/GanttChart";
import { isPdf } from "@/lib/media";
import { fill, ui } from "@/lib/copy";

const EASE = [0.22, 0.9, 0.28, 1] as const;

type ProjectBodyProps = {
  entry: CatalogEntry;
  /** ISO date from the server; anchors the site project's timeline. */
  today: string;
  /** The site's palette id, for the Studio replica in the site project's deep dive. */
  paletteId: string;
  /** Open the case study at first render (a link to `#project-<id>-case-study`). */
  caseStudyOpen?: boolean;
  /** In a dialog the title sits in the bar, so the body shows a smaller one. */
  mode: "dialog" | "page";
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Everything a project has, top to bottom: the heading (type, name, tagline,
 * dates), the gallery, the summary and bullets, its links, the case study
 * behind a toggle, a panel walkthrough when it has one, and, for the site
 * itself, the deep dive (stats, timeline, pillars, demos) and the
 * application tracker. The same body renders inside the dialog and on the
 * project's own page.
 */
export function ProjectBody({ entry, today, paletteId, caseStudyOpen = false, mode }: ProjectBodyProps) {
  const { project, images, proof, feature, tracker, tagline, outro } = entry;
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(caseStudyOpen);
  const panelId = useId();
  const photos = images.filter((image) => image.src?.trim() && !image.post && !isPdf(image.src)).length;

  useEffect(() => {
    if (caseStudyOpen) setExpanded(true);
  }, [caseStudyOpen]);

  return (
    <div className="pj pbody">
      <header className="pbody-head">
        <p className="eyebrow">{project.type}</p>
        {mode === "page" ? <h1 className="pbody-title">{project.name}</h1> : <h2 className="pbody-title">{project.name}</h2>}
        {tagline && <p className="pbody-tagline">{tagline}</p>}
        <div className="pbody-meta">
          {project.dates?.start && <ProjectDateBox dates={project.dates} position="inline" />}
          {photos > 0 && (
            <span className="pbody-count">{photos === 1 ? ui.projects.onePhoto : fill(ui.projects.photos, { count: photos })}</span>
          )}
        </div>
      </header>

      {images.length > 0 && <ProjectGallery images={images} projectName={project.name} />}

      <div className="pbody-text">
        <Paragraphs className="pbody-summary" text={project.summary} />
        {project.status && <ProjectStatus text={project.status} />}
        {project.bullets.length > 0 && (
          <ul className="pbody-bullets">
            {project.bullets.map((bullet) => (
              <li key={bullet.text}>
                <span className="pj-bullet-content">
                  <EmphasizedText text={bullet.text} phrases={bullet.emphasis} className="pj-bullet-emphasis" />
                </span>
              </li>
            ))}
          </ul>
        )}
        {project.links && project.links.length > 0 && (
          <div className="pbody-links">
            {project.links.map((link) => {
              const external = isExternal(link.href);
              return (
                <a
                  key={link.href}
                  className="btn btn--sm"
                  href={link.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noreferrer" : undefined}
                  suppressHydrationWarning
                >
                  <span>{link.label}</span>
                  {link.note && <span className="pbody-link-note">{link.note}</span>}
                  {external && <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />}
                </a>
              );
            })}
          </div>
        )}
      </div>

      {proof && (
        <div className="pbody-section">
          <button
            type="button"
            className="pj-toggle"
            id={`project-${project.id}-case-study`}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={() => setExpanded((value) => !value)}
          >
            <span>{expanded ? ui.caseStudy.hide : ui.caseStudy.view}</span>
            <ChevronDown className={`pj-toggle-icon${expanded ? " is-open" : ""}`} size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {reduced ? (
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
                  transition={{ duration: 0.5, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <CaseStudy proof={proof} />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      )}

      {project.walkthrough && <PanelWalkthrough walkthrough={project.walkthrough} projectName={project.name} />}

      {feature && <ProjectFeature feature={feature} projectName={project.name} today={today} paletteId={paletteId} />}

      {tracker && (
        <section id="tracker" className="pbody-section pbody-tracker" aria-label={tracker.title}>
          <h3>{tracker.title}</h3>
          {tracker.intro && <p className="pbody-tracker-note">{tracker.intro}</p>}
          {tracker.chart && <GanttChart chart={tracker.chart} />}
          {tracker.table && (
            <>
              <p className="pbody-tracker-note">{tracker.tableNote}</p>
              <div className="bp-table-key" aria-label="Status key">
                <span>🟢 {tracker.statusKey.received}</span>
                <span>🟠 {tracker.statusKey.interviewing}</span>
                <span>🔴 {tracker.statusKey.closed}</span>
              </div>
              <div data-native-scroll="">
                <JobsTable columns={tracker.columns} rows={tracker.rows} singleLine />
              </div>
            </>
          )}
        </section>
      )}

      {outro && (
        <div className="outro pbody-section">
          <p className="bp-outro-lead">{outro.lead}</p>
          <p>{outro.body}</p>
        </div>
      )}
    </div>
  );
}
