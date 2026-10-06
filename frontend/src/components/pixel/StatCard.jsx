/**
 * Single headline metric for the dashboard statistics row.
 */
export function StatCard({ label, value, icon, tone = "default", trend, className = "" }) {
  const toneClass = tone !== "default" ? ` pixel-stat--${tone}` : "";

  return (
    <div className={`pixel-stat${toneClass} ${className}`.trim()}>
      <span className="pixel-stat__label">{label}</span>

      <div className="pixel-stat__row">
        {icon ? (
          <span className="pixel-stat__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}

        <span className="pixel-stat__value">{value}</span>

        {typeof trend === "number" && trend !== 0 ? (
          <span
            className={
              trend > 0 ? "pixel-stat__trend pixel-stat__trend--up" : "pixel-stat__trend pixel-stat__trend--down"
            }
          >
            {trend > 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        ) : null}
      </div>
    </div>
  );
}
