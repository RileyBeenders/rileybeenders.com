"use client";

import { useLayoutEffect, useRef, useState, type MutableRefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowLeftRight, ArrowUp, GalleryVerticalEnd, Move } from "lucide-react";
import type { ImagePlace } from "@/types/resume";
import { ShotButton } from "@/components/projects/ProjectGallery";
import { clampWidth, PLACE_WIDTH, type ShownImage } from "@/lib/photo-place";

/** A photo that has just moved, and where it was drawn before, so it can glide from there to its new spot. */
export type PendingFlip = { index: number; rect: DOMRect } | null;

type InlinePhotoProps = {
  item: ShownImage;
  place: ImagePlace;
  /** Photo Mode is on and this project's placements can be saved. */
  editing: boolean;
  flip: MutableRefObject<PendingFlip>;
  onOpen: () => void;
  onGrab: (event: React.PointerEvent, figure: HTMLElement) => void;
  /** A new width while the handle is dragged (`commit` false), and once more when it is let go. */
  onResize: (width: number, commit: boolean) => void;
  onFlip: () => void;
  onStep: (direction: -1 | 1) => void;
  onReturn: () => void;
  canStepUp: boolean;
  canStepDown: boolean;
};

/** Matches --ease in blueprint.css. */
const EASE = "cubic-bezier(0.22, 0.9, 0.28, 1)";
const INLINE_SIZES = "(max-width: 640px) 100vw, 34vw";

/**
 * A project photo floated in the body text, left or right, at a width that is
 * a share of the body's (container-query units, so it holds at any width).
 * The text wraps around it. On a phone it drops the float and takes the full
 * width between two paragraphs. In Photo Mode it carries its own controls:
 * drag to move, the corner handle to resize, and buttons for the same moves
 * from the keyboard.
 */
export function InlinePhoto({
  item, place, editing, flip, onOpen, onGrab, onResize, onFlip, onStep, onReturn, canStepUp, canStepDown
}: InlinePhotoProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [resizing, setResizing] = useState<number | null>(null);
  const { image } = item;

  // Arriving from a drop or a step: start where it was drawn and glide into place.
  useLayoutEffect(() => {
    const pending = flip.current;
    const el = ref.current;
    if (!pending || pending.index !== item.index || !el) return;
    flip.current = null;
    if (reduced) return;
    const now = el.getBoundingClientRect();
    if (now.width === 0) return;
    const dx = pending.rect.left - now.left;
    const dy = pending.rect.top - now.top;
    const scale = pending.rect.width / now.width;
    el.animate(
      [
        { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
        { transformOrigin: "top left", transform: "none" }
      ],
      { duration: 520, easing: EASE }
    );
  }, [flip, item.index, place.at, place.side, reduced]);

  const startResize = (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const figure = ref.current;
    const body = figure?.closest<HTMLElement>(".pj-body");
    if (!figure || !body) return;
    const handle = event.currentTarget;
    handle.setPointerCapture(event.pointerId);
    const startX = event.clientX;
    const startWidth = figure.getBoundingClientRect().width;
    const bodyWidth = body.getBoundingClientRect().width;
    // The handle sits on the side facing the text, so dragging it into the text grows the photo.
    const direction = place.side === "right" ? -1 : 1;
    let width = place.width;

    const move = (next: PointerEvent) => {
      width = clampWidth(((startWidth + direction * (next.clientX - startX)) / bodyWidth) * 100);
      setResizing(width);
      onResize(width, false);
    };
    const end = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", end);
      handle.removeEventListener("pointercancel", end);
      setResizing(null);
      onResize(width, true);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
  };

  const keyResize = (event: React.KeyboardEvent) => {
    const grow = place.side === "right" ? "ArrowLeft" : "ArrowRight";
    const shrink = place.side === "right" ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (event.key === grow || event.key === "ArrowUp") next = place.width + PLACE_WIDTH.step;
    if (event.key === shrink || event.key === "ArrowDown") next = place.width - PLACE_WIDTH.step;
    if (event.key === "Home") next = PLACE_WIDTH.min;
    if (event.key === "End") next = PLACE_WIDTH.max;
    if (next === null) return;
    event.preventDefault();
    onResize(clampWidth(next), true);
  };

  // A record of the rect before a step or a flip, so the photo glides to where it lands.
  const remember = () => {
    if (ref.current) flip.current = { index: item.index, rect: ref.current.getBoundingClientRect() };
  };

  return (
    <figure
      ref={ref}
      className={`pj-shot pj-inline pj-inline--${place.side}${editing ? " is-editing" : ""}`}
      style={{ ["--pj-inline-w" as string]: place.width }}
      data-pj-photo={item.index}
    >
      <ShotButton image={image} index={item.at} onOpen={onOpen} sizes={INLINE_SIZES} />
      {image.caption && <figcaption>{image.caption}</figcaption>}

      {editing && (
        <>
          <div
            className="pj-photo-grab"
            onPointerDown={(event) => ref.current && onGrab(event, ref.current)}
            title="Drag to move this photo"
          >
            <span className="pj-photo-chip" aria-hidden="true"><Move size={12} strokeWidth={2} /> Drag</span>
          </div>
          <div className="pj-photo-tools" role="toolbar" aria-label={`Arrange ${image.alt || "photo"}`}>
            <button type="button" onClick={() => { remember(); onStep(-1); }} disabled={!canStepUp} title="Move up a paragraph" aria-label="Move up a paragraph">
              <ArrowUp size={13} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => { remember(); onStep(1); }} disabled={!canStepDown} title="Move down a paragraph" aria-label="Move down a paragraph">
              <ArrowDown size={13} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => { remember(); onFlip(); }} title="Float on the other side" aria-label="Float on the other side">
              <ArrowLeftRight size={13} strokeWidth={2} />
            </button>
            <button type="button" onClick={onReturn} title="Back to the gallery" aria-label="Back to the gallery">
              <GalleryVerticalEnd size={13} strokeWidth={2} />
            </button>
          </div>
          <span
            className="pj-photo-resize"
            role="slider"
            tabIndex={0}
            aria-label="Photo width"
            aria-valuemin={PLACE_WIDTH.min}
            aria-valuemax={PLACE_WIDTH.max}
            aria-valuenow={place.width}
            aria-valuetext={`${Math.round(place.width)}% of the text width`}
            onPointerDown={startResize}
            onKeyDown={keyResize}
            title="Drag to resize"
          />
          {resizing !== null && <span className="pj-photo-size" aria-hidden="true">{Math.round(resizing)}%</span>}
        </>
      )}
    </figure>
  );
}
