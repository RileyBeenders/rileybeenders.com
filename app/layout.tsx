import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SiteAnalytics from "@/components/SiteAnalytics";
import homePage from "@/data/home/page.json";
import header from "@/data/header.json";
import "./base.css";

// The mode a first-time visitor sees (Studio: Site Settings → Overall theme →
// Default mode). "system" follows the device; a saved toggle always wins.
const rawDefaultMode = (header.theme as { defaultMode?: string }).defaultMode;
const DEFAULT_MODE = rawDefaultMode === "light" || rawDefaultMode === "system" ? rawDefaultMode : "dark";

// Runs before hydration so the correct theme is on <html> for first paint —
// otherwise the page would flash the wrong mode before React mounts and applies it.
const THEME_INIT_SCRIPT = `(function(){var t="${DEFAULT_MODE}";try{var s=localStorage.getItem("theme");if(s==="light"||s==="dark"){t=s;}else if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}}catch(e){if(t==="system")t="dark";}document.documentElement.setAttribute("data-theme",t);})();`;

// The home page's tab title, description and share title, edited in the Studio (Home page → Browser tab).
const TITLE = homePage.meta.title;
const DESCRIPTION = homePage.meta.description;
const SHARE_TITLE = homePage.meta.shareTitle;

export const metadata: Metadata = {
  // Required for the generated opengraph-image to be emitted as an absolute
  // URL. Crawlers reject relative og:image values.
  metadataBase: new URL("https://rileybeenders.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: header.person.name,
    url: "https://rileybeenders.com",
    title: SHARE_TITLE,
    description: DESCRIPTION
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: DESCRIPTION
  }
};

/** Shell only — chrome and styling live in the app/(site) layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
        {children}
        <SiteAnalytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
