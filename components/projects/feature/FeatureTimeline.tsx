"use client";

import { useId, useMemo, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FeatureScreenshot, TimelineEntry } from "@/types/resume";
import { formatDate, isIsoDate, parseIsoDate } from "@/lib/dates";
import { REPO_URL } from "@/lib/site";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { ThemedShot } from "@/components/projects/feature/ThemedShot";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** The axis keeps 4% of empty track at each end so the first and last dots aren't flush with the edge. */
const PAD = 4;
/** Two dots on the same side of the axis closer than this (in % of the axis) get a longer stem so they don't touch. */
const CROWD = 2.6;

const ERA_LABEL = { past: "Shipped", present: "In progress", future: "Planned" } as const;

type Placed = {
  entry: TimelineEntry;
  index: number;
  /** 0–100 along the axis. */
  x: number;
  /** above or below the axis, and how far. */
  side: "above" | "below";
  depth: 1 | 2;
  /** Dot diameter in px, from the commit's size. */
  size: number;
};

type Tick = { x: number; label: string };

function timeOf(entry: TimelineEntry): number {
  return isIsoDate(entry.date) ? parseIsoDate(entry.date).getTime() : Number.NaN;
}

/** 8px for nothing, up to 14px for the biggest commits — log-scaled so the 448k-line merge doesn't dwarf everything. */
function dotSize(entry: TimelineEntry): number {
  const lines = (entry.insertions ?? 0) + (entry.deletions ?? 0);
  if (!lines) return 8;
  return 8 + 6 * Math.min(1, Math.log10(lines + 1) / 6);
}

function layout(entries: TimelineEntry[], today: string) {
  const dated = entries.filter((entry) => isIsoDate(entry.date));
  const times = dated.map(timeOf);
  const now = parseIsoDate(today).getTime();
  const t0 = Math.min(...times);
  const tN = Math.max(...times, now);
  const span = Math.max(1, tN - t0);
  const toX = (t: number) => PAD + (100 - 2 * PAD) * ((t - t0) / span);

  const sorted = dated
    .map((entry, index) => ({ entry, index, t: timeOf(entry) }))
    .sort((a, b) => a.t - b.t || a.index - b.index);

  const placed: Placed[] = [];
  sorted.forEach(({ entry, index, t }, order) => {
    const x = toX(t);
    const side: Placed["side"] = order % 2 === 0 ? "above" : "below";
    const crowded = placed.some((p) => p.side === side && p.depth === 1 && Math.abs(p.x - x) < CROWD);
    placed.push({ entry, index, x, side, depth: crowded ? 2 : 1, size: dotSize(entry) });
  });

  // One tick per month boundary inside the range; the year shows on the first and whenever it changes.
  const ticks: Tick[] = [];
  const cursor = new Date(t0);
  cursor.setUTCDate(1);
  cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  let lastYear = new Date(t0).getUTCFullYear();
  while (cursor.getTime() <= tN) {
    const year = cursor.getUTCFullYear();
    const month = cursor.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    ticks.push({ x: toX(cursor.getTime()), label: year !== lastYear || ticks.length === 0 ? `${month} ${year}` : month });
    lastYear = year;
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  return { placed, ticks, nowX: toX(now) };
}

type FeatureTimelineProps = {
  entries: TimelineEntry[];
  screenshots: FeatureScreenshot[];
  /** ISO date from the server, so the "now" marker is the same on both sides of hydration. */
  today: string;
  onOpenScreenshot: (id: string) => void;
};

/**
 * The commit history as a time axis: dots placed by date (quiet weeks read
 * as space), sized by how much a commit changed, above and below the line so
 * same-day commits never overlap. The solid stretch is the past and fills on
 * view; a dashed stretch beyond today holds what's planned. Selecting a dot
 * swaps its card in below. Under 860px the axis gives way to a vertical list
 * of every entry, which is also the reading order for assistive tech.
 */
export function FeatureTimeline({ entries, screenshots, today, onOpenScreenshot }: FeatureTimelineProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3);
  const cardId = useId();
  const { placed, ticks, nowX } = useMemo(() => layout(entries, today), [entries, today]);

  // Open on the present entry; failing that, the most recent shipped one.
  const initial = placed.find((p) => p.entry.era === "present") ?? [...placed].reverse().find((p) => p.entry.era === "past") ?? placed[0];
  const [selected, setSelected] = useState<number>(initial?.index ?? 0);
  const current = placed.find((p) => p.index === selected) ?? initial;
  const orderOf = (index: number) => placed.findIndex((p) => p.index === index);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const order = orderOf(selected);
    let next = order;
    if (event.key === "ArrowRight") next = Math.min(placed.length - 1, order + 1);
    else if (event.key === "ArrowLeft") next = Math.max(0, order - 1);
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = placed.length - 1;
    else return;
    event.preventDefault();
    const target = placed[next];
    setSelected(target.index);
    (event.currentTarget.querySelector<HTMLButtonElement>(`[data-order="${next}"]`))?.focus();
  };

  if (!current) return null;

  const shot = current.entry.screenshotId ? screenshots.find((s) => s.id === current.entry.screenshotId) : undefined;

  return (
    <div ref={ref} className={`tl${inView ? " is-in" : ""}`}>
      {/* ------------------------------------------------ desktop axis --- */}
      <div className="tl-axis" role="group" aria-label="Key commits, earliest to latest" onKeyDown={onKeyDown}>
        <div className="tl-eras" aria-hidden="true">
          <span className="tl-era" style={{ left: `${PAD}%` }}>Past</span>
          <span className="tl-era tl-era--now" style={{ left: `${nowX}%` }}>Present</span>
          <span className="tl-era tl-era--future" style={{ left: `${100 - PAD}%` }}>Future</span>
        </div>

        <div className="tl-track" aria-hidden="true">
          <span className="tl-track-past" style={{ width: `${nowX}%` }}>
            <span className="tl-track-fill" />
          </span>
          <span className="tl-track-future" style={{ left: `${nowX}%` }} />
          <span className="tl-now" style={{ left: `${nowX}%` }}>
            {!reduced && <span className="tl-now-ring" />}
          </span>
          {ticks.map((tick) => (
            <span className="tl-tick" key={tick.label + tick.x} style={{ left: `${tick.x}%` }}>
              <span className="tl-tick-label">{tick.label}</span>
            </span>
          ))}
        </div>

        {placed.map((p, order) => {
          const active = p.index === selected;
          return (
            <button
              type="button"
              key={`${p.entry.date}-${p.index}`}
              data-order={order}
              className={`tl-dot tl-dot--${p.entry.era} tl-dot--${p.side}${active ? " is-active" : ""}`}
              style={{ ["--x" as string]: `${p.x}%`, ["--i" as string]: order, ["--depth" as string]: p.depth, ["--size" as string]: `${p.size}px` }}
              aria-pressed={active}
              aria-controls={cardId}
              aria-label={`${formatDate(p.entry.date)}: ${p.entry.title}`}
              onClick={() => setSelected(p.index)}
              onFocus={() => setSelected(p.index)}
            >
              <span className="tl-dot-stem" aria-hidden="true" />
              <span className="tl-dot-mark" aria-hidden="true" />
              <span className="tl-dot-label" aria-hidden="true">{p.entry.title}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------- selected card --- */}
      <div className="tl-card-slot" id={cardId} aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={`${current.entry.date}-${current.index}`}
            className={`tl-card tl-card--${current.entry.era}`}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.36, ease: EASE }}
          >
            <TimelineCard entry={current.entry} screenshot={shot} onOpenScreenshot={onOpenScreenshot} />
          </motion.article>
        </AnimatePresence>
      </div>

      {/* --------------------------------------------------- mobile list --- */}
      <ol className="tl-list">
        {placed.map((p) => (
          <li className={`tl-list-item tl-list-item--${p.entry.era}`} key={`list-${p.entry.date}-${p.index}`}>
            <span className="tl-list-mark" aria-hidden="true" />
            <TimelineCard entry={p.entry} screenshot={p.entry.screenshotId ? screenshots.find((s) => s.id === p.entry.screenshotId) : undefined} onOpenScreenshot={onOpenScreenshot} compact />
          </li>
        ))}
      </ol>
    </div>
  );
}

function TimelineCard({
  entry,
  screenshot,
  onOpenScreenshot,
  compact = false
}: {
  entry: TimelineEntry;
  screenshot?: FeatureScreenshot;
  onOpenScreenshot: (id: string) => void;
  compact?: boolean;
}) {
  const hasSize = entry.files || entry.insertions || entry.deletions;
  return (
    <>
      <p className="tl-card-meta">
        <time dateTime={isIsoDate(entry.date) ? entry.date : undefined}>
          {formatDate(entry.date, entry.era === "future" ? "month" : "long")}
        </time>
        <span className={`tl-badge tl-badge--${entry.era}`}>{ERA_LABEL[entry.era]}</span>
        {/* suppressHydrationWarning: like every other anchor on the site — a browser extension can stamp attributes onto <a> before hydration. */}
        {entry.hash && (
          <a className="tl-hash" href={`${REPO_URL}/commit/${entry.hash}`} target="_blank" rel="noreferrer" suppressHydrationWarning>
            {entry.hash}
          </a>
        )}
      </p>
      <h4 className="tl-card-title">{entry.title}</h4>
      <p className="tl-card-summary">{entry.summary}</p>
      {(entry.tags?.length || hasSize) && (
        <p className="tl-card-foot">
          {entry.tags?.map((tag) => <span className="tl-tag" key={tag}>{tag}</span>)}
          {hasSize ? (
            <span className="tl-size" aria-label="Change size">
              {entry.files ? <span>{entry.files.toLocaleString("en-US")} files</span> : null}
              {entry.insertions ? <span className="tl-size-add">+{entry.insertions.toLocaleString("en-US")}</span> : null}
              {entry.deletions ? <span className="tl-size-del">−{entry.deletions.toLocaleString("en-US")}</span> : null}
            </span>
          ) : null}
        </p>
      )}
      {screenshot && !compact && (
        <button type="button" className="tl-card-shot" onClick={() => onOpenScreenshot(screenshot.id)} aria-label={`View screenshot: ${screenshot.caption ?? screenshot.alt}`}>
          <ThemedShot shot={screenshot} />
          <span>{screenshot.caption ?? "View screenshot"}</span>
        </button>
      )}
    </>
  );
}
