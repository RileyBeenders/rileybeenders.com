"use client";

import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { LinkedSkill } from "@/components/blueprint/LinkedSkill";
import type { SkillTarget } from "@/lib/skill-links";
import type { LinkedSkillBorder, LinkedSkillReveal } from "@/types/pages";

export type PickerGroup = {
  label: string;
  items: string[];
  /** The group's colour, a CSS colour (var(--grp-n), or the accent for All). */
  tone: string;
  /** The All tab: every item once. */
  all?: boolean;
};

type SkillPickerProps = {
  groups: PickerGroup[];
  /** Every item once, for print, where nothing is picked. */
  everything: string[];
  /** Each item's first group's colour, which it wears in All. */
  toneOf: Record<string, string>;
  /** Linked items, keyed by name (lib/skill-links.ts allSkillTargets). */
  targets: Record<string, SkillTarget>;
  pickerLabel: string;
  hint: string;
  kindLabels: { project: string; proof: string };
  border: LinkedSkillBorder;
  reveal: LinkedSkillReveal;
  readMoreLabel: string;
};

/** The site's one curve (--ease in bench.css, EASE in Reveal). */
const EASE = [0.22, 0.9, 0.28, 1] as const;
/** The picked tab's tint slides like the nav's. */
const SLIDE = { type: "spring", stiffness: 420, damping: 38, mass: 0.7 } as const;

/**
 * The tab row and the panel under it. Nothing is open at first: the panel
 * holds a hint until a tab is picked, and picking the open tab again closes
 * it. The panel's height follows what's in it, and each group's list rises in
 * on a short stagger. While the height moves the panel clips; once it settles
 * it doesn't, so a linked skill's hover card can reach past it.
 */
/** Rows per column at three and at two columns, so the grid fills top to bottom. */
function rowsFor(count: number) {
  return { "--rows-3": Math.ceil(count / 3), "--rows-2": Math.ceil(count / 2) } as CSSProperties;
}

export function SkillPicker({ groups, everything, toneOf, targets, pickerLabel, hint, kindLabels, border, reveal, readMoreLabel }: SkillPickerProps) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [moving, setMoving] = useState(false);
  const inner = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.35 });
  // The "pick one" cue (the climbing arrow and the wave across the tab dots)
  // only runs while nothing is picked and the section is on screen.
  const cue = active === null && inView && !reduced;

  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const group = active === null ? null : groups[active];
  let linkedIndex = 0;

  const entry = (item: string) => {
    const target = targets[item];
    if (!target) return <span className="skills-item">{item}</span>;
    return (
      <LinkedSkill
        name={item}
        target={target}
        kindLabel={kindLabels[target.kind]}
        border={border}
        reveal={reveal}
        readMoreLabel={readMoreLabel}
        index={linkedIndex++}
      />
    );
  };

  return (
    <div className="skills">
      <div className="card skills-box" ref={box} data-cue={cue ? "" : undefined}>
      <div className="skills-tabs" role="group" aria-label={pickerLabel}>
        {groups.map((entry, index) => {
          const on = index === active;
          return (
            <button
              key={entry.label}
              type="button"
              className={`skills-tab${entry.all ? " skills-tab--all" : ""}${on ? " is-active" : ""}`}
              aria-pressed={on}
              aria-controls={panelId}
              onClick={() => {
                setActive(on ? null : index);
              }}
              style={{ "--grp": entry.tone, "--i": index } as CSSProperties}
            >
              {on && (reduced
                ? <span className="skills-tab-mark" aria-hidden="true" />
                : <motion.span layoutId="skills-tab-mark" className="skills-tab-mark" transition={SLIDE} aria-hidden="true" />)}
              <span className="skills-tab-dot" aria-hidden="true" />
              <span className="skills-tab-label">{entry.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div
        id={panelId}
        className={`skills-panel${moving ? " is-moving" : ""}`}
        initial={false}
        animate={{ height }}
        transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE }}
        onAnimationStart={() => setMoving(true)}
        onAnimationComplete={() => setMoving(false)}
      >
        <div ref={inner} className="skills-panel-inner">
          {group === null ? (
            <motion.p
              key="hint"
              className="skills-hint"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <svg className="skills-hint-arrow" width="20" height="24" viewBox="0 0 20 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 10l6-6 6 6" />
                <path d="M4 19l6-6 6 6" />
              </svg>
              <span>{hint}</span>
            </motion.p>
          ) : (
            <div className="skills-body" key={group.label}>
              <ul className="skills-list" aria-label={group.label} style={rowsFor(group.items.length)}>
                {group.items.map((item, index) => (
                  <motion.li
                    key={item}
                    style={{ "--grp": group.all ? toneOf[item] : group.tone } as CSSProperties}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: EASE }}
                  >
                    <span className="skills-mark" aria-hidden="true" />
                    {entry(item)}
                  </motion.li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
      </div>

      {/* Print has no tabs: it lists every item once. */}
      <ul className="skills-list skills-print" aria-hidden="true" style={rowsFor(everything.length)}>
        {everything.map((item) => <li key={item}><span className="skills-item">{item}</span></li>)}
      </ul>
    </div>
  );
}
