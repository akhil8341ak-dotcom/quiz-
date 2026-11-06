import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseClasses =
    'relative inline-flex items-center justify-center font-bold tracking-wide transition-all select-none focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] tap-target';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 rounded-xl gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-2xl gap-2',
    lg: 'text-base px-6 py-3 rounded-2xl gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-brand-500 to-brand-electric text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:brightness-105 active:shadow-md border border-white/20',
    secondary:
      'bg-white dark:bg-dark-card text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-dark-border shadow-sm hover:bg-slate-50 dark:hover:bg-dark-cardHover hover:border-brand-300 dark:hover:border-brand-500/50',
    pink:
      'bg-gradient-to-r from-brand-pink to-rose-500 text-white shadow-lg shadow-brand-pink/25 hover:shadow-brand-pink/40 hover:brightness-105 border border-white/20',
    mint:
      'bg-gradient-to-r from-brand-mint to-emerald-400 text-emerald-950 shadow-lg shadow-brand-mint/25 hover:shadow-brand-mint/40 hover:brightness-105 border border-white/30 font-extrabold',
    yellow:
      'bg-gradient-to-r from-brand-yellow to-amber-400 text-amber-950 shadow-lg shadow-brand-yellow/25 hover:shadow-brand-yellow/40 hover:brightness-105 border border-white/30 font-extrabold',
    danger:
      'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:brightness-105 border border-white/20',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-surface hover:text-brand-600 dark:hover:text-brand-300',
    outline:
      'bg-transparent text-brand-600 dark:text-brand-300 border-2 border-brand-500/40 hover:bg-brand-50 dark:hover:bg-brand-500/10',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${
        variantClasses[variant] || variantClasses.primary
      } ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {icon && <span className="inline-flex shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
