"use client";

import { useEffect, useRef, useState } from "react";

/**
 * True once the element has been at least `amount` visible, then stays true.
 * The CSS-side sibling of Reveal's `viewport.once` — for lists where a
 * framer wrapper per item is overkill and a class toggle does the job.
 * SSR-safe; falls open if IntersectionObserver is missing so content is
 * never hidden.
 */
export function useInViewOnce<T extends HTMLElement>(amount = 0.2, margin = "0px 0px -60px 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: amount, rootMargin: margin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount, margin]);

  return { ref, inView };
}
