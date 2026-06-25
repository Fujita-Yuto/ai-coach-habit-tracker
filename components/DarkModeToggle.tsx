"use client";

import { useTheme } from "./ThemeProvider";

export default function DarkModeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="ダークモード切替"
      className="rounded-lg p-1.5 text-lg leading-none text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
