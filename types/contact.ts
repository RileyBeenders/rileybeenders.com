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

/** The words on the "Send me a message" form (components/sheet/ContactForm.tsx). */
export type ContactForm = {
  title: string;
  nameLabel: string;
  emailLabel: string;
  messageLabel: string;
  send: string;
  sending: string;
  /** After a message has gone through. */
  sent: string;
  /** When the server could not send it. */
  failed: string;
  /** When the inbox is not configured yet: the visitor's own mail app opens instead. */
  fallback: string;
};

export type ContactData = {
  meta: PageMeta;
  hero: ContactHero;
  details: ContactDetails;
  form: ContactForm;
};
