"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/components/blueprint/ThemeProvider";

type GanttChartProps = {
  chart: string;
};

/** Days of the timeline visible at once; the chart opens scrolled to the newest. */
const VISIBLE_DAYS = 21;
const MS_PER_DAY = 86400000;

/**
 * Mermaid's gantt layout, shared with the chart-width math below: the time
 * axis runs from `leftPadding` (the section-label column) to
 * `width - rightPadding`.
 */
const GANTT_LAYOUT = {
  leftPadding: 96,
  rightPadding: 75
} as const;

/**
 * Mermaid bakes colors into the SVG it returns rather than consuming CSS
 * variables, so the light/dark palettes are duplicated here to match the
 * `--ink`/`--paper`/etc. tokens in blueprint.css.
 *
 * The site's accent and secondary-blue tokens are the same electric blue now
 * (see lib/palettes.ts "electric"), so it alone can't separate the chart's two
 * task sections. Primary sections stay accent blue; secondary sections use a
 * neutral ink-gray instead of a second blue, keeping the one-accent palette.
 */
const THEME_LIGHT = {
  primaryColor: "rgba(62, 106, 225, 0.14)",
  primaryBorderColor: "#3e6ae1",
  primaryTextColor: "#171a20",
  secondaryColor: "rgba(23, 26, 32, 0.08)",
  secondaryBorderColor: "#5c5e62",
  tertiaryColor: "rgba(23, 26, 32, 0.10)",
  lineColor: "#c7ccd1",
  textColor: "#171a20",
  // Mermaid's "done" task styling doesn't derive from the colors above, so it
  // needs an explicit pin — otherwise the dark palette below inherits
  // mermaid's default lightgrey bar, which near-white task text disappears on.
  doneTaskBkgColor: "lightgrey",
  doneTaskBorderColor: "grey"
} as const;

const THEME_DARK = {
  primaryColor: "rgba(62, 106, 225, 0.28)",
  primaryBorderColor: "#3e6ae1",
  primaryTextColor: "#ffffff",
  secondaryColor: "rgba(255, 255, 255, 0.08)",
  secondaryBorderColor: "#999999",
  tertiaryColor: "rgba(255, 255, 255, 0.08)",
  lineColor: "#4d4d4d",
  textColor: "#ffffff",
  doneTaskBkgColor: "#2a2a2a",
  doneTaskBorderColor: "#666666"
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
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartId = `gantt-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!chart) return;
    let cancelled = false;

    async function render() {
      try {
        const { default: mermaid } = await import("mermaid");
        const container = containerRef.current;
        if (!container) return;

        // Draw the chart wide enough that VISIBLE_DAYS days (plus the right
        // padding) fill the box, rather than scaling the SVG afterwards: bars
        // and labels keep their size and only the time axis stretches. A chart
        // shorter than the window just fits the box.
        const availableWidth = container.clientWidth;
        const totalDays = countTotalDays(chart);
        const dayWidth = (availableWidth - GANTT_LAYOUT.rightPadding) / VISIBLE_DAYS;
        const chartWidth =
          totalDays > VISIBLE_DAYS
            ? Math.round(GANTT_LAYOUT.leftPadding + GANTT_LAYOUT.rightPadding + dayWidth * totalDays)
            : availableWidth;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "strict",
          fontFamily: "var(--bp-font-body)",
          themeVariables: {
            background: "transparent",
            ...(theme === "dark" ? THEME_DARK : THEME_LIGHT),
            fontSize: "13px"
          },
          gantt: {
            fontSize: 13,
            sectionFontSize: 13,
            barHeight: 22,
            barGap: 6,
            topPadding: 42,
            ...GANTT_LAYOUT,
            useWidth: chartWidth,
            useMaxWidth: false,
            gridLineStartPadding: 32,
            numberSectionStyles: 4
          }
        });

        const { svg } = await mermaid.render(chartId, chart);
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (!svgEl) return;

        containerRef.current.style.maxHeight = `${svgEl.viewBox.baseVal.height}px`;
        // Open on the newest applications: the latest dates are at the right
        // and the latest rows (and the date axis) at the bottom. Earlier
        // history scrolls into view from the left and top.
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      } catch (renderError) {
        console.error("Unable to render the Gantt chart.", renderError);
        if (!cancelled) setError(true);
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [chart, chartId, theme]);

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
