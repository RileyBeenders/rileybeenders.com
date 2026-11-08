/**
 * The "Send me a message" form (components/sheet/ContactForm.tsx) posts here.
 * Delivery goes through Resend's REST API (no SDK, one fetch), to one inbox:
 *
 *   RESEND_API_KEY   the Resend key (never public)
 *   CONTACT_TO       where messages land, e.g. contact@rileybeenders.com
 *   CONTACT_FROM     the verified sender, e.g. "RileyBeenders.com <contact@rileybeenders.com>"
 *
 * Without the key the route answers 503 and the form falls back to opening
 * the visitor's own mail app with the message filled in, so nothing is lost
 * while the inbox is being set up. See .env.example.
 */
import header from "@/data/header.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX = { name: 120, email: 200, message: 5000 } as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A light brake on repeat posts from one address. In-memory, so it is per instance; the honeypot does the real work. */
const recent = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

function throttled(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
  hits.push(now);
  recent.set(key, hits);
  return hits.length > LIMIT;
}

type Payload = { name?: unknown; email?: unknown; message?: unknown; company?: unknown };

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= max ? trimmed : null;
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return Response.json({ ok: false, reason: "bad-request" }, { status: 400 });
  }

  // The honeypot: a field no person sees. Anything in it is a bot, which gets a quiet "ok".
  if (typeof payload.company === "string" && payload.company.trim() !== "") {
    return Response.json({ ok: true });
  }

  const name = text(payload.name, MAX.name);
  const email = text(payload.email, MAX.email);
  const message = text(payload.message, MAX.message);
  if (!name || !email || !message || !EMAIL.test(email)) {
    return Response.json({ ok: false, reason: "invalid" }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (throttled(ip)) {
    return Response.json({ ok: false, reason: "throttled" }, { status: 429 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM ?? `${header.person.name} <contact@rileybeenders.com>`;
  if (!key || !to) {
    return Response.json({ ok: false, reason: "unconfigured" }, { status: 503 });
  }

  const body = [
    `From: ${name} <${email}>`,
    `Sent from ${header.person.website} on ${new Date().toISOString()}`,
    "",
    message
  ].join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Message from ${name} via rileybeenders.com`,
        text: body
      })
    });
    if (!res.ok) {
      console.error("Contact form: Resend answered", res.status, await res.text().catch(() => ""));
      return Response.json({ ok: false, reason: "send-failed" }, { status: 502 });
    }
  } catch (error) {
    console.error("Contact form: could not reach Resend.", error);
    return Response.json({ ok: false, reason: "send-failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
