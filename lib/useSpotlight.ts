"use client";

import { useCallback, type PointerEvent } from "react";

/**
 * Writes the cursor position into --sx/--sy on the element so CSS can draw
 * a spotlight that follows it (see .bp-spot in blueprint.css). No React
 * state per move — the browser repaints the gradient directly.
 */
export function useSpotlight() {
  return useCallback((e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }, []);
}
