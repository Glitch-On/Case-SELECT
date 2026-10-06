import { NavLink } from "react-router-dom";

import { API_BASE_URL } from "../../api/client.js";
import { ThemeToggle } from "./ThemeToggle.jsx";

/**
 * Dashboard navigation rail.
 *
 * Items link to real routes where one exists. The SQL IDE is served by the
 * backend (not a React route), so it opens in a new tab rather than pretending
 * to be a page we own.
 */
const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "▣", end: true },
  { to: "/cases", label: "Cases", icon: "🗂", end: false },
  { to: "/evidence", label: "Evidence", icon: "🔍", end: false },
  { to: "/notes", label: "Notes", icon: "✎", end: false },
  { to: "/profile", label: "Profile", icon: "☗", end: false },
];

export function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main navigation">
      <div className="sidebar__brand">
        <span className="sidebar__title">CASE-SELECT</span>
        <span className="sidebar__subtitle">Detective Division</span>
      </div>

      <div className="sidebar__nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              isActive ? "sidebar__link sidebar__link--active" : "sidebar__link"
            }
          >
            <span className="sidebar__icon" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}

        {/* The SQL IDE is backend-owned; open it directly. */}
        <a className="sidebar__link" href={`${API_BASE_URL}/`} target="_blank" rel="noreferrer">
          <span className="sidebar__icon" aria-hidden="true">
            ▤
          </span>
          SQL IDE
        </a>
      </div>

      <div className="sidebar__footer">
        <span className="label">Settings</span>
        <div style={{ marginTop: "0.5rem" }}>
          <ThemeToggle showLabel />
        </div>
      </div>
    </nav>
  );
}
