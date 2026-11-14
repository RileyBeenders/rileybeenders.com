import type { Project, ProjectCategory } from "@/types/resume";

/**
 * The shared project categories, in the order their filter chips show on
 * /projects. A project can sit in more than one (Projects -> Categories in the
 * Studio); the chip labels are Navigation & labels -> Project cards & dialog.
 * This list is the only place a category is defined: the Studio's switches
 * (studio/ui/schema.js, PROJECT_CATEGORY_FIELDS) mirror it by hand.
 */
export const PROJECT_CATEGORIES = ["productDesign", "software", "automationControls", "networkInfrastructure"] as const;

/** Whether a project is switched into a category. */
export function inCategory(project: Project, category: ProjectCategory): boolean {
  return project.categories?.[category] === true;
}
