/**
 * The GitHub contribution calendar on the home page, read from GitHub's own
 * public contributions fragment (the same markup the profile page embeds).
 * No token, no third-party service: the fragment is fetched on the server
 * and cached for an hour, so a visitor never talks to GitHub and the page
 * never waits on it at request time once it has been built.
 */

export type ContributionDay = {
  /** YYYY-MM-DD. */
  date: string;
  /** GitHub's own 0–4 intensity step for the day. */
  level: 0 | 1 | 2 | 3 | 4;
  count: number;
};

export type Contributions = {
  username: string;
  /** Contributions in the window the calendar covers (the last year). */
  total: number;
  /** Every day in the window, oldest first, no gaps. */
  days: ContributionDay[];
};

/** The GitHub login from a profile URL ("https://github.com/RileyBeenders" → "RileyBeenders"). */
export function githubUsername(profileUrl: string): string | null {
  try {
    const url = new URL(profileUrl);
    if (!/(^|\.)github\.com$/i.test(url.hostname)) return null;
    const [user] = url.pathname.split("/").filter(Boolean);
    return user && /^[A-Za-z0-9-]+$/.test(user) ? user : null;
  } catch {
    return null;
  }
}

const COUNT_RE = /^(\d+|No) contributions?/;

function attr(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}="([^"]*)"`).exec(tag);
  return match?.[1];
}

/** Reads the day cells and their tooltips out of the contributions fragment. */
export function parseContributions(html: string, username: string): Contributions | null {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const forId = attr(match[1], "for");
    const text = match[2].trim();
    const count = COUNT_RE.exec(text);
    if (forId && count) counts.set(forId, count[1] === "No" ? 0 : Number(count[1]));
  }

  const days: ContributionDay[] = [];
  for (const match of html.matchAll(/<td\b([^>]*data-date="[^"]*"[^>]*)>/g)) {
    const tag = match[1];
    const date = attr(tag, "data-date");
    const level = Number(attr(tag, "data-level") ?? 0);
    const id = attr(tag, "id");
    if (!date) continue;
    days.push({
      date,
      level: (level >= 0 && level <= 4 ? level : 0) as ContributionDay["level"],
      count: (id ? counts.get(id) : undefined) ?? 0
    });
  }
  if (days.length === 0) return null;

  days.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  return { username, total, days };
}

export async function getContributions(username: string): Promise<Contributions | null> {
  try {
    const res = await fetch(`https://github.com/users/${encodeURIComponent(username)}/contributions`, {
      headers: { Accept: "text/html", "User-Agent": "rileybeenders.com (contribution calendar)" },
      // Previous caching model (no cacheComponents): the page that renders this
      // becomes ISR with an hour between refreshes.
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;
    return parseContributions(await res.text(), username);
  } catch {
    return null;
  }
}
