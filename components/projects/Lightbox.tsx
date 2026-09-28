"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ProjectImage } from "@/types/resume";
import { CompareImage } from "@/components/projects/CompareImage";
import { PdfPages } from "@/components/projects/PdfPages";
import { PostCard } from "@/components/projects/PostCard";
import { isPdf } from "@/lib/media";
import { aspectRatio, DEFAULT_ASPECT } from "@/lib/aspect";
import { fill, ui } from "@/lib/copy";

/** Beside a PDF, in the gallery and here, when the Studio allows downloading it. */
export const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v8m0 0L4.5 7M8 10.5 11.5 7M3 13.5h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type LightboxProps = {
  images: ProjectImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

/**
 * The gallery thumbnails are optimizer-resized; this is where the untouched
 * original is finally fetched. Those files can run to several megabytes, so
 * the figure says so while the bytes arrive instead of sitting empty. Keyed
 * by src from the caller, so stepping to the next image starts fresh.
 */
function FullImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const imgRef = useRef<HTMLImageElement>(null);

  // A cached image can finish before React wires up onLoad; catch that case.
  useEffect(() => {
    const node = imgRef.current;
    if (node?.complete && node.naturalWidth > 0) setStatus("ready");
  }, []);

  return (
    <>
      {/* Not next/image: this is deliberately the original file, and the
          viewer sizes it against the viewport rather than a box. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={status === "ready" ? "is-loaded" : undefined}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("failed")}
      />
      {status !== "ready" && (
        <span className="pj-lb-loading" role="status">
          {status === "failed" ? ui.gallery.failed : ui.gallery.loading}
        </span>
      )}
    </>
  );
}

/**
 * Full-screen image viewer. Rendered into <body> through a portal, so it
 * always covers the full viewport regardless of which project's gallery
 * opened it, and never clips against an ancestor's overflow or stacking
 * context.
 */
export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [pdfAt, setPdfAt] = useState({ page: 1, total: 0 });
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);

  const image = images[index];
  // A PDF opens as every page, scrollable, drawn from the file itself; the
  // whole file sits behind a download when the Studio allows it.
  const pdf = image ? isPdf(image.src) : false;
  // What pdf.js reports once the file is parsed, falling back to the count the
  // Studio stored beside the file so the caption isn't blank while it loads.
  const pdfTotal = pdfAt.total || image?.pages || 0;
  const step = useCallback(
    (delta: number) => onIndexChange((index + delta + images.length) % images.length),
    [index, images.length, onIndexChange]
  );

  // PdfPages reports the page under the reader; a stable identity keeps its
  // observers from being rebuilt on every render.
  const onPdfPage = useCallback((page: number, total: number) => setPdfAt({ page, total }), []);

  // Stepping to another file starts its count over.
  useEffect(() => setPdfAt({ page: 1, total: 0 }), [image?.src]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    restoreFocusTo.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (restoreFocusTo.current instanceof HTMLElement) restoreFocusTo.current.focus();
    };
  }, []);

  // Hold the page still while the viewer is open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      // The arrows belong to a focused before/after bar, not to paging.
      else if (event.target instanceof HTMLElement && event.target.closest(".cmp")) return;
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, step]);

  if (!mounted || !image) return null;

  return createPortal(
    <div
      className="pj-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.caption || image.alt || "Project image"}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <button ref={closeRef} type="button" className="pj-lb-close" onClick={onClose} aria-label="Close viewer">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {images.length > 1 && (
        <button type="button" className="pj-lb-nav pj-lb-nav--prev" onClick={() => step(-1)} aria-label="Previous image">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 4 7 12l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <figure className="pj-lb-figure">
        {image.display === "compare" && image.after && !pdf ? (
          <CompareImage
            key={`${image.src}|${image.after}`}
            className="pj-lb-compare"
            before={image.src}
            after={image.after}
            alt={image.alt}
            frame={image.frame}
            afterFrame={image.afterFrame}
            sizes="90vw"
            ratio={aspectRatio(image.aspect) ?? DEFAULT_ASPECT}
            loading="eager"
          />
        ) : pdf ? (
          <PdfPages key={image.src} src={image.src} alt={image.alt} onPageChange={onPdfPage} />
        ) : image.post ? (
          // The record first and the screenshot second, in the DOM as on the
          // page: the words are what there is to read, the picture is what
          // proves they were really posted.
          <>
            <PostCard post={image.post} />
            <figure className="pj-post-capture">
              <FullImage key={image.src} src={image.src} alt={image.alt} />
              <figcaption>{ui.gallery.postCapture}</figcaption>
            </figure>
          </>
        ) : (
          <FullImage key={image.src} src={image.src} alt={image.alt} />
        )}
        {(image.caption || images.length > 1 || pdf) && (
          <figcaption>
            {image.caption}
            {pdf && pdfTotal ? (
              <span className="pj-lb-count">
                {fill(ui.gallery.pageOf, { page: pdfAt.page, count: pdfTotal })}
              </span>
            ) : null}
            {pdf && image.download && (
              <a className="pj-lb-download" href={image.src} download suppressHydrationWarning>
                <DownloadIcon />
                <span>{ui.gallery.downloadPdf}</span>
              </a>
            )}
            {images.length > 1 && <span className="pj-lb-count">{index + 1} / {images.length}</span>}
          </figcaption>
        )}
      </figure>

      {images.length > 1 && (
        <button type="button" className="pj-lb-nav pj-lb-nav--next" onClick={() => step(1)} aria-label="Next image">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m9 4 8 8-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  );
}
