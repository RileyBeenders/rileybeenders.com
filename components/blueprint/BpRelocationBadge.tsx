"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import resumeData from "@/data/resumeData";

const SCROLL_THRESHOLD = 48;
const BADGE_HEIGHT = 44;
/** Vertical air between the badge's bottom edge and the rule it floats above. Tune this to move it closer/further. */
const GAP_ABOVE_RULE = 16;
const HOP_SPRING = { type: "spring", stiffness: 170, damping: 18, mass: 1 } as const;
const ROLL_KEYFRAMES = [0, -14, 10, -5, 0];
const ROLL_TWEEN = { duration: 0.6, ease: "easeInOut" } as const;

const LABEL = "Open to relocation";
/** Typewriter cycle: rapid type-in → caret blinks → letters fall away a couple at a time → brief empty beat → repeat. */
const TYPE_MS = 40;
const TYPE_JITTER_MS = 35; // random extra per keystroke so it reads as typed, not metronomic
const HOLD_MS = 2600;
const DELETE_MS = 160;
const DELETE_CHUNK = 2;
const EMPTY_MS = 1000;

// document.documentElement.clientWidth/Height (not window.innerWidth/innerHeight) — these exclude the
// scrollbar, matching the box position:fixed's right/bottom offsets are actually measured against.
function clampPx(min: number, viewportFraction: number, max: number) {
  return Math.min(max, Math.max(min, document.documentElement.clientWidth * viewportFraction));
}

function useScrolledPastHero() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return scrolled;
}

/**
 * Where the badge rests before any scrolling: level with the rule under the
 * heading, flush with the same right edge as the rest of the hero content.
 * Measured from the real DOM (rather than re-deriving the hero's CSS math in
 * JS) so it stays correct if the hero's layout ever changes. Reads .bp-shell
 * and h1 rather than the rule itself — the rule's entrance animation scales
 * it in from zero width, which would corrupt a rect read mid-animation.
 */
function useHeroRestingSpot() {
  const [spot, setSpot] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    function measure() {
      const shell = document.querySelector(".bp-hero .bp-shell");
      const h1 = document.querySelector(".bp-hero h1");
      if (!shell || !h1) return;
      const shellRect = shell.getBoundingClientRect();
      const paddingRight = parseFloat(getComputedStyle(shell).paddingRight) || 0;
      const contentRight = shellRect.right - paddingRight;
      // getBoundingClientRect().bottom is relative to the CURRENT scroll position, but this resting
      // spot needs to be the scrollY=0 equivalent (resize also re-measures, and can fire while scrolled
      // far down the page — without correcting for that, it'd bake in a bogus, off-screen top value that
      // only self-heals on the next resize event that happens to fire near the top).
      const ruleTop = h1.getBoundingClientRect().bottom + window.scrollY + 38;
      setSpot({
        top: ruleTop - BADGE_HEIGHT - GAP_ABOVE_RULE,
        right: document.documentElement.clientWidth - contentRight
      });
    }
    measure();
    // Re-measure once web fonts swap in — the fallback font's metrics can leave the
    // heading a different height than the final one, which would shift the rule.
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return spot;
}

type TypePhase = "typing" | "holding" | "deleting" | "empty";

/**
 * Drives the looping type / hold / delete cycle. Each phase schedules a single
 * timeout for its next step and re-runs when `count` or `phase` moves, so
 * unmounting (or `active` flipping off) always has exactly one timer to clear.
 */
function useTypewriter(text: string, active: boolean) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<TypePhase>("typing");

  useEffect(() => {
    if (!active) return;
    let id: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      id = setTimeout(() => {
        const next = count + 1;
        setCount(next);
        if (next >= text.length) setPhase("holding");
      }, TYPE_MS + Math.random() * TYPE_JITTER_MS);
    } else if (phase === "holding") {
      id = setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else if (phase === "deleting") {
      id = setTimeout(() => {
        const next = Math.max(0, count - DELETE_CHUNK);
        setCount(next);
        if (next === 0) setPhase("empty");
      }, DELETE_MS);
    } else {
      id = setTimeout(() => setPhase("typing"), EMPTY_MS);
    }
    return () => clearTimeout(id);
  }, [active, phase, count, text]);

  return {
    shown: active ? text.slice(0, count) : text,
    // The caret only blinks while resting — a real caret sits solid mid-keystroke.
    blinking: phase === "holding" || phase === "empty"
  };
}

function BadgeLabel() {
  const reduced = useReducedMotion();
  const animate = !reduced;
  const { shown, blinking } = useTypewriter(LABEL, animate);

  return (
    <>
      <span className="bp-badge-dot" aria-hidden="true" />
      <span className="bp-badge-type">
        {/* Invisible full label reserves the width so the badge never resizes mid-cycle. */}
        <span className="bp-badge-type-ghost" aria-hidden="true">{LABEL}</span>
        <span className="bp-badge-type-live" aria-hidden="true">
          {shown}
          {animate ? <span className="bp-badge-caret" data-blink={blinking || undefined} /> : null}
        </span>
        <span className="sr-only">{LABEL}</span>
      </span>
    </>
  );
}

/**
 * Rests next to the hero's rule until the page scrolls past it, then hops down
 * to the same fixed corner every other page docks the badge in. It's a single
 * always-`position: fixed` element anchored at the top-right corner the whole
 * time — animating between the two spots is then just a plain x/y transform
 * tween, with no cross-component layout hand-off to coordinate.
 */
export function BpHeroRelocationBadge() {
  const reduced = useReducedMotion();
  const scrolled = useScrolledPastHero();
  const heroSpot = useHeroRestingSpot();

  if (!resumeData.visibility.openToRelocation || !heroSpot) return null;

  const dockGap = typeof window !== "undefined" ? clampPx(14, 0.02, 24) : 20;
  const dockedTop =
    typeof window !== "undefined" ? document.documentElement.clientHeight - dockGap - BADGE_HEIGHT : 0;
  const spotTop = scrolled ? dockedTop : heroSpot.top;
  const spotRight = scrolled ? dockGap : heroSpot.right;
  // Anchored at the viewport's top-right corner (top: 0; right: 0) and moved into place with a
  // transform instead of literal top/right — Motion tweens x/y reliably, but animating bare top/right
  // via `animate` proved flaky (it would sometimes just never apply them).
  const fixedStyle = { position: "fixed" as const, top: 0, right: 0, bottom: "auto", left: "auto" };
  const target = { x: -spotRight, y: spotTop };

  if (reduced) {
    return (
      <div className="bp-badge" style={{ ...fixedStyle, transform: `translate(${target.x}px, ${target.y}px)` }}>
        <BadgeLabel />
      </div>
    );
  }

  return (
    <motion.div className="bp-badge" style={fixedStyle} animate={target} transition={HOP_SPRING}>
      <motion.div
        animate={{ rotate: scrolled ? ROLL_KEYFRAMES : 0 }}
        transition={ROLL_TWEEN}
        style={{ display: "inline-flex", alignItems: "center", gap: 11 }}
      >
        <BadgeLabel />
      </motion.div>
    </motion.div>
  );
}

/** Docked bottom-right, for every page that isn't the home page (which handles it above instead). */
export function BpFixedRelocationBadge() {
  const pathname = usePathname();

  if (!resumeData.visibility.openToRelocation) return null;
  if (pathname === "/") return null;

  return (
    <div className="bp-badge">
      <BadgeLabel />
    </div>
  );
}
