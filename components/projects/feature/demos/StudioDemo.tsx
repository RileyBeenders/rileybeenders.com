"use client";

import { useState } from "react";
import { useTheme } from "@/components/blueprint/ThemeProvider";
import { DEFAULT_PALETTE, PRESET_PALETTES, getPreset } from "@/lib/palettes";

const RAIL = ["Summary", "Experience", "Projects", "Site Settings"];

/**
 * A miniature of the Studio beside a miniature of the site. The palette row
 * is the Studio's real preset list (lib/palettes.ts), and picking one
 * recolors the preview from that preset's tokens for the visitor's current
 * light/dark mode — the same swap the real Studio makes site-wide. The
 * "Open to relocation" switch shows and hides the preview's badge, and the
 * Saved / Unsaved / Saving status follows the Studio's own three states.
 */
export function StudioDemo({ initialPaletteId }: { initialPaletteId: string }) {
  const { theme } = useTheme();
  const [paletteId, setPaletteId] = useState(getPreset(initialPaletteId) ? initialPaletteId : DEFAULT_PALETTE.id);
  const [badge, setBadge] = useState(true);
  const [status, setStatus] = useState<"saved" | "dirty" | "saving">("saved");

  const palette = getPreset(paletteId) ?? DEFAULT_PALETTE;
  const tokens = palette.modes[theme];

  const change = (apply: () => void) => {
    apply();
    setStatus("dirty");
  };
  const save = () => {
    setStatus("saving");
    setTimeout(() => setStatus("saved"), 650);
  };

  const previewVars = {
    ["--p-paper" as string]: tokens.paper,
    ["--p-white" as string]: tokens.white,
    ["--p-ink" as string]: tokens.ink,
    ["--p-muted" as string]: tokens.muted,
    ["--p-rule" as string]: tokens.rule,
    ["--p-accent" as string]: tokens.accent
  };

  return (
    <div className="dm dm-studio">
      <div className="dm-studio-window" role="group" aria-label="A miniature of the Studio editor">
        <div className="dm-studio-bar">
          <span className="dm-studio-brand">Studio</span>
          <span className="dm-studio-file">data/header.json</span>
          <span className={`dm-studio-status is-${status}`} aria-live="polite">
            {status === "saved" ? "Saved" : status === "dirty" ? "Unsaved changes" : "Saving…"}
          </span>
          <button type="button" className="dm-studio-save" onClick={save} disabled={status !== "dirty"}>
            Save
          </button>
        </div>
        <div className="dm-studio-body">
          <ul className="dm-studio-rail" aria-hidden="true">
            {RAIL.map((item) => (
              <li key={item} className={item === "Site Settings" ? "is-active" : ""}>{item}</li>
            ))}
          </ul>
          <div className="dm-studio-form">
            <p className="dm-label" id="dm-palette-label">Palette</p>
            <div className="dm-swatches" role="radiogroup" aria-labelledby="dm-palette-label">
              {PRESET_PALETTES.map((preset) => {
                const t = preset.modes[theme];
                return (
                  <button
                    key={preset.id}
                    type="button"
                    role="radio"
                    aria-checked={preset.id === paletteId}
                    aria-label={preset.name}
                    title={preset.name}
                    className={`dm-swatch${preset.id === paletteId ? " is-on" : ""}`}
                    style={{ ["--sw-paper" as string]: t.paper, ["--sw-ink" as string]: t.ink, ["--sw-accent" as string]: t.accent }}
                    onClick={() => change(() => setPaletteId(preset.id))}
                  >
                    <span className="dm-swatch-ink" />
                    <span className="dm-swatch-accent" />
                  </button>
                );
              })}
            </div>
            <p className="dm-swatch-name">{palette.name}</p>

            <div className="dm-switch-row">
              <span id="dm-badge-label">“Open to relocation” badge</span>
              <button
                type="button"
                role="switch"
                aria-checked={badge}
                aria-labelledby="dm-badge-label"
                className="dm-switch"
                onClick={() => change(() => setBadge((value) => !value))}
              >
                <span className="dm-switch-thumb" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dm-studio-preview" style={previewVars} aria-hidden="true">
        <div className="dm-prev-nav">
          <span className="dm-prev-mark" />
          <span className="dm-prev-links"><i /><i /><i /><i /></span>
        </div>
        <p className="dm-prev-name">Riley<br />Beenders</p>
        <span className="dm-prev-rule" />
        <div className="dm-prev-actions">
          <span className="dm-prev-btn dm-prev-btn--solid">Download PDF</span>
          <span className="dm-prev-btn">Email</span>
        </div>
        <span className={`dm-prev-badge${badge ? " is-on" : ""}`}>Open to relocation</span>
      </div>
    </div>
  );
}
