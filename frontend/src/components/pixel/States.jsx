/**
 * Loading / error / empty states.
 *
 * Every backend-connected region of the UI renders one of these while it is
 * loading, when the request failed, or when there is simply nothing to show.
 * All three share the pixel-art visual language.
 */

export function LoadingState({ message = "LOADING INVESTIGATION...", className = "" }) {
  return (
    <div className={`state ${className}`.trim()} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="state__message">{message}</p>
    </div>
  );
}

export function ErrorState({
  title = "CONNECTION LOST",
  message,
  actionLabel = "RETRY",
  onRetry,
  className = "",
}) {
  return (
    <div className={`state state--error ${className}`.trim()} role="alert">
      <span className="state__glyph" aria-hidden="true">
        ⚠
      </span>
      <p className="state__title">{title}</p>
      {message ? <p className="state__message">{message}</p> : null}

      {onRetry ? (
        <button type="button" className="pixel-btn pixel-btn--primary" onClick={onRetry}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title = "NO CASE FILES AVAILABLE",
  message,
  icon = "🗂",
  action,
  className = "",
}) {
  return (
    <div className={`state state--empty ${className}`.trim()}>
      <span className="state__glyph" aria-hidden="true">
        {icon}
      </span>
      <p className="state__title">{title}</p>
      {message ? <p className="state__message">{message}</p> : null}
      {action}
    </div>
  );
}
