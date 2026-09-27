/**
 * Studio — the local content editor for rileybeenders.com.
 *
 * A plain Node server (no dependencies of its own; it borrows `sharp` from
 * Next for thumbnails when that optional package is installed) that reads and
 * writes the JSON files under `data/`, so content is edited in a browser
 * instead of by hand in VS Code.
 *
 * It is deliberately NOT part of the Next app: it lives on its own port, binds
 * to the loopback interface only, and never appears in a production build. The
 * public site cannot reach it and neither can anything else on the network.
 *
 *   npm run site        # the site and the Studio together (see site.mjs)
 *   npm run studio      # the Studio alone, http://localhost:3001
 *
 * Under `npm run site` this module is imported and started in the launcher's
 * process, beside the device gate, so the Devices panel and the gate share
 * one access store.
 */

import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFile, writeFile, rename, mkdir, readdir, stat, unlink, rmdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { AccessStore, parseTarget } from "./access.mjs";
import { inspectGif, retimeGif, timingAt } from "./gif.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const UI_DIR = path.join(HERE, "ui");
const PUBLIC_DIR = path.join(ROOT, "public");
const BACKUP_DIR = path.join(ROOT, ".studio-backups");
export const ACCESS_FILE = path.join(ROOT, ".studio-access.json");

const HOST = "127.0.0.1";
export const DEFAULT_PORT = 3001;
export const DEFAULT_SITE_URL = "http://localhost:3000";

/** How long a device may stay allowed. `null` lasts until the server stops. */
const GRANT_DURATIONS = {
  "1h": 60 * 60 * 1000,
  "4h": 4 * 60 * 60 * 1000,
  "8h": 8 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  session: null
};

/**
 * Every file the Studio is allowed to touch. Anything else is off limits.
 * Listed in the order the site reads — the home page top to bottom, then each
 * further page — which is also the order the editor's rail shows them in
 * (see RAIL in ui/schema.js).
 */
const FILES = {
  homePage: { file: "data/home/page.json", label: "Home page", shape: "object" },
  summary: { file: "data/home/summary.json", label: "Summary", shape: "object" },
  experience: { file: "data/home/experience.json", label: "Experience", shape: "array" },
  skills: { file: "data/home/skills.json", label: "Skills", shape: "array" },
  education: { file: "data/home/education.json", label: "Education", shape: "object" },
  projectsPage: { file: "data/projects/page.json", label: "Projects page", shape: "object" },
  projects: { file: "data/projects/projects.json", label: "Projects", shape: "array" },
  proofs: { file: "data/projects/proofs.json", label: "Proofs", shape: "array" },
  contact: { file: "data/contact/contact.json", label: "Contact", shape: "object" },
  moreInfo: { file: "data/more-info/more-info.json", label: "More Info", shape: "object" },
  aboutSite: { file: "data/site/about-site.json", label: "About this site", shape: "object" },
  header: { file: "data/header.json", label: "Site Settings", shape: "object" },
  interface: { file: "data/site/interface.json", label: "Navigation & labels", shape: "object" }
};

/** Folders the image picker reads from, and uploads may write to. */
const IMAGE_DIRS = {
  "project-images": path.join(PUBLIC_DIR, "project-images"),
  "project-artifacts": path.join(PUBLIC_DIR, "project-artifacts")
};

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
/**
 * Everything the picker lists and uploads accept: images, plus PDFs for the
 * gallery. A PDF shows as its first page, which the editor renders with
 * pdf.js and saves beside it as `<name>.pdf.png` (see /api/pdf-preview). The
 * preview belongs to its PDF, so the picker lists the PDF, not the PNG.
 */
const MEDIA_EXTS = new Set([...IMAGE_EXTS, ".pdf"]);
const isPdfName = (name) => path.extname(name).toLowerCase() === ".pdf";
const isPdfPreviewName = (name) => /\.pdf\.png$/i.test(name);
const MAX_JSON_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_BYTES = 16 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 12 * 1024 * 1024;

/**
 * pdf.js, from the `pdfjs-dist` dev dependency, served to the editor at
 * /vendor/pdfjs/: the library and its worker, plus the font, character-map,
 * colour-profile and decoder data some PDFs need to draw correctly.
 */
const PDFJS_DIR = path.join(ROOT, "node_modules", "pdfjs-dist");
const PDFJS_FOLDERS = new Set(["build", "cmaps", "standard_fonts", "wasm", "iccs"]);
const BACKUPS_KEPT = 25;

/**
 * Thumbnails. The editor never needs a 6000px photograph in a 38px box, so
 * every image it shows comes through /api/thumb, resized to fit a bounding
 * box of one of these sizes (the longest edge, in device pixels) and cached
 * on disk. SVG and GIF are served as they are: one is already tiny and the
 * other would lose its animation.
 */
const THUMB_DIR = path.join(ROOT, ".studio-cache", "thumbs");
const THUMB_SIZES = [96, 192, 320, 480, 640, 960, 1280];
const THUMB_PASSTHROUGH = new Set([".svg", ".gif"]);
const THUMB_QUALITY = 78;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".mjs": "text/javascript; charset=utf-8",
  ".wasm": "application/wasm",
  ".pdf": "application/pdf"
};

/* ------------------------------------------------------------- helpers --- */

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store"
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

/** Content hash doubles as the optimistic-concurrency token for a save. */
function revisionOf(text) {
  return createHash("sha1").update(text).digest("hex").slice(0, 12);
}

/** Resolves `relative` inside `base`, or null if it would escape. */
function safeJoin(base, relative) {
  const target = path.resolve(base, "." + path.posix.resolve("/", relative));
  return target === base || target.startsWith(base + path.sep) ? target : null;
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) {
      const error = new Error("Payload too large");
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Only ever answer requests that came from this machine. The loopback bind is
 * the real guard; this also blocks DNS-rebinding from a page in the browser.
 */
function isLocalRequest(req) {
  const host = (req.headers.host || "").split(":")[0].toLowerCase();
  const allowed = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";
  const remote = req.socket.remoteAddress || "";
  const loopback = remote === "127.0.0.1" || remote === "::1" || remote === "::ffff:127.0.0.1";
  return allowed && loopback;
}

/* ------------------------------------------------------- data file i/o --- */

async function readDataFile(key) {
  const entry = FILES[key];
  const absolute = path.join(ROOT, entry.file);
  const text = await readFile(absolute, "utf8");
  return { entry, absolute, text, data: JSON.parse(text), revision: revisionOf(text) };
}

/** Keeps a rolling window of the last few versions, in case a save goes wrong. */
async function backup(key, text) {
  const dir = path.join(BACKUP_DIR, key);
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  await writeFile(path.join(dir, `${stamp}.json`), text, "utf8");

  const kept = (await readdir(dir)).filter((name) => name.endsWith(".json")).sort();
  for (const stale of kept.slice(0, Math.max(0, kept.length - BACKUPS_KEPT))) {
    await unlink(path.join(dir, stale));
  }
}

/**
 * Structural checks that catch the mistakes a form can still make — a blank id,
 * a duplicate id, the wrong top-level shape. Returns a list of problems.
 */
function validate(key, data) {
  const problems = [];
  const shape = FILES[key].shape;

  if (shape === "array" && !Array.isArray(data)) problems.push("Expected a list at the top level.");
  if (shape === "object" && (typeof data !== "object" || data === null || Array.isArray(data))) {
    problems.push("Expected an object at the top level.");
  }
  if (problems.length > 0) return problems;

  if (key === "projects" || key === "proofs") {
    const seen = new Set();
    data.forEach((entry, index) => {
      const id = entry?.id;
      const where = `Entry ${index + 1}`;
      if (typeof id !== "string" || id.trim() === "") {
        problems.push(`${where} is missing an id.`);
        return;
      }
      if (seen.has(id)) problems.push(`${where} repeats the id "${id}".`);
      seen.add(id);
      const title = key === "projects" ? entry.name : entry.title;
      if (typeof title !== "string" || title.trim() === "") {
        problems.push(`"${id}" is missing a ${key === "projects" ? "name" : "title"}.`);
      }
    });
  }

  return problems;
}

async function writeDataFile(key, data) {
  const entry = FILES[key];
  const absolute = path.join(ROOT, entry.file);
  const text = `${JSON.stringify(data, null, 2)}\n`;

  const previous = await readFile(absolute, "utf8");
  await backup(key, previous);

  // Write beside the target and rename, so a crash mid-write can't truncate it.
  const staging = `${absolute}.studio-${process.pid}.tmp`;
  await writeFile(staging, text, "utf8");
  await rename(staging, absolute);

  return revisionOf(text);
}

/* ----------------------------------------------------------- image i/o --- */

/** A path segment may not be empty, a dot-segment, or contain a separator. */
function isSafeSegment(name) {
  return typeof name === "string" && name !== "" && name !== "." && name !== ".."
    && !name.includes("/") && !name.includes("\\") && !name.startsWith(".");
}

/**
 * Resolves a folder path like ["project-images", "ICARUS-Lite"] to a directory
 * on disk, as long as its root is a known image folder and every segment is
 * safe. Returns null for anything that isn't rooted in `IMAGE_DIRS`.
 */
function resolveImageFolder(segments) {
  const base = IMAGE_DIRS[segments[0]];
  if (!base || !segments.slice(1).every(isSafeSegment)) return null;
  return { dir: path.join(base, ...segments.slice(1)), folderPath: segments.join("/") };
}

/**
 * Walks an image root and every subfolder beneath it (the picker browses
 * subfolders like `project-images/ICARUS-Lite` the same as the root itself),
 * collecting both the images found and the set of folder paths that exist —
 * an empty subfolder still needs to show up as an upload target.
 */
async function scanImageDir(dir, folderPath, images, folders) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // Folder is optional — an empty gallery is a valid state.
  }
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const childPath = `${folderPath}/${entry.name}`;
      folders.add(childPath);
      await scanImageDir(absolute, childPath, images, folders);
      continue;
    }
    if (!MEDIA_EXTS.has(path.extname(entry.name).toLowerCase()) || isPdfPreviewName(entry.name)) continue;
    const info = await stat(absolute);
    images.push({
      src: `/${folderPath}/${entry.name}`,
      folder: folderPath,
      name: entry.name,
      bytes: info.size,
      modified: info.mtimeMs,
      ...(isPdfName(entry.name) ? { kind: "pdf" } : {})
    });
  }
}

async function scanImages() {
  const images = [];
  const folders = new Set(Object.keys(IMAGE_DIRS));
  for (const [folder, dir] of Object.entries(IMAGE_DIRS)) {
    await scanImageDir(dir, folder, images, folders);
  }
  return { images, folders: [...folders].sort() };
}

/** Strips a browser-supplied filename down to something safe to write. */
function sanitizeFilename(raw) {
  const base = path.basename(String(raw || "")).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^[.-]+/, "");
  if (!base) return null;
  // A name that would pass for a PDF's preview is refused: that file is the editor's to write.
  return MEDIA_EXTS.has(path.extname(base).toLowerCase()) && !isPdfPreviewName(base) ? base : null;
}

/** A folder name typed in the picker, in an upload's alphabet: spaces and the rest become dashes. */
function sanitizeFolderName(raw) {
  const name = String(raw || "").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[.-]+/, "").replace(/-+$/, "").slice(0, 80);
  return name && isSafeSegment(name) ? name : null;
}

/**
 * A public path in the picker's folders — a folder ("/project-images/ICARUS-Lite")
 * or a file in one — resolved to disk. Null for anything outside IMAGE_DIRS or
 * with an unsafe segment. A leading slash is optional.
 */
function resolveImagePath(raw) {
  if (typeof raw !== "string") return null;
  const segments = raw.split("/").filter(Boolean);
  const base = IMAGE_DIRS[segments[0]];
  if (!base || !segments.slice(1).every(isSafeSegment)) return null;
  return { segments, src: `/${segments.join("/")}`, absolute: path.join(base, ...segments.slice(1)), isRoot: segments.length === 1 };
}

const statOrNull = (absolute) => stat(absolute).catch(() => null);

/** Files Windows and macOS leave in folders on their own; they don't make a folder "not empty". */
const JUNK_FILES = new Set(["thumbs.db", "desktop.ini", ".ds_store"]);

/* -------------------------------------------------- moving and references --- */

/**
 * `value` with the path `from` (a file, or a folder and everything in it)
 * renamed to `to` wherever a string is exactly that path or starts inside it.
 * `counter.count` says how many strings changed.
 */
function repath(value, from, to, counter) {
  if (typeof value === "string") {
    if (value !== from && !value.startsWith(`${from}/`)) return value;
    counter.count += 1;
    return to + value.slice(from.length);
  }
  if (Array.isArray(value)) return value.map((entry) => repath(entry, from, to, counter));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, entry] of Object.entries(value)) out[key] = repath(entry, from, to, counter);
    return out;
  }
  return value;
}

/** How often each data file the Studio edits refers to `src` (or to anything inside it). */
async function dataRefs(src) {
  const uses = [];
  for (const [key, entry] of Object.entries(FILES)) {
    const counter = { count: 0 };
    repath((await readDataFile(key)).data, src, src, counter);
    if (counter.count > 0) uses.push({ key, label: entry.label, count: counter.count });
  }
  return uses;
}

/**
 * Source the Studio can't edit that names a path directly — a themed diagram
 * in components/, a script that writes screenshots into a folder. Moving what
 * they name would break them, so a move is refused while any do.
 */
const CODE_DIRS = ["app", "components", "lib", "scripts", "types", "data", "ResumeBuilder"];
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css", ".json", ".md"]);

async function codeRefs(src) {
  const escaped = src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // "/project-images/x" must not match "/project-images/x-old".
  const pattern = new RegExp(`${escaped}(?![A-Za-z0-9._-])`);
  const studioData = new Set(Object.values(FILES).map((entry) => path.join(ROOT, entry.file)));
  const found = [];
  async function walk(dir) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      const absolute = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(absolute);
      else if (CODE_EXTS.has(path.extname(entry.name).toLowerCase()) && !studioData.has(absolute)) {
        if (pattern.test(await readFile(absolute, "utf8"))) found.push(path.relative(ROOT, absolute).split(path.sep).join("/"));
      }
    }
  }
  for (const dir of CODE_DIRS) await walk(path.join(ROOT, dir));
  return found;
}

function refusal(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

/**
 * Moves or renames a file or folder inside the image folders, then rewrites
 * every data file that referred to it, so nothing on the site points at a
 * path that is gone. `to` is the full new path; its last segment is the name,
 * cleaned the way an upload's is. Each rewritten file is backed up first and
 * reported with its revision before and after, so the editor can follow along.
 */
async function moveImagePath(fromRaw, toRaw) {
  const from = resolveImagePath(fromRaw);
  if (!from) throw refusal(404, "That isn't in the image folders.");
  if (from.isRoot) throw refusal(422, `${from.segments[0]} is one of the Studio's own folders, so it stays where it is.`);
  const source = await statOrNull(from.absolute);
  if (!source) throw refusal(404, `${from.src} is no longer on disk.`);
  const isFolder = source.isDirectory();

  const toSegments = String(toRaw || "").split("/").filter(Boolean);
  const parent = resolveImagePath(toSegments.slice(0, -1).join("/"));
  const parentInfo = parent ? await statOrNull(parent.absolute) : null;
  if (!parent || !parentInfo?.isDirectory()) throw refusal(404, "The folder it's going to isn't there.");

  let name;
  if (isFolder) {
    name = sanitizeFolderName(toSegments.at(-1));
    if (!name) throw refusal(422, "Give the folder a name.");
  } else {
    name = sanitizeFilename(toSegments.at(-1));
    const ext = path.extname(from.absolute).toLowerCase();
    if (!name || path.extname(name).toLowerCase() !== ext) throw refusal(422, `Keep the file's ${ext} ending.`);
  }
  const to = resolveImagePath(`${parent.src}/${name}`);
  if (to.src === from.src) return { from: from.src, to: to.src, kind: isFolder ? "folder" : "file", rewrote: [] };
  if (isFolder && to.src.startsWith(`${from.src}/`)) throw refusal(422, "A folder can't go inside itself.");
  // Windows is case-insensitive: renaming a.jpg to A.jpg finds "itself" at the new path.
  const sameFile = to.absolute.toLowerCase() === from.absolute.toLowerCase();
  if (!sameFile && (await statOrNull(to.absolute))) throw refusal(409, `${parent.src} already has something named ${name}.`);

  const code = await codeRefs(from.src);
  if (code.length > 0) {
    throw refusal(409, `${code.join(", ")} ${code.length === 1 ? "names" : "name"} ${from.src} directly, so it stays put. Move it in the code first.`);
  }

  await rename(from.absolute, to.absolute);
  // A PDF's preview travels with it.
  if (!isFolder && isPdfName(from.absolute)) await rename(`${from.absolute}.png`, `${to.absolute}.png`).catch(() => {});
  console.log(`  moved ${from.src} → ${to.src}`);

  const rewrote = [];
  for (const [key, entry] of Object.entries(FILES)) {
    const current = await readDataFile(key);
    const counter = { count: 0 };
    const next = repath(current.data, from.src, to.src, counter);
    if (counter.count === 0) continue;
    const after = await writeDataFile(key, next);
    console.log(`  updated ${counter.count} ${counter.count === 1 ? "path" : "paths"} in ${entry.file}`);
    rewrote.push({ key, label: entry.label, count: counter.count, before: current.revision, after });
  }
  return { from: from.src, to: to.src, kind: isFolder ? "folder" : "file", rewrote };
}

/** Adds `-2`, `-3`, … rather than overwriting an image already on disk. */
async function uniquePath(dir, filename) {
  const ext = path.extname(filename);
  const stem = filename.slice(0, -ext.length);
  for (let attempt = 0; attempt < 500; attempt += 1) {
    const candidate = attempt === 0 ? filename : `${stem}-${attempt + 1}${ext}`;
    try {
      await stat(path.join(dir, candidate));
    } catch {
      return candidate;
    }
  }
  return `${stem}-${Date.now()}${ext}`;
}

/* --------------------------------------------------------- gif timing --- */

/** A public path that names a GIF, e.g. "/project-artifacts/demo.gif". */
function isGifSrc(src) {
  return typeof src === "string" && src.startsWith("/") && !src.startsWith("//") && path.extname(src).toLowerCase() === ".gif";
}

/** The playback rate an image entry asks for; anything unset or unusable is the recording's own pace. */
function speedOf(entry) {
  const speed = entry?.speed;
  return typeof speed === "number" && Number.isFinite(speed) && speed > 0 ? speed : 1;
}

/**
 * Every GIF a data file refers to, with the speed the entry asks for. Any
 * object with a `src` counts — gallery images, proof assets, site captures —
 * so looping is guaranteed for all of them, not only the ones with a slider.
 * The first mention of a file wins if two entries disagree.
 */
function gifRefs(data, found = new Map()) {
  if (Array.isArray(data)) {
    for (const entry of data) gifRefs(entry, found);
  } else if (data && typeof data === "object") {
    if (isGifSrc(data.src) && !found.has(data.src)) found.set(data.src, speedOf(data));
    // A comparison's After plays as recorded, but still loops.
    if (isGifSrc(data.after) && !found.has(data.after)) found.set(data.after, 1);
    for (const value of Object.values(data)) {
      if (value && typeof value === "object") gifRefs(value, found);
    }
  }
  return found;
}

/**
 * Makes each GIF a just-saved file refers to play at the speed the JSON asks
 * for and loop forever. A file that already reads that way is left alone, so
 * a 15 MB recording is only rewritten when its slider actually moved.
 * Returns one line per file for the save's toast; a missing or broken file
 * is reported, not fatal — the JSON is already saved by then.
 */
async function syncGifTimings(data) {
  const results = [];
  for (const [src, speed] of gifRefs(data)) {
    const absolute = safeJoin(PUBLIC_DIR, src);
    if (!absolute) continue;
    try {
      const { buffer, changed } = retimeGif(await readFile(absolute), speed);
      if (changed) {
        const staging = `${absolute}.studio-${process.pid}.tmp`;
        await writeFile(staging, buffer);
        await rename(staging, absolute);
        console.log(`  retimed ${src} to ${speed}×, looping`);
      }
      results.push({ src, speed, changed });
    } catch (error) {
      const message = error.code === "ENOENT" ? "the file is missing" : error.message;
      console.warn(`  could not retime ${src}: ${message}`);
      results.push({ src, speed, changed: false, error: message });
    }
  }
  return results;
}

/** GET /api/gif?src=/project-artifacts/demo.gif&speed=2 — the file's timing, and what `speed` would make of it. */
async function serveGifInfo(res, url) {
  const src = url.searchParams.get("src") || "";
  const absolute = safeJoin(PUBLIC_DIR, src);
  if (!absolute || !isGifSrc(src)) return sendError(res, 404, "Not a GIF under public/.");

  let info;
  try {
    info = inspectGif(await readFile(absolute));
  } catch (error) {
    if (error.code === "ENOENT") return sendError(res, 404, "Not found.");
    return sendError(res, 422, `Could not read the GIF: ${error.message}`);
  }

  const requested = Number(url.searchParams.get("speed"));
  const speed = Number.isFinite(requested) && requested > 0 ? requested : info.speed;
  const { original, ...shape } = info;
  return sendJson(res, 200, { ...shape, recorded: timingAt(original, 1), at: timingAt(original, speed) });
}

/**
 * A GIF served retimed to `speed` in memory — the preview beside the slider,
 * before anything is saved. The tag tracks the file and the speed, so the
 * browser reuses the copy until either changes.
 */
async function serveGifPreview(req, res, absolute, speed) {
  let body;
  try {
    body = await readFile(absolute);
  } catch {
    return sendError(res, 404, "Not found.");
  }
  const info = await stat(absolute);
  const etag = createHash("sha1").update(`${absolute}|${info.mtimeMs}|${info.size}|${speed}`).digest("hex").slice(0, 20);
  if (req.headers["if-none-match"] === `"${etag}"`) {
    res.writeHead(304, { etag: `"${etag}"`, "cache-control": "no-cache" });
    return res.end();
  }
  try {
    body = retimeGif(body, speed).buffer;
  } catch (error) {
    console.error(`  could not retime ${absolute} for preview: ${error.message}`);
  }
  res.writeHead(200, {
    "content-type": "image/gif",
    "content-length": body.length,
    "cache-control": "no-cache",
    etag: `"${etag}"`
  });
  res.end(body);
}

/* ---------------------------------------------------------------- pdf --- */

/**
 * A PDF under one of the picker's folders, by its public path, with the
 * preview that belongs to it. Null for anything else.
 */
function resolvePdf(src) {
  if (typeof src !== "string" || !isPdfName(src)) return null;
  const segments = src.split("/").filter(Boolean);
  if (!IMAGE_DIRS[segments[0]] || !segments.every(isSafeSegment)) return null;
  const absolute = safeJoin(PUBLIC_DIR, src);
  return absolute ? { absolute, preview: `${absolute}.png`, previewSrc: `${src}.png` } : null;
}

/** GET /api/pdf?src=/project-images/x/report.pdf — whether its preview exists and is newer than the PDF. */
async function servePdfInfo(res, url) {
  const pdf = resolvePdf(url.searchParams.get("src"));
  if (!pdf) return sendError(res, 404, "Not a PDF in the image folders.");
  let info;
  try {
    info = await stat(pdf.absolute);
  } catch {
    return sendError(res, 404, "That PDF is not on disk.");
  }
  let preview = null;
  try {
    preview = await stat(pdf.preview);
  } catch {
    // Not made yet.
  }
  return sendJson(res, 200, {
    bytes: info.size,
    preview: pdf.previewSrc,
    hasPreview: preview !== null,
    // A PDF replaced after its preview was made needs a new one.
    fresh: preview !== null && preview.mtimeMs >= info.mtimeMs
  });
}

/** POST /api/pdf-preview?src=… with a PNG body: the first page, rendered by the editor, saved as `<pdf>.png`. */
async function savePdfPreview(req, res, url) {
  const pdf = resolvePdf(url.searchParams.get("src"));
  if (!pdf) return sendError(res, 404, "Not a PDF in the image folders.");
  try {
    await stat(pdf.absolute);
  } catch {
    return sendError(res, 404, "That PDF is not on disk.");
  }
  const body = await readBody(req, MAX_PREVIEW_BYTES);
  // Only a PNG is written, whatever the request claims to be.
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (body.length < 8 || !body.subarray(0, 8).equals(PNG_SIGNATURE)) return sendError(res, 400, "The preview must be a PNG.");
  const staging = `${pdf.preview}.studio-${process.pid}.tmp`;
  await writeFile(staging, body);
  await rename(staging, pdf.preview);
  console.log(`  previewed ${pdf.previewSrc}`);
  return sendJson(res, 201, { preview: pdf.previewSrc, bytes: body.length });
}

/* ---------------------------------------------------------- thumbnails --- */

let sharpModule; // undefined until first use; null when it is not installed

/** `sharp` ships with Next as an optional package, so it is usually here, but never assumed. */
async function loadSharp() {
  if (sharpModule !== undefined) return sharpModule;
  try {
    sharpModule = (await import("sharp")).default;
  } catch {
    sharpModule = null;
    console.warn("  sharp is not installed, so images are shown at full size. `npm install` brings it in with Next.");
  }
  return sharpModule;
}

/** Snaps a requested size up to the ladder, so the cache holds a handful of sizes per image at most. */
function snapThumbSize(raw) {
  const requested = Number(raw);
  if (!Number.isFinite(requested) || requested <= 0) return THUMB_SIZES[1];
  return THUMB_SIZES.find((size) => size >= requested) ?? THUMB_SIZES[THUMB_SIZES.length - 1];
}

/** Several <img>s ask for the same thumbnail at once on a fresh cache; make it once. */
const thumbsInFlight = new Map();

/**
 * Returns `{ etag, body }` for the resized copy, from the cache when the
 * original has not changed since, or null when sharp is missing or fails
 * (the caller then serves the original).
 */
async function thumbnail(absolute, relative, size) {
  const info = await stat(absolute);
  const etag = createHash("sha1").update(`${relative}|${info.mtimeMs}|${info.size}|${size}`).digest("hex").slice(0, 20);
  const cached = path.join(THUMB_DIR, `${etag}.webp`);

  try {
    return { etag, body: await readFile(cached) };
  } catch {
    // Not made yet.
  }

  if (!thumbsInFlight.has(etag)) {
    thumbsInFlight.set(etag, (async () => {
      const sharp = await loadSharp();
      if (!sharp) return null;
      // rotate() honours EXIF orientation, as the browser does for the original.
      const body = await sharp(absolute)
        .rotate()
        .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer();
      await mkdir(THUMB_DIR, { recursive: true });
      const staging = `${cached}.${process.pid}.tmp`;
      await writeFile(staging, body);
      await rename(staging, cached);
      return body;
    })().finally(() => thumbsInFlight.delete(etag)));
  }

  const body = await thumbsInFlight.get(etag);
  return body ? { etag, body } : null;
}

/** GET /api/thumb?src=/project-images/x.jpg&w=192 */
async function serveThumb(req, res, url) {
  const src = url.searchParams.get("src") || "";
  const absolute = safeJoin(PUBLIC_DIR, src);
  const ext = path.extname(src).toLowerCase();
  if (!absolute || !IMAGE_EXTS.has(ext)) return sendError(res, 404, "Not an image under public/.");
  if (THUMB_PASSTHROUGH.has(ext)) {
    // A GIF asked for at a speed is retimed on the way out, for the slider's preview.
    const speed = Number(url.searchParams.get("speed"));
    if (ext === ".gif" && Number.isFinite(speed) && speed > 0) return serveGifPreview(req, res, absolute, speed);
    if (await serveStatic(res, absolute)) return;
    return sendError(res, 404, "Not found.");
  }

  let thumb = null;
  try {
    thumb = await thumbnail(absolute, src, snapThumbSize(url.searchParams.get("w")));
  } catch (error) {
    if (error.code === "ENOENT") return sendError(res, 404, "Not found.");
    console.error(`  could not resize ${src}: ${error.message}`);
  }
  if (!thumb) {
    if (await serveStatic(res, absolute)) return;
    return sendError(res, 404, "Not found.");
  }

  // The URL never changes, so the browser revalidates; the tag changes with the file.
  if (req.headers["if-none-match"] === `"${thumb.etag}"`) {
    res.writeHead(304, { etag: `"${thumb.etag}"`, "cache-control": "no-cache" });
    return res.end();
  }
  res.writeHead(200, {
    "content-type": "image/webp",
    "content-length": thumb.body.length,
    "cache-control": "no-cache",
    etag: `"${thumb.etag}"`
  });
  res.end(thumb.body);
}

/* ------------------------------------------------------------- routing --- */

async function serveStatic(res, absolute) {
  try {
    const body = await readFile(absolute);
    res.writeHead(200, {
      "content-type": MIME[path.extname(absolute).toLowerCase()] || "application/octet-stream",
      "content-length": body.length,
      "cache-control": "no-store"
    });
    res.end(body);
    return true;
  } catch {
    return false;
  }
}

/** A small JSON request body, or a 400. */
async function readJson(req) {
  const raw = await readBody(req, 64 * 1024);
  try {
    return JSON.parse(raw.toString("utf8"));
  } catch {
    throw refusal(400, "Request body was not valid JSON.");
  }
}

function decodeSegment(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

async function handleApi(req, res, url, { store, siteUrl }) {
  const segments = url.pathname.split("/").filter(Boolean).map(decodeSegment).slice(1); // drop "api"

  if (req.method === "GET" && segments[0] === "files" && segments.length === 1) {
    const files = await Promise.all(
      Object.entries(FILES).map(async ([key, entry]) => {
        const info = await stat(path.join(ROOT, entry.file));
        return { key, label: entry.label, shape: entry.shape, file: entry.file, modified: info.mtimeMs };
      })
    );
    return sendJson(res, 200, { files, siteUrl, gate: store.gate !== null });
  }

  // The Devices panel: who else may open the dev site, for how long.
  if (segments[0] === "access") {
    if (req.method === "GET" && segments.length === 1) return sendJson(res, 200, store.snapshot());

    if (req.method === "POST" && segments.length === 1) {
      const raw = await readBody(req, 4096);
      let payload;
      try {
        payload = JSON.parse(raw.toString("utf8"));
      } catch {
        return sendError(res, 400, "Request body was not valid JSON.");
      }
      const target = parseTarget(payload?.target);
      if (target.error) return sendError(res, 422, target.error);
      if (!Object.hasOwn(GRANT_DURATIONS, payload?.duration)) {
        return sendError(res, 422, `Duration must be one of ${Object.keys(GRANT_DURATIONS).join(", ")}.`);
      }
      const grant = await store.grant({ ...target, label: payload.label, ttlMs: GRANT_DURATIONS[payload.duration] });
      console.log(`  allowed ${grant.address}/${grant.prefix}${grant.label ? ` (${grant.label})` : ""} ${grant.expiresAt ? `until ${new Date(grant.expiresAt).toLocaleTimeString()}` : "until the server stops"}`);
      return sendJson(res, 201, { grant, ...store.snapshot() });
    }

    // DELETE /api/access/<address>/<prefix>
    if (req.method === "DELETE" && segments.length === 3) {
      const prefix = Number(segments[2]);
      const gone = Number.isInteger(prefix) && (await store.revoke(segments[1], prefix));
      if (!gone) return sendError(res, 404, "That device is not on the list.");
      console.log(`  revoked ${segments[1]}/${prefix}`);
      return sendJson(res, 200, store.snapshot());
    }
  }

  if (segments[0] === "file" && segments.length === 2) {
    const key = segments[1];
    if (!Object.hasOwn(FILES, key)) return sendError(res, 404, `Unknown file "${key}".`);

    if (req.method === "GET") {
      const { entry, data, revision } = await readDataFile(key);
      return sendJson(res, 200, { key, label: entry.label, file: entry.file, data, revision });
    }

    if (req.method === "PUT") {
      const raw = await readBody(req, MAX_JSON_BYTES);
      let payload;
      try {
        payload = JSON.parse(raw.toString("utf8"));
      } catch {
        return sendError(res, 400, "Request body was not valid JSON.");
      }

      const problems = validate(key, payload?.data);
      if (problems.length > 0) return sendJson(res, 422, { error: "Validation failed.", problems });

      const current = await readDataFile(key);
      if (payload.revision && payload.revision !== current.revision) {
        return sendJson(res, 409, {
          error: `${current.entry.label} changed on disk since you loaded it. Reload to pick up the newer version.`,
          revision: current.revision
        });
      }

      const revision = await writeDataFile(key, payload.data);
      console.log(`  saved ${FILES[key].file}`);
      // The GIFs this file refers to follow it: their speed and loop live in the file bytes.
      const gifs = await syncGifTimings(payload.data);
      return sendJson(res, 200, { key, revision, savedAt: Date.now(), gifs });
    }
  }

  if (req.method === "GET" && segments[0] === "images" && segments.length === 1) {
    const { images, folders } = await scanImages();
    return sendJson(res, 200, { images, folders });
  }

  if (req.method === "GET" && segments[0] === "thumb" && segments.length === 1) {
    return serveThumb(req, res, url);
  }

  if (req.method === "GET" && segments[0] === "gif" && segments.length === 1) {
    return serveGifInfo(res, url);
  }

  if (req.method === "GET" && segments[0] === "pdf" && segments.length === 1) {
    return servePdfInfo(res, url);
  }

  if (req.method === "POST" && segments[0] === "pdf-preview" && segments.length === 1) {
    return savePdfPreview(req, res, url);
  }

  // The picker's file-manager side: new folders, empty-folder deletes, moves and renames.
  if (req.method === "POST" && segments[0] === "folders" && segments.length === 1) {
    const payload = await readJson(req);
    const parent = resolveImagePath(payload?.parent);
    const parentInfo = parent ? await statOrNull(parent.absolute) : null;
    if (!parentInfo?.isDirectory()) return sendError(res, 404, "The folder to make it in isn't there.");
    const name = sanitizeFolderName(payload?.name);
    if (!name) return sendError(res, 422, "Give the folder a name: letters, numbers, dots, dashes or underscores.");
    const folder = resolveImagePath(`${parent.src}/${name}`);
    if (await statOrNull(folder.absolute)) return sendError(res, 409, `${parent.src} already has something named ${name}.`);
    await mkdir(folder.absolute);
    console.log(`  made ${folder.src}/`);
    return sendJson(res, 201, { folder: folder.src.slice(1), name });
  }

  if (req.method === "DELETE" && segments[0] === "folders" && segments.length >= 3) {
    const folder = resolveImagePath(segments.slice(1).join("/"));
    if (!folder || folder.isRoot) return sendError(res, 404, "Unknown folder.");
    let entries;
    try {
      entries = await readdir(folder.absolute);
    } catch {
      return sendError(res, 404, "That folder is already gone.");
    }
    const kept = entries.filter((name) => !JUNK_FILES.has(name.toLowerCase()));
    if (kept.length > 0) return sendError(res, 409, `${folder.src} still holds ${kept.length} ${kept.length === 1 ? "thing" : "things"}. Move or delete ${kept.length === 1 ? "it" : "them"} first.`);
    for (const junk of entries) await unlink(path.join(folder.absolute, junk));
    await rmdir(folder.absolute);
    console.log(`  deleted ${folder.src}/`);
    return sendJson(res, 200, { ok: true });
  }

  if (req.method === "POST" && segments[0] === "move" && segments.length === 1) {
    const payload = await readJson(req);
    return sendJson(res, 200, await moveImagePath(payload?.from, payload?.to));
  }

  // GET /api/refs?src=/project-images/x.jpg — what refers to it, before it is deleted.
  if (req.method === "GET" && segments[0] === "refs" && segments.length === 1) {
    const target = resolveImagePath(url.searchParams.get("src"));
    if (!target) return sendError(res, 404, "That isn't in the image folders.");
    return sendJson(res, 200, { uses: await dataRefs(target.src), code: await codeRefs(target.src) });
  }

  // Both routes address a folder by every segment after "images", e.g.
  // /api/images/project-images/ICARUS-Lite — which lets the picker upload
  // into, and delete from, subfolders exactly as it does the root folders.
  if (req.method === "POST" && segments[0] === "images" && segments.length >= 2) {
    const target = resolveImageFolder(segments.slice(1));
    if (!target) return sendError(res, 404, `Unknown image folder "${segments.slice(1).join("/")}".`);

    const filename = sanitizeFilename(url.searchParams.get("name"));
    if (!filename) {
      return sendError(res, 400, `Give the file a name ending in ${[...MEDIA_EXTS].join(", ")}.`);
    }

    const body = await readBody(req, MAX_IMAGE_BYTES);
    if (body.length === 0) return sendError(res, 400, "The uploaded file was empty.");

    await mkdir(target.dir, { recursive: true });
    const name = await uniquePath(target.dir, filename);
    await writeFile(path.join(target.dir, name), body);
    console.log(`  uploaded ${target.folderPath}/${name}`);
    return sendJson(res, 201, { src: `/${target.folderPath}/${name}`, folder: target.folderPath, name, bytes: body.length });
  }

  if (req.method === "DELETE" && segments[0] === "images" && segments.length >= 3) {
    const filename = segments[segments.length - 1];
    const target = resolveImageFolder(segments.slice(1, -1));
    if (!target || !isSafeSegment(filename) || !MEDIA_EXTS.has(path.extname(filename).toLowerCase())) {
      return sendError(res, 404, "Unknown image.");
    }

    try {
      await unlink(path.join(target.dir, filename));
    } catch (error) {
      if (error.code === "ENOENT") return sendError(res, 404, "That image is already gone.");
      throw error;
    }
    // A PDF's preview goes with it.
    if (isPdfName(filename)) await unlink(path.join(target.dir, `${filename}.png`)).catch(() => {});
    console.log(`  deleted ${target.folderPath}/${filename}`);
    return sendJson(res, 200, { ok: true });
  }

  return sendError(res, 404, "No such endpoint.");
}

/**
 * Starts the editor on the loopback interface. Resolves once it is listening;
 * rejects with the listen error (EADDRINUSE and the like) so the caller can
 * say something useful.
 */
export async function startStudio({
  port = Number(process.env.STUDIO_PORT || DEFAULT_PORT),
  siteUrl = process.env.SITE_URL || DEFAULT_SITE_URL,
  store = null
} = {}) {
  store ??= await new AccessStore(ACCESS_FILE).load();
  const context = { store, siteUrl };

  const server = createServer(async (req, res) => {
    if (!isLocalRequest(req)) return sendError(res, 403, "Studio only answers requests from this machine.");

    const url = new URL(req.url || "/", `http://${HOST}:${port}`);

    try {
      if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url, context);
      if (req.method !== "GET") return sendError(res, 405, "Method not allowed.");

      // The editor shell.
      if (url.pathname === "/" || url.pathname === "/index.html") {
        if (await serveStatic(res, path.join(UI_DIR, "index.html"))) return;
        return sendError(res, 500, "Studio UI is missing from studio/ui.");
      }

      // Editor assets.
      if (url.pathname.startsWith("/studio/")) {
        const target = safeJoin(UI_DIR, url.pathname.slice("/studio".length));
        if (target && (await serveStatic(res, target))) return;
        return sendError(res, 404, "Not found.");
      }

      // pdf.js, for rendering a PDF's first page in the editor.
      if (url.pathname.startsWith("/vendor/pdfjs/")) {
        const rest = url.pathname.slice("/vendor/pdfjs/".length);
        const target = PDFJS_FOLDERS.has(rest.split("/")[0]) ? safeJoin(PDFJS_DIR, "/" + rest) : null;
        if (target && (await serveStatic(res, target))) return;
        return sendError(res, 404, "pdf.js is not installed. Run npm install.");
      }

      // Everything else falls through to the site's public/ folder, so image
      // paths resolve here exactly as they do on the real site.
      const asset = safeJoin(PUBLIC_DIR, url.pathname);
      if (asset && (await serveStatic(res, asset))) return;

      return sendError(res, 404, "Not found.");
    } catch (error) {
      const status = error?.status || 500;
      if (status === 500) console.error(error);
      sendError(res, status, error?.message || "Something went wrong.");
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, HOST, () => {
      server.off("error", reject);
      resolve();
    });
  });

  return {
    server,
    port,
    store,
    url: `http://localhost:${port}`,
    close: () => new Promise((done) => {
      server.closeAllConnections?.();
      server.close(() => done());
    })
  };
}

/* ------------------------------------------------------------ direct run --- */

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.STUDIO_PORT || DEFAULT_PORT);
  startStudio({ port })
    .then((studio) => {
      console.log("");
      console.log("  Studio — local content editor");
      console.log(`  ${studio.url}`);
      console.log("");
      console.log(`  Editing JSON in ${path.relative(process.cwd(), path.join(ROOT, "data")) || "data"}/`);
      console.log("  Loopback only — nothing outside this machine can reach it.");
      console.log("  Run `npm run site` instead to bring the site up beside it and let other devices in.");
      console.log("");
    })
    .catch((error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`\n  Port ${port} is already in use.`);
        console.error(`  Close whatever is on it, or run: STUDIO_PORT=3002 npm run studio\n`);
        process.exit(1);
      }
      throw error;
    });
}
