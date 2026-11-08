"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Maximize2, X } from "lucide-react";
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
 * The box a project card opens into: a centred panel over a blurred scrim
 * with its own scroll, a bar carrying the name and the way out to the
 * project's full page, and the project body beneath. Rendered into <body>
 * through a portal so it covers the page whichever grid opened it; the
 * full-screen viewer (Lightbox) stacks above it the same way.
 */
export function ProjectDialog({ open, onClose, children }: ProjectDialogProps) {
  const reduced = useReducedMotion();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<Element | null>(null);

  // The portal target sits inside .bp (app/(site)/layout.tsx) so every palette token resolves; <body> is outside that scope.
  useEffect(() => setHost(document.querySelector<HTMLElement>("[data-sheet-portal]") ?? document.body), []);

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
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <div className="dlg-bar">
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
              </div>
              <div className="dlg-body" data-native-scroll="">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    host
  );
}
