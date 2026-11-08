"use client";

import { useEffect } from "react";

/**
 * Inertial wheel scrolling: each wheel tick moves a target, and the page
 * eases toward it instead of jumping, so starting and stopping feel like a
 * glide rather than a step. No library, no transform on the page (the native
 * scrollbar, anchors and scroll-driven animations all keep working), and it
 * steps aside wherever the browser should win: touch and pen input, pinch
 * zoom, reduced motion, anything that scrolls on its own (the project
 * dialog, the full-screen viewer, a wide table), and while the page is
 * locked under a dialog. Site Settings → Motion → Smooth scrolling.
 */

const EASE = 0.11;
const MAX_STEP = 1.4; // of the viewport, per wheel event — tames free-spinning wheels
const SETTLE = 0.4;

function nativeScrollsFor(start: EventTarget | null, deltaY: number): boolean {
  let el = start instanceof Element ? start : null;
  while (el && el !== document.body && el !== document.documentElement) {
    const style = getComputedStyle(el);
    const scrolls = /(auto|scroll)/.test(style.overflowY);
    if (scrolls && el.scrollHeight > el.clientHeight + 1) {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
    }
    if (el.hasAttribute("data-native-scroll")) return true;
    el = el.parentElement;
  }
  return false;
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let target = window.scrollY;
    let current = target;
    let frame = 0;
    let driving = false;
    let lastTick = 0;

    const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    const step = () => {
      lastTick = performance.now();
      const diff = target - current;
      if (Math.abs(diff) < SETTLE) {
        current = target;
        window.scrollTo(0, current);
        frame = 0;
        driving = false;
        return;
      }
      current += diff * EASE;
      window.scrollTo(0, current);
      frame = requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || event.metaKey) return; // pinch / zoom gestures
      if (document.documentElement.hasAttribute("data-lock")) return;
      if (nativeScrollsFor(event.target, event.deltaY)) return;
      // Line- or page-based deltas (some mice, Firefox settings) are scaled to pixels.
      const unit = event.deltaMode === 1 ? 32 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = Math.max(-window.innerHeight * MAX_STEP, Math.min(window.innerHeight * MAX_STEP, event.deltaY * unit));
      event.preventDefault();
      // A background tab (or a stalled frame loop) never ticks; rather than
      // swallow the wheel, land the page where it was headed.
      if (driving && performance.now() - lastTick > 160) {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        driving = false;
        current = window.scrollY;
        target = Math.max(0, Math.min(maxScroll(), current + delta));
        window.scrollTo(0, target);
        current = target;
        return;
      }
      if (!driving) {
        // Pick up from wherever the page actually is (a keyboard or scrollbar scroll may have moved it).
        current = window.scrollY;
        target = current;
        driving = true;
        lastTick = performance.now();
      }
      target = Math.max(0, Math.min(maxScroll(), target + delta));
      if (!frame) frame = requestAnimationFrame(step);
    };

    // Anything else that moves the page (keys, the scrollbar, an anchor, a
    // programmatic scrollTo) resets the glide so it never fights the user.
    const onScroll = () => {
      if (!driving) {
        current = window.scrollY;
        target = current;
      }
    };
    const onInterrupt = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      driving = false;
      current = window.scrollY;
      target = current;
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onInterrupt);
    window.addEventListener("touchstart", onInterrupt, { passive: true });
    window.addEventListener("hashchange", onInterrupt);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onInterrupt);
      window.removeEventListener("touchstart", onInterrupt);
      window.removeEventListener("hashchange", onInterrupt);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
