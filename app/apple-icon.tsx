import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon. Opaque background and no rounded corners of our own —
 * iOS masks the artwork itself, and a transparent icon renders black there.
 */
export default function AppleIcon() {
  const mark = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="132" height="132">
       <circle cx="20" cy="20" r="18.4" fill="none" stroke="#0b1a2b" stroke-width="1.3"/>
       <path d="M13 10.6v18.8" fill="none" stroke="#0b1a2b" stroke-width="2.9" stroke-linecap="round"/>
       <path d="M13 10.6c7.6 0 11.3 1.9 11.3 4.7 0 2.7-3.7 4.6-11.3 4.6 8.6 0 12.7 2 12.7 4.8 0 2.6-4.1 4.7-12.7 4.7"
             fill="none" stroke="#2f86c4" stroke-width="2.9" stroke-linecap="round" stroke-linejoin="round"/>
     </svg>`
  ).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fbfbf9"
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mark} width={132} height={132} alt="" />
      </div>
    ),
    size
  );
}
