import type { Metadata } from "next";
import { Instrument_Serif, Spectral } from "next/font/google";
import { V3Nav } from "@/components/v3/V3Nav";
import "./v3.css";

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--v3-font-display",
  display: "swap"
});

const body = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--v3-font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Riley Beenders | Blueprint Press preview",
  description: "Design direction preview — blueprint grid, Swiss palette, editorial typography."
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v3 ${display.variable} ${body.variable}`}>
      <V3Nav />
      {children}
      <div className="v3-badge">
        <span className="v3-badge-dot" aria-hidden="true" />
        Open to relocation
      </div>
    </div>
  );
}
