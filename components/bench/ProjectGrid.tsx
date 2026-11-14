"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type { CatalogEntry } from "@/lib/catalog";
import { ProjectCard } from "@/components/bench/ProjectCard";
import { ProjectDialog } from "@/components/bench/ProjectDialog";
import { ProjectBody } from "@/components/bench/ProjectBody";
import { ui } from "@/lib/copy";
import { PROJECT_CATEGORIES, inCategory } from "@/lib/categories";
import type { ProjectCategory } from "@/types/resume";

type ProjectGridProps = {
  entries: CatalogEntry[];
  today: string;
  paletteId: string;
  /** Type filter chips above the grid (the projects page). */
  filters?: boolean;
  /** A "view all" link after the grid (the home page). */
  viewAllHref?: string;
};

const HASH = /^#project-([a-z0-9-]+?)(-case-study)?$/i;

/**
 * The grid of project tiles and the dialog they open into (a tile morphs
 * into the box; see ProjectCard / ProjectDialog). Which project is
 * open is the URL's hash (`#project-<id>`, with `-case-study` to open the
 * case study as well), so the resume's Read more links, the linked skills,
 * and a shared link all land on the right project with the dialog up, and
 * the browser's back button closes it.
 */
export function ProjectGrid({ entries, today, paletteId, filters = false, viewAllHref }: ProjectGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [caseStudy, setCaseStudy] = useState(false);
  const [category, setCategory] = useState<ProjectCategory | null>(null);

  const byId = useMemo(() => new Map(entries.map((entry) => [entry.project.id, entry])), [entries]);
  // The chips are the shared categories at least one entry sits in, in their fixed order.
  const categories = useMemo(
    () => PROJECT_CATEGORIES.filter((item) => entries.some((entry) => inCategory(entry.project, item))),
    [entries]
  );
  const shown = category ? entries.filter((entry) => inCategory(entry.project, category)) : entries;

  const readHash = useCallback(() => {
    const match = HASH.exec(window.location.hash);
    if (match && byId.has(match[1])) {
      setOpenId(match[1]);
      setCaseStudy(Boolean(match[2]));
    } else {
      setOpenId(null);
    }
  }, [byId]);

  useEffect(() => {
    readHash();
    window.addEventListener("hashchange", readHash);
    window.addEventListener("popstate", readHash);
    return () => {
      window.removeEventListener("hashchange", readHash);
      window.removeEventListener("popstate", readHash);
    };
  }, [readHash]);

  const open = useCallback((id: string) => {
    window.history.pushState(null, "", `#project-${id}`);
    setCaseStudy(false);
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    if (HASH.test(window.location.hash)) {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    }
    setOpenId(null);
  }, []);

  const openEntry = openId ? byId.get(openId) ?? null : null;

  return (
    <>
      {filters && categories.length > 1 && (
        <div className="filters" role="group" aria-label="Filter by category">
          <button type="button" className={`filter${category === null ? " is-active" : ""}`} aria-pressed={category === null} onClick={() => setCategory(null)}>
            {ui.projects.all}
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`filter${category === item ? " is-active" : ""}`}
              aria-pressed={category === item}
              onClick={() => setCategory(category === item ? null : item)}
            >
              {ui.projects.categories?.[item] || item}
            </button>
          ))}
        </div>
      )}

      {shown.length > 0 ? (
        <div className="project-grid">
          {shown.map((entry, index) => (
            <ProjectCard key={entry.project.id} entry={entry} index={index} onOpen={open} />
          ))}
        </div>
      ) : (
        <p className="project-empty">{ui.projects.all}: 0</p>
      )}

      {viewAllHref && (
        <div className="project-grid-foot">
          <Link className="btn" href={viewAllHref} suppressHydrationWarning>
            <span>{ui.projects.viewAll}</span>
            <ArrowRight className="bp-arrow" size={15} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      )}

      <ProjectDialog
        open={openEntry ? { id: openEntry.project.id, name: openEntry.project.name, type: openEntry.project.type } : null}
        onClose={close}
      >
        {openEntry && (
          <ProjectBody key={openEntry.project.id} entry={openEntry} today={today} paletteId={paletteId} caseStudyOpen={caseStudy} mode="dialog" />
        )}
      </ProjectDialog>
    </>
  );
}
