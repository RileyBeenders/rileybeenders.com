"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import type { ImageFrame } from "@/types/resume";

/** A GIF goes around the optimizer so it keeps its timing and loop. */
const isGif = (src: string) => /\.gif$/i.test(src);

type CompareImageProps = {
  before: string;
  after: string;
  alt: string;
  frame?: ImageFrame;
  afterFrame?: ImageFrame;
  sizes: string;
  loading?: "eager" | "lazy";
  className?: string;
};

/**
 * One photo of a before/after pair inside the 4:3 frame. With a frame from
 * the Studio's aligner the image is placed and cropped exactly as it was
 * lined up there (percentages of the frame, so it holds at any size);
 * without one it simply covers the frame, centred.
 */
function Layer({ src, alt, frame, sizes, loading }: { src: string; alt: string; frame?: ImageFrame; sizes: string; loading?: "eager" | "lazy" }) {
  if (!frame) {
    return <Image src={src} alt={alt} fill sizes={sizes} loading={loading} unoptimized={isGif(src)} className="cmp-img" />;
  }
  // A zoomed-in crop draws wider than the frame, so ask the optimizer for that much more.
  const scale = Math.max(1, frame.w / 100);
  const placedSizes = sizes
    .split(",")
    .map((part) => part.trim().replace(/(\S+)$/, (size) => `calc(${size} * ${scale.toFixed(2)})`))
    .join(", ");
  return (
    <div className="cmp-placed" style={{ left: `${frame.x}%`, top: `${frame.y}%`, width: `${frame.w}%` }}>
      {/* width/height only seed the aspect ratio until the file arrives; height: auto takes the real one. */}
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1200}
        sizes={placedSizes}
        loading={loading}
        unoptimized={isGif(src)}
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}

/**
 * A before/after comparison: the After laid over the Before, uncovered up to
 * a bar the visitor drags (or moves with the arrow keys once focused). The
 * drag is horizontal only, so a phone can still scroll the page past it.
 */
export function CompareImage({ before, after, alt, frame, afterFrame, sizes, loading, className }: CompareImageProps) {
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // Read by pointermove, which can land before the re-render that `dragging` triggers.
  const draggingRef = useRef(false);

  const setDrag = (on: boolean) => {
    draggingRef.current = on;
    setDragging(on);
  };

  const moveTo = useCallback((clientX: number) => {
    const box = rootRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - box.left) / box.width) * 100)));
  }, []);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag(true);
    moveTo(event.clientX);
  }

  const style = { "--cmp-pos": `${position}%` } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`cmp${dragging ? " is-dragging" : ""}${className ? ` ${className}` : ""}`}
      style={style}
      data-edge={position < 12 ? "start" : position > 88 ? "end" : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={(event) => { if (draggingRef.current) moveTo(event.clientX); }}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
    >
      <div className="cmp-layer">
        <Layer src={before} alt={`${alt} (before)`} frame={frame} sizes={sizes} loading={loading} />
      </div>
      <div className="cmp-layer cmp-layer--after">
        <Layer src={after} alt={`${alt} (after)`} frame={afterFrame} sizes={sizes} loading={loading} />
      </div>

      <span className="cmp-tag cmp-tag--before" aria-hidden="true">Before</span>
      <span className="cmp-tag cmp-tag--after" aria-hidden="true">After</span>

      <div className="cmp-bar" aria-hidden="true">
        <span className="cmp-knob">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M6.5 5 3 9l3.5 4M11.5 5 15 9l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* The keyboard and screen-reader way to move the bar. */}
      <input
        type="range"
        className="cmp-range"
        min={0}
        max={100}
        step={1}
        value={Math.round(position)}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label={`Before and after: ${alt}. Slide to compare.`}
        aria-valuetext={`${Math.round(position)}% before`}
      />
    </div>
  );
}
