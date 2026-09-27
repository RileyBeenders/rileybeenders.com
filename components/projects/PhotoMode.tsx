"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ImagePlus } from "lucide-react";
import type { ImagePlace } from "@/types/resume";

/**
 * Photo Mode — dev only, like "Edit in Studio" (components/blueprint/StudioLink.tsx).
 * A toggle over the projects page that lets a photo be dragged out of a
 * project's gallery and dropped into its body text, where it floats left or
 * right of a paragraph or bullet and the text wraps around it. Each change is
 * written to data/projects/projects.json through the Studio's
 * /api/photo-place, and the page hot-reloads from the file like any Studio save.
 *
 * A photo can only land in its own project's body: the drop zones are that
 * body's paragraphs and bullets, and its gallery column to put it back. The
 * title, the rules and the dates are never a target, and a drop anywhere
 * else puts the photo back where it was.
 */

/** Set by `npm run site` (studio/site.mjs). Never set in a production build. */
const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const STORAGE_KEY = "pj-photo-mode";

/** Pointer travel before a press becomes a drag, so a click is still a click. */
const DRAG_THRESHOLD = 5;
/** The ghost under the pointer is drawn no wider than this. */
const GHOST_MAX = 280;
/** Within this distance of the viewport's top or bottom, a drag scrolls the page. */
const EDGE = 72;

export type DropTarget =
  | { kind: "body"; at: number; side: ImagePlace["side"] }
  | { kind: "gallery" };

export type DragRequest = {
  /** The press that may become a drag. */
  event: React.PointerEvent;
  /** The photo as it sits now: sizes the ghost, and dims while it is carried. */
  source: HTMLElement;
  /** The whole project: the ghost never leaves it. */
  entry: HTMLElement;
  /** Its body text, whose [data-pj-block] children are the anchors. */
  body: HTMLElement | null;
  /** Where dropping sends the photo back to the gallery. */
  gallery: HTMLElement | null;
  /** How wide the photo will float, as a percentage of the body. */
  width: number;
  onDrop: (target: DropTarget, from: DOMRect) => void;
};

type Status = { tone: "idle" | "busy" | "ok" | "error"; text: string };

type PhotoModeValue = {
  on: boolean;
  startDrag: (request: DragRequest) => void;
  save: (projectId: string, index: number, src: string, place: ImagePlace | null) => Promise<boolean>;
};

const PhotoModeContext = createContext<PhotoModeValue>({
  on: false,
  startDrag: () => {},
  save: async () => false
});

export const usePhotoMode = () => useContext(PhotoModeContext);

type Geometry = { left: number; top: number; width: number; height: number };

type DragView = {
  ghost: Geometry;
  src: string | null;
  indicator: (Geometry & { side?: ImagePlace["side"] }) | null;
  target: DropTarget | null;
};

const HINT = "Drag a photo into its project's text. Drop it back on the photos to return it.";

/** The block whose top is nearest the ghost's top edge: the photo's top lines up with that paragraph's first line. */
function bodyTarget(body: HTMLElement, x: number, ghostTop: number, width: number, ratio: number) {
  const blocks = [...body.querySelectorAll<HTMLElement>("[data-pj-block]")];
  if (blocks.length === 0) return null;
  let best = blocks[0];
  let bestDistance = Infinity;
  for (const block of blocks) {
    const distance = Math.abs(block.getBoundingClientRect().top - ghostTop);
    if (distance < bestDistance) {
      best = block;
      bestDistance = distance;
    }
  }
  const bodyRect = body.getBoundingClientRect();
  const blockRect = best.getBoundingClientRect();
  const side: ImagePlace["side"] = x < bodyRect.left + bodyRect.width / 2 ? "left" : "right";
  // Widths are a share of the body (cqi in projects.css); a bullet's photo starts inside its indent.
  const w = (bodyRect.width * width) / 100;
  const indent = parseFloat(getComputedStyle(best).paddingLeft) || 0;
  return {
    target: { kind: "body" as const, at: Number(best.dataset.pjBlock), side },
    indicator: {
      left: side === "left" ? blockRect.left + indent : blockRect.right - w,
      top: blockRect.top,
      width: w,
      height: w * ratio,
      side
    }
  };
}

const inside = (rect: DOMRect, x: number, y: number, slack = 0) =>
  x >= rect.left - slack && x <= rect.right + slack && y >= rect.top - slack && y <= rect.bottom + slack;

export function PhotoModeProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(false);
  const [status, setStatus] = useState<Status>({ tone: "idle", text: HINT });
  const [drag, setDrag] = useState<DragView | null>(null);
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const statusTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    // The Studio answers this machine only, so the toggle is pointless anywhere else.
    if (!STUDIO_URL || !LOOPBACK_HOSTS.has(window.location.hostname)) return;
    setAvailable(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "on") setOn(true);
    } catch {}
  }, []);

  const toggle = useCallback(() => {
    setOn((value) => {
      try {
        sessionStorage.setItem(STORAGE_KEY, value ? "off" : "on");
      } catch {}
      return !value;
    });
    setStatus({ tone: "idle", text: HINT });
  }, []);

  const say = useCallback((next: Status, settle = false) => {
    window.clearTimeout(statusTimer.current);
    setStatus(next);
    if (settle) statusTimer.current = window.setTimeout(() => setStatus({ tone: "idle", text: HINT }), 2400);
  }, []);

  // Saves run one at a time: each rewrites the whole file, and two at once could each undo the other.
  const save = useCallback<PhotoModeValue["save"]>((projectId, index, src, place) => {
    const run = async () => {
      say({ tone: "busy", text: "Saving…" });
      try {
        const response = await fetch(`${STUDIO_URL}/api/photo-place`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ project: projectId, index, src, place })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || `The Studio refused the change (${response.status}).`);
        say({ tone: "ok", text: "Saved to projects.json" }, true);
        return true;
      } catch (error) {
        const message = error instanceof TypeError
          ? "Couldn't reach the Studio. Is `npm run site` still running?"
          : (error as Error).message;
        say({ tone: "error", text: message });
        return false;
      }
    };
    const next = queue.current.then(run, run);
    queue.current = next;
    return next;
  }, [say]);

  const startDrag = useCallback((request: DragRequest) => {
    const { event, source, entry } = request;
    if (event.button !== 0) return;
    event.preventDefault();

    const startX = event.clientX;
    const startY = event.clientY;
    const sourceRect = source.getBoundingClientRect();
    const scale = Math.min(1, GHOST_MAX / sourceRect.width);
    const ghostW = sourceRect.width * scale;
    const ghostH = sourceRect.height * scale;
    const ratio = sourceRect.height / sourceRect.width;
    const grabX = (startX - sourceRect.left) * scale;
    const grabY = (startY - sourceRect.top) * scale;
    const img = source.querySelector("img");
    const src = img ? img.currentSrc || img.src : null;

    let started = false;
    let pointer = { x: startX, y: startY };
    let current: DragView | null = null;
    let frame = 0;

    const measure = () => {
      const entryRect = entry.getBoundingClientRect();
      // The ghost stays inside its own project, so it can't be carried over another one.
      const left = Math.min(Math.max(pointer.x - grabX, entryRect.left), Math.max(entryRect.left, entryRect.right - ghostW));
      const top = Math.min(Math.max(pointer.y - grabY, entryRect.top), Math.max(entryRect.top, entryRect.bottom - ghostH));
      let target: DropTarget | null = null;
      let indicator: DragView["indicator"] = null;
      const bodyRect = request.body?.getBoundingClientRect();
      const galleryRect = request.gallery?.getBoundingClientRect();
      if (request.body && bodyRect && inside(bodyRect, pointer.x, pointer.y, 24)) {
        const found = bodyTarget(request.body, pointer.x, top, request.width, ratio);
        if (found) ({ target, indicator } = found);
      } else if (galleryRect && inside(galleryRect, pointer.x, pointer.y, 16)) {
        target = { kind: "gallery" };
        indicator = { left: galleryRect.left, top: galleryRect.top, width: galleryRect.width, height: galleryRect.height };
      }
      current = { ghost: { left, top, width: ghostW, height: ghostH }, src, indicator, target };
      setDrag(current);
    };

    // Near the top or bottom of the window, keep scrolling while the pointer rests there.
    const autoScroll = () => {
      frame = 0;
      if (!started) return;
      const { innerHeight } = window;
      const speed = pointer.y < EDGE ? -(EDGE - pointer.y) / 4 : pointer.y > innerHeight - EDGE ? (pointer.y - (innerHeight - EDGE)) / 4 : 0;
      if (speed === 0) return;
      window.scrollBy(0, speed);
      measure();
      frame = requestAnimationFrame(autoScroll);
    };

    const onMove = (move: PointerEvent) => {
      pointer = { x: move.clientX, y: move.clientY };
      if (!started) {
        if (Math.hypot(pointer.x - startX, pointer.y - startY) < DRAG_THRESHOLD) return;
        started = true;
        source.classList.add("is-lifted");
        document.documentElement.classList.add("pj-photo-dragging");
      }
      measure();
      if (!frame) frame = requestAnimationFrame(autoScroll);
    };

    const finish = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      source.classList.remove("is-lifted");
      document.documentElement.classList.remove("pj-photo-dragging");
      const done = current;
      setDrag(null);
      if (commit && started && done?.target) {
        const { left, top, width, height } = done.ghost;
        request.onDrop(done.target, new DOMRect(left, top, width, height));
      }
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (key: KeyboardEvent) => {
      if (key.key === "Escape") finish(false);
    };
    const onScroll = () => {
      if (started) measure();
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
  }, []);

  const value: PhotoModeValue = { on: available && on, startDrag, save };

  return (
    <PhotoModeContext.Provider value={value}>
      <div className="pj-photo-scope" data-photo-mode={value.on ? "" : undefined}>
        {children}
      </div>

      {available && (
        <div className="pj-photo-dock">
          {on && (
            <p className={`pj-photo-status pj-photo-status--${status.tone}`} role="status" aria-live="polite">
              {status.text}
            </p>
          )}
          <button
            type="button"
            className={`pj-photo-toggle${on ? " is-on" : ""}`}
            aria-pressed={on}
            onClick={toggle}
            title="Arrange project photos in the text (dev only)"
          >
            <ImagePlus size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>Photo mode{on ? " · on" : ""}</span>
          </button>
        </div>
      )}

      {drag && (
        <div className="pj-photo-layer" aria-hidden="true">
          {drag.indicator && (
            <div
              className={`pj-photo-drop${drag.target?.kind === "gallery" ? " pj-photo-drop--gallery" : ""}`}
              style={{ left: drag.indicator.left, top: drag.indicator.top, width: drag.indicator.width, height: drag.indicator.height }}
            >
              <span>{drag.target?.kind === "gallery" ? "Back to the gallery" : `Float ${drag.indicator.side}`}</span>
            </div>
          )}
          <div
            className={`pj-photo-ghost${drag.target ? "" : " is-homeless"}`}
            style={{ left: drag.ghost.left, top: drag.ghost.top, width: drag.ghost.width, height: drag.ghost.height }}
          >
            {drag.src && <img src={drag.src} alt="" draggable={false} />}
          </div>
        </div>
      )}
    </PhotoModeContext.Provider>
  );
}
