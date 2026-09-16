import type { Metadata } from "next";
import contactData from "@/data/contact/contact.json";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { BpActions } from "@/components/blueprint/BpActions";
import type { ContactData } from "@/types/contact";

const data = contactData as ContactData;

export const metadata: Metadata = {
  title: "Contact | Riley Beenders",
  description: "Ways to get in touch."
};

export default function ContactPage() {
  const { person, visibility } = resumeData;

  return (
    <main>
      <section className="bp-hero" style={{ paddingBottom: 8 }}>
        <div className="bp-shell">
          <Reveal delay={0.05}><p className="bp-eyebrow">{data.hero.eyebrow}</p></Reveal>
          <h1 style={{ fontSize: "clamp(48px, 9vw, 116px)" }}>
            <Reveal delay={0.14}><span style={{ display: "block" }}>{data.hero.title}</span></Reveal>
          </h1>
          <Reveal as="rule" delay={0.3}>
            <div className="bp-rule" style={{ marginTop: 32 }} />
          </Reveal>
          <Reveal delay={0.38}>
            <div className="bp-hero-meta">
              <p className="bp-hero-tagline">{data.hero.tagline}</p>
              <div className="bp-hero-place">
                <span>{person.location}</span>
                {visibility.openToRelocation ? (
                  <span style={{ color: "var(--accent)" }}>Open to relocation</span>
                ) : null}
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
            <Reveal><p className="bp-section-index">01&nbsp;&nbsp;{data.details.title}</p></Reveal>
            <Reveal delay={0.06}>
              <div>
                {data.details.description.map((paragraph) => (
                  <p className="bp-prose" key={paragraph}>{paragraph}</p>
                ))}
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
                      {data.details.linkedinLabel}
                    </a>
                    <div className="bp-cert-bar" aria-hidden="true" />
                  </div>
                  <div className="bp-cert">
                    <h4>GitHub</h4>
                    <a className="bp-link" href={person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
                      {data.details.githubLabel}
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
