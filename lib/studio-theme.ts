import { derivePaletteTokens } from "@/lib/palette";
import { DEFAULT_PALETTE, getPreset } from "@/data/studio/palettes";
import type { PaletteTokens, StudioSettings } from "@/types/studio";

/**
 * Turns a theme setting (a preset id, or "custom" + seed colors) into the full
 * light/dark token set. Pure and dependency-free so it can run in the browser
 * for Studio's live preview as well as on the server when rendering the site.
 */
export function resolveThemeTokens(theme: StudioSettings["theme"]): { light: PaletteTokens; dark: PaletteTokens } {
  if (theme.paletteId === "custom") {
    return {
      light: derivePaletteTokens(theme.custom.light),
      dark: derivePaletteTokens(theme.custom.dark)
    };
  }
  return (getPreset(theme.paletteId) ?? DEFAULT_PALETTE).modes;
}
