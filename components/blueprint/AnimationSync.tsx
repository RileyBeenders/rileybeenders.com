"use client";

import { useEffect } from "react";

/**
 * Site Settings → Motion → Sync animations. Every repeating CSS animation on
 * the page is put on one shared clock: its start is moved back to the last
 * whole cycle of the page's timeline, so every copy of the same animation
 * (each Read more glint, each skill pill's border) is at the same point in
 * its loop, whenever it mounted. It is phase only, so nothing jumps forward
 * more than part of a cycle, and an animation that restarts later (a hover
 * that removed it, a page change) is lined up again as it starts.
 *
 * The per-item stagger delays are zeroed in CSS under [data-motion-sync] (see
 * bullet-link.css and skill-pills.css), which is what makes "the same point"
 * mean the same moment rather than the same offset.
 */
export function AnimationSync() {
  useEffect(() => {
    let frame = 0;

    function align() {
      frame = 0;
      for (const animation of document.getAnimations()) {
        if (!(animation instanceof CSSAnimation)) continue;
        const timing = animation.effect?.getTiming();
        const cycle = typeof timing?.duration === "number" ? timing.duration : 0;
        if (timing?.iterations !== Infinity || cycle <= 0 || animation.startTime === null) continue;
        const start = Number(animation.startTime);
        const aligned = Math.floor(start / cycle) * cycle;
        if (Math.abs(start - aligned) > 0.5) animation.startTime = aligned;
      }
    }

    // One pass per frame, however many animations start in it (a list of pills mounts at once).
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(align);
    };

    schedule();
    document.addEventListener("animationstart", schedule);
    return () => {
      document.removeEventListener("animationstart", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
