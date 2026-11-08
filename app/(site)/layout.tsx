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
import dynamic from "next/dynamic";
import resumeData from "@/data/resumeData";
import { SiteNav } from "@/components/sheet/SiteNav";
import { SmoothScroll } from "@/components/sheet/SmoothScroll";
import { ThemeProvider } from "@/components/blueprint/ThemeProvider";
import { AnimationSync } from "@/components/blueprint/AnimationSync";
import { fontVarExpression } from "@/lib/fonts";
import { tokensToCssVars } from "@/lib/palette";
import { resolveThemeTokens } from "@/lib/theme";
import "./sheet.css";
import "./bullet-link.css";
import "./skill-pills.css";
import "./projects/projects.css";
import "./projects/feature.css";
import "./projects/walkthrough.css";
import homePage from "@/data/home/page.json";

// Every font Studio can assign to a role is preloaded here as a CSS variable;
// picking a font just points --bp-font-header/subheader/body at one of these.
// IBM Plex Mono is also the sheet's fixed label face (--mono in sheet.css).
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

// The way into the Studio from the page being looked at (see components/blueprint/StudioLink.tsx).
// Loaded only by the development build: a plain import would keep the module in the
// production bundle even though nothing renders it there.
const StudioLink =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("@/components/blueprint/StudioLink").then((mod) => mod.StudioLink))
    : () => null;

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
  title: homePage.meta.title,
  description: homePage.meta.description
};

function cssBlock(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
}

/**
 * The site shell: the palette and font tokens from Site Settings written as
 * CSS variables, the floating nav, the dashed sheet the pages sit inside,
 * and the motion switches (synced animations, smooth scrolling).
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const tokens = resolveThemeTokens(resumeData.theme);
  const motion = resumeData.motion ?? {};

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
/* The overscroll gutter is painted on <html>, outside .bp's scope, so it needs the resolved color rather than a var(). */
html[lang] { background: ${tokens.light.paper}; }
html[lang][data-theme="dark"] { background: ${tokens.dark.paper}; }`;

  return (
    <ThemeProvider>
      <div
        className={`bp ${FONT_VARIABLES}`}
        data-theme-id={resumeData.theme.paletteId}
        data-motion-sync={motion.syncAnimations ? "" : undefined}
      >
        {/* Palette/font tokens picked in Studio's Site Settings tab — see lib/theme.ts */}
        <style dangerouslySetInnerHTML={{ __html: overrideCss }} />
        <SiteNav name={resumeData.person.name} />
        <div className="sheet-frame">{children}</div>
        {/* Dialogs portal here rather than to <body>, so the palette tokens scoped to .bp reach them. */}
        <div data-sheet-portal="" />
        {motion.syncAnimations && <AnimationSync />}
        {motion.smoothScroll && <SmoothScroll />}
        <StudioLink />
      </div>
    </ThemeProvider>
  );
}
