"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "framer-motion";

type CountUpProps = {
  to: number;
  from?: number;
  /** Seconds; sets the spring the way svelte-bits' Count Up does. */
  duration?: number;
  /** Decimal places to show. Defaults to whatever `to` has. */
  decimals?: number;
  className?: string;
};

function format(value: number, decimals: number) {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

/**
 * A number that springs from `from` to `to` the first time it scrolls into
 * view. Tabular digits so the width doesn't jitter while it counts. Reduced
 * motion renders the final value straight away.
 */
export function CountUp({ to, from = 0, duration = 2, decimals, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const places = decimals ?? (String(to).split(".")[1]?.length ?? 0);

  const raw = useMotionValue(from);
  const value = useSpring(raw, { stiffness: 100 / duration, damping: 20 + 40 / duration });

  useEffect(() => {
    if (inView && !reduced) raw.set(to);
  }, [inView, raw, reduced, to]);

  useMotionValueEvent(value, "change", (latest) => {
    if (ref.current) ref.current.textContent = format(latest, places);
  });

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }} aria-live="polite">
      {format(reduced ? to : from, places)}
    </span>
  );
}
