import { createContext, useContext } from "react";

/**
 * Shared theme context object.
 *
 * Kept in a plain .js module (no JSX) so the provider component and the
 * `useTheme` hook live in separate files — React Fast Refresh only accepts
 * component exports from a component module.
 */
export const ThemeContext = createContext(null);

export const THEME_STORAGE_KEY = "case-select:theme";

/**
 * Reads the current theme.
 *
 * @returns {{ theme: "light" | "dark", isDark: boolean, toggleTheme: () => void, setTheme: (theme: "light" | "dark") => void }}
 */
export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>");
  }

  return context;
}
