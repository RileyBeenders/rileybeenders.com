import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/v3/Reveal";
import { V3ComingSoon } from "@/components/v3/V3ComingSoon";

export const metadata: Metadata = {
  title: "Projects | Riley Beenders",
  description: "Selected projects and case studies — coming soon."
};

export default function V3Projects() {
  const teasers = [...resumeData.projects]
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 6)
    .map((project) => ({ name: project.name, type: project.type }));

  return (
    <main>
      <section className="v3-hero" style={{ paddingBottom: 8 }}>
        <div className="v3-shell">
          <Reveal delay={0.05}><p className="v3-eyebrow">Selected Work</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 108px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Projects</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="v3-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <p className="v3-prose" style={{ marginTop: 26 }}>
              A closer look at the projects referenced throughout the resume — problem,
              approach, and impact for each. The full write-ups are on their way.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-shell">
          <Reveal delay={0.1}><V3ComingSoon teasers={teasers} /></Reveal>
        </div>
      </section>
    </main>
  );
}
