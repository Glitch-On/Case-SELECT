/**
 * Layered panel — the main building block for grouping content.
 *
 * @param {object} props
 * @param {"default"|"elevated"|"inset"|"flush"} [props.variant]
 * @param {string} [props.title] Optional panel header bar.
 */
export function PixelPanel({
  variant = "default",
  title,
  headerAction,
  className = "",
  children,
  ...rest
}) {
  const variantClass = variant !== "default" ? ` pixel-panel--${variant}` : "";
  const flush = variant === "flush";

  return (
    <section className={`pixel-panel${variantClass} ${className}`.trim()} {...rest}>
      {title ? (
        <header className="pixel-panel__header">
          <span>{title}</span>
          {headerAction}
        </header>
      ) : null}

      <div className={flush ? "" : "pixel-panel__body"}>{children}</div>
    </section>
  );
}
