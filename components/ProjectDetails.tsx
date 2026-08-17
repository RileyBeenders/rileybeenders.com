"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { ProjectAdditionalInfo, ProjectImage } from "@/types/resume";

type ProjectImageGalleryProps = {
  images: ProjectImage[];
  projectName: string;
  onOpen: (index: number) => void;
};

const PROJECT_IMAGE_ROTATION_MS = 10_000;

export function ProjectImageGallery({ images, projectName, onOpen }: ProjectImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageIndex = activeIndex % images.length;
  const image = images[imageIndex];

  useEffect(() => {
    if (images.length < 2) return;

    const rotationTimer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, PROJECT_IMAGE_ROTATION_MS);

    return () => window.clearTimeout(rotationTimer);
  }, [activeIndex, images.length]);

  return (
    <div className="project-gallery project-gallery-carousel" aria-label={`${projectName} image gallery`}>
      <AnimatePresence initial={false} mode="wait">
        <motion.button
          className={`project-gallery-item ${image.fit === "contain" ? "project-gallery-item-contain" : ""}`}
          key={`${image.src}-${imageIndex}`}
          type="button"
          onClick={() => onOpen(imageIndex)}
          aria-label={`Open image ${imageIndex + 1} of ${images.length}: ${image.caption ?? image.alt}`}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.32, ease: "easeOut" }}
        >
          <img src={image.src} alt={image.alt} loading="lazy" />
          <span className="project-gallery-caption">
            <span>{image.caption ?? `${projectName} image ${imageIndex + 1}`}</span>
          </span>
          <span className="project-gallery-expand" aria-hidden="true">
            <Maximize2 size={16} />
          </span>
        </motion.button>
      </AnimatePresence>

      {images.length > 1 && (
        <div
          className="project-gallery-progress"
          key={imageIndex}
          role="status"
          aria-live="polite"
          aria-label={`Image ${imageIndex + 1} of ${images.length}`}
        >
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle className="project-gallery-progress-track" cx="26" cy="26" r="22" pathLength="100" />
            <circle
              className="project-gallery-progress-indicator"
              cx="26"
              cy="26"
              r="22"
              pathLength="100"
              style={{ animationDuration: `${PROJECT_IMAGE_ROTATION_MS}ms` }}
            />
          </svg>
          <span aria-hidden="true">{imageIndex + 1}/{images.length}</span>
        </div>
      )}
    </div>
  );
}

type ProjectImageLightboxProps = {
  images: ProjectImage[];
  index: number;
  projectName: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

export function ProjectImageLightbox({
  images,
  index,
  projectName,
  onClose,
  onPrevious,
  onNext,
  onSelect
}: ProjectImageLightboxProps) {
  const image = images[index];
  const hasMultipleImages = images.length > 1;

  return (
    <motion.div
      className="image-lightbox-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`${projectName} image viewer`}
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 18 }}
        transition={{ duration: 0.18 }}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="image-lightbox-header">
          <div>
            <p className="eyebrow">Project Gallery</p>
            <h2>{projectName}</h2>
          </div>
          <div className="image-lightbox-actions">
            <span aria-live="polite">{index + 1} / {images.length}</span>
            <button type="button" onClick={onClose} aria-label="Close image viewer">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="image-lightbox-stage">
          {hasMultipleImages && (
            <button
              className="image-lightbox-nav image-lightbox-nav-previous"
              type="button"
              onClick={onPrevious}
              aria-label="View previous image"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <figure>
            <img src={image.src} alt={image.alt} />
            {image.caption && <figcaption>{image.caption}</figcaption>}
          </figure>

          {hasMultipleImages && (
            <button
              className="image-lightbox-nav image-lightbox-nav-next"
              type="button"
              onClick={onNext}
              aria-label="View next image"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {hasMultipleImages && (
          <div className="image-lightbox-thumbnails" aria-label="Choose an image">
            {images.map((thumbnail, thumbnailIndex) => (
              <button
                className={thumbnailIndex === index ? "is-active" : ""}
                key={`${thumbnail.src}-${thumbnailIndex}`}
                type="button"
                onClick={() => onSelect(thumbnailIndex)}
                aria-label={`View image ${thumbnailIndex + 1}: ${thumbnail.caption ?? thumbnail.alt}`}
                aria-current={thumbnailIndex === index ? "true" : undefined}
              >
                <img src={thumbnail.src} alt="" />
              </button>
            ))}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}

type AdditionalInfoDrawerProps = {
  additionalInfo: ProjectAdditionalInfo;
  onClose: () => void;
};

export function AdditionalInfoDrawer({ additionalInfo, onClose }: AdditionalInfoDrawerProps) {
  return (
    <motion.div
      className="drawer-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        className="additional-info-drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="drawer-close" onClick={onClose} aria-label="Close additional information">
          <X size={20} />
        </button>

        <div className="drawer-hero">
          <p className="eyebrow">Additional Info</p>
          <h2>{additionalInfo.title}</h2>
          <p>{additionalInfo.subtitle}</p>
        </div>

        <div className="asset-strip">
          {additionalInfo.assets.map((asset) => (
            <figure key={asset.src}>
              <img src={asset.src} alt={asset.alt} />
              <figcaption>{asset.label}</figcaption>
            </figure>
          ))}
        </div>

        <AdditionalInfoSection title="Problem">
          <p>{additionalInfo.problem}</p>
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Constraints">
          <Checklist items={additionalInfo.constraints} />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Approach">
          <Checklist items={additionalInfo.approach} ordered />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Impact">
          <Checklist items={additionalInfo.impact} />
        </AdditionalInfoSection>

        <AdditionalInfoSection title="Tools">
          <div className="skill-pills drawer-pills">
            {additionalInfo.tools.map((tool) => <span key={tool}>{tool}</span>)}
          </div>
        </AdditionalInfoSection>
      </motion.aside>
    </motion.div>
  );
}

function AdditionalInfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="additional-info-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function Checklist({ items, ordered = false }: { items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className="drawer-list">
      {items.map((item) => <li key={item}>{item}</li>)}
    </ListTag>
  );
}
