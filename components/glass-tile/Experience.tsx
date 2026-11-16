"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Experience as Role } from "@/types/resume";
import type { ReadMoreAnimation } from "@/types/pages";
import { Reveal } from "@/components/blueprint/Reveal";
import { BulletLink } from "@/components/blueprint/BulletLink";
import { EmphasizedText } from "@/components/content/EmphasizedText";
import { Paragraphs } from "@/components/content/Paragraphs";

/** A role with more bullets than this shows the first few and offers the rest. */
const AT_REST = 6;

type ExperienceProps = {
  roles: Role[];
  /** Project id → name, for the Read more link at the end of a bullet. */
  projectNames: Record<string, string>;
  readMoreLabel: string;
  readMoreMotion: ReadMoreAnimation;
  /** One flag per role: true for a role that ended too long ago to show at rest. It waits behind the "see more" button. */
  older?: boolean[];
  /** The button under the roles: its words while the older roles are hidden, and while they show. */
  moreLabel?: string;
  lessLabel?: string;
};

function RoleEntry({
  role,
  projectNames,
  readMoreLabel,
  readMoreMotion,
  linkIndexStart
}: { role: Role; linkIndexStart: number } & Pick<ExperienceProps, "projectNames" | "readMoreLabel" | "readMoreMotion">) {
  const [open, setOpen] = useState(false);
  const folds = role.bullets.length > AT_REST + 1;
  const shown = folds && !open ? role.bullets.slice(0, AT_REST) : role.bullets;
  const hidden = role.bullets.length - AT_REST;
  let linkIndex = linkIndexStart;

  return (
    <article className="role">
      <div className="role-when">
        <p className="role-dates">
          <b>{role.start}</b>
          {role.end}
        </p>
        <span className="role-rail" aria-hidden="true" />
        <span className="role-dot" aria-hidden="true" />
      </div>

      <div className="role-main">
        <div className="role-head">
          <h3>{role.role}</h3>
        </div>
        <p className="role-org">{role.company} <span>· {role.location}</span></p>
        {role.context && <Paragraphs className="role-context" text={role.context} />}

        {role.bullets.length > 0 && (
          <ul className="role-bullets">
            {shown.map((bullet) => {
              const project = bullet.projectId ? projectNames[bullet.projectId] : undefined;
              return (
                <li key={bullet.text}>
                  <span className="bp-bullet-content">
                    <EmphasizedText text={bullet.text} phrases={bullet.emphasis} className="bp-bullet-emphasis" />
                    {project && bullet.projectId && (
                      <BulletLink
                        href={`/projects#project-${bullet.projectId}`}
                        projectName={project}
                        label={readMoreLabel}
                        motion={readMoreMotion}
                        index={linkIndex++}
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        {folds && (
          <button type="button" className="role-more" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            <span>{open ? "Show fewer" : `Show ${hidden} more`}</span>
            <ChevronDown size={14} strokeWidth={2} aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}

/**
 * The roles, newest first, in one tile as a timeline: dates in a left
 * column on a rail, the role, company and bullets beside them. The bullets keep their reactive
 * emphasis (the Studio's accent phrases take the accent on hover) and their
 * Read more links to projects. Long roles fold after a few bullets.
 *
 * Only roles from the last few years show at rest (Site Settings → Layout →
 * Experience shown (years); the home page works out which). The older ones sit
 * in `.roles-rest`, hidden until the button under the tile opens them; they
 * stay in the page, so print shows every role.
 */
export function Experience({ roles, projectNames, readMoreLabel, readMoreMotion, older = [], moreLabel, lessLabel }: ExperienceProps) {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const isOlder = (index: number) => older[index] === true;
  const olderCount = roles.filter((_, index) => isOlder(index)).length;
  // Each list staggers from its own first role.
  let recentSeen = 0;
  let olderSeen = 0;

  let linkIndexStart = 0;
  const entries = roles.map((role, index) => {
    const start = linkIndexStart;
    linkIndexStart += role.bullets.filter((bullet) => bullet.projectId && projectNames[bullet.projectId]).length;
    return (
      <Reveal key={`${role.company}-${role.start}`} delay={Math.min(isOlder(index) ? olderSeen++ : recentSeen++, 3) * 0.05}>
        <RoleEntry
          role={role}
          projectNames={projectNames}
          readMoreLabel={readMoreLabel}
          readMoreMotion={readMoreMotion}
          linkIndexStart={start}
        />
      </Reveal>
    );
  });

  const onToggle = () => {
    const closing = open;
    setOpen(!open);
    // Closing takes a screen or more of roles away from above the button: keep it in view.
    if (closing) requestAnimationFrame(() => toggle.current?.scrollIntoView({ block: "center" }));
  };

  return (
    <>
      <div className="card roles">
        {entries.filter((_, index) => !isOlder(index))}
        {olderCount > 0 && (
          <div className="roles-rest" id="experience-older" hidden={!open}>
            {entries.filter((_, index) => isOlder(index))}
          </div>
        )}
      </div>
      {olderCount > 0 && (
        <button ref={toggle} type="button" className="roles-more" aria-expanded={open} aria-controls="experience-older" onClick={onToggle}>
          <span>{open ? lessLabel || "Show less" : moreLabel || "See more"}</span>
          {!open && <span className="roles-more-count">{olderCount} earlier {olderCount === 1 ? "role" : "roles"}</span>}
          <ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
    </>
  );
}
