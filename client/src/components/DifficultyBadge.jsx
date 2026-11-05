import React from 'react';

const DifficultyBadge = ({ difficulty }) => {
  const diff = (difficulty || 'medium').toLowerCase();

  const styles = {
    easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    hard: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
  };

  const labels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ring-1 capitalize ${
        styles[diff] || styles.medium
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          diff === 'easy'
            ? 'bg-emerald-500'
            : diff === 'hard'
            ? 'bg-rose-500'
            : 'bg-amber-500'
        }`}
      />
      {labels[diff] || diff}
    </span>
  );
};

export default DifficultyBadge;
