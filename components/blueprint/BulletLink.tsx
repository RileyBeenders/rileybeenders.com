import Link from "next/link";
import type { CSSProperties } from "react";
import type { ReadMoreAnimation } from "@/types/pages";

type BulletLinkProps = {
  href: string;
  /** Named in the accessible label, since the visible words are the same on every bullet. */
  projectName: string;
  label: string;
  motion: ReadMoreAnimation;
  /** This link's place among the page's bullet links, so the glints don't all pass at once. */
  index: number;
  /** Replaces the default "See the <project> project" when the link isn't a bullet's. */
  ariaLabel?: string;
};

const ARROW_PATH = "M4 12L12 4m0 0H5.5M12 4v6.5";

function Arrow() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <path d={ARROW_PATH} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * The "Read more" button at the end of a resume bullet, and inside a linked
 * skill's hover card (LinkedSkill). How it moves is the
 * Studio's Home page → Read more button, written as `data-motion` and styled
 * in app/(site)/bullet-link.css. The markup is the same for every variant
 * except where one needs more: the roll splits the label into letters, the
 * glint adds its band. The Studio's picker builds this same markup for its
 * previews (readMorePreview in studio/ui/fields.js); change the two together.
 *
 * Nothing variable goes in the anchor's own style attribute: Riley's browser
 * extension rewrites it before hydration (see suppressHydrationWarning).
 */
export function BulletLink({ href, projectName, label, motion, index, ariaLabel }: BulletLinkProps) {
  return (
    <Link
      href={href}
      className="bp-bullet-link"
      data-motion={motion}
      aria-label={ariaLabel ?? `See the ${projectName} project`}
      suppressHydrationWarning
    >
      {motion === "glint" && (
        <span className="bp-bullet-link-glint" aria-hidden="true" style={{ "--i": index % 5 } as CSSProperties} />
      )}
      <span className="bp-bullet-link-label">
        {motion === "roll"
          ? Array.from(label, (char, position) => (
              <span key={position} data-ch={char} style={{ "--c": position } as CSSProperties}>
                {char}
              </span>
            ))
          : <span>{label}</span>}
      </span>
      <span className="bp-bullet-link-arrow" aria-hidden="true">
        <Arrow />
        <Arrow />
      </span>
    </Link>
  );
}
