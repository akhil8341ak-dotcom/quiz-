import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl', ...props }) => {
  return (
    <div
      className={`skeleton-box ${rounded} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="bg-white/80 dark:bg-dark-surface/85 backdrop-blur-xl border border-slate-200/80 dark:border-dark-border/80 rounded-3xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-28 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <Skeleton className="h-5 w-3/4 mb-3" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-6" />
    <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-dark-border">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-9 w-24 rounded-xl" />
    </div>
  </div>
);

export const StatSkeleton = () => (
  <div className="bg-white/80 dark:bg-dark-surface/85 backdrop-blur-xl border border-slate-200/80 dark:border-dark-border/80 rounded-3xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-10 rounded-2xl" />
    </div>
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-3 w-32" />
  </div>
);

export default Skeleton;

