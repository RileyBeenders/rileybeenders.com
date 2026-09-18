"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds of stagger, for sequencing siblings. */
  delay?: number;
  /** rise: opacity + lift. rule: grows from the left. fade: opacity only (optionally blurred). slide: enters horizontally. */
  as?: "rise" | "rule" | "fade" | "slide";
  /** For as="slide": which side it comes from. */
  from?: "left" | "right";
  /** For as="fade": start slightly blurred and sharpen (kept to 6px so it reads as focus, not smear). */
  blur?: boolean;
  className?: string;
};

/** Everything on the page shares one easing curve so the motion reads as a single hand. Matches --ease in blueprint.css. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

const DURATION = { rise: 0.82, rule: 0.9, fade: 0.7, slide: 0.72 } as const;

function variantsFor(as: NonNullable<RevealProps["as"]>, from: "left" | "right", blur: boolean) {
  switch (as) {
    case "rule":
      return { hidden: { scaleX: 0 }, shown: { scaleX: 1 } };
    case "fade":
      return { hidden: { opacity: 0, filter: blur ? "blur(6px)" : "blur(0px)" }, shown: { opacity: 1, filter: "blur(0px)" } };
    case "slide":
      return { hidden: { opacity: 0, x: from === "left" ? -18 : 18 }, shown: { opacity: 1, x: 0 } };
    default:
      return { hidden: { opacity: 0, y: 22 }, shown: { opacity: 1, y: 0 } };
  }
}

/**
 * Scroll-triggered entrance. Everything on the page shares one easing curve so
 * the motion reads as a single hand.
 */
export function Reveal({ children, delay = 0, as = "rise", from = "left", blur = false, className }: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
      variants={variantsFor(as, from, blur)}
      transition={{
        duration: DURATION[as],
        delay,
        ease: EASE
      }}
      style={as === "rule" ? { transformOrigin: "left center" } : undefined}
    >
      {children}
    </motion.div>
  );
}
