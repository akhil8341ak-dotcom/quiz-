import React from 'react';

export const Avatar = ({
  name = 'User',
  role,
  size = 'md',
  className = '',
}) => {
  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-extrabold',
    xl: 'w-20 h-20 text-2xl font-black',
  };

  // Generate consistent gradient index based on name
  const gradients = [
    'from-brand-500 to-brand-electric',
    'from-brand-pink to-purple-600',
    'from-indigo-500 to-teal-400',
    'from-amber-500 to-rose-500',
    'from-brand-mint to-blue-500',
  ];
  const charSum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedGradient = gradients[charSum % gradients.length];

  return (
    <div className="relative inline-block select-none">
      <div
        className={`rounded-2xl bg-gradient-to-tr ${selectedGradient} text-white font-bold flex items-center justify-center shadow-md border-2 border-white dark:border-dark-surface ${
          sizeClasses[size] || sizeClasses.md
        } ${className}`}
      >
        {getInitials(name)}
      </div>

      {role && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white dark:border-dark-surface ${
            size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
          } ${
            role === 'moderator'
              ? 'bg-brand-pink shadow-[0_0_8px_rgba(255,77,141,0.8)]'
              : 'bg-brand-mint shadow-[0_0_8px_rgba(20,217,176,0.8)]'
          }`}
          title={role}
        />
      )}
    </div>
  );
};

export default Avatar;
