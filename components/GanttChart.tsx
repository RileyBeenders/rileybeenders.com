"use client";

import { useEffect, useId, useRef, useState } from "react";

type GanttChartProps = {
  chart: string;
};

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
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
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
      <div className="gantt-chart" ref={containerRef} role="img" aria-label="Job application Gantt chart" />
    </div>
  );
}
