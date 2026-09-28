"use client";

import { useEffect, useState } from "react";

type Teaser = { name: string; type: string };

/** The holding panel's words, from data/projects/page.json → comingSoon. */
type ComingSoonCopy = {
  heading: string;
  body: string;
  /** The status line cycles through these. */
  phases: string[];
  queueLabel: string;
};

const PHASE_INTERVAL_MS = 2600;

export function BpComingSoon({ copy, teasers = [] }: { copy: ComingSoonCopy; teasers?: Teaser[] }) {
  const phases = copy.phases.length > 0 ? copy.phases : [""];
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % phases.length);
    }, PHASE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [phases.length]);

  return (
    <div className="bp-soon">
      <div className="bp-soon-loader" aria-hidden="true">
        <span className="bp-soon-ring bp-soon-ring-1" />
        <span className="bp-soon-ring bp-soon-ring-2" />
        <span className="bp-soon-ring bp-soon-ring-3" />
        <span className="bp-soon-core" />
      </div>

      <p className="bp-soon-status" aria-hidden="true">{phases[phase % phases.length]}</p>

      <div className="bp-soon-bar" aria-hidden="true"><span /></div>

      <div className="bp-soon-copy">
        <h3>{copy.heading}</h3>
        <p>{copy.body}</p>
      </div>

      {teasers.length > 0 && (
        <div className="bp-soon-queue">
          <p className="bp-soon-queue-label">{copy.queueLabel}</p>
          <ul className="bp-soon-list">
            {teasers.map((teaser) => (
              <li className="bp-soon-item" key={teaser.name}>
                <span className="bp-soon-dot" aria-hidden="true" />
                <span className="bp-soon-name">{teaser.name}</span>
                <span className="bp-soon-type">{teaser.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="sr-only" role="status">
        {copy.heading}. {copy.body}
      </p>
    </div>
  );
}
