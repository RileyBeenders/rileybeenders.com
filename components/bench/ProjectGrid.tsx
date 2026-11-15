"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
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
/** The picked tab's line slides like the Skills and Tools bar's. */
const SLIDE = { type: "spring", stiffness: 420, damping: 38, mass: 0.7 } as const;

export function ProjectGrid({ entries, today, paletteId, filters = false, viewAllHref }: ProjectGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [caseStudy, setCaseStudy] = useState(false);
  const [category, setCategory] = useState<ProjectCategory | null>(null);
  const reduced = useReducedMotion();

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

  // Each filter is its own layout group, remounted (keyed) when the filter
  // changes, so the tiles deal in again with the usual rise and stagger
  // instead of the ones that stay springing across the grid to new spots.
  // (LayoutGroup reads its id once, so the key is what changes it.) The
  // dialog sits in the same group, so a tile still grows into it; the filter
  // buttons sit outside it and keep focus.
  const group = `projects-${category ?? "all"}`;

  // On /projects the filters are the Skills and Tools bar: mono tabs with a
  // dot in each category's colour (All first, picked on load) and a line
  // under the picked one that slides between them; the grid sits in the tile
  // under the bar. The home page's grid has no bar.
  const bar = filters && categories.length > 1;
  const tab = (value: ProjectCategory | null, label: string, tone: string, index: number) => {
    const on = category === value;
    return (
      <button
        key={value ?? "all"}
        type="button"
        className={`skills-tab${value === null ? " skills-tab--all" : ""}${on ? " is-active" : ""}`}
        aria-pressed={on}
        onClick={() => setCategory(on ? null : value)}
        style={{ "--grp": tone, "--i": index } as CSSProperties}
      >
        {on && (reduced
          ? <span className="skills-tab-mark" aria-hidden="true" />
          : <motion.span layoutId="project-tab-mark" className="skills-tab-mark" transition={SLIDE} aria-hidden="true" />)}
        <span className="skills-tab-dot" aria-hidden="true" />
        <span className="skills-tab-label">{label}</span>
      </button>
    );
  };
  const frame = (children: ReactNode) => bar ? (
    <div className="card skills-box project-box">
      <div className="skills-tabs" role="group" aria-label="Filter by category">
        {tab(null, ui.projects.all, "var(--accent)", 0)}
        {categories.map((item, index) => tab(item, ui.projects.categories?.[item] || item, `var(--grp-${(index % 7) + 1})`, index + 1))}
      </div>
      <div className="skills-body">{children}</div>
    </div>
  ) : children;

  return (
    <>
      {frame(
      <LayoutGroup id={group} key={group}>
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
      </LayoutGroup>
      )}
    </>
  );
}
