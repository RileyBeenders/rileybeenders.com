import type { Metadata } from "next";
import { BriefcaseBusiness, Code, Mail } from "lucide-react";
import resumeData from "@/data/resumeData";

export const metadata: Metadata = {
  title: "Contact | Riley Beenders",
  description: "Ways to get in touch."
};

export default function ContactPage() {
  const { person } = resumeData;

  return (
    <main className="site-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <section className="resume-stage">
        <header className="hero-card" id="section-contact-header">
          <div>
            <div className="status-pill">Contact</div>
            <h1>Get in Touch</h1>
            <p>{person.location}</p>
            <div className="contact-row">
              <a href={`mailto:${person.email}`} suppressHydrationWarning><Mail size={14} /> Email</a>
              <a href={person.linkedin} suppressHydrationWarning><BriefcaseBusiness size={14} /> LinkedIn</a>
              <a href={person.github} suppressHydrationWarning><Code size={14} /> GitHub</a>
            </div>
          </div>
        </header>

        <section className="resume-paper">
          <div className="resume-column-main">
            <section className="resume-block" id="section-contact-details">
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">Details</p>
                  <h2>Best Way to Reach Me</h2>
                </div>
              </div>
              <p className="summary-text">
                Email is the fastest way to reach me. I try to respond within a day or two —
                feel free to include a bit of context on what you'd like to talk about.
              </p>
            </section>
          </div>
        </section>
      </section>
    </main>
  );
}
