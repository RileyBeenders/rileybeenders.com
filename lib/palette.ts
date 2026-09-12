import type { PaletteSeeds } from "@/types/resume";

export type PaletteTokens = PaletteSeeds & {
  inkSoft: string;
  muted: string;
  faint: string;
  rule: string;
  prose: string;
  pillText: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const num = parseInt(hex.slice(1), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(rgb: [number, number, number]): string {
  return `#${rgb
    .map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Linear-interpolates between two hex colors. t=0 -> a, t=1 -> b. */
export function mix(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex([
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t
  ]);
}

/**
 * The site's secondary tokens (ink-soft, muted, faint, rule, prose, pill-text) have
 * always been a fixed tint ramp from ink toward paper — these weights are backed out
 * from the hand-tuned Default palette so any palette built from five seed colors
 * (paper, white, ink, accent, blue) inherits the same tonal rhythm.
 */
const RAMP = {
  prose: 0.1,
  inkSoft: 0.25,
  pillText: 0.29,
  muted: 0.45,
  faint: 0.6,
  rule: 0.87
} as const;

export function derivePaletteTokens(seeds: PaletteSeeds): PaletteTokens {
  const { ink, paper } = seeds;
  return {
    ...seeds,
    prose: mix(ink, paper, RAMP.prose),
    inkSoft: mix(ink, paper, RAMP.inkSoft),
    pillText: mix(ink, paper, RAMP.pillText),
    muted: mix(ink, paper, RAMP.muted),
    faint: mix(ink, paper, RAMP.faint),
    rule: mix(ink, paper, RAMP.rule)
  };
}

const CSS_VAR_KEYS: Record<keyof PaletteTokens, string> = {
  paper: "--paper",
  white: "--white",
  ink: "--ink",
  inkSoft: "--ink-soft",
  muted: "--muted",
  faint: "--faint",
  rule: "--rule",
  accent: "--accent",
  blue: "--blue",
  prose: "--prose",
  pillText: "--pill-text"
};

export function tokensToCssVars(tokens: PaletteTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(CSS_VAR_KEYS) as (keyof PaletteTokens)[]) {
    out[CSS_VAR_KEYS[key]] = tokens[key];
  }
  return out;
}
