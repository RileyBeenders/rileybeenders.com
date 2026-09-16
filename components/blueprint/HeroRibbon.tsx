"use client";

import { useEffect, useRef, useState } from "react";

// Matches the CSS draw animation's delay + duration (blueprint.css), so a
// crossing mid-replay can't stack another remount on top of it.
const REPLAY_COOLDOWN_MS = 2100;

/**
 * The faint B-bowl flourish behind the hero heading. The stroke-draw itself is
 * plain CSS (see .bp-hero-ribbon in blueprint.css), but CSS can't replay an
 * already-finished animation on its own — remounting the path via `key`
 * forces it to restart whenever the hero scrolls back into view.
 *
 * Watches the .bp-hero section rather than the ribbon's own SVG: the ribbon
 * is tall and mostly transparent padding around the actual B stroke, so
 * using its bounding box as the trigger fired well before the heading was
 * actually back on screen and could flip in and out during a slow scroll.
 */
export function HeroRibbon() {
  const ref = useRef<SVGSVGElement>(null);
  const [playKey, setPlayKey] = useState(0);

  useEffect(() => {
    const hero = ref.current?.closest(".bp-hero");
    if (!hero || typeof IntersectionObserver === "undefined") return;

    let hasSeenInitial = false;
    let cooling = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Skip the observer's initial report of the already-visible mount state —
        // only replay on later transitions back into view.
        if (!hasSeenInitial) {
          hasSeenInitial = true;
          return;
        }
        if (entry.isIntersecting && !cooling) {
          cooling = true;
          setPlayKey((key) => key + 1);
          setTimeout(() => { cooling = false; }, REPLAY_COOLDOWN_MS);
        }
      },
      { threshold: 0.6 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className="bp-hero-ribbon"
      viewBox="0 0 200 240"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMin meet"
    >
      <path
        key={playKey}
        d="M40 20c72 0 108 18 108 45 0 26-36 44-108 44 82 0 121 19 121 46 0 25-39 45-121 45"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
