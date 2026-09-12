import fs from "node:fs";
import path from "node:path";
import { DEFAULT_PALETTE, PRESET_PALETTES } from "@/data/studio/palettes";
import { sanitizeSeeds } from "@/lib/palette";
import { FONT_OPTIONS } from "@/lib/fonts";
import type { FontId, PaletteId, PaletteSeeds, StudioSettings } from "@/types/studio";

// Server-only: reads/writes the JSON file Studio edits. Never import this from
// a Client Component — go through /api/studio-settings instead.

const SETTINGS_PATH = path.join(process.cwd(), "data", "studio", "settings.json");

function seedsFromTokens(mode: (typeof DEFAULT_PALETTE)["modes"]["light"]): PaletteSeeds {
  return { paper: mode.paper, white: mode.white, ink: mode.ink, accent: mode.accent, blue: mode.blue };
}

const DEFAULT_SEEDS_LIGHT = seedsFromTokens(DEFAULT_PALETTE.modes.light);
const DEFAULT_SEEDS_DARK = seedsFromTokens(DEFAULT_PALETTE.modes.dark);

export const DEFAULT_SETTINGS: StudioSettings = {
  theme: {
    paletteId: "default",
    custom: { light: DEFAULT_SEEDS_LIGHT, dark: DEFAULT_SEEDS_DARK }
  },
  fonts: { header: "instrument-serif", subheader: "instrument-serif", body: "spectral" },
  projects: { showWipAnimation: true }
};

const PALETTE_IDS = new Set<PaletteId>([...PRESET_PALETTES.map((palette) => palette.id), "custom"]);
const FONT_IDS = new Set<FontId>(FONT_OPTIONS.map((font) => font.id));

function sanitizePaletteId(value: unknown): PaletteId {
  return typeof value === "string" && PALETTE_IDS.has(value as PaletteId) ? (value as PaletteId) : "default";
}

function sanitizeFontId(value: unknown, fallback: FontId): FontId {
  return typeof value === "string" && FONT_IDS.has(value as FontId) ? (value as FontId) : fallback;
}

/** Fills in defaults for anything missing or malformed so a hand-edited or partial file can never break a render. */
export function sanitizeSettings(input: unknown): StudioSettings {
  const raw = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const theme = (raw.theme ?? {}) as Record<string, unknown>;
  const custom = (theme.custom ?? {}) as Record<string, unknown>;
  const fonts = (raw.fonts ?? {}) as Record<string, unknown>;
  const projects = (raw.projects ?? {}) as Record<string, unknown>;

  return {
    theme: {
      paletteId: sanitizePaletteId(theme.paletteId),
      custom: {
        light: sanitizeSeeds(custom.light as Partial<PaletteSeeds> | undefined, DEFAULT_SEEDS_LIGHT),
        dark: sanitizeSeeds(custom.dark as Partial<PaletteSeeds> | undefined, DEFAULT_SEEDS_DARK)
      }
    },
    fonts: {
      header: sanitizeFontId(fonts.header, DEFAULT_SETTINGS.fonts.header),
      subheader: sanitizeFontId(fonts.subheader, DEFAULT_SETTINGS.fonts.subheader),
      body: sanitizeFontId(fonts.body, DEFAULT_SETTINGS.fonts.body)
    },
    projects: {
      showWipAnimation:
        typeof projects.showWipAnimation === "boolean"
          ? projects.showWipAnimation
          : DEFAULT_SETTINGS.projects.showWipAnimation
    }
  };
}

export function readStudioSettings(): StudioSettings {
  try {
    const raw = fs.readFileSync(SETTINGS_PATH, "utf-8");
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeStudioSettings(input: unknown): StudioSettings {
  const next = sanitizeSettings(input);
  fs.mkdirSync(path.dirname(SETTINGS_PATH), { recursive: true });
  fs.writeFileSync(SETTINGS_PATH, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
  return next;
}
