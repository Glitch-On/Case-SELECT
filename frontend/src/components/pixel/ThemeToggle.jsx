import { useTheme } from "../../context/themeContext.js";

/**
 * Switches the global light/dark theme. Rendered on both the dashboard and the
 * game screen so the choice is reachable everywhere.
 */
export function ThemeToggle({ showLabel = false, className = "" }) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
      {showLabel ? <span>{isDark ? "LIGHT" : "DARK"}</span> : null}
      <span className="visually-hidden">{theme}</span>
    </button>
  );
}
