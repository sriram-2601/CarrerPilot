import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export function ErrorBanner({ message, onDismiss, className = '' }) {
  if (!message) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl bg-coral-subtle border border-coral/30 text-coral-dark ${className}`}>
      <AlertCircle className="w-5 h-5 shrink-0 text-coral mt-0.5" />
      <div className="flex-1 text-sm font-medium">
        {message}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-coral hover:text-coral-dark p-1 rounded-lg hover:bg-coral/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
