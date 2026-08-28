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

export function BpComingSoon({ teasers = [] }: { teasers?: Teaser[] }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % PHASES.length);
    }, PHASE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="bp-soon">
      <div className="bp-soon-loader" aria-hidden="true">
        <span className="bp-soon-ring bp-soon-ring-1" />
        <span className="bp-soon-ring bp-soon-ring-2" />
        <span className="bp-soon-ring bp-soon-ring-3" />
        <span className="bp-soon-core" />
      </div>

      <p className="bp-soon-status" aria-hidden="true">{PHASES[phase]}</p>

      <div className="bp-soon-bar" aria-hidden="true"><span /></div>

      <div className="bp-soon-copy">
        <h3>Case studies in progress</h3>
        <p>
          Detailed write-ups for each project — the problem, the approach, and the
          measurable impact — are being finalized. They&apos;ll land here soon.
        </p>
      </div>

      {teasers.length > 0 && (
        <div className="bp-soon-queue">
          <p className="bp-soon-queue-label">Queued for publish</p>
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
        The projects page is coming soon. Detailed case studies are being finalized.
      </p>
    </div>
  );
}
