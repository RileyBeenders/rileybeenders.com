// Publish a built and validated main-resume PDF as the home page's Download PDF.
//
//   node .claude/skills/update-main-resume/scripts/publish-main-resume.mjs <built.pdf> <Download_Name.pdf> [--pages N] [--m X]
//
// Checks the name, copies the PDF to public/resume/<name>, removes the previous
// public file when the name changed, points data/header.json resumePdfPath at the
// new file, and records the build in ResumeBuilder/main-resume/manifest.json
// (publicPath, pages, spacingMultiplier, reviewedThrough = HEAD, updated = today).
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, "ResumeBuilder/main-resume/manifest.json");
const HEADER = path.join(ROOT, "data/header.json");

const argv = process.argv.slice(2);
const flag = (name) => (argv.includes(name) ? argv[argv.indexOf(name) + 1] : undefined);
const [built, name] = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
if (!built || !name) {
  console.error("usage: publish-main-resume.mjs <built.pdf> <Download_Name.pdf> [--pages N] [--m X]");
  process.exit(2);
}

// A visitor saves the file under this exact name, so keep it portable:
// ASCII letters, digits, underscore, hyphen, and one ".pdf" at the end.
if (!/^[A-Za-z0-9][A-Za-z0-9_-]{2,80}\.pdf$/.test(name)) {
  console.error(`Bad file name "${name}": use letters, digits, _ or -, no spaces, ending in .pdf.`);
  process.exit(1);
}
if (!existsSync(built) || readFileSync(built).subarray(0, 5).toString() !== "%PDF-") {
  console.error(`${built} is missing or not a PDF.`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));
const header = JSON.parse(readFileSync(HEADER, "utf8"));
const publicPath = `/resume/${name}`;
const target = path.join(ROOT, "public", publicPath);
const previous = manifest.publicPath ? path.join(ROOT, "public", manifest.publicPath) : null;

mkdirSync(path.dirname(target), { recursive: true });
copyFileSync(built, target);
if (previous && path.resolve(previous) !== path.resolve(target) && existsSync(previous)) {
  rmSync(previous);
  console.log(`removed previous ${path.relative(ROOT, previous)}`);
}

header.resumePdfPath = publicPath;
writeFileSync(HEADER, `${JSON.stringify(header, null, 2)}\n`);

const head = execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim();
Object.assign(manifest, {
  publicPath,
  pages: flag("--pages") ? Number(flag("--pages")) : manifest.pages,
  spacingMultiplier: flag("--m") ? Number(flag("--m")) : manifest.spacingMultiplier,
  reviewedThrough: head,
  updated: new Date().toLocaleDateString("en-CA"),
});
writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`published public${publicPath}`);
console.log(`data/header.json resumePdfPath -> ${publicPath}`);
console.log(`manifest: reviewedThrough ${head}, updated ${manifest.updated}`);
