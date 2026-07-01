import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, errorText, options, placeholder, id, className = "", ...rest },
    ref
  ) => {
    const selectId = id ?? rest.name;
    const hasError = Boolean(errorText);

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-neutral-900">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`rounded-sm border bg-surface px-3 py-2 text-base text-neutral-900 outline-none transition-colors ${
            hasError
              ? "border-error focus:border-error"
              : "border-neutral-200 focus:border-primary"
          } ${className}`}
          aria-invalid={hasError}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hasError ? (
          <span className="text-xs text-error">{errorText}</span>
        ) : helperText ? (
          <span className="text-xs text-neutral-700">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";