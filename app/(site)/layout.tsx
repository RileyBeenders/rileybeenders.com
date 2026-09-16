import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  Inter,
  Instrument_Serif,
  Playfair_Display,
  Source_Serif_4,
  Space_Grotesk,
  Spectral
} from "next/font/google";
import resumeData from "@/data/resumeData";
import { BpNav } from "@/components/blueprint/BpNav";
import { BpFixedRelocationBadge } from "@/components/blueprint/BpRelocationBadge";
import { ThemeProvider } from "@/components/blueprint/ThemeProvider";
import { fontVarExpression } from "@/lib/fonts";
import { tokensToCssVars } from "@/lib/palette";
import { resolveThemeTokens } from "@/lib/theme";
import "./blueprint.css";

// Every font Studio can assign to a role is preloaded here as a CSS variable;
// picking a font just points --bp-font-header/subheader/body at one of these.
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap"
});
const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap"
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair-display",
  display: "swap"
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap"
});
const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-source-serif-4",
  display: "swap"
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap"
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap"
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-ibm-plex-mono",
  display: "swap"
});

const FONT_VARIABLES = [
  instrumentSerif.variable,
  spectral.variable,
  playfairDisplay.variable,
  fraunces.variable,
  sourceSerif4.variable,
  inter.variable,
  spaceGrotesk.variable,
  ibmPlexMono.variable
].join(" ");

export const metadata: Metadata = {
  title: "Riley Beenders | R&D, Electromechanical and Automation Engineer",
  description:
    "R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation."
};

function cssBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const tokens = resolveThemeTokens(resumeData.theme);

  const overrideCss = `
.bp[data-theme-id] {
${cssBlock({
  ...tokensToCssVars(tokens.light),
  "--bp-font-header": fontVarExpression(resumeData.fonts.header),
  "--bp-font-subheader": fontVarExpression(resumeData.fonts.subheader),
  "--bp-font-body": fontVarExpression(resumeData.fonts.body)
})}
}
html[data-theme="dark"] .bp[data-theme-id] {
${cssBlock(tokensToCssVars(tokens.dark))}
}
/* The overscroll gutter is painted on <html>, outside .bp's scope, so it needs the resolved color rather than a var().
   [lang] is redundant (root layout always sets it) but bumps specificity above blueprint.css's own html rules
   without depending on this tag rendering after that stylesheet in the document. */
html[lang] { background: ${tokens.light.paper}; }
html[lang][data-theme="dark"] { background: ${tokens.dark.paper}; }`;

  return (
    <ThemeProvider>
      <div className={`bp ${FONT_VARIABLES}`} data-theme-id={resumeData.theme.paletteId}>
        {/* Palette/font tokens picked in Studio's Site Settings tab — see lib/theme.ts */}
        <style dangerouslySetInnerHTML={{ __html: overrideCss }} />
        <BpNav />
        {children}
        <BpFixedRelocationBadge />
      </div>
    </ThemeProvider>
  );
}
