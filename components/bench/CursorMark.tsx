"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { BpMark } from "@/components/blueprint/BpMark";

/**
 * The monogram chip that trails the pointer across the hero card. It lives
 * inside the card (the nearest [data-cursor-zone]) and follows the pointer
 * on a spring, tilting with the direction of travel, and fades out when the
 * pointer leaves. Pointer devices only; reduced motion keeps it hidden.
 * Site Settings → Motion → Cursor mark.
 */
export function CursorMark() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 });
  // Lean into the direction the chip is being pulled in.
  const lean = useTransform(() => Math.max(-14, Math.min(14, (x.get() - sx.get()) * 0.18)));

  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const zone = ref.current?.closest<HTMLElement>("[data-cursor-zone]");
    if (!zone) return;
    setEnabled(true);

    const move = (event: PointerEvent) => {
      const rect = zone.getBoundingClientRect();
      x.set(event.clientX - rect.left + 18);
      y.set(event.clientY - rect.top + 18);
      setShown(true);
    };
    const leave = () => setShown(false);
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerleave", leave);
    return () => {
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerleave", leave);
    };
  }, [reduced, x, y]);

  // Rendered in every case (hidden when motion is reduced) so the server and client trees match.
  return (
    <motion.div
      ref={ref}
      className="cursor-mark"
      aria-hidden="true"
      style={{ x: sx, y: sy, rotate: lean }}
      animate={{ opacity: enabled && shown ? 1 : 0, scale: enabled && shown ? 1 : 0.6 }}
      transition={{ duration: 0.35, ease: [0.22, 0.9, 0.28, 1] }}
    >
      <BpMark id="cursor" size={24} />
    </motion.div>
  );
}
