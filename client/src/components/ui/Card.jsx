import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  padding = 'md',
  ...props
}) => {
  const paddingMap = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Component = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Component
      className={`relative rounded-3xl transition-shadow ${
        glass
          ? 'bg-white/80 dark:bg-dark-surface/85 backdrop-blur-xl border border-slate-200/80 dark:border-dark-border/80 shadow-card-soft dark:shadow-card-dark'
          : 'bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm'
      } ${hover ? 'hover:shadow-glow-primary/20 hover:border-brand-400/50 dark:hover:border-brand-500/50' : ''} ${
        paddingMap[padding] || paddingMap.md
      } ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 flex flex-col space-y-1.5 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '', as = 'h3' }) => {
  const Component = as;
  return (
    <Component
      className={`font-heading text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white ${className}`}
    >
      {children}
    </Component>
  );
};

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 dark:text-dark-textMuted ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;

