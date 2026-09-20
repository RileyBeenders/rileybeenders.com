/**
 * `npm run site` — the whole local environment in one terminal.
 *
 *   Site      http://localhost:3000   the device gate, in front of `next dev`
 *   Studio    http://localhost:3001   the content editor, this machine only
 *
 * One process hosts the gate and the Studio (they share the access store, so
 * a phone the gate turns away shows up in Studio → Devices at once) and
 * spawns `next dev` on a loopback-only port behind the gate. Ctrl+C stops
 * all of it.
 *
 *   SITE_PORT=3000  STUDIO_PORT=3001  NEXT_PORT=3010   override the ports
 */

import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { createInterface } from "node:readline";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AccessStore, lanAddresses } from "./access.mjs";
import { startGate } from "./gate.mjs";
import { ACCESS_FILE, DEFAULT_PORT as STUDIO_DEFAULT_PORT, startStudio } from "./server.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEXT_BIN = path.join(ROOT, "node_modules", "next", "dist", "bin", "next");

const SITE_PORT = Number(process.env.SITE_PORT || 3000);
const STUDIO_PORT = Number(process.env.STUDIO_PORT || STUDIO_DEFAULT_PORT);
const NEXT_PORT = Number(process.env.NEXT_PORT || 3010);
const NEXT_HOST = "127.0.0.1";

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const dim = (text) => (color ? `\x1b[2m${text}\x1b[0m` : text);
const bold = (text) => (color ? `\x1b[1m${text}\x1b[0m` : text);
const accent = (text) => (color ? `\x1b[34m${text}\x1b[0m` : text);

/** Resolves true when nothing is listening on `port` (checked on both loopback and the wildcard). */
function portFree(port, host) {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once("error", () => resolve(false));
    probe.listen(port, host, () => probe.close(() => resolve(true)));
  });
}

async function assertPortsFree() {
  const checks = [
    { port: SITE_PORT, host: undefined, what: "the site" },
    { port: STUDIO_PORT, host: "127.0.0.1", what: "the Studio" },
    { port: NEXT_PORT, host: NEXT_HOST, what: "next dev (behind the gate)" }
  ];
  const busy = [];
  for (const check of checks) if (!(await portFree(check.port, check.host))) busy.push(check);
  if (busy.length === 0) return;
  console.error("");
  for (const { port, what } of busy) console.error(`  Port ${port} is already in use — it's where ${what} goes.`);
  console.error("  Stop whatever is on it (an earlier `npm run dev` or `npm run site`?), or pick other ports:");
  console.error("  SITE_PORT=3100 STUDIO_PORT=3101 NEXT_PORT=3110 npm run site");
  console.error("");
  process.exit(1);
}

/** Prefixes every line a child prints, so the two servers stay readable in one terminal. */
function relay(stream, label) {
  createInterface({ input: stream }).on("line", (line) => {
    process.stdout.write(`${dim(label.padEnd(7))}${line}\n`);
  });
}

/** Ends a child and everything it spawned. `next dev` runs its server in a grandchild. */
function killTree(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

function banner(lan) {
  const lines = [
    "",
    `  ${bold("rileybeenders.com")} ${dim("— local environment")}`,
    "",
    `  Site     ${accent(`http://localhost:${SITE_PORT}`)}   ${dim(`next dev on ${NEXT_HOST}:${NEXT_PORT}, behind the device gate`)}`,
    `  Studio   ${accent(`http://localhost:${STUDIO_PORT}`)}   ${dim("content editor, this machine only")}`,
    ""
  ];
  if (lan.length > 0) {
    lines.push(`  Phone / tablet: open ${lan.map((address) => accent(`http://${address}:${SITE_PORT}`)).join(" or ")},`);
    lines.push(`  then allow the device in ${bold("Studio → Devices")}. Nothing off this network gets in.`);
  } else {
    lines.push(`  ${dim("No local-network address found — other devices can't reach this machine right now.")}`);
  }
  lines.push("", `  ${dim("Ctrl+C stops everything.")}`, "");
  console.log(lines.join("\n"));
}

async function main() {
  await assertPortsFree();

  const store = await new AccessStore(ACCESS_FILE).load();
  const gate = await startGate({ port: SITE_PORT, upstream: { host: NEXT_HOST, port: NEXT_PORT }, store });
  const studio = await startStudio({ port: STUDIO_PORT, siteUrl: `http://localhost:${SITE_PORT}`, store });

  const next = spawn(process.execPath, [NEXT_BIN, "dev", "-p", String(NEXT_PORT), "-H", NEXT_HOST], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      // The site's "Edit in Studio" control appears only when it has somewhere to go.
      NEXT_PUBLIC_STUDIO_URL: studio.url,
      // Next drops color once its output is a pipe; keep it when the terminal has it.
      ...(color ? { FORCE_COLOR: "1" } : {})
    }
  });
  relay(next.stdout, "next");
  relay(next.stderr, "next");

  banner(lanAddresses());

  let stopping = false;
  async function shutdown(code = 0) {
    if (stopping) return;
    stopping = true;
    killTree(next);
    await Promise.all([gate.close(), studio.close()]);
    process.exit(code);
  }

  next.on("exit", (code, signal) => {
    if (stopping) return;
    console.error(`\n  next dev stopped (${signal ?? `exit ${code}`}) — shutting the rest down.\n`);
    shutdown(code ?? 1);
  });
  next.on("error", (error) => {
    console.error(`\n  Could not start next dev: ${error.message}\n`);
    shutdown(1);
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => shutdown(0));
  }
}

main().catch((error) => {
  console.error(`\n  ${error.message}\n`);
  process.exit(1);
});
