import { execSync } from "node:child_process";

export type BuildStamp = {
  /** Short commit hash the page was built from, or null when git is unreachable. */
  commit: string | null;
  /** The revision's date, e.g. "18 Sep 2026": when the commit was made, or the build date when git cannot say. */
  date: string;
};

function git(args: string): string | null {
  try {
    return execSync(`git ${args}`, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || null;
  } catch {
    return null;
  }
}

function formatDate(when: Date): string {
  return `${when.getDate()} ${when.toLocaleDateString("en-US", { month: "short" })} ${when.getFullYear()}`;
}

/**
 * The revision line in the footer's title block: "aaa1715 · 18 Sep 2026".
 * Vercel exposes the commit in the environment; a local build asks git. The
 * date is the commit's own, so the stamp names the revision rather than the
 * build and a redeploy without a new commit leaves it alone. Import this only
 * from server components: lib/site.ts is shared with client components and
 * must stay free of Node built-ins, which is why this lives in its own module.
 */
export function getBuildStamp(): BuildStamp {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? git("rev-parse --short HEAD");
  // %cI is the committer date in strict ISO 8601, which Date parses without ambiguity.
  const committed = commit ? git("log -1 --format=%cI HEAD") : null;
  const when = committed ? new Date(committed) : new Date();
  return { commit, date: formatDate(Number.isNaN(when.getTime()) ? new Date() : when) };
}
