import type { SocialPost } from "@/types/resume";
import { ui } from "@/lib/copy";

/** Beside a captured post, pointing back at the original. */
export const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6.5 9.5 13 3m0 0H9m4 0v4M13 9.5v3a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * LinkedIn's "in", drawn in `currentColor` rather than its blue: this is a
 * reference to where the post came from, not a badge, and the page keeps its
 * one accent (see DESIGN.md, The One Accent Rule).
 */
const LinkedInMark = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.22.79 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

/** What the Studio writes for a date it worked out itself, as opposed to one typed by hand. */
const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T/;

/** "2021-10-16T17:07:16Z" → "16 October 2021"; anything else is shown as it was stored. */
function readableDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Only a stamp the Studio produced is reformatted. A date typed by hand is left
 * exactly as written: "October 2021" reformatted would read "1 October 2021",
 * claiming a day nobody stated.
 */
function postedOn(value: string): string {
  return ISO_STAMP.test(value) ? readableDate(value) : value;
}

/**
 * A post usually signs off with a run of hashtags. They are part of the record,
 * but they are not prose — set apart, they stop the last paragraph trailing off
 * into twenty tags.
 *
 * Found by pattern at the end of the text rather than by looking for the line
 * the capture put them on: the text is editable in the Studio and passes
 * through a textarea, so the newline in front of them is not something to
 * depend on. Two or more in a row is the test — a lone "#3dprinting" at the end
 * of a sentence is part of the sentence, not a tag block.
 */
function splitTags(text: string): { body: string; tags: string[] } {
  const match = /(?:^|\s)(#[^\s#]+(?:\s+#[^\s#]+)+)\s*$/.exec(text);
  if (!match) return { body: text, tags: [] };
  return { body: text.slice(0, match.index).trim(), tags: match[1].split(/\s+/) };
}

/** The opening of the post, for the card in the grid. */
function opening(text: string, limit = 400): string {
  const body = splitTags(text.trim()).body.replace(/\s+/g, " ").trim();
  if (body.length <= limit) return body;
  const cut = body.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : limit).trimEnd()}…`;
}

/**
 * How a captured post sits in the project's grid.
 *
 * Not a thumbnail: a screenshot of a post shrunk into a 4:3 frame is a grey
 * rectangle of unreadable type, which tells a visitor nothing and looks like a
 * mistake. This says what it is instead — who wrote it, when, how it opens —
 * and reads as the site's own card rather than a picture of someone else's
 * page. The screenshot is still kept; it belongs in the viewer, as the
 * evidence, not as the invitation.
 */
export function PostButton({ post, onOpen }: { post: SocialPost; onOpen: () => void }) {
  const preview = opening(post.text ?? "");

  return (
    <button type="button" className="pj-postcard" onClick={onOpen}>
      <span className="pj-postcard-source">
        <LinkedInMark />
        <span>{ui.gallery.postSource}</span>
      </span>

      {post.author && <span className="pj-postcard-author">{post.author}</span>}
      {post.date && <span className="pj-postcard-date">{postedOn(post.date)}</span>}
      {preview && <span className="pj-postcard-preview">{preview}</span>}

      <span className="pj-postcard-action">
        <span>{ui.gallery.postView}</span>
        <svg width="16" height="10" viewBox="0 0 18 10" fill="none" aria-hidden="true">
          <path d="M0 5h16M12 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

/**
 * A post captured from elsewhere, written out as the site's own record: who
 * posted it, when, and what it said, over the date this copy was taken.
 *
 * The point is that it outlives the original. The picture beside it
 * (the artifact's `src`) is what the post looked like; this is what it said, in
 * type the page can actually set, so the words survive even if the post is
 * edited away. The way out to LinkedIn is offered here rather than in the grid,
 * on the understanding that it may not answer forever — which is the whole
 * reason for keeping this copy.
 */
export function PostCard({ post }: { post: SocialPost }) {
  const { body, tags } = splitTags(post.text?.trim() ?? "");

  return (
    <article className="pj-post">
      <header className="pj-post-head">
        {post.author && <p className="pj-post-author">{post.author}</p>}
        <p className="pj-post-meta">
          <span className="pj-post-source">
            <LinkedInMark />
            {ui.gallery.postSource}
          </span>
          {post.date && <span>{postedOn(post.date)}</span>}
        </p>
      </header>

      {body && (
        <div className="pj-post-body">
          {body.split(/\n{2,}/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <p className="pj-post-tags">
          {tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </p>
      )}

      <footer className="pj-post-foot">
        <a className="pj-post-link" href={post.url} target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
          <span>{ui.gallery.postOriginal}</span>
          <ExternalIcon />
        </a>
        {/* The capture's own date: what makes this a record rather than a quote. */}
        <span className="pj-post-captured">{ui.gallery.postCaptured} {readableDate(post.capturedAt)}</span>
      </footer>
    </article>
  );
}
