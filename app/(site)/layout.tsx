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
import { BpNav } from "@/components/blueprint/BpNav";
import { ThemeProvider } from "@/components/blueprint/ThemeProvider";
import { fontVarExpression } from "@/lib/fonts";
import { tokensToCssVars } from "@/lib/palette";
import { resolveThemeTokens } from "@/lib/studio-theme";
import { readStudioSettings } from "@/lib/studio-settings";
import "./blueprint.css";

// Studio writes settings.json on disk — read it fresh on every request instead
// of freezing whatever it held at build time.
export const dynamic = "force-dynamic";

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
  const settings = readStudioSettings();
  const tokens = resolveThemeTokens(settings.theme);

  const overrideCss = `
.bp[data-studio-theme] {
${cssBlock({
  ...tokensToCssVars(tokens.light),
  "--bp-font-header": fontVarExpression(settings.fonts.header),
  "--bp-font-subheader": fontVarExpression(settings.fonts.subheader),
  "--bp-font-body": fontVarExpression(settings.fonts.body)
})}
}
html[data-theme="dark"] .bp[data-studio-theme] {
${cssBlock(tokensToCssVars(tokens.dark))}
}`;

  return (
    <ThemeProvider>
      <div className={`bp ${FONT_VARIABLES}`} data-studio-theme={settings.theme.paletteId}>
        {/* Palette/font tokens picked in Studio (Site Settings) — see lib/studio-theme.ts */}
        <style dangerouslySetInnerHTML={{ __html: overrideCss }} />
        <BpNav />
        {children}
        <div className="bp-badge">
          <span className="bp-badge-dot" aria-hidden="true" />
          Open to relocation
        </div>
      </div>
    </ThemeProvider>
  );
}
