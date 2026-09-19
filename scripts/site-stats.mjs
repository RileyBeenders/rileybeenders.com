// Refreshes the About-this-site page's numbers from the repository and lists
// the commits that have landed since the timeline's last entry, so the
// site-timeline-sync skill never hand-counts anything.
//
//   node scripts/site-stats.mjs            # report only
//   node scripts/site-stats.mjs --write    # also update the stats in data/site/about-site.json
//   node scripts/site-stats.mjs --json     # machine-readable report on stdout
//
// Stats are matched to data/site/about-site.json by label, so they can be
// reordered or reworded in the Studio without breaking the refresh. A label
// the script doesn't know is left alone.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ABOUT = path.join(ROOT, "data/site/about-site.json");
const args = new Set(process.argv.slice(2));

const git = (...argv) => execFileSync("git", argv, { cwd: ROOT, encoding: "utf8" }).trim();
const today = new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------------ stats ---

const firstCommitDate = git("log", "--reverse", "--format=%ad", "--date=short").split("\n")[0];
const commits = Number(git("rev-list", "--count", "HEAD"));
const days = Math.round((Date.parse(today) - Date.parse(firstCommitDate)) / 86_400_000);

// Every skill lives in .agents/skills/<name>/SKILL.md (since 2026-09-19). The
// vendored ones are the keys of skills-lock.json; whatever else is there is a
// repo-specific procedure.
const skillsDir = path.join(ROOT, ".agents/skills");
const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(skillsDir, d.name, "SKILL.md")))
  .map((d) => d.name);
const registered = Object.keys(JSON.parse(readFileSync(path.join(ROOT, "skills-lock.json"), "utf8")).skills ?? {})
  .filter((name) => skills.includes(name));
const procedures = skills.filter((name) => !registered.includes(name));

function countNotes(dir) {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) n += countNotes(p);
    else if (entry.name.endsWith(".md")) n += 1;
  }
  return n;
}
const vaultDir = path.join(ROOT, ".obsidian/rileybeenders.com Notes");
const vaultNotes = existsSync(vaultDir) ? countNotes(vaultDir) : 0;

const readme = readFileSync(path.join(ROOT, "README.md"), "utf8");
const applications = (readme.match(/^\s*section \d{3}\s*$/gm) ?? []).length;

const projects = JSON.parse(readFileSync(path.join(ROOT, "data/projects/projects.json"), "utf8"));
const queued = projects.filter((p) => p.visible === false).length;
const published = projects.length - queued;

const stats = {
  "Commits": { value: commits, note: "on main and its version branches" },
  "Days in motion": { value: days, note: "since the first commit" },
  "Agent skills": { value: skills.length, note: `${procedures.length} repo procedures, ${registered.length} registered` },
  "Vault notes": { value: vaultNotes, note: "kept in sync by an agent" },
  "Applications tracked": { value: applications, note: "each with a tailored PDF" },
  "Projects queued": { value: queued, note: "written, hidden, waiting" }
};

// ------------------------------------------------- commits since the timeline ---

const about = JSON.parse(readFileSync(ABOUT, "utf8"));
const timeline = about.feature?.timeline ?? [];
const withHash = timeline.filter((t) => t.hash);
const lastHash = withHash.length ? withHash[withHash.length - 1].hash : null;
const present = timeline.find((t) => t.era === "present");

function commitsSince(hash) {
  const range = hash ? `${hash}..HEAD` : "HEAD";
  const raw = git("log", range, "--no-merges", "--reverse", "--format=%x1e%h%x1f%ad%x1f%s", "--date=short", "--shortstat");
  const out = [];
  for (const block of raw.split("\x1e").filter(Boolean)) {
    const [head, ...rest] = block.trim().split("\n");
    const [h, d, s] = head.split("\x1f");
    const stat = rest.join(" ");
    const num = (re) => Number((stat.match(re) ?? [0, 0])[1]);
    out.push({ hash: h, date: d, subject: s, files: num(/(\d+) files? changed/), insertions: num(/(\d+) insertions?/), deletions: num(/(\d+) deletions?/) });
  }
  return out;
}

const KEYWORDS = /design|studio|agent|skill|theme|dark|launch|live|project|page|rework|timeline|motion|vault|nav|hero|analytics|pdf|resume|deploy|v\d/i;
const since = commitsSince(lastHash).map((c) => ({
  ...c,
  candidate: c.files >= 15 || c.insertions + c.deletions >= 400 || KEYWORDS.test(c.subject)
}));

// ---------------------------------------------------------------- report ---

const report = {
  today,
  firstCommitDate,
  stats,
  lastTimelineHash: lastHash,
  presentEntry: present ? { date: present.date, title: present.title } : null,
  published,
  commitsSinceTimeline: since
};

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`About-this-site stats as of ${today} (first commit ${firstCommitDate})\n`);
  for (const [label, { value, note }] of Object.entries(stats)) {
    const current = about.feature?.stats?.find((s) => s.label === label);
    const mark = !current ? "  (no matching stat on the page)" : current.value === value ? "" : `  (page says ${current.value})`;
    console.log(`  ${label.padEnd(22)} ${String(value).padStart(5)}   ${note}${mark}`);
  }
  console.log(`\nTimeline: last hashed entry ${lastHash ?? "none"}; present entry: ${present ? `"${present.title}" (${present.date})` : "none"}`);
  if (since.length === 0) {
    console.log("No commits since the last timeline entry.");
  } else {
    console.log(`\n${since.length} commit(s) since then — * marks likely key commits:\n`);
    for (const c of since) {
      console.log(`  ${c.candidate ? "*" : " "} ${c.date} ${c.hash}  ${String(c.files).padStart(4)}f ${String(c.insertions).padStart(6)}+ ${String(c.deletions).padStart(5)}-  ${c.subject}`);
    }
    const skeleton = since.filter((c) => c.candidate).map((c) => ({
      date: c.date, era: "past", hash: c.hash, title: c.subject, summary: "", tags: [],
      files: c.files, insertions: c.insertions, deletions: c.deletions
    }));
    if (skeleton.length) {
      console.log("\nSkeleton entries for the candidates (write the summary, pick tags, drop what isn't key):\n");
      console.log(JSON.stringify(skeleton, null, 2));
    }
  }
}

if (args.has("--write")) {
  let changed = 0;
  for (const stat of about.feature?.stats ?? []) {
    const next = stats[stat.label];
    if (!next) continue;
    if (stat.value !== next.value) { stat.value = next.value; changed++; }
    if (stat.note !== next.note && stat.label === "Agent skills") { stat.note = next.note; changed++; }
  }
  if (changed) {
    writeFileSync(ABOUT, JSON.stringify(about, null, 2) + "\n");
    console.log(`\nWrote ${changed} stat change(s) to ${path.relative(ROOT, ABOUT)}.`);
  } else {
    console.log(`\nStats already current; ${path.relative(ROOT, ABOUT)} untouched.`);
  }
}
