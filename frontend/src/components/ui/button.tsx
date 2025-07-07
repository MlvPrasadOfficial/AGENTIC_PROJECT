/**
 * File: frontend/src/components/ui/button.tsx
 * Created: 2024-12-19 09:32:00
 * Description: Reusable button component with glassmorphic variants and accessibility
 * Status: Active component - provides styled buttons for the application
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  default: 'bg-blue-600/80 hover:bg-blue-600/90 text-white border-blue-500/30',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
  outline: 'border-white/30 hover:bg-white/10 text-white',
  ghost: 'hover:bg-white/10 text-white',
  destructive: 'bg-red-600/80 hover:bg-red-600/90 text-white border-red-500/30'
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-12 px-8',
  icon: 'h-10 w-10'
};

/**
 * Button component with glassmorphic styling and variants
 * Supports different sizes, states, and accessibility features
 */
export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg',
        'text-sm font-medium ring-offset-background transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        // Glassmorphic effect
        'backdrop-blur-sm border',
        'shadow-lg hover:shadow-xl',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        // Loading state
        isLoading && 'cursor-not-allowed opacity-70',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
