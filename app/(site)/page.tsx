import Link from "next/link";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpActions } from "@/components/blueprint/BpActions";
import { BpMark } from "@/components/blueprint/BpMark";
import { HeroRibbon } from "@/components/blueprint/HeroRibbon";
import { BpHeroRelocationBadge } from "@/components/blueprint/BpRelocationBadge";
import { PageSpine } from "@/components/blueprint/PageSpine";
import { BackToTop } from "@/components/blueprint/BackToTop";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { getBuildStamp } from "@/lib/build-stamp";
import { Paragraphs, splitParagraphs } from "@/components/content/Paragraphs";
import homePageData from "@/data/home/page.json";
import { fill, ui } from "@/lib/copy";
import type { HomePageData } from "@/types/pages";

const page = homePageData as HomePageData;

export default function HomePage() {
  const data = resumeData;
  // A drop cap only when the summary opens with a whole word ("Riley…"), never
  // when it would orphan an apostrophe ("I'm" → "I" + "'m").
  // An empty line in the summary starts a new paragraph; the drop cap opens the first.
  const summaryParagraphs = splitParagraphs(data.summary);
  const dropCap = /^[A-Za-z][A-Za-z]/.test(summaryParagraphs[0] ?? "");
  const siteLinkLabel = page.summaryLink.text;
  const projectsById = new Map(data.projects.map((project) => [project.id, project]));
  const current = data.experience[0];
  const stamp = getBuildStamp();

  return (
    <main className="hp">
      {/* ------------------------------------------------------------ hero */}
      <section className="bp-hero">
        <BpHeroRelocationBadge />

        <div className="bp-shell">
          <HeroRibbon />

          <h1>
            {page.hero.lines.map((line, index) => (
              <Reveal key={index} delay={0.14 + index * 0.1}><span style={{ display: "block" }}>{line}</span></Reveal>
            ))}
          </h1>

          <Reveal as="rule" delay={0.36}>
            <div className="bp-rule" style={{ marginTop: 38 }} />
          </Reveal>

          <Reveal delay={0.44}>
            <div className="bp-hero-meta">
              <p className="bp-hero-tagline">{data.person.title}</p>
              <div className="bp-hero-place">
                <span>{data.person.location}</span>
                {current && (
                  <span className="bp-hero-now">
                    <span className="bp-hero-now-role">{current.role}</span>
                    <span className="bp-hero-now-where">{fill(page.hero.currentRole, { company: current.company, start: current.start })}</span>
                  </span>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.54}>
            <BpActions data={data} />
          </Reveal>
        </div>
      </section>

      <PageSpine>
        {/* --------------------------------------------------------- summary */}
        <section className="bp-section" id="summary">
          <div className="bp-shell">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <div className="bp-section-grid">
              <Reveal><h2 className="bp-section-index">01&nbsp;&nbsp;{page.headings.summary}</h2></Reveal>
              <Reveal delay={0.06}>
                <div>
                  {summaryParagraphs.map((paragraph, index) => {
                    const capped = index === 0 && dropCap;
                    const text = capped ? paragraph.slice(1) : paragraph;
                    // The linked phrase (Home page → Summary link) links wherever it appears; blank means no link.
                    const [beforeLink, ...afterLink] = siteLinkLabel ? text.split(siteLinkLabel) : [text];
                    return (
                      <p className="bp-prose" data-para="" key={index}>
                        {capped && <span className="bp-dropcap">{paragraph.slice(0, 1)}</span>}
                        {beforeLink}
                        {afterLink.length > 0 && (
                          <>
                            <a href={page.summaryLink.href} target="_blank" rel="noreferrer" suppressHydrationWarning>
                              {siteLinkLabel}
                            </a>
                            {afterLink.join(siteLinkLabel)}
                          </>
                        )}
                      </p>
                    );
                  })}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------ experience */}
        <section className="bp-section" id="experience">
          <div className="bp-shell">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <div className="bp-section-grid">
              <Reveal><h2 className="bp-section-index">02&nbsp;&nbsp;{page.headings.experience}</h2></Reveal>
              <div className="bp-roles">
                {data.experience.map((job, index) => (
                  <Reveal key={`${job.company}-${job.start}`} delay={Math.min(index, 3) * 0.06}>
                    <article className="bp-role">
                      <div className="bp-role-head">
                        <h3>{job.role}</h3>
                        <span className="bp-role-dates">{job.start} — {job.end}</span>
                      </div>
                      <p className="bp-role-org">{job.company} · {job.location}</p>
                      {job.context && <Paragraphs className="bp-role-context" text={job.context} />}
                      {job.bullets.length > 0 && (
                        <ul className="bp-bullets">
                          {job.bullets.map((bullet) => {
                            const project = bullet.projectId ? projectsById.get(bullet.projectId) : undefined;
                            return (
                              <li key={bullet.text}>
                                <span className="bp-bullet-content">
                                  <EmphasizedText
                                    text={bullet.text}
                                    phrases={bullet.emphasis}
                                    className="bp-bullet-emphasis"
                                  />
                                {project && (
                                  <Link
                                    href={`/projects#project-${project.id}`}
                                    className="bp-bullet-link"
                                    aria-label={`See the ${project.name} project`}
                                    suppressHydrationWarning
                                  >
                                    <span>{ui.bulletReadMore}</span>
                                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                      <path d="M4 12L12 4m0 0H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </Link>
                                )}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- toolchain */}
        <section className="bp-section" id="skills">
          <div className="bp-shell">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <div className="bp-section-grid">
              <Reveal><h2 className="bp-section-index">03&nbsp;&nbsp;{page.headings.skills}</h2></Reveal>
              <div>
                {data.skills.map((group, index) => (
                  <Reveal key={group.category} delay={Math.min(index, 3) * 0.06}>
                    <div className="bp-skill-group">
                      <h3>{group.category}</h3>
                      <div className="bp-pills">
                        {group.items.map((item) => (
                          <span className="bp-pill" key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------- education */}
        <section className="bp-section" id="education">
          <div className="bp-shell">
            <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
            <div className="bp-section-grid">
              <Reveal><h2 className="bp-section-index">04&nbsp;&nbsp;{page.headings.education}</h2></Reveal>
              <div>
                {data.education.degrees.map((degree) => (
                  <Reveal key={`${degree.school}-${degree.degree}`}>
                    <div className="bp-degree">
                      <h3>{degree.school}</h3>
                      <p>{degree.degree} · {degree.graduation}</p>
                    </div>
                  </Reveal>
                ))}

                {data.education.certificates.length > 0 && (
                  <Reveal delay={0.08}>
                    <div className="bp-certs">
                      {data.education.certificates.map((certificate) => (
                        <div className="bp-cert" key={`${certificate.certificateName}-${certificate.issuer}`}>
                          <h4>{certificate.certificateName}</h4>
                          <p className="bp-cert-issuer">{certificate.issuer}</p>
                          <p className="bp-cert-date">{certificate.date}</p>
                          {certificate.credentialUrl && (
                            <a
                              className="bp-link"
                              href={certificate.credentialUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ marginTop: 10 }}
                              suppressHydrationWarning
                            >
                              {certificate.credentialLabel || ui.showCredential}
                              <svg className="bp-arrow" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M4 12L12 4m0 0H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}
                          <div className="bp-cert-bar" aria-hidden="true" />
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>
            </div>
          </div>
        </section>
      </PageSpine>

      {/* ---------------------------------------------------------- footer */}
      <footer className="bp-footer">
        <div className="bp-shell">
          <div className="bp-footer-inner">
            <div className="bp-footer-mark">
              <BpMark id="footer" size={58} animated float />
              <p className="bp-footer-note">{page.footer.note}</p>
            </div>
            <dl className="bp-footer-block" aria-label="About this page">
              <div>
                <dt>{page.footer.sheetLabel}</dt>
                <dd><a href={page.footer.sheetLink.href} suppressHydrationWarning>{page.footer.sheetLink.text}</a></dd>
              </div>
              {stamp.commit && (
                <div>
                  <dt>{page.footer.revisionLabel}</dt>
                  <dd>{stamp.commit} · {stamp.date}</dd>
                </div>
              )}
              <div>
                <dt>{page.footer.locationLabel}</dt>
                <dd>{data.person.location}</dd>
              </div>
            </dl>
          </div>
        </div>
      </footer>

      <BackToTop />
    </main>
  );
}
