"use client";

import { useState } from "react";
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
};

function RoleEntry({
  role,
  projectNames,
  readMoreLabel,
  readMoreMotion,
  linkIndexStart
}: { role: Role; linkIndexStart: number } & Omit<ExperienceProps, "roles">) {
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
 * Read more links to projects. Long roles fold after a few bullets; every
 * bullet is still in the page for printing and search.
 */
export function Experience({ roles, projectNames, readMoreLabel, readMoreMotion }: ExperienceProps) {
  let linkIndexStart = 0;
  return (
    <div className="card roles">
      {roles.map((role, index) => {
        const start = linkIndexStart;
        linkIndexStart += role.bullets.filter((bullet) => bullet.projectId && projectNames[bullet.projectId]).length;
        return (
          <Reveal key={`${role.company}-${role.start}`} delay={Math.min(index, 3) * 0.05}>
            <RoleEntry
              role={role}
              projectNames={projectNames}
              readMoreLabel={readMoreLabel}
              readMoreMotion={readMoreMotion}
              linkIndexStart={start}
            />
          </Reveal>
        );
      })}
    </div>
  );
}
