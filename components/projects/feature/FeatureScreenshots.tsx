"use client";

import { useEffect, useId, useState } from "react";
import type { FeatureScreenshot, ScreenshotHotspot } from "@/types/resume";
import { useInViewOnce } from "@/lib/useInViewOnce";

type FeatureScreenshotsProps = {
  screenshots: FeatureScreenshot[];
  onOpen: (id: string) => void;
};

/**
 * Screenshots of the site with numbered pins on the parts worth pointing at.
 * Hovering or focusing a pin (or its legend line) shows the callout; clicking
 * keeps it open; Escape or clicking elsewhere closes it. Pins ring once as
 * the figure scrolls into view so they read as touchable, then sit still.
 * The image itself opens full-size in the viewer.
 */
export function FeatureScreenshots({ screenshots, onOpen }: FeatureScreenshotsProps) {
  return (
    <div className="ft-shots">
      {screenshots.map((shot) => <Shot key={shot.id} shot={shot} onOpen={onOpen} />)}
    </div>
  );
}

function Shot({ shot, onOpen }: { shot: FeatureScreenshot; onOpen: (id: string) => void }) {
  const { ref, inView } = useInViewOnce<HTMLElement>(0.3);
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // A full-page capture is several screens tall; it scrolls inside a fixed-height frame instead of towering.
  const [tall, setTall] = useState(false);
  const baseId = useId();
  const pins: ScreenshotHotspot[] = shot.hotspots ?? [];

  useEffect(() => {
    if (pinned === null) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPinned(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pinned]);

  const showing = (index: number) => pinned === index || hovered === index;
  return (
    <figure ref={ref} className={`ft-shot${inView ? " is-in" : ""}`} id={`shot-${shot.id}`}>
      <div className={`ft-shot-frame${tall ? " is-tall" : ""}`} onClick={() => setPinned(null)}>
        {/* Pins are positioned against the canvas (the image's full height), not the frame, so a scrolling frame doesn't move them. */}
        <div className="ft-shot-canvas">
          <button type="button" className="ft-shot-open" onClick={() => onOpen(shot.id)} aria-label={`Open full size: ${shot.caption ?? shot.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.src}
              alt={shot.alt}
              loading="lazy"
              onLoad={(event) => {
                const img = event.currentTarget;
                setTall(img.naturalHeight / img.naturalWidth > 1.25);
              }}
            />
          </button>

          {pins.map((pin, index) => {
            const open = showing(index);
            const calloutId = `${baseId}-${index}`;
            return (
              <div
                key={`${pin.label}-${index}`}
                className={`ft-pin-wrap${open ? " is-open" : ""}`}
                style={{ left: `${pin.x}%`, top: `${pin.y}%`, ["--i" as string]: index }}
                data-flip-x={pin.x > 60 ? "" : undefined}
                data-flip-y={pin.y > 65 ? "" : undefined}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="ft-pin"
                  aria-expanded={pinned === index}
                  aria-describedby={calloutId}
                  aria-label={pin.label}
                  onClick={() => setPinned((value) => (value === index ? null : index))}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                >
                  <span className="ft-pin-ring" aria-hidden="true" />
                  <span className="ft-pin-num" aria-hidden="true">{index + 1}</span>
                </button>
                <div className="ft-callout" id={calloutId} role="tooltip">
                  <strong>{pin.label}</strong>
                  {pin.detail && <p>{pin.detail}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <figcaption className="ft-shot-caption">
        {shot.caption && <span className="ft-shot-title">{shot.caption}{tall ? " · scroll inside the frame" : ""}</span>}
        {pins.length > 0 && (
          <ol className="ft-legend">
            {pins.map((pin, index) => (
              <li key={`${pin.label}-legend-${index}`}>
                <button
                  type="button"
                  className={`ft-legend-item${showing(index) ? " is-on" : ""}`}
                  onPointerEnter={() => setHovered(index)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  onClick={() => setPinned((value) => (value === index ? null : index))}
                  aria-pressed={pinned === index}
                >
                  <span className="ft-legend-num" aria-hidden="true">{index + 1}</span>
                  <span>{pin.label}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </figcaption>
    </figure>
  );
}
