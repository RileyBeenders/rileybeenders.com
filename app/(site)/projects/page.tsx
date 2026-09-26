import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { buildProjectViews } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpComingSoon } from "@/components/blueprint/BpComingSoon";
import { ProjectEntry } from "@/components/projects/ProjectEntry";
import { ProjectListSpine } from "@/components/projects/ProjectListSpine";
import { BackToTop } from "@/components/blueprint/BackToTop";
import projectsPageData from "@/data/projects/page.json";
import { counted } from "@/lib/copy";
import type { ProjectsPageData } from "@/types/pages";
import "./projects.css";
import "./feature.css";

const page = projectsPageData as ProjectsPageData;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description
};

export default function ProjectsPage() {
  const views = buildProjectViews(resumeData.projects, resumeData.proofs);

  // Nothing published yet — either the section is switched off in the site
  // settings, or every project is hidden. Fall back to the holding page.
  if (views.length === 0) {
    return (
      <main>
        <section className="bp-hero" style={{ paddingBottom: 8 }}>
          <div className="bp-shell">
            <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
              <Reveal delay={0.14}><span style={{ display: "block" }}>{page.title}</span></Reveal>
            </h1>
            <Reveal as="rule" delay={0.3}><div className="bp-rule" style={{ marginTop: 32 }} /></Reveal>
          </div>
        </section>
        <section className="bp-section">
          <div className="bp-shell">
            <Reveal delay={0.1}><BpComingSoon copy={page.comingSoon} /></Reveal>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pj">
      <section className="bp-hero pj-intro">
        <div className="bp-shell">
          <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>{page.title}</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <p className="bp-prose pj-intro-prose bp-page-intro">
              {counted(page.intro, views.length)}
            </p>
          </Reveal>
        </div>
      </section>

      <ProjectListSpine>
        {views.map((view, index) => (
          <ProjectEntry key={view.project.id} view={view} index={index} total={views.length} />
        ))}
      </ProjectListSpine>

      <footer className="pj-outro">
        <div className="bp-shell">
          <p className="bp-outro-lead">{page.outro.lead}</p>
          <p className="bp-prose" style={{ marginTop: 18 }}>{counted(page.outro.body, views.length)}</p>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
