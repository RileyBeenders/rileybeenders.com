"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FeaturePillar, FeatureScreenshot } from "@/types/resume";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useSpotlight } from "@/lib/useSpotlight";
import { ThemedShot } from "@/components/projects/feature/ThemedShot";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

type FeaturePillarsProps = {
  pillars: FeaturePillar[];
  screenshots: FeatureScreenshot[];
  onOpenScreenshot: (id: string) => void;
};

/**
 * Three hairline cards, one per theme of the project. Each shows its first
 * paragraph and opens the rest in place (height from zero to auto, the case-
 * study pattern). A screenshot thumbnail on top opens the full image.
 */
export function FeaturePillars({ pillars, screenshots, onOpenScreenshot }: FeaturePillarsProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);
  return (
    <div ref={ref} className={`ft-pillars${inView ? " is-in" : ""}`} data-stagger>
      {pillars.map((pillar, index) => (
        <Pillar
          key={pillar.title}
          pillar={pillar}
          index={index}
          screenshot={pillar.screenshotId ? screenshots.find((s) => s.id === pillar.screenshotId) : undefined}
          onOpenScreenshot={onOpenScreenshot}
        />
      ))}
    </div>
  );
}

function Pillar({
  pillar,
  index,
  screenshot,
  onOpenScreenshot
}: {
  pillar: FeaturePillar;
  index: number;
  screenshot?: FeatureScreenshot;
  onOpenScreenshot: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();
  const onSpotMove = useSpotlight();
  const [lead, ...rest] = pillar.body;

  const more = rest.length > 0 && (
    <div className="ft-pillar-more">
      {rest.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
    </div>
  );

  return (
    <article className="ft-pillar bp-spot" style={{ ["--i" as string]: index }} onPointerMove={onSpotMove}>
      {screenshot && (
        <button type="button" className="ft-pillar-shot" onClick={() => onOpenScreenshot(screenshot.id)} aria-label={`View screenshot: ${screenshot.caption ?? screenshot.alt}`}>
          <ThemedShot shot={screenshot} />
        </button>
      )}
      <div className="ft-pillar-body">
        {pillar.eyebrow && <p className="ft-pillar-eyebrow">{pillar.eyebrow}</p>}
        <h4 className="ft-pillar-title">{pillar.title}</h4>
        <p className="ft-pillar-lead">{lead}</p>

        {rest.length > 0 && (
          <>
            {reduced ? (
              open && <div id={panelId}>{more}</div>
            ) : (
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    id={panelId}
                    key="more"
                    style={{ overflow: "hidden" }}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    {more}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <button
              type="button"
              className="ft-pillar-toggle"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((value) => !value)}
            >
              <span>{open ? "Less" : "Read more"}</span>
              <ChevronDown className={`pj-toggle-icon${open ? " is-open" : ""}`} size={14} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </article>
  );
}
