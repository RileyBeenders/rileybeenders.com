"use client";

import type { CSSProperties } from "react";
import { fontVarExpression } from "@/lib/fonts";
import { tokensToCssVars } from "@/lib/palette";
import { resolveThemeTokens } from "@/lib/studio-theme";
import type { StudioSettings } from "@/types/studio";

export function ThemePreview({
  theme,
  fonts,
  mode
}: {
  theme: StudioSettings["theme"];
  fonts: StudioSettings["fonts"];
  mode: "light" | "dark";
}) {
  const tokens = resolveThemeTokens(theme)[mode];

  const style = {
    ...tokensToCssVars(tokens),
    "--bp-font-header": fontVarExpression(fonts.header),
    "--bp-font-subheader": fontVarExpression(fonts.subheader),
    "--bp-font-body": fontVarExpression(fonts.body),
    minHeight: 0,
    backgroundAttachment: "scroll",
    padding: "28px 26px"
  } as CSSProperties;

  return (
    <div className="bp" style={style}>
      <p className="bp-eyebrow">Selected Work</p>
      <h1 style={{ fontSize: 32, marginTop: 8 }}>Riley Beenders</h1>
      <h2 style={{ fontSize: 20, marginTop: 14 }}>A section sub-header</h2>
      <p className="bp-prose" style={{ fontSize: 15, marginTop: 10 }}>
        Body copy renders in the chosen typeface on the chosen palette, so you can see the
        pairing before saving it.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
        <span className="bp-pill">React</span>
        <span className="bp-pill">LabVIEW</span>
        <a className="bp-link" href="#" onClick={(event) => event.preventDefault()}>
          View project <span className="bp-arrow">→</span>
        </a>
      </div>
    </div>
  );
}
