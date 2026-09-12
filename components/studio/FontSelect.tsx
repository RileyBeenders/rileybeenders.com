"use client";

import { FONT_OPTIONS } from "@/lib/fonts";
import type { FontId } from "@/types/studio";

export function FontSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: FontId;
  onChange: (id: FontId) => void;
}) {
  const selected = FONT_OPTIONS.find((option) => option.id === value);

  return (
    <div className="studio-field">
      <label>{label}</label>
      <select className="studio-select" value={value} onChange={(event) => onChange(event.target.value as FontId)}>
        {FONT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {selected && <p className="studio-field-hint">{selected.mood}</p>}
    </div>
  );
}
