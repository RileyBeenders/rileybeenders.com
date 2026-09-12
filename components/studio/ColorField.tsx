"use client";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function ColorField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="studio-color-field">
      <label>{label}</label>
      <div className="studio-color-input-row">
        <input
          type="color"
          className="studio-color-swatch-input"
          value={HEX_RE.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          className="studio-color-hex-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          maxLength={7}
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  );
}
