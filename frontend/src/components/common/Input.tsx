import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
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

Input.displayName = "Input";