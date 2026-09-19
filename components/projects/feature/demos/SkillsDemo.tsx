"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { BackendSkill } from "@/types/resume";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** How long each skill holds before the router moves on by itself (until the visitor touches it). */
const HOLD_MS = 4200;

/**
 * A miniature of the repository's skill router: the procedures down the left
 * like a rail, and for the selected one what triggers it and what it does.
 * It advances on its own every few seconds until the visitor hovers or
 * clicks, then it's theirs. The indicator slides between names with a spring
 * (the sliding-highlight pattern); the card swaps in place.
 */
export function SkillsDemo({ skills }: { skills: BackendSkill[] }) {
  const reduced = useReducedMotion();
  const baseId = useId();
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched || reduced || skills.length < 2) return;
    const timer = setInterval(() => setIndex((value) => (value + 1) % skills.length), HOLD_MS);
    return () => clearInterval(timer);
  }, [touched, reduced, skills.length]);

  const current = skills[index] ?? skills[0];
  if (!current) return null;

  const pick = (next: number) => {
    setIndex(next);
    setTouched(true);
  };

  return (
    <div className="dm dm-skills">
      <div className="dm-skills-rail" role="tablist" aria-label="Agent skills" aria-orientation="vertical">
        {skills.map((skill, i) => {
          const on = i === index;
          return (
            <button
              key={skill.name}
              type="button"
              role="tab"
              id={`${baseId}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel`}
              tabIndex={on ? 0 : -1}
              className={`dm-skills-tab${on ? " is-active" : ""}`}
              onClick={() => pick(i)}
              onPointerEnter={() => pick(i)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") pick((i + 1) % skills.length);
                if (event.key === "ArrowUp") pick((i - 1 + skills.length) % skills.length);
              }}
            >
              <span>{skill.name}</span>
              {on && (reduced ? (
                <span className="dm-skills-line" aria-hidden="true" />
              ) : (
                <motion.span className="dm-skills-line" layoutId={`${baseId}-line`} aria-hidden="true" transition={{ type: "spring", stiffness: 300, damping: 25 }} />
              ))}
            </button>
          );
        })}
      </div>

      <div className="dm-skills-card" role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${index}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.name}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <p className="dm-eyebrow">Triggers on</p>
            <p className="dm-skills-trigger">{current.trigger}</p>
            <p className="dm-eyebrow">What it does</p>
            <p className="dm-skills-does">{current.does}</p>
          </motion.div>
        </AnimatePresence>
        {!touched && !reduced && skills.length > 1 && (
          // A hairline that fills over one hold — the router's own "next" cue — gone once the visitor takes over.
          <span className="dm-skills-progress" key={index} aria-hidden="true" style={{ ["--hold" as string]: `${HOLD_MS}ms` }} />
        )}
      </div>
    </div>
  );
}
