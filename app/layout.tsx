import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./base.css";

const TITLE = "Riley Beenders | R&D, Electromechanical and Automation Engineer";
const DESCRIPTION =
  "R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation.";

export const metadata: Metadata = {
  // Required for the generated opengraph-image to be emitted as an absolute
  // URL. Crawlers reject relative og:image values.
  metadataBase: new URL("https://rileybeenders.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "Riley Beenders",
    url: "https://rileybeenders.com",
    title: "Riley's Professional Portfolio",
    description: DESCRIPTION
  },
  twitter: {
    card: "summary_large_image",
    title: "Riley's Professional Portfolio",
    description: DESCRIPTION
  }
};

/** Shell only — chrome and styling live in the app/(site) layout. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
