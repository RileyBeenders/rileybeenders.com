import type { PageMeta } from "@/types/pages";

export type ContactHero = {
  title: string;
  tagline: string;
};

export type ContactDetails = {
  title: string;
  /** The paragraph(s) under the section index; the email address is printed after them from header.json. */
  description: string[];
};

export type ContactData = {
  meta: PageMeta;
  hero: ContactHero;
  details: ContactDetails;
};
