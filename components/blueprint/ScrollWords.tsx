"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

type ScrollWordsProps = {
  text: string;
  className?: string;
  /** Degrees the block starts rotated by (svelte-bits' Scroll Reveal uses 3; 2 is enough on paper). */
  rotate?: number;
};

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  // Each word owns a slice of the block's progress — a scrubbed stagger.
  const opacity = useTransform(progress, range, [0.25, 1]);
  return (
    <motion.span style={{ opacity, display: "inline-block" }}>
      {children}&nbsp;
    </motion.span>
  );
}

/**
 * Words brighten one after another as the block scrolls up the viewport, and
 * the block itself straightens from a slight tilt. Tied to scroll, not time,
 * so it reads at the reader's own pace. Always a <p> — it's for a passage,
 * and a fixed tag keeps the ref type exact.
 */
export function ScrollWords({ text, className, rotate = 2 }: ScrollWordsProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(/\s+/);

  const { scrollYProgress } = useScroll({
    target: ref,
    // Starts as the block's top crosses 85% down the viewport, done by 40%.
    offset: ["start 0.85", "start 0.4"]
  });
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 34, mass: 0.4 });
  const rotateZ = useTransform(progress, [0, 1], [rotate, 0]);

  // The ref must still land on a node: useScroll above already holds it, and framer throws if it never hydrates.
  if (reduced) return <p ref={ref} className={className}>{text}</p>;

  return (
    <motion.p ref={ref} className={className} style={{ rotateZ, transformOrigin: "0% 50%" }} aria-label={text}>
      {words.map((w, i) => (
        <Word key={`${w}-${i}`} progress={progress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </Word>
      ))}
    </motion.p>
  );
}
