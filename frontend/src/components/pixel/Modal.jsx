import { useEffect } from "react";

/**
 * Pixel-art modal shell.
 *
 * Closes on Escape and on backdrop click. The in-game SQL terminal is built on
 * top of this (see Terminal.jsx) — it deliberately does not reimplement any SQL
 * functionality.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  wide = false,
  flushBody = false,
  headerAction,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    document.addEventListener("keydown", onKeyDown);

    // Prevent the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal__overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal__frame${wide ? " modal__frame--wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="modal__head">
          <span>{title}</span>

          <div className="modal__head-actions">
            {headerAction}
            <button
              type="button"
              className="pixel-btn pixel-btn--sm"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        <div className={`modal__body${flushBody ? " modal__body--flush" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
