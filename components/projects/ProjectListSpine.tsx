"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** How far, in the spine's own column, a bend travels vertically while it moves across. */
const BEND_HEIGHT = 72;
/** The spine keeps this much clear of the case study's edge — the same nudge it keeps from the index text. */
const CASE_STUDY_GAP = 12;
/** An excursion smaller than this is not worth a bend; the line stays straight. */
const MIN_EXCURSION = 20;

type Bend = { top: number; bottom: number; x: number };

/**
 * The path: straight down the column, and around every open case study an
 * S-curve in to the panel's edge (arriving about where its top rule is),
 * straight alongside it, and an S-curve back out just below it, into the
 * entry's own padding. A panel still growing or shrinking (the toggle's
 * height animation) has less room than a bend needs, so the excursion
 * scales with the room it has — which is what makes the line bend in and
 * out with the panel instead of snapping.
 */
function spinePath(height: number, bends: Bend[]): string {
  const x0 = 1; // the centre of the 2px column
  let d = `M${x0} 0`;
  let end = height;
  for (const bend of bends) {
    const room = bend.bottom - bend.top;
    const excursion = bend.x * Math.min(1, room / BEND_HEIGHT);
    if (excursion < MIN_EXCURSION) continue;
    const x1 = x0 + excursion;
    const span = Math.min(BEND_HEIGHT, room);
    const inEnd = bend.top + span;
    const outEnd = bend.bottom + span;
    d += ` V${bend.top}`
      + ` C${x0} ${bend.top + span * 0.55} ${x1} ${inEnd - span * 0.55} ${x1} ${inEnd}`
      + ` V${bend.bottom}`
      + ` C${x1} ${bend.bottom + span * 0.55} ${x0} ${outEnd - span * 0.55} ${x0} ${outEnd}`;
    // The last panel's outward bend can run a few px past the list; let it, rather than double back.
    end = Math.max(end, outEnd);
  }
  return `${d} V${end}`;
}

/**
 * A thin vertical line running down the left edge of the project list, behind
 * every entry. A static track shows the full length up front; an accent-
 * colored fill draws over it as you scroll through the list, spring-damped so
 * it settles rather than tracking the scrollbar 1:1. When a case study is
 * open the line bends in to run alongside the centred panel and bends back
 * out below it; with every panel closed it runs straight. Purely decorative
 * — it doesn't gate anything, so reduced motion just shows it fully drawn.
 */
export function ProjectListSpine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const spineRef = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.4"]
  });
  const fill = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });
  const d = useMotionValue("M1 0 V0");

  // The path is measured from the DOM, not tracked in React state: the list's
  // ResizeObserver fires on every frame a case study grows or shrinks, and a
  // motion value takes each new path straight to the SVG.
  useEffect(() => {
    const list = ref.current;
    const spine = spineRef.current;
    if (!list || !spine) return;

    const measure = () => {
      const listRect = list.getBoundingClientRect();
      const spineLeft = spine.getBoundingClientRect().left;
      const bends: Bend[] = [];
      for (const wrap of list.querySelectorAll<HTMLElement>(".pj-case-study-wrap")) {
        const panel = wrap.querySelector<HTMLElement>(".pj-case-study");
        if (!panel) continue;
        const rect = wrap.getBoundingClientRect();
        bends.push({
          top: rect.top - listRect.top,
          bottom: rect.bottom - listRect.top,
          x: panel.getBoundingClientRect().left - CASE_STUDY_GAP - spineLeft
        });
      }
      d.set(spinePath(listRect.height, bends));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [d]);

  return (
    <div ref={ref} className="pj-list">
      <svg ref={spineRef} className="pj-spine" aria-hidden="true">
        <motion.path className="pj-spine-track" d={d} />
        <motion.path
          className="pj-spine-fill"
          d={d}
          style={reduced ? { pathLength: 1 } : { pathLength: fill }}
        />
      </svg>
      {children}
    </div>
  );
}
