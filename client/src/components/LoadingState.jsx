import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Loading pipeline data...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center text-ink-500 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-moss/10 flex items-center justify-center mb-3">
        <Loader2 className="w-6 h-6 animate-spin text-moss" />
      </div>
      <p className="text-sm font-medium text-ink-700">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-soft animate-pulse space-y-3">
      <div className="h-4 bg-slate-200 rounded w-1/3" />
      <div className="h-6 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-full" />
      <div className="flex gap-2 pt-2">
        <div className="h-5 bg-slate-200 rounded-full w-16" />
        <div className="h-5 bg-slate-200 rounded-full w-16" />
      </div>
    </div>
  );
}
