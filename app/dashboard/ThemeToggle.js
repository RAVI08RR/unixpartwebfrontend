"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../ThemeContext";

/**
 * Reusable ThemeToggle component.
 * Allows users to switch between Light and Dark mode globally.
 */
export function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-all active:scale-95 group ${className}`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
      )}
    </button>
  );
}
