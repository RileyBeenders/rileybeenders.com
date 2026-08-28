import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/v3/Reveal";
import { V3Actions } from "@/components/v3/V3Actions";
import { V3Mark } from "@/components/v3/V3Mark";

export default function V3Home() {
  const data = resumeData;

  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="v3-hero">
        <svg
          className="v3-hero-ribbon"
          viewBox="0 0 200 240"
          fill="none"
          aria-hidden="true"
          preserveAspectRatio="xMidYMin meet"
        >
          <path
            d="M40 20c72 0 108 18 108 45 0 26-36 44-108 44 82 0 121 19 121 46 0 25-39 45-121 45"
            stroke="#0b1a2b"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        <div className="v3-shell">
          <Reveal delay={0.05}>
            <p className="v3-eyebrow">R&amp;D · Electromechanical · Automation</p>
          </Reveal>

          <h1>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Riley</span></Reveal>
            <Reveal delay={0.24}><span style={{ display: "block" }}>Beenders</span></Reveal>
          </h1>

          <Reveal as="rule" delay={0.36}>
            <div className="v3-rule" style={{ marginTop: 38 }} />
          </Reveal>

          <Reveal delay={0.44}>
            <div className="v3-hero-meta">
              <p className="v3-hero-tagline">{data.person.title}</p>
              <div className="v3-hero-place">
                <span>{data.person.location}</span>
                <span style={{ color: "var(--accent)" }}>Open to relocation</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.54}>
            <V3Actions data={data} />
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- summary */}
      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">01&nbsp;&nbsp;Summary</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="v3-prose">
                  <span className="v3-dropcap">{data.summary.slice(0, 1)}</span>
                  {data.summary.slice(1)}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ experience */}
      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">02&nbsp;&nbsp;Experience</p></Reveal>
            <div className="v3-roles">
              {data.experience.map((job, index) => (
                <Reveal key={`${job.company}-${job.start}`} delay={Math.min(index, 3) * 0.06}>
                  <article className="v3-role">
                    <div className="v3-role-head">
                      <h3>{job.role}</h3>
                      <span className="v3-role-dates">{job.start} — {job.end}</span>
                    </div>
                    <p className="v3-role-org">{job.company} · {job.location}</p>
                    {job.context && <p className="v3-role-context">{job.context}</p>}
                    {job.bullets.length > 0 && (
                      <ul className="v3-bullets">
                        {job.bullets.map((bullet) => (
                          <li key={bullet.text}>{bullet.text}</li>
                        ))}
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
      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">03&nbsp;&nbsp;Toolchain</p></Reveal>
            <div>
              {data.skills.map((group, index) => (
                <Reveal key={group.category} delay={Math.min(index, 3) * 0.06}>
                  <div className="v3-skill-group">
                    <h3>{group.category}</h3>
                    <div className="v3-pills">
                      {group.items.map((item) => (
                        <span className="v3-pill" key={item}>{item}</span>
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
      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">04&nbsp;&nbsp;Education</p></Reveal>
            <div>
              {data.education.degrees.map((degree) => (
                <Reveal key={`${degree.school}-${degree.degree}`}>
                  <div className="v3-degree">
                    <h3>{degree.school}</h3>
                    <p>{degree.degree} · {degree.graduation}</p>
                  </div>
                </Reveal>
              ))}

              {data.education.certificates.length > 0 && (
                <Reveal delay={0.08}>
                  <div className="v3-certs">
                    {data.education.certificates.map((certificate) => (
                      <div className="v3-cert" key={`${certificate.certificateName}-${certificate.issuer}`}>
                        <h4>{certificate.certificateName}</h4>
                        <p className="v3-cert-issuer">{certificate.issuer}</p>
                        <p className="v3-cert-date">{certificate.date}</p>
                        {certificate.credentialUrl && (
                          <a
                            className="v3-link"
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginTop: 10 }}
                            suppressHydrationWarning
                          >
                            {certificate.credentialLabel || "Show credential"}
                            <svg className="v3-arrow" width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path d="M4 12L12 4m0 0H5.5M12 4v6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        )}
                        <div className="v3-cert-bar" aria-hidden="true" />
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- footer */}
      <footer className="v3-footer">
        <div className="v3-shell">
          <div className="v3-footer-inner">
            <div className="v3-footer-mark">
              <V3Mark id="footer" size={58} animated float />
              <p className="v3-footer-note">
                One continuous stroke, top to bottom — the R&rsquo;s stem, then both bowls
                of the <em>B</em> as a single flowing curve.
              </p>
            </div>
            <span className="v3-footer-url">rileybeenders.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
