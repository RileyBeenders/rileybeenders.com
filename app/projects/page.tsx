import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";

export const metadata: Metadata = {
  title: "Projects | Riley Beenders",
  description: "Selected projects and case studies."
};

export default function ProjectsPage() {
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
              approach, and impact for each.
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
              <ProjectsExplorer data={resumeData} />
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
