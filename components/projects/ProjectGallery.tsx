"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ProjectImage } from "@/types/resume";
import { DownloadIcon, Lightbox } from "@/components/projects/Lightbox";
import { PostButton } from "@/components/projects/PostCard";
import { CompareImage } from "@/components/projects/CompareImage";
import { aspectRatio, DEFAULT_ASPECT } from "@/lib/aspect";
import { fill, ui } from "@/lib/copy";
import { isPdf, pdfPreviewSrc } from "@/lib/media";

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

const gridVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } }
};
/** Each photo uncovers itself bottom-to-top instead of just fading in. */
const shotVariants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.6 },
  shown: { clipPath: "inset(0% 0% 0% 0%)", opacity: 1, transition: { duration: 0.7, ease: EASE } }
};

/** An animated GIF plays at the file's own pace and loops as the file says; the Studio sets both. */
const isGif = (src: string) => /\.gif$/i.test(src);

/** "PDF · 12 pages", from the page count the Studio stores beside the file. */
export function pdfTag(image: ProjectImage): string {
  const pages = image.pages;
  if (!pages) return ui.gallery.pdf;
  return `${ui.gallery.pdf} · ${pages === 1 ? ui.gallery.onePage : fill(ui.gallery.pages, { count: pages })}`;
}

const ZoomIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4.6" stroke="currentColor" strokeWidth="1.4" />
    <path d="M10.4 10.4 14 14M7 5.2v3.6M5.2 7h3.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const SHOT_SIZES = "(max-width: 500px) 100vw, (max-width: 860px) 50vw, 25vw";

function ShotButton({ image, index, onOpen }: { image: ProjectImage; index: number; onOpen: () => void }): ReactNode {
  // A captured post opens from a card of its own rather than a thumbnail: its
  // picture is a screenshot of someone else's page, which shrinks into an
  // unreadable grey rectangle and says nothing about what it is.
  if (image.post) return <PostButton post={image.post} onOpen={onOpen} />;

  // A before/after is dragged in place, so the frame can't also be the button:
  // the full-screen viewer opens from its own corner control instead.
  const pdf = isPdf(image.src);
  if (image.display === "compare" && image.after && !pdf) {
    return (
      <div className="pj-shot-compare">
        <CompareImage
          before={image.src}
          after={image.after}
          alt={image.alt}
          frame={image.frame}
          afterFrame={image.afterFrame}
          sizes={SHOT_SIZES}
          ratio={aspectRatio(image.aspect) ?? DEFAULT_ASPECT}
          loading={index === 0 ? "eager" : "lazy"}
        />
        <button
          type="button"
          className="pj-shot-zoom pj-shot-zoom--compare"
          onClick={onOpen}
          aria-label={`View ${image.caption || image.alt} full screen`}
        >
          <ZoomIcon />
        </button>
      </div>
    );
  }
  // A PDF is shown by its first page (the preview the Studio saved), whole
  // unless the Studio picks a shape for it; the rest of the file never loads here.
  const shown = pdf ? pdfPreviewSrc(image.src) : image.src;
  const ratio = pdf && !image.aspect ? null : aspectRatio(image.aspect);
  const frame = (
    <button
      type="button"
      className={`pj-shot-btn${ratio === null ? " pj-shot-btn--original" : ""}`}
      style={ratio === null ? undefined : { aspectRatio: ratio }}
      onClick={onOpen}
      aria-label={`View ${image.caption || image.alt} full screen`}
    >
      {/* The originals are editor-managed photos that can run to several
          megabytes each — far more than a thumbnail needs. `fill` lets
          next/image size against the frame (the image's aspect ratio,
          4:3 unless the Studio says otherwise) without knowing the
          file's dimensions, and `sizes` tracks the grid (one column on
          phones, two in a full-width block, two in a half-width column), so
          the optimizer serves a frame-sized WebP here. The Lightbox is
          where the untouched original finally loads. An animated GIF is
          the exception: the optimizer would only pass it through whole,
          so it is fetched directly and keeps its timing and loop. */}
      {ratio === null ? (
        // "Original": no frame to fill, so the image sets its own height and
        // nothing is cropped. width/height only seed the ratio until it loads.
        <Image
          src={shown}
          alt={image.alt}
          width={1600}
          height={1200}
          sizes={SHOT_SIZES}
          loading={index === 0 ? "eager" : "lazy"}
          unoptimized={isGif(shown)}
          style={{ width: "100%", height: "auto" }}
        />
      ) : (
        <Image
          src={shown}
          alt={image.alt}
          fill
          sizes={SHOT_SIZES}
          loading={index === 0 ? "eager" : "lazy"}
          unoptimized={isGif(shown)}
          className={image.fit === "contain" ? "pj-shot-img--contain" : undefined}
        />
      )}
      {pdf && <span className="pj-shot-tag">{pdfTag(image)}</span>}
      <span className="pj-shot-zoom" aria-hidden="true">
        <ZoomIcon />
      </span>
    </button>
  );

  // Downloading is the Studio's switch; without it the site offers the first page only.
  if (!pdf || !image.download) return frame;
  return (
    <>
      {frame}
      <a className="pj-shot-download" href={image.src} download suppressHydrationWarning>
        <DownloadIcon />
        <span>{ui.gallery.downloadPdf}</span>
      </a>
    </>
  );
}

/**
 * A project's photos as a responsive grid — one image fills the row, two sit
 * side by side, more wrap into rows. Every cell is a fixed-aspect frame (4:3
 * unless the image picks another shape in the Studio, or "Original" to draw
 * it uncropped), so the grid never needs its own scrollbar. Each
 * cell opens the full-screen viewer, and uncovers itself with a scroll-timed
 * wipe rather than just fading in.
 */
export function ProjectGallery({ images, projectName }: { images: ProjectImage[]; projectName: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const reduced = useReducedMotion();
  // A card added in the Studio but not yet given a file would otherwise render
  // an <Image> with src="" — which the browser resolves to the page itself and
  // fetches all over again. The viewer is handed the same filtered list, so the
  // indexes still line up.
  const shown = images.filter((image) => Boolean(image.src?.trim()));
  const enlargeable = shown.filter((image) => !image.post);
  const groupLabel = `${projectName} images — ${shown.length} in total`;

  if (shown.length === 0) return null;

  return (
    <div className="pj-gallery">
      {reduced ? (
        <div className="pj-gallery-grid" role="group" aria-label={groupLabel}>
          {shown.map((image, index) => (
            <figure className="pj-shot" key={`${image.src}-${index}`}>
              <ShotButton image={image} index={index} onOpen={() => setOpenAt(index)} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        <motion.div
          className="pj-gallery-grid"
          role="group"
          aria-label={groupLabel}
          initial="hidden"
          whileInView="shown"
          viewport={{ once: true, amount: 0.25, margin: "0px 0px -60px 0px" }}
          variants={gridVariants}
        >
          {shown.map((image, index) => (
            <motion.figure className="pj-shot" key={`${image.src}-${index}`} variants={shotVariants}>
              <ShotButton image={image} index={index} onOpen={() => setOpenAt(index)} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
            </motion.figure>
          ))}
        </motion.div>
      )}

      {/* The note is about enlarging pictures, so it counts only the pictures:
          a captured post carries its own "View LinkedIn post" instead. */}
      {enlargeable.length > 0 && (
        <p className="pj-gallery-note">
          {enlargeable.length === 1 ? ui.gallery.oneImage : fill(ui.gallery.manyImages, { count: enlargeable.length })}
          {enlargeable.some((image) => image.display === "compare" && image.after) && ` · ${ui.gallery.dragToCompare}`}
        </p>
      )}

      {openAt !== null && (
        <Lightbox
          images={shown}
          index={openAt}
          onIndexChange={setOpenAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </div>
  );
}
