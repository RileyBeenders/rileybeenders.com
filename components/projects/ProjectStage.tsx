"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectView } from "@/lib/projects";
import { ProjectGallery } from "@/components/projects/ProjectGallery";

/** Below this the stair descent collapses into a plain stacked read. */
const NARROW = "(max-width: 900px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/** Where in the stage's scroll the proof starts and finishes arriving. */
const SLIDE_IN = 0.24;
const SLIDE_DONE = 0.62;
/** The project dims and steps left as the proof lands on top of it. */
const CARD_SHIFT = 4;
const CARD_DIM = 0.62;

function useMatches(query: string): boolean {
  // Starts false so server and first client render agree; corrected on mount.
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

type StageProps = {
  view: ProjectView;
  index: number;
  total: number;
};

/**
 * One step of the descent: the project holds in place while you scroll, its
 * proof slides in from the right, and then the next project rises underneath.
 *
 * The slide is written straight to the two panels from a scroll listener rather
 * than through an animation library. It is a handful of style writes per frame,
 * and it keeps the panel's position an exact function of scroll position — so a
 * trackpad, a scrollbar drag, and a keyboard PageDown all land in the same
 * place, and nothing here hijacks the scroll itself.
 */
export function ProjectStage({ view, index, total }: StageProps) {
  const { project, images, proof } = view;

  const stage = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);

  const narrow = useMatches(NARROW);
  const reduced = useMatches(REDUCED);

  // No proof to reveal, a narrow screen, or reduced motion: lay it out flat.
  const animated = Boolean(proof) && !narrow && !reduced;

  useEffect(() => {
    const cardEl = card.current;
    const panelEl = panel.current;

    if (!animated || !cardEl || !panelEl) {
      for (const element of [cardEl, panelEl, cue.current]) {
        element?.style.removeProperty("transform");
        element?.style.removeProperty("opacity");
      }
      return;
    }

    let frame = 0;

    function apply() {
      frame = 0;
      const stageEl = stage.current;
      if (!stageEl || !cardEl || !panelEl) return;

      const rect = stageEl.getBoundingClientRect();
      const nav = parseFloat(getComputedStyle(stageEl).getPropertyValue("--pj-nav")) || 0;
      // The stage scrolls from "its top meets the nav" to "its bottom meets the
      // bottom of the window"; that distance is the whole sequence.
      const travel = rect.height - (window.innerHeight - nav);
      const progress = travel > 0 ? clamp01((nav - rect.top) / travel) : 0;

      const slide = clamp01((progress - SLIDE_IN) / (SLIDE_DONE - SLIDE_IN));

      panelEl.style.transform = `translate3d(${(1 - slide) * 101}%, 0, 0)`;
      panelEl.style.opacity = String(clamp01(slide * 2.6));
      cardEl.style.transform = `translate3d(${-CARD_SHIFT * slide}%, 0, 0)`;
      cardEl.style.opacity = String(1 - CARD_DIM * slide);
      // The prompt to keep scrolling has done its job once the panel moves.
      if (cue.current) cue.current.style.opacity = String(clamp01(1 - slide * 3));
    }

    function schedule() {
      if (frame === 0) frame = window.requestAnimationFrame(apply);
    }

    apply();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [animated]);

  return (
    <section
      ref={stage}
      id={`project-${project.id}`}
      className={`pj-stage${animated ? " pj-stage--animated" : ""}`}
      aria-label={project.name}
    >
      <div className="pj-sticky">
        <div ref={card} className="pj-card">
          <div className="pj-col pj-col--text">
            <header className="pj-head">
              <p className="pj-index">
                {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(total).padStart(2, "0")}
              </p>
              <h2 className="pj-title">{project.name}</h2>
              {project.type && <p className="pj-subtitle">{project.type}</p>}
              <div className="pj-head-rule" aria-hidden="true" />
            </header>

            <div className="pj-body">
              {project.summary && <p className="pj-summary">{project.summary}</p>}
              {project.bullets.length > 0 && (
                <ul className="pj-bullets">
                  {project.bullets.map((bullet) => (
                    <li key={bullet.text}>{bullet.text}</li>
                  ))}
                </ul>
              )}
              {proof && (
                <p className="pj-cue" ref={cue}>
                  Keep scrolling for the proof
                  <span className="pj-cue-arrow" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </p>
              )}
            </div>
          </div>

          <div className="pj-col pj-col--media">
            <ProjectGallery images={images} projectName={project.name} />
          </div>
        </div>

        {proof && (
          <aside ref={panel} className="pj-proof" aria-label={`${project.name} — proof`}>
            <div className="pj-proof-inner">
              <p className="pj-eyebrow">Proof</p>
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
          </aside>
        )}
      </div>
    </section>
  );
}
