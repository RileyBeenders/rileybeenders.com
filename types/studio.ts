/** Studio: the site's own settings/admin surface at /studio. */

export type PaletteSeeds = {
  paper: string;
  white: string;
  ink: string;
  accent: string;
  blue: string;
};

export type PaletteTokens = PaletteSeeds & {
  inkSoft: string;
  muted: string;
  faint: string;
  rule: string;
  prose: string;
  pillText: string;
};

export type PresetPaletteId =
  | "default"
  | "forest"
  | "twilight"
  | "terracotta"
  | "ocean"
  | "graphite"
  | "amber"
  | "rose"
  | "slate";

export type PaletteId = PresetPaletteId | "custom";

export type CustomPalette = {
  light: PaletteSeeds;
  dark: PaletteSeeds;
};

export type FontId =
  | "instrument-serif"
  | "spectral"
  | "playfair-display"
  | "fraunces"
  | "source-serif-4"
  | "inter"
  | "space-grotesk"
  | "ibm-plex-mono";

export type FontRole = "header" | "subheader" | "body";

export type StudioSettings = {
  theme: {
    paletteId: PaletteId;
    custom: CustomPalette;
  };
  fonts: Record<FontRole, FontId>;
  projects: {
    showWipAnimation: boolean;
  };
};
