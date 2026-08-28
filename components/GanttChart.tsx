"use client";

import { useEffect, useId, useRef, useState } from "react";

type GanttChartProps = {
  chart: string;
};

const VISIBLE_DAYS = 20;
const MS_PER_DAY = 86400000;

/** Mermaid's palette, matched to the Blueprint Press tokens in blueprint.css. */
const THEME = {
  primaryColor: "rgba(227, 52, 47, 0.14)",
  primaryBorderColor: "#e3342f",
  primaryTextColor: "#0b1a2b",
  secondaryColor: "rgba(47, 134, 196, 0.18)",
  secondaryBorderColor: "#2f86c4",
  tertiaryColor: "rgba(11, 26, 43, 0.10)",
  lineColor: "#b9c2cb",
  textColor: "#0b1a2b"
} as const;

function countTotalDays(chart: string): number {
  const taskPattern = /(\d{4}-\d{2}-\d{2}),\s*(\d+)d/g;
  let match: RegExpExecArray | null;
  let minStart: number | null = null;
  let maxEnd: number | null = null;

  while ((match = taskPattern.exec(chart)) !== null) {
    const start = new Date(match[1]).getTime();
    const end = start + Number(match[2]) * MS_PER_DAY;
    if (minStart === null || start < minStart) minStart = start;
    if (maxEnd === null || end > maxEnd) maxEnd = end;
  }

  return minStart !== null && maxEnd !== null
    ? Math.max(1, Math.ceil((maxEnd - minStart) / MS_PER_DAY))
    : 1;
}

export function GanttChart({ chart }: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartId = `gantt-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!chart) return;
    let cancelled = false;

    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "strict",
          fontFamily: "var(--bp-font-body)",
          themeVariables: {
            background: "transparent",
            ...THEME,
            fontSize: "13px"
          },
          gantt: {
            fontSize: 13,
            sectionFontSize: 13,
            barHeight: 22,
            barGap: 6,
            topPadding: 42,
            leftPadding: 96,
            gridLineStartPadding: 32,
            numberSectionStyles: 4
          }
        });

        const { svg } = await mermaid.render(chartId, chart);
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (!svgEl) return;

        const naturalWidth = svgEl.width.baseVal.value;
        const naturalHeight = svgEl.height.baseVal.value;
        const availableWidth = containerRef.current.clientWidth;

        const totalDays = countTotalDays(chart);

        const scale =
          naturalWidth > 0 ? availableWidth / ((naturalWidth / totalDays) * VISIBLE_DAYS) : 1;

        const scaledWidth = naturalWidth * scale;
        const scaledHeight = naturalHeight * scale;

        svgEl.style.maxWidth = "none";
        svgEl.setAttribute("width", String(scaledWidth));
        svgEl.setAttribute("height", String(scaledHeight));
        containerRef.current.style.maxHeight = `${scaledHeight}px`;
      } catch (renderError) {
        console.error("Unable to render the Gantt chart.", renderError);
        if (!cancelled) setError(true);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, chartId]);

  if (!chart) return null;

  if (error) {
    return (
      <p className="bp-gantt-error" role="alert">
        The application tracker chart couldn't be rendered. The chart definition may need a check in data/more-info/gantt.md.
      </p>
    );
  }

  return (
    <div className="bp-gantt-wrap">
      <div
        className="bp-gantt"
        ref={containerRef}
        role="img"
        aria-label="Job application Gantt chart"
      />
    </div>
  );
}
