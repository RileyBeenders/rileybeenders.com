import type { PageMeta } from "@/types/pages";

export type MoreInfoAboutHeader = {
  title: string;
  description: string[];
};

export type MoreInfoAboutMe = {
  title: string;
  description: string[];
};

export type MoreInfoReadMore = {
  label: string;
  href: string;
};

export type MoreInfoAboutSite = {
  title: string;
  description: string[];
  readMore?: MoreInfoReadMore;
};

export type MoreInfoGanttSection = {
  /** Shows the mermaid Gantt chart. */
  chartVisible: boolean;
  /** Shows the tracker table. The section is hidden when both flags are off. */
  tableVisible: boolean;
  title: string;
  /** Optional lead-in above the chart; omitted when there is nothing to say. */
  intro?: string;
  /** Above the table: what the gray (pre-site) rows mean. */
  tableNote: string;
  /** The words beside each status circle in the table key. */
  statusKey: {
    received: string;
    interviewing: string;
    closed: string;
  };
};

export type MoreInfoData = {
  meta: PageMeta;
  aboutHeader: MoreInfoAboutHeader;
  aboutMe: MoreInfoAboutMe;
  aboutSite: MoreInfoAboutSite;
  ganttSection: MoreInfoGanttSection;
};
