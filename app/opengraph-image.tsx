import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Riley Beenders' Professional Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#0b1a2b";
const BLUE = "#2f86c4";
const ACCENT = "#e3342f";
const PAPER = "#fbfbf9";

/**
 * The blueprint grid, as a data URI. Satori does not handle
 * repeating-linear-gradient, so the ruling is drawn with an SVG <pattern>.
 */
const grid = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
     <defs>
       <pattern id="fine" width="16" height="16" patternUnits="userSpaceOnUse">
         <path d="M16 0H0V16" fill="none" stroke="rgba(11,26,43,0.055)" stroke-width="1"/>
       </pattern>
       <pattern id="coarse" width="96" height="96" patternUnits="userSpaceOnUse">
         <path d="M96 0H0V96" fill="none" stroke="rgba(11,26,43,0.1)" stroke-width="1"/>
       </pattern>
     </defs>
     <rect width="1200" height="630" fill="url(#fine)"/>
     <rect width="1200" height="630" fill="url(#coarse)"/>
   </svg>`
).toString("base64")}`;

/**
 * The mark's stem and its one continuous flowing bowl, oversized as a
 * watermark. Sized and placed so the whole letterform sits inside the frame
 * and its stem falls behind the end of the headline rather than beside it.
 */
const GHOST = { width: 512, height: 640, top: -4, right: 148 };

const ghostB = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="${GHOST.width}" height="${GHOST.height}">
     <g fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.14">
       <path d="M40 18v214"/>
       <path d="M40 18c72 0 108 18 108 45 0 26-36 44-108 44 82 0 121 19 121 46 0 25-39 45-121 45"/>
     </g>
   </svg>`
).toString("base64")}`;

export default async function OpengraphImage() {
  const instrumentSerif = fs.readFileSync(
    path.join(process.cwd(), "assets/fonts/InstrumentSerif-Regular.ttf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          backgroundColor: PAPER,
          padding: "0 84px"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={grid} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0 }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ghostB}
          width={GHOST.width}
          height={GHOST.height}
          alt=""
          style={{ position: "absolute", top: GHOST.top, right: GHOST.right }}
        />

        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 7,
              color: ACCENT,
              fontFamily: "Instrument Serif"
            }}
          >
            R&amp;D · ELECTROMECHANICAL · AUTOMATION
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 26,
              fontFamily: "Instrument Serif",
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: INK
            }}
          >
            <div style={{ display: "flex" }}>Riley Beenders&rsquo;</div>
            <div style={{ display: "flex" }}>Professional Portfolio</div>
          </div>

          <div style={{ display: "flex", width: 660, height: 3, backgroundColor: INK, marginTop: 40 }} />

          <div
            style={{
              display: "flex",
              marginTop: 26,
              fontSize: 30,
              letterSpacing: 1,
              color: BLUE,
              fontFamily: "Instrument Serif"
            }}
          >
            rileybeenders.com &nbsp;·&nbsp; Bethlehem, PA
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Instrument Serif", data: instrumentSerif, style: "normal", weight: 400 }]
    }
  );
}
