"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className={`flex items-center justify-center w-9 h-9 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors ${className}`}
    >
      {theme === "dark"
        ? <Sun className="w-4 h-4 text-amber-400" />
        : <Moon className="w-4 h-4 text-stone-500" />}
    </button>
  );
}
