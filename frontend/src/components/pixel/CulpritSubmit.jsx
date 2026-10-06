import { useState } from "react";

import { PixelButton } from "./PixelButton.jsx";

/**
 * Culprit submission UI.
 *
 * Scope note: this component owns *presentation only*. Deciding whether the
 * named suspect is actually the culprit is game logic and belongs to the game
 * team — the backend currently exposes no culprit/verdict endpoint.
 *
 * The UI therefore attempts the documented contract
 * (`POST /api/cases/:id/submit-culprit`) and reports honestly when the server
 * has no answer, rather than faking a verdict in the browser. The required
 * backend change is specified in SUGGESTED_IMPROVEMENTS.md.
 *
 * There is also no suspects API yet, so the suspect is typed rather than picked
 * from a list. See the same document.
 */
export function CulpritSubmit({ caseId }) {
  const [suspect, setSuspect] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState(null); // { kind, message }
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setConfirming(false);
    setStatus(null);
  }

  async function submit() {
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch(
        `${import.meta.env?.VITE_API_BASE_URL || "http://localhost:3000"}/api/cases/${encodeURIComponent(caseId)}/submit-culprit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspectName: suspect.trim() }),
        },
      );

      if (response.status === 404) {
        setStatus({
          kind: "error",
          message:
            "The backend has no culprit-validation endpoint yet, so this accusation cannot be judged. See SUGGESTED_IMPROVEMENTS.md.",
        });
        return;
      }

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus({
          kind: "error",
          message: payload?.message || `Submission failed (${response.status}).`,
        });
        return;
      }

      setStatus({
        kind: "success",
        message: payload?.message || `Accusation for "${suspect.trim()}" submitted.`,
      });
      setConfirming(false);
    } catch {
      setStatus({
        kind: "error",
        message: "Could not reach the Case-SELECT API. Is the backend running?",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {!confirming ? (
        <>
          <label className="label" htmlFor="culprit-name">
            Suspect
          </label>

          <input
            id="culprit-name"
            className="culprit-select"
            value={suspect}
            onChange={(event) => setSuspect(event.target.value)}
            placeholder="Enter the suspect's name"
            autoComplete="off"
            onKeyDown={(event) => {
              if (event.key === "Enter" && suspect.trim()) setConfirming(true);
            }}
          />

          <PixelButton
            variant="primary"
            block
            style={{ marginTop: "0.75rem" }}
            disabled={!suspect.trim()}
            onClick={() => setConfirming(true)}
          >
            ⚑ Accuse
          </PixelButton>
        </>
      ) : (
        <>
          <p className="notice notice--info">
            Name <strong>{suspect.trim()}</strong> as the culprit of case #{caseId}?
          </p>

          <div className="control-strip" style={{ marginTop: "0.75rem" }}>
            <PixelButton variant="primary" onClick={submit} disabled={submitting}>
              {submitting ? "SUBMITTING..." : "CONFIRM ACCUSATION"}
            </PixelButton>
            <PixelButton variant="ghost" onClick={reset} disabled={submitting}>
              Cancel
            </PixelButton>
          </div>
        </>
      )}

      {status ? (
        <p
          className={`notice notice--${status.kind}`}
          role={status.kind === "error" ? "alert" : "status"}
        >
          {status.message}
        </p>
      ) : null}
    </>
  );
}
