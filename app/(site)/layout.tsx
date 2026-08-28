import type { Metadata } from "next";
import { Instrument_Serif, Spectral } from "next/font/google";
import { BpNav } from "@/components/blueprint/BpNav";
import "./blueprint.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--bp-font-display",
  display: "swap"
});

const body = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--bp-font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Riley Beenders | R&D, Electromechanical and Automation Engineer",
  description:
    "R&D and electromechanical engineer focused on product development, manufacturing, automation, and practical innovation."
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`bp ${display.variable} ${body.variable}`}>
      <BpNav />
      {children}
      <div className="bp-badge">
        <span className="bp-badge-dot" aria-hidden="true" />
        Open to relocation
      </div>
    </div>
  );
}
