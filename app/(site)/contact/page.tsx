import type { Metadata } from "next";
import contactData from "@/data/contact/contact.json";
import resumeData from "@/data/resumeData";
import { Reveal } from "@/components/blueprint/Reveal";
import { ContactBlock } from "@/components/bench/ContactBlock";
import { SiteFooter } from "@/components/bench/SiteFooter";
import type { ContactData } from "@/types/contact";

const data = contactData as ContactData;

export const metadata: Metadata = {
  title: data.meta.title,
  description: data.meta.description
};

/** The contact page: the headline, then the same block the home page ends with (the ways in and the message form). */
export default function ContactPage() {
  const { person, visibility } = resumeData;

  return (
    <main>
      <section className="shell sec sec--tight" aria-label={data.hero.title}>
        <Reveal>
          <div className="sec-head">
            <h1 className="sec-title">{data.hero.title}</h1>
            <p className="sec-sub">{data.details.title}</p>
          </div>
        </Reveal>
        <ContactBlock person={person} relocation={visibility.openToRelocation} heading={false} />
      </section>

      <SiteFooter location={person.location} />
    </main>
  );
}
