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
  hero: ContactHero;
  details: ContactDetails;
};
