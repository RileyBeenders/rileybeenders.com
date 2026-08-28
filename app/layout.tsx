import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./base.css";

export const metadata: Metadata = {
  title: "Riley Beenders | R&D, Electromechanical and Automation Engineer",
  description:
    "R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation."
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
