// Publish a built and verified main resume (HTML + PDF pair) as the home page's Download PDF.
//
//   node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs --name-only [--date YYYY-MM-DD]
//   node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs <built.pdf> <built.html> [--pages N] [--m X] [--date YYYY-MM-DD]
//
// The file name is fixed by the date: RileyBeenders_Resume_<YY><DDD>, where YY is the
// last two digits of the year and DDD the zero-padded day of the year (2026-11-07 -> 26311).
// --name-only prints that name and exits. --date overrides today (local time).
//
// Publishing:
//   1. copies the pair into .DefaultResume/<name>.pdf|.html (Riley's working copy),
//   2. copies the pair into public/resume/<name>.pdf|.html (what the site serves),
//   3. removes every other RileyBeenders_Resume_*.pdf|.html from both folders, so each holds one pair,
//   4. points data/header.json resumeHtmlPath (what Download PDF opens) and resumePdfPath
//      (what /api/resume-pdf serves) at the new files,
//   5. records the build in ResumeBuilder/main-resume/manifest.json
//      (name, pages, spacingMultiplier, reviewedThrough = HEAD, updated = the date).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "ResumeBuilder/main-resume/manifest.json");
const HEADER = path.join(ROOT, "data/header.json");
const WORKING = path.join(ROOT, ".DefaultResume");
const PUBLIC = path.join(ROOT, "public/resume");
const PREFIX = "RileyBeenders_Resume_";

const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));

function localDate(iso) {
  if (!iso) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight, so the time of day can't round into tomorrow
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) {
    console.error(`Bad --date "${iso}": use YYYY-MM-DD.`);
    process.exit(2);
  }
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

const date = localDate(flag("--date"));
const dayOfYear = Math.round((date - new Date(date.getFullYear(), 0, 1)) / 86_400_000) + 1;
const name = `${PREFIX}${String(date.getFullYear() % 100).padStart(2, "0")}${String(dayOfYear).padStart(3, "0")}`;
const isoDate = date.toLocaleDateString("en-CA");

if (argv.includes("--name-only")) {
  console.log(name);
  process.exit(0);
}

const [builtPdf, builtHtml] = positional;
if (!builtPdf || !builtHtml) {
  console.error("usage: publish-main-resume.mjs <built.pdf> <built.html> [--pages N] [--m X] [--date YYYY-MM-DD]");
  process.exit(2);
}
if (!existsSync(builtPdf) || readFileSync(builtPdf).subarray(0, 5).toString() !== "%PDF-") {
  console.error(`${builtPdf} is missing or not a PDF.`);
  process.exit(1);
}
if (!existsSync(builtHtml) || !/^\s*<!doctype html>/i.test(readFileSync(builtHtml, "utf8").slice(0, 200))) {
  console.error(`${builtHtml} is missing or not an HTML document.`);
  process.exit(1);
}

for (const dir of [WORKING, PUBLIC]) {
  mkdirSync(dir, { recursive: true });
  for (const file of readdirSync(dir)) {
    if (file.startsWith(PREFIX) && /\.(pdf|html)$/i.test(file) && !file.startsWith(`${name}.`)) {
      rmSync(path.join(dir, file));
      console.log(`removed ${path.relative(ROOT, path.join(dir, file))}`);
    }
  }
  // Same-day rebuilds overwrite in place; a source that is already the target is left alone.
  for (const [src, ext] of [[builtPdf, "pdf"], [builtHtml, "html"]]) {
    const dest = path.join(dir, `${name}.${ext}`);
    if (path.resolve(src) !== path.resolve(dest)) copyFileSync(src, dest);
  }
}

const header = JSON.parse(readFileSync(HEADER, "utf8"));
header.resumePdfPath = `/resume/${name}.pdf`;
header.resumeHtmlPath = `/resume/${name}.html`;
writeFileSync(HEADER, `${JSON.stringify(header, null, 2)}\n`);

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
delete manifest.publicPath;
const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
Object.assign(manifest, {
  name,
  pages: flag("--pages") ? Number(flag("--pages")) : manifest.pages,
  spacingMultiplier: flag("--m") ? Number(flag("--m")) : manifest.spacingMultiplier,
  reviewedThrough: head,
  updated: isoDate,
});
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`published .DefaultResume/${name}.{pdf,html} and public/resume/${name}.{pdf,html}`);
console.log(`data/header.json resumeHtmlPath -> ${header.resumeHtmlPath}, resumePdfPath -> ${header.resumePdfPath}`);
console.log(`manifest: reviewedThrough ${head}, updated ${isoDate}`);
