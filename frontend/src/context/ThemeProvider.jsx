import { useEffect, useMemo, useState } from "react";

import { ThemeContext, THEME_STORAGE_KEY } from "./themeContext.js";

/**
 * Centralised light/dark theme provider.
 *
 * The active theme is written to `data-theme` on <html> so every component —
 * dashboard, game screen and terminal alike — reads the same CSS custom
 * properties from styles/tokens.css. The choice is persisted to localStorage.
 *
 * The app has no authentication yet, so nothing here is per-user.
 * See SUGGESTED_IMPROVEMENTS.md.
 */

function readInitialTheme() {
  if (typeof window === "undefined") return "dark";

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage blocked (private mode): fall through to the media query.
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  }

  return "dark";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persistence is best-effort; the theme still applies this session.
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === "dark",
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
