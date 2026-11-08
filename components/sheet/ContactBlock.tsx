import { Mail, MapPin } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/sheet/BrandIcons";
import contactData from "@/data/contact/contact.json";
import type { ContactData } from "@/types/contact";
import type { ResumeData } from "@/types/resume";
import { Reveal } from "@/components/blueprint/Reveal";
import { ContactForm } from "@/components/sheet/ContactForm";
import { splitParagraphs } from "@/components/content/Paragraphs";
import { ui } from "@/lib/copy";

const contact = contactData as ContactData;

type ContactBlockProps = {
  person: ResumeData["person"];
  relocation: boolean;
  /** The home page gets a section heading from the contact data; the contact page draws its own. */
  heading?: boolean;
};

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The ways in, beside the message form: the tagline and the details
 * paragraph, then email, LinkedIn and GitHub as rows, and where Riley is.
 */
export function ContactBlock({ person, relocation, heading = true }: ContactBlockProps) {
  return (
    <Reveal>
      <div className="card contact-card">
        <div className="contact-grid">
          <div className="contact-copy">
            {heading && <h2>{contact.hero.title}</h2>}
            <p className="contact-tagline">{contact.hero.tagline}</p>
            {contact.details.description.flatMap(splitParagraphs).map((paragraph) => (
              <p className="prose" key={paragraph}>{paragraph}</p>
            ))}
            <div className="contact-ways">
              <a className="contact-way" href={`mailto:${person.email}`} suppressHydrationWarning>
                <Mail size={16} strokeWidth={1.9} aria-hidden="true" />
                <span>{person.email}</span>
                <small>{ui.actions.email}</small>
              </a>
              <a className="contact-way" href={person.linkedin} target="_blank" rel="noreferrer" suppressHydrationWarning>
                <LinkedinIcon size={15} />
                <span>{host(person.linkedin)}</span>
                <small>{ui.actions.linkedin}</small>
              </a>
              <a className="contact-way" href={person.github} target="_blank" rel="noreferrer" suppressHydrationWarning>
                <GithubIcon size={15} />
                <span>{host(person.github)}</span>
                <small>{ui.actions.github}</small>
              </a>
              <span className="contact-way" style={{ cursor: "default" }}>
                <MapPin size={16} strokeWidth={1.9} aria-hidden="true" />
                <span>{person.location}</span>
                {relocation && <small>{ui.openToRelocation}</small>}
              </span>
            </div>
          </div>
          <ContactForm copy={contact.form} fallbackEmail={person.email} />
        </div>
      </div>
    </Reveal>
  );
}
