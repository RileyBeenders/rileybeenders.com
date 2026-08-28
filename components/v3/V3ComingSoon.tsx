"use client";

import { useEffect, useState } from "react";

type Teaser = { name: string; type: string };

const PHASES = [
  "Compiling case studies",
  "Rendering system diagrams",
  "Cross-checking impact metrics",
  "Polishing the write-ups"
];

const PHASE_INTERVAL_MS = 2600;

export function V3ComingSoon({ teasers = [] }: { teasers?: Teaser[] }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % PHASES.length);
    }, PHASE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="v3-soon">
      <div className="v3-soon-loader" aria-hidden="true">
        <span className="v3-soon-ring v3-soon-ring-1" />
        <span className="v3-soon-ring v3-soon-ring-2" />
        <span className="v3-soon-ring v3-soon-ring-3" />
        <span className="v3-soon-core" />
      </div>

      <p className="v3-soon-status" aria-hidden="true">{PHASES[phase]}</p>

      <div className="v3-soon-bar" aria-hidden="true"><span /></div>

      <div className="v3-soon-copy">
        <h3>Case studies in progress</h3>
        <p>
          Detailed write-ups for each project — the problem, the approach, and the
          measurable impact — are being finalized. They&apos;ll land here soon.
        </p>
      </div>

      {teasers.length > 0 && (
        <div className="v3-soon-queue">
          <p className="v3-soon-queue-label">Queued for publish</p>
          <ul className="v3-soon-list">
            {teasers.map((teaser) => (
              <li className="v3-soon-item" key={teaser.name}>
                <span className="v3-soon-dot" aria-hidden="true" />
                <span className="v3-soon-name">{teaser.name}</span>
                <span className="v3-soon-type">{teaser.type}</span>
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
