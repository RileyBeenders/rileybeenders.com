"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { PRESET_PALETTES } from "@/data/studio/palettes";
import { derivePaletteTokens } from "@/lib/palette";
import { ColorField } from "@/components/studio/ColorField";
import { FontSelect } from "@/components/studio/FontSelect";
import { ThemePreview } from "@/components/studio/ThemePreview";
import { SaveBar } from "@/components/studio/SaveBar";
import type { PaletteId, PaletteSeeds, StudioSettings } from "@/types/studio";

type CustomMode = "light" | "dark";

const PALETTE_CARDS = [
  ...PRESET_PALETTES.map((palette) => ({
    id: palette.id as PaletteId,
    name: palette.name,
    description: palette.description
  }))
];

export function SiteSettingsClient({ initialSettings }: { initialSettings: StudioSettings }) {
  const [settings, setSettings] = useState<StudioSettings>(initialSettings);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("light");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const router = useRouter();

  function selectPalette(id: PaletteId) {
    setSettings((current) => ({ ...current, theme: { ...current.theme, paletteId: id } }));
  }

  function updateCustomSeed(mode: CustomMode, key: keyof PaletteSeeds, value: string) {
    setSettings((current) => ({
      ...current,
      theme: {
        ...current.theme,
        custom: {
          ...current.theme.custom,
          [mode]: { ...current.theme.custom[mode], [key]: value }
        }
      }
    }));
  }

  function updateFont(role: keyof StudioSettings["fonts"], id: StudioSettings["fonts"][typeof role]) {
    setSettings((current) => ({ ...current, fonts: { ...current.fonts, [role]: id } }));
  }

  async function handleSave() {
    setSaving(true);
    setError(false);
    setMessage(null);
    try {
      const response = await fetch("/api/studio-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!response.ok) throw new Error("Request failed");
      const saved: StudioSettings = await response.json();
      setSettings(saved);
      setMessage("Saved — live on the site now.");
      router.refresh();
    } catch {
      setError(true);
      setMessage("Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const customSwatch = derivePaletteTokens(settings.theme.custom.light);
  const isCustom = settings.theme.paletteId === "custom";

  return (
    <>
      <div className="studio-page-head">
        <p className="studio-eyebrow">Studio</p>
        <h1>Site Settings</h1>
        <p>
          Pick an overall color theme and the broad typefaces used across the site — headers,
          sub-headers, and body copy.
        </p>
      </div>

      <div className="studio-panel">
        <h2>Overall theme</h2>
        <p className="studio-panel-desc">
          Nine preset palettes, each with its own light and dark mode, plus a Customization
          option for picking any colors you like.
        </p>
        <div className="studio-palette-grid">
          {PALETTE_CARDS.map((card) => {
            const preset = PRESET_PALETTES.find((p) => p.id === card.id)!;
            const selected = settings.theme.paletteId === card.id;
            return (
              <button
                key={card.id}
                type="button"
                className={selected ? "studio-palette-card is-selected" : "studio-palette-card"}
                onClick={() => selectPalette(card.id)}
              >
                {selected && (
                  <span className="studio-palette-check">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
                <div className="studio-palette-swatches">
                  <span className="studio-swatch" style={{ background: preset.modes.light.paper }} />
                  <span className="studio-swatch" style={{ background: preset.modes.light.ink }} />
                  <span className="studio-swatch" style={{ background: preset.modes.light.accent }} />
                  <span className="studio-swatch" style={{ background: preset.modes.light.blue }} />
                </div>
                <div className="studio-palette-name">{card.name}</div>
                <div className="studio-palette-desc">{card.description}</div>
              </button>
            );
          })}
          <button
            type="button"
            className={isCustom ? "studio-palette-card is-selected" : "studio-palette-card"}
            onClick={() => selectPalette("custom")}
          >
            {isCustom && (
              <span className="studio-palette-check">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
            <div className="studio-palette-swatches">
              <span className="studio-swatch" style={{ background: customSwatch.paper }} />
              <span className="studio-swatch" style={{ background: customSwatch.ink }} />
              <span className="studio-swatch" style={{ background: customSwatch.accent }} />
              <span className="studio-swatch" style={{ background: customSwatch.blue }} />
            </div>
            <div className="studio-palette-name">Customization</div>
            <div className="studio-palette-desc">Pick any colors you like.</div>
          </button>
        </div>

        {isCustom && (
          <div style={{ marginTop: 24 }}>
            <p className="studio-subhead">Light mode colors</p>
            <div className="studio-color-grid">
              <ColorField
                label="Background"
                value={settings.theme.custom.light.paper}
                onChange={(hex) => updateCustomSeed("light", "paper", hex)}
              />
              <ColorField
                label="Surface"
                value={settings.theme.custom.light.white}
                onChange={(hex) => updateCustomSeed("light", "white", hex)}
              />
              <ColorField
                label="Text"
                value={settings.theme.custom.light.ink}
                onChange={(hex) => updateCustomSeed("light", "ink", hex)}
              />
              <ColorField
                label="Accent"
                value={settings.theme.custom.light.accent}
                onChange={(hex) => updateCustomSeed("light", "accent", hex)}
              />
              <ColorField
                label="Secondary accent"
                value={settings.theme.custom.light.blue}
                onChange={(hex) => updateCustomSeed("light", "blue", hex)}
              />
            </div>

            <p className="studio-subhead">Dark mode colors</p>
            <div className="studio-color-grid">
              <ColorField
                label="Background"
                value={settings.theme.custom.dark.paper}
                onChange={(hex) => updateCustomSeed("dark", "paper", hex)}
              />
              <ColorField
                label="Surface"
                value={settings.theme.custom.dark.white}
                onChange={(hex) => updateCustomSeed("dark", "white", hex)}
              />
              <ColorField
                label="Text"
                value={settings.theme.custom.dark.ink}
                onChange={(hex) => updateCustomSeed("dark", "ink", hex)}
              />
              <ColorField
                label="Accent"
                value={settings.theme.custom.dark.accent}
                onChange={(hex) => updateCustomSeed("dark", "accent", hex)}
              />
              <ColorField
                label="Secondary accent"
                value={settings.theme.custom.dark.blue}
                onChange={(hex) => updateCustomSeed("dark", "blue", hex)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="studio-panel">
        <h2>Typography</h2>
        <p className="studio-panel-desc">
          Broad, section-level typefaces — not per-component control. Every option here is
          preloaded, so switching is instant.
        </p>
        <div className="studio-font-grid">
          <FontSelect label="Headers (H1)" value={settings.fonts.header} onChange={(id) => updateFont("header", id)} />
          <FontSelect
            label="Sub-headers (H2/H3)"
            value={settings.fonts.subheader}
            onChange={(id) => updateFont("subheader", id)}
          />
          <FontSelect label="Body copy" value={settings.fonts.body} onChange={(id) => updateFont("body", id)} />
        </div>
      </div>

      <div className="studio-panel">
        <div className="studio-preview-toolbar">
          <h2 style={{ margin: 0 }}>Live preview</h2>
          <div className="studio-preview-toolbar-btns">
            <button
              type="button"
              className={previewMode === "light" ? "studio-chip-btn is-active" : "studio-chip-btn"}
              onClick={() => setPreviewMode("light")}
            >
              Light
            </button>
            <button
              type="button"
              className={previewMode === "dark" ? "studio-chip-btn is-active" : "studio-chip-btn"}
              onClick={() => setPreviewMode("dark")}
            >
              Dark
            </button>
          </div>
        </div>
        <div className="studio-preview-frame">
          <ThemePreview theme={settings.theme} fonts={settings.fonts} mode={previewMode} />
        </div>
      </div>

      <SaveBar saving={saving} message={message} error={error} onSave={handleSave} />
    </>
  );
}
