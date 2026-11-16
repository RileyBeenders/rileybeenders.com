// Freeze a running build of an older version of the site into static files.
//
//   node scripts/snapshot-version.mjs <base-url> <slug> "<Version name>" "<dates>" [--max-pages N] [--dry]
//
// Loads every same-site page reachable from "/" in headless Chrome (playwright-core with the
// machine's Chrome or Edge), scrolls it so scroll-in content shows, and saves the page as it
// rendered, in light mode, with every script removed: a snapshot reads like the site did but does
// not run. Stylesheets, fonts, images, posters and videos are downloaded beside it and every
// root-relative URL is rewritten under /versions/<slug>/, so the snapshot browses on its own
// at /versions/<slug>/index.html. A small fixed banner names the version and links back to the
// current site. An image or video whose source file is byte-identical to the same file in today's
// public/ is not copied: it keeps its root URL (the raw file, or the live site's /_next/image render
// of it), so unchanged photos are stored once. --dry writes nothing and only reports the pages and the bytes it would write.
//
// Output: public/versions/<slug>/ (index.html, <route>.html, assets/...).
import { chromium } from "playwright-core";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const flag = (name) => { const i = argv.indexOf(name); if (i < 0) return undefined; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const dry = argv.includes("--dry") ? (argv.splice(argv.indexOf("--dry"), 1), true) : false;
const maxPages = Number(flag("--max-pages") ?? 40);
const [base, slug, name, dates] = argv;
if (!base || !/^[a-z0-9-]+$/.test(slug ?? "") || !name) {
  console.error('usage: snapshot-version.mjs <base-url> <slug> "<Version name>" "<dates>" [--max-pages N] [--dry]');
  process.exit(2);
}
const origin = new URL(base).origin;
const prefix = `/versions/${slug}`;
const outDir = path.resolve("public/versions", slug);

/** "/" -> "index.html", "/projects" -> "projects.html", "/projects/x" -> "projects/x.html". */
const pageFile = (route) => (route === "/" ? "index.html" : `${route.replace(/^\/|\/$/g, "")}.html`);
/** An asset URL's file under assets/, keeping its path and folding any query into a short hash. */
function assetFile(u) {
  const url = new URL(u, origin);
  let p = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  if (url.pathname.startsWith("/_next/image")) {
    const inner = url.searchParams.get("url") ?? "image";
    const ext = path.extname(new URL(inner, origin).pathname) || ".img";
    p = `_img/${path.basename(new URL(inner, origin).pathname, ext)}-${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}${ext}`;
  } else if (url.search) {
    const ext = path.extname(p);
    p = `${p.slice(0, p.length - ext.length)}-${createHash("sha1").update(url.search).digest("hex").slice(0, 8)}${ext}`;
  }
  return `assets/${p}`;
}

const launch = async () => {
  for (const channel of ["chrome", "msedge"]) { try { return await chromium.launch({ channel, headless: true }); } catch {} }
  throw new Error("no Chrome or Edge found");
};
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
await ctx.addInitScript(() => { try { localStorage.setItem("theme", "light"); } catch {} });

const queue = ["/"], seen = new Set(queue), pages = new Map(), assets = new Map();
while (queue.length && pages.size < maxPages) {
  const route = queue.shift();
  const page = await ctx.newPage();
  const res = await page.goto(origin + route, { waitUntil: "networkidle", timeout: 60000 }).catch(() => null);
  if (!res || !res.ok()) { console.warn(`skip ${route} (${res?.status() ?? "no response"})`); await page.close(); continue; }
  // Walk down the page so every once-on-view entrance has run, then back to the top.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(700);
  const found = await page.evaluate(() => {
    // Settle anything still mid-entrance, then drop every script.
    for (const el of document.querySelectorAll("[style]")) {
      const s = el.style;
      if (s.opacity && +s.opacity < 1) s.opacity = "";
      if (/translate|scale/.test(s.transform)) s.transform = "";
      if (s.filter && /blur/.test(s.filter)) s.filter = "";
      if (s.clipPath) s.clipPath = "";
    }
    for (const el of document.querySelectorAll("script, link[rel='preload'][as='script'], link[rel='modulepreload'], noscript, next-route-announcer, nextjs-portal")) el.remove();
    const links = [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href"));
    const urls = new Set();
    for (const el of document.querySelectorAll("link[rel~='stylesheet'][href], link[rel~='icon'][href], link[rel='apple-touch-icon'][href]")) urls.add(el.getAttribute("href"));
    for (const el of document.querySelectorAll("img[src], video[src], video[poster], source[src], image[href]")) {
      for (const a of ["src", "poster", "href"]) { const v = el.getAttribute(a); if (v) urls.add(v); }
    }
    for (const el of document.querySelectorAll("img[srcset], source[srcset]")) el.removeAttribute("srcset"), el.removeAttribute("sizes");
    for (const el of document.querySelectorAll("[style*='url(']")) for (const m of el.getAttribute("style").matchAll(/url\(["']?([^"')]+)/g)) urls.add(m[1]);
    for (const st of document.querySelectorAll("style")) for (const m of st.textContent.matchAll(/url\(["']?([^"')]+)/g)) urls.add(m[1]);
    return { links, urls: [...urls], html: "<!doctype html>\n" + document.documentElement.outerHTML };
  });
  await page.close();
  for (const href of found.links) {
    if (!href || !href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/")) continue;
    const r = href.split("#")[0].split("?")[0] || "/";
    if (/\.[a-z0-9]{2,5}$/i.test(r)) { assets.set(new URL(r, origin).href, null); continue; } // a file link (PDF, image)
    if (!seen.has(r)) { seen.add(r); queue.push(r); }
  }
  for (const u of found.urls) if (u.startsWith("/") && !u.startsWith("//")) assets.set(new URL(u, origin).href, null);
  pages.set(route, found.html);
  console.log(`page ${route}`);
}

// Download every asset, and the fonts and images the stylesheets point at. Media whose source is
// unchanged in today's public/ is SHARED: left at its live URL instead of copied.
let bytes = 0;
const SHARED = Symbol("shared");
const sha = (b) => createHash("sha1").update(b).digest("hex");
async function unchangedToday(href) {
  const url = new URL(href);
  const raw = url.pathname.startsWith("/_next/image") ? url.searchParams.get("url") : url.pathname;
  if (!raw || !raw.startsWith("/") || !/.(png|jpe?g|gif|webp|avif|svg|mp4|webm|mov|pdf)$/i.test(raw)) return false;
  const file = path.join("public", decodeURIComponent(raw));
  if (!existsSync(file)) return false;
  const r = await fetch(origin + raw);
  return r.ok && sha(Buffer.from(await r.arrayBuffer())) === sha(readFileSync(file));
}
const fetchAsset = async (href) => {
  const r = await fetch(href);
  if (!r.ok) { console.warn(`asset ${r.status} ${href}`); return null; }
  return Buffer.from(await r.arrayBuffer());
};
const cssQueue = [];
let shared = 0;
for (const href of [...assets.keys()]) {
  if (await unchangedToday(href)) { assets.set(href, SHARED); shared++; continue; }
  const body = await fetchAsset(href);
  if (!body) { assets.delete(href); continue; }
  assets.set(href, body);
  if (/\.css(\?|$)/.test(href)) cssQueue.push(href);
}
for (const href of cssQueue) {
  const css = assets.get(href).toString("utf8");
  for (const m of css.matchAll(/url\(["']?([^"')]+)/g)) {
    if (m[1].startsWith("data:")) continue;
    const abs = new URL(m[1], href).href;
    if (!abs.startsWith(origin) || assets.has(abs)) continue;
    const body = await fetchAsset(abs);
    if (body) assets.set(abs, body);
  }
}

// Rewrite: page links to their .html files, assets to their files under assets/.
const routes = new Set(pages.keys());
function rewriteUrl(u, fromCss) {
  if (!u || u.startsWith("data:") || u.startsWith("#") || /^[a-z]+:/i.test(u) && !u.startsWith(origin)) return u;
  const abs = new URL(u, fromCss ?? origin);
  if (abs.origin !== origin) return u;
  const r = abs.pathname;
  if (routes.has(r)) return `${prefix}/${pageFile(r)}${abs.hash}`;
  if (r.startsWith("/api/")) return u;
  if (assets.get(abs.href) === SHARED) return abs.pathname + abs.search;
  if (assets.has(abs.href)) return `${prefix}/${assetFile(abs.href)}`;
  return u;
}
const banner = `<div class="version-banner" style="position:fixed;left:50%;bottom:16px;z-index:2147483647;transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;border:1px solid rgba(17,19,24,.12);border-radius:999px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);box-shadow:0 10px 30px rgba(17,19,24,.18);font:500 13px/1.3 system-ui,sans-serif;color:#111318;max-width:calc(100vw - 24px)"><span>Viewing <b>${name}</b>${dates ? ` · ${dates}` : ""} (a frozen snapshot)</span><a href="/projects/rileybeenders-com#versions" style="padding:7px 13px;border-radius:999px;background:#2457e6;color:#fff;text-decoration:none;white-space:nowrap">Back to the current site</a></div>`;

const files = new Map();
for (const [route, html] of pages) {
  let out = html
    .replace(/(\s(?:href|src|poster|action)=")([^"]*)"/g, (all, a, u) => `${a}${rewriteUrl(u.replace(/&amp;/g, "&")).replace(/&/g, "&amp;")}"`)
    .replace(/url\((["']?)([^"')]+)\1\)/g, (all, q, u) => `url(${q}${rewriteUrl(u.replace(/&amp;/g, "&"))}${q})`)
    .replace(/<\/body>/, `${banner}</body>`)
    // Draw-on strokes (the monogram's [data-draw] / [data-chase]) are CSS animations that a frozen
    // page would catch mid-stroke: show them finished.
    // A snapshot is history, not a second copy of the site for search engines.
    .replace(/<\/head>/, `<meta name="robots" content="noindex"><style>[data-draw]{stroke-dashoffset:0!important;animation:none!important}[data-chase]{stroke-dasharray:none!important;animation:none!important}</style></head>`);
  files.set(pageFile(route), Buffer.from(out));
}
for (const [href, body] of assets) {
  if (body === SHARED) continue;
  let data = body;
  if (/\.css(\?|$)/.test(href)) data = Buffer.from(body.toString("utf8").replace(/url\((["']?)([^"')]+)\1\)/g, (all, q, u) => `url(${q}${rewriteUrl(u, href)}${q})`));
  files.set(assetFile(href), data);
}
for (const data of files.values()) bytes += data.length;
console.log(`${pages.size} pages, ${assets.size - shared} assets copied, ${shared} shared with the live site, ${(bytes / 1048576).toFixed(1)} MB${dry ? " (dry run, nothing written)" : ""}`);

if (!dry) {
  if (existsSync(outDir)) rmSync(outDir, { recursive: true });
  for (const [file, data] of files) {
    const target = path.join(outDir, file);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, data);
  }
  console.log(`wrote public/versions/${slug}/`);
}
await browser.close();
