import { PixelBadge } from "./PixelBadge.jsx";
import { ProgressBar } from "./ProgressBar.jsx";
import {
  DIFFICULTY_ICON,
  DIFFICULTY_TONE,
  STATUS_ICON,
  STATUS_TONE,
  resolveCaseStatus,
} from "../../data/caseMeta.js";

/**
 * A single case file in the dashboard grid.
 *
 * Renders as a button so it is keyboard-accessible. Locked cases are disabled.
 * Progress is shown as completed steps out of the case's total step count.
 */
export function CaseCard({ caseData, progress, meta, onOpen }) {
  const status = resolveCaseStatus(caseData.id, progress, meta);
  const locked = status === "LOCKED";
  const tone = STATUS_TONE[status];
  const icon = STATUS_ICON[status];

  const totalSteps = caseData.stepCount ?? 0;
  const currentStep = progress?.sequenceId ?? null;

  // Completed cases show a full bar; otherwise fall back to 0 so the UI never
  // guesses at progress the backend has not reported.
  const done = status === "COMPLETED" ? totalSteps : Math.min(currentStep ?? 0, totalSteps);

  const label = locked
    ? "LOCKED"
    : status === "COMPLETED"
      ? "REVIEW"
      : status === "IN PROGRESS"
        ? "CONTINUE"
        : "START";

  return (
    <button
      type="button"
      className={`case-card${locked ? " case-card--locked" : ""}`}
      onClick={locked ? undefined : () => onOpen(caseData.id)}
      disabled={locked}
      aria-label={`Case ${caseData.id}: ${caseData.caseName} — ${status}`}
    >
      <div className="case-card__head">
        <div>
          <span className="case-card__id">#{caseData.id}</span>
          <h3 className="case-card__name">{caseData.caseName}</h3>
        </div>

        <PixelBadge tone={tone} icon={icon}>
          {status}
        </PixelBadge>
      </div>

      <p className="case-card__desc">{meta?.description}</p>

      {totalSteps > 0 ? (
        <ProgressBar
          value={done}
          max={totalSteps}
          tone={tone === "default" ? "default" : tone}
          showLabel
          label={`${done} / ${totalSteps} steps`}
        />
      ) : null}

      <div className="case-card__foot">
        <span className="case-card__difficulty">
          <span aria-hidden="true">{DIFFICULTY_ICON[meta?.difficulty] || "◆"}</span>
          {meta?.difficulty || "unknown"}
        </span>

        <PixelBadge tone={DIFFICULTY_TONE[meta?.difficulty] || "default"}>
          {locked ? "🔒 SEALED" : `► ${label}`}
        </PixelBadge>
      </div>
    </button>
  );
}
