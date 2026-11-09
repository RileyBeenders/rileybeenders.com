"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import type { ContactForm as ContactFormCopy } from "@/types/contact";

type ContactFormProps = {
  copy: ContactFormCopy;
  /** Where a message goes when the server cannot send it: the visitor's own mail app. */
  fallbackEmail: string;
};

type Status = { tone: "idle" | "busy" | "ok" | "error" | "fallback"; text: string };

/**
 * "Send me a message": name, email, message. Posts to /api/contact, which
 * delivers to one inbox. If that inbox is not set up (the route answers
 * 503), the form opens the visitor's mail app with the message filled in,
 * so a message is never lost. A hidden "company" field catches bots.
 */
export function ContactForm({ copy, fallbackEmail }: ContactFormProps) {
  const [status, setStatus] = useState<Status>({ tone: "idle", text: "" });
  const busy = status.tone === "busy";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      company: String(data.get("company") ?? "")
    };

    setStatus({ tone: "busy", text: copy.sending });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setStatus({ tone: "ok", text: copy.sent });
        form.reset();
        return;
      }
      if (res.status === 503) {
        const subject = encodeURIComponent(`Message from ${payload.name} via rileybeenders.com`);
        const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} <${payload.email}>`);
        setStatus({ tone: "fallback", text: copy.fallback });
        window.location.href = `mailto:${fallbackEmail}?subject=${subject}&body=${body}`;
        return;
      }
      setStatus({ tone: "error", text: copy.failed });
    } catch {
      setStatus({ tone: "error", text: copy.failed });
    }
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      <h3>{copy.title}</h3>
      <div className="form-row">
        <div className="field">
          <label htmlFor="cf-name">{copy.nameLabel}</label>
          <input id="cf-name" name="name" type="text" autoComplete="name" required maxLength={120} />
        </div>
        <div className="field">
          <label htmlFor="cf-email">{copy.emailLabel}</label>
          <input id="cf-email" name="email" type="email" autoComplete="email" required maxLength={200} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="cf-message">{copy.messageLabel}</label>
        <textarea id="cf-message" name="message" required maxLength={5000} />
      </div>
      {/* The honeypot: hidden from people, filled by bots. */}
      <div className="field field--trap" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="form-foot">
        <button type="submit" className="btn btn--solid" disabled={busy} aria-busy={busy}>
          <Send size={15} strokeWidth={2} aria-hidden="true" />
          <span>{busy ? copy.sending : copy.send}</span>
        </button>
        <p className="form-note" data-tone={status.tone === "ok" || status.tone === "fallback" ? "ok" : status.tone === "error" ? "error" : undefined} role="status" aria-live="polite">
          {status.text}
        </p>
      </div>
    </form>
  );
}
