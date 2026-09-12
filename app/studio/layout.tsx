import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StudioNav } from "@/components/studio/StudioNav";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio | Riley Beenders",
  robots: { index: false, follow: false }
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio">
      <aside className="studio-sidebar">
        <Link href="/studio" className="studio-brand">
          <span className="studio-brand-badge" aria-hidden="true">S</span>
          Studio
        </Link>
        <StudioNav />
        <div className="studio-sidebar-footer">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            View live site <ExternalLink size={12} strokeWidth={2} aria-hidden="true" />
          </Link>
        </div>
      </aside>
      <main className="studio-main">{children}</main>
    </div>
  );
}
