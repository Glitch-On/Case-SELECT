/**
 * Pixel-art button.
 *
 * @param {object} props
 * @param {"default"|"primary"|"ghost"|"danger"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 */
export function PixelButton({
  variant = "default",
  size = "md",
  block = false,
  active = false,
  className = "",
  type = "button",
  children,
  ...rest
}) {
  const classes = [
    "pixel-btn",
    variant !== "default" ? `pixel-btn--${variant}` : "",
    size !== "md" ? `pixel-btn--${size}` : "",
    block ? "pixel-btn--block" : "",
    active ? "pixel-btn--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
