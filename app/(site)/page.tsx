import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpActions } from "@/components/blueprint/BpActions";
import { BpMark } from "@/components/blueprint/BpMark";

export default function HomePage() {
  const data = resumeData;

  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="bp-hero">
        <svg
          className="bp-hero-ribbon"
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

        <div className="bp-shell">
          <Reveal delay={0.05}>
            <p className="bp-eyebrow">R&amp;D · Electromechanical · Automation</p>
          </Reveal>

          <h1>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Riley</span></Reveal>
            <Reveal delay={0.24}><span style={{ display: "block" }}>Beenders</span></Reveal>
          </h1>

          <Reveal as="rule" delay={0.36}>
            <div className="bp-rule" style={{ marginTop: 38 }} />
          </Reveal>

          <Reveal delay={0.44}>
            <div className="bp-hero-meta">
              <p className="bp-hero-tagline">{data.person.title}</p>
              <div className="bp-hero-place">
                <span>{data.person.location}</span>
                <span style={{ color: "var(--accent)" }}>Open to relocation</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.54}>
            <BpActions data={data} />
          </Reveal>
        </div>
      </section>

      {/* --------------------------------------------------------- summary */}
      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">01&nbsp;&nbsp;Summary</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="bp-prose">
                  <span className="bp-dropcap">{data.summary.slice(0, 1)}</span>
                  {data.summary.slice(1)}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ experience */}
      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">02&nbsp;&nbsp;Experience</p></Reveal>
            <div className="bp-roles">
              {data.experience.map((job, index) => (
                <Reveal key={`${job.company}-${job.start}`} delay={Math.min(index, 3) * 0.06}>
                  <article className="bp-role">
                    <div className="bp-role-head">
                      <h3>{job.role}</h3>
                      <span className="bp-role-dates">{job.start} — {job.end}</span>
                    </div>
                    <p className="bp-role-org">{job.company} · {job.location}</p>
                    {job.context && <p className="bp-role-context">{job.context}</p>}
                    {job.bullets.length > 0 && (
                      <ul className="bp-bullets">
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
      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">03&nbsp;&nbsp;Toolchain</p></Reveal>
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
      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">04&nbsp;&nbsp;Education</p></Reveal>
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
                            {certificate.credentialLabel || "Show credential"}
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

      {/* ---------------------------------------------------------- footer */}
      <footer className="bp-footer">
        <div className="bp-shell">
          <div className="bp-footer-inner">
            <div className="bp-footer-mark">
              <BpMark id="footer" size={58} animated float />
              <p className="bp-footer-note">
                One continuous stroke, top to bottom — the R&rsquo;s stem, then both bowls
                of the <em>B</em> as a single flowing curve.
              </p>
            </div>
            <span className="bp-footer-url">rileybeenders.com</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
