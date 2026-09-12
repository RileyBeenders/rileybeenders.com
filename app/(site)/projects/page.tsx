import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpComingSoon } from "@/components/blueprint/BpComingSoon";
import { BpProjectsGrid } from "@/components/blueprint/BpProjectsGrid";
import { readStudioSettings } from "@/lib/studio-settings";

// The WIP animation vs. the real project grid is a Studio setting — re-read on every request.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects | Riley Beenders",
  description: "Selected projects and case studies — coming soon."
};

export default function ProjectsPage() {
  const settings = readStudioSettings();
  const showWip = settings.projects.showWipAnimation;

  const sortedProjects = [...resumeData.projects].sort(
    (a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER)
  );
  const teasers = sortedProjects.slice(0, 6).map((project) => ({ name: project.name, type: project.type }));

  return (
    <main>
      <section className="bp-hero" style={{ paddingBottom: 8 }}>
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">Selected Work</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Projects</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <p className="bp-prose" style={{ marginTop: 26 }}>
              {showWip
                ? "A closer look at the projects referenced throughout the resume — problem, approach, and impact for each. The full write-ups are on their way."
                : "A closer look at the projects referenced throughout the resume — problem, approach, and impact for each."}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bp-section">
        <div className="bp-shell">
          <Reveal delay={0.1}>
            {showWip ? <BpComingSoon teasers={teasers} /> : <BpProjectsGrid projects={sortedProjects} />}
          </Reveal>
        </div>
      </section>
    </main>
  );
}
