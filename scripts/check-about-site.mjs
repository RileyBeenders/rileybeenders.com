// Checks data/site/about-site.json before it is committed — by hand after a
// site-timeline-sync run, and by .github/workflows/site-timeline-sync.yml
// before the unattended run's changes are pushed. The page renders whatever
// is in the file, so a malformed entry (an unknown era, a hash that isn't a
// commit, a connector pointing at nothing) would go live silently.
//
//   node scripts/check-about-site.mjs        # exit 0 when clean, 1 with a list of problems
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const ABOUT = path.join(ROOT, "data/site/about-site.json");
const ERAS = new Set(["past", "present", "future"]);
const MARKS = new Set(["dot", "star"]);
const STAT_LABELS = ["Commits", "Days in motion", "Agent skills", "Vault notes", "Applications tracked", "Projects queued"];

const errors = [];
const fail = (message) => errors.push(message);

let about;
try {
  about = JSON.parse(readFileSync(ABOUT, "utf8"));
} catch (error) {
  console.error(`data/site/about-site.json does not parse: ${error.message}`);
  process.exit(1);
}

const feature = about.feature ?? {};
const screenshots = new Set((feature.screenshots ?? []).map((s) => s.id));

// A hash on a past entry must be a commit this checkout knows about.
function isCommit(hash) {
  try {
    execFileSync("git", ["cat-file", "-e", `${hash}^{commit}`], { cwd: ROOT, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------- timeline ---

const timeline = feature.timeline ?? [];
const ids = new Set();
let present = 0;
let previousDate = "";

timeline.forEach((entry, index) => {
  const at = `timeline[${index}] "${entry.title ?? "(untitled)"}"`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "")) fail(`${at}: date must be YYYY-MM-DD`);
  else if (entry.date < previousDate) fail(`${at}: out of date order (${entry.date} after ${previousDate})`);
  if (entry.date) previousDate = entry.date;

  if (!ERAS.has(entry.era)) fail(`${at}: era must be past, present or future`);
  if (!entry.title?.trim() || !entry.summary?.trim()) fail(`${at}: title and summary are required`);
  if (entry.mark !== undefined && !MARKS.has(entry.mark)) fail(`${at}: mark must be dot or star`);

  if (entry.era === "present") {
    present += 1;
    if (entry.hash) fail(`${at}: a present entry has no hash — give it the hash and set era to past once the work lands`);
  }
  if (entry.era === "future" && entry.hash) fail(`${at}: a future entry has no hash`);
  if (entry.hash !== undefined) {
    if (!/^[0-9a-f]{7,40}$/.test(entry.hash)) fail(`${at}: hash "${entry.hash}" is not a git hash`);
    else if (!isCommit(entry.hash)) fail(`${at}: hash ${entry.hash} is not a commit in this repository`);
  }
  for (const key of ["files", "insertions", "deletions"]) {
    if (entry[key] !== undefined && !(Number.isInteger(entry[key]) && entry[key] >= 0)) fail(`${at}: ${key} must be a whole number`);
  }

  if (entry.id !== undefined) {
    if (ids.has(entry.id)) fail(`${at}: duplicate id "${entry.id}"`);
    ids.add(entry.id);
  }
  if (entry.linkFrom !== undefined && !ids.has(entry.linkFrom)) fail(`${at}: linkFrom "${entry.linkFrom}" must name an earlier entry's id`);
  if (entry.screenshotId !== undefined && !screenshots.has(entry.screenshotId)) fail(`${at}: screenshotId "${entry.screenshotId}" is not in feature.screenshots`);
});

if (present > 1) fail(`timeline has ${present} present entries; at most one is allowed`);

// ---------------------------------------------------------------- stats ---

const stats = feature.stats ?? [];
for (const label of STAT_LABELS) {
  const stat = stats.find((s) => s.label === label);
  if (!stat) fail(`stats: no entry labelled "${label}" (scripts/site-stats.mjs refreshes it by that label)`);
  else if (!(Number.isInteger(stat.value) && stat.value >= 0)) fail(`stats "${label}": value must be a whole number`);
}

// ------------------------------------------------------------- pillars etc ---

for (const [index, pillar] of (feature.pillars ?? []).entries()) {
  if (pillar.screenshotId !== undefined && !screenshots.has(pillar.screenshotId)) fail(`pillars[${index}]: screenshotId "${pillar.screenshotId}" is not in feature.screenshots`);
}
for (const [index, shot] of (feature.screenshots ?? []).entries()) {
  if (!shot.src || !shot.srcDark) fail(`screenshots[${index}] "${shot.id}": needs both src (light) and srcDark`);
}

// --------------------------------------------------------------- report ---

if (errors.length) {
  console.error(`data/site/about-site.json: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log(`data/site/about-site.json: ${timeline.length} timeline entries, ${present} present, ${stats.length} stats — ok`);
