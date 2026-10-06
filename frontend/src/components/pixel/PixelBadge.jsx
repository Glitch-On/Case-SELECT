/**
 * Small status/label chip. Tones map onto the status colours in tokens.css.
 */
export function PixelBadge({ tone = "default", icon, className = "", children }) {
  const toneClass = tone !== "default" ? ` pixel-badge--${tone}` : "";

  return (
    <span className={`pixel-badge${toneClass} ${className}`.trim()}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}
