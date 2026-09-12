"use client";

import { useState } from "react";
import type { ProjectImage } from "@/types/resume";
import { Lightbox } from "@/components/projects/Lightbox";

/**
 * The right-hand column of a project panel: a scrolling column of photographs,
 * each one a button into the full-screen viewer. Frames are sized off the
 * viewport, so every project reads at the same scale whatever the source image.
 */
export function ProjectGallery({ images, projectName }: { images: ProjectImage[]; projectName: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="pj-gallery">
      <div
        className="pj-shots"
        tabIndex={0}
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
                style={{ objectFit: image.fit === "contain" ? "contain" : "cover" }}
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
        {images.length === 1 ? "Click to enlarge" : `${images.length} images · scroll the column, click to enlarge`}
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
