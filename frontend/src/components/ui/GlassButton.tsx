/**
 * File: frontend/src/components/ui/GlassButton.tsx
 * Author: GitHub Copilot
 * Date: 2025-07-07
 * Purpose: Glass-styled button component with glassmorphism effects
 * 
 * This component provides glassmorphism-styled buttons with:
 * - Consistent glass effects and transparency
 * - Multiple size and style variants
 * - Interactive hover and focus states
 * - Accessibility features and keyboard support
 * 
 * Features:
 * - Backdrop blur with transparency
 * - Hover animations and state transitions
 * - Icon support and loading states
 * - Fully accessible with proper ARIA attributes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassButtonProps {
  /**
   * Button content
   */
  readonly children: React.ReactNode;
  
  /**
   * Button click handler
   */
  readonly onClick?: () => void;
  
  /**
   * Button type for forms
   */
  readonly type?: 'button' | 'submit' | 'reset';
  
  /**
   * Button size variant
   */
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Button style variant
   */
  readonly variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  
  /**
   * Disabled state
   */
  readonly disabled?: boolean;
  
  /**
   * Loading state
   */
  readonly loading?: boolean;
  
  /**
   * Full width button
   */
  readonly fullWidth?: boolean;
  
  /**
   * Optional icon before text
   */
  readonly icon?: React.ReactNode;
  
  /**
   * Additional CSS classes
   */
  readonly className?: string;
  
  /**
   * ARIA label for accessibility
   */
  readonly ariaLabel?: string;
}

/**
 * GlassButton Component
 * 
 * Glassmorphism-styled button component providing consistent styling
 * across the application with multiple variants and interactive states.
 * Includes proper accessibility features and keyboard navigation support.
 * 
 * @param children - Button content
 * @param onClick - Click handler
 * @param type - Button type
 * @param size - Size variant
 * @param variant - Style variant
 * @param disabled - Disabled state
 * @param loading - Loading state
 * @param fullWidth - Full width styling
 * @param icon - Optional icon
 * @param className - Additional CSS classes
 * @param ariaLabel - Accessibility label
 * @returns {JSX.Element} The glassmorphism button component
 */
export function GlassButton({ 
  children,
  onClick,
  type = 'button',
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  className,
  ariaLabel
}: GlassButtonProps) {
  // Size variant classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Style variant classes
  const variantClasses = {
    primary: 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-500/50',
    secondary: 'bg-gray-500/20 border-gray-500/30 text-gray-400 hover:bg-gray-500/30 hover:border-gray-500/50',
    outline: 'bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50',
    ghost: 'bg-transparent border-transparent text-gray-400 hover:bg-white/10 hover:text-white',
    danger: 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      className={cn(
        // Base button styles
        'inline-flex items-center justify-center gap-2',
        'font-medium rounded-lg border',
        'backdrop-blur-xl transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
        'active:scale-95',
        // Size variant
        sizeClasses[size],
        // Style variant
        variantClasses[variant],
        // Full width
        fullWidth && 'w-full',
        // Disabled state
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        // Custom classes
        className
      )}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
      )}
      
      {/* Icon */}
      {icon && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      {/* Button Content */}
      <span className={cn(
        loading && 'opacity-50'
      )}>
        {children}
      </span>
    </button>
  );
}
