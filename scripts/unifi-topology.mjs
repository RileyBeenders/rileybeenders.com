#!/usr/bin/env node
/**
 * Redraws a UniFi topology SVG export in Blueprint Press.
 *
 *   node scripts/unifi-topology.mjs <export.svg> <slug>
 *
 * Writes public/project-artifacts/unifi-network/<slug>.svg. The export keeps
 * its layout (every tile, wire and VLAN drop stays where the exporter put it);
 * what changes is the drawing: square hairline sheets over the blueprint grid,
 * Instrument Serif titles, accent index numerals, link speed shown as line
 * weight instead of hue, and VLANs told apart by number instead of colour.
 *
 * Every colour and face is `var(--token, fallback)`. Inlined on the site
 * (components/projects/diagrams/ThemedSvg.tsx) the drawing follows the live
 * palette and the theme toggle; opened as a file or an <img> it falls back to
 * the Electric preset in light or dark, per the viewer's OS setting.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const [input, slug] = process.argv.slice(2);
if (!input || !slug) {
  console.error("Usage: node scripts/unifi-topology.mjs <export.svg> <slug>");
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "public/project-artifacts/unifi-network");
const src = readFileSync(input, "utf8");
const lines = src.split(/\r?\n/);
const ID = `unt-${slug}`;

/** The sheet's usable width: the exporter lays zones out from x 30 to 1370. */
const X0 = 30;
const X1 = 1370;

/** Exporter link colour/width → speed. */
const SPEED_BY_WIDTH = { "3.2": "sp10", "2.6": "sp25", "2.0": "sp1", "1.6": "spfe" };
const SPEED_BY_CLASS = { s10: "sp10", s25: "sp25", s1: "sp1", sfe: "spfe" };

const pad2 = (n) => String(n).padStart(2, "0");
const upper = (s) => s.toUpperCase();
const num = (s) => Number.parseFloat(s);
const fmt = (n) => String(Math.round(n * 10) / 10);

function need(match, what) {
  if (!match) throw new Error(`Could not find ${what} in ${input} — has the exporter's format changed?`);
  return match;
}

// ------------------------------------------------------------------ read ---

const width = num(need(src.match(/viewBox="0 0 ([\d.]+) [\d.]+"/), "the viewBox")[1]);
const rootId = need(src.match(/<g id="([^"]+)" transform=/), "the root group")[1];
const h1 = need(src.match(/class="h1"[^>]*>([^<]*)</), "the title")[1];
const sub = need(src.match(/class="sub"[^>]*>([^<]*)</), "the subtitle")[1].replace(/\s+/g, " ");
// The exporter writes its chips right to left.
const chips = [...src.matchAll(/class="chipt"[^>]*>(\d+) ([^<]*)</g)]
  .map((m) => ({ value: m[1], key: m[2] === "client devices" ? "clients" : m[2] }))
  .reverse();

const idle = [...src.matchAll(/<g class="idle"><title>VLAN (\d+) · (.*?) · ([^<]*)<\/title>/g)].map((m) => {
  const rest = src.slice(m.index + m[0].length);
  const next = rest.search(/<g class="idle">|<path d="M44,/);
  return { vid: m[1], name: m[2], subnet: m[3], wifi: rest.slice(0, next).includes('class="bcast"') };
});

const start = lines.findIndex((l) => l.startsWith('<g class="links">'));
const end = lines.findIndex((l) => l.includes('class="sec2"') && l.includes("OTHER NETWORKS"));
const body = lines.slice(need(start >= 0 && start, "the links group"), end >= 0 ? end : lines.findIndex((l) => l.startsWith('<path d="M44,')));

// --------------------------------------------------------------- restyle ---

const bcast = (x, y, scale) =>
  `<g transform="translate(${fmt(x)},${fmt(y)}) scale(${scale})" class="bcast" fill="none" stroke-width="1.8" stroke-linecap="round"><circle cx="0" cy="0" r="2" class="bdot"/><path class="w1" d="M-5,-4 a6.4,6.4 0 0 0 0,8 M5,-4 a6.4,6.4 0 0 1 0,8"/><path class="w2" d="M-9,-7 a11,11 0 0 0 0,14 M9,-7 a11,11 0 0 1 0,14"/></g>`;

/** Colours out, classes in, corners squared. */
function restyle(line) {
  return line
    .replace(/stroke="#[0-9a-f]{6}" stroke-opacity="\.25" stroke-width="([\d.]+)" fill="none"/g, (_, w) => `class="wire ${SPEED_BY_WIDTH[w]}"`)
    .replace(/stroke="#[0-9a-f]{6}" stroke-width="[\d.]+" fill="none" class="flow (s\w+)"/g, (_, s) => `class="fl ${SPEED_BY_CLASS[s]} flow ${s}"`)
    .replace(/stroke="#[0-9a-f]{6}" stroke-opacity="\.28" stroke-width="3" fill="none"/g, 'class="tw"')
    .replace(/stroke="#[0-9a-f]{6}" stroke-width="2\.2" fill="none" class="flow s1 drop"/g, 'class="tf flow s1 drop"')
    .replace(/r="4" fill="#[0-9a-f]{6}" stroke="#0c1324" stroke-width="1\.8"/g, 'r="3.5" class="tend"')
    .replace(/r="5" fill="#93b4ff" stroke="#0c1324" stroke-width="2"/g, 'r="4.5" class="hub"')
    .replace(/ rx="[\d.]+" class="(ibg|halo|rbox|zbg|tbg[^"]*)"/g, ' class="$1"')
    .replace(/(class="(?:zbg|tbg[^"]*)") stroke="#[0-9a-f]{6}"/g, "$1")
    .replace(
      /fill="none" stroke="#[0-9a-f]{6}" stroke-width="([\d.]+)" stroke-linecap="round" stroke-linejoin="round" style="color:#[0-9a-f]{6}"/g,
      'fill="none" class="ico" stroke-width="$1" stroke-linecap="round" stroke-linejoin="round"'
    )
    .replace(/class="bcast" stroke="#[0-9a-f]{6}"/g, 'class="bcast"')
    .replace(/r="2" fill="#[0-9a-f]{6}" stroke="none"/g, 'r="2" class="bdot"')
    .replace(/<image /g, '<image class="photo" ')
    .replace(/<circle r="[\d.]+" class="pkt">/g, '<circle r="2.6" class="pkt">')
    .replace(/class="tiny"([^>]*)>802\.1Q VLAN trunk</, 'class="note"$1>802.1Q VLAN trunk<');
}

/** Two-digit VLAN tags under an access point: which networks it broadcasts. */
function apTags(cx, top, vlans) {
  const w = 24;
  const h = 17;
  const gap = 4;
  const left = cx - (vlans.length * w + (vlans.length - 1) * gap) / 2;
  const tags = vlans.map((v, i) => {
    const x = left + i * (w + gap);
    return `<rect x="${fmt(x)}" y="${fmt(top)}" width="${w}" height="${h}"/><text x="${fmt(x + w / 2)}" y="${fmt(top + 12.5)}" text-anchor="middle">${pad2(v)}</text>`;
  });
  return `<g class="aptags">${tags.join("")}</g>`;
}

function infra(line) {
  let out = restyle(line);
  if (out.includes('class="halo"')) out = out.replace('<g class="infra">', '<g class="infra gw">');
  if (!out.includes('class="apdot"')) return out;

  out = out.replace(/<circle [^>]*class="apdot"[^>]*\/>/g, "");
  const vlans = [...(out.match(/Wi-Fi on: ([^<]*)</)?.[1] ?? "").matchAll(/VLAN (\d+)/g)].map((m) => m[1]);
  const cx = num(out.match(/<text x="([\d.]+)"[^>]*class="iname"/)[1]);
  const lastY = Math.max(...[...out.matchAll(/<text [^>]*y="([\d.]+)"/g)].map((m) => num(m[1])));
  return out.replace(/<\/g>$/, `${apTags(cx, lastY + 11, vlans)}</g>`);
}

const zones = [];

/** A VLAN sheet: accent index, serif name, subnet and count, a hairline under the header. */
function zone(line) {
  const head = need(
    line.match(/^<g class="zone (zv\d+)"><rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*class="zbg"[^>]*\/>/),
    "a zone header"
  );
  const [, zv, xs, ys, ws, hs] = head;
  const [x, y, w, h] = [xs, ys, ws, hs].map(num);
  const tilesAt = [line.indexOf('<g class="tile">'), line.indexOf('<g class="named">')].filter((i) => i >= 0);
  const cut = tilesAt.length ? Math.min(...tilesAt) : line.length - "</g>".length;
  const header = line.slice(head[0].length, cut);
  const vid = header.match(/class="vid"[^>]*>(\d+)</)[1];
  const name = header.match(/class="zname"[^>]*>([^<]*)</)[1];
  const subnet = header.match(/class="zsub"[^>]*>([^<]*)</)?.[1] ?? "";
  const count = header.match(/class="zcnt"[^>]*>([^<]*)</)?.[1] ?? "";
  const wifi = header.includes('class="bcast"');
  zones.push({ vid, name, bottom: y + h });

  const right = x + w - (wifi ? 44 : 18);
  const meta = [subnet, upper(count)].filter(Boolean).join("  ·  ");
  return [
    `<g class="zone ${zv}"><title>VLAN ${vid} · ${name}</title>`,
    `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(w)}" height="${fmt(h)}" class="zbg"/>`,
    `<text x="${fmt(x + 18)}" y="${fmt(y + 30)}" class="zidx">${pad2(vid)}</text>`,
    `<text x="${fmt(x + 52)}" y="${fmt(y + 31)}" class="zname">${name}</text>`,
    `<text x="${fmt(right)}" y="${fmt(y + 29.5)}" class="zmeta" text-anchor="end">${meta}</text>`,
    wifi ? bcast(x + w - 24, y + 25, 0.95) : "",
    `<line x1="${fmt(x + 18)}" x2="${fmt(x + w - 18)}" y1="${fmt(y + 46)}" y2="${fmt(y + 46)}" class="zrule"/>`,
    restyle(line.slice(cut))
  ].join("");
}

function remote(line) {
  return restyle(line);
}

const drawn = [];
let rbox = null;
for (const line of body) {
  if (line.startsWith('<g class="infra">')) drawn.push(infra(line));
  else if (line.startsWith('<g class="zone ')) drawn.push(zone(line));
  else if (line.includes('class="rbox"')) {
    const m = line.match(/x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/);
    rbox = { x: num(m[1]), y: num(m[2]), h: num(m[4]) };
    drawn.push(remote(line));
  } else if (line.includes('class="sec2"')) {
    // The remote-access caption sits under its box, so nothing rides above the title rule.
    const text = line.match(/>([^<]*)<\/text>/)[1];
    drawn.push(`<text x="${fmt(rbox.x)}" y="${fmt(rbox.y + rbox.h + 20)}" class="cap">${text}</text>`);
  } else drawn.push(restyle(line));
}

// ------------------------------------------------------------ new parts ---

function titleBlock() {
  const cellW = 140;
  const y = 28;
  const h = 64;
  const left = X1 - cellW * chips.length;
  const cells = chips.map((chip, i) => {
    const x = left + i * cellW;
    return `<rect x="${x}" y="${y}" width="${cellW}" height="${h}"/><text x="${x + 14}" y="${y + 22}" class="cap">${upper(chip.key)}</text><text x="${x + 14}" y="${y + 53}" class="tbv">${chip.value}</text>`;
  });
  return `<g class="tb">${cells.join("")}</g>`;
}

const zonesBottom = Math.max(...zones.map((z) => z.bottom));
const idleTop = zonesBottom + 56;

/** Networks with no clients, as a schedule: fixed cells, four to a row. */
function idleGrid() {
  if (!idle.length) return { svg: "", bottom: zonesBottom };
  const cols = 4;
  const gap = 10;
  const cellW = (X1 - X0 - gap * (cols - 1)) / cols;
  const cellH = 40;
  const top = idleTop + 14;
  const cells = idle.map((n, i) => {
    const x = X0 + (i % cols) * (cellW + gap);
    const y = top + Math.floor(i / cols) * (cellH + gap);
    const right = x + cellW - (n.wifi ? 40 : 16);
    return [
      `<g class="icell"><title>VLAN ${n.vid} · ${n.name} · ${n.subnet}</title>`,
      `<rect x="${fmt(x)}" y="${fmt(y)}" width="${fmt(cellW)}" height="${cellH}"/>`,
      `<text x="${fmt(x + 16)}" y="${fmt(y + 25)}" class="zidx">${pad2(n.vid)}</text>`,
      `<text x="${fmt(x + 50)}" y="${fmt(y + 25.5)}" class="iname">${n.name}</text>`,
      `<text x="${fmt(right)}" y="${fmt(y + 25)}" class="imeta" text-anchor="end">${n.subnet}</text>`,
      n.wifi ? bcast(x + cellW - 22, y + 20, 0.8) : "",
      "</g>"
    ].join("");
  });
  const rows = Math.ceil(idle.length / cols);
  return {
    svg: `<text x="${X0}" y="${idleTop}" class="cap">OTHER NETWORKS  ·  NO CLIENT DEVICES</text>${cells.join("")}`,
    bottom: top + rows * cellH + (rows - 1) * gap
  };
}

const idleDrawn = idleGrid();
const legendRule = idleDrawn.bottom + 30;
const legendY = legendRule + 34;
const height = legendY + 34;

/** Line weight carries the speed, the way a drawing's line schedule would. */
function legend() {
  const items = [
    ["sp10", "s10", "10 GbE"],
    ["sp25", "s25", "2.5 GbE"],
    ["sp1", "s1", "1 GbE"],
    ["spfe", "sfe", "Fast Ethernet"]
  ];
  const cellW = (X1 - X0) / 6;
  const parts = items.map(([sp, s, label], i) => {
    const x = X0 + i * cellW;
    return `<path d="M${fmt(x)},${legendY - 4} h34" class="wire ${sp}"/><path d="M${fmt(x)},${legendY - 4} h34" class="fl ${sp} flow ${s}"/><text x="${fmt(x + 46)}" y="${legendY}" class="leg">${label}</text>`;
  });
  const wx = X0 + 4 * cellW;
  parts.push(`${bcast(wx + 10, legendY - 4, 0.8)}<text x="${fmt(wx + 30)}" y="${legendY}" class="leg">Wi-Fi on this VLAN</text>`);
  const tx = X0 + 5 * cellW;
  parts.push(`${apTags(tx + 12, legendY - 12.5, ["2"])}<text x="${fmt(tx + 34)}" y="${legendY}" class="leg">VLANs an AP broadcasts</text>`);
  return `<line x1="${X0}" x2="${X1}" y1="${legendRule}" y2="${legendRule}" class="zrule"/><g class="legend">${parts.join("")}</g>`;
}

// ----------------------------------------------------------------- style ---

const LIGHT = { paper: "#ffffff", white: "#f4f4f4", ink: "#171a20", "ink-soft": "#515358", muted: "#6b6c70", faint: "#8b8d90", rule: "#e1e1e2", accent: "#3e6ae1" };
const DARK = { paper: "#000000", white: "#141414", ink: "#ffffff", "ink-soft": "#bfbfbf", muted: "#a3a3a3", faint: "#808080", rule: "#212121", accent: "#3e6ae1" };
const tokens = (set) => Object.entries(set).map(([k, v]) => `--t-${k}:var(--${k},${v})`).join(";");

const S = `#${ID}`;
const style = `
${S}{${tokens(LIGHT)};--t-serif:var(--bp-font-header,"Instrument Serif","Iowan Old Style",Georgia,serif);--t-body:var(--bp-font-body,Spectral,Georgia,serif);--t-ease:var(--ease,cubic-bezier(.22,.9,.28,1))}
@media (prefers-color-scheme:dark){${S}{${tokens(DARK)}}}
${S} text{font-family:var(--t-body);fill:var(--t-ink);font-variant-numeric:lining-nums}
${S} .bg{fill:var(--t-paper)}
${S} .gf{fill:none;stroke:var(--t-ink);stroke-opacity:.045}
${S} .gc{fill:none;stroke:var(--t-ink);stroke-opacity:.085}
${S} .frame{fill:none;stroke:var(--t-rule)}
${S} .h1{font-family:var(--t-serif);font-size:48px;letter-spacing:-.02em}
${S} .sub{font-size:16px;font-style:italic;fill:var(--t-ink-soft)}
${S} .hrule{stroke:var(--t-ink);stroke-width:2}
${S} .tb rect,${S} .icell rect{fill:var(--t-white);stroke:var(--t-rule)}
${S} .tbv{font-family:var(--t-serif);font-size:30px;font-variant-numeric:lining-nums tabular-nums}
${S} .cap{font-size:11px;letter-spacing:.14em;fill:var(--t-muted)}
${S} .note{font-size:12px;font-style:italic;fill:var(--t-muted)}
${S} .leg{font-size:13px;fill:var(--t-ink-soft)}
${S} .ibg{fill:var(--t-white);stroke:var(--t-rule);transition:stroke .35s var(--t-ease)}
${S} .infra:hover .ibg{stroke:var(--t-ink)}
${S} .gw .ibg{stroke:var(--t-accent);stroke-width:1.5}
${S} .ico{stroke:var(--t-ink-soft);color:var(--t-ink-soft);transition:stroke .35s var(--t-ease),color .35s var(--t-ease)}
${S} .infra .ico{stroke:var(--t-ink);color:var(--t-ink)}
${S} .gw .ico{stroke:var(--t-accent);color:var(--t-accent)}
${S} .halo{fill:none;stroke:var(--t-accent);animation:unt-halo 3.2s var(--t-ease) infinite}
${S} .iname2{font-family:var(--t-serif);font-size:20px}
${S} .iname,${S} .nname{font-size:13px;font-weight:500}
${S} .imodel,${S} .nsub{font-size:12px;font-style:italic;fill:var(--t-muted)}
${S} .imeta{font-size:12px;letter-spacing:.06em;fill:var(--t-muted);font-variant-numeric:lining-nums tabular-nums}
${S} .aptags rect{fill:var(--t-paper);stroke:var(--t-rule)}
${S} .aptags text{font-size:11px;letter-spacing:.06em;fill:var(--t-accent);font-variant-numeric:lining-nums tabular-nums}
${S} .wire{fill:none;stroke:var(--t-ink-soft);stroke-opacity:.4}
${S} .fl{fill:none;stroke:var(--t-accent)}
${S} .sp10{stroke-width:3.2}${S} .sp25{stroke-width:2.4}${S} .sp1{stroke-width:1.6}${S} .spfe{stroke-width:1.2}
${S} .wire.spfe{stroke-dasharray:5 4}
${S} .flow{stroke-dasharray:2 11;stroke-linecap:round;animation:unt-flow 1.5s linear infinite}
${S} .s10{animation-duration:.55s}${S} .s25{animation-duration:.9s}${S} .s1{animation-duration:1.5s}${S} .sfe{animation-duration:2.8s}${S} .drop{animation-duration:1.2s}
${S} .pkt{fill:var(--t-accent)}
${S} .tw{fill:none;stroke:var(--t-ink-soft);stroke-opacity:.3;stroke-width:1.4}
${S} .tf{fill:none;stroke:var(--t-accent);stroke-width:1.4}
${S} .tend{fill:var(--t-accent);stroke:var(--t-paper);stroke-width:1.5}
${S} .hub{fill:var(--t-ink);stroke:var(--t-paper);stroke-width:2}
${S} .rbox{fill:none;stroke:var(--t-faint);stroke-dasharray:5 4}
${S} .vpn{fill:none;stroke:var(--t-accent);stroke-width:1.5;stroke-dasharray:2 7;animation-duration:2.2s}
${S} .zone{transition:opacity .35s var(--t-ease)}
${S}:has(.zone:hover) .zone:not(:hover){opacity:.3}
${S} .zbg{fill:var(--t-white);stroke:var(--t-rule);transition:stroke .35s var(--t-ease)}
${S} .zone:hover .zbg,${S} .icell:hover rect{stroke:var(--t-ink)}
${S} .zrule{stroke:var(--t-rule)}
${S} .zidx{font-size:13px;letter-spacing:.22em;fill:var(--t-accent);font-variant-numeric:lining-nums tabular-nums}
${S} .zname{font-family:var(--t-serif);font-size:24px}
${S} .zmeta{font-size:11px;letter-spacing:.12em;fill:var(--t-muted);font-variant-numeric:lining-nums tabular-nums}
${S} .tbg{fill:var(--t-paper);stroke:var(--t-rule);transition:stroke .35s var(--t-ease)}
${S} .tbg.off{fill:none;stroke-dasharray:3 3}
${S} .tile:hover .tbg,${S} .named:hover .tbg{stroke:var(--t-ink)}
${S} .tile:hover .ico,${S} .named:hover .ico{stroke:var(--t-ink);color:var(--t-ink)}
${S} .offg>g{opacity:.42}${S} .offm image{opacity:.45}
${S} .bcast{stroke:var(--t-accent)}${S} .bdot{fill:var(--t-accent)}
${S} .bcast .w1{animation:unt-bc 2.4s ease-in-out infinite}
${S} .bcast .w2{animation:unt-bc 2.4s ease-in-out .35s infinite}
@keyframes unt-flow{to{stroke-dashoffset:-26}}
@keyframes unt-halo{0%{opacity:.6;stroke-width:1}100%{opacity:0;stroke-width:12}}
@keyframes unt-bc{0%,100%{opacity:.25}40%{opacity:1}}
@media (prefers-reduced-motion:reduce){${S} .flow,${S} .bcast path{animation:none}${S} .halo{animation:none;opacity:0}${S} .pkt{display:none}${S} *{transition:none}}
`;

// ----------------------------------------------------------------- write ---

const desc = `${h1}: ${sub}. ${zones.length} VLANs with clients (${zones.map((z) => `${z.vid} ${z.name}`).join(", ")})${
  idle.length ? `; ${idle.length} more with none (${idle.map((n) => `${n.vid} ${n.name}`).join(", ")})` : ""
}. ${chips.map((c) => `${c.value} ${c.key}`).join(", ")}.`;

const svg = [
  `<svg xmlns="http://www.w3.org/2000/svg" id="${ID}" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="${ID}-title ${ID}-desc">`,
  `<title id="${ID}-title">${h1} network topology</title><desc id="${ID}-desc">${desc}</desc>`,
  `<style>${style}</style>`,
  `<defs><pattern id="${ID}-g16" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" class="gf"/></pattern>`,
  `<pattern id="${ID}-g96" width="96" height="96" patternUnits="userSpaceOnUse"><rect width="96" height="96" fill="url(#${ID}-g16)"/><path d="M96 0H0V96" class="gc"/></pattern></defs>`,
  `<rect width="${width}" height="${height}" class="bg"/><rect x="12" y="12" width="${width - 24}" height="${height - 24}" fill="url(#${ID}-g96)"/><rect x="12.5" y="12.5" width="${width - 25}" height="${height - 25}" class="frame"/>`,
  `<g id="${rootId}">`,
  `<text x="${X0}" y="72" class="h1">${h1}</text><text x="${X0}" y="98" class="sub">${sub}</text>`,
  titleBlock(),
  `<line x1="${X0}" x2="${X1}" y1="112" y2="112" class="hrule"/>`,
  ...drawn,
  idleDrawn.svg,
  legend(),
  `</g></svg>`
].join("\n");

const leftovers = svg.replace(/data:[^"]*/g, "").match(/(?:stroke|fill)="#[0-9a-f]{3,6}"|style="color:/g);
if (leftovers) throw new Error(`Hard-coded colours survived the restyle: ${[...new Set(leftovers)].join(", ")}`);

mkdirSync(OUT_DIR, { recursive: true });
const out = path.join(OUT_DIR, `${slug}.svg`);
writeFileSync(out, `${svg}\n`);
console.log(`${out} — ${width}×${height}, ${zones.length} zones, ${idle.length} idle networks, ${(svg.length / 1024).toFixed(0)} KB`);
