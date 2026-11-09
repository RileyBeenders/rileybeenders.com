import type { ResumeData } from "@/types/resume";
import type { HomePageData } from "@/types/pages";
import { Reveal } from "@/components/blueprint/Reveal";
import { LinkedSkill } from "@/components/blueprint/LinkedSkill";
import { skillTargets } from "@/lib/skill-links";
import { ui } from "@/lib/copy";

type StackProps = {
  data: ResumeData;
  linkedSkills: HomePageData["linkedSkills"];
};

/**
 * The four skill groups as four cards: a heading and a count, then the
 * group's items as pills. A skill linked to a project in the Studio keeps
 * its LinkedSkill treatment (the marked border, the hover card, the Read
 * more that opens out of it).
 */
export function Stack({ data, linkedSkills }: StackProps) {
  let linkedIndex = 0;
  return (
    <div className="stack-grid">
      {data.skills.map((group, index) => {
        const targets = skillTargets(group, data);
        return (
          <Reveal key={group.category} delay={Math.min(index, 3) * 0.06}>
            <section className="card stack-card bp-skill-group" aria-label={group.category}>
              <header className="stack-head">
                <h3>{group.category}</h3>
                <span className="stack-count">{group.items.length}</span>
              </header>
              <div className="bp-pills">
                {group.items.map((item) => {
                  const target = targets.get(item);
                  if (!target) return <span className="bp-pill" key={item}>{item}</span>;
                  return (
                    <LinkedSkill
                      key={item}
                      name={item}
                      target={target}
                      kindLabel={linkedSkills?.labels?.[target.kind] || (target.kind === "project" ? "Project" : "Proof")}
                      border={linkedSkills?.border || "orbit"}
                      reveal={linkedSkills?.reveal || "card"}
                      readMoreLabel={ui.bulletReadMore}
                      index={linkedIndex++}
                    />
                  );
                })}
              </div>
            </section>
          </Reveal>
        );
      })}
    </div>
  );
}
