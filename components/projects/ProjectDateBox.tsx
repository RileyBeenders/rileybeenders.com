"use client";

import type { ProjectDates } from "@/types/resume";
import { formatDate, isIsoDate } from "@/lib/dates";
import { useInViewOnce } from "@/lib/useInViewOnce";

type ProjectDateBoxProps = {
  dates: ProjectDates;
  /** Corner positions ride the entry's hairline rule like a tag; inline sits in the text flow. */
  position?: NonNullable<ProjectDates["position"]>;
  /** "large" is the hero-sized variant on the About-this-site page. */
  size?: "default" | "large";
};

/**
 * A small boxed date range on a project. When the project is `ongoing`, the
 * end reads "Present" and the underline becomes an indeterminate progress
 * bar: it fills most of the way on view, then a lighter band keeps sweeping
 * along it — the site is still moving. Corner positions sit on the entry's
 * rule with paper behind them, so the line appears to pass through the box.
 */
export function ProjectDateBox({ dates, position = "top-right", size = "default" }: ProjectDateBoxProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.5, "0px 0px -20px 0px");
  const ongoing = dates.ongoing === true;
  const end = ongoing ? "Present" : dates.end ? formatDate(dates.end) : null;
  const machineStart = isIsoDate(dates.start) ? dates.start : undefined;
  const machineEnd = !ongoing && isIsoDate(dates.end) ? dates.end : undefined;

  return (
    <div
      ref={ref}
      className={`pj-dates pj-dates--${position}${size === "large" ? " pj-dates--large" : ""}${ongoing ? " pj-dates--ongoing" : ""}${inView ? " is-in" : ""}`}
      aria-label={ongoing ? `${formatDate(dates.start)} to present, ongoing` : undefined}
    >
      <span className="pj-dates-range">
        <time dateTime={machineStart}>{formatDate(dates.start)}</time>
        {end && (
          <>
            <span className="pj-dates-arrow" aria-hidden="true">→</span>
            {machineEnd ? <time dateTime={machineEnd}>{end}</time> : <span>{end}</span>}
          </>
        )}
      </span>
      <span className="pj-dates-bar" aria-hidden="true">
        <span className="pj-dates-fill" />
        {ongoing && <span className="pj-dates-chase" />}
      </span>
    </div>
  );
}
