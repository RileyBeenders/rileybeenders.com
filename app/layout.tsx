import type { Metadata } from "next";
import resumeData from "@/data/resumeData";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const siteData = resumeData;
const isComingSoon = siteData.siteMode === "coming-soon" && Boolean(siteData.comingSoon);

export const metadata: Metadata = {
  title: isComingSoon
    ? `${siteData.comingSoon?.headline ?? siteData.person.name} | Coming Soon`
    : `Riley Beenders | Exploring, Building, Improving`,
  description: isComingSoon
    ? siteData.comingSoon?.summary ?? siteData.summary
    : "R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
