/**
 * Generic card wrapper used by the case grid and stat row.
 */
export function PixelCard({
  as: Tag = "div",
  variant,
  interactive = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "pixel-card",
    variant ? `pixel-card--${variant}` : "",
    interactive ? "pixel-card--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
