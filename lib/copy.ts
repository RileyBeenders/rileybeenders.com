import interfaceData from "@/data/site/interface.json";
import type { CountedText, InterfaceData } from "@/types/pages";

/** Labels shared across pages (navigation, buttons, small UI words), edited in the Studio. */
export const ui = interfaceData as InterfaceData;

/** Fills `{name}` placeholders in Studio copy: fill("{count} projects", { count: 4 }) → "4 projects". */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** The one-or-many variant of a piece of copy, with `{count}` filled in. */
export function counted(text: CountedText, count: number): string {
  return fill(count === 1 ? text.one : text.many, { count });
}
