"use client";

import { useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FeatureScreenshot, TimelineEntry } from "@/types/resume";
import { formatDate, isIsoDate, parseIsoDate } from "@/lib/dates";
import { REPO_URL } from "@/lib/site";
import { useInViewOnce } from "@/lib/useInViewOnce";
import { Reveal } from "@/components/blueprint/Reveal";
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

/** How long the tour rests on each entry before stepping one dot to the right. */
const DWELL_MS = 6000;
/** The tour only runs while at least this much of the timeline is on screen. */
const TOUR_VISIBLE = 0.35;
/** Below this the axis and card give way to the list (feature.css), and the tour has nothing to drive. */
const TOUR_MEDIA = "(min-width: 861px)";
/** The longest gap one frame may add to the dwell, so a background tab doesn't skip entries on return. */
const MAX_FRAME_MS = 100;

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

/** The ring is a circle with pathLength 1, so the dash offset is simply how much is left to fill. */
function paintRing(ring: SVGCircleElement | null, progress: number) {
  if (ring) ring.style.strokeDashoffset = String(1 - progress);
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
  /** The line under the block title. Lives here so the tour control can share its row. */
  note?: string;
  onOpenScreenshot: (id: string) => void;
};

/**
 * The commit history as a time axis: dots placed by date (quiet weeks read
 * as space), sized by how much a commit changed, above and below the line so
 * same-day commits never overlap. The solid stretch is the past and fills on
 * view; a dashed stretch beyond today holds what's planned. Two entries that
 * answer each other — a resume going out, the reply coming back — are joined
 * by a line arrowed at the second, captioned with the days between them.
 * Selecting a dot swaps its card in below.
 *
 * Left alone, the timeline gives a tour of itself: once on screen it rests on
 * each entry for DWELL_MS, earliest to latest, then wraps. A round pause/play
 * button beside the note wears the dwell as a ring that fills clockwise, so
 * how long the current entry has left is visible at a glance. Pausing holds
 * the ring where it is; choosing a dot, or tabbing into the timeline, ends the
 * tour where the visitor is. With reduced motion nothing plays unless asked.
 * Under 860px the axis gives way to a vertical list of every entry, which is
 * also the reading order for assistive tech; there the pair is joined by a
 * line in the card instead, and there is no tour.
 */
export function FeatureTimeline({ entries, screenshots, today, note, onOpenScreenshot }: FeatureTimelineProps) {
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

  // The tour starts from the left, so that is where the page opens too. The
  // present entry (failing that, the latest shipped one) is where a visitor
  // who asked for reduced motion lands instead, since for them nothing plays.
  const resting = placed.find((p) => p.entry.era === "present") ?? [...placed].reverse().find((p) => p.entry.era === "past") ?? placed[0];
  const [selected, setSelected] = useState<number>(placed[0]?.index ?? 0);
  const [playing, setPlaying] = useState(true);
  const restingIndex = resting?.index;
  useEffect(() => {
    if (!reduced || restingIndex === undefined) return;
    setPlaying(false);
    setSelected(restingIndex);
  }, [reduced, restingIndex]);

  const current = placed.find((p) => p.index === selected) ?? placed[0];
  const orderOf = (index: number) => placed.findIndex((p) => p.index === index);

  const ringRef = useRef<SVGCircleElement>(null);
  const tourRef = useRef<HTMLDivElement>(null);
  /** Milliseconds spent on the current entry. Survives a pause; a choice resets it. */
  const elapsed = useRef(0);

  // A choice by the visitor ends the tour where they are. The ring empties, so
  // a later Play gives this entry a full dwell.
  const choose = (index: number) => {
    setSelected(index);
    setPlaying(false);
    elapsed.current = 0;
    paintRing(ringRef.current, 0);
  };

  // Keyboard focus landing anywhere in the timeline but its own control also
  // pauses the tour, so the card can't swap out from under someone tabbing
  // through it. The ring holds; Play resumes.
  const onRootFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (playing && !tourRef.current?.contains(event.target as Node)) setPlaying(false);
  };

  // The tour. While playing, on screen, and at a width that shows the axis, a
  // frame loop fills the ring over the dwell and then steps one dot right,
  // wrapping at the end. Time is added per frame and capped, so a background
  // tab or a scroll away doesn't skip entries on return. Only the ring is
  // touched per frame; React renders once per step.
  useEffect(() => {
    const root = ref.current;
    if (!playing || placed.length < 2 || !root || typeof IntersectionObserver === "undefined") return;
    const wide = window.matchMedia(TOUR_MEDIA);
    let visible = false;
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      elapsed.current += Math.min(now - last, MAX_FRAME_MS);
      last = now;
      const progress = Math.min(1, elapsed.current / DWELL_MS);
      paintRing(ringRef.current, progress);
      if (progress >= 1) {
        elapsed.current = 0;
        setSelected((index) => placed[(placed.findIndex((p) => p.index === index) + 1) % placed.length].index);
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      const run = visible && wide.matches;
      if (run && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      } else if (!run && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && entry.intersectionRatio >= TOUR_VISIBLE;
        sync();
      },
      { threshold: [0, TOUR_VISIBLE] }
    );
    io.observe(root);
    wide.addEventListener("change", sync);
    return () => {
      io.disconnect();
      wide.removeEventListener("change", sync);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [playing, placed, ref]);

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
    choose(target.index);
    (event.currentTarget.querySelector<HTMLButtonElement>(`[data-order="${next}"]`))?.focus();
  };

  if (!current) return null;

  const shot = current.entry.screenshotId ? screenshots.find((s) => s.id === current.entry.screenshotId) : undefined;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div ref={ref} className={`tl${inView ? " is-in" : ""}`} onFocus={onRootFocus}>
      {/* ------------------------------------------------- note and tour --- */}
      <div className="tl-head">
        {note && <Reveal delay={0.06}><p className="ft-block-note">{note}</p></Reveal>}
        <Reveal delay={0.12} as="fade" className="tl-tour-slot">
          <div className="tl-tour" ref={tourRef}>
            <span className="tl-tour-label">
              {playing ? "Playing" : "Paused"}
              <span className="tl-tour-count">{pad(orderOf(current.index) + 1)} / {pad(placed.length)}</span>
            </span>
            <button
              type="button"
              className="tl-tour-btn"
              data-state={playing ? "playing" : "paused"}
              aria-label={playing ? "Pause the timeline" : "Play the timeline"}
              onClick={() => setPlaying((value) => !value)}
            >
              <svg className="tl-tour-ring" viewBox="0 0 36 36" aria-hidden="true">
                <circle className="tl-tour-track" cx="18" cy="18" r="16.5" />
                <circle ref={ringRef} className="tl-tour-fill" cx="18" cy="18" r="16.5" pathLength={1} />
              </svg>
              <svg className="tl-tour-icon" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true">
                {playing ? (
                  <path d="M3.2 1.5v8M7.8 1.5v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                ) : (
                  <path d="M3.1 1.4v8.2L9.6 5.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </Reveal>
      </div>

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
              onClick={() => choose(p.index)}
              onFocus={() => choose(p.index)}
            >
              <span className="tl-dot-stem" aria-hidden="true" />
              <span className="tl-dot-mark" aria-hidden="true" />
              <span className="tl-dot-label" aria-hidden="true">{p.entry.title}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------- selected card --- */}
      {/* Live only while the visitor is driving: a tour that announced every step would never stop talking. */}
      <div className="tl-card-slot" id={cardId} aria-live={playing ? "off" : "polite"}>
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
      <h3 className="tl-card-title">{entry.title}</h3>
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
