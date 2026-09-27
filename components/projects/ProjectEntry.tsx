"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { ProjectView } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { ProjectGallery, type GalleryEditing } from "@/components/projects/ProjectGallery";
import { InlinePhoto, type PendingFlip } from "@/components/projects/InlinePhoto";
import { Lightbox } from "@/components/projects/Lightbox";
import { usePhotoMode, type DropTarget } from "@/components/projects/PhotoMode";
import { ProjectDateBox } from "@/components/projects/ProjectDateBox";
import { CaseStudy } from "@/components/projects/CaseStudy";
import { ProjectStatus } from "@/components/projects/ProjectStatus";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { ui } from "@/lib/copy";
import { canFloat, PLACE_WIDTH, resolvePlace, type ShownImage } from "@/lib/photo-place";
import type { ImagePlace } from "@/types/resume";

type ProjectEntryProps = {
  view: ProjectView;
  index: number;
  total: number;
};

/** Matches --ease in blueprint.css — framer-motion can't read CSS custom properties. */
const EASE = [0.22, 0.9, 0.28, 1] as const;

/** How far the media column drifts against the text column as the entry scrolls past — a classic parallax read of depth, with no pinning involved. */
const PARALLAX_RANGE = 56;

function ProjectBullet({ text, emphasis }: { text: string; emphasis?: string[] }) {
  return (
    <span className="pj-bullet-content">
      <EmphasizedText text={text} phrases={emphasis} className="pj-bullet-emphasis" />
    </span>
  );
}

const bulletListVariants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09, delayChildren: 0.3 } }
};
const bulletItemVariants = {
  hidden: { opacity: 0, y: 14 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } }
};

/**
 * One project, full height, no pinning. Summary and bullets sit beside a photo
 * grid; the deeper case study (problem, approach, impact) is tucked behind a
 * toggle instead of a scroll-scrubbed slide-in panel. Nothing here is clamped
 * to a fixed height, so nothing ever needs its own scrollbar.
 *
 * A photo with a `place` (set in Photo Mode, components/projects/PhotoMode.tsx)
 * leaves the grid and floats in the body text instead, at the start of one of
 * its paragraphs or bullets; with every photo placed, the text takes the full
 * width. Floats never leave .pj-body, so a photo can't cover the title, the
 * rules or the dates.
 */
export function ProjectEntry({ view, index, total }: ProjectEntryProps) {
  const { project, images, ownImages, proof } = view;
  // The date box rides the opening rule by default; bottom corners get a closing rule of their own.
  const datePosition = project.dates?.position ?? "top-right";
  const dateBox = project.dates?.start ? <ProjectDateBox dates={project.dates} position={datePosition} /> : null;
  const dateOnTop = dateBox && datePosition.startsWith("top");
  const dateOnBottom = dateBox && datePosition.startsWith("bottom");
  const dateInline = dateBox && datePosition === "inline";
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();
  const panelId = useId();
  // A link to this case study (a skill linked to a proof, lib/skill-links.ts)
  // names the toggle's id, so the browser scrolls to it; this opens it.
  const caseStudyAnchor = `project-${project.id}-case-study`;

  useEffect(() => {
    const openIfNamed = () => {
      if (window.location.hash === `#${caseStudyAnchor}`) setExpanded(true);
    };
    openIfNamed();
    window.addEventListener("hashchange", openIfNamed);
    return () => window.removeEventListener("hashchange", openIfNamed);
  }, [caseStudyAnchor]);

  // The body's blocks, in the order a placement counts them: the summary's paragraphs, then the bullets.
  const paragraphs = splitParagraphs(project.summary);
  const blockCount = paragraphs.length + project.bullets.length;

  // Placements, by the image's index in the project's own list. Photo Mode
  // changes them here first, so the page answers at once; the saved file comes
  // back through hot reload and takes over again.
  const savedPlaces = useMemo(() => (ownImages ? images.map((image) => image.place) : []), [images, ownImages]);
  const savedKey = JSON.stringify(savedPlaces);
  const [places, setPlaces] = useState<(ImagePlace | undefined)[]>(savedPlaces);
  const [placesFrom, setPlacesFrom] = useState(savedKey);
  if (placesFrom !== savedKey) {
    setPlacesFrom(savedKey);
    setPlaces(savedPlaces);
  }

  // Empty cards (no file yet) are left out; `at` is the photo's place in the viewer.
  const shown: ShownImage[] = images
    .map((image, i) => ({ image, index: i }))
    .filter(({ image }) => Boolean(image.src?.trim()))
    .map((entry, at) => ({ ...entry, at }));
  const placeOf = (item: ShownImage) => (canFloat(item.image) ? resolvePlace(places[item.index], blockCount) : null);
  const galleryItems = shown.filter((item) => !placeOf(item));
  const floated = shown.filter((item) => placeOf(item));
  const [openAt, setOpenAt] = useState<number | null>(null);

  const photo = usePhotoMode();
  const editing = photo.on && ownImages && blockCount > 0;
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const flip = useRef<PendingFlip>(null);

  const setPlace = (item: ShownImage, place: ImagePlace | undefined, save = true) => {
    setPlaces((current) => {
      const next = [...current];
      next[item.index] = place;
      return next;
    });
    if (!save) return;
    photo.save(project.id, item.index, item.image.src, place ?? null).then((saved) => {
      // Refused or unreachable: go back to what the file says.
      if (!saved) setPlaces(savedPlaces);
    });
  };

  const drop = (item: ShownImage) => (target: DropTarget, from: DOMRect) => {
    const current = placeOf(item);
    if (target.kind === "gallery") {
      if (current) setPlace(item, undefined);
      return;
    }
    if (current && current.at === target.at && current.side === target.side) return;
    flip.current = { index: item.index, rect: from };
    setPlace(item, { at: target.at, side: target.side, width: current?.width ?? PLACE_WIDTH.initial });
  };

  const grab = (event: React.PointerEvent, figure: HTMLElement, item: ShownImage) => {
    if (!sectionRef.current) return;
    photo.startDrag({
      event,
      source: figure,
      // The shell, not the full-bleed section: the ghost keeps to the project's own column.
      entry: sectionRef.current.querySelector<HTMLElement>(".bp-shell") ?? sectionRef.current,
      body: bodyRef.current,
      gallery: mediaRef.current ?? returnRef.current,
      width: placeOf(item)?.width ?? PLACE_WIDTH.initial,
      onDrop: drop(item)
    });
  };

  const galleryEditing: GalleryEditing | undefined = editing
    ? {
        onGrab: grab,
        onPlace: (item) => setPlace(item, { at: 0, side: "right", width: PLACE_WIDTH.initial })
      }
    : undefined;

  /** The photos floated at the start of one block. */
  const floatsAt = (block: number) =>
    floated
      .filter((item) => placeOf(item)!.at === block)
      .map((item) => {
        const place = placeOf(item)!;
        return (
          <InlinePhoto
            key={`${item.image.src}-${item.index}`}
            item={item}
            place={place}
            editing={editing}
            flip={flip}
            onOpen={() => setOpenAt(item.at)}
            onGrab={(event, figure) => grab(event, figure, item)}
            onResize={(width, commit) => setPlace(item, { ...place, width }, commit)}
            onFlip={() => setPlace(item, { ...place, side: place.side === "left" ? "right" : "left" })}
            onStep={(direction) => setPlace(item, { ...place, at: place.at + direction })}
            onReturn={() => setPlace(item, undefined)}
            canStepUp={place.at > 0}
            canStepDown={place.at < blockCount - 1}
          />
        );
      });

  const { scrollYProgress: mediaProgress } = useScroll({
    // A text-only entry never renders the media column, and a target ref that
    // stays unattached throws; it has no parallax to drive anyway.
    target: galleryItems.length > 0 ? mediaRef : undefined,
    offset: ["start end", "end start"]
  });
  const mediaProgressSmooth = useSpring(mediaProgress, { stiffness: 220, damping: 36, mass: 0.4 });
  const mediaY = useTransform(mediaProgressSmooth, [0, 1], [PARALLAX_RANGE, -PARALLAX_RANGE]);

  const caseStudy = proof && <CaseStudy proof={proof} />;

  return (
    <section
      ref={sectionRef}
      id={`project-${project.id}`}
      className={`pj-entry${index % 2 === 1 ? " pj-entry--reverse" : ""}${galleryItems.length === 0 ? " pj-entry--text-only" : ""}${editing ? " is-arranging" : ""}`}
      aria-label={project.name}
    >
      <div className="bp-shell">
        <div className="pj-entry-rule">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          {dateOnTop && <Reveal delay={0.3}>{dateBox}</Reveal>}
        </div>

        <div className="pj-entry-grid">
          <div className="pj-entry-text">
            <Reveal>
              <p className="pj-index">
                {String(index + 1).padStart(2, "0")} <span aria-hidden="true">/</span> {String(total).padStart(2, "0")}
              </p>
            </Reveal>
            <Reveal delay={0.08}><h2 className="pj-title">{project.name}</h2></Reveal>
            {project.type && (
              <Reveal delay={0.14}><p className="pj-subtitle">{project.type}</p></Reveal>
            )}
            <Reveal as="rule" delay={0.2}><div className="pj-head-rule" /></Reveal>
            {dateInline && <Reveal delay={0.24}>{dateBox}</Reveal>}

            <div ref={bodyRef} className={`pj-body${floated.length > 0 || editing ? " pj-body--flow" : ""}`}>
              {paragraphs.length > 0 && (
                <Reveal delay={0.26}>
                  {paragraphs.map((paragraph, i) => (
                    <Fragment key={i}>
                      {floatsAt(i)}
                      <p className="pj-summary" data-para="" data-pj-block={i}>{paragraph}</p>
                    </Fragment>
                  ))}
                </Reveal>
              )}
              {project.status && (
                <Reveal delay={0.3}><ProjectStatus text={project.status} /></Reveal>
              )}

              {project.bullets.length > 0 && (
                reduced ? (
                  <ul className="pj-bullets">
                    {project.bullets.map((bullet, i) => (
                      <li key={bullet.text} data-pj-block={paragraphs.length + i}>
                        {floatsAt(paragraphs.length + i)}
                        <ProjectBullet {...bullet} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <motion.ul
                    className="pj-bullets"
                    initial="hidden"
                    whileInView="shown"
                    viewport={{ once: true, amount: 0.3, margin: "0px 0px -80px 0px" }}
                    variants={bulletListVariants}
                  >
                    {project.bullets.map((bullet, i) => (
                      <motion.li key={bullet.text} variants={bulletItemVariants} data-pj-block={paragraphs.length + i}>
                        {floatsAt(paragraphs.length + i)}
                        <ProjectBullet {...bullet} />
                      </motion.li>
                    ))}
                  </motion.ul>
                )
              )}
            </div>

            {/* With every photo in the text there is no gallery to drop one back on; this stands in for it. */}
            {editing && galleryItems.length === 0 && (
              <div ref={returnRef} className="pj-photo-return">Drop a photo here to put it back in the gallery</div>
            )}

            {proof && (
              <Reveal delay={0.32}>
                <button
                  type="button"
                  id={caseStudyAnchor}
                  className="pj-toggle"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setExpanded((value) => !value)}
                >
                  <span>{expanded ? ui.caseStudy.hide : ui.caseStudy.view}</span>
                  <ChevronDown
                    className={`pj-toggle-icon${expanded ? " is-open" : ""}`}
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </button>
              </Reveal>
            )}
          </div>

          {galleryItems.length > 0 && (
            <div className="pj-entry-media" ref={mediaRef}>
              <Reveal delay={0.14}>
                {/* Photo Mode holds the gallery still, so a drop lands where it looks like it will. */}
                <motion.div style={{ y: reduced || editing ? 0 : mediaY }}>
                  <ProjectGallery
                    images={images}
                    projectName={project.name}
                    items={galleryItems}
                    onOpen={setOpenAt}
                    editing={galleryEditing}
                  />
                </motion.div>
              </Reveal>
            </div>
          )}
        </div>

        {proof && (
          reduced ? (
            expanded && <div id={panelId} className="pj-case-study-wrap">{caseStudy}</div>
          ) : (
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  id={panelId}
                  key="case-study"
                  className="pj-case-study-wrap"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.55, ease: EASE }}
                >
                  {caseStudy}
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}

        {openAt !== null && (
          <Lightbox
            images={shown.map(({ image }) => image)}
            index={openAt}
            onIndexChange={setOpenAt}
            onClose={() => setOpenAt(null)}
          />
        )}

        {dateOnBottom && (
          <div className="pj-entry-rule pj-entry-rule--close">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <Reveal delay={0.2}>{dateBox}</Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
