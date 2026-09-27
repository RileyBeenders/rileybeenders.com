"use client";

import { useRef, type CSSProperties } from "react";
import { BulletLink } from "@/components/blueprint/BulletLink";
import type { SkillTarget } from "@/lib/skill-links";
import type { LinkedSkillBorder, LinkedSkillReveal, ReadMoreAnimation } from "@/types/pages";

type LinkedSkillProps = {
  name: string;
  target: SkillTarget;
  /** The hover card's second line starts with this: "Project" or "Proof". */
  kindLabel: string;
  border: LinkedSkillBorder;
  reveal: LinkedSkillReveal;
  readMoreLabel: string;
  readMoreMotion: ReadMoreAnimation;
  /** Its place among the page's linked skills, which staggers the border loops and the Read more glint. */
  index: number;
};

/** Keeps a card this far from the window's edges. */
const EDGE = 12;
/** The callout's leader runs this far out from the pill's corner before its label starts. */
const CALLOUT_REACH = 16;

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
 * to, in the Studio). The border marks it as linked (`data-border`), and
 * hovering or focusing it opens a card (`data-reveal`) naming what it links
 * to, with the site's Read more button. Both are the Studio's Home page →
 * Linked skills, styled in app/(site)/skill-pills.css.
 *
 * The card is always in the page, faded out, so its Read more link stays in
 * the tab order: tabbing to it opens the card through :focus-within. Just
 * before it opens, the card is placed so it stays inside the window
 * (`data-align`, and `--caret-x` for the card's pointer).
 *
 * The Studio's picker builds the same markup for its previews
 * (linkedSkillPreview in studio/ui/fields.js); change the two together.
 */
export function LinkedSkill({ name, target, kindLabel, border, reveal, readMoreLabel, readMoreMotion, index }: LinkedSkillProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const place = () => {
    const pill = ref.current;
    const card = pill?.querySelector<HTMLElement>(".bp-skill-card");
    if (!pill || !card) return;
    const view = document.documentElement.clientWidth;
    const box = pill.getBoundingClientRect();
    const width = card.offsetWidth;
    let align: "start" | "center" | "end";
    if (reveal === "callout") align = box.right + CALLOUT_REACH + width > view - EDGE ? "end" : "start";
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
      <LinkIcon />
      <span className="bp-skill-card">
        <span className="bp-skill-card-name" aria-hidden="true">{target.name}</span>
        <span className="bp-skill-card-detail" aria-hidden="true">{detail}</span>
        <span className="bp-skill-card-action">
          <BulletLink
            href={target.href}
            projectName={target.name}
            label={readMoreLabel}
            motion={readMoreMotion}
            index={index}
            ariaLabel={`${name}: see ${target.name} (${kindLabel.toLowerCase()})`}
          />
        </span>
      </span>
    </span>
  );
}
