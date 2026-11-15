import type { ResumeData } from "@/types/resume";
import type { HomePageData } from "@/types/pages";
import { allSkillTargets } from "@/lib/skill-links";
import { ui } from "@/lib/copy";
import { SkillPicker, type PickerGroup } from "@/components/bench/SkillPicker";

/** How many group colours bench.css defines (--grp-1 … --grp-7); past that they repeat. */
const GROUP_TONES = 7;

type StackProps = {
  data: ResumeData;
  linkedSkills: HomePageData["linkedSkills"];
  picker?: HomePageData["skillPicker"];
};

/**
 * Skills and Tools: the skill groups as one bar of colour-coded tabs with an All tab at
 * the end, and nothing open until the visitor picks one (a hint sits where the
 * items will be). An item can be listed in several groups; All lists each one
 * once, in group order. A skill linked to a project or proof in the Studio
 * keeps its LinkedSkill treatment in every group it appears in.
 */
export function Stack({ data, linkedSkills, picker }: StackProps) {
  const targets = Object.fromEntries(allSkillTargets(data));
  const groups: PickerGroup[] = data.skills
    .filter((group) => group.items.length > 0)
    .map((group, index) => ({ label: group.category, items: group.items, tone: `var(--grp-${(index % GROUP_TONES) + 1})` }));
  const all = [...new Set(groups.flatMap((group) => group.items))];
  // In All, each item wears the colour of the first group it's in.
  const toneOf: Record<string, string> = {};
  for (const group of groups) for (const item of group.items) toneOf[item] ??= group.tone;
  if (groups.length > 1) groups.push({ label: picker?.allLabel || "All", items: all, tone: "var(--accent)", all: true });

  return (
    <SkillPicker
      groups={groups}
      everything={all}
      toneOf={toneOf}
      targets={targets}
      pickerLabel={picker?.label || "Skill groups"}
      hint={picker?.hint || "Pick a group above to see the skills and tools in it."}
      kindLabels={{
        project: linkedSkills?.labels?.project || "Project",
        proof: linkedSkills?.labels?.proof || "Proof"
      }}
      border={linkedSkills?.border || "orbit"}
      reveal={linkedSkills?.reveal || "card"}
      readMoreLabel={ui.bulletReadMore}
    />
  );
}
