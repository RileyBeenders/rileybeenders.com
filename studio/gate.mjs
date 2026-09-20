/**
 * The device gate — the only thing on the network side of `npm run site`.
 *
 * `next dev` itself listens on loopback alone. This server takes the public
 * port (3000), lets this machine straight through, and lets another device
 * on the local network through only while the Studio's Devices panel says
 * so. Everything it forwards — pages, RSC streams, the HMR websocket — goes
 * to Next byte for byte, with the Host header intact so the site sees the
 * address the visitor typed.
 *
 * A device that is turned away gets a page that says so and shows the
 * address to allow; the store remembers the knock so the panel can offer
 * a one-click Allow.
 */

import { createServer, request as httpRequest } from "node:http";
import { connect } from "node:net";
import { classifyAddress, coveredBy, normalizeAddress } from "./access.mjs";

const HOP_BY_HOP = new Set(["connection", "keep-alive", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade"]);

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

/** The Studio's own look, inlined: this page is served to a phone that can't load anything else. */
function page({ title, lead, detail, refreshSeconds }) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">${refreshSeconds ? `<meta http-equiv="refresh" content="${refreshSeconds}">` : ""}
<title>${escapeHtml(title)} · rileybeenders.com dev</title>
<style>
  :root { color-scheme: light dark; --paper:#fff; --ink:#171a20; --muted:#6b6c70; --rule:#e1e1e2; --accent:#3e6ae1; }
  @media (prefers-color-scheme: dark) { :root { --paper:#000; --ink:#fff; --muted:#a3a3a3; --rule:#212121; } }
  body { margin:0; min-height:100dvh; display:grid; place-items:center; padding:24px; box-sizing:border-box; background:var(--paper); color:var(--ink);
    font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing:antialiased;
    background-image: linear-gradient(color-mix(in srgb, var(--ink) 4.5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--ink) 4.5%, transparent) 1px, transparent 1px);
    background-size: 16px 16px; }
  main { max-width: 420px; padding: 26px 28px; border: 1px solid var(--rule); background: var(--paper); }
  .eyebrow { margin:0 0 14px; font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--muted); }
  h1 { margin:0 0 10px; font: 400 26px/1.15 "Iowan Old Style", "Palatino Linotype", Georgia, serif; }
  p { margin: 0 0 10px; color: var(--muted); }
  code { font: 500 14px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; color: var(--ink); padding: 2px 6px; background: color-mix(in srgb, var(--ink) 6%, transparent); }
  .dot { display:inline-block; width:8px; height:8px; margin-right:8px; border-radius:50%; background:var(--accent); vertical-align:middle; }
</style></head>
<body><main><p class="eyebrow"><span class="dot"></span>rileybeenders.com · dev server</p><h1>${escapeHtml(title)}</h1><p>${lead}</p>${detail ? `<p>${detail}</p>` : ""}</main></body></html>`;
}

function send(res, status, html) {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "content-length": Buffer.byteLength(html) });
  res.end(html);
}

/**
 * @param {object} options
 * @param {number} options.port          the public port
 * @param {{ host: string, port: number }} options.upstream   where `next dev` listens
 * @param {import("./access.mjs").AccessStore} options.store
 * @param {(line: string) => void} [options.log]
 */
export function startGate({ port, upstream, store, log = console.log }) {
  /** Live sockets by client address, so a revoke also ends an open HMR connection. */
  const sockets = new Map();

  function track(address, socket) {
    const set = sockets.get(address) ?? new Set();
    if (set.has(socket)) return; // A keep-alive socket carries many requests; watch it once.
    set.add(socket);
    sockets.set(address, set);
    socket.on("close", () => {
      set.delete(socket);
      if (set.size === 0) sockets.delete(address);
    });
  }

  store.on("revoked", (grant) => {
    for (const [address, set] of sockets) {
      if (!coveredBy(address, grant) || store.isAllowed(address)) continue;
      const count = set.size;
      for (const socket of set) socket.destroy();
      log(`  closed ${count} connection${count === 1 ? "" : "s"} from ${address}`);
    }
  });

  /** The waiting page reloads every few seconds; say so in the terminal once a minute per device, not every time. */
  const lastLogged = new Map();
  function logTurnedAway(address, url) {
    const now = Date.now();
    if (now - (lastLogged.get(address) ?? 0) < 60_000) return;
    lastLogged.set(address, now);
    log(`  turned away ${address} → ${url}  (allow it in Studio → Devices)`);
  }

  /** Decides for one request; answers it when the device is not allowed. */
  function admit(req, res) {
    const address = normalizeAddress(req.socket.remoteAddress);
    if (store.isAllowed(address)) return true;

    const kind = classifyAddress(address);
    if (kind === "private") {
      store.knock({ address, path: req.url, agent: req.headers["user-agent"] });
      logTurnedAway(address, req.url);
      if (res.writeHead) {
        send(res, 403, page({
          title: "This device isn't allowed in yet",
          lead: `Its address is <code>${escapeHtml(address)}</code>. On the computer running the site, open the Studio, choose <strong>Devices</strong>, and allow it.`,
          detail: "This page checks again on its own every few seconds.",
          refreshSeconds: 4
        }));
      } else {
        res.destroy();
      }
      return false;
    }

    if (res.writeHead) send(res, 403, page({ title: "Not available from here", lead: "The dev server only answers this machine and devices on its local network." }));
    else res.destroy();
    return false;
  }

  function forwardHeaders(req) {
    const headers = {};
    for (const [name, value] of Object.entries(req.headers)) {
      if (!HOP_BY_HOP.has(name)) headers[name] = value;
    }
    headers["x-forwarded-for"] = normalizeAddress(req.socket.remoteAddress);
    headers["x-forwarded-host"] = req.headers.host ?? "";
    headers["x-forwarded-proto"] = "http";
    return headers;
  }

  const server = createServer((req, res) => {
    if (!admit(req, res)) return;
    track(normalizeAddress(req.socket.remoteAddress), req.socket);

    const proxied = httpRequest({
      host: upstream.host,
      port: upstream.port,
      method: req.method,
      path: req.url,
      headers: forwardHeaders(req)
    }, (upstreamRes) => {
      // Node re-frames the body itself, so the upstream's framing headers must not come along.
      const headers = {};
      for (const [name, value] of Object.entries(upstreamRes.headers)) {
        if (!HOP_BY_HOP.has(name)) headers[name] = value;
      }
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.statusMessage, headers);
      upstreamRes.pipe(res);
    });

    proxied.on("error", (error) => {
      if (res.headersSent) return res.destroy();
      if (error.code === "ECONNREFUSED") {
        return send(res, 503, page({ title: "Starting up…", lead: "The site is compiling. This page reloads on its own.", refreshSeconds: 2 }));
      }
      send(res, 502, page({ title: "The site didn't answer", lead: escapeHtml(error.message) }));
    });

    req.pipe(proxied);
    res.on("close", () => proxied.destroy());
  });

  // WebSocket upgrades (Fast Refresh) are spliced straight through at the socket level.
  server.on("upgrade", (req, socket, head) => {
    if (!admit(req, socket)) return;
    track(normalizeAddress(req.socket.remoteAddress), socket);

    const target = connect(upstream.port, upstream.host, () => {
      const headers = { ...forwardHeaders(req), connection: "Upgrade", upgrade: req.headers.upgrade ?? "websocket" };
      const lines = [`${req.method} ${req.url} HTTP/1.1`];
      for (const [name, value] of Object.entries(headers)) {
        for (const each of [].concat(value ?? [])) lines.push(`${name}: ${each}`);
      }
      target.write(`${lines.join("\r\n")}\r\n\r\n`);
      if (head.length > 0) target.write(head);
      socket.pipe(target).pipe(socket);
    });

    const drop = () => { socket.destroy(); target.destroy(); };
    target.on("error", drop);
    socket.on("error", drop);
  });

  server.on("clientError", (error, socket) => {
    if (!socket.destroyed) socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    // No host: dual-stack, so http://localhost works whether it resolves to ::1 or 127.0.0.1.
    server.listen(port, () => {
      server.off("error", reject);
      store.gate = { port, upstream: `${upstream.host}:${upstream.port}` };
      resolve({
        server,
        close: () => new Promise((done) => {
          store.gate = null;
          for (const set of sockets.values()) for (const socket of set) socket.destroy();
          server.close(() => done());
        })
      });
    });
  });
}
