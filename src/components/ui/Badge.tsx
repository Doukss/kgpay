import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border';
  const variantClasses = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    neutral: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
