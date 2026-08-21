"use client";

import { useEffect, useId, useRef, useState } from "react";

type GanttChartProps = {
  chart: string;
};

const VISIBLE_DAYS = 20;
const MS_PER_DAY = 86400000;

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
          fontFamily: "var(--font-body)",
          themeVariables: {
            background: "transparent",
            primaryColor: "rgba(255, 138, 61, 0.16)",
            primaryBorderColor: "#ff8a3d",
            primaryTextColor: "#15201f",
            secondaryColor: "rgba(139, 227, 214, 0.35)",
            secondaryBorderColor: "#4fae9d",
            tertiaryColor: "rgba(233, 196, 106, 0.35)",
            lineColor: "#8a9490",
            textColor: "#15201f",
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
      <p className="gantt-chart-error" role="alert">
        The application tracker chart couldn't be rendered. The chart definition may need a check in data/more-info/gantt.md.
      </p>
    );
  }

  return (
    <div className="gantt-chart-wrap">
      <div
        className="gantt-chart"
        ref={containerRef}
        role="img"
        aria-label="Job application Gantt chart"
      />
    </div>
  );
}
