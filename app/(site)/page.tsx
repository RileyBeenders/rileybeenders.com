import { Briefcase, MapPin } from "lucide-react";
import resumeData from "@/data/resumeData";
import homePageData from "@/data/home/page.json";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpMark } from "@/components/blueprint/BpMark";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { HeroCover } from "@/components/sheet/HeroCover";
import { HeroActions } from "@/components/sheet/HeroActions";
import { CursorMark } from "@/components/sheet/CursorMark";
import { GithubGraph } from "@/components/sheet/GithubGraph";
import { Experience } from "@/components/sheet/Experience";
import { ProjectGrid } from "@/components/sheet/ProjectGrid";
import { Stack } from "@/components/sheet/Stack";
import { Education } from "@/components/sheet/Education";
import { ContactBlock } from "@/components/sheet/ContactBlock";
import { SiteFooter } from "@/components/sheet/SiteFooter";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { getCatalog } from "@/lib/catalog";
import { getContributions, githubUsername } from "@/lib/github";
import { todayIso } from "@/lib/dates";
import { fill, ui } from "@/lib/copy";
import type { HomePageData } from "@/types/pages";

const page = homePageData as HomePageData;

/** The summary's linked phrase (Home page → Summary link) becomes a link wherever it appears. */
function SummaryParagraph({ text }: { text: string }) {
  const label = page.summaryLink.text;
  const [before, ...after] = label ? text.split(label) : [text];
  return (
    <p className="prose" data-para="">
      {before}
      {after.length > 0 && (
        <>
          <a href={page.summaryLink.href} target="_blank" rel="noreferrer" suppressHydrationWarning>{label}</a>
          {after.join(label)}
        </>
      )}
    </p>
  );
}

export default async function HomePage() {
  const data = resumeData;
  const current = data.experience[0];
  const catalog = getCatalog();
  const today = todayIso();
  const username = githubUsername(data.person.github);
  const contributions = username ? await getContributions(username) : null;
  const projectNames = Object.fromEntries(catalog.map((entry) => [entry.project.id, entry.project.name]));
  const summaryParagraphs = splitParagraphs(data.summary);
  const motion = data.motion ?? {};
  const degree = data.education.degrees[0];

  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="shell hero" aria-label="Introduction">
        <div className="hero-card" data-cursor-zone="">
            <HeroCover label={`${page.footer.sheetLabel} · ${data.person.location}`} />
            <div className="hero-body">
              <div className="hero-id">
                <div className="hero-avatar" aria-hidden="true">
                  <BpMark id="hero" size={60} animated />
                </div>
                <div className="hero-id-actions">
                  {data.visibility.openToRelocation && (
                    <span className="chip">
                      <span className="chip-dot" aria-hidden="true" />
                      {ui.openToRelocation}
                    </span>
                  )}
                </div>
              </div>

              <h1 className="hero-name">{page.hero.lines.join(" ")}</h1>
              <p className="hero-role">
                {data.person.title}
                <span className="hero-caret" aria-hidden="true" />
              </p>

              <div className="hero-meta">
                <span>
                  <MapPin size={15} strokeWidth={2} aria-hidden="true" />
                  {data.person.location}
                </span>
                {current && (
                  <span>
                    <Briefcase size={15} strokeWidth={2} aria-hidden="true" />
                    <span className="hero-now-role">{current.role}</span>
                    <span>· {fill(page.hero.currentRole, { company: current.company, start: current.start })}</span>
                  </span>
                )}
              </div>

              <HeroActions person={data.person} resumePdfPath={data.resumePdfPath} resumeHtmlPath={data.resumeHtmlPath} />
            </div>
            {motion.cursorMark && <CursorMark />}
          </div>
      </section>

      {/* -------------------------------------------------------- activity */}
      <section className="shell sec sec--tight" aria-label={page.headings.activity}>
        <Reveal delay={0.1}>
          <GithubGraph title={page.headings.activity} data={contributions} profileUrl={data.person.github} />
        </Reveal>
      </section>

      {/* --------------------------------------------------------- summary */}
      <section className="shell sec" id="summary">
        <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.summary}</h2></div></Reveal>
        <div className="summary-grid">
          <Reveal delay={0.06}>
            <div>
              {summaryParagraphs.map((paragraph, index) => <SummaryParagraph key={index} text={paragraph} />)}
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <dl className="facts">
              {current && (
                <div className="fact">
                  <dt className="fact-label">{page.headings.experience}</dt>
                  <dd className="fact-value">{current.role} · {current.company}</dd>
                </div>
              )}
              {degree && (
                <div className="fact">
                  <dt className="fact-label">{page.headings.education}</dt>
                  <dd className="fact-value">{degree.degree} · {degree.school}</dd>
                </div>
              )}
              <div className="fact">
                <dt className="fact-label">{page.footer.locationLabel}</dt>
                <dd className="fact-value">{data.person.location}{data.visibility.openToRelocation ? ` · ${ui.openToRelocation}` : ""}</dd>
              </div>
              <div className="fact">
                <dt className="fact-label">{page.footer.sheetLabel}</dt>
                <dd className="fact-value"><a href={page.footer.sheetLink.href} suppressHydrationWarning>{page.footer.sheetLink.text}</a></dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ experience */}
      <section className="shell sec" id="experience">
        <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.experience}</h2></div></Reveal>
        <Experience
          roles={data.experience}
          projectNames={projectNames}
          readMoreLabel={ui.bulletReadMore}
          readMoreMotion={page.readMore?.animation || "sweep"}
        />
      </section>

      {/* -------------------------------------------------------- projects */}
      {catalog.length > 0 && (
        <section className="shell sec" id="projects">
          <Reveal>
            <div className="sec-head">
              <h2 className="sec-title">{page.headings.projects}</h2>
              <p className="sec-sub">{catalog.length} {catalog.length === 1 ? "entry" : "entries"}</p>
            </div>
          </Reveal>
          <ProjectGrid entries={catalog} today={today} paletteId={data.theme.paletteId} viewAllHref="/projects" />
        </section>
      )}

      {/* ----------------------------------------------------------- stack */}
      <section className="shell sec" id="skills">
        <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.skills}</h2></div></Reveal>
        <Stack data={data} linkedSkills={page.linkedSkills} />
      </section>

      {/* ------------------------------------------------------- education */}
      <section className="shell sec" id="education">
        <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.education}</h2></div></Reveal>
        <Education education={data.education} />
      </section>

      {/* --------------------------------------------------------- contact */}
      <section className="shell sec" id="contact">
        <ContactBlock person={data.person} relocation={data.visibility.openToRelocation} />
      </section>

      <SiteFooter location={data.person.location} />
      <BackToTop />
    </main>
  );
}
