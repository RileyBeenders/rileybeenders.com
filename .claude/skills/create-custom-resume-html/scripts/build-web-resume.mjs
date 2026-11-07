// Build the interactive, site-styled HTML resume from a verified print source.
//
//   node .claude/skills/create-custom-resume-html/scripts/build-web-resume.mjs <source.html> [--pages N] [--out output.html]
//
// <source.html> is a resume source in output/resume-html/, the same file
// create-custom-resume-pdf's print-resume.mjs prints at the page count the user chose.
// - Its <body> is copied unchanged, so every claim on screen is a claim the PDF also makes,
//   plus any `.web-only` extras (bullet details, links) the source hides from its own print.
// - Its <style> is wrapped in @media print, so the Print / PDF button reproduces the PDF
//   at that page count. --pages N labels the button ("Print / PDF · N pages").
// Screen styles, motion, and the skill-highlight layer come from ../assets/web-resume-template.html.
// Default output: 1.ApplicationsUsed/<same file name> for "<ID>-RileyBeenders-<Job_Title>.html" sources,
// output/resume-web/<same file name> otherwise.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const pages = flag("--pages");
const outArg = flag("--out");
const [input] = args;
if (!input || (pages !== undefined && !/^[1-9]\d*$/.test(pages))) {
  console.error("usage: build-web-resume.mjs <source.html> [--pages N] [--out output.html]");
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
// Screen-only extras must stay out of the PDF that print-resume.mjs makes from the same source.
if (/class="[^"]*\bweb-only\b/.test(body) && !/\.web-only\s*\{[^}]*display:\s*none/.test(printCss))
  throw new Error(`${input}: uses .web-only but its stylesheet lacks ".web-only { display: none; }", so the PDF would print them`);

// "Riley Beenders - Disney Senior Systems Engineer Resume" -> "Resume · Disney Senior Systems Engineer"
const role = title.replace(/^Riley Beenders\s*[-–|]\s*/i, "").replace(/\s*Resume$/i, "").trim();
const fill = {
  TITLE: title,
  SOURCE: path.relative(repoRoot, path.resolve(input)).split(path.sep).join("/"),
  ROLE_LABEL: role ? `Resume · ${role}` : "Resume",
  PAGES_LABEL: pages ? ` · ${pages} page${pages === "1" ? "" : "s"}` : "",
  PRINT_CSS: printCss.replace(/^/gm, "  "),
  BODY: body.trim(),
};
const template = readFileSync(path.join(here, "../assets/web-resume-template.html"), "utf8");
const html = template.replace(/\{\{(\w+)\}\}/g, (all, key) => (key in fill ? fill[key] : all));
const left = html.match(/\{\{\w+\}\}/);
if (left) throw new Error(`unfilled placeholder ${left[0]}`);

// A source named "<ID>-RileyBeenders-<Job_Title>.html" is an application deliverable and lands beside
// its PDF in 1.ApplicationsUsed/; anything else (older sources) goes to output/resume-web/.
const base = path.basename(input);
const out = outArg ?? path.join(repoRoot, /^\d{3}-RileyBeenders-[^/\\]+\.html$/.test(base) ? "1.ApplicationsUsed" : "output/resume-web", base);
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`${path.relative(repoRoot, out)}  ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
