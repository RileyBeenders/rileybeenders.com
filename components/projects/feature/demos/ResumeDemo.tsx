"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { BackendMatch } from "@/types/resume";

/** What the custom-resume procedure verifies before a PDF is delivered — stated the way the skill states it. */
const CHECKS = ["One page at 612 × 792 pt", "Every keyword backed by the data", "Links verified, nothing invented"];

/** Milliseconds between one resume line lighting and the next while the demo "reads" the posting. */
const SCAN_STEP = 240;

function ArrowDown() {
  return (
    <svg className="bp-arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v11m0 0l-4.5-4.5M8 13l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A miniature of the resume formatter: a posting's keywords on the left, a
 * one-page resume on the right. Hovering a keyword lights the real resume
 * line that backs it; "Generate PDF" walks the lines in order the way the
 * skill matches evidence, then shows the three checks it runs before a file
 * is delivered. The button is the site's own solid button, sheen and all.
 */
export function ResumeDemo({ matches }: { matches: BackendMatch[] }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [scanned, setScanned] = useState(-1);

  useEffect(() => {
    if (phase !== "running") return;
    if (reduced) {
      setScanned(matches.length - 1);
      setPhase("done");
      return;
    }
    let step = 0;
    const timer = setInterval(() => {
      setScanned(step);
      step += 1;
      if (step >= matches.length) {
        clearInterval(timer);
        setTimeout(() => setPhase("done"), 360);
      }
    }, SCAN_STEP);
    return () => clearInterval(timer);
  }, [phase, reduced, matches.length]);

  const run = () => {
    if (phase === "running") return;
    setScanned(-1);
    setPhase("running");
  };
  const reset = () => {
    setPhase("idle");
    setScanned(-1);
  };

  return (
    <div className="dm dm-resume" data-phase={phase}>
      <div className="dm-resume-cols">
        <div className="dm-card dm-posting">
          <p className="dm-eyebrow">Job posting</p>
          <p className="dm-posting-title">Requirements</p>
          <ul className="dm-chips" aria-label="Keywords in the posting">
            {matches.map((match, index) => {
              const on = active === index || (phase === "running" && scanned === index);
              return (
                <li key={match.keyword}>
                  <button
                    type="button"
                    className={`dm-chip${on ? " is-on" : ""}${scanned >= index && phase !== "idle" ? " is-read" : ""}`}
                    aria-pressed={active === index}
                    aria-describedby={`dm-line-${index}`}
                    onPointerEnter={() => setActive(index)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(index)}
                    onBlur={() => setActive(null)}
                    onClick={() => setActive((value) => (value === index ? null : index))}
                  >
                    {match.keyword}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="dm-resume-flow" aria-hidden="true">
          <span className="dm-resume-flow-line" />
          <span className="dm-resume-flow-label">custom-resume</span>
        </div>

        <div className="dm-card dm-page" aria-label="A one-page resume; each posting keyword lights the line that supports it">
          <p className="dm-page-name">Riley Beenders</p>
          <span className="dm-page-rule" aria-hidden="true" />
          <ul className="dm-page-lines">
            {matches.map((match, index) => {
              const lit = active === index || (phase === "running" && scanned === index);
              return (
                <li key={match.line} id={`dm-line-${index}`} className={`${lit ? "is-lit" : ""}${scanned >= index && phase !== "idle" ? " is-read" : ""}`}>
                  {match.line}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="dm-resume-foot">
        <button
          type="button"
          className="bp-btn bp-btn--solid dm-generate"
          onClick={phase === "done" ? reset : run}
          disabled={phase === "running"}
          aria-busy={phase === "running"}
        >
          {phase !== "running" && <span className="bp-sheen" aria-hidden="true" />}
          <span>{phase === "idle" ? "Generate PDF" : phase === "running" ? "Reading the posting…" : "Run it again"}</span>
          {phase !== "running" && <ArrowDown />}
        </button>
        <ul className="dm-checks" aria-live="polite">
          {phase === "done" &&
            CHECKS.map((check, index) => (
              <li key={check} style={{ ["--i" as string]: index }}>
                <span className="dm-check-mark" aria-hidden="true">✓</span>
                {check}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
