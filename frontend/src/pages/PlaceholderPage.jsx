import { Link } from "react-router-dom";

import { PixelPanel } from "../components/pixel/PixelPanel.jsx";

/**
 * Placeholder for dashboard sections that need backend data the game team has
 * not exposed yet (evidence archive, notes, profile).
 *
 * These are real routes so the navigation is honest about where it leads; each
 * one states exactly which endpoint is missing rather than showing fake data.
 */
const SECTIONS = {
  evidence: {
    title: "Evidence Archive",
    icon: "🔍",
    blurb: "Every clue recovered across all cases.",
    needs: "GET /api/evidence — a cross-case list of discovered evidence.",
    spec: "See SUGGESTED_IMPROVEMENTS.md → “Evidence archive endpoint”.",
  },
  notes: {
    title: "Detective Notes",
    icon: "✎",
    blurb: "Your working notes for each investigation.",
    needs: "GET/POST /api/notes — note storage keyed by case and player.",
    spec: "See SUGGESTED_IMPROVEMENTS.md → “Notes persistence”.",
  },
  profile: {
    title: "Profile",
    icon: "☗",
    blurb: "Detective record, rank and case history.",
    needs: "GET /api/users/:id — the player's own record, plus XP and level fields.",
    spec: "See SUGGESTED_IMPROVEMENTS.md → “Player stats and progression”.",
  },
};

export function PlaceholderPage({ section }) {
  const config = SECTIONS[section];

  if (!config) {
    return (
      <div className="dashboard">
        <main className="dashboard__main">
          <div className="dashboard__content">
            <PixelPanel title="Not Found">
              <p className="text-secondary">That page does not exist.</p>
              <p style={{ marginTop: "0.75rem" }}>
                <Link className="pixel-btn pixel-btn--sm" to="/">
                  ← Back to dashboard
                </Link>
              </p>
            </PixelPanel>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <main className="dashboard__main">
        <header className="topbar">
          <h1 className="topbar__title">{config.icon} {config.title.toUpperCase()}</h1>
        </header>

        <div className="dashboard__content">
          <PixelPanel title={config.title}>
            <p className="text-secondary">{config.blurb}</p>

            <p className="notice notice--info" style={{ marginTop: "1rem" }}>
              This screen is not wired up yet. It needs <code>{config.needs}</code>
              <br />
              {config.spec}
            </p>

            <p style={{ marginTop: "1rem" }}>
              <Link className="pixel-btn pixel-btn--sm" to="/">
                ← Back to dashboard
              </Link>
            </p>
          </PixelPanel>
        </div>
      </main>
    </div>
  );
}
