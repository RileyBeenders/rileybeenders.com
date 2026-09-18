// First-viewport + a mid-page clip per route, both themes, desktop + phone.
import { mkdirSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
const SITE = "http://localhost:3000";
const OUT = path.resolve(process.argv[2] ?? "survey-vp");
mkdirSync(OUT, { recursive: true });
const ROUTES = [["home","/"],["projects","/projects"],["contact","/contact"],["more-info","/more-info"],["about","/about-this-site"]];
const SIZES = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
async function launch(){ for (const channel of ["chrome","msedge"]) { try { return await chromium.launch({channel, headless:true}); } catch {} } throw new Error("no chrome"); }
async function setSiteTheme(page, theme){ const cur = await page.evaluate(()=>document.documentElement.getAttribute("data-theme")==="dark"?"dark":"light"); if(cur===theme) return; await page.getByRole("switch",{name: theme==="dark"?/switch to dark mode/i:/switch to light mode/i}).first().click(); await page.waitForTimeout(700); }
const browser = await launch();
try {
  for (const [sizeName, viewport] of Object.entries(SIZES)) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    for (const [name, route] of ROUTES) {
      await page.goto(SITE + route, { waitUntil: "networkidle" });
      await page.addStyleTag({ content: "nextjs-portal, [data-nextjs-toast], [data-next-badge-root] { display: none !important; }" });
      await page.evaluate(() => document.fonts.ready);
      for (const theme of ["light","dark"]) {
        await setSiteTheme(page, theme);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(1800);
        await page.screenshot({ path: path.join(OUT, `${name}-${sizeName}-${theme}-top.png`) });
        // one scroll-down clip
        await page.evaluate((h) => window.scrollTo(0, h), viewport.height * 1.2);
        await page.waitForTimeout(1400);
        await page.screenshot({ path: path.join(OUT, `${name}-${sizeName}-${theme}-mid.png`) });
      }
    }
    await ctx.close();
  }
} finally { await browser.close(); }
console.log("done");
