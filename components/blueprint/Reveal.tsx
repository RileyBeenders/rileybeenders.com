"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds of stagger, for sequencing siblings. */
  delay?: number;
  /** Rules and bars grow from the left instead of rising. */
  as?: "rise" | "rule";
  className?: string;
};

/**
 * Scroll-triggered entrance. Everything on the page shares one easing curve so
 * the motion reads as a single hand.
 */
export function Reveal({ children, delay = 0, as = "rise", className }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  const variants = as === "rule"
    ? { hidden: { scaleX: 0 }, shown: { scaleX: 1 } }
    : { hidden: { opacity: 0, y: 22 }, shown: { opacity: 1, y: 0 } };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
      variants={variants}
      transition={{
        duration: as === "rule" ? 0.9 : 0.82,
        delay,
        ease: [0.22, 0.9, 0.28, 1]
      }}
      style={as === "rule" ? { transformOrigin: "left center" } : undefined}
    >
      {children}
    </motion.div>
  );
}
