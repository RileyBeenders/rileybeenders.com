"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Download, ExternalLink, Maximize2 } from "lucide-react";
import type { FeatureScreenshot, ProjectImage, ProjectWalkthrough, WalkthroughStep } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { ThemedShot } from "@/components/projects/feature/ThemedShot";
import { Lightbox } from "@/components/projects/Lightbox";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { ui } from "@/lib/copy";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** A capture as the lightbox wants it. */
const asImage = (shot: FeatureScreenshot): ProjectImage => ({
  src: shot.src,
  alt: shot.alt,
  caption: shot.caption,
  fit: "contain",
  aspect: "original"
});

/**
 * A guided tour of a program's screens: a rail of stops on one side and the
 * stop's capture on the other, with numbered callouts placed on the picture.
 * Pressing a callout (or its note) lights it up; Previous / Next and the
 * arrow keys move between stops. Extra captures of the same panel sit under
 * the main one and swap in; any capture enlarges into the site's lightbox.
 * Below, the sample files the program itself wrote, to open or download.
 */
export function PanelWalkthrough({ walkthrough, projectName }: { walkthrough: ProjectWalkthrough; projectName: string }) {
  const { steps } = walkthrough;
  const [at, setAt] = useState(0);
  const [direction, setDirection] = useState(1);
  // Which capture of the step is on the stage: 0 is its main one, 1.. its extras.
  const [shown, setShown] = useState(0);
  const [spot, setSpot] = useState<number | null>(null);
  const [open, setOpen] = useState<{ images: ProjectImage[]; index: number } | null>(null);
  const reduced = useReducedMotion();
  const stageId = useId();
  const { ref: railRef, inView } = useInViewOnce<HTMLOListElement>(0.1);
  const stageRef = useRef<HTMLDivElement>(null);

  const step = steps[at];
  const captures = useMemo(() => [step.shot, ...(step.extras ?? [])], [step]);
  const capture = captures[Math.min(shown, captures.length - 1)];
  const onMain = shown === 0;

  const go = useCallback(
    (to: number) => {
      const next = (to + steps.length) % steps.length;
      if (next === at) return;
      setDirection(next > at ? 1 : -1);
      setAt(next);
      setShown(0);
      setSpot(null);
    },
    [at, steps.length]
  );

  // Arrow keys move between stops while the walkthrough has focus.
  const onKey = (event: React.KeyboardEvent) => {
    if (event.target instanceof HTMLElement && /^(input|textarea|select)$/i.test(event.target.tagName)) return;
    if (event.key === "ArrowRight") { event.preventDefault(); go(at + 1); }
    if (event.key === "ArrowLeft") { event.preventDefault(); go(at - 1); }
  };

  // A fresh stop starts at its first callout once the picture is in; the
  // visitor can read the rest in order from there.
  useEffect(() => {
    if (!step.hotspots?.length) return;
    const timer = window.setTimeout(() => setSpot((current) => (current === null ? 0 : current)), reduced ? 0 : 650);
    return () => window.clearTimeout(timer);
  }, [step, reduced]);

  const enlarge = () => setOpen({ images: captures.map(asImage), index: Math.min(shown, captures.length - 1) });

  const slide = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : {
        initial: { opacity: 0, x: 28 * direction },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -22 * direction },
        transition: { duration: 0.48, ease: EASE }
      };

  return (
    <section className="wt" aria-label={`${projectName}: ${walkthrough.title}`} onKeyDown={onKey}>
      <Reveal><h3 className="wt-title">{walkthrough.title}</h3></Reveal>
      {walkthrough.intro && splitParagraphs(walkthrough.intro).map((paragraph, i) => (
        <Reveal key={i} delay={0.06 + i * 0.04}><p className="wt-intro">{paragraph}</p></Reveal>
      ))}

      <div className="wt-grid">
        <ol ref={railRef} className={`wt-rail${inView ? " is-in" : ""}`} aria-label={walkthrough.title}>
          {steps.map((entry, index) => (
            <li key={entry.id} style={{ ["--i" as string]: index }}>
              <button
                type="button"
                className={`wt-stop${index === at ? " is-current" : ""}${index < at ? " is-past" : ""}`}
                aria-current={index === at ? "step" : undefined}
                aria-controls={stageId}
                onClick={() => go(index)}
              >
                <span className="wt-stop-num" aria-hidden="true">{pad(index + 1)}</span>
                <span className="wt-stop-text">
                  <span className="wt-stop-title">{entry.title}</span>
                  <span className="wt-stop-audience">{entry.audience}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <div className="wt-main" id={stageId}>
          <div className="wt-stage-head">
            <p className="wt-counter" aria-live="polite">
              <span className="wt-counter-step">{pad(at + 1)}</span>
              <span aria-hidden="true"> / </span>
              <span>{pad(steps.length)}</span>
              <span className="sr-only">{ui.walkthrough.stepOf.replace("{step}", String(at + 1)).replace("{total}", String(steps.length))}</span>
            </p>
            <h4 className="wt-stage-title">{step.title}</h4>
            <p className="wt-stage-audience">{step.audience}</p>
          </div>

          <div ref={stageRef} className="wt-stage">
            <AnimatePresence initial={false} mode="popLayout" custom={direction}>
              <motion.div key={`${step.id}-${capture.src}`} className="wt-frame" {...slide}>
                <ThemedShot shot={capture} alt={capture.alt} className="wt-shot" />
                {onMain && step.hotspots?.map((hotspot, index) => {
                  const active = spot === index;
                  const boxed = hotspot.w !== undefined && hotspot.h !== undefined;
                  return (
                    <button
                      key={`${step.id}-${index}`}
                      type="button"
                      className={`wt-spot${boxed ? " wt-spot--box" : " wt-spot--pin"}${active ? " is-active" : ""}${spot !== null && !active ? " is-dim" : ""}`}
                      style={{
                        left: `${hotspot.x}%`,
                        top: `${hotspot.y}%`,
                        ...(boxed ? { width: `${hotspot.w}%`, height: `${hotspot.h}%` } : {})
                      }}
                      aria-pressed={active}
                      aria-label={`${index + 1}. ${hotspot.label}`}
                      onClick={() => setSpot(active ? null : index)}
                    >
                      <span className="wt-spot-num">{index + 1}</span>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
            <button type="button" className="wt-enlarge" onClick={enlarge} aria-label={`${ui.walkthrough.enlarge}: ${capture.alt}`} title={ui.walkthrough.enlarge}>
              <Maximize2 size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          {captures.length > 1 && (
            <div className="wt-extras" role="group" aria-label={ui.walkthrough.alsoOn}>
              <span className="wt-extras-label">{ui.walkthrough.alsoOn}</span>
              {captures.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`wt-extra${index === Math.min(shown, captures.length - 1) ? " is-on" : ""}`}
                  aria-pressed={index === Math.min(shown, captures.length - 1)}
                  onClick={() => { setShown(index); setSpot(null); }}
                  title={entry.caption ?? entry.alt}
                >
                  <ThemedShot shot={entry} alt="" />
                  <span className="wt-extra-caption">{entry.caption ?? entry.alt}</span>
                </button>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step.id}
              className="wt-notes"
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.4, ease: EASE }}
            >
              {step.body.flatMap(splitParagraphs).map((paragraph, i) => <p key={i} className="wt-body">{paragraph}</p>)}

              {step.hotspots && step.hotspots.length > 0 && (
                <div className="wt-callouts">
                  <p className="wt-callouts-label">{ui.walkthrough.callouts}</p>
                  <ol className="wt-callout-list">
                    {step.hotspots.map((hotspot, index) => (
                      <li key={`${step.id}-note-${index}`}>
                        <button
                          type="button"
                          className={`wt-callout${spot === index ? " is-active" : ""}`}
                          aria-pressed={spot === index}
                          onClick={() => { setShown(0); setSpot(spot === index ? null : index); }}
                        >
                          <span className="wt-callout-num" aria-hidden="true">{index + 1}</span>
                          <span className="wt-callout-text">
                            <span className="wt-callout-label">{hotspot.label}</span>
                            <span className="wt-callout-body">{hotspot.text}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="wt-controls">
            <button type="button" className="wt-nav" onClick={() => go(at - 1)} disabled={at === 0}>
              <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
              <span>{ui.walkthrough.previous}</span>
            </button>
            <span className="wt-progress" aria-hidden="true">
              {steps.map((entry, index) => (
                <span key={entry.id} className={`wt-progress-dot${index <= at ? " is-on" : ""}`} />
              ))}
            </span>
            <button type="button" className="wt-nav wt-nav--next" onClick={() => go(at + 1)} disabled={at === steps.length - 1}>
              <span>{at === steps.length - 1 ? steps[0].title : steps[at + 1].title}</span>
              <ArrowRight size={15} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {walkthrough.samples && walkthrough.samples.length > 0 && (
        <div className="wt-samples">
          {walkthrough.samplesTitle && <Reveal><h3 className="wt-title wt-title--samples">{walkthrough.samplesTitle}</h3></Reveal>}
          {walkthrough.samplesIntro && <Reveal delay={0.05}><p className="wt-intro">{walkthrough.samplesIntro}</p></Reveal>}
          <div className="wt-sample-grid">
            {walkthrough.samples.map((sample, index) => (
              <Reveal key={sample.src} delay={0.08 + index * 0.06} className="wt-sample">
                <article className="wt-sample-card">
                  {sample.shot && (
                    <button
                      type="button"
                      className="wt-sample-shot"
                      onClick={() => setOpen({ images: [asImage(sample.shot!)], index: 0 })}
                      aria-label={`${ui.walkthrough.viewCapture}: ${sample.label}`}
                    >
                      <ThemedShot shot={sample.shot} alt="" />
                    </button>
                  )}
                  <div className="wt-sample-body">
                    <p className="wt-sample-kind">{sample.kind}</p>
                    <h4 className="wt-sample-label">{sample.label}</h4>
                    <p className="wt-sample-note">{sample.note}</p>
                    <div className="wt-sample-actions">
                      {/* suppressHydrationWarning: like every other anchor on the site — a browser extension can stamp attributes onto <a> before hydration. */}
                      <a className="wt-sample-link" href={sample.src} target="_blank" rel="noreferrer" suppressHydrationWarning>
                        <ExternalLink size={14} strokeWidth={1.8} aria-hidden="true" />
                        <span>{ui.walkthrough.openFile}</span>
                      </a>
                      <a className="wt-sample-link" href={sample.src} download suppressHydrationWarning>
                        <Download size={14} strokeWidth={1.8} aria-hidden="true" />
                        <span>{ui.walkthrough.download}</span>
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      )}

      {open && (
        <Lightbox
          images={open.images}
          index={open.index}
          onIndexChange={(index) => setOpen({ images: open.images, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

export type { WalkthroughStep };
