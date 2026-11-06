import React from 'react';

const DifficultyBadge = ({ difficulty }) => {
  const diff = (difficulty || 'medium').toLowerCase();

  const config = {
    easy: {
      label: 'Easy',
      badgeClass: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 shadow-emerald-500/5',
      dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    },
    medium: {
      label: 'Medium',
      badgeClass: 'bg-amber-50/90 text-amber-700 border-amber-200/80 shadow-amber-500/5',
      dotClass: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
    },
    hard: {
      label: 'Hard',
      badgeClass: 'bg-rose-50/90 text-rose-700 border-rose-200/80 shadow-rose-500/5',
      dotClass: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
    },
  };

  const current = config[diff] || config.medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-xs transition-all ${current.badgeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dotClass}`} />
      <span>{current.label}</span>
    </span>
  );
};

export default DifficultyBadge;
