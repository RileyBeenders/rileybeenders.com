import { derivePaletteTokens, type PaletteTokens } from "@/lib/palette";
import { DEFAULT_PALETTE, getPreset } from "@/lib/palettes";
import type { ThemeSetting } from "@/types/resume";

/** Turns a theme setting (a preset id, or "custom" + seed colors) into the full light/dark token set. */
export function resolveThemeTokens(theme: ThemeSetting): { light: PaletteTokens; dark: PaletteTokens } {
  if (theme.paletteId === "custom") {
    return {
      light: derivePaletteTokens(theme.custom.light),
      dark: derivePaletteTokens(theme.custom.dark)
    };
  }
  return (getPreset(theme.paletteId) ?? DEFAULT_PALETTE).modes;
}
