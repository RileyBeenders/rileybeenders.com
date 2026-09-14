"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/**
 * A thin vertical line running down the left edge of the project list, behind
 * every entry. A static track shows the full length up front; an accent-
 * colored fill draws over it as you scroll through the list, spring-damped so
 * it settles rather than tracking the scrollbar 1:1. Purely decorative — it
 * doesn't gate anything, so reduced motion just shows it fully drawn.
 */
export function ProjectListSpine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.4"]
  });
  const fill = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });

  return (
    <div ref={ref} className="pj-list">
      <div className="pj-spine" aria-hidden="true">
        <div className="pj-spine-track" />
        <motion.div
          className="pj-spine-fill"
          style={reduced ? { scaleY: 1 } : { scaleY: fill }}
        />
      </div>
      {children}
    </div>
  );
}
