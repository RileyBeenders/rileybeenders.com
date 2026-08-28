"use client";

import { useEffect, useState } from "react";

export type ComingSoonTeaser = {
  name: string;
  type: string;
};

type ComingSoonProps = {
  teasers?: ComingSoonTeaser[];
};

const BUILD_PHASES = [
  "Compiling case studies",
  "Rendering system diagrams",
  "Cross-checking impact metrics",
  "Polishing the write-ups"
];

const PHASE_INTERVAL_MS = 2600;

export function ComingSoon({ teasers = [] }: ComingSoonProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % BUILD_PHASES.length);
    }, PHASE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="projects-soon">
      <div className="projects-soon-loader" aria-hidden="true">
        <span className="projects-soon-ring projects-soon-ring-1" />
        <span className="projects-soon-ring projects-soon-ring-2" />
        <span className="projects-soon-ring projects-soon-ring-3" />
        <span className="projects-soon-core" />
      </div>

      <p className="projects-soon-status" aria-hidden="true">
        {BUILD_PHASES[phase]}
      </p>

      <div className="projects-soon-bar" aria-hidden="true">
        <span />
      </div>

      <div className="projects-soon-copy">
        <span className="projects-soon-badge">Coming Soon</span>
        <h3>Case studies in progress</h3>
        <p>
          Detailed write-ups for each project — the problem, the approach, and the
          measurable impact — are being finalized. They&apos;ll land here soon.
        </p>
      </div>

      {teasers.length > 0 && (
        <div className="projects-soon-queue">
          <p className="projects-soon-queue-label">Queued for publish</p>
          <ul className="projects-soon-teasers">
            {teasers.map((teaser, index) => (
              <li className="projects-soon-teaser" key={teaser.name}>
                <span
                  className="projects-soon-teaser-dot"
                  style={{ animationDelay: `${(index % 6) * 0.22}s` }}
                  aria-hidden="true"
                />
                <span className="projects-soon-teaser-name">{teaser.name}</span>
                <span className="projects-soon-teaser-type">{teaser.type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="sr-only" role="status">
        The projects page is coming soon. Detailed case studies are being finalized.
      </p>
    </div>
  );
}
