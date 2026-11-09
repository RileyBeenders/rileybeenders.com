"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
import { MORPH, tileLayoutId } from "@/components/bench/ProjectCard";
import { ui } from "@/lib/copy";

const EASE = [0.22, 0.9, 0.28, 1] as const;

type ProjectDialogProps = {
  /** The open entry's id and name, or null when closed. */
  open: { id: string; name: string; type: string } | null;
  onClose: () => void;
  children: ReactNode;
};

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

/**
 * The box a project tile opens into: it grows out of the tile (the two share
 * a layoutId, so the morph is one continuous surface), the page dims behind
 * it, and the body fades in once the box has settled. A bar carries the name
 * and the way out to the project's full page; the body scrolls on its own.
 * Rendered through a portal into [data-bench-portal] (inside .bp, so the
 * palette tokens resolve) so it covers the page whichever grid opened it;
 * the full-screen viewer (Lightbox) stacks above it.
 */
export function ProjectDialog({ open, onClose, children }: ProjectDialogProps) {
  const reduced = useReducedMotion();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<Element | null>(null);

  // The portal target sits inside .bp (app/(site)/layout.tsx) so every palette token resolves; <body> is outside that scope.
  useEffect(() => setHost(document.querySelector<HTMLElement>("[data-bench-portal]") ?? document.body), []);

  // Lock the page, trap focus, close on Escape; put focus back where it was.
  useEffect(() => {
    if (!open) return;
    restoreTo.current = document.activeElement;
    document.documentElement.setAttribute("data-lock", "");
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 30);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // The viewer above handles its own Escape; only close when it is not up.
        if (document.querySelector(".pj-lightbox")) return;
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab" && panelRef.current) {
        const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(focusTimer);
      document.documentElement.removeAttribute("data-lock");
      if (restoreTo.current instanceof HTMLElement) restoreTo.current.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!host) return null;

  // The body and bar wait for the morph, then fade in; without motion the whole box just fades.
  const inner = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.32, ease: EASE, delay: 0.18 } };

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="dlg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          <div key="wrap" className="dlg-wrap">
            <motion.div
              ref={panelRef}
              className="dlg"
              role="dialog"
              aria-modal="true"
              aria-labelledby={`dlg-title-${open.id}`}
              tabIndex={-1}
              layoutId={reduced ? undefined : tileLayoutId(open.id)}
              style={{ borderRadius: 22 }}
              initial={reduced ? { opacity: 0 } : undefined}
              animate={reduced ? { opacity: 1 } : undefined}
              exit={reduced ? { opacity: 0 } : undefined}
              transition={{ layout: MORPH, duration: 0.3 }}
            >
              <motion.div className="dlg-bar" {...inner}>
                <div className="dlg-bar-title">
                  <b id={`dlg-title-${open.id}`}>{open.name}</b>
                  <span>{open.type}</span>
                </div>
                <div className="dlg-bar-actions">
                  <Link className="btn btn--sm" href={`/projects/${open.id}`} suppressHydrationWarning>
                    <Maximize2 size={14} strokeWidth={2} aria-hidden="true" />
                    <span>{ui.projects.openFull}</span>
                  </Link>
                  <button type="button" className="btn btn--icon btn--ghost" onClick={onClose} aria-label={ui.projects.close}>
                    <X size={18} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
              <motion.div className="dlg-body" data-native-scroll="" {...inner}>
                {children}
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    host
  );
}
