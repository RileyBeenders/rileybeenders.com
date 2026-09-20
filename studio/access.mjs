/**
 * Who may reach the dev site from another device.
 *
 * The gate (gate.mjs) asks this store before it forwards a request, and the
 * Studio's Devices panel (server.mjs → /api/access) edits it. Both run in the
 * same process under `npm run site`, so a phone that was just turned away
 * shows up in the panel straight away.
 *
 * Grants are temporary by design: each one carries an expiry, and one made
 * "until the server stops" is never written to disk. The rest persist in the
 * git-ignored `.studio-access.json` so a restart inside the window keeps a
 * phone working.
 */

import { readFile, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";

const KNOCKS_KEPT = 12;

/* --------------------------------------------------------- addresses --- */

/** `::ffff:10.1.1.5` → `10.1.1.5`; `fe80::1%eth0` → `fe80::1`; lower-case. */
export function normalizeAddress(raw) {
  let address = String(raw || "").trim().toLowerCase();
  if (address.startsWith("[") && address.endsWith("]")) address = address.slice(1, -1);
  const zone = address.indexOf("%");
  if (zone !== -1) address = address.slice(0, zone);
  if (address.startsWith("::ffff:") && isIPv4(address.slice(7))) address = address.slice(7);
  return address;
}

export function isIPv4(address) {
  const parts = address.split(".");
  return parts.length === 4 && parts.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function isIPv6(address) {
  return address.includes(":") && ipv6ToBigInt(address) !== null;
}

function ipv4ToInt(address) {
  return address.split(".").reduce((total, part) => total * 256 + Number(part), 0);
}

/** Expands `::` and returns the address as a 128-bit integer, or null if it does not parse. */
function ipv6ToBigInt(address) {
  if (!/^[0-9a-f:.]+$/.test(address) || address.split("::").length > 2) return null;
  const [head, tail = ""] = address.split("::");
  const expand = (half) => (half === "" ? [] : half.split(":"));
  let headParts = expand(head);
  let tailParts = expand(tail);

  // An embedded IPv4 tail (`::ffff:1.2.3.4`) becomes its two hextets.
  const last = tailParts.length ? tailParts : headParts;
  if (last.length && last[last.length - 1].includes(".")) {
    const v4 = last.pop();
    if (!isIPv4(v4)) return null;
    const n = ipv4ToInt(v4);
    last.push((n >>> 16).toString(16), (n & 0xffff).toString(16));
  }

  const missing = 8 - headParts.length - tailParts.length;
  if (missing < 0 || (missing > 0 && !address.includes("::"))) return null;
  const parts = [...headParts, ...Array(Math.max(0, missing)).fill("0"), ...tailParts];
  if (parts.length !== 8) return null;

  let total = 0n;
  for (const part of parts) {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return null;
    total = (total << 16n) | BigInt(parseInt(part, 16));
  }
  return total;
}

function inRange(address, cidr) {
  const [base, prefix] = cidr.split("/");
  return matches(address, base, Number(prefix));
}

/** True when `address` falls inside `base/prefix`. Families never match each other. */
function matches(address, base, prefix) {
  if (isIPv4(address) && isIPv4(base)) {
    const bits = 32 - prefix;
    return bits >= 32 || (ipv4ToInt(address) >>> bits) === (ipv4ToInt(base) >>> bits);
  }
  const a = ipv6ToBigInt(address);
  const b = ipv6ToBigInt(base);
  if (a === null || b === null) return false;
  const shift = BigInt(128 - prefix);
  return (a >> shift) === (b >> shift);
}

const LOOPBACK = ["127.0.0.0/8", "::1/128"];
/** RFC 1918, RFC 6598 (carrier NAT, which mesh VPNs also use), link-local, and IPv6 unique-local. */
const PRIVATE = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "100.64.0.0/10", "169.254.0.0/16", "fc00::/7", "fe80::/10"];

/** "loopback" is always let in, "private" can be granted, "public" never is. */
export function classifyAddress(raw) {
  const address = normalizeAddress(raw);
  if (!isIPv4(address) && !isIPv6(address)) return "invalid";
  if (LOOPBACK.some((cidr) => inRange(address, cidr))) return "loopback";
  if (PRIVATE.some((cidr) => inRange(address, cidr))) return "private";
  return "public";
}

/**
 * Parses what someone typed into the Devices panel — `10.1.1.57`,
 * `10.1.1.0/24`, `fd00::5` — into `{ address, prefix }`, or an error string.
 */
export function parseTarget(raw) {
  const text = String(raw || "").trim();
  if (!text) return { error: "Type the device's IP address." };
  const [base, prefixText] = text.split("/");
  const address = normalizeAddress(base);
  const family = isIPv4(address) ? 4 : isIPv6(address) ? 6 : 0;
  if (!family) return { error: `"${text}" is not an IPv4 or IPv6 address.` };

  const max = family === 4 ? 32 : 128;
  let prefix = max;
  if (prefixText !== undefined) {
    if (!/^\d{1,3}$/.test(prefixText) || Number(prefixText) > max) {
      return { error: `The prefix after "/" must be between 0 and ${max}.` };
    }
    prefix = Number(prefixText);
  }
  // The smallest network a grant may cover: nothing wider than a home LAN.
  const floor = family === 4 ? 16 : 48;
  if (prefix < floor) return { error: `That range is wider than a local network — use /${floor} or narrower.` };

  const kind = classifyAddress(address);
  if (kind === "loopback") return { error: "This machine can always reach the site — nothing to allow." };
  if (kind !== "private") return { error: `${address} is not on a local network, so it can't be allowed.` };
  return { address, prefix };
}

/** Where this machine can be reached from the rest of the network — what to type on the phone. */
export function lanAddresses() {
  const found = [];
  for (const list of Object.values(networkInterfaces())) {
    for (const entry of list || []) {
      if (entry.internal || entry.family !== "IPv4") continue;
      if (classifyAddress(entry.address) === "private") found.push(entry.address);
    }
  }
  return found;
}

/* ------------------------------------------------------------- store --- */

export class AccessStore {
  /** @param {string} file  the JSON file grants persist in */
  constructor(file) {
    this.file = file;
    /** @type {Array<{address:string, prefix:number, label:string, createdAt:number, expiresAt:number|null}>} */
    this.grants = [];
    /** @type {Array<{address:string, at:number, path:string, agent:string}>} newest first */
    this.knocks = [];
    /** Set by the gate when it is running in this process: { port, upstream }. */
    this.gate = null;
    this.listeners = new Set();
  }

  async load() {
    try {
      const parsed = JSON.parse(await readFile(this.file, "utf8"));
      this.grants = (Array.isArray(parsed?.grants) ? parsed.grants : [])
        .filter((grant) => typeof grant?.address === "string" && typeof grant.expiresAt === "number");
      this.prune();
    } catch {
      this.grants = []; // No file yet, or one we can't read — start with nothing allowed.
    }
    return this;
  }

  /** Only grants with an expiry are worth keeping across a restart. */
  async save() {
    const grants = this.grants.filter((grant) => grant.expiresAt !== null);
    await writeFile(this.file, `${JSON.stringify({ grants }, null, 2)}\n`, "utf8");
  }

  /** Drops expired grants. Returns the ones that went. */
  prune(now = Date.now()) {
    const expired = this.grants.filter((grant) => grant.expiresAt !== null && grant.expiresAt <= now);
    if (expired.length > 0) {
      this.grants = this.grants.filter((grant) => !expired.includes(grant));
      for (const grant of expired) this.emit("revoked", grant);
    }
    return expired;
  }

  isAllowed(raw) {
    const address = normalizeAddress(raw);
    if (classifyAddress(address) === "loopback") return true;
    this.prune();
    return this.grants.some((grant) => matches(address, grant.address, grant.prefix));
  }

  /**
   * Adds a grant, replacing any existing one for the same target so a
   * re-grant simply extends the time. `ttlMs` null means until the server stops.
   */
  async grant({ address, prefix, label = "", ttlMs }) {
    const now = Date.now();
    const grant = {
      address,
      prefix,
      label: String(label || "").trim().slice(0, 60),
      createdAt: now,
      expiresAt: ttlMs === null ? null : now + ttlMs
    };
    this.grants = this.grants.filter((existing) => !(existing.address === address && existing.prefix === prefix));
    this.grants.push(grant);
    this.knocks = this.knocks.filter((knock) => !matches(knock.address, address, prefix));
    await this.save();
    return grant;
  }

  async revoke(address, prefix) {
    const going = this.grants.filter((grant) => grant.address === address && grant.prefix === prefix);
    if (going.length === 0) return false;
    this.grants = this.grants.filter((grant) => !going.includes(grant));
    await this.save();
    for (const grant of going) this.emit("revoked", grant);
    return true;
  }

  /** Remembers a device the gate turned away, newest first, one entry per address. */
  knock({ address, path, agent }) {
    const normalized = normalizeAddress(address);
    this.knocks = [
      { address: normalized, at: Date.now(), path: String(path || "/").slice(0, 200), agent: String(agent || "").slice(0, 200) },
      ...this.knocks.filter((knock) => knock.address !== normalized)
    ].slice(0, KNOCKS_KEPT);
  }

  /** What the Devices panel shows. */
  snapshot() {
    this.prune();
    return {
      gate: this.gate,
      lan: lanAddresses(),
      grants: this.grants.map((grant) => ({ ...grant })),
      knocks: this.knocks.map((knock) => ({ ...knock })),
      now: Date.now()
    };
  }

  on(event, listener) {
    const entry = { event, listener };
    this.listeners.add(entry);
    return () => this.listeners.delete(entry);
  }

  emit(event, payload) {
    for (const entry of this.listeners) if (entry.event === event) entry.listener(payload);
  }
}

/** True when `address` is covered by `grant` — the gate uses this to drop live sockets on revoke. */
export function coveredBy(address, grant) {
  return matches(normalizeAddress(address), grant.address, grant.prefix);
}
