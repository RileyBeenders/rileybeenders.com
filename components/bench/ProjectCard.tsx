"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { CatalogEntry } from "@/lib/catalog";
import { BpMark } from "@/components/blueprint/BpMark";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { formatDate } from "@/lib/dates";
import { isPdf } from "@/lib/media";
import { fill, ui } from "@/lib/copy";
import { useSpotlight } from "@/lib/useSpotlight";

const EASE = [0.22, 0.9, 0.28, 1] as const;
/** The spring a tile morphs with when it opens into its dialog (ProjectDialog shares it). */
export const MORPH = { type: "spring", stiffness: 380, damping: 36, mass: 0.8 } as const;
/** The shared layoutId a tile and its dialog carry, so one grows out of the other. */
export const tileLayoutId = (id: string) => `project-tile-${id}`;

type ProjectCardProps = {
  entry: CatalogEntry;
  index: number;
  onOpen: (id: string) => void;
};

function photoCount(entry: CatalogEntry): number {
  return entry.images.filter((image) => image.src?.trim() && !image.post && !isPdf(image.src)).length;
}

function dateLine(entry: CatalogEntry): string | null {
  const dates = entry.project.dates;
  if (!dates?.start) return null;
  const start = formatDate(dates.start, "month");
  if (dates.ongoing) return `${start} → ${ui.dates.present}`;
  return dates.end ? `${start} → ${formatDate(dates.end, "month")}` : start;
}

/**
 * One tile in the project grid: the cover (the first photograph, or the
 * monogram on a soft wash when a project has none yet) with the type and the
 * "This site" tag over it, then the name, two lines of the summary, and the
 * dates. The whole tile is the button that opens the project's dialog, and
 * the dialog grows out of it (they share a layoutId); its id is the anchor
 * the resume's Read more links point at.
 */
export function ProjectCard({ entry, index, onOpen }: ProjectCardProps) {
  const reduced = useReducedMotion();
  const onSpotMove = useSpotlight();
  const { project, cover, isSite } = entry;
  const photos = photoCount(entry);
  const when = dateLine(entry);
  const summary = splitParagraphs(project.summary)[0] ?? "";
  const unoptimized = cover ? cover.unoptimized || /\.svg$/i.test(cover.src) : false;
  const contain = entry.images[0]?.fit === "contain" && isPdf(entry.images[0]?.src ?? "");

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index, 5) * 0.06 }}
    >
      <motion.article
        id={`project-${project.id}`}
        className={`card card--hover project-tile bp-spot${isSite ? " project-card--site" : ""}`}
        layoutId={reduced ? undefined : tileLayoutId(project.id)}
        layout={!reduced}
        transition={{ layout: MORPH }}
        style={{ borderRadius: 22 }}
        onPointerMove={onSpotMove}
      >
        <button type="button" className="project-card" style={{ border: 0, background: "transparent" }} onClick={() => onOpen(project.id)} aria-label={`${project.name}: open`}>
          <div className={`project-card-cover${contain ? " project-card-cover--contain" : ""}`}>
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 760px) 100vw, (max-width: 980px) 50vw, 33vw"
                unoptimized={unoptimized}
                loading={index < 3 ? "eager" : "lazy"}
              />
            ) : (
              <div className="project-card-typo" aria-hidden="true">
                <BpMark id={`cover-${project.id}`} size={54} animated />
              </div>
            )}
            <div className="project-card-tags">
              <span className="project-card-type">{project.type}</span>
              {isSite && <span className="project-card-type project-card-badge">{ui.projects.siteBadge}</span>}
            </div>
          </div>

          <div className="project-card-body">
            <h3>{project.name}</h3>
            {summary && <p className="project-card-summary">{summary}</p>}
            <div className="project-card-meta">
              <span>
                {when}
                {when && photos > 0 && " · "}
                {photos > 0 && (photos === 1 ? ui.projects.onePhoto : fill(ui.projects.photos, { count: photos }))}
              </span>
              <span className="project-card-open" aria-hidden="true">
                <ArrowUpRight size={14} strokeWidth={2} />
              </span>
            </div>
          </div>
        </button>
      </motion.article>
    </motion.div>
  );
}
