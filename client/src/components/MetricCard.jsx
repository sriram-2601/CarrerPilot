import React from 'react';

export function MetricCard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  color = 'moss'
}) {
  const colorMap = {
    moss: 'bg-moss/10 text-moss border-moss/20',
    gold: 'bg-gold/10 text-gold-dark border-gold/20',
    coral: 'bg-coral/10 text-coral border-coral/20',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    ink: 'bg-ink-100 text-ink-800 border-ink-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-soft hover:shadow-elevated transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${colorMap[color] || colorMap.moss}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-ink-900">{value}</span>
        {trend && (
          <span className="text-xs font-semibold text-moss flex items-center">
            {trend}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-xs text-ink-500">{subtext}</p>
      )}
    </div>
  );
}
