"use client";

import Link from "next/link";
import { useRef, type CSSProperties } from "react";
import type { SkillTarget } from "@/lib/skill-links";
import type { LinkedSkillBorder, LinkedSkillReveal } from "@/types/pages";

type LinkedSkillProps = {
  name: string;
  target: SkillTarget;
  /** The hover card's second line starts with this: "Project" or "Proof". */
  kindLabel: string;
  border: LinkedSkillBorder;
  reveal: LinkedSkillReveal;
  /** The words the pill opens to (the site's Read more label). */
  readMoreLabel: string;
  /** Its place among the page's linked skills, which staggers the border loops. */
  index: number;
};

/** Keeps a card this far from the window's edges. */
const EDGE = 12;
/** The callout's leader runs this far out from the pill's corner before its label starts. */
const CALLOUT_REACH = 16;
/** What opening adds beyond the label: the button's side padding and its gap (skill-pills.css). */
const OPEN_EXTRA = 22;

/** The chain link at the end of a linked pill (lucide's link-2). */
function LinkIcon() {
  return (
    <svg className="bp-pill-link" width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 17H7A5 5 0 0 1 7 7h2M15 7h2a5 5 0 1 1 0 10h-2M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * A skill pill that points at the project or proof behind it (Skills → Links
 * to, in the Studio). The border marks it as linked (`data-border`). The
 * chain link at its end is the link itself: hovering or focusing the pill
 * turns the icon a half turn, then the pill opens to show the Read more
 * label beside it as a small accent button. A card (`data-reveal`) still
 * names the project or proof above the pill. Both are the Studio's Home
 * page → Linked skills, styled in app/(site)/skill-pills.css.
 *
 * Opening would widen the pill and push the pills after it along (and at the
 * end of a line, wrap it away from the pointer, closing it again). So the
 * label's width is measured just before it opens (`--more-w`) and the pill
 * takes that back with a negative margin: it grows over its neighbour
 * instead of moving it. The card is placed at the same moment so it stays
 * inside the window (`data-align`, and `--caret-x` for its pointer).
 *
 * The Studio's picker builds the same markup for its previews
 * (linkedSkillPreview in studio/ui/fields.js); change the two together.
 */
export function LinkedSkill({ name, target, kindLabel, border, reveal, readMoreLabel, index }: LinkedSkillProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const place = () => {
    const pill = ref.current;
    if (!pill) return;
    const label = pill.querySelector<HTMLElement>(".bp-pill-more-label > span");
    const labelWidth = label ? Math.ceil(label.scrollWidth) : 0;
    pill.style.setProperty("--more-w", `${labelWidth}px`);

    const card = pill.querySelector<HTMLElement>(".bp-skill-card");
    if (!card) return;
    const view = document.documentElement.clientWidth;
    // The card is placed against the pill as it will be once open: wider by the label and OPEN_EXTRA.
    const closed = pill.getBoundingClientRect();
    const opened = (label?.parentElement?.getBoundingClientRect().width ?? 0) > 1;
    const box = { left: closed.left, width: closed.width + (opened ? 0 : labelWidth + OPEN_EXTRA) };
    const right = box.left + box.width;
    const width = card.offsetWidth;
    let align: "start" | "center" | "end";
    if (reveal === "callout") align = right + CALLOUT_REACH + width > view - EDGE ? "end" : "start";
    else if (reveal === "tab") align = box.left + width > view - EDGE ? "end" : "start";
    else {
      const middle = box.left + box.width / 2;
      align = middle - width / 2 < EDGE ? "start" : middle + width / 2 > view - EDGE ? "end" : "center";
    }
    pill.dataset.align = align;
    const cardLeft = align === "center" ? (box.width - width) / 2 : align === "start" ? 0 : box.width - width;
    pill.style.setProperty("--caret-x", `${Math.round(box.width / 2 - cardLeft)}px`);
  };

  const detail = target.detail ? `${kindLabel} · ${target.detail}` : kindLabel;

  return (
    <span
      ref={ref}
      className="bp-pill bp-pill--linked"
      data-border={border}
      data-reveal={reveal}
      style={{ "--k": index % 7 } as CSSProperties}
      onPointerEnter={place}
      onFocus={place}
    >
      <span className="bp-pill-name">{name}</span>
      <Link
        href={target.href}
        className="bp-pill-more"
        aria-label={`${name}: see ${target.name} (${kindLabel.toLowerCase()})`}
        suppressHydrationWarning
      >
        <LinkIcon />
        <span className="bp-pill-more-label" aria-hidden="true">
          <span>{readMoreLabel}</span>
        </span>
      </Link>
      <span className="bp-skill-card" aria-hidden="true">
        <span className="bp-skill-card-name">{target.name}</span>
        <span className="bp-skill-card-detail">{detail}</span>
      </span>
    </span>
  );
}
