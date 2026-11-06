import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({
  value = 0,
  max = 100,
  color = 'primary',
  showLabel = false,
  label = '',
  height = 'h-3',
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const gradientMap = {
    primary: 'from-brand-500 to-brand-electric',
    pink: 'from-brand-pink to-rose-500',
    mint: 'from-brand-mint to-emerald-400',
    yellow: 'from-brand-yellow to-amber-500',
  };

  const selectedGradient = gradientMap[color] || gradientMap.primary;

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-xs font-semibold mb-1.5 text-slate-600 dark:text-dark-textMuted">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-dark-card rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-dark-border/50 ${height}`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${selectedGradient} shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;

