/**
 * Page copy that used to be written into the page components, now edited in
 * the Studio. A `{count}`, `{company}` or `{start}` in a string is filled in
 * by the page (lib/copy.ts → fill).
 */

/** A page's browser-tab title and its search/share description. */
export type PageMeta = {
  title: string;
  description: string;
};

export type LinkText = {
  text: string;
  href: string;
};

/**
 * How a resume bullet's "Read more" button moves: `data-motion` on the link,
 * styled in app/(site)/bullet-link.css and chosen in the Studio's Home page
 * (READ_MORE_MOTIONS in studio/ui/schema.js).
 */
export type ReadMoreAnimation = "sweep" | "roll" | "launch" | "offset" | "trace" | "glint" | "still";

/**
 * How a skill linked to a project or proof marks its border, and how it
 * shows what it links to on hover: `data-border` / `data-reveal` on the
 * pill, styled in app/(site)/skill-pills.css and chosen in the Studio's
 * Home page (SKILL_BORDERS / SKILL_REVEALS in studio/ui/schema.js).
 */
export type LinkedSkillBorder = "orbit" | "march" | "pulse" | "marks" | "signal" | "steady";
export type LinkedSkillReveal = "card" | "tab" | "callout";

/** data/home/page.json — everything on the home page that isn't resume content. */
export type HomePageData = {
  meta: PageMeta & {
    /** The title a link preview shows (Open Graph / Twitter), which can be friendlier than the tab title. */
    shareTitle: string;
  };
  hero: {
    /** The big name, one line each. */
    lines: string[];
    /** Under the tagline: "{company}, since {start}" for the current role. */
    currentRole: string;
  };
  /** A phrase in the summary that becomes a link wherever it appears. */
  summaryLink: LinkText;
  headings: {
    summary: string;
    experience: string;
    skills: string;
    education: string;
  };
  /** The "Read more" button at the end of a resume bullet that links to its project. */
  readMore: {
    animation: ReadMoreAnimation;
  };
  /** Skills linked to a project or proof (Skills → Links to) in the Skills section. */
  linkedSkills: {
    border: LinkedSkillBorder;
    reveal: LinkedSkillReveal;
    /** The kind of thing a skill links to, in the hover card's second line. */
    labels: {
      project: string;
      proof: string;
    };
  };
  footer: {
    note: string;
    sheetLabel: string;
    sheetLink: LinkText;
    revisionLabel: string;
    locationLabel: string;
  };
};

/** Copy that changes with how many projects are published: one, or several ({count}). */
export type CountedText = {
  one: string;
  many: string;
};

/** data/projects/page.json — the projects page around the entries themselves. */
export type ProjectsPageData = {
  meta: PageMeta;
  title: string;
  intro: CountedText;
  outro: {
    lead: string;
    body: CountedText;
  };
  /** Shown instead of the entries while nothing is published. */
  comingSoon: {
    heading: string;
    body: string;
    /** The status line cycles through these. */
    phases: string[];
    queueLabel: string;
  };
};

/** data/site/interface.json — labels shared across pages: navigation, buttons, and the small words around content. */
export type InterfaceData = {
  nav: {
    home: string;
    projects: string;
    contact: string;
    moreInfo: string;
    aboutSite: string;
  };
  actions: {
    downloadPdf: string;
    preparingPdf: string;
    email: string;
    linkedin: string;
    github: string;
  };
  backToTop: string;
  openToRelocation: string;
  /** On a resume bullet that links to its project. */
  bulletReadMore: string;
  /** A certificate's link when it doesn't name its own. */
  showCredential: string;
  caseStudy: {
    view: string;
    hide: string;
    problem: string;
    rootCause: string;
    constraints: string;
    approach: string;
    designDecisions: string;
    impact: string;
  };
  gallery: {
    oneImage: string;
    /** "{count} images · click to enlarge" */
    manyImages: string;
    dragToCompare: string;
    before: string;
    after: string;
    loading: string;
    failed: string;
    /** The tag on a PDF's preview. */
    pdf: string;
    /** "{count} pages" beside it; `onePage` when there is only one. */
    pages: string;
    onePage: string;
    /** Under a PDF in the full-screen viewer: "Page 1 of {count}". */
    firstPageOf: string;
    downloadPdf: string;
  };
  dates: {
    present: string;
  };
  timeline: {
    shipped: string;
    inProgress: string;
    planned: string;
    past: string;
    present: string;
    future: string;
    playing: string;
    paused: string;
    viewScreenshot: string;
  };
  pillars: {
    readMore: string;
    less: string;
  };
};
