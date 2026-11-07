// Build the interactive, site-styled HTML resume from a verified print source.
//
//   node .claude/skills/custom-resume/scripts/build-web-resume.mjs <source.html> [output.html]
//
// <source.html> is a resume source in output/resume-html/ (the file print-resume.mjs prints).
// Its <body> is copied unchanged, so the web resume carries exactly the PDF's claims; its <style>
// is wrapped in @media print, so printing the web resume reproduces the PDF layout. Screen styles,
// motion, and the skill-highlight layer come from ../assets/web-resume-template.html.
// Default output: output/resume-web/<same file name>.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");
const [input, outArg] = process.argv.slice(2);
if (!input) {
  console.error("usage: build-web-resume.mjs <source.html> [output.html]");
  process.exit(2);
}

const src = readFileSync(input, "utf8");
const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`${input}: no ${what} found`);
  return m[1];
};
const title = pick(/<title>([\s\S]*?)<\/title>/i, "<title>").trim();
const printCss = pick(/<style[^>]*>([\s\S]*?)<\/style>/i, "<style>");
const body = pick(/<body[^>]*>([\s\S]*?)<\/body>/i, "<body>");
if (/<script/i.test(body)) throw new Error(`${input}: source body already contains a script`);

// "Riley Beenders - Disney Senior Systems Engineer Resume" -> "Resume · Disney Senior Systems Engineer"
const role = title.replace(/^Riley Beenders\s*[-–|]\s*/i, "").replace(/\s*Resume$/i, "").trim();
const roleLabel = role ? `Resume · ${role}` : "Resume";

const template = readFileSync(path.join(here, "../assets/web-resume-template.html"), "utf8");
const fill = { TITLE: title, SOURCE: path.relative(repoRoot, path.resolve(input)).replace(/\\/g, "/"), ROLE_LABEL: roleLabel,
  PRINT_CSS: printCss.replace(/^/gm, "  "), BODY: body.trim() };
const html = template.replace(/\{\{(\w+)\}\}/g, (all, key) => (key in fill ? fill[key] : all));
const left = html.match(/\{\{\w+\}\}/);
if (left) throw new Error(`unfilled placeholder ${left[0]}`);

const out = outArg ?? path.join(repoRoot, "output/resume-web", path.basename(input));
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${path.relative(repoRoot, out)}  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
