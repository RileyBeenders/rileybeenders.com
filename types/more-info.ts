export type MoreInfoHero = {
  eyebrow: string;
  title: string;
  description: string[];
};

export type MoreInfoGanttSection = {
  eyebrow: string;
  title: string;
  intro: string;
};

export type MoreInfoData = {
  hero: MoreInfoHero;
  ganttSection: MoreInfoGanttSection;
};
