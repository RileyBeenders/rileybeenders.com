"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NODE_HEIGHT, type FlowDiagramSpec, type FlowEdge, type FlowNode } from "@/components/projects/diagrams/flows";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** Gap between an arrow's tip and the box it points at. */
const ARROW_GAP = 10;
const NODE_WIDTH = 260;

/** Entrance: one box every `STEP` seconds, its outgoing arrows drawing right after it. */
const STEP = 0.11;
const ARROW_LAG = 0.14;

/** The pulse: how long it takes to travel one arrow, and how long it rests before going round again. */
const PULSE_SLOT = 0.55;
const PULSE_REST = 2.4;

type Rect = { x: number; y: number; w: number; h: number };

type Arrow = {
  edge: FlowEdge;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Rotation that turns a downward chevron into the arrow's direction. */
  angle: number;
  /** Where the entrance sequence places it: right after its source box. */
  delay: number;
};

function rectOf(node: FlowNode): Rect {
  return { x: node.x, y: node.y, w: node.w ?? NODE_WIDTH, h: NODE_HEIGHT };
}

/**
 * Arrows run box edge to box edge: down from the bottom centre when the
 * target is below, or across from the side when the two boxes share a row.
 */
function layoutArrow(edge: FlowEdge, from: Rect, to: Rect, delay: number): Arrow {
  const sameRow = from.y < to.y + to.h && to.y < from.y + from.h;
  if (sameRow) {
    const y = from.y + from.h / 2;
    return to.x > from.x
      ? { edge, x1: from.x + from.w, y1: y, x2: to.x - ARROW_GAP, y2: y, angle: -90, delay }
      : { edge, x1: from.x, y1: y, x2: to.x + to.w + ARROW_GAP, y2: y, angle: 90, delay };
  }
  return { edge, x1: from.x + from.w / 2, y1: from.y + from.h, x2: to.x + to.w / 2, y2: to.y - ARROW_GAP, angle: 0, delay };
}

function layout(spec: FlowDiagramSpec) {
  const rects = new Map(spec.nodes.map((node) => [node.id, rectOf(node)]));
  const order = new Map(spec.nodes.map((node, index) => [node.id, index]));
  const arrows = spec.edges.map((edge) => {
    const from = rects.get(edge.from);
    const to = rects.get(edge.to);
    if (!from || !to) throw new Error(`Flow edge ${edge.from} → ${edge.to} names an unknown box.`);
    return layoutArrow(edge, from, to, (order.get(edge.from) ?? 0) * STEP + ARROW_LAG);
  });
  return { rects, order, arrows };
}

function Box({ node, rect }: { node: FlowNode; rect: Rect }) {
  const cx = rect.x + rect.w / 2;
  return (
    <>
      <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx="3" />
      <text className="pj-flow-title" x={cx} y={rect.y + 20} textAnchor="middle" dominantBaseline="central">{node.title}</text>
      <text className="pj-flow-detail" x={cx} y={rect.y + 38} textAnchor="middle" dominantBaseline="central">{node.detail}</text>
    </>
  );
}

function ArrowLabel({ arrow }: { arrow: Arrow }) {
  if (!arrow.edge.label) return null;
  const vertical = arrow.angle === 0;
  return vertical
    ? <text className="pj-flow-label" x={arrow.x1 - 14} y={(arrow.y1 + arrow.y2) / 2} textAnchor="end" dominantBaseline="central">{arrow.edge.label}</text>
    : <text className="pj-flow-label" x={(arrow.x1 + arrow.x2) / 2} y={arrow.y1 - 14} textAnchor="middle" dominantBaseline="central">{arrow.edge.label}</text>;
}

function Chevron({ arrow }: { arrow: Arrow }) {
  return <path className="pj-flow-head" d="M-4.5 -6 L0 0 L4.5 -6" transform={`translate(${arrow.x2} ${arrow.y2}) rotate(${arrow.angle})`} />;
}

function Legend({ spec }: { spec: FlowDiagramSpec }) {
  const y = spec.height - 30;
  let x = 40;
  return (
    <g className="pj-flow-legend">
      {spec.legend.map((entry) => {
        const at = x;
        x += 20 + entry.label.length * 6.6 + 30;
        return (
          <g key={entry.tone} className={`pj-flow-node pj-flow-node--${entry.tone}`}>
            <rect x={at} y={y - 6} width="12" height="12" rx="2" />
            <text className="pj-flow-label" x={at + 18} y={y} dominantBaseline="central">{entry.label}</text>
          </g>
        );
      })}
    </g>
  );
}

/**
 * A dot that runs each arrow in turn, then rests, then goes again — the
 * "how it flows" on top of the drawn chart. One keyframed circle per arrow,
 * all sharing one cycle so they hand off to each other: opacity steps up as
 * the dot's slot starts and off as it ends, and the position tweens across
 * the arrow in between.
 */
function Pulse({ arrows, cycle }: { arrows: Arrow[]; cycle: number }) {
  const step = 0.002;
  return (
    <g className="pj-flow-pulse" aria-hidden="true">
      {arrows.map((arrow, index) => {
        const start = (index * PULSE_SLOT + 0.05) / cycle;
        const end = ((index + 1) * PULSE_SLOT + 0.05) / cycle;
        return (
          <motion.circle
            key={`${arrow.edge.from}-${arrow.edge.to}`}
            r="4"
            initial={{ opacity: 0, cx: arrow.x1, cy: arrow.y1 }}
            animate={{
              opacity: [0, 0, 1, 1, 0, 0],
              cx: [arrow.x1, arrow.x1, arrow.x1, arrow.x2, arrow.x2, arrow.x2],
              cy: [arrow.y1, arrow.y1, arrow.y1, arrow.y2, arrow.y2, arrow.y2]
            }}
            transition={{
              duration: cycle,
              times: [0, start - step, start, end, end + step, 1],
              ease: "linear",
              repeat: Infinity,
              // Let the chart finish drawing before the first run.
              delay: arrows.length * STEP + 0.9
            }}
          />
        );
      })}
    </g>
  );
}

const boxVariants = {
  hidden: { opacity: 0, y: 10 },
  shown: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay } })
};
const lineVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  shown: (delay: number) => ({ pathLength: 1, opacity: 1, transition: { duration: 0.45, ease: EASE, delay } })
};
const headVariants = {
  hidden: { opacity: 0 },
  shown: (delay: number) => ({ opacity: 1, transition: { duration: 0.25, ease: EASE, delay: delay + 0.32 } })
};

/**
 * A flowchart drawn inline from a `FlowDiagramSpec`, in the site's palette
 * so it follows the theme. Boxes settle in one after another, their arrows
 * draw behind them, and a pulse then travels the path on a loop. Reduced
 * motion gets the finished chart, still.
 */
export function FlowDiagram({ spec, title }: { spec: FlowDiagramSpec; title: string }) {
  const reduced = useReducedMotion();
  const { rects, order, arrows } = layout(spec);
  const cycle = arrows.length * PULSE_SLOT + PULSE_REST;
  const viewBox = `0 0 ${spec.width} ${spec.height}`;

  if (reduced) {
    return (
      <svg className="pj-flow" viewBox={viewBox} role="img" aria-label={title}>
        {arrows.map((arrow) => (
          <g key={`${arrow.edge.from}-${arrow.edge.to}`}>
            <line className="pj-flow-line" x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} />
            <Chevron arrow={arrow} />
            <ArrowLabel arrow={arrow} />
          </g>
        ))}
        {spec.nodes.map((node) => (
          <g key={node.id} className={`pj-flow-node pj-flow-node--${node.tone}`}>
            <Box node={node} rect={rects.get(node.id)!} />
          </g>
        ))}
        <Legend spec={spec} />
      </svg>
    );
  }

  return (
    <motion.svg
      className="pj-flow"
      viewBox={viewBox}
      role="img"
      aria-label={title}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.25, margin: "0px 0px -80px 0px" }}
    >
      {arrows.map((arrow) => (
        <g key={`${arrow.edge.from}-${arrow.edge.to}`}>
          <motion.line
            className="pj-flow-line"
            x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2}
            variants={lineVariants}
            custom={arrow.delay}
          />
          <motion.g variants={headVariants} custom={arrow.delay}>
            <Chevron arrow={arrow} />
            <ArrowLabel arrow={arrow} />
          </motion.g>
        </g>
      ))}
      {spec.nodes.map((node) => (
        <motion.g
          key={node.id}
          className={`pj-flow-node pj-flow-node--${node.tone}`}
          variants={boxVariants}
          custom={(order.get(node.id) ?? 0) * STEP}
        >
          <Box node={node} rect={rects.get(node.id)!} />
        </motion.g>
      ))}
      <motion.g variants={boxVariants} custom={spec.nodes.length * STEP}>
        <Legend spec={spec} />
      </motion.g>
      <Pulse arrows={arrows} cycle={cycle} />
    </motion.svg>
  );
}
