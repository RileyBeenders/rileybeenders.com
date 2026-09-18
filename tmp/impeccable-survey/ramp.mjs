const RAMP = { prose: 0.1, inkSoft: 0.25, pillText: 0.29, muted: 0.45, faint: 0.6, rule: 0.87 };
const h2r = (h) => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const r2h = (r) => "#" + r.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = h2r(a), B = h2r(b); return r2h([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]); };
const lum = (h) => { const [r, g, b] = h2r(h).map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const l1 = lum(a), l2 = lum(b); return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2); };
for (const [name, ink, paper, white] of [["electric-light", "#171a20", "#ffffff", "#f4f4f4"], ["electric-dark", "#ffffff", "#000000", "#141414"], ["default-light", "#0b1a2b", "#fbfbf9", "#ffffff"], ["default-dark", "#eef3f7", "#0d1b2a", "#142a3d"]]) {
  console.log("==", name);
  for (const [k, t] of Object.entries(RAMP)) { const v = mix(ink, paper, t); console.log(` ${k.padEnd(8)} ${v}  vs paper ${contrast(v, paper)}  vs white ${contrast(v, white)}`); }
}
console.log("-- default hand-tuned light: muted #6f7d88 vs #fbfbf9", contrast("#6f7d88", "#fbfbf9"), "faint #97a3ac", contrast("#97a3ac", "#fbfbf9"), "pill #4a5c6b vs #fff", contrast("#4a5c6b","#ffffff"));
console.log("-- default hand-tuned dark: muted #8b9aa8 vs #0d1b2a", contrast("#8b9aa8", "#0d1b2a"), "faint #5b6b79", contrast("#5b6b79", "#0d1b2a"));
console.log("-- accent electric #3e6ae1 on white", contrast("#3e6ae1", "#ffffff"), "on black", contrast("#3e6ae1", "#000000"), "paper-on-accent", contrast("#ffffff","#3e6ae1"));
console.log("-- accent default red #e3342f on #fbfbf9", contrast("#e3342f", "#fbfbf9"), "dark #ff6b62 on #0d1b2a", contrast("#ff6b62","#0d1b2a"));
console.log("-- candidate ramps: muted 0.35 / faint 0.5");
for (const [name, ink, paper] of [["electric-light", "#171a20", "#ffffff"], ["electric-dark", "#ffffff", "#000000"], ["default-dark", "#eef3f7", "#0d1b2a"]]) {
  console.log(` ${name}: muted35 ${mix(ink,paper,0.35)} ${contrast(mix(ink,paper,0.35),paper)}  muted38 ${mix(ink,paper,0.38)} ${contrast(mix(ink,paper,0.38),paper)}  faint50 ${mix(ink,paper,0.5)} ${contrast(mix(ink,paper,0.5),paper)}`);
}
