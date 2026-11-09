import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import homePage from "@/data/home/page.json";
import header from "@/data/header.json";

// The Home page's share title, set on two lines (its first word, then the rest),
// with straight apostrophes turned typographic as the serif expects. The card is
// set in Instrument Serif, the monogram's face and the one font file the repo ships.
const SHARE_TITLE = homePage.meta.shareTitle;
const [TITLE_FIRST, ...TITLE_REST] = SHARE_TITLE.replace(/'/g, "’").split(" ");

export const alt = SHARE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#111318";
const BLUE = "#2457e6";
const PAPER = "#f4f5f8";
const TILE = "#ffffff";
const LINE = "rgba(17, 19, 24, 0.09)";

/**
 * The bench's bloom: two soft blue washes behind the tile, as a data URI.
 * Satori's gradient support is partial, so the bloom is an SVG.
 */
const bloom = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
     <defs>
       <radialGradient id="a" cx="22%" cy="18%" r="42%"><stop offset="0" stop-color="#cfdafa"/><stop offset="1" stop-color="#cfdafa" stop-opacity="0"/></radialGradient>
       <radialGradient id="b" cx="82%" cy="12%" r="38%"><stop offset="0" stop-color="#d3dcf5"/><stop offset="1" stop-color="#d3dcf5" stop-opacity="0"/></radialGradient>
     </defs>
     <rect width="1200" height="630" fill="${PAPER}"/>
     <rect width="1200" height="630" fill="url(#a)"/>
     <rect width="1200" height="630" fill="url(#b)"/>
   </svg>`
).toString("base64")}`;

/**
 * Just the two flowing bowls of the mark — no stem — oversized as a
 * watermark and placed so the curves sit behind the end of the headline.
 */
const GHOST = { width: 380, height: 580, top: 20, right: 190 };

const ghostB = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 165 250" width="${GHOST.width}" height="${GHOST.height}">
     <path d="M5 18c72 0 108 18 108 45 0 26-36 44-108 44 82 0 121 19 121 46 0 25-39 45-121 45"
           fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" opacity="0.14"/>
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
          padding: "48px"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bloom} width={1200} height={630} alt="" style={{ position: "absolute", top: 0, left: 0 }} />

        {/* The tile: the share card is one bench tile. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
            width: "100%",
            height: "100%",
            padding: "0 72px",
            borderRadius: 28,
            border: `1px solid ${LINE}`,
            backgroundColor: TILE,
            overflow: "hidden"
          }}
        >
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
              flexDirection: "column",
              fontFamily: "Instrument Serif",
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: INK
            }}
          >
            <div style={{ display: "flex" }}>{TITLE_FIRST}</div>
            {TITLE_REST.length > 0 && <div style={{ display: "flex" }}>{TITLE_REST.join(" ")}</div>}
          </div>

          <div style={{ display: "flex", width: 56, height: 4, borderRadius: 4, backgroundColor: BLUE, marginTop: 36 }} />

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
            {homePage.footer.siteLink.text} &nbsp;·&nbsp; {header.person.location}
          </div>
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
