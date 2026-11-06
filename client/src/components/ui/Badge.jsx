import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = true,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs px-3 py-1 gap-2 font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  };

  const variantStyles = {
    // Difficulties
    easy: {
      wrap: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-brand-mint shadow-[0_0_8px_rgba(20,217,176,0.8)]',
    },
    medium: {
      wrap: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-brand-yellow shadow-[0_0_8px_rgba(255,200,61,0.8)]',
    },
    hard: {
      wrap: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      dot: 'bg-brand-pink shadow-[0_0_8px_rgba(255,77,141,0.8)]',
    },

    // Statuses
    approved: {
      wrap: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    },
    pending: {
      wrap: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
      dot: 'bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    },
    rejected: {
      wrap: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
      dot: 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    },

    // Roles
    student: {
      wrap: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60',
      dot: 'bg-brand-electric shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    },
    moderator: {
      wrap: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/60',
      dot: 'bg-brand-500 shadow-[0_0_8px_rgba(108,71,255,0.8)]',
    },

    // General
    default: {
      wrap: 'bg-slate-100 dark:bg-dark-card text-slate-700 dark:text-slate-300 border-slate-200 dark:border-dark-border',
      dot: 'bg-slate-400',
    },
    brand: {
      wrap: 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-500/40',
      dot: 'bg-brand-500 shadow-[0_0_8px_rgba(108,71,255,0.8)]',
    },
  };

  const normalized = (variant || 'default').toLowerCase();
  const current = variantStyles[normalized] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all select-none ${
        sizeClasses[size] || sizeClasses.md
      } ${current.wrap} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${current.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
