import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { buildProjectViews } from "@/lib/projects";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpComingSoon } from "@/components/blueprint/BpComingSoon";
import { ProjectEntry } from "@/components/projects/ProjectEntry";
import { BackToTop } from "@/components/projects/BackToTop";
import "./projects.css";

export const metadata: Metadata = {
  title: "Projects | Riley Beenders",
  description:
    "Selected projects — the problem, the approach, and the measurable impact behind each line of the resume."
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
            <Reveal delay={0.05}><p className="bp-eyebrow">Selected Work</p></Reveal>
            <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
              <Reveal delay={0.14}><span style={{ display: "block" }}>Projects</span></Reveal>
            </h1>
            <Reveal as="rule" delay={0.3}><div className="bp-rule" style={{ marginTop: 32 }} /></Reveal>
          </div>
        </section>
        <section className="bp-section">
          <div className="bp-shell">
            <Reveal delay={0.1}><BpComingSoon /></Reveal>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pj">
      <section className="bp-hero pj-intro">
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">Selected Work</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Projects</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <p className="bp-prose pj-intro-prose">
              {views.length} projects — the problem each one started from, the decisions
              behind it, and what changed as a result. Open a case study for the full
              story.
            </p>
          </Reveal>
        </div>
      </section>

      {views.map((view, index) => (
        <ProjectEntry key={view.project.id} view={view} index={index} total={views.length} />
      ))}

      <footer className="pj-outro">
        <div className="bp-shell">
          <p className="bp-eyebrow">That's everything, for now</p>
          <p className="bp-prose" style={{ marginTop: 18 }}>
            Every project above is linked from a line on the resume. Each case study
            goes a layer deeper — design decisions, root causes, and measured results.
          </p>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
