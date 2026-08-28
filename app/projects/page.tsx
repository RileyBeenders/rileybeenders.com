import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { ComingSoon } from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Projects | Riley Beenders",
  description: "Selected projects and case studies — coming soon."
};

export default function ProjectsPage() {
  const teasers = [...resumeData.projects]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 6)
    .map((project) => ({ name: project.name, type: project.type }));

  return (
    <main className="site-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <header className="hero-card" id="section-projects-header">
          <div>
            <div className="status-pill">Projects</div>
            <h1>Selected Work</h1>
            <p>
              A closer look at the projects referenced throughout the resume — problem,
              approach, and impact for each. The full write-ups are on their way.
            </p>
          </div>
        </header>

        <section className="resume-paper">
          <div className="resume-column-main">
            <section className="resume-block" id="section-projects-work">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Case Studies</p>
                  <h2>Projects</h2>
                </div>
              </div>
              <ComingSoon teasers={teasers} />
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
