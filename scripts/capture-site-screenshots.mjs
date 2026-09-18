// Captures the screenshots the About-this-site page shows —
// the site documenting itself. Run with the dev server (and optionally the
// Studio) already up:
//
//   npm run dev            # :3000
//   npm run studio         # :3001, optional — the Studio shot is skipped if it's down
//   node scripts/capture-site-screenshots.mjs
//
// Output goes to public/project-images/rileybeenders-com/. Uses playwright-core
// with the machine's own Chrome (or Edge), so nothing downloads. Sizes are
// fixed so recaptures line up with the pins in data/site/about-site.json.
import { mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";
const STUDIO = process.env.STUDIO_URL ?? "http://localhost:3001";
const OUT = path.resolve("public/project-images/rileybeenders-com");
const VIEWPORT = { width: 1440, height: 900 };

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

/** The dev server draws its own tools badge in the corner; keep it out of the pictures. */
async function hideDevTools(page) {
  await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }" });
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

// ---------------------------------------------------------------- home ---
await page.goto(`${SITE}/`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
await shoot("home-hero-light", (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: 900 } }));

// Scroll through once so every Reveal has fired, then back to the top for a full-page capture.
await page.evaluate(async () => {
  const step = window.innerHeight * 0.6;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  window.scrollTo(0, 0);
});
await settle(page, 1200);
await shoot("home-full-light", (file) => page.screenshot({ path: file, fullPage: true }));

// Dark mode via the nav toggle, so the screenshot shows exactly what a visitor gets.
await page.getByRole("switch", { name: /switch to dark mode/i }).click();
await page.waitForTimeout(700);
await shoot("home-hero-dark", (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: 900 } }));
await page.getByRole("switch", { name: /switch to light mode/i }).click();

// ------------------------------------------------------------ projects ---
await page.goto(`${SITE}/projects`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
// The ICARUS-Lite entry sits below the featured one; scroll to it twice — once to
// trigger lazy images, once more after they have sized the page — so its reveals fire in place.
const icarus = page.locator("#project-icarus-lite");
await icarus.scrollIntoViewIfNeeded();
await settle(page, 800);
await icarus.evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72 }));
await settle(page, 1800);
await shoot("projects-light", (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: 900 } }));

// ---------------------------------------------------------- about page ---
await page.goto(`${SITE}/about-this-site`, { waitUntil: "networkidle" });
await hideDevTools(page);
await settle(page);
await shoot("about-hero-light", (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: 900 } }));
// The page's own timeline — captured after its fill and dot stagger have played.
const timeline = page.locator(".as .tl");
if (await timeline.count()) {
  await timeline.scrollIntoViewIfNeeded();
  await settle(page, 2600);
  await shoot("feature-timeline", (file) => timeline.screenshot({ path: file }));
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
  await shoot("studio", (file) => page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1440, height: 900 } }));
} else {
  console.log("  skipped studio (not running at", STUDIO + ")");
}

await browser.close();
console.log(`done: ${shots.length} screenshot${shots.length === 1 ? "" : "s"} in ${path.relative(process.cwd(), OUT)}`);
if (!existsSync(path.join(OUT, "studio.png"))) console.log("  note: studio.png missing — start `npm run studio` and re-run to capture it.");
