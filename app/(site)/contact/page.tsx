import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpActions } from "@/components/blueprint/BpActions";

export const metadata: Metadata = {
  title: "Contact | Riley Beenders",
  description: "Ways to get in touch."
};

export default function ContactPage() {
  const { person } = resumeData;

  return (
    <main>
      <section className="bp-hero" style={{ paddingBottom: 8 }}>
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">Contact</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 116px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>Get in touch</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <div className="bp-hero-meta">
              <p className="bp-hero-tagline">Email is the fastest way to reach me.</p>
              <div className="bp-hero-place">
                <span>{person.location}</span>
                <span style={{ color: "var(--accent)" }}>Open to relocation</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.46}><BpActions data={resumeData} /></Reveal>
        </div>
      </section>

      <section className="bp-section">
        <div className="bp-shell">
          <Reveal as="rule"><div className="bp-rule bp-rule--hair" /></Reveal>
          <div className="bp-section-grid">
            <Reveal><p className="bp-section-index">01&nbsp;&nbsp;Details</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                <p className="bp-prose">
                  I try to respond within a day or two — feel free to include a bit of
                  context on what you&rsquo;d like to talk about.
                </p>
                <div className="bp-certs" style={{ marginTop: 30 }}>
                  <div className="bp-cert">
                    <h4>Email</h4>
                    <a className="bp-link" href={`mailto:${person.email}`} suppressHydrationWarning>
                      {person.email}
                    </a>
                    <div className="bp-cert-bar" aria-hidden="true" />
                  </div>
                  <div className="bp-cert">
                    <h4>LinkedIn</h4>
                    <a className="bp-link" href={person.linkedin} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      riley-beenders
                    </a>
                    <div className="bp-cert-bar" aria-hidden="true" />
                  </div>
                  <div className="bp-cert">
                    <h4>GitHub</h4>
                    <a className="bp-link" href={person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      RileyBeenders
                    </a>
                    <div className="bp-cert-bar" aria-hidden="true" />
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
