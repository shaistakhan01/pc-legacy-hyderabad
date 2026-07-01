import { ReactNode } from "react";

type BadgeStatus = "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  status?: BadgeStatus;
  children: ReactNode;
}

const statusClasses: Record<BadgeStatus, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  error:   "bg-error/10 text-error",
  info:    "bg-info/10 text-info",
  neutral: "bg-neutral-200 text-neutral-700",
};

export function Badge({ status = "neutral", children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-3 py-1 text-xs font-medium ${statusClasses[status]}`}
    >
      {children}
    </span>
  );
}