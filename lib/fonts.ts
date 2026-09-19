export type FontId =
  | "instrument-serif"
  | "spectral"
  | "playfair-display"
  | "fraunces"
  | "source-serif-4"
  | "inter"
  | "space-grotesk"
  | "ibm-plex-mono";

export type FontOption = {
  id: FontId;
  label: string;
  /** CSS variable name the matching next/font/google loader exposes. */
  cssVar: string;
  /** Generic fallback stack used if the webfont hasn't loaded yet. */
  fallback: string;
  mood: string;
};

/**
 * Every font here is preloaded once in app/(site)/layout.tsx via next/font/google
 * and exposed as a CSS variable — Studio only ever chooses which variable each
 * typographic role (header/sub-header/body) points at. The Studio's own copy of
 * this list lives in studio/ui/schema.js; keep the two in step.
 */
const FONT_OPTIONS: FontOption[] = [
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    cssVar: "--font-instrument-serif",
    fallback: '"Iowan Old Style", Georgia, serif',
    mood: "Editorial display serif — the site's current header font"
  },
  {
    id: "spectral",
    label: "Spectral",
    cssVar: "--font-spectral",
    fallback: "Georgia, serif",
    mood: "Warm reading serif — the site's current body font"
  },
  {
    id: "playfair-display",
    label: "Playfair Display",
    cssVar: "--font-playfair-display",
    fallback: "Georgia, serif",
    mood: "High-contrast, formal display serif"
  },
  {
    id: "fraunces",
    label: "Fraunces",
    cssVar: "--font-fraunces",
    fallback: "Georgia, serif",
    mood: "Soft, characterful serif with a wet-ink feel"
  },
  {
    id: "source-serif-4",
    label: "Source Serif 4",
    cssVar: "--font-source-serif-4",
    fallback: "Georgia, serif",
    mood: "Clean, quiet reading serif"
  },
  {
    id: "inter",
    label: "Inter",
    cssVar: "--font-inter",
    fallback: "system-ui, sans-serif",
    mood: "Neutral modern grotesque sans"
  },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    cssVar: "--font-space-grotesk",
    fallback: "system-ui, sans-serif",
    mood: "Geometric sans with technical character"
  },
  {
    id: "ibm-plex-mono",
    label: "IBM Plex Mono",
    cssVar: "--font-ibm-plex-mono",
    fallback: '"Courier New", monospace',
    mood: "Monospace — engineering / schematic feel"
  }
];

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((option) => option.id === id) ?? FONT_OPTIONS[0];
}

export function fontVarExpression(id: string): string {
  const option = getFontOption(id);
  return `var(${option.cssVar}), ${option.fallback}`;
}
