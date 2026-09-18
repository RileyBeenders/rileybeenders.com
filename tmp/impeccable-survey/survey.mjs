// Full-page survey captures for the impeccable design pass: every route,
// both themes, desktop (1440) and phone (390). Scratch only — nothing here is
// committed. Mirrors the settle/theme helpers in scripts/capture-site-screenshots.mjs.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const SITE = "http://localhost:3000";
const STUDIO = "http://localhost:3001";
const OUT = path.resolve(process.argv[2] ?? "survey");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ["home", "/"],
  ["projects", "/projects"],
  ["contact", "/contact"],
  ["more-info", "/more-info"],
  ["about", "/about-this-site"]
];
const SIZES = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };

async function launch() {
  for (const channel of ["chrome", "msedge"]) {
    try { return await chromium.launch({ channel, headless: true }); } catch {}
  }
  throw new Error("No Chrome or Edge found.");
}

async function settle(page, ms = 1400) {
  await page.evaluate(() => document.fonts.ready);
  // Scroll through so every whileInView reveal has fired, then return to top.
  await page.evaluate(async () => {
    const h = document.documentElement.scrollHeight;
    for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(ms);
}

async function hideDevTools(page) {
  await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }" });
}

async function setSiteTheme(page, theme) {
  const current = await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  if (current === theme) return;
  await page.getByRole("switch", { name: theme === "dark" ? /switch to dark mode/i : /switch to light mode/i }).first().click();
  await page.waitForTimeout(700);
}

async function setStudioTheme(page, theme) {
  const current = await page.evaluate(() => document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
  if (current === theme) return;
  await page.locator("#theme-toggle").click();
  await page.waitForTimeout(500);
}

async function reachable(url) {
  try { const r = await fetch(url, { method: "HEAD" }); return r.ok || r.status < 500; } catch { return false; }
}

const browser = await launch();
try {
  for (const [sizeName, viewport] of Object.entries(SIZES)) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "no-preference" });
    const page = await context.newPage();
    for (const [name, route] of ROUTES) {
      await page.goto(SITE + route, { waitUntil: "networkidle" });
      await hideDevTools(page);
      for (const theme of ["light", "dark"]) {
        await setSiteTheme(page, theme);
        await settle(page);
        const file = path.join(OUT, `${name}-${sizeName}-${theme}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log("wrote", file);
      }
    }
    await context.close();
  }

  if (await reachable(STUDIO)) {
    const context = await browser.newContext({ viewport: SIZES.desktop, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(STUDIO, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    for (const theme of ["light", "dark"]) {
      await setStudioTheme(page, theme);
      await page.waitForTimeout(400);
      const file = path.join(OUT, `studio-desktop-${theme}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("wrote", file);
    }
    // A second Studio view: open a list-based file (projects) so the three-pane layout shows.
    const rail = page.locator(".rail-item", { hasText: /projects/i }).first();
    if (await rail.count()) {
      await rail.click();
      await page.waitForTimeout(800);
      const first = page.locator(".list-item").first();
      if (await first.count()) { await first.click(); await page.waitForTimeout(600); }
      for (const theme of ["light", "dark"]) {
        await setStudioTheme(page, theme);
        await page.waitForTimeout(400);
        const file = path.join(OUT, `studio-projects-${theme}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log("wrote", file);
      }
    }
    await context.close();
  } else {
    console.log("studio not reachable; skipped");
  }
} finally {
  await browser.close();
}
