import type { CSSProperties } from "react";

const draw = (len: number, delay: number): CSSProperties =>
  ({ "--len": len, "--delay": `${delay}s` } as CSSProperties);

/**
 * The band across the top of the hero card: a sheet of construction lines
 * drawn in the sheet's blue, the way a drawing starts. A fine grid, a
 * centred circle with its centre marks, a dimension line, two section
 * arcs and a run of tick marks, each stroke drawing itself on in order.
 * Pure SVG and CSS; reduced motion shows it complete.
 */
export function HeroCover({ label }: { label: string }) {
  return (
    <div className="hero-cover" aria-hidden="true">
      <svg viewBox="0 0 1200 250" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <pattern id="hero-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0H0V25" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
          </pattern>
          <pattern id="hero-grid-coarse" width="125" height="125" patternUnits="userSpaceOnUse">
            <path d="M125 0H0V125" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
          </pattern>
          <radialGradient id="hero-fade" cx="50%" cy="40%" r="70%">
            <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="250" fill="url(#hero-grid)" />
        <rect width="1200" height="250" fill="url(#hero-grid-coarse)" />
        <rect width="1200" height="250" fill="url(#hero-fade)" />

        <g stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round">
          {/* The main circle and its centre marks */}
          <circle className="draw" cx="860" cy="125" r="86" style={draw(541, 0.2)} />
          <circle className="draw" cx="860" cy="125" r="58" strokeDasharray="6 8" style={draw(365, 0.6)} />
          <path className="draw" d="M860 20v210M755 125h210" strokeWidth="1" style={draw(420, 0.5)} />
          {/* Section arcs */}
          <path className="draw" d="M300 220 A150 150 0 0 1 450 70" style={draw(236, 0.9)} />
          <path className="draw" d="M330 220 A120 120 0 0 1 450 100" strokeDasharray="4 6" style={draw(189, 1.1)} />
          {/* A dimension line with its arrows */}
          <path className="draw" d="M120 190H460" style={draw(340, 1.0)} />
          <path className="draw" d="M120 182v16M460 182v16M128 186l-8 4 8 4M452 186l8 4-8 4" style={draw(80, 1.5)} />
          {/* Ticks along the bottom */}
          <path
            className="draw"
            d="M560 236v-10M600 236v-6M640 236v-10M680 236v-6M720 236v-10M760 236v-6M800 236v-10"
            style={draw(140, 1.3)}
          />
          {/* A small hex nut, drawn as the last stroke */}
          <path className="draw" d="M1040 60l26 15v30l-26 15-26-15V75z" style={draw(180, 1.6)} />
          <circle className="draw" cx="1040" cy="90" r="9" style={draw(57, 1.9)} />
        </g>
        <g fill="rgba(255,255,255,0.8)" fontFamily="var(--mono), monospace" fontSize="10" letterSpacing="2">
          <text x="120" y="176">Ø 340</text>
          <text x="950" y="50">R 86</text>
          <text x="300" y="60">SEC A-A</text>
        </g>
      </svg>
      <span className="hero-cover-label">{label}</span>
    </div>
  );
}
