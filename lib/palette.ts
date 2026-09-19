import type { PaletteSeeds } from "@/types/resume";

export type PaletteTokens = PaletteSeeds & {
  inkSoft: string;
  muted: string;
  faint: string;
  rule: string;
  prose: string;
  pillText: string;
  /** Text set on the accent fill (the solid button, the bullet's project link). */
  onAccent: string;
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
function mix(hexA: string, hexB: string, t: number): string {
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
 *
 * muted and faint were re-weighted on 2026-09-18 (0.45 → 0.36, 0.60 → 0.50) so every
 * text role clears WCAG AA (4.5:1) against paper and the white sheet in both themes
 * on every preset. faint is now for rules, ticks, and dots, never for text.
 */
const RAMP = {
  prose: 0.1,
  inkSoft: 0.25,
  pillText: 0.29,
  muted: 0.36,
  faint: 0.5,
  rule: 0.87
} as const;

/** WCAG 2.x relative luminance of a hex color. */
function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Text on the accent fill: whichever of paper or ink reads better on it. On a light
 * preset that is paper; on a dark preset ink is the light one, so it wins there —
 * which keeps "Download PDF" white on blue in dark mode instead of black on blue.
 */
function onAccentFor({ paper, ink, accent }: Pick<PaletteSeeds, "paper" | "ink" | "accent">): string {
  return contrast(paper, accent) >= contrast(ink, accent) ? paper : ink;
}

export function derivePaletteTokens(seeds: PaletteSeeds): PaletteTokens {
  const { ink, paper } = seeds;
  return {
    ...seeds,
    prose: mix(ink, paper, RAMP.prose),
    inkSoft: mix(ink, paper, RAMP.inkSoft),
    pillText: mix(ink, paper, RAMP.pillText),
    muted: mix(ink, paper, RAMP.muted),
    faint: mix(ink, paper, RAMP.faint),
    rule: mix(ink, paper, RAMP.rule),
    onAccent: onAccentFor(seeds)
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
  pillText: "--pill-text",
  onAccent: "--on-accent"
};

export function tokensToCssVars(tokens: PaletteTokens): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(CSS_VAR_KEYS) as (keyof PaletteTokens)[]) {
    out[CSS_VAR_KEYS[key]] = tokens[key];
  }
  return out;
}
