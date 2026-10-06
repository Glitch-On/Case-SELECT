import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import { PixelBadge } from "../components/pixel/PixelBadge.jsx";
import { PixelButton } from "../components/pixel/PixelButton.jsx";
import { PixelPanel } from "../components/pixel/PixelPanel.jsx";
import { ProgressBar } from "../components/pixel/ProgressBar.jsx";
import { Terminal } from "../components/pixel/Terminal.jsx";
import { ThemeToggle } from "../components/pixel/ThemeToggle.jsx";
import { ErrorState, LoadingState } from "../components/pixel/States.jsx";
import { getCaseMeta } from "../data/caseMeta.js";
import { ResultTable } from "../components/pixel/ResultTable.jsx";
import { CulpritSubmit } from "../components/pixel/CulpritSubmit.jsx";

/**
 * Investigation screen for a single case.
 *
 * Layout follows the game-screen reference: scene on the left, case briefing
 * and SQL input stacked on the right, with settings / map / move controls and
 * culprit submission below.
 *
 * Scope note: this component renders and submits UI only. It does not implement
 * movement, map data, hint text or culprit validation — those are game logic and
 * live with the game team (see SUGGESTED_IMPROVEMENTS.md).
 */
export function GameScreen() {
  const { caseId } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [showSceneCanvas, setShowSceneCanvas] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [caseRow, stepRows] = await Promise.all([
          api.cases.get(caseId),
          api.cases.getSteps(caseId),
        ]);

        if (cancelled) return;

        setCaseData(caseRow);
        setSteps(Array.isArray(stepRows) ? stepRows : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load this case.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const meta = getCaseMeta(caseId);

  /** Evidence the backend has attached to the case's steps. */
  const evidence = useMemo(() => {
    const seen = new Map();
    for (const step of steps) {
      if (step.evidence) seen.set(step.evidence.id, step.evidence);
    }
    return Array.from(seen.values());
  }, [steps]);

  /** Distinct locations referenced by the case flow. */
  const locations = useMemo(() => {
    const seen = new Map();
    for (const step of steps) {
      if (step.location) seen.set(step.location.id, step.location);
    }
    return Array.from(seen.values());
  }, [steps]);

  /** The step that gates the next query, i.e. what the SQL box is asking for. */
  const activeQuery = useMemo(
    () => steps.find((step) => step.query && step.sequenceId === 1)?.query ?? null,
    [steps],
  );

  const openTerminal = useCallback(() => setTerminalOpen(true), []);

  if (loading) {
    return <LoadingState message={`LOADING CASE ${caseId}...`} />;
  }

  if (error) {
    return (
      <ErrorState
        title="CASE DATA UNAVAILABLE"
        message={error}
        actionLabel="RETRY"
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!caseData) {
    return <ErrorState title="CASE DATA UNAVAILABLE" message="The API returned no case." />;
  }

  return (
    <div className="game-screen">
      <header className="game-bar">
        <Link className="game-bar__back" to="/">
          ← Case Files
        </Link>

        <div>
          <h1 className="game-bar__title">
            #{caseData.id} {caseData.caseName}
          </h1>
        </div>

        <div className="game-bar__actions">
          <PixelButton variant="primary" size="sm" onClick={openTerminal}>
            ▤ SQL Terminal
          </PixelButton>
          <ThemeToggle />
        </div>
      </header>

      <div className="game-layout">
        {/* ── Left: scene + controls ── */}
        <div className="game-layout__left">
          <PixelPanel variant="flush">
            <div className="pixel-panel__header">
              <span>Scene</span>
              <PixelBadge tone="info">{meta.difficulty}</PixelBadge>
            </div>

            <div className="scene">
              <div className="scene__grid" aria-hidden="true" />

              {showSceneCanvas ? (
                <SceneCanvasHost />
              ) : (
                <div className="scene__inner">
                  <div className="scene__glyph" aria-hidden="true">
                    🕵
                  </div>
                  <p className="scene__label">Investigation Scene</p>
                  <p className="scene__hint">
                    {locations.length > 0
                      ? locations.map((location) => location.locationName).join(" · ")
                      : "No locations recorded for this case yet."}
                  </p>

                  <div style={{ marginTop: "1rem" }}>
                    <PixelButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSceneCanvas(true)}
                    >
                      Load interactive scene
                    </PixelButton>
                  </div>
                </div>
              )}
            </div>
          </PixelPanel>

          <PixelPanel title="Scene Controls">
            <div className="control-strip">
              <PixelButton variant="ghost" size="sm" disabled title="Movement requires game-state logic (see SUGGESTED_IMPROVEMENTS.md)">
                ⬆ Move
              </PixelButton>
              <PixelButton variant="ghost" size="sm" disabled title="Map data requires a backend endpoint (see SUGGESTED_IMPROVEMENTS.md)">
                ⊞ Map
              </PixelButton>
              <PixelButton variant="ghost" size="sm" disabled title="Hints are game logic (see SUGGESTED_IMPROVEMENTS.md)">
                ? Hint
              </PixelButton>
              <PixelButton variant="ghost" size="sm" onClick={openTerminal}>
                ▤ Menu
              </PixelButton>
            </div>

            <p className="label" style={{ marginTop: "0.75rem" }}>
              Controls marked as unavailable need backend game state before they can
              do anything.
            </p>
          </PixelPanel>

          <PixelPanel title={`Evidence Log (${evidence.length})`}>
            {evidence.length === 0 ? (
              <p className="text-muted">
                No evidence recorded yet. Interrogate the database to uncover clues.
              </p>
            ) : (
              <ul className="evidence-list">
                {evidence.map((item) => (
                  <li key={item.id} className="evidence-list__item">
                    <span className="evidence-list__id">{item.id}</span>
                    <span>{item.evidenceName}</span>
                  </li>
                ))}
              </ul>
            )}
          </PixelPanel>
        </div>

        {/* ── Right: briefing + SQL ── */}
        <div className="game-layout__right">
          <PixelPanel title="Case Briefing">
            <p className="text-secondary">{meta.description}</p>

            <div style={{ marginTop: "1rem" }}>
              <span className="label">Investigation Progress</span>
              <ProgressBar
                value={steps.length > 0 ? 1 : 0}
                max={steps.length || 1}
                tone="warning"
                showLabel
                label={`${steps.length} step(s) on file`}
              />
            </div>
          </PixelPanel>

          <PixelPanel title="SQL Terminal">
            <SqlConsole caseId={caseId} activeQuery={activeQuery} onOpenTerminal={openTerminal} />
          </PixelPanel>

          <PixelPanel title="Accuse a Suspect">
            <CulpritSubmit caseId={caseId} />
          </PixelPanel>
        </div>
      </div>

      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
}

/**
 * Inline SQL console for the current query step.
 *
 * Runs through the existing player-query endpoint. Whether an answer is
 * "correct" is decided by game logic on the backend; this endpoint returns rows
 * only, so the UI reports what came back and nothing more.
 */
function SqlConsole({ caseId, activeQuery, onOpenTerminal }) {
  const [sql, setSql] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    if (!sql.trim()) return;

    setRunning(true);
    setError(null);
    setResult(null);

    try {
      // Without a query step we still allow exploratory SELECTs; the backend
      // scopes this to read-only statements.
      const queryId = activeQuery?.id ?? `${caseId}-explore`;
      const outcome = await api.queries.execute(queryId, sql);
      setResult(outcome);
    } catch (err) {
      setError(err.message || "Query failed.");
    } finally {
      setRunning(false);
    }
  }, [sql, activeQuery, caseId]);

  return (
    <>
      <p className="text-secondary" style={{ marginBottom: "0.75rem" }}>
        {activeQuery?.queryOutput
          ? `Objective: determine "${activeQuery.queryOutput}".`
          : "Explore the case database with your own SELECT statements."}
      </p>

      <label className="visually-hidden" htmlFor="game-sql">
        SQL query
      </label>
      <textarea
        id="game-sql"
        className="sql-input"
        value={sql}
        onChange={(event) => setSql(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            run();
          }
        }}
        spellCheck={false}
        placeholder={"SELECT * FROM guests\nWHERE is_suspect = true;"}
      />

      <div className="sql-actions">
        <PixelButton variant="primary" onClick={run} disabled={running || !sql.trim()}>
          {running ? "RUNNING..." : "▶ RUN"}
        </PixelButton>

        <PixelButton variant="ghost" onClick={onOpenTerminal}>
          ▤ Full IDE
        </PixelButton>
      </div>

      {error ? (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="sql-result">
          <p className="notice notice--info">
            {result.rowCount} row{result.rowCount === 1 ? "" : "s"} returned.
          </p>
          <ResultTable columns={result.columns} rows={result.rows} />
        </div>
      ) : null}
    </>
  );
}

/**
 * Mounts the existing Phaser game inside the scene frame.
 *
 * The Phaser component owns its own keyboard input and hardcodes case C001 in
 * its data fetch, so it is loaded on demand rather than by default. It is
 * imported dynamically to keep it out of the dashboard's initial bundle.
 */
function SceneCanvasHost() {
  const [Game, setGame] = useState(null);

  useEffect(() => {
    let cancelled = false;

    import("../game/Game.jsx")
      .then((module) => {
        if (!cancelled) setGame(() => module.default);
      })
      .catch(() => {
        // Leave the placeholder in place if the scene fails to load.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!Game) {
    return <LoadingState message="LOADING SCENE..." />;
  }

  return (
    <div className="scene__canvas-host">
      <Game />
    </div>
  );
}
