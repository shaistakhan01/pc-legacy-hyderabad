import { useEffect } from "react";

type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  autoDismissMs?: number;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-success text-white",
  error:   "bg-error text-white",
  info:    "bg-info text-white",
};

// Toast visual unit — design doc §4.1. A ToastContext provider for
// app-wide queuing will be added when the first real form submission
// needs it (Phase 3+). This is the visual component itself.
export function Toast({
  message,
  variant = "info",
  onDismiss,
  autoDismissMs = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoDismissMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-between gap-4 rounded-sm px-4 py-3 shadow-elevation-2 ${variantClasses[variant]}`}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-white/80 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}