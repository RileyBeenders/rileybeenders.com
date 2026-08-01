import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import resumeData from "@/data/resumeData";
import "./globals.css";

const siteData = resumeData;
const isComingSoon = siteData.siteMode === "coming-soon" && Boolean(siteData.comingSoon);

export const metadata: Metadata = {
  title: isComingSoon
    ? `${siteData.comingSoon?.headline ?? siteData.person.name} | Coming Soon`
    : `${siteData.person.name} | Interactive Resume`,
  description: isComingSoon
    ? siteData.comingSoon?.summary ?? siteData.summary
    : "A resume-shaped portfolio with interactive proof-of-work layers."
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
