import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/v3/Reveal";
import { V3Actions } from "@/components/v3/V3Actions";

export const metadata: Metadata = {
  title: "Contact | Riley Beenders",
  description: "Ways to get in touch."
};

export default function V3Contact() {
  const { person } = resumeData;

  return (
    <main>
      <section className="v3-hero" style={{ paddingBottom: 8 }}>
        <div className="v3-shell">
          <Reveal delay={0.05}><p className="v3-eyebrow">Contact</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 116px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Get in touch</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="v3-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <div className="v3-hero-meta">
              <p className="v3-hero-tagline">Email is the fastest way to reach me.</p>
              <div className="v3-hero-place">
                <span>{person.location}</span>
                <span style={{ color: "var(--accent)" }}>Open to relocation</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.46}><V3Actions data={resumeData} /></Reveal>
        </div>
      </section>

      <section className="v3-section">
        <div className="v3-shell">
          <Reveal as="rule"><div className="v3-rule v3-rule--hair" /></Reveal>
          <div className="v3-section-grid">
            <Reveal><p className="v3-section-index">01&nbsp;&nbsp;Details</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="v3-prose">
                  I try to respond within a day or two — feel free to include a bit of
                  context on what you&rsquo;d like to talk about.
                </p>
                <div className="v3-certs" style={{ marginTop: 30 }}>
                  <div className="v3-cert">
                    <h4>Email</h4>
                    <a className="v3-link" href={`mailto:${person.email}`} suppressHydrationWarning>
                      {person.email}
                    </a>
                    <div className="v3-cert-bar" aria-hidden="true" />
                  </div>
                  <div className="v3-cert">
                    <h4>LinkedIn</h4>
                    <a className="v3-link" href={person.linkedin} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      riley-beenders
                    </a>
                    <div className="v3-cert-bar" aria-hidden="true" />
                  </div>
                  <div className="v3-cert">
                    <h4>GitHub</h4>
                    <a className="v3-link" href={person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      RileyBeenders
                    </a>
                    <div className="v3-cert-bar" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
