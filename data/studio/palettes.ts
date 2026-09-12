import { derivePaletteTokens } from "@/lib/palette";
import type { PaletteSeeds, PaletteTokens, PresetPaletteId } from "@/types/studio";

export type Palette = {
  id: PresetPaletteId;
  name: string;
  description: string;
  /** Representative accent used for the palette-picker swatch chip. */
  swatch: string;
  modes: { light: PaletteTokens; dark: PaletteTokens };
};

function fromSeeds(light: PaletteSeeds, dark: PaletteSeeds) {
  return { light: derivePaletteTokens(light), dark: derivePaletteTokens(dark) };
}

// Exact current site colors — hand-tuned, so Default stays pixel-identical
// rather than running through the derived ramp like the generated presets below.
const DEFAULT_LIGHT: PaletteTokens = {
  paper: "#fbfbf9",
  white: "#ffffff",
  ink: "#0b1a2b",
  inkSoft: "#46545f",
  muted: "#6f7d88",
  faint: "#97a3ac",
  rule: "#d9dee3",
  accent: "#e3342f",
  blue: "#2f86c4",
  prose: "#26333f",
  pillText: "#4a5c6b"
};

const DEFAULT_DARK: PaletteTokens = {
  paper: "#0d1b2a",
  white: "#142a3d",
  ink: "#eef3f7",
  inkSoft: "#b7c4d1",
  muted: "#8b9aa8",
  faint: "#5b6b79",
  rule: "#24384a",
  accent: "#ff6b62",
  blue: "#5aa9e6",
  prose: "#d7e0e8",
  pillText: "#a9b8c5"
};

export const PRESET_PALETTES: Palette[] = [
  {
    id: "default",
    name: "Default",
    description: "The site's original paper-and-ink palette with a red accent.",
    swatch: DEFAULT_LIGHT.accent,
    modes: { light: DEFAULT_LIGHT, dark: DEFAULT_DARK }
  },
  {
    id: "forest",
    name: "Forest",
    description: "Sage paper, deep forest ink, burnt-orange accent.",
    swatch: "#c1622b",
    modes: fromSeeds(
      { paper: "#f8f7f0", white: "#ffffff", ink: "#1a2b1f", accent: "#c1622b", blue: "#2f7a63" },
      { paper: "#0f1a13", white: "#17261c", ink: "#eef3ea", accent: "#e2793f", blue: "#4fae8f" }
    )
  },
  {
    id: "twilight",
    name: "Twilight",
    description: "Pale lavender paper, indigo ink, violet accent.",
    swatch: "#7c4dbd",
    modes: fromSeeds(
      { paper: "#f7f6fb", white: "#ffffff", ink: "#1c1930", accent: "#7c4dbd", blue: "#3aa0c9" },
      { paper: "#14101f", white: "#201a33", ink: "#f1eef7", accent: "#a875e0", blue: "#5cc2e8" }
    )
  },
  {
    id: "terracotta",
    name: "Terracotta",
    description: "Warm sand paper, espresso ink, clay-red accent.",
    swatch: "#c1502e",
    modes: fromSeeds(
      { paper: "#fbf4ec", white: "#fffaf4", ink: "#2e1d14", accent: "#c1502e", blue: "#2d7d82" },
      { paper: "#1d130c", white: "#2a1d13", ink: "#f8ede2", accent: "#e07750", blue: "#4fa6ac" }
    )
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Ice-blue paper, deep navy ink, coral accent.",
    swatch: "#e8604a",
    modes: fromSeeds(
      { paper: "#f3f8fb", white: "#ffffff", ink: "#0d2436", accent: "#e8604a", blue: "#1f9ad6" },
      { paper: "#08161f", white: "#0f2331", ink: "#eaf4f9", accent: "#ff8468", blue: "#4fc3ee" }
    )
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Restrained near-grayscale with a single charcoal accent.",
    swatch: "#3a3a3a",
    modes: fromSeeds(
      { paper: "#f6f6f4", white: "#ffffff", ink: "#161616", accent: "#3a3a3a", blue: "#7d8590" },
      { paper: "#121212", white: "#1c1c1c", ink: "#f2f2f0", accent: "#d0d0d0", blue: "#8f97a1" }
    )
  },
  {
    id: "amber",
    name: "Amber",
    description: "Cream paper, dark umber ink, gold accent.",
    swatch: "#b8791a",
    modes: fromSeeds(
      { paper: "#fbf6e9", white: "#fffdf5", ink: "#2b2210", accent: "#b8791a", blue: "#2f6b5e" },
      { paper: "#1c160a", white: "#281f0f", ink: "#f7efd9", accent: "#e2a53f", blue: "#4f9a89" }
    )
  },
  {
    id: "rose",
    name: "Rose",
    description: "Blush paper, deep plum ink, magenta accent.",
    swatch: "#c13d6b",
    modes: fromSeeds(
      { paper: "#fbf3f5", white: "#fffafb", ink: "#2c1420", accent: "#c13d6b", blue: "#5a5ec7" },
      { paper: "#1c0f15", white: "#291b21", ink: "#f8e9ee", accent: "#ec6d97", blue: "#8890e8" }
    )
  },
  {
    id: "slate",
    name: "Slate",
    description: "Cool gray paper, slate-navy ink, teal accent.",
    swatch: "#0d8f8f",
    modes: fromSeeds(
      { paper: "#f4f6f8", white: "#ffffff", ink: "#10202e", accent: "#0d8f8f", blue: "#3355a4" },
      { paper: "#0a1620", white: "#12212e", ink: "#eaf0f4", accent: "#38c6c6", blue: "#6f89d6" }
    )
  }
];

export function getPreset(id: string): Palette | undefined {
  return PRESET_PALETTES.find((palette) => palette.id === id);
}

export const DEFAULT_PALETTE = PRESET_PALETTES[0];
