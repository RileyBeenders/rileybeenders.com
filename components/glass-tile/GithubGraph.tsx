"use client";

import { ExternalLink } from "lucide-react";
import type { CSSProperties } from "react";
import type { Contributions } from "@/lib/github";
import { fill, ui } from "@/lib/copy";
import { useInViewOnce } from "@/lib/useInViewOnce";

const CELL = 12;
const GAP = 3;
const STEP = CELL + GAP;
const LEFT = 30; // room for the weekday labels
const TOP = 18; // room for the month labels

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LEVEL_VAR = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];

function weekday(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getUTCDay();
}

function monthOf(iso: string): number {
  return Number(iso.slice(5, 7)) - 1;
}

function longDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

type GithubGraphProps = {
  title: string;
  data: Contributions | null;
  profileUrl: string;
};

/**
 * GitHub's contribution calendar, drawn from the days lib/github.ts read:
 * one column per week, Sunday at the top, GitHub's own five intensity steps
 * in the sheet's blues. The cells pop in column by column the first time the
 * card scrolls into view.
 */
export function GithubGraph({ title, data, profileUrl }: GithubGraphProps) {
  const { ref, inView } = useInViewOnce<HTMLElement>(0.25);

  if (!data) {
    return (
      <section ref={ref} className="card activity" aria-label={title}>
        <div className="activity-head">
          <h2 className="activity-title">{title}</h2>
        </div>
        <p className="activity-empty">{ui.activity.unavailable}</p>
      </section>
    );
  }

  const firstOffset = weekday(data.days[0].date);
  const weeks = Math.ceil((data.days.length + firstOffset) / 7);
  const width = LEFT + weeks * STEP;
  const height = TOP + 7 * STEP;

  // A month label over the first week that starts in it.
  const labels: { x: number; text: string }[] = [];
  let lastMonth = -1;
  data.days.forEach((day, index) => {
    const column = Math.floor((index + firstOffset) / 7);
    const row = (index + firstOffset) % 7;
    const month = monthOf(day.date);
    if (row === 0 && month !== lastMonth) {
      // Skip a label that would collide with the previous one (a month that starts in the last column of the previous).
      if (labels.length === 0 || column - (labels[labels.length - 1].x - LEFT) / STEP >= 3) {
        labels.push({ x: LEFT + column * STEP, text: MONTHS[month] });
      }
      lastMonth = month;
    }
  });

  return (
    <section ref={ref} className={`card activity${inView ? " is-in" : ""}`} aria-label={title}>
      <div className="activity-head">
        <h2 className="activity-title">{title}</h2>
        <p className="activity-total mono">{fill(ui.activity.total, { count: data.total.toLocaleString("en-US") })}</p>
      </div>

      <div className="activity-scroll" data-native-scroll="">
        <svg className="activity-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={fill(ui.activity.total, { count: data.total })}>
          {labels.map((label) => (
            <text key={`${label.text}-${label.x}`} className="activity-month" x={label.x} y={11}>{label.text}</text>
          ))}
          {[1, 3, 5].map((row) => (
            <text key={row} className="activity-day" x={0} y={TOP + row * STEP + CELL - 2}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][row]}
            </text>
          ))}
          {data.days.map((day, index) => {
            const column = Math.floor((index + firstOffset) / 7);
            const row = (index + firstOffset) % 7;
            return (
              <rect
                key={day.date}
                className="activity-cell"
                x={LEFT + column * STEP}
                y={TOP + row * STEP}
                width={CELL}
                height={CELL}
                rx={2.5}
                style={{ "--c": LEVEL_VAR[day.level], "--i": column } as CSSProperties}
              >
                <title>{`${day.count === 0 ? "No" : day.count} contribution${day.count === 1 ? "" : "s"} on ${longDate(day.date)}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      <div className="activity-foot">
        <a className="bp-link" href={profileUrl} target="_blank" rel="noreferrer" suppressHydrationWarning>
          {ui.activity.profile}
          <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
        </a>
        <span className="activity-legend" aria-hidden="true">
          {ui.activity.less}
          {LEVEL_VAR.map((level) => <i key={level} style={{ background: level }} />)}
          {ui.activity.more}
        </span>
      </div>
    </section>
  );
}
