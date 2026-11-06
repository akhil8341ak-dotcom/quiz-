import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';

export const EmptyState = ({
  icon,
  title = 'No items found',
  description = 'Try adjusting your filters or search criteria, or add something new.',
  actionLabel,
  onAction,
  actionIcon,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-white/60 dark:bg-dark-surface/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 dark:border-dark-border/80 ${className}`}
    >
      <div className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-3xl bg-gradient-to-tr from-brand-50 to-indigo-100 dark:from-brand-500/10 dark:to-indigo-500/20 text-brand-500 flex items-center justify-center text-3xl shadow-inner border border-brand-200/50 dark:border-brand-500/20">
        {icon || '🎯'}
      </div>
      <h3 className="font-heading text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-dark-textMuted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="primary">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;

