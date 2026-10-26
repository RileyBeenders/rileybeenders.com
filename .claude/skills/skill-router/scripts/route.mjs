#!/usr/bin/env node
// Skill router: ranks the skills in .claude/skills/ for a free-text request.
//   node .claude/skills/skill-router/scripts/route.mjs "make the hero animate in smoother"
//   echo "request" | node .claude/skills/skill-router/scripts/route.mjs
//   --json    machine-readable output     --list   registry table
//   --check   registry/folder/CLAUDE.md drift check (exit 1 on problems)
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(here, "../..");
const repoRoot = resolve(skillsDir, "../..");
const registry = JSON.parse(readFileSync(join(here, "../registry.json"), "utf8"));
const S = registry.skills;

const MAX_SKILLS = 6;
const MIN_SCORE = 3;
const HEAVY_LINES = 400;
const PHASES = { 1: "ground", 2: "decide", 3: "build", 4: "verify", 5: "ship" };

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phraseRe = (p) => new RegExp(`(?<![\\w-])${esc(p).replace(/\s+/g, "[\\s-]+")}(?![\\w-])`, "i");

function lineCount(name) {
  try { return readFileSync(join(skillsDir, name, "SKILL.md"), "utf8").split("\n").length; } catch { return 0; }
}

function route(prompt) {
  const scored = {};
  const bump = (name, pts, why) => {
    const e = (scored[name] ??= { name, score: 0, why: [] });
    e.score += pts;
    if (why && !e.why.includes(why)) e.why.push(why);
  };

  for (const [name, s] of Object.entries(S)) {
    // single-word names (animate, prototype) are ordinary English: require /name or "use/run the <name> skill"
    const named = name.includes("-")
      ? phraseRe(name).test(prompt)
      : new RegExp(String.raw`(?<![\w-])(use|run|invoke|load)\s+(the\s+)?${esc(name)}\b|(?<![\w-])${esc(name)}\s+skill\b`, "i").test(prompt);
    if (named || prompt.includes(`/${name}`)) bump(name, 10, "named");
    for (const kw of s.keywords ?? []) {
      if (phraseRe(kw).test(prompt)) bump(name, kw.trim().includes(" ") || s.gate === "explicit" ? 3 : 1.5, kw);
    }
  }

  const fired = [];
  for (const r of registry.rules) {
    if (!new RegExp(r.when, "i").test(prompt)) continue;
    if (r.skip_when && new RegExp(r.skip_when, "i").test(prompt)) continue;
    fired.push(r);
    for (const a of r.add) bump(a, MIN_SCORE, `rule:${r.id}`);
  }

  let ranked = Object.values(scored).filter((e) => S[e.name] && e.score >= MIN_SCORE).sort((a, b) => b.score - a.score);
  const heldBack = [];
  const picked = [];
  for (const e of ranked) {
    const rule = e.why.some((w) => w.startsWith("rule:")) || e.why.includes("named");
    if (picked.length >= MAX_SKILLS && !rule) { heldBack.push({ name: e.name, reason: "over budget" }); continue; }
    picked.push(e);
  }
  // generic motion skills yield to motion-design: keep them only when motion-design is present
  const names = new Set(picked.map((p) => p.name));
  const gated = picked.filter((p) => S[p.name].gate === "explicit");

  const plan = picked
    .map((p) => ({ ...p, phase: S[p.name].phase, group: S[p.name].group, summary: S[p.name].summary, note: S[p.name].note ?? null, gated: S[p.name].gate === "explicit", lines: lineCount(p.name), next: S[p.name].next ?? [] }))
    .sort((a, b) => a.phase - b.phase || b.score - a.score);

  const chains = registry.chains.filter((c) => c.steps.filter((s) => names.has(s)).length >= 2 || phraseRe(c.name + " chain").test(prompt));
  const primary = [...picked].filter((p) => !p.why.every((w) => w.startsWith("rule:"))).sort((a, b) => b.score - a.score)[0]?.name ?? null;
  const mentionsGenericMotion = plan.some((p) => S[p.name].group === "motion-generic") && !names.has("motion-design");
  return { prompt, primary, plan, heldBack, chains, rulesFired: fired.map((r) => r.id), gatedWarnings: gated.map((g) => g.name), warnings: mentionsGenericMotion ? ["Generic motion skill selected without motion-design: load motion-design first."] : [] };
}

function check() {
  const problems = [];
  const folders = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory() && existsSync(join(skillsDir, d, "SKILL.md")));
  const claude = readFileSync(join(repoRoot, "CLAUDE.md"), "utf8");
  for (const f of folders) {
    if (!S[f]) problems.push(`folder without registry entry: ${f}`);
    const fm = readFileSync(join(skillsDir, f, "SKILL.md"), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const nm = fm?.[1].match(/^name:\s*(.+)$/m)?.[1].trim().replace(/^["']|["']$/g, "");
    if (!fm) problems.push(`${f}: SKILL.md has no frontmatter`);
    else if (nm !== f) problems.push(`${f}: frontmatter name "${nm}" != folder`);
    if (!claude.includes(`.claude/skills/${f}/SKILL.md`)) problems.push(`${f}: no row in CLAUDE.md`);
  }
  for (const [name, s] of Object.entries(S)) {
    if (!folders.includes(name)) problems.push(`registry entry without folder: ${name}`);
    if (!s.keywords?.length) problems.push(`${name}: no keywords`);
    if (![1, 2, 3, 4, 5].includes(s.phase)) problems.push(`${name}: bad phase`);
    for (const n of s.next ?? []) if (!S[n]) problems.push(`${name}: next -> unknown ${n}`);
  }
  for (const r of registry.rules) {
    try { new RegExp(r.when, "i"); } catch { problems.push(`rule ${r.id}: bad regex`); }
    for (const a of r.add) if (!S[a]) problems.push(`rule ${r.id}: unknown skill ${a}`);
  }
  for (const c of registry.chains) for (const s of c.steps) if (!S[s]) problems.push(`chain ${c.name}: unknown skill ${s}`);
  if (problems.length) { console.error(problems.map((p) => "x " + p).join("\n")); process.exit(1); }
  console.log(`ok: ${folders.length} skill folders, ${Object.keys(S).length} registry entries, ${registry.rules.length} rules, ${registry.chains.length} chains`);
}

function list() {
  const byGroup = {};
  for (const [n, s] of Object.entries(S)) (byGroup[s.group] ??= []).push(`${n}${s.gate ? " [explicit-only]" : ""}`);
  for (const [g, ns] of Object.entries(byGroup)) console.log(`${g.padEnd(18)} ${ns.join(", ")}`);
}

function render(r) {
  const out = [];
  if (!r.plan.length) {
    out.push("No skill clears the threshold. Proceed without one (or ask Riley what they have in mind).");
    return out.join("\n");
  }
  out.push(`Primary: ${r.primary ?? "(rule-driven only)"}`);
  out.push("", "Plan (in this order):");
  for (const p of r.plan) {
    const heavy = p.lines > HEAVY_LINES ? `  [heavy, ${p.lines} lines: read only the part you need]` : "";
    out.push(`  ${PHASES[p.phase].padEnd(6)} ${p.name}  (score ${p.score}; ${p.why.slice(0, 4).join(", ")})${heavy}`);
    out.push(`         ${p.summary}`);
    if (p.note) out.push(`         ! ${p.note}`);
    if (p.gated) out.push("         ! Explicit-only skill: confirm with Riley before it changes anything visual.");
  }
  if (r.chains.length) {
    out.push("", "Chains in play:");
    for (const c of r.chains) out.push(`  ${c.name}: ${c.steps.join(" -> ")}  (${c.note})`);
  }
  if (r.warnings.length) out.push("", ...r.warnings.map((w) => "Warning: " + w));
  if (r.heldBack.length) out.push("", "Held back: " + r.heldBack.map((h) => `${h.name} (${h.reason})`).join(", "));
  return out.join("\n");
}

const args = process.argv.slice(2);
if (args.includes("--check")) check();
else if (args.includes("--list")) list();
else {
  const json = args.includes("--json");
  let prompt = args.filter((a) => !a.startsWith("--")).join(" ").trim();
  if (!prompt && !process.stdin.isTTY) prompt = readFileSync(0, "utf8").trim();
  if (!prompt) { console.error('usage: route.mjs [--json] "request text" | --check | --list'); process.exit(2); }
  const r = route(prompt);
  console.log(json ? JSON.stringify(r, null, 2) : render(r));
}
