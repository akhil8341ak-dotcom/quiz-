import React from 'react';
import Badge from './ui/Badge';

const DifficultyBadge = ({ difficulty, size = 'sm' }) => {
  const diff = (difficulty || 'medium').toLowerCase();
  const label = diff.charAt(0).toUpperCase() + diff.slice(1);

  return (
    <Badge variant={diff} size={size}>
      {label}
    </Badge>
  );
};

export default DifficultyBadge;
