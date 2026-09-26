import React from 'react';

export function StatusPill({ status = 'SAVED', size = 'md' }) {
  const configs = {
    SAVED: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
      label: 'Saved'
    },
    PREPARING: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-500',
      label: 'Preparing'
    },
    APPLIED: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Applied'
    },
    INTERVIEW: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Interview'
    },
    OFFER: {
      bg: 'bg-green-100 text-green-900 border-green-300 font-semibold',
      dot: 'bg-green-600',
      label: 'Offer'
    },
    REJECTED: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-500',
      label: 'Rejected'
    }
  };

  const current = configs[status] || configs.SAVED;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium transition-colors ${current.bg} ${
        isSm ? 'text-[11px] leading-tight py-0.5' : 'text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
