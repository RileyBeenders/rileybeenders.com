---
name: site-timeline-sync
description: Keep the "About this site" page (data/site/about-site.json) current as the repository grows — refresh its stats from git, add only the KEY commits to its timeline (brief, one line of summary each), move the present marker, promote planned items that shipped, and recapture screenshots when the UI changed. Use after a meaningful commit or merge, when asked to "update the site timeline / about page / site story", "add this to the timeline", "refresh the site stats", or before a release. Also use when a timeline entry, stat, or screenshot on /about-this-site looks stale. Runs unattended after every push to main through .github/workflows/site-timeline-sync.yml; see "Unattended runs".
---

# Site Timeline Sync

One of several repository agent procedures — see `.agents/README.md` for the set.

`/about-this-site` is the one page that documents the site itself: a running date bar, a stats strip, a commit timeline (past · present · future), three pillars, and a "Behind the site" section of live demos (the resume formatter, the Studio, the agent skills). All of it lives in `data/site/about-site.json` (editable in the Studio under **About this site**) and renders through `app/(site)/about-this-site/page.tsx`. This procedure keeps that file honest without turning it into a changelog.

The page's value is that it's *curated*. Twenty-three entries tell the story of eighty days; a hundred would bury it. When in doubt, leave a commit out.

## When this applies

- After a commit or merge that changed how the site looks, what it can do, how it's built, or what it's for. Routine edits (a typo, a README tracker row, a job-application PDF drop) don't earn a timeline entry, though they still count toward the stats.
- On request ("update the about page", "add the dark-mode work to the timeline").
- When `node scripts/site-stats.mjs` reports numbers that differ from the page, or lists commits since the last timeline entry.
- **Automatically, after every push to `main`** — `.github/workflows/site-timeline-sync.yml` runs steps 1–7 and 9–10 of this procedure through Claude Code on a GitHub runner and commits the result. See **Unattended runs** below for what that run may and may not do; a local run is still how screenshots get recaptured.

## Procedure

1. **Run the report.** From the repo root:
   ```bash
   node scripts/site-stats.mjs
   ```
   It prints the six stats with what the page currently says, the last hashed timeline entry, and every commit since it — with `*` on the ones that look key (≥ 15 files, ≥ 400 lines changed, or a subject that names design / studio / agents / launch / motion / etc.) and a JSON skeleton for those. Read the actual commits (`git show --stat <hash>`) before trusting the heuristic either way.

2. **Refresh the stats.** `node scripts/site-stats.mjs --write` updates the values in place, matched by label, and leaves anything it doesn't recognise alone. If a stat has been renamed in the Studio, either restore the label or update `stats` in the script to match — don't let the two drift.

3. **Decide which commits are key.** A key commit changes one of: the design (a new direction, a theme, a page rebuilt), the site's capabilities (the Studio, a route, a data model), the agent layer (a new or reworked skill, the vault), or the goal (launch, an application milestone). Several small commits that together do one thing become *one* entry anchored on the last of them. A big commit that's mostly assets (PDF drops, vendored files) is not key by size alone.

4. **Write the entries.** Append to `feature.timeline` in date order, with the exact shape below. Keep the summary to one or two sentences in the voice of the existing entries: what changed and why it mattered, no adjectives. `title` is a short phrase, not the commit subject. `tags` come from the set already in use (`design`, `agents`, `data`, `launch`, `studio`, `motion`, `content`, `docs`, `goal`) — add a new tag only if none fits. Numbers come from the script's skeleton; don't round them.
   ```json
   {
     "date": "2026-09-16",
     "era": "past",
     "hash": "6526179",
     "title": "First project published",
     "summary": "ICARUS-Lite goes live with six photos and a full case study, and resume bullets gain reactive action words that take the accent on hover.",
     "tags": ["content"],
     "files": 50,
     "insertions": 13493,
     "deletions": 299,
     "screenshotId": "projects"
   }
   ```
   `screenshotId` is optional and must match an `id` in `feature.screenshots`.

   Four optional keys are for the rare entry that isn't a commit — a resume going out, a reply coming back. `"mark": "star"` draws the dot as an accent star instead of a circle sized by the diff. `id` gives an entry a handle; a later entry with `"linkFrom": "<that id>"` is joined to it by a line arrowed at the later dot, captioned with the days between the two dates (`linkLabel` overrides that caption). Keep this for moments that genuinely answer each other — the axis lifts a linked pair above every stem it spans, and a third pair would crowd it.

5. **Move the present.** There is at most one `"era": "present"` entry: the work in progress right now, with no `hash`. When that work lands, give the entry its hash, set `era` to `past`, and write a new present entry only if something else is genuinely underway — otherwise leave the page with no present entry (the timeline's "now" marker still shows today). Never leave a present entry describing finished work.

6. **Promote or prune the future.** `"era": "future"` entries are plans with a target month (`YYYY-MM-01`). When one ships, convert it to a past entry with the real date and hash (or delete it and write the past entry fresh). If a plan is dropped, delete it. Keep the future to three to five items that are grounded in the repo — hidden projects in `projects.json`, `README_TODO.md`, an unfinished Studio section — not aspirations.

7. **Keep the rest of the page in step.** If the commit changed a fact stated in `summary`, `bullets`, `caseStudy`, or a pillar's `body` (a count of skills, a palette name, "no pinning"), fix that sentence. Don't rewrite prose that's still true.

8. **Recapture screenshots when the UI changed.** A capture on this page is the site's portrait of itself, so it should not immortalize a defect. Before recapturing, run impeccable's detector over the UI files the commit touched and fix what is mechanical (the repo-root `DESIGN.md` is what it compares against):
   ```bash
   sh .agents/skills/impeccable/scripts/impeccable detect --json <changed .css/.tsx files>
   ```
   Advisory hits on the blueprint grid are expected (it is the committed surface); warnings are not. If the commit changed a whole surface, run `$impeccable audit` on it first. Then, with `npm run dev` (and `npm run studio` for the Studio shots) running:
   ```bash
   node scripts/capture-site-screenshots.mjs
   ```
   It rewrites `public/project-images/rileybeenders-com/<name>-light.png` and `<name>-dark.png` at fixed sizes — every capture exists in both themes because the page shows each one in the theme the visitor is *not* using (`src` is the light capture, `srcDark` the dark one). If you add a screenshot, add both files and both keys. The only captures that keep their own theme are the two hero images in the page's gallery (`images`), which are the light/dark comparison on purpose.

9. **Keep the demos honest.** The three "Behind the site" rows (`feature.backend.items`) each render a live replica beside notes: `resume` lights a real resume line per posting keyword (`matches[]` — keep each `line` a bullet that actually exists in `data/home/experience.json`), `studio` uses the real preset palettes from `lib/palettes.ts` so it needs no data, and `skills` lists procedures (`skills[]`: `name`, `trigger`, `does`). When a skill is added, removed, or renamed under `.agents/`, update that list so the router on the page matches the router in the repo. The prose there is in Riley's own words — refresh facts, don't rewrite voice.

10. **Verify and hand off.** `node scripts/check-about-site.mjs` (every entry has a real date, era, title and summary; a `hash` is a commit in this repository; at most one `present`; connectors and `screenshotId`s point at things that exist; the six stats are present), then `npm run typecheck`, then load `/about-this-site` in both themes and confirm: the new dot sits where its date belongs, the card reads well, thumbnails show the *other* theme's capture, the date bar still says → Present, and nothing in the Studio's About-this-site form shows an empty required field. Then run `vault-sync` — `data/site/**`, `app/(site)/about-this-site/**`, and `components/about-site/**` map to the vault's notes on the About page and data layer.

## Unattended runs

`.github/workflows/site-timeline-sync.yml` runs this procedure on a GitHub runner after every push to `main` (and on demand from the Actions tab). The runner has the full git history and Node, but no browser, no dev server, and no Studio, and nobody is watching — so the unattended run is a narrower version of the procedure:

- **Do**: steps 1–7 and 9 — `node scripts/site-stats.mjs --write`, read the listed commits with `git show --stat`, add an entry only for a genuinely key commit, move the present marker when its work has landed, keep the demos' data honest — then `node scripts/check-about-site.mjs` and the vault note for the About page (the sentence that states the entry counts and stats). The workflow validates the file again and commits whatever changed, as `github-actions[bot]`, with a subject that says whether the timeline or only the stats moved. Commits made with the workflow's own token never trigger another run, so there is no loop.
- **Don't**: recapture screenshots, start servers, run the impeccable detector, commit, push, or touch any file other than `data/site/about-site.json` and `.obsidian/rileybeenders.com Notes/02 Components/About This Site Page.md`. If a key commit changed a surface the page captures, say which in the final message; the next local run recaptures it (step 8).
- **Be conservative.** A local run can always add an entry later; an unattended one must never invent a moment, a number, or a hash. When the commits since the last entry are polish, the right result is a stats-only commit — or no commit at all, if the numbers already match. Never rewrite existing entries' prose to "improve" it.
- **Setup and cost.** The workflow needs one repository secret, `ANTHROPIC_API_KEY` (or a `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` for a Claude subscription — swap the input in the workflow). Each push costs one short Claude Code session; `--max-turns 40` caps it. If the validator fails, the workflow fails and nothing is committed — fix the file locally and push, and the next run starts clean. A push that only contains the sync's own commit is impossible (see above), but a push from GitHub Desktop that bundles several commits is one run covering all of them.

## Shape reference

`data/site/about-site.json`:

| Key | What it is |
|---|---|
| `hero` | `eyebrow`, `title`, `tagline` — the top of the page. |
| `dates` | `start` (ISO, the first commit), `ongoing: true` keeps the bar running and the end reading "Present". Set `end` and drop `ongoing` only if the site is ever frozen. |
| `summary`, `bullets`, `images` | The "01 The site" section, shaped like a project entry. |
| `caseStudy` | Problem / root cause / constraints / approach / design decisions / impact / tools, behind the toggle. |
| `feature.eyebrow`, `feature.intro` | The deep-dive header. |
| `feature.stats[]` | `label`, `value`, optional `suffix`, `note`. Labels the script refreshes: Commits, Days in motion, Agent skills, Vault notes, Applications tracked, Projects queued. |
| `feature.timeline[]` | Entries as above, in date order. |
| `feature.pillars[]` | `eyebrow`, `title`, `body[]` (first paragraph shows at rest), optional `screenshotId`. |
| `feature.screenshots[]` | `id`, `src` (light capture), `srcDark` (dark capture), `alt`, `caption`. Thumbnails for timeline entries and pillars; the page inverts them against the visitor's theme. |
| `feature.backend` | `eyebrow`, `intro`, `items[]` of `{ demo: "resume" \| "studio" \| "skills", eyebrow, title, body[], notes[], matches[], skills[] }` — the live-demo rows. |

## What "brief" means here

The timeline reads as a story someone scrolls in a minute. Every entry earns its place by marking a turn: the data split, going live, the first agent instructions, Blueprint Press, the Studio, dark mode, the motion skills. If the next ten commits are polish, the right number of new entries is zero, and the stats strip is where that work shows up. A page that says "117 commits" with twenty entries is more honest than one that lists all 117.

## Related procedures

- `vault-sync` (`.agents/skills/vault-sync/SKILL.md`) — required afterwards.
- `motion-design` / `motion-fluidity` / `motion-layout` — if the sync involves changing how the page moves rather than what it says.
- `impeccable` (`.agents/skills/impeccable/SKILL.md`) — the detector in step 8, and `$impeccable critique /about-this-site` when the page's own design is what changed; its `PRODUCT.md` records that this page is the site's self-documentation and must stay curated.
- `custom-resume` — unrelated, but the applications count on this page comes from the same tracker it reads.
