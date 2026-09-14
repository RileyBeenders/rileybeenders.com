"use client";

import { useState } from "react";
import type { ProjectImage } from "@/types/resume";
import { Lightbox } from "@/components/projects/Lightbox";

/**
 * A project's photos as a responsive grid — one image fills the row, two sit
 * side by side, more wrap into rows. Every cell is a fixed-aspect frame (no
 * clipped-height scroller), so the grid never needs its own scrollbar. Each
 * cell opens the full-screen viewer.
 */
export function ProjectGallery({ images, projectName }: { images: ProjectImage[]; projectName: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="pj-gallery">
      <div
        className="pj-gallery-grid"
        role="group"
        aria-label={`${projectName} images — ${images.length} in total`}
      >
        {images.map((image, index) => (
          <figure className="pj-shot" key={`${image.src}-${index}`}>
            <button
              type="button"
              className="pj-shot-btn"
              onClick={() => setOpenAt(index)}
              aria-label={`View ${image.caption || image.alt} full screen`}
            >
              {/* Plain <img>: sources are editor-managed files of unknown size. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? "eager" : "lazy"}
                className={image.fit === "contain" ? "pj-shot-img--contain" : undefined}
              />
              <span className="pj-shot-zoom" aria-hidden="true">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M10.4 10.4 14 14M7 5.2v3.6M5.2 7h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </span>
            </button>
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>
        ))}
      </div>

      <p className="pj-gallery-note">
        {images.length === 1 ? "Click to enlarge" : `${images.length} images · click to enlarge`}
      </p>

      {openAt !== null && (
        <Lightbox
          images={images}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </div>
  );
}
