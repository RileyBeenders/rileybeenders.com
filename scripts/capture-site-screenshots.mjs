// Captures the screenshots the About-this-site page shows — the site
// documenting itself — in BOTH themes, because the page shows each capture
// in the theme the visitor is *not* using. Run with the dev server (and
// optionally the Studio) already up:
//
//   npm run dev            # :3000
//   npm run studio         # :3001, optional — the Studio shots are skipped if it's down
//   node scripts/capture-site-screenshots.mjs
//
// Output goes to public/project-images/rileybeenders-com/ as <name>-light.png
// and <name>-dark.png. Uses playwright-core with the machine's own Chrome (or
// Edge), so nothing downloads. Sizes are fixed so recaptures stay comparable;
// the ids in data/site/about-site.json point at these names.
import { mkdirSync, existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";
const STUDIO = process.env.STUDIO_URL ?? "http://localhost:3001";
const OUT = path.resolve("public/project-images/rileybeenders-com");
const VIEWPORT = { width: 1440, height: 900 };
const CLIP = { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height };
/** Earlier single-theme names; removed so the folder only holds what the page references. */
const STALE = ["about-hero-light.png", "studio.png", "feature-timeline.png"];

mkdirSync(OUT, { recursive: true });

async function launch() {
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      // try the next one
    }
  }
  throw new Error("No Chrome or Edge found for playwright-core to drive.");
}

/**
 * Waits for fonts and for every image that is actually loading, then for
 * entrance reveals to finish, so nothing is caught mid-fade or mid-layout.
 * Off-screen lazy images never fire load, so the wait is bounded at 4s.
 */
async function settle(page, ms = 1600) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        Array.from(document.images)
          .filter((img) => !img.complete && img.loading !== "lazy")
          .map((img) => new Promise((resolve) => { img.addEventListener("load", resolve, { once: true }); img.addEventListener("error", resolve, { once: true }); }))
      ),
      new Promise((resolve) => setTimeout(resolve, 4000))
    ])
  );
  await page.waitForTimeout(ms);
}

/** The dev server draws its own tools badge in the corner, and `npm run site` adds the Studio control; keep both out of the pictures. */
async function hideDevTools(page) {
  await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast], [data-next-badge-root], .bp-studio-link { display: none !important; }" });
}

/** Flips the site's theme through its real nav switch, so React state and the DOM stamp agree. */
async function setSiteTheme(page, theme) {
  const current = await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  if (current === theme) return;
  await page.getByRole("switch", { name: theme === "dark" ? /switch to dark mode/i : /switch to light mode/i }).click();
  await page.waitForTimeout(700); // the 0.4s color transitions
}

/** The Studio has its own toggle (#theme-toggle) and its own data-theme stamp. */
async function setStudioTheme(page, theme) {
  const current = await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  if (current === theme) return;
  await page.locator("#theme-toggle").click();
  await page.waitForTimeout(500);
}

async function reachable(url) {
  try {
    const res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

const browser = await launch();
const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 2, colorScheme: "light" });
const page = await context.newPage();
const shots = [];

async function shoot(name, fn) {
  const file = path.join(OUT, `${name}.png`);
  await fn(file);
  shots.push(name);
  console.log("  captured", path.relative(process.cwd(), file));
}

/** Captures `fn` in both themes as <name>-light.png and <name>-dark.png, leaving the page in light. */
async function shootBoth(name, fn, setTheme = setSiteTheme) {
  await setTheme(page, "light");
  await shoot(`${name}-light`, fn);
  await setTheme(page, "dark");
  await shoot(`${name}-dark`, fn);
  await setTheme(page, "light");
}

// ---------------------------------------------------------------- home ---
await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
await shootBoth("home-hero", (file) => page.screenshot({ path: file, clip: CLIP }));

// Scroll through once so every Reveal has fired, then back to the top for the full-page captures.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  window.scrollTo(0, 0);
});
await settle(page, 1200);
await shootBoth("home-full", (file) => page.screenshot({ path: file, fullPage: true }));

// ------------------------------------------------------------ projects ---
await page.goto(`${SITE}/projects`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
// Scroll to the first entry twice — once to trigger lazy images, once more after they have sized the page — so its reveals fire in place.
const first = page.locator(".pj-entry").first();
await first.scrollIntoViewIfNeeded();
await settle(page, 800);
await first.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72 }));
await settle(page, 1800);
await shootBoth("projects", (file) => page.screenshot({ path: file, clip: CLIP }));

// ---------------------------------------------------------- about page ---
await page.goto(`${SITE}/about-this-site`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
const timeline = page.locator(".as .tl");
if (await timeline.count()) {
  await timeline.scrollIntoViewIfNeeded();
  await settle(page, 2600); // the track fill and dot stagger
  await shootBoth("feature-timeline", (file) => timeline.screenshot({ path: file }));
}

// -------------------------------------------------------------- studio ---
if (await reachable(STUDIO)) {
  await page.goto(`${STUDIO}/`, { waitUntil: "networkidle" });
  await settle(page, 800);
  // Open the About-this-site file so the shot shows this page being edited. The rail renders once the data has loaded.
  const aboutEntry = page.locator(".rail-item", { hasText: "About this site" }).first();
  await aboutEntry.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  if (await aboutEntry.count()) {
    await aboutEntry.click();
    await page.waitForTimeout(900);
  }
  await shootBoth("studio", (file) => page.screenshot({ path: file, clip: CLIP }), setStudioTheme);
} else {
  console.log("  skipped studio (not running at", STUDIO + ")");
}

for (const name of STALE) {
  const file = path.join(OUT, name);
  if (existsSync(file)) {
    unlinkSync(file);
    console.log("  removed stale", path.relative(process.cwd(), file));
  }
}

await browser.close();
console.log(`done: ${shots.length} screenshot${shots.length === 1 ? "" : "s"} in ${path.relative(process.cwd(), OUT)}`);
if (!existsSync(path.join(OUT, "studio-light.png"))) console.log("  note: studio captures missing — start `npm run studio` and re-run to capture them.");
