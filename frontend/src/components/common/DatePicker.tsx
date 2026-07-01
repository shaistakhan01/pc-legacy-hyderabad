import { InputHTMLAttributes, forwardRef } from "react";

interface DatePickerProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

// DatePicker shell — design doc §4.1/§4.2.
// This is intentionally a thin wrapper around the native HTML date input.
// The rich Availability Calendar (month view, density coloring, disabled
// dates) is module-specific and will be built in Phase 4 (Room Booking).
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, helperText, errorText, id, className = "", ...rest }, ref) => {
    const inputId = id ?? rest.name;
    const hasError = Boolean(errorText);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="date"
          id={inputId}
          className={`rounded-sm border px-3 py-2 text-base text-neutral-900 outline-none transition-colors ${
            hasError
              ? "border-error focus:border-error"
              : "border-neutral-200 focus:border-primary"
          } ${className}`}
          aria-invalid={hasError}
          {...rest}
        />
        {hasError ? (
          <span className="text-xs text-error">{errorText}</span>
        ) : helperText ? (
          <span className="text-xs text-neutral-700">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";