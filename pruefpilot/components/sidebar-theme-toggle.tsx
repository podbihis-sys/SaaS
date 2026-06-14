"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export function SidebarThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.dataset.sidebar === "dark" ? "dark" : "light");
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    document.documentElement.dataset.sidebar = next;
    try {
      localStorage.setItem("pp-sidebar", next);
    } catch {
      // localStorage nicht verfügbar — Auswahl gilt nur für diese Sitzung
    }
  }

  return (
    <div className="flex gap-1 rounded-lg bg-[var(--side-chip-bg)] p-1">
      {(["light", "dark"] as const).map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => apply(t)}
          aria-pressed={theme === t}
          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            theme === t ? "bg-white text-blue-700 shadow-sm" : "text-[color:var(--side-muted)] hover:text-[color:var(--side-hover-fg)]"
          }`}
        >
          {t === "light" ? "Hell" : "Dunkel"}
        </button>
      ))}
    </div>
  );
}
