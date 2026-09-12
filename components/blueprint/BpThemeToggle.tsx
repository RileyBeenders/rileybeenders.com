"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/blueprint/ThemeProvider";

export function BpThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="bp-theme-toggle"
      onClick={toggleTheme}
    >
      <span className="bp-theme-toggle-thumb" aria-hidden="true">
        {isDark ? <Moon size={12} strokeWidth={2} /> : <Sun size={12} strokeWidth={2} />}
      </span>
    </button>
  );
}
