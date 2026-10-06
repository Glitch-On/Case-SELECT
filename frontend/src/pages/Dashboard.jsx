import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { DEMO_USER_ID, api } from "../api/client.js";
import { CaseCard } from "../components/pixel/CaseCard.jsx";
import { PixelBadge } from "../components/pixel/PixelBadge.jsx";
import { PixelButton } from "../components/pixel/PixelButton.jsx";
import { PixelPanel } from "../components/pixel/PixelPanel.jsx";
import { Sidebar } from "../components/pixel/Sidebar.jsx";
import { StatCard } from "../components/pixel/StatCard.jsx";
import { EmptyState, ErrorState, LoadingState } from "../components/pixel/States.jsx";
import { CASE_STATUS, getCaseMeta, resolveCaseStatus } from "../data/caseMeta.js";

/**
 * Detective dashboard — the entry point of the game.
 *
 * Everything shown here comes from the backend:
 *   - cases    → GET /api/cases
 *   - progress → GET /api/users/:id/progress
 *
 * The frontend only *presents* status; it does not decide progression. See
 * SUGGESTED_IMPROVEMENTS.md for the player-stat and lock/unlock data the
 * dashboard would rather read from the API.
 */
export function Dashboard() {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Fetches both dashboard reads. Never touches state itself, so callers stay in control. */
  const fetchData = useCallback(async () => {
    const [caseRows, progressRows] = await Promise.all([
      api.cases.list(),
      api.users.progress(DEMO_USER_ID),
    ]);

    return {
      cases: Array.isArray(caseRows) ? caseRows : [],
      progress: Array.isArray(progressRows) ? progressRows : [],
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    fetchData()
      .then((data) => {
        if (cancelled) return;
        setCases(data.cases);
        setProgress(data.progress);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load case files.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  /** Manual retry / refresh, triggered by a click rather than on mount. */
  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchData()
      .then((data) => {
        setCases(data.cases);
        setProgress(data.progress);
      })
      .catch((err) => setError(err.message || "Could not load case files."))
      .finally(() => setLoading(false));
  }, [fetchData]);

  const progressByCase = useMemo(() => {
    const map = new Map();
    progress.forEach((row) => map.set(row.caseId, row));
    return map;
  }, [progress]);

  /**
   * Headline numbers, all derived from data the backend returned.
   *
   * XP / level / evidence counters have no columns in the schema yet, so they
   * are deliberately shown as unavailable rather than invented.
   */
  const stats = useMemo(() => {
    const counts = {
      completed: 0,
      inProgress: 0,
      notStarted: 0,
      locked: 0,
    };

    for (const item of cases) {
      const meta = getCaseMeta(item.id);
      const status = resolveCaseStatus(item.id, progressByCase.get(item.id), meta);

      if (status === CASE_STATUS.COMPLETED) counts.completed += 1;
      else if (status === CASE_STATUS.IN_PROGRESS) counts.inProgress += 1;
      else if (status === CASE_STATUS.LOCKED) counts.locked += 1;
      else counts.notStarted += 1;
    }

    return counts;
  }, [cases, progressByCase]);

  const openCase = useCallback(
    (caseId) => {
      navigate(`/game/${caseId}`);
    },
    [navigate],
  );

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard__main">
        <header className="topbar">
          <h1 className="topbar__title">DETECTIVE DASHBOARD</h1>

          <div className="topbar__meta">
            <span className="player-chip">
              <span aria-hidden="true">👤</span>
              <span>Detective #{DEMO_USER_ID}</span>
            </span>

            <PixelButton
              variant="ghost"
              size="sm"
              onClick={refresh}
              disabled={loading}
              aria-label="Refresh case files"
            >
              ⟳ Refresh
            </PixelButton>
          </div>
        </header>

        <div className="dashboard__content">
          <PixelPanel variant="elevated" title="Case Statistics">
            <div className="stat-grid">
              <StatCard
                label="Cases Completed"
                value={stats.completed}
                icon="✓"
                tone="success"
              />
              <StatCard
                label="In Progress"
                value={stats.inProgress}
                icon="►"
                tone="warning"
              />
              <StatCard label="Not Started" value={stats.notStarted} icon="○" />
              <StatCard label="Locked" value={stats.locked} icon="🔒" tone="danger" />
              <StatCard label="Total Cases" value={cases.length} icon="🗂" tone="info" />
            </div>
          </PixelPanel>

          <div className="dashboard__section-head">
            <h2 className="section-title">CASE FILES</h2>

            {!loading && !error && cases.length > 0 ? (
              <span className="label">{cases.length} on file</span>
            ) : null}
          </div>

          {loading ? (
            <LoadingState message="LOADING CASE FILES..." />
          ) : error ? (
            <ErrorState
              title="DATABASE OFFLINE"
              message={error}
              actionLabel="RETRY"
              onRetry={refresh}
            />
          ) : cases.length === 0 ? (
            <EmptyState
              title="NO CASE FILES AVAILABLE"
              message="The API returned no cases. Load the seed data to populate the case list."
              action={
                <PixelButton variant="ghost" onClick={refresh}>
                  ⟳ Retry
                </PixelButton>
              }
            />
          ) : (
            <div className="case-grid">
              {cases.map((item) => (
                <CaseCard
                  key={item.id}
                  caseData={item}
                  progress={progressByCase.get(item.id)}
                  meta={getCaseMeta(item.id)}
                  onOpen={openCase}
                />
              ))}
            </div>
          )}

          <PixelPanel title="Achievements">
            <Achievements cases={cases} progressByCase={progressByCase} />
          </PixelPanel>
        </div>
      </main>
    </div>
  );
}

/**
 * Achievements are earned from data the backend already returns, so no scoring
 * rules are duplicated here. Rank/XP style achievements need new backend data —
 * see SUGGESTED_IMPROVEMENTS.md.
 */
function Achievements({ cases, progressByCase }) {
  const completed = cases.filter((item) => {
    const meta = getCaseMeta(item.id);
    return resolveCaseStatus(item.id, progressByCase.get(item.id), meta) === CASE_STATUS.COMPLETED;
  }).length;

  const started = cases.filter((item) => progressByCase.has(item.id)).length;

  const all = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Open your first case file",
      icon: "👣",
      unlocked: started > 0,
    },
    {
      id: "closing-the-diner",
      name: "Case Closed",
      description: "Complete a case",
      icon: "✓",
      unlocked: completed > 0,
    },
    {
      id: "cold-case",
      name: "Cold Case",
      description: "Complete every case on file",
      icon: "🏆",
      unlocked: cases.length > 0 && completed === cases.length,
    },
  ];

  return (
    <div className="control-strip">
      {all.map((badge) => (
        <PixelBadge
          key={badge.id}
          tone={badge.unlocked ? "success" : "default"}
          icon={badge.icon}
          className={badge.unlocked ? "" : "pixel-badge--locked"}
        >
          {badge.name} — {badge.description}
        </PixelBadge>
      ))}
    </div>
  );
}
