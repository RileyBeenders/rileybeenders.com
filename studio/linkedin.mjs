/**
 * Captures a LinkedIn post as a permanent artifact.
 *
 * A post on LinkedIn is not evidence you own: it can be edited, taken down, or
 * lost with the account. This takes a picture of it and copies out its words,
 * so the site keeps the post whether or not LinkedIn still does.
 *
 * LinkedIn answers a signed-out browser with HTTP 999 and its sign-up wall,
 * headless or not, so a capture needs a signed-in session. Rather than ask for
 * credentials or drive the real Chrome profile (which is locked while Chrome
 * runs), the editor keeps its own browser profile in `.studio-cache/linkedin`:
 * `signIn()` opens a visible window once, you sign in there as you normally
 * would, and the cookies stay in that folder for later captures. Nothing is
 * read from it here but the session, and the folder is git-ignored — it must
 * never be committed.
 *
 * LinkedIn's markup is theirs to change, so everything below is best-effort
 * and layered: several selectors per field, then the page's own metadata, then
 * nothing. A capture that comes back thin is not an error — the editor shows
 * what was found and you correct it before saving.
 */
import path from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");

/** The signed-in browser profile. Git-ignored: it holds a live LinkedIn session. */
export const PROFILE_DIR = path.join(ROOT, ".studio-cache", "linkedin");

/** Wide enough that a post renders in its desktop layout rather than the narrow one. */
const VIEWPORT = { width: 1100, height: 1400 };
/** A capture that hasn't worked by now isn't going to. */
const NAV_TIMEOUT = 45_000;

/** playwright-core drives a browser already on the machine; nothing is downloaded. */
async function launch({ headless }) {
  const { chromium } = await import("playwright-core");
  let lastError;
  for (const channel of ["chrome", "msedge"]) {
    try {
      return await chromium.launchPersistentContext(PROFILE_DIR, {
        channel,
        headless,
        viewport: VIEWPORT,
        locale: "en-US",
        args: ["--disable-blink-features=AutomationControlled"]
      });
    } catch (error) {
      lastError = error;
    }
  }
  const hint = /Executable doesn't exist|not found/i.test(lastError?.message || "")
    ? "No Chrome or Edge was found for playwright-core to drive."
    : lastError?.message || "The browser would not start.";
  throw Object.assign(new Error(hint), { status: 503 });
}

/** Addresses LinkedIn parks a signed-out visitor on. */
const WALL_PATH = /\/(authwall|login|signup|uas\/login|checkpoint)(\/|\?|$)/;

/**
 * Whether LinkedIn is showing its wall rather than the thing that was asked
 * for. It has two ways of doing this and they need different tests, so every
 * signal below is checked and any one is enough:
 *
 * - `/feed/` **redirects**, landing on `/login/?session_redirect=…` under a
 *   perfectly ordinary 200. Only the address and the title give it away.
 * - a **post** does not redirect: the wall is served at the post's own address
 *   under HTTP 999, so there the status and the page's own metadata are the
 *   only tells.
 *
 * Getting this wrong is not a harmless miss — a wall mistaken for a post gets
 * screenshotted and saved as though it were the evidence.
 */
async function isWalled(page, status) {
  if (status === 999 || (typeof status === "number" && status >= 400)) return true;
  if (WALL_PATH.test(page.url())) return true;
  return page
    .evaluate((pattern) => {
      const wall = new RegExp(pattern);
      const meta = document.querySelector('meta[property="og:url"]')?.content ?? "";
      if (meta && wall.test(meta)) return true;
      if (/sign in|sign up|join linkedin|login/i.test(document.title)) return true;
      return Boolean(
        document.querySelector(".authwall, form.login__form, #join-form, .join-form, [data-id='sign-in-form']")
      );
    }, WALL_PATH.source)
    .catch(() => false);
}

/**
 * Only a real LinkedIn post address is ever opened. Returns the normalised
 * URL, or null. Query strings are dropped: a post link copied out of the feed
 * carries tracking parameters that don't belong in the saved record.
 */
export function normalizePostUrl(raw) {
  let parsed;
  try {
    parsed = new URL(String(raw ?? "").trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const host = parsed.hostname.replace(/^www\./, "");
  if (host !== "linkedin.com" && !host.endsWith(".linkedin.com")) return null;
  if (!/^\/(posts|feed\/update|pulse)\//.test(parsed.pathname)) return null;
  return `https://www.linkedin.com${parsed.pathname.replace(/\/$/, "")}`;
}

/** Whether the saved profile still has a signed-in session. */
export async function sessionState() {
  let context;
  try {
    context = await launch({ headless: true });
    const page = await context.newPage();
    const response = await page.goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.waitForTimeout(1500);
    return { signedIn: !(await isWalled(page, response?.status())) };
  } catch (error) {
    if (error.status === 503) throw error;
    return { signedIn: false, error: error.message };
  } finally {
    await context?.close().catch(() => {});
  }
}

/**
 * Opens a visible window for signing in, and waits there until the session is
 * good or the window is closed. Everything it leaves behind lives in
 * PROFILE_DIR. Resolves to the state afterwards.
 */
export async function signIn({ waitMs = 5 * 60_000 } = {}) {
  const context = await launch({ headless: false });
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto("https://www.linkedin.com/login", { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    // Done as soon as LinkedIn stops showing a sign-in page — or as soon as the
    // window is closed, which is how you say "never mind".
    const left = await page
      .waitForFunction(() => !/\/authwall|\/uas\/login|\/signup|\/login|\/checkpoint/.test(location.href), null, {
        timeout: waitMs,
        polling: 1000
      })
      .then(() => true)
      .catch(() => false);
    if (!left) return { signedIn: false };
    await page.waitForTimeout(2000); // let the session cookie settle before the profile closes
    // Leaving the sign-in page is not the same as being signed in, so ask the
    // feed rather than trusting the address.
    const response = await page
      .goto("https://www.linkedin.com/feed/", { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT })
      .catch(() => null);
    return { signedIn: !(await isWalled(page, response?.status())) };
  } finally {
    await context.close().catch(() => {});
  }
}

/** Forgets the saved session, so the next sign-in starts clean. */
export async function signOut() {
  await rm(PROFILE_DIR, { recursive: true, force: true });
  return { signedIn: false };
}

/** Whether a signed-in profile has ever been made here. */
export async function hasProfile() {
  return stat(PROFILE_DIR).then((s) => s.isDirectory()).catch(() => false);
}

/**
 * Where a post's words and picture actually sit. LinkedIn renames these classes
 * freely, so each field tries a list and takes the first that holds text;
 * `og:` metadata is the floor.
 */
const SELECTORS = {
  post: [
    "div.feed-shared-update-v2",
    "article.feed-shared-update-v2",
    "[data-urn*='activity']",
    "main article",
    "main .scaffold-finite-scroll__content > div"
  ],
  author: [
    ".update-components-actor__title span[aria-hidden='true']",
    ".update-components-actor__title",
    ".feed-shared-actor__title",
    "a[href*='/in/'] span[aria-hidden='true']"
  ],
  date: [
    ".update-components-actor__sub-description span[aria-hidden='true']",
    ".update-components-actor__sub-description",
    ".feed-shared-actor__sub-description"
  ],
  body: [
    ".update-components-text",
    ".feed-shared-inline-show-more-text",
    ".feed-shared-update-v2__description",
    ".break-words"
  ],
  expand: [
    "button.feed-shared-inline-show-more-text__see-more-less-toggle",
    "button[aria-label*='see more' i]",
    "button.see-more"
  ],
  dismiss: [
    "button[aria-label='Dismiss']",
    "button.modal__dismiss",
    "button[data-test-modal-close-btn]"
  ],
  /**
   * Taken out of the page before anything is read *or photographed*, so the
   * picture and the words agree about what the post is.
   *
   * The comment thread is the important one. On a permalink page the replies
   * sit inside the same container as the post and carry their own
   * `.update-components-text`, so they end up in both the picture and the text
   * unless they go first. The rest is chrome: reaction counts and the
   * like/comment/repost bar.
   *
   * The author header is deliberately *not* here. It is read separately for the
   * `author` field, but it belongs in the picture — a screenshot of a post with
   * no byline is not evidence of much.
   *
   * `.visually-hidden` is why hashtags used to come out as "hashtag #usa":
   * LinkedIn labels each tag link with a hidden word for screen readers, and
   * `innerText` reads it like any other text. Removing those nodes fixes it at
   * the source rather than by pattern-matching afterwards.
   */
  drop: [
    ".comments-comments-list",
    ".comments-comment-item",
    ".comments-container",
    ".comments-comment-box",
    ".comments-comment-texteditor",
    ".social-details-social-counts",
    ".social-details-reactors-facepile",
    ".social-details-social-activity",
    ".feed-shared-social-action-bar",
    ".feed-shared-social-actions",
    ".update-v2-social-activity",
    ".visually-hidden",
    ".a11y-text",
    ".sr-only"
  ]
};

/**
 * The moment a post was published, read out of its own address.
 *
 * A LinkedIn activity id carries a Unix millisecond timestamp in its top bits,
 * so the absolute date can be recovered from the URL. That is worth doing,
 * because the date the page *shows* is relative ("4yr") — true on the day of
 * the capture and wrong forever after, which is no use in a record meant to
 * outlive the post. Returns an ISO string, or null when the address has no id
 * or the result isn't a plausible date.
 */
export function postedAtFrom(url) {
  const match = /(?:urn:li:activity:|-)(\d{15,25})(?:[-/?#]|$)/.exec(String(url ?? ""));
  if (!match) return null;
  const ms = Number(BigInt(match[1]) >> 22n);
  // LinkedIn opened in 2003; nothing published here is from the future.
  if (!Number.isFinite(ms) || ms < Date.UTC(2003, 0, 1) || ms > Date.now() + 86_400_000) return null;
  return new Date(ms).toISOString();
}

/**
 * Tidies the words as they came off the page.
 *
 * The hidden "hashtag" labels are already gone with their nodes (SELECTORS.drop),
 * so the first pass here only catches any that survived a markup change. The
 * second is the formatting one: LinkedIn puts every tag link on its own line,
 * which turns a normal sign-off into twenty near-empty lines, so a run of them
 * is folded back into the single line it reads as.
 */
export function tidyPostText(raw) {
  let text = String(raw ?? "").replace(/\r\n?/g, "\n");
  text = text.replace(/\bhashtag\s*\n?\s*(?=#)/g, "");

  const isTags = (line) => /^#[^\s#]+(?:\s+#[^\s#]+)*$/.test(line.trim());
  const out = [];
  let run = [];
  for (const line of text.split("\n").map((l) => l.trimEnd())) {
    if (isTags(line)) { run.push(line.trim()); continue; }
    if (run.length) { out.push(run.join(" ")); run = []; }
    out.push(line);
  }
  if (run.length) out.push(run.join(" "));

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** "4yr • Edited • Visible to anyone" → "4yr". Only used when the address has no id. */
function shownDate(raw) {
  return String(raw ?? "").split(/[•·|]/)[0].replace(/\s+/g, " ").trim();
}

/**
 * Reads the post out of the page, and takes the parts that are not the post
 * out of the page while it is there — so the picture taken next shows the same
 * thing the words say.
 *
 * This runs inside the browser (`page.evaluate`), so it may not close over
 * anything: everything it needs arrives in `config`. It is exported for the
 * same reason it is a named function — it is the piece most likely to be broken
 * by a LinkedIn markup change, and it can be run against a fixture page.
 *
 * Note it works on the live document rather than a clone: `innerText` on a node
 * outside the document quietly degrades to `textContent`, which would lose
 * every line break in the post.
 */
export function readPostInPage(config) {
  const pick = (root, list) => {
    for (const selector of list) {
      const node = root.querySelector(selector);
      if (node) return node;
    }
    return null;
  };

  const post = pick(document, config.post) ?? document.body;
  const author = pick(post, config.author)?.innerText?.trim() ?? "";
  const date = pick(post, config.date)?.innerText?.trim() ?? "";

  // Find the words first: the body selectors can match inside the parts about
  // to be removed, and a reference taken now stays valid either way.
  const body = pick(post, config.body);
  const strip = (node) => {
    // Never cut the branch the post's own words are on.
    if (node && (!body || !node.contains(body))) node.remove();
  };

  for (const node of post.querySelectorAll(config.drop.join(","))) strip(node);

  // Then a sweep by name, because the list above is only as current as
  // LinkedIn's class names. Anything still calling itself a comment goes: the
  // replies are the one thing that must not reach the picture or the words,
  // and they are worth catching twice.
  for (const node of post.querySelectorAll("[class*='comment' i]")) strip(node);

  const meta = (property) =>
    document.querySelector(`meta[property="${property}"]`)?.content?.trim() ?? "";

  return {
    author: author || meta("og:title"),
    date,
    text: body?.innerText ?? meta("og:description"),
    // Whether the post could be picked out of the page at all.
    scoped: post !== document.body
  };
}

/**
 * Captures one post: a PNG of the post itself written to `outDir`, plus the
 * author, date and body text. `basename` is the file to write (already made
 * unique by the caller).
 */
export async function capturePost({ url, outDir, basename }) {
  const target = normalizePostUrl(url);
  if (!target) throw Object.assign(new Error("That is not a LinkedIn post address."), { status: 422 });

  let context;
  try {
    context = await launch({ headless: true });
    const page = await context.newPage();
    page.setDefaultTimeout(NAV_TIMEOUT);
    const response = await page.goto(target, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    await page.waitForTimeout(2500);

    if (await isWalled(page, response?.status())) {
      throw Object.assign(
        new Error("LinkedIn asked this browser to sign in. Use Sign in to LinkedIn, then capture again."),
        { status: 401 }
      );
    }

    // Overlays LinkedIn throws over a post: cookie banners, app nags, message windows.
    for (const selector of SELECTORS.dismiss) {
      await page.locator(selector).first().click({ timeout: 1200 }).catch(() => {});
    }
    await page.addStyleTag({
      content: `
        .msg-overlay-list-bubble, #msg-overlay, .global-nav, header.global-nav,
        .artdeco-global-alert, [data-test-global-alert], .ad-banner-container,
        .feed-shared-update-v2__control-menu, .authentication-outlet__banner { display: none !important; }
      `
    }).catch(() => {});

    // "…see more" hides most of a long post; open it before anything is read.
    for (const selector of SELECTORS.expand) {
      const button = page.locator(selector).first();
      if (await button.count().catch(() => 0)) {
        await button.click({ timeout: 1500 }).catch(() => {});
        await page.waitForTimeout(400);
      }
    }

    /*
     * Read and photograph one element: the post. Everything below runs against
     * the live page rather than a detached copy, because `innerText` on a node
     * outside the document quietly degrades to `textContent` and every line
     * break in the post would be lost. Removing the comment thread and the
     * hidden labels from the page itself is safe here — the page is closed a
     * moment later, and the picture is of the post, which none of it is inside.
     */
    const found = await page.evaluate(readPostInPage, SELECTORS);

    // Prefer a picture of the post alone; a full page is the fallback when the
    // post can't be picked out of the layout.
    let shot = null;
    for (const selector of SELECTORS.post) {
      const node = page.locator(selector).first();
      if (!(await node.count().catch(() => 0))) continue;
      shot = await node.screenshot({ type: "png" }).catch(() => null);
      if (shot) break;
    }
    const whole = shot === null;
    shot ??= await page.screenshot({ type: "png", fullPage: true });

    await mkdir(outDir, { recursive: true });
    await writeFile(path.join(outDir, basename), shot);

    const author = found.author.trim();
    const text = tidyPostText(found.text);

    return {
      url: target,
      author,
      // The address is the better source; the page's own relative wording is the fallback.
      date: postedAtFrom(target) ?? shownDate(found.date),
      text,
      capturedAt: new Date().toISOString(),
      // Offered for the artifact's alt text, which is required and would
      // otherwise be left empty.
      alt: author ? `LinkedIn post by ${author}` : "A LinkedIn post",
      bytes: shot.length,
      // Told to the editor so a thin capture can say so rather than look finished.
      partial: whole || !author || !text,
      wholePage: whole
    };
  } finally {
    await context?.close().catch(() => {});
  }
}
