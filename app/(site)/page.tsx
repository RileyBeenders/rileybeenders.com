import Link from "next/link";
import { ArrowUpRight, Briefcase, GraduationCap, MapPin, MessageSquare, Monitor } from "lucide-react";
import resumeData from "@/data/resumeData";
import homePageData from "@/data/home/page.json";
import contactData from "@/data/contact/contact.json";
import { Reveal } from "@/components/blueprint/Reveal";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { HeroActions } from "@/components/bench/HeroActions";
import { GithubGraph } from "@/components/bench/GithubGraph";
import { Experience } from "@/components/bench/Experience";
import { ProjectGrid } from "@/components/bench/ProjectGrid";
import { Stack } from "@/components/bench/Stack";
import { Education } from "@/components/bench/Education";
import { ContactBlock } from "@/components/bench/ContactBlock";
import { SiteFooter } from "@/components/bench/SiteFooter";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { getCatalog, SITE_PROJECT_ID } from "@/lib/catalog";
import { getContributions, githubUsername } from "@/lib/github";
import { endedWithinYears, todayIso } from "@/lib/dates";
import { fill, ui } from "@/lib/copy";
import type { HomePageData } from "@/types/pages";
import type { ContactData } from "@/types/contact";

const page = homePageData as HomePageData;
const contact = contactData as ContactData;

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

/** A small tile's corner arrow. */
function TileArrow() {
  return (
    <span className="tile-arrow" aria-hidden="true">
      <ArrowUpRight size={14} strokeWidth={2} />
    </span>
  );
}

export default async function HomePage() {
  const data = resumeData;
  const current = data.experience[0];
  const catalog = getCatalog();
  const site = catalog.find((entry) => entry.project.id === SITE_PROJECT_ID);
  const today = todayIso();
  const username = githubUsername(data.person.github);
  const contributions = username ? await getContributions(username) : null;
  const projectNames = Object.fromEntries(catalog.map((entry) => [entry.project.id, entry.project.name]));
  const summaryParagraphs = splitParagraphs(data.summary);
  // Site Settings → Layout → Experience shown (years): roles that ended longer ago wait behind
  // the "see more" button. 5 when left out; 0 shows every role. If nothing is recent, show them all.
  const yearsSetting = data.layout?.experienceYears;
  const experienceYears = yearsSetting == null || !Number.isFinite(Number(yearsSetting)) ? 5 : Math.max(0, Number(yearsSetting));
  // A role's own setting (Experience → Home page) wins over the dates: "more" always waits, "always" never does.
  const olderFlags = data.experience.map((role) =>
    role.homeDisplay === "more" ? true
      : role.homeDisplay === "always" ? false
        : experienceYears > 0 && !endedWithinYears(role.end, experienceYears, today)
  );
  const olderRoles = olderFlags.every(Boolean) ? [] : olderFlags;
  const degree = data.education.degrees[0];
  let tile = 0;
  const order = () => ({ "--i": tile++ } as React.CSSProperties);

  return (
    <main>
      {/* ----------------------------------------------------------- bench */}
      <section className="shell hero" aria-label="Introduction">
        <div className="bento">
          <article className="card tile tile-hero" style={order()}>
            {data.visibility.openToRelocation && (
              <span className="hero-flag" data-tone={data.layout?.relocationColor ?? "amber"}>
                <span className="chip-dot" aria-hidden="true" />
                {ui.openToRelocation}
              </span>
            )}
            <h1 className="hero-name">{page.hero.lines.join(" ")}</h1>
            <p className="hero-role">{data.person.title}</p>

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
          </article>

          {current && (
            <a className="card card--hover tile tile-now" href="#experience" style={order()} suppressHydrationWarning>
              <span className="tile-label"><Briefcase size={13} strokeWidth={2} aria-hidden="true" />{page.bento.now}</span>
              <h3 className="tile-value">{current.role}</h3>
              <p className="tile-sub">{current.company} · {current.start} – {current.end}</p>
              <TileArrow />
            </a>
          )}

          <div className="card tile tile-where" style={order()}>
            <span className="tile-label"><MapPin size={13} strokeWidth={2} aria-hidden="true" />{page.bento.location}</span>
            <h3 className="tile-value">{data.person.location}</h3>
            {data.visibility.openToRelocation && <p className="tile-sub">{ui.openToRelocation}</p>}
          </div>

          {degree && (
            <a className="card card--hover tile tile-edu" href="#education" style={order()} suppressHydrationWarning>
              <span className="tile-label"><GraduationCap size={13} strokeWidth={2} aria-hidden="true" />{page.headings.education}</span>
              <h3 className="tile-value tile-value--sm">{degree.degree}</h3>
              <p className="tile-sub">{degree.school} · {degree.graduation}</p>
              <TileArrow />
            </a>
          )}

          <div className="tile-activity" style={order()}>
            <GithubGraph title={page.headings.activity} data={contributions} profileUrl={data.person.github} />
          </div>

          {site && (
            <a className="card card--hover tile tile-site" href={`#project-${site.project.id}`} style={order()} suppressHydrationWarning>
              <span className="tile-label"><Monitor size={13} strokeWidth={2} aria-hidden="true" />{ui.projects.siteBadge}</span>
              <h3 className="tile-value">{site.project.name}</h3>
              {site.tagline && <p className="tile-sub">{site.tagline}</p>}
              <TileArrow />
            </a>
          )}

          <Link className="card card--hover tile tile-contact" href="#contact" style={order()} suppressHydrationWarning>
            <span className="tile-label"><MessageSquare size={13} strokeWidth={2} aria-hidden="true" />{contact.hero.title}</span>
            <h3 className="tile-value">{contact.form.title}</h3>
            <p className="tile-sub">{contact.hero.tagline}</p>
            <TileArrow />
          </Link>

        </div>
      </section>

      {/* --------------------------------------------------------- summary */}
      <section className="shell sec" id="summary">
        <Reveal>
          <div className="card panel">
            <div className="sec-head"><h2 className="sec-title">{page.headings.summary}</h2></div>
            <div className="summary-grid">
            <div>
              {summaryParagraphs.map((paragraph, index) => <SummaryParagraph key={index} text={paragraph} />)}
            </div>
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
                <dt className="fact-label">{page.bento.location}</dt>
                <dd className="fact-value">{data.person.location}{data.visibility.openToRelocation ? ` · ${ui.openToRelocation}` : ""}</dd>
              </div>
              <div className="fact">
                <dt className="fact-label">{page.footer.siteLabel}</dt>
                <dd className="fact-value"><a href={page.footer.siteLink.href} suppressHydrationWarning>{page.footer.siteLink.text}</a></dd>
              </div>
            </dl>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------ experience */}
      <section className="shell sec" id="experience">
        <div className="sec-group">
          <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.experience}</h2></div></Reveal>
          <Experience
            roles={data.experience}
            projectNames={projectNames}
            readMoreLabel={ui.bulletReadMore}
            readMoreMotion={page.readMore?.animation || "sweep"}
          older={olderRoles}
          moreLabel={page.experience?.moreLabel}
          lessLabel={page.experience?.lessLabel}
          />
        </div>
      </section>

      {/* -------------------------------------------------------- projects */}
      {catalog.length > 0 && (
        <section className="shell sec" id="projects">
          <div className="sec-group">
            <Reveal>
              <div className="sec-head">
                <h2 className="sec-title">{page.headings.projects}</h2>
                <p className="sec-sub">{catalog.length} {catalog.length === 1 ? "entry" : "entries"}</p>
              </div>
            </Reveal>
            <ProjectGrid entries={catalog} today={today} paletteId={data.theme.paletteId} viewAllHref="/projects" />
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- stack */}
      <section className="shell sec" id="skills">
        <div className="sec-group">
          <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.skills}</h2></div></Reveal>
          <Stack data={data} linkedSkills={page.linkedSkills} picker={page.skillPicker} />
        </div>
      </section>

      {/* ------------------------------------------------------- education */}
      <section className="shell sec" id="education">
        <div className="sec-group">
          <Reveal><div className="sec-head"><h2 className="sec-title">{page.headings.education}</h2></div></Reveal>
          <Education education={data.education} />
        </div>
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
