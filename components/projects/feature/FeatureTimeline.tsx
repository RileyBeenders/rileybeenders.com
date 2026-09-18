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
/** How far out a stem is allowed to go. Past this the axis would run into the era row or the month labels. */
const MAX_DEPTH = 3;
/** A day, for the gap a connector reports between its two dots. */
const DAY = 86_400_000;

const ERA_LABEL = { past: "Shipped", present: "In progress", future: "Planned" } as const;

type Placed = {
  entry: TimelineEntry;
  index: number;
  /** 0–100 along the axis. */
  x: number;
  /** above or below the axis, and how far. */
  side: "above" | "below";
  depth: number;
  /** Dot diameter in px, from the commit's size. */
  size: number;
};

/** A drawn connection between two dots, arrow pointing at `to`. */
type Link = { from: Placed; to: Placed; label: string };

type Tick = { x: number; label: string };

/** A claimed stretch of one depth level on one side, for resolving crowding. */
type Slot = { side: "above" | "below"; depth: number; from: number; to: number };

function timeOf(entry: TimelineEntry): number {
  return isIsoDate(entry.date) ? parseIsoDate(entry.date).getTime() : Number.NaN;
}

/** 8px for nothing, up to 14px for the biggest commits — log-scaled so the 448k-line merge doesn't dwarf everything. */
function dotSize(entry: TimelineEntry): number {
  if (entry.mark === "star") return 18;
  const lines = (entry.insertions ?? 0) + (entry.deletions ?? 0);
  if (!lines) return 8;
  return 8 + 6 * Math.min(1, Math.log10(lines + 1) / 6);
}

function gapLabel(from: Placed, to: Placed): string {
  const days = Math.round(Math.abs(timeOf(to.entry) - timeOf(from.entry)) / DAY);
  return days === 1 ? "1 day" : `${days} days`;
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

  // Date and side. Dots alternate above and below so same-week commits stay apart.
  const placed: Placed[] = sorted.map(({ entry, index, t }, order) => ({
    entry,
    index,
    x: toX(t),
    side: order % 2 === 0 ? "above" : "below",
    depth: 1,
    size: dotSize(entry)
  }));

  // A linked pair is one unit: both dots hang above the axis, where a connector
  // and its caption have the room the month labels take up below.
  const byId = new Map(placed.filter((p) => p.entry.id).map((p) => [p.entry.id!, p]));
  const links: Link[] = [];
  placed.forEach((to) => {
    const from = to.entry.linkFrom ? byId.get(to.entry.linkFrom) : undefined;
    // The arrow is drawn left to right, so it only works pointing forward in time.
    if (!from || from === to || from.x >= to.x) return;
    from.side = "above";
    to.side = "above";
    links.push({ from, to, label: to.entry.linkLabel ?? gapLabel(from, to) });
  });

  // Depth. A dot drops a level when it would touch one already at that level on
  // its side; a linked pair goes past everything its connector spans, so no
  // stem crosses the line.
  const taken: Slot[] = [];
  const clear = (slot: Slot) =>
    !taken.some((t) => t.side === slot.side && t.depth === slot.depth && slot.from - CROWD < t.to && slot.to + CROWD > t.from);

  const paired = new Set(links.flatMap((link) => [link.from, link.to]));
  placed.forEach((p) => {
    if (paired.has(p)) return;
    const slot: Slot = { side: p.side, depth: 1, from: p.x, to: p.x };
    while (slot.depth < MAX_DEPTH && !clear(slot)) slot.depth += 1;
    p.depth = slot.depth;
    taken.push(slot);
  });
  links.forEach((link) => {
    const under = taken.filter((t) => t.side === "above" && link.from.x - CROWD < t.to && link.to.x + CROWD > t.from);
    const depth = Math.min(MAX_DEPTH, Math.max(0, ...under.map((t) => t.depth)) + 1);
    link.from.depth = depth;
    link.to.depth = depth;
    taken.push({ side: "above", depth, from: link.from.x, to: link.to.x });
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

  return { placed, links, ticks, nowX: toX(now) };
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
 * view; a dashed stretch beyond today holds what's planned. Two entries that
 * answer each other — a resume going out, the reply coming back — are joined
 * by a line arrowed at the second, captioned with the days between them.
 * Selecting a dot swaps its card in below. Under 860px the axis gives way to a
 * vertical list of every entry, which is also the reading order for assistive
 * tech; there the pair is joined by a line in the card instead.
 */
export function FeatureTimeline({ entries, screenshots, today, onOpenScreenshot }: FeatureTimelineProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.3);
  const cardId = useId();
  const { placed, links, ticks, nowX } = useMemo(() => layout(entries, today), [entries, today]);

  // Every card reads its own relation, so the connection survives the mobile list.
  const relations = useMemo(
    () => new Map(links.map((link) => [link.to.index, { label: link.label, fromTitle: link.from.entry.title }])),
    [links]
  );
  // Both ends of a connector hold their hover label higher, clear of its caption.
  const linked = useMemo(() => new Set(links.flatMap((link) => [link.from.index, link.to.index])), [links]);

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

        {/* Drawn before the dots so they sit on top of both ends of the line. */}
        {links.map((link) => (
          <span
            key={`link-${link.from.index}-${link.to.index}`}
            className="tl-link"
            aria-hidden="true"
            style={{
              ["--from" as string]: `${link.from.x}%`,
              ["--to" as string]: `${link.to.x}%`,
              ["--from-size" as string]: `${link.from.size}px`,
              ["--to-size" as string]: `${link.to.size}px`,
              ["--depth" as string]: link.to.depth
            }}
          >
            <span className="tl-link-line" />
            <span className="tl-link-label">{link.label}</span>
          </span>
        ))}

        {placed.map((p, order) => {
          const active = p.index === selected;
          return (
            <button
              type="button"
              key={`${p.entry.date}-${p.index}`}
              data-order={order}
              className={`tl-dot tl-dot--${p.entry.era} tl-dot--${p.side}${p.entry.mark === "star" ? " tl-dot--star" : ""}${linked.has(p.index) ? " tl-dot--linked" : ""}${active ? " is-active" : ""}`}
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
            <TimelineCard entry={current.entry} screenshot={shot} relation={relations.get(current.index)} onOpenScreenshot={onOpenScreenshot} />
          </motion.article>
        </AnimatePresence>
      </div>

      {/* --------------------------------------------------- mobile list --- */}
      <ol className="tl-list">
        {placed.map((p) => (
          <li className={`tl-list-item tl-list-item--${p.entry.era}${p.entry.mark === "star" ? " tl-list-item--star" : ""}`} key={`list-${p.entry.date}-${p.index}`}>
            <span className="tl-list-mark" aria-hidden="true" />
            <TimelineCard entry={p.entry} screenshot={p.entry.screenshotId ? screenshots.find((s) => s.id === p.entry.screenshotId) : undefined} relation={relations.get(p.index)} onOpenScreenshot={onOpenScreenshot} compact />
          </li>
        ))}
      </ol>
    </div>
  );
}

function TimelineCard({
  entry,
  screenshot,
  relation,
  onOpenScreenshot,
  compact = false
}: {
  entry: TimelineEntry;
  screenshot?: FeatureScreenshot;
  /** What the axis draws as a connector, said in words for the card and the mobile list. */
  relation?: { label: string; fromTitle: string };
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
      {relation && (
        <p className="tl-card-link">
          <span className="tl-card-link-rule" aria-hidden="true" />
          <span><b>{relation.label}</b> after {relation.fromTitle}</span>
        </p>
      )}
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
