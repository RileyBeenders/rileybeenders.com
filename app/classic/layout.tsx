import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { RelocationBadge } from "@/components/RelocationBadge";
import "../globals.css";

export const metadata: Metadata = {
  title: "Riley Beenders | Classic design",
  description: "The previous dark design for rileybeenders.com, kept for reference."
};

/**
 * The design the site ran before Blueprint Press. Its stylesheet and chrome
 * load only under /classic, so nothing here reaches the live site.
 */
export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="classic">
      <SiteHeader />
      {children}
      <RelocationBadge />
    </div>
  );
}
