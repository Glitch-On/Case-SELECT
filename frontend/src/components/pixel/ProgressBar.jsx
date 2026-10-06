/**
 * Chunky progress bar.
 *
 * @param {object} props
 * @param {number} props.value
 * @param {number} props.max
 * @param {"default"|"success"|"warning"|"danger"|"info"} [props.tone]
 * @param {boolean} [props.showLabel]
 */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = "default",
  showLabel = false,
  label,
  className = "",
}) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(Math.max(value, 0), safeMax);
  const percent = Math.round((clamped / safeMax) * 100);

  return (
    <div className={`pixel-progress ${className}`.trim()}>
      <div
        className="pixel-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label || "Progress"}
      >
        <div
          className={`pixel-progress__fill${tone !== "default" ? ` pixel-progress__fill--${tone}` : ""}`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabel ? (
        <span className="pixel-progress__label">{label || `${clamped} / ${safeMax}`}</span>
      ) : null}
    </div>
  );
}
