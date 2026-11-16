"use client";

import { useEffect, useRef } from "react";

/**
 * The sheet under every page: a field of plus marks, one per grid node, whose
 * arms reach out until they meet their neighbours and close the squares of
 * graph paper, then draw back.
 *
 * What moves them is ripples. Every so often one to three points somewhere on
 * (or just off) the sheet start a ring that travels outward at its own speed
 * and width. A ring is a crest with a trough behind it, and a node's arm
 * length is the SUM of every ring passing over it, so two crests that cross
 * close the squares fully and a crest meeting a trough cancels back to a plus,
 * the way waves on water do.
 *
 * `loopSeconds` (Site Settings → Motion → Grid loop) is how long a typical
 * ring takes to cross the window; new rings start in proportion, so one number
 * speeds up or slows down the whole field.
 *
 * `pointer` turns on the pen: the mouse snaps to the nearest grid node and
 * draws one continuous line along the grid lines as it moves, an etched trace
 * with a glow that fades from its tail over `trailSeconds` (Site Settings →
 * Motion → Pen trail). Mouse only, and off under reduced motion.
 *
 * One canvas; the grid is one path and one stroke per frame, so its cost is
 * the node count (about 2,000 on a desktop window) and does not grow with the
 * page. It is fixed to the window, above the bloom and under every tile,
 * pauses with the tab, draws still graph paper under prefers-reduced-motion,
 * and is hidden in print (.plot-grid in glass-tile.css).
 */

type Ripple = { x: number; y: number; speed: number; width: number; amp: number; reach: number; born: number };
/** One grid step of the pen's line, in node coordinates, and when it was drawn. */
type Edge = { ax: number; ay: number; bx: number; by: number; born: number };

const REST = 0.16; // arm length of a plus at rest, as a share of half a cell
const MAX_RIPPLES = 6;
const MAX_EDGES = 600;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export function PlotGrid({
  loopSeconds = 8,
  pointer = true,
  trailSeconds = 4
}: {
  loopSeconds?: number;
  pointer?: boolean;
  trailSeconds?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const loop = Math.min(30, Math.max(2, Number(loopSeconds) || 8));
    const trail = Math.min(30, Math.max(0.5, Number(trailSeconds) || 4));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scope = canvas.closest(".bp") ?? document.documentElement;

    let width = 0;
    let height = 0;
    let cell = 32;
    let color = "#2457e6";
    let alpha = 0.15;
    let frame = 0;
    let last = 0;
    let clock = 0;
    let nextSpawn = 0;
    let ripples: Ripple[] = [];
    // The pen: the grid node it last snapped to, and the line it has etched so far (oldest step first).
    let pen: [number, number] | null = null;
    let edges: Edge[] = [];

    function readTheme() {
      color = getComputedStyle(scope).getPropertyValue("--accent").trim() || color;
      alpha = document.documentElement.dataset.theme === "dark" ? 0.2 : 0.15;
    }

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cell = width < 700 ? 24 : 32;
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      // The line is stored in grid steps, so a new cell size would redraw it somewhere else.
      edges = [];
      pen = null;
      if (reduce.matches) draw();
    }

    function spawn() {
      // Usually one source; sometimes two or three start together and cross straight away.
      const roll = Math.random();
      const count = roll < 0.58 ? 1 : roll < 0.88 ? 2 : 3;
      const travel = Math.hypot(width, height);
      for (let n = 0; n < count && ripples.length < MAX_RIPPLES; n++) {
        const x = rand(-0.1, 1.1) * width;
        const y = rand(-0.1, 1.1) * height;
        const ringWidth = cell * rand(1.5, 3.2);
        const reach = Math.max(
          Math.hypot(x, y), Math.hypot(width - x, y), Math.hypot(x, height - y), Math.hypot(width - x, height - y)
        ) + ringWidth * 3;
        ripples.push({ x, y, speed: travel / (loop * rand(0.7, 1.7)), width: ringWidth, amp: rand(0.6, 1.05), reach, born: clock });
      }
      nextSpawn = clock + loop * rand(0.1, 0.5);
    }

    function draw() {
      const still = reduce.matches;
      const cols = Math.ceil(width / cell) + 1;
      const rows = Math.ceil(height / cell) + 1;
      const half = cell / 2;

      // Each ring's radius and strength this frame; a ring weakens as it spreads and is dropped once it has left the sheet.
      const live: number[] = [];
      if (!still) {
        ripples = ripples.filter((ripple) => (clock - ripple.born) * ripple.speed < ripple.reach);
        for (const ripple of ripples) {
          const radius = (clock - ripple.born) * ripple.speed;
          const fade = Math.pow(1 - radius / ripple.reach, 0.6);
          live.push(ripple.x, ripple.y, radius, ripple.width, ripple.amp * fade);
        }
      }

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineWidth = 1;
      ctx!.strokeStyle = color;
      ctx!.globalAlpha = still ? alpha * 0.6 : alpha;
      ctx!.beginPath();
      for (let row = 0; row < rows; row++) {
        const y = Math.round(row * cell) + 0.5;
        for (let col = 0; col < cols; col++) {
          const x = Math.round(col * cell) + 0.5;
          let reach = 1;
          if (!still) {
            let sum = 0;
            for (let i = 0; i < live.length; i += 5) {
              const dx = x - live[i];
              const dy = y - live[i + 1];
              const u = (Math.sqrt(dx * dx + dy * dy) - live[i + 2]) / live[i + 3];
              if (u > 3 || u < -4.7) continue;
              const trough = u + 1.7;
              sum += live[i + 4] * (Math.exp(-u * u) - 0.45 * Math.exp(-trough * trough));
            }
            reach = REST + (1 - REST) * sum;
            if (reach < 0.05) reach = 0.05;
            else if (reach > 1) reach = 1;
          }
          const arm = reach * half;
          ctx!.moveTo(x - arm, y);
          ctx!.lineTo(x + arm, y);
          ctx!.moveTo(x, y - arm);
          ctx!.lineTo(x, y + arm);
        }
      }
      ctx!.stroke();
      if (!still) drawTrail();
    }

    /* The pen's line. Each step fades out `trail` seconds after it was drawn, so the line shortens
       from its tail. Every step is stroked twice, a wide soft pass under a crisp one, both casting a
       shadow in the line's own colour: that pair is the glow. */
    function drawTrail() {
      if (edges.length === 0) return;
      edges = edges.filter((edge) => clock - edge.born < trail);
      ctx!.save();
      ctx!.lineCap = "round";
      ctx!.strokeStyle = color;
      ctx!.shadowColor = color;
      for (const edge of edges) {
        const strength = Math.min(1, (1 - (clock - edge.born) / trail) * 1.5);
        ctx!.beginPath();
        ctx!.moveTo(Math.round(edge.ax * cell) + 0.5, Math.round(edge.ay * cell) + 0.5);
        ctx!.lineTo(Math.round(edge.bx * cell) + 0.5, Math.round(edge.by * cell) + 0.5);
        ctx!.shadowBlur = 14;
        ctx!.lineWidth = 4;
        ctx!.globalAlpha = 0.22 * strength;
        ctx!.stroke();
        ctx!.shadowBlur = 6;
        ctx!.lineWidth = 1.5;
        ctx!.globalAlpha = 0.95 * strength;
        ctx!.stroke();
      }
      // The pen's tip, for a second after it last moved.
      const head = edges[edges.length - 1];
      if (pen && head && clock - head.born < 1) {
        ctx!.globalAlpha = 1 - (clock - head.born);
        ctx!.shadowBlur = 12;
        ctx!.fillStyle = color;
        ctx!.beginPath();
        ctx!.arc(Math.round(pen[0] * cell) + 0.5, Math.round(pen[1] * cell) + 0.5, 2.5, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.restore();
    }

    function tick(time: number) {
      frame = requestAnimationFrame(tick);
      // A tab that was in the background comes back with one long frame; never jump the field forward by it.
      const delta = Math.min(0.1, (time - last) / 1000 || 0);
      last = time;
      clock += delta;
      if (clock >= nextSpawn) spawn();
      draw();
    }

    function start() {
      cancelAnimationFrame(frame);
      if (reduce.matches) draw();
      else frame = requestAnimationFrame(tick);
    }

    function onPointer(event: PointerEvent) {
      if (!pointer || event.pointerType !== "mouse" || reduce.matches) return;
      const col = Math.round(event.clientX / cell);
      const row = Math.round(event.clientY / cell);
      // A first move, or a jump (the mouse left the window and came back elsewhere), starts a new line.
      if (!pen || Math.abs(col - pen[0]) + Math.abs(row - pen[1]) > 24) {
        pen = [col, row];
        return;
      }
      // Walk from the last node to this one a grid step at a time, along whichever axis has further to go.
      let [i, j] = pen;
      while (i !== col || j !== row) {
        const fromI = i;
        const fromJ = j;
        if (Math.abs(col - i) >= Math.abs(row - j)) i += Math.sign(col - i);
        else j += Math.sign(row - j);
        edges.push({ ax: fromI, ay: fromJ, bx: i, by: j, born: clock });
      }
      if (edges.length > MAX_EDGES) edges = edges.slice(-MAX_EDGES);
      pen = [col, row];
    }

    function onLeave() {
      pen = null;
    }

    const themeWatch = new MutationObserver(() => { readTheme(); if (reduce.matches) draw(); });
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    readTheme();
    resize();
    start();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    reduce.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(frame);
      themeWatch.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      reduce.removeEventListener("change", start);
    };
  }, [loopSeconds, pointer, trailSeconds]);

  return <canvas ref={ref} className="plot-grid" aria-hidden="true" />;
}
