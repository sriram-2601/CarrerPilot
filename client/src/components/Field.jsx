import React from 'react';

export function Field({
  label,
  error,
  helper,
  required,
  className = '',
  children,
  id
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-ink-700 tracking-wide uppercase">
          {label} {required && <span className="text-coral">*</span>}
        </label>
      )}
      {children}
      {helper && !error && (
        <p className="text-xs text-ink-500">{helper}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-coral flex items-center gap-1">
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
