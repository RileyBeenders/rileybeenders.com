import type { Metadata } from "next";
import aboutSiteData from "@/data/site/about-site.json";
import type { AboutSiteData } from "@/types/about-site";
import type { Project } from "@/types/resume";
import { buildProofView } from "@/lib/projects";
import { todayIso } from "@/lib/dates";
import { Reveal } from "@/components/blueprint/Reveal";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { AboutSiteStory } from "@/components/about-site/AboutSiteStory";
import { ProjectDateBox } from "@/components/projects/ProjectDateBox";
import { ProjectFeature } from "@/components/projects/ProjectFeature";
import "../projects/projects.css";
import "../projects/feature.css";
import "./about-site.css";

const data = aboutSiteData as AboutSiteData;

export const metadata: Metadata = {
  title: "About this site | Riley Beenders",
  description:
    "The site as its own case study: the Blueprint Press design, the AI agent skills that maintain it, and a commit-by-commit timeline of how far it has come."
};

export default function AboutThisSitePage() {
  // The case study is built the way a project's is, from the same shape.
  const asProject: Project = {
    id: "about-this-site",
    name: data.hero.title,
    type: "",
    summary: data.summary,
    bullets: data.bullets,
    additionalInfo: data.caseStudy
  };
  const proof = buildProofView(asProject, []);
  // Read once on the server so the timeline's "now" agrees across hydration.
  const today = todayIso();

  return (
    <main className="pj as">
      <section className="bp-hero as-hero">
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">{data.hero.eyebrow}</p></Reveal>
          <h1 style={{ fontSize: "clamp(44px, 8vw, 96px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>{data.hero.title}</span></Reveal>
          </h1>
          <Reveal delay={0.26}>
            <div className="as-dates">
              <ProjectDateBox dates={data.dates} position="inline" size="large" />
            </div>
          </Reveal>
          <Reveal as="rule" delay={0.36}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.44}>
            <p className="bp-prose as-tagline">{data.hero.tagline}</p>
          </Reveal>
        </div>
      </section>

      <AboutSiteStory data={data} proof={proof} />

      <section className="bp-section as-deep">
        <div className="bp-shell">
          <ProjectFeature feature={data.feature} projectName={data.hero.title} today={today} />
        </div>
      </section>

      <footer className="pj-outro">
        <div className="bp-shell">
          <p className="bp-eyebrow">Still moving</p>
          <p className="bp-prose" style={{ marginTop: 18 }}>
            Everything on this page is edited from the Studio and refreshed by an agent as
            the repository grows. If the timeline ends before today, that is a to-do, not
            the end.
          </p>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
