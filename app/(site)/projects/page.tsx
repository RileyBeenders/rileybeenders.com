import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import projectsPageData from "@/data/projects/page.json";
import { Reveal } from "@/components/blueprint/Reveal";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { ProjectGrid } from "@/components/bench/ProjectGrid";
import { SiteFooter } from "@/components/bench/SiteFooter";
import { getCatalog } from "@/lib/catalog";
import { todayIso } from "@/lib/dates";
import { counted } from "@/lib/copy";
import type { ProjectsPageData } from "@/types/pages";

const page = projectsPageData as ProjectsPageData;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description
};

/**
 * The catalog: every published project and the site itself as cards, with
 * type filters. A card opens its project in a dialog (the URL hash names
 * it); the dialog's corner link goes to the project's own page.
 */
export default function ProjectsPage() {
  const catalog = getCatalog();
  const projectCount = catalog.filter((entry) => !entry.isSite).length;

  return (
    <main>
      <section className="shell sec sec--tight" aria-label={page.title}>
        <Reveal>
          <div className="sec-head">
            <h1 className="sec-title">{page.title}</h1>
            {projectCount > 0 && <p className="sec-sub">{counted(page.intro, projectCount)}</p>}
          </div>
        </Reveal>
        {catalog.length > 0 ? (
          <ProjectGrid entries={catalog} today={todayIso()} paletteId={resumeData.theme.paletteId} filters />
        ) : (
          <div className="project-empty">
            <p>{page.comingSoon.heading}</p>
            <p>{page.comingSoon.body}</p>
          </div>
        )}
      </section>

      {projectCount > 0 && (
        <section className="shell sec" aria-label="Closing note">
          <Reveal>
            <div className="outro">
              <p className="bp-outro-lead">{page.outro.lead}</p>
              <p>{counted(page.outro.body, projectCount)}</p>
            </div>
          </Reveal>
        </section>
      )}

      <SiteFooter location={resumeData.person.location} />
      <BackToTop />
    </main>
  );
}
