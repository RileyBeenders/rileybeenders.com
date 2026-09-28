import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import homePage from "@/data/home/page.json";
import header from "@/data/header.json";
import "./base.css";

// Runs before hydration so the correct theme is on <html> for first paint —
// otherwise the page would flash light before React mounts and applies it.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
