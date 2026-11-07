// List everything that may belong on the main resume since it was last reviewed.
//
//   node .claude/skills/update-main-resume/scripts/collect-changes.mjs [--since <commit>]
//
// Reads ResumeBuilder/main-resume/manifest.json for the baseline commit
// (reviewedThrough) and the last build date (updated), then prints:
//   1. commits since the baseline that touched resume data,
//   2. the committed diff of each resume-relevant data file since the baseline,
//   3. uncommitted and untracked changes to those files,
//   4. tailored resume HTML in output/resume-html/ changed since the last build
//      (reviewed wording that may be worth carrying over),
//   5. career Q&A entries answered or partly answered since the baseline.
// It only reports; picking what is resume-worthy is the skill's job.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "ResumeBuilder/main-resume/manifest.json");
if (!existsSync(MANIFEST)) {
  console.error("No ResumeBuilder/main-resume/manifest.json; run from the repo root.");
  process.exit(2);
}
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const argv = process.argv.slice(2);
const since = argv.includes("--since") ? argv[argv.indexOf("--since") + 1] : manifest.reviewedThrough;

// Files whose content can reach the resume. Site-only files (theme, page copy,
// about-site, proofs) are left out on purpose.
const FILES = [
  "data/header.json",
  "data/home/summary.json",
  "data/home/experience.json",
  "data/home/skills.json",
  "data/home/education.json",
  "data/projects/projects.json",
  "data/career-qa/qa-log.json",
];

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }).trimEnd();
const section = (title) => console.log(`\n=== ${title} ===`);

console.log(`main resume: ${manifest.publicPath} (${manifest.pages} pages, built ${manifest.updated})`);
console.log(`baseline:    ${since} -> HEAD ${git("rev-parse", "--short", "HEAD")}`);

section("1. Commits touching resume data since the baseline");
const log = git("log", "--format=%h %ad %s", "--date=short", `${since}..HEAD`, "--", ...FILES);
console.log(log || "(none)");

section("2. Committed changes since the baseline (word diff)");
let any = false;
for (const f of FILES) {
  const d = git("diff", "--word-diff=plain", "--unified=1", since, "HEAD", "--", f);
  if (d) { any = true; console.log(`\n--- ${f}\n${d}`); }
}
if (!any) console.log("(none)");

section("3. Uncommitted and untracked changes");
const status = git("status", "--porcelain", "--", ...FILES, "data/");
console.log(status || "(clean)");
for (const f of FILES) {
  const d = git("diff", "--word-diff=plain", "--unified=1", "HEAD", "--", f);
  if (d) console.log(`\n--- ${f} (working tree)\n${d}`);
}

section(`4. Tailored resumes changed since ${manifest.updated}`);
const htmlDir = path.join(ROOT, "output/resume-html");
const cutoff = Date.parse(manifest.updated);
const tailored = existsSync(htmlDir)
  ? readdirSync(htmlDir).filter((n) => n.endsWith(".html") && statSync(path.join(htmlDir, n)).mtimeMs >= cutoff)
  : [];
console.log(tailored.length ? tailored.map((n) => `output/resume-html/${n}`).join("\n") : "(none)");

section("5. Career Q&A entries answered since the baseline");
try {
  const before = JSON.parse(git("show", `${since}:data/career-qa/qa-log.json`));
  const now = JSON.parse(readFileSync(path.join(ROOT, "data/career-qa/qa-log.json"), "utf8"));
  const list = (log) => (Array.isArray(log) ? log : log.entries ?? log.questions ?? []);
  const old = new Map(list(before).map((e) => [e.id ?? e.question, e.status]));
  const fresh = list(now).filter((e) => ["answered", "partial"].includes(e.status) && old.get(e.id ?? e.question) !== e.status);
  console.log(fresh.length ? fresh.map((e) => `${e.id ?? "?"} [${e.status}] ${e.question ?? ""}`).join("\n") : "(none)");
} catch (error) {
  console.log(`(could not compare: ${error.message.split("\n")[0]})`);
}
