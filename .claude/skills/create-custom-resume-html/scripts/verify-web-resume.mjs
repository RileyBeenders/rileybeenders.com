// Verify an interactive HTML resume before delivery.
//
//   node .claude/skills/create-custom-resume-html/scripts/verify-web-resume.mjs <web.html> <delivered.pdf> [--shots dir]
//
// Fails (exit 1) unless:
//   - the page loads with no console or script errors, at desktop and phone width, light and dark;
//   - nothing scrolls sideways at 390px;
//   - the skill highlight works (a pill dims other lines, Escape clears it) when any pill is clickable;
//   - with JavaScript off, every bullet is visible and the toolbar's print button is the only casualty;
//   - printing the page yields the same page count and the same text on every page as <delivered.pdf>,
//     the PDF create-custom-resume-pdf validated at the user's chosen page count.
// Screenshots (desktop light/dark, highlight, phone) go to --shots, default the OS temp dir.
import { createRequire } from "node:module";
import { existsSync, readdirSync, mkdtempSync } from "node:fs";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");
const require = createRequire(path.join(repoRoot, "package.json"));
const { chromium } = require("playwright-core");

const args = process.argv.slice(2);
const si = args.indexOf("--shots");
const shots = si >= 0 ? args.splice(si, 2)[1] : mkdtempSync(path.join(os.tmpdir(), "web-resume-"));
const [webFile, pdfFile] = args;
if (!webFile || !pdfFile) {
  console.error("usage: verify-web-resume.mjs <web.html> <delivered.pdf> [--shots dir]");
  process.exit(2);
}

function findChrome() {
  const cache = path.join(process.env.LOCALAPPDATA ?? "", "ms-playwright");
  if (existsSync(cache)) {
    for (const d of readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      const exe = path.join(cache, d, "chrome-win64", "chrome.exe");
      if (existsSync(exe)) return exe;
    }
  }
  for (const exe of ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"])
    if (existsSync(exe)) return exe;
  throw new Error("No Chromium found: install Playwright's chromium or Google Chrome.");
}

const url = pathToFileURL(path.resolve(webFile)).href;
const failures = [];
const check = (ok, msg) => { console.log(`${ok ? "ok  " : "FAIL"} ${msg}`); if (!ok) failures.push(msg); };
const browser = await chromium.launch({ executablePath: findChrome() });

async function open(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/fonts\.g/.test(m.text()) && errors.push(m.text()));
  await page.goto(url);
  await page.waitForTimeout(1200);
  return { ctx, page, errors };
}

// Desktop, light: structure, highlight, details.
{
  const { ctx, page, errors } = await open({ viewport: { width: 1280, height: 900 }, colorScheme: "light" });
  const info = await page.evaluate(() => ({
    pills: document.querySelectorAll("button.pill").length,
    plain: document.querySelectorAll("span.pill").length,
    metrics: document.querySelectorAll(".metric").length,
    details: document.querySelectorAll("details.more").length,
  }));
  console.log(`     ${info.pills} clickable skill pills, ${info.plain} plain, ${info.metrics} figures, ${info.details} bullet details`);
  await page.screenshot({ path: path.join(shots, "desktop-light.png") });
  if (info.pills) {
    const pill = page.locator("button.pill").first();
    await pill.scrollIntoViewIfNeeded();
    await pill.click();
    await page.waitForTimeout(900);
    const on = await page.evaluate(() => ({
      filtering: document.body.classList.contains("filtering"),
      hits: document.querySelectorAll(".hit").length,
      dimmed: [...document.querySelectorAll("main ul:not(.cert-list) li:not(.hit)")].some((li) => +getComputedStyle(li).opacity < 0.5),
    }));
    await page.screenshot({ path: path.join(shots, "highlight.png") });
    check(on.filtering && on.hits > 0 && on.dimmed, `skill highlight marks ${on.hits} line(s) and dims the rest`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    check(!(await page.evaluate(() => document.body.classList.contains("filtering"))), "Escape clears the highlight");
  }
  if (info.details) {
    const d = page.locator("details.more").first();
    await d.scrollIntoViewIfNeeded();
    await d.locator("summary").click();
    await page.waitForTimeout(600);
    check(await d.evaluate((el) => el.open), "a bullet's details open on click");
  }
  check(errors.length === 0, `no script errors on desktop${errors.length ? ": " + errors.join(" | ") : ""}`);
  await ctx.close();
}

// Dark and phone.
{
  const { ctx, page, errors } = await open({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  await page.screenshot({ path: path.join(shots, "desktop-dark.png") });
  check(await page.evaluate(() => document.documentElement.dataset.theme === "dark"), "follows the system dark setting");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(400);
  const wide = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(wide <= 0, `no sideways scroll at 390px${wide > 0 ? ` (${wide}px over)` : ""}`);
  await page.screenshot({ path: path.join(shots, "phone-dark.png") });
  check(errors.length === 0, "no script errors in dark / phone");
  await ctx.close();
}

// JavaScript off: still a complete resume.
{
  const { ctx, page } = await open({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const hidden = await page.evaluate(() =>
    [...document.querySelectorAll("main li, main p, h1")].filter((el) => +getComputedStyle(el).opacity < 1).length);
  check(hidden === 0, `with JavaScript off every line is visible${hidden ? ` (${hidden} hidden)` : ""}`);
  await ctx.close();
}

// Print: must reproduce the delivered PDF.
{
  const { ctx, page } = await open({ viewport: { width: 1280, height: 900 } });
  await page.emulateMedia({ media: "print" });
  const printed = path.join(shots, "printed.pdf");
  await page.pdf({ path: printed, preferCSSPageSize: true, printBackground: true });
  await ctx.close();
  const py = spawnSync("python", [path.join(here, "compare-pdf-text.py"), printed, path.resolve(pdfFile)], { encoding: "utf8" });
  process.stdout.write(py.stdout);
  if (py.stderr) process.stderr.write(py.stderr);
  check(py.status === 0, "printing the HTML reproduces the delivered PDF");
}

await browser.close();
console.log(`screenshots: ${shots}`);
process.exit(failures.length ? 1 : 0);
