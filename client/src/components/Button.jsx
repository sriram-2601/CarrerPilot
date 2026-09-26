import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary: 'bg-moss hover:bg-moss-dark text-white shadow-soft focus:ring-moss/40 hover:shadow-md',
    secondary: 'bg-white hover:bg-slate-50 text-ink-800 border border-slate-200 shadow-sm focus:ring-slate-300',
    outline: 'border border-moss text-moss hover:bg-moss/5 focus:ring-moss/30',
    danger: 'bg-coral hover:bg-coral-dark text-white focus:ring-coral/40',
    ghost: 'text-ink-600 hover:text-ink-900 hover:bg-slate-100/70 focus:ring-slate-300',
    gold: 'bg-gold hover:bg-gold-dark text-white shadow-sm focus:ring-gold/40'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
