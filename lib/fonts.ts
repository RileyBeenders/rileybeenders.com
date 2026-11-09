export type FontId =
  | "instrument-serif"
  | "instrument-sans"
  | "azeret-mono"
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
 * typographic role (header/sub-header/body/mono) points at. The Studio's own copy of
 * this list lives in studio/ui/schema.js; keep the two in step.
 */
const FONT_OPTIONS: FontOption[] = [
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    cssVar: "--font-instrument-serif",
    fallback: '"Iowan Old Style", Georgia, serif',
    mood: "Editorial display serif — the monogram's face, the site's header font until 2026-11"
  },
  {
    id: "instrument-sans",
    label: "Instrument Sans",
    cssVar: "--font-instrument-sans",
    fallback: "system-ui, sans-serif",
    mood: "Clean grotesque, sibling of Instrument Serif — the Clean Bench display and body face"
  },
  {
    id: "azeret-mono",
    label: "Azeret Mono",
    cssVar: "--font-azeret-mono",
    fallback: '"SF Mono", Menlo, monospace',
    mood: "Wide, characterful monospace — the Clean Bench label face for dates, captions and small notes"
  },
  {
    id: "spectral",
    label: "Spectral",
    cssVar: "--font-spectral",
    fallback: "Georgia, serif",
    mood: "Warm reading serif — the site's body font until 2026-11"
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
