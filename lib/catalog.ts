import { readFileSync } from "node:fs";
import path from "node:path";
import resumeData from "@/data/resumeData";
import aboutSiteData from "@/data/site/about-site.json";
import moreInfoData from "@/data/more-info/more-info.json";
import pastApplications from "@/data/more-info/past-applications.json";
import { buildProjectViews, buildProofView, type ProjectView } from "@/lib/projects";
import { APPLICATION_COLUMNS, buildApplicationRows, type ApplicationRow, type PastApplication } from "@/lib/applications";
import { parseGanttFile } from "@/lib/gantt";
import { isPdf, isVideo, pdfPreviewSrc, videoPosterSrc } from "@/lib/media";
import { REPO_URL } from "@/lib/site";
import type { AboutSiteData } from "@/types/about-site";
import type { PageMeta } from "@/types/pages";
import type { MoreInfoData } from "@/types/more-info";
import type { Project, ProjectFeature, ProjectImage } from "@/types/resume";

/**
 * The catalog is every card on the projects page and in the home page's grid:
 * the published projects from data/projects/projects.json, then the site
 * itself (data/site/about-site.json) as one more entry. The About-this-site
 * page used to be its own route with its own layout; in the redesign it is a
 * project like the others, with the deep dive (stats, timeline, pillars,
 * demos) and the application tracker as sections of that one entry.
 */

export const SITE_PROJECT_ID = "rileybeenders-com";

const aboutSite = aboutSiteData as AboutSiteData;
const moreInfo = moreInfoData as MoreInfoData;

/** The application tracker that used to live on /more-info, read for the site project's page. */
export type TrackerSection = {
  title: string;
  intro?: string;
  tableNote: string;
  statusKey: MoreInfoData["ganttSection"]["statusKey"];
  columns: string[];
  rows: ApplicationRow[];
  /** The mermaid gantt source, when the Studio has the chart switched on. */
  chart?: string;
  /** The table, when the Studio has it switched on. */
  table: boolean;
};

/** One entry's everything: the project, its gallery, its case study, and the extras only the site project carries. */
export type CatalogEntry = ProjectView & {
  /** Cover for the card: the first photograph, a PDF's first page, a video's poster, or nothing (a typographic cover). */
  cover: { src: string; alt: string; unoptimized?: boolean } | null;
  /** The short line under a card's name. */
  tagline?: string;
  /** True for the site's own case study. */
  isSite: boolean;
  feature?: ProjectFeature;
  tracker?: TrackerSection;
  /** The site entry's own tab title and description (About this site → Browser tab & search). */
  meta?: PageMeta;
  /** The closing note at the foot of the site entry. */
  outro?: { lead: string; body: string };
};

function coverFor(images: ProjectImage[]): CatalogEntry["cover"] {
  for (const image of images) {
    if (!image.src?.trim() || image.post) continue;
    if (isPdf(image.src)) return { src: pdfPreviewSrc(image.src), alt: image.alt };
    if (isVideo(image.src)) return { src: videoPosterSrc(image.src), alt: image.alt };
    return { src: image.src, alt: image.alt, unoptimized: /\.gif$/i.test(image.src) };
  }
  return null;
}

/** The site as a project: the About-this-site data reshaped into the same entry the others use. */
function siteProject(): Project {
  return {
    id: SITE_PROJECT_ID,
    name: aboutSite.caseStudy?.title ?? aboutSite.hero.title,
    type: aboutSite.hero.title,
    summary: aboutSite.summary,
    bullets: aboutSite.bullets,
    images: aboutSite.images,
    additionalInfo: aboutSite.caseStudy,
    dates: aboutSite.dates,
    links: [{ label: aboutSite.feature.repoLabel ?? "GitHub", href: REPO_URL }]
  };
}

let trackerCache: TrackerSection | null | undefined;

function tracker(): TrackerSection | null {
  if (trackerCache !== undefined) return trackerCache;
  const section = moreInfo.ganttSection;
  if (!section.tableVisible && !section.chartVisible) return (trackerCache = null);
  try {
    const raw = readFileSync(path.join(process.cwd(), "data/more-info/gantt.md"), "utf8");
    const parsed = parseGanttFile(raw);
    trackerCache = {
      title: section.title,
      intro: section.intro,
      tableNote: section.tableNote,
      statusKey: section.statusKey,
      columns: APPLICATION_COLUMNS,
      rows: buildApplicationRows(parsed, (pastApplications as { applications: PastApplication[] }).applications),
      chart: section.chartVisible ? parsed.chart : undefined,
      table: section.tableVisible
    };
  } catch {
    trackerCache = null;
  }
  return trackerCache;
}

let catalogCache: CatalogEntry[] | undefined;

/** Every published entry, in the order the projects page shows them: the projects by `order`, then the site. */
export function getCatalog(): CatalogEntry[] {
  if (catalogCache) return catalogCache;
  const views = buildProjectViews(resumeData.projects, resumeData.proofs).map<CatalogEntry>((view) => ({
    ...view,
    cover: coverFor(view.images),
    tagline: view.project.additionalInfo?.subtitle,
    isSite: false
  }));

  const site = siteProject();
  const siteEntry: CatalogEntry = {
    project: site,
    images: site.images ?? [],
    ownImages: true,
    proof: buildProofView(site, []),
    cover: coverFor(site.images ?? []),
    tagline: aboutSite.hero.tagline,
    isSite: true,
    feature: aboutSite.feature,
    tracker: tracker() ?? undefined,
    meta: aboutSite.meta,
    outro: aboutSite.outro
  };

  catalogCache = resumeData.visibility.projectsSection ? [...views, siteEntry] : [siteEntry];
  return catalogCache;
}

export function getEntry(id: string): CatalogEntry | undefined {
  return getCatalog().find((entry) => entry.project.id === id);
}

/** The entries the home page's grid shows: every one, the site last. */
export function getFeatured(): CatalogEntry[] {
  return getCatalog();
}

/** The distinct project types, in catalog order, for the filter chips. */
export function getCatalogTypes(): string[] {
  return [...new Set(getCatalog().map((entry) => entry.project.type).filter(Boolean))];
}
