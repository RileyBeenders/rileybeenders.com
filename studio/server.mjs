/**
 * Studio — the local content editor for rileybeenders.com.
 *
 * A dependency-free Node server that reads and writes the JSON files under
 * `data/`, so content is edited in a browser instead of by hand in VS Code.
 *
 * It is deliberately NOT part of the Next app: it lives on its own port, binds
 * to the loopback interface only, and never appears in a production build. The
 * public site cannot reach it and neither can anything else on the network.
 *
 *   npm run studio      # http://localhost:3001
 */

import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { readFile, writeFile, rename, mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const UI_DIR = path.join(HERE, "ui");
const PUBLIC_DIR = path.join(ROOT, "public");
const BACKUP_DIR = path.join(ROOT, ".studio-backups");

const HOST = "127.0.0.1";
const PORT = Number(process.env.STUDIO_PORT || 3001);

/** Every file the Studio is allowed to touch. Anything else is off limits. */
const FILES = {
  projects: { file: "data/projects/projects.json", label: "Projects", shape: "array" },
  proofs: { file: "data/projects/proofs.json", label: "Proofs", shape: "array" },
  experience: { file: "data/home/experience.json", label: "Experience", shape: "array" },
  skills: { file: "data/home/skills.json", label: "Skills", shape: "array" },
  education: { file: "data/home/education.json", label: "Education", shape: "object" },
  summary: { file: "data/home/summary.json", label: "Summary", shape: "object" },
  header: { file: "data/header.json", label: "Site Settings", shape: "object" }
};

/** Folders the image picker reads from, and uploads may write to. */
const IMAGE_DIRS = {
  "project-images": path.join(PUBLIC_DIR, "project-images"),
  "project-artifacts": path.join(PUBLIC_DIR, "project-artifacts")
};

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".avif"]);
const MAX_JSON_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_BYTES = 16 * 1024 * 1024;
const BACKUPS_KEPT = 25;

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
  ".woff2": "font/woff2"
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

async function listImages() {
  const images = [];
  for (const [folder, dir] of Object.entries(IMAGE_DIRS)) {
    let names = [];
    try {
      names = await readdir(dir);
    } catch {
      continue; // Folder is optional — an empty gallery is a valid state.
    }
    for (const name of names.sort()) {
      if (!IMAGE_EXTS.has(path.extname(name).toLowerCase())) continue;
      const info = await stat(path.join(dir, name));
      images.push({ src: `/${folder}/${name}`, folder, name, bytes: info.size, modified: info.mtimeMs });
    }
  }
  return images;
}

/** Strips a browser-supplied filename down to something safe to write. */
function sanitizeFilename(raw) {
  const base = path.basename(String(raw || "")).replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^[.-]+/, "");
  if (!base) return null;
  return IMAGE_EXTS.has(path.extname(base).toLowerCase()) ? base : null;
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

async function handleApi(req, res, url) {
  const segments = url.pathname.split("/").filter(Boolean).slice(1); // drop "api"

  if (req.method === "GET" && segments[0] === "files" && segments.length === 1) {
    const files = await Promise.all(
      Object.entries(FILES).map(async ([key, entry]) => {
        const info = await stat(path.join(ROOT, entry.file));
        return { key, label: entry.label, shape: entry.shape, file: entry.file, modified: info.mtimeMs };
      })
    );
    return sendJson(res, 200, { files });
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
      return sendJson(res, 200, { key, revision, savedAt: Date.now() });
    }
  }

  if (req.method === "GET" && segments[0] === "images" && segments.length === 1) {
    return sendJson(res, 200, { images: await listImages(), folders: Object.keys(IMAGE_DIRS) });
  }

  if (req.method === "POST" && segments[0] === "images" && segments.length === 2) {
    const dir = IMAGE_DIRS[segments[1]];
    if (!dir) return sendError(res, 404, `Unknown image folder "${segments[1]}".`);

    const filename = sanitizeFilename(url.searchParams.get("name"));
    if (!filename) {
      return sendError(res, 400, `Give the file a name ending in ${[...IMAGE_EXTS].join(", ")}.`);
    }

    const body = await readBody(req, MAX_IMAGE_BYTES);
    if (body.length === 0) return sendError(res, 400, "The uploaded file was empty.");

    await mkdir(dir, { recursive: true });
    const name = await uniquePath(dir, filename);
    await writeFile(path.join(dir, name), body);
    console.log(`  uploaded ${segments[1]}/${name}`);
    return sendJson(res, 201, { src: `/${segments[1]}/${name}`, folder: segments[1], name, bytes: body.length });
  }

  return sendError(res, 404, "No such endpoint.");
}

const server = createServer(async (req, res) => {
  if (!isLocalRequest(req)) return sendError(res, 403, "Studio only answers requests from this machine.");

  const url = new URL(req.url || "/", `http://${HOST}:${PORT}`);

  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);
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

server.listen(PORT, HOST, () => {
  console.log("");
  console.log("  Studio — local content editor");
  console.log(`  http://localhost:${PORT}`);
  console.log("");
  console.log(`  Editing JSON in ${path.relative(process.cwd(), path.join(ROOT, "data")) || "data"}/`);
  console.log("  Loopback only — nothing outside this machine can reach it.");
  console.log("");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} is already in use.`);
    console.error(`  Close whatever is on it, or run: STUDIO_PORT=3002 npm run studio\n`);
    process.exit(1);
  }
  throw error;
});
