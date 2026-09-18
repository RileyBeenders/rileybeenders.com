// Every <a> and <Link> on this site carries `suppressHydrationWarning`, because
// a browser extension on the author's machine stamps contenteditable="false"
// and style="cursor: pointer" onto anchors before React hydrates — without the
// prop, React logs "A tree hydrated but some attributes of the server rendered
// HTML didn't match" for every link. This reproduces that extension and fails
// if any route logs a hydration message, so a new link can't quietly regress it.
//
//   npm run dev
//   node scripts/check-anchor-hydration.mjs            # checks the routes below
//   node scripts/check-anchor-hydration.mjs /contact   # or just the ones you pass
import { chromium } from "playwright-core";

const SITE = process.env.SITE_URL ?? "http://localhost:3000";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/projects", "/contact", "/more-info", "/about-this-site"];

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

const browser = await launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
// The "extension": stamp every anchor as soon as it lands in the DOM, before React runs.
await context.addInitScript(() => {
  const stamp = (a) => {
    a.setAttribute("contenteditable", "false");
    a.style.cursor = "pointer";
  };
  new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.tagName === "A") stamp(node);
        node.querySelectorAll?.("a").forEach(stamp);
      }
    }
  }).observe(document, { childList: true, subtree: true });
});

let failed = false;
for (const route of routes) {
  const page = await context.newPage();
  const messages = [];
  page.on("console", (m) => { if (/hydrat/i.test(m.text())) messages.push(m.text().split("\n")[0]); });
  page.on("pageerror", (e) => { if (/hydrat/i.test(e.message)) messages.push(e.message.split("\n")[0]); });
  await page.goto(SITE + route, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  const stamped = await page.evaluate(() => document.querySelectorAll('a[contenteditable="false"]').length);
  const ok = messages.length === 0;
  failed ||= !ok;
  console.log(`${ok ? "ok  " : "FAIL"} ${route.padEnd(18)} ${String(stamped).padStart(3)} anchors stamped${ok ? "" : ` — ${messages[0].slice(0, 120)}`}`);
  await page.close();
}
await browser.close();
if (failed) {
  console.log("\nAn anchor is missing suppressHydrationWarning. Find it with: grep -rn '<a \\|<Link ' --include=*.tsx app components | grep -v suppressHydrationWarning");
  process.exit(1);
}
