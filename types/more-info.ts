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
  title: string;
  intro: string;
};

export type MoreInfoData = {
  aboutHeader: MoreInfoAboutHeader;
  aboutMe: MoreInfoAboutMe;
  aboutSite: MoreInfoAboutSite;
  ganttSection: MoreInfoGanttSection;
};
