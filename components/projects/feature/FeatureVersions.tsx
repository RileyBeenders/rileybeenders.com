"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ProjectImage, SiteVersion } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { Lightbox } from "@/components/projects/Lightbox";

type FeatureVersionsProps = {
  versions: SiteVersion[];
};

/**
 * Every design the site has had. The current one comes first and largest,
 * marked live, with its home and projects captures side by side; the older
 * ones follow newest first as tiles, each with a capture, its dates, what it
 * brought, and a link to its frozen snapshot (public/versions/<slug>/, made by
 * scripts/snapshot-version.mjs). Every capture opens the shared viewer.
 */
export function FeatureVersions({ versions }: FeatureVersionsProps) {
  const ordered = useMemo(() => [...versions].sort((a, b) => Number(Boolean(b.current)) - Number(Boolean(a.current))), [versions]);
  const current = ordered.find((version) => version.current);
  const older = ordered.filter((version) => !version.current);

  // One viewer for every capture on the block, in reading order.
  const viewerImages: ProjectImage[] = useMemo(
    () => ordered.flatMap((version) => (version.images ?? []).map((image) => ({ src: image.src, alt: image.alt, caption: `${version.name} · ${version.dates}`, fit: "contain" as const }))),
    [ordered]
  );
  const [openAt, setOpenAt] = useState<number | null>(null);
  const indexOf = (src: string) => viewerImages.findIndex((image) => image.src === src);

  const shot = (image: { src: string; alt: string }, sizes: string) => (
    <button type="button" className="ver-shot" onClick={() => setOpenAt(indexOf(image.src))} aria-label={`${image.alt}: view larger`}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} />
    </button>
  );

  return (
    <div className="ver">
      {current && (
        <Reveal>
          <article className="ver-current card">
            <div className="ver-current-text">
              <p className="ver-live"><span className="ver-live-dot" aria-hidden="true" />Live now</p>
              <h3>{current.name}</h3>
              <p className="ver-dates">{current.dates}</p>
              <p className="ver-summary">{current.summary}</p>
              {(current.changes?.length ?? 0) > 0 && (
                <ul className="ver-changes">{current.changes!.map((line) => <li key={line}>{line}</li>)}</ul>
              )}
            </div>
            {(current.images?.length ?? 0) > 0 && (
              <div className="ver-current-shots">
                {current.images!.slice(0, 2).map((image) => <div key={image.src}>{shot(image, "(max-width: 760px) 100vw, 40vw")}</div>)}
              </div>
            )}
          </article>
        </Reveal>
      )}

      {older.length > 0 && (
        <ol className="ver-list">
          {older.map((version, index) => (
            <li key={version.name}>
              <Reveal delay={Math.min(index, 3) * 0.06}>
              <div className="ver-item card">
                {version.images?.[0] && shot(version.images[0], "(max-width: 760px) 100vw, 30vw")}
                <div className="ver-item-text">
                  <h3>{version.name}</h3>
                  <p className="ver-dates">{version.dates}</p>
                  <p className="ver-summary">{version.summary}</p>
                  {(version.changes?.length ?? 0) > 0 && (
                    <ul className="ver-changes">{version.changes!.map((line) => <li key={line}>{line}</li>)}</ul>
                  )}
                  {version.snapshotHref && (
                    <a className="btn btn--sm ver-open" href={version.snapshotHref} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      <span>Open this version</span>
                      <ArrowUpRight size={15} strokeWidth={2} aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
              </Reveal>
            </li>
          ))}
        </ol>
      )}

      {openAt !== null && openAt >= 0 && (
        <Lightbox images={viewerImages} index={openAt} onIndexChange={setOpenAt} onClose={() => setOpenAt(null)} />
      )}
    </div>
  );
}
