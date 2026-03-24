import React from 'react';
import { cn } from '../../lib/utils';

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  size = 'md',
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: any;
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};
