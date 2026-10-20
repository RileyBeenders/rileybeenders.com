// Print a resume HTML source to PDF with the repo's playwright-core and a local Chromium.
//
//   node .claude/skills/custom-resume/scripts/print-resume.mjs <input.html> <output.pdf> [spacingMultiplier]
//
// The HTML declares `:root { --m: 1; }`; every vertical gap in the stylesheet is
// `calc(<reference>pt * var(--m))`, so the third argument scales all gaps together
// (the "one spacing multiplier" step of the custom-resume procedure). Letter size,
// margins, and page breaks come from the HTML's own @page rule (preferCSSPageSize).
import { createRequire } from "node:module";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { chromium } = require("playwright-core");

const [input, output, mult = "1"] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: print-resume.mjs <input.html> <output.pdf> [spacingMultiplier]");
  process.exit(2);
}

function findChrome() {
  // playwright-core ships no browser; use whichever Chromium the Playwright cache
  // holds (any version), then fall back to an installed Chrome or Edge.
  const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (existsSync(cache)) {
    const dirs = readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      const exe = path.join(cache, d, "chrome-win64", "chrome.exe");
      if (existsSync(exe)) return exe;
    }
  }
  for (const exe of [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ]) if (existsSync(exe)) return exe;
  throw new Error("No Chromium found: install Playwright's chromium or Google Chrome.");
}

const html = readFileSync(input, "utf8").replace(/--m:\s*[\d.]+;/, `--m: ${mult};`);
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: "load" });
await page.pdf({ path: output, format: "Letter", printBackground: true, preferCSSPageSize: true });
await browser.close();
console.log(`wrote ${output} (spacing x${mult})`);
