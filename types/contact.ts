export type ContactHero = {
  eyebrow: string;
  title: string;
  tagline: string;
};

export type ContactDetails = {
  title: string;
  description: string[];
  /** Link text for the LinkedIn card; the address itself is `person.linkedin` in header.json. */
  linkedinLabel: string;
  /** Link text for the GitHub card; the address itself is `person.github` in header.json. */
  githubLabel: string;
};

export type ContactData = {
  hero: ContactHero;
  details: ContactDetails;
};
