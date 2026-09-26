import type {
  ProjectAdditionalInfo,
  ProjectDates,
  ProjectFeature,
  ProjectImage,
  ResumeBullet
} from "@/types/resume";
import type { PageMeta } from "@/types/pages";

export type AboutSiteHero = {
  title: string;
  tagline: string;
};

/**
 * The "About this site" page: the site as its own case study. Shaped like a
 * project (summary, bullets, gallery, case study) with a hero and the
 * feature deep-dive (stats, commit timeline, pillars, annotated screenshots),
 * edited from the Studio and refreshed by the site-timeline-sync skill.
 */
export type AboutSiteData = {
  meta: PageMeta;
  hero: AboutSiteHero;
  /** Start is the first commit; `ongoing` keeps the date bar running. */
  dates: ProjectDates;
  /** The index heading of the story section ("01  The site"). */
  storyHeading: string;
  summary: string;
  bullets: ResumeBullet[];
  images: ProjectImage[];
  caseStudy?: ProjectAdditionalInfo;
  feature: ProjectFeature;
  /** The closing note at the foot of the page. */
  outro: {
    lead: string;
    body: string;
  };
};
