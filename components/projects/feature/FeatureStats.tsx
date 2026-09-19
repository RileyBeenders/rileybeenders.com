"use client";

import type { ProjectStat } from "@/types/resume";
import { CountUp } from "@/components/blueprint/CountUp";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { useSpotlight } from "@/lib/useSpotlight";

/**
 * A strip of hairline tiles, each with a number that counts up the first
 * time it's seen. Tiles arrive 60ms apart (CSS stagger via --i) and take a
 * faint ink spotlight under the cursor.
 */
export function FeatureStats({ stats }: { stats: ProjectStat[] }) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.2);
  const onSpotMove = useSpotlight();

  return (
    <div ref={ref} className={`ft-stats${inView ? " is-in" : ""}`} data-stagger role="list">
      {stats.map((stat, index) => (
        <div
          className="ft-stat bp-spot"
          key={stat.label}
          role="listitem"
          style={{ ["--i" as string]: index }}
          onPointerMove={onSpotMove}
        >
          <p className="ft-stat-value">
            <CountUp to={stat.value} duration={1.6 + index * 0.15} />
            {stat.suffix && <span className="ft-stat-suffix">{stat.suffix}</span>}
          </p>
          <p className="ft-stat-label">{stat.label}</p>
          {stat.note && <p className="ft-stat-note">{stat.note}</p>}
        </div>
      ))}
    </div>
  );
}
