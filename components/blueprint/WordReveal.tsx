"use client";

import { motion, useReducedMotion } from "framer-motion";
import { createElement } from "react";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** Kept to a string union so `motion[as]` stays typeable — a generic ElementType can't be indexed into `motion`. */
type Tag = "span" | "p" | "h1" | "h2" | "h3" | "h4";

type WordRevealProps = {
  text: string;
  /** Wrapping element; keeps the semantic tag (p, h2, span…). */
  as?: Tag;
  /** Seconds before the first word starts. */
  delay?: number;
  /** Skip the blur and just rise (for small type where blur reads as smearing). */
  blur?: boolean;
  className?: string;
};

const list = (delay: number) => ({
  hidden: {},
  shown: { transition: { staggerChildren: 0.06, delayChildren: delay } }
});

const word = (blur: boolean) => ({
  hidden: { opacity: 0, y: 14, filter: blur ? "blur(6px)" : "blur(0px)" },
  shown: {
    // The middle step passes 2px below rest before settling — Blur Text's overshoot, scaled down.
    opacity: [0, 0.6, 1],
    y: [14, 2, 0],
    filter: blur ? ["blur(6px)", "blur(2px)", "blur(0px)"] : ["blur(0px)", "blur(0px)", "blur(0px)"],
    transition: { duration: 0.7, ease: EASE, times: [0, 0.55, 1] }
  }
});

/**
 * Splits a short line into words and reveals them in sequence on view. Each
 * word is inline-block so the line still wraps naturally; the trailing
 * non-breaking space keeps word gaps inside the animated span. For eyebrows
 * and headings only — never prose.
 */
export function WordReveal({ text, as = "span", delay = 0, blur = true, className }: WordRevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) return createElement(as, { className }, text);

  // Downcast from the union of motion components to one member so JSX accepts it.
  const MotionTag = motion[as] as typeof motion.span;

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
      variants={list(delay)}
      aria-label={text}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          variants={word(blur)}
          style={{ display: "inline-block", willChange: "transform, opacity, filter" }}
          aria-hidden="true"
        >
          {w}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </MotionTag>
  );
}
