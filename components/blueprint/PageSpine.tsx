"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * A thin vertical line running down the left edge of the wrapped sections —
 * from the first section it wraps down to the last, so it starts level with
 * "01 Summary" and ends where the footer begins. A static track shows the
 * full length up front; an accent-colored fill draws over it as you scroll
 * through, spring-damped so it settles rather than tracking the scrollbar
 * 1:1. Purely decorative — it doesn't gate anything, so reduced motion just
 * shows it fully drawn. Mirrors the project list's own spine
 * (components/projects/ProjectListSpine.tsx) but wraps the home page's
 * content sections instead of the project entries.
 */
export function PageSpine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // The project list's own spine uses ["start 0.75", "end 0.4"], but that
    // "end" marker assumes room to keep scrolling well past the target's
    // bottom — here the target's bottom sits right at the footer, so the
    // page runs out of scroll before the bottom could ever reach 40% of the
    // viewport. "end end" instead completes the fill the moment the target's
    // bottom edge first reaches the bottom of the viewport, which the page
    // always has room to scroll to.
    offset: ["start 0.75", "end end"]
  });
  const fill = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });

  return (
    <div ref={ref} className="hp-list">
      <div className="hp-spine" aria-hidden="true">
        <div className="hp-spine-track" />
        <motion.div
          className="hp-spine-fill"
          style={reduced ? { scaleY: 1 } : { scaleY: fill }}
        />
      </div>
      {children}
    </div>
  );
}
